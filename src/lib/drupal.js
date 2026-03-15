const BASE_URL = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL || 'https://dev-abinandan.pantheonsite.io';
const API_BASE = `${BASE_URL}/jsonapi`;

export async function getHomePage() {
  const res = await fetch(
    `${API_BASE}/node/page?filter[title]=Home&include=field_components,field_components.field_projects,field_components.field_projects.field_project_images`,
    { next: { revalidate: 0 } }
  );
  if (!res.ok) throw new Error('Failed to fetch home page');
  const data = await res.json();

  // Since filter[title]=Home returns an array, take the first item
  const page = data.data[0];

  return {
    page: page,
    components: data.included || [],
    included: data.included || []
  };
}

/**
 * Parse the home page sections based on paragraph types.
 */
export function getSections(components) {
  return {
    hero: components.find(c => c.type === 'paragraph--hero'),
    about: components.find(c =>
      c.type === 'paragraph--text_block' &&
      c.attributes.field_title === 'About Me'
    ),
    skills: components.find(c => c.type === 'paragraph--skills_section'),
    projects: components.find(c => c.type === 'paragraph--projects_section'),
    experience: components.find(c =>
      c.type === 'paragraph--text_block' &&
      c.attributes.field_title === 'Work Experience'
    ),
    contact: components.find(c =>
      c.type === 'paragraph--text_block' &&
      c.attributes.field_title === 'Connect With Me'
    ),
  };
}

/**
 * Parse the work experience HTML body into structured entries.
 * The user wants parsing of job sections: jobTitle, company, duration, responsibilities.
 */
export function parseExperience(htmlBody) {
  if (!htmlBody) return [];

  // Remove <p> and </p> tags but keep their boundaries
  const text = htmlBody.replace(/<\/p><p>/g, '\n\n').replace(/<\/?p>/g, '');

  // Split by double newlines or similar to get job blocks
  const blocks = text.split('\n\n').filter(Boolean);

  return blocks.map(block => {
    const lines = block.split(/<br\s*\/?>|\n/).map(l => {
      // Strip other HTML tags like <strong>
      return l.replace(/<[^>]*>/g, '').trim();
    }).filter(Boolean);

    if (lines.length < 2) return null;

    const jobTitle = lines[0];
    const companyLine = lines[1];

    // Parse company and duration: "WPP Production (Mar 2022 - Present)"
    const match = companyLine.match(/^(.+?)\s*\((.+?)\)$/);
    const company = match ? match[1] : companyLine;
    const duration = match ? match[2] : '';

    const responsibilities = lines.slice(2).map(l => {
      return l.replace(/^[•\-\*]\s*/, '');
    });

    return { jobTitle, company, duration, responsibilities };
  }).filter(Boolean);
}

/**
 * Parse contact info from HTML body.
 */
export function
  parseContactInfo(htmlBody) {
  if (!htmlBody) return {};

  // Clean up the HTML to just text, but keep some structure
  const cleanText = htmlBody
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .split('\n')
    .map(l => l.trim())
    .join('\n');

  const contacts = {};

  const extract = (label) => {
    const regex = new RegExp(`${label}\\s*[:\\-]?\\s*(.+)`, 'i');
    const lines = cleanText.split('\n');
    for (const line of lines) {
      const match = line.match(regex);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return null;
  };

  contacts.linkedin = extract('LinkedIn');
  contacts.email = extract('Email');
  contacts.phone = extract('Phone') || extract('Mobile') || extract('Contact');
  contacts.github = extract('GitHub');

  return contacts;
}

/**
 * Fetch dynamic footer copyright and credits.
 */
export async function getFooter() {
  try {
    const res = await fetch(
      `${API_BASE}/block_content/basic?filter[info][value]=Footer Copyright and Credits`,
      { next: { revalidate: 0 } }
    );
    if (!res.ok) throw new Error('Failed to fetch footer');
    const data = await res.json();

    // Return the processed HTML from the first matching block
    return data.data?.[0]?.attributes?.body?.processed || null;
  } catch (error) {
    console.error('Footer fetch error:', error);
    return null;
  }
}

/**
 * Project images mapping helper.
 */
export function getProjectData(projectData, included) {
  if (!projectData) return null;

  const attrs = projectData.attributes;
  const projectImages = projectData.relationships?.field_project_images?.data || [];

  // Find image URLs in included data
  const images = projectImages.map(imgRef => {
    const fileItem = included.find(item => item.id === imgRef.id && (item.type === 'file--file' || item.type === 'file'));
    if (!fileItem) return null;

    const url = fileItem.attributes.uri.url;
    // Ensure absolute URL
    return url.startsWith('http') ? url : `${BASE_URL}${url}`;
  }).filter(Boolean);

  // Helper to clean Drupal links
  const formatLink = (link) => {
    if (!link || !link.uri) return null;
    return link.uri.replace(/^internal:/, '');
  };

  return {
    id: projectData.id,
    title: attrs.title,
    description: attrs.field_short_description?.processed || attrs.field_short_description || '',
    techStack: attrs.field_tech_stack || '',
    githubUrl: formatLink(attrs.field_github_url),
    liveUrl: formatLink(attrs.field_live_url),
    images: images,
  };
}
