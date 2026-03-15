const BASE_URL = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL || 'https://dev-abinandan.pantheonsite.io';
const API_URL = `${BASE_URL}/jsonapi/node/project`;

export async function getAllProjects() {
    try {
        const url = new URL(API_URL);
        url.searchParams.set('include', 'field_project_images');
        url.searchParams.set('filter[status]', '1');
        // Sort by changed date descending by default
        url.searchParams.set('sort', '-changed');

        const response = await fetch(url.toString(), {
            next: { revalidate: 0 } // Live updates for now
        });

        if (!response.ok) {
            throw new Error('Failed to fetch projects');
        }

        const json = await response.json();
        const included = json.included || [];

        return json.data.map(project => {
            const attrs = project.attributes;
            const rels = project.relationships;

            // Resolve images from multiple possible field names
            const imgData = rels.field_project_images?.data || rels.field_image?.data || [];
            const projectImages = Array.isArray(imgData) ? imgData : [imgData];
            
            const images = projectImages.map(imgRef => {
                if (!imgRef) return null;
                const fileItem = included.find(item => 
                    item.id === imgRef.id && 
                    (item.type === 'file--file' || item.type === 'file')
                );
                if (!fileItem) return null;
                
                let url = fileItem.attributes.uri.url || fileItem.attributes.uri;
                if (typeof url !== 'string' && url.url) url = url.url;
                
                // Ensure the URL is absolute and correctly handles special characters
                if (!url.startsWith('http')) {
                    url = `${BASE_URL}${url}`;
                }
                
                return url;
            }).filter(Boolean);

            // Helper to clean links
            const formatLink = (link) => {
                if (!link) return null;
                const uri = typeof link === 'string' ? link : link.uri;
                if (!uri) return null;
                return uri.replace(/^internal:/, '');
            };

            return {
                id: project.id,
                title: attrs.title,
                description: attrs.field_short_description?.processed || attrs.field_short_description || '',
                techStack: attrs.field_tech_stack ? attrs.field_tech_stack.split(',').map(t => t.trim()) : [],
                githubUrl: formatLink(attrs.field_github_url),
                liveUrl: formatLink(attrs.field_live_url),
                role: attrs.field_role?.processed || attrs.field_role || '',
                images: images,
                changed: attrs.changed,
                created: attrs.created
            };
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        return [];
    }
}
