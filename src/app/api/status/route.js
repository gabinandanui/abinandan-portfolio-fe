export const runtime = 'edge';

export async function GET() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    return new Response(JSON.stringify({ status: 'offline' }));
  }
  return new Response(JSON.stringify({ status: 'online' }));
}
