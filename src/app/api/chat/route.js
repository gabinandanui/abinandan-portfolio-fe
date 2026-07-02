
import { resumeData } from "../../data/resume";
import { getAllProjects } from "../../../services/drupalApi";
import { getHomePage, getSections } from "../../../lib/drupal";

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey || apiKey === 'your_groq_api_key_here') {
      const encoder = new TextEncoder();
      const message = "I'm Groq AI, and I'm ready to help! Abinandan just needs to configure the GROQ_API_KEY in his project settings.";
      const stream = new ReadableStream({
        start(controller) {
          const payload = {
            choices: [{ delta: { content: message } }]
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      });
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        }
      });
    }

    // Fetch dynamic CMS data to keep the AI updated with the latest site content
    const [cmsProjects, homeData] = await Promise.all([
      getAllProjects(),
      getHomePage()
    ]);

    const sections = getSections(homeData.components);

    // Format CMS data for the AI's prompt
    const projectSummary = cmsProjects.slice(0, 10).map(p =>
      `- ${p.title}: ${p.description.replace(/<[^>]*>/g, '').slice(0, 500)}... Role: ${p.role}. Tech: ${p.techStack.join(', ')}`
    ).join('\n');

    const aboutContent = sections.about?.attributes?.field_body?.processed?.replace(/<[^>]*>/g, '') || "";
    const heroContent = sections.hero?.attributes?.field_text?.processed?.replace(/<[^>]*>/g, '') || "";
    const skillsContent = sections.skills?.attributes?.field_body?.processed?.replace(/<[^>]*>/g, '') || "";
    const experienceContent = sections.experience?.attributes?.field_body?.processed?.replace(/<[^>]*>/g, '') || "";

    const completionResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `
              You are "Abinandan's Career Agent", a highly accurate and professional assistant.
              Your ONLY source of truth is the provided context (RESUME DATA and LIVE CMS PORTFOLIO CONTENT).
              
              CONTEXT:
              ---
              RESUME DATA (Static):
              ${JSON.stringify(resumeData, null, 2)}

              LIVE CMS PORTFOLIO CONTENT:
              - About Me Section: ${aboutContent}
              - Hero Tagline: ${heroContent}
              - Key Skills (CMS): ${skillsContent}
              - Detailed Experience (CMS): ${experienceContent}
              
              FEATURED PROJECTS (Live from CMS):
              ${projectSummary}
              ---

              STRICT RULES:
              1. NO HALLUCINATIONS: Do NOT invent skills, projects, or background details. If a technology, skill, or project is NOT explicitly mentioned in the context above, do NOT claim Abinandan has experience with it.
              2. NO EXTERNAL KNOWLEDGE: Ignore any prior knowledge about software development, AI, or industry trends that isn't tied to the provided content.
              3. UNCERTAINTY: If a user asks about a skill (like Machine Learning, AI, etc.) that is not in the context, respond: "Based on the available portfolio data, I don't have information regarding Abinandan's experience with [Skill]. He specializes in [List 2-3 main skills from context instead]."
              4. PROFESSIONAL FOCUS: Only answer questions related to Abinandan's professional profile.
              5. FORMATTING: Use double line breaks between paragraphs. Use bulleted lists for clarity.
              6. CONTACT: Only provide Email (gabinandan@gmail.com) and GitHub (github.com/gabinandanui). Never provide a phone number.
              7. TONE: Premium, concise, and 100% factual.
            `
          },
          ...messages.map(m => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.content
          }))
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.1,
        max_tokens: 800,
        stream: true
      })
    });

    if (!completionResponse.ok) {
      const errorText = await completionResponse.text();
      console.error("Groq API Error:", errorText);
      throw new Error(`Groq API returned status ${completionResponse.status}`);
    }

    // Pipe the OpenAI-compatible stream directly to the client
    return new Response(completionResponse.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });

  } catch (error) {
    console.error("Agent Error with CMS:", error);
    return new Response(JSON.stringify({ error: "I'm having a bit of trouble accessing the latest site updates. Please try again!" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
