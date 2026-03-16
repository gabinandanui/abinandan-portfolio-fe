import Groq from "groq-sdk";
import { resumeData } from "../../data/resume";
import { getAllProjects } from "../../../services/drupalApi";
import { getHomePage, getSections } from "../../../lib/drupal";

export async function POST(req) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      return new Response(JSON.stringify({ 
        content: "I'm Groq AI, and I'm ready to help! Abinandan just needs to add the API Key to his project settings." 
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    // Fetch dynamic CMS data to keep the AI updated with the latest site content
    const [cmsProjects, homeData] = await Promise.all([
      getAllProjects(),
      getHomePage()
    ]);

    const sections = getSections(homeData.components);

    // Format CMS data for the AI's prompt
    const projectSummary = cmsProjects.slice(0, 8).map(p => 
      `- ${p.title}: ${p.description.replace(/<[^>]*>/g, '').slice(0, 150)}... Role: ${p.role}. Tech: ${p.techStack.join(', ')}`
    ).join('\n');

    const aboutContent = sections.about?.attributes?.field_body?.processed?.replace(/<[^>]*>/g, '') || "";
    const heroContent = sections.hero?.attributes?.field_text?.processed?.replace(/<[^>]*>/g, '') || "";

    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `
            You are "Abinandan's Career Agent". 
            Your goal is to assist partners, recruiters, and collaborators in exploring Abinandan's professional journey, technical expertise, and project impact.
            You provide evaluative insights into his fit for high-impact roles by drawing from both the static resume and live CMS content.
            
            RESUME DATA (Static):
            ${JSON.stringify(resumeData, null, 2)}

            LIVE CMS PORTFOLIO CONTENT:
            - About Me Section: ${aboutContent}
            - Hero Tagline: ${heroContent}
            
            FEATURED PROJECTS (Live from CMS):
            ${projectSummary}

            RULES:
            1. STRICTLY PROFESSIONAL: Only answer questions related to Abinandan's career, projects, skills, and resume. Focus on "Value Proposition" and "Impact".
            2. FORMATTING: Use double line breaks between paragraphs. Use bulleted lists (with * or -) for projects or skills. Avoid long, dense blocks of text.
            3. REJECTION OF IRRELEVANT TOPICS: If a question is not related to his professional profile, politely state: "I'm sorry, I'm specialized in Abinandan's professional background and evaluative insights for hiring. I can't provide information on that topic."
            4. PROJECTS: Refer to the "FEATURED PROJECTS" list from the CMS to highlight technical challenges and outcomes. Use clean spacing.
            5. HISTORY: Use "RESUME DATA" for employment timeline and growth.
            6. CONTACT: Only provide Email (gabinandan@gmail.com) and GitHub (github.com/gabinandanui). Never provide a phone number.
            7. TONE: Stay premium, insightful, helpful for decision-making, and concise.
          `
        },
        ...messages.map(m => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content
        }))
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.6,
      max_tokens: 800,
    });

    const text = completion.choices[0]?.message?.content || "I'm processing that...";

    return new Response(JSON.stringify({ content: text }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Agent Error with CMS:", error);
    return new Response(JSON.stringify({ error: "I'm having a bit of trouble accessing the latest site updates. Please try again!" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
