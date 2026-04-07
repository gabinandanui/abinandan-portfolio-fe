export const runtime = 'edge';

export async function GET() {
  const baseUrl = process.env.OLLAMA_BASE_URL;
  if (!baseUrl) return new Response(JSON.stringify({ status: 'offline' }));

  try {
    const rootUrl = new URL(baseUrl).origin;
    // We send a GET request with a very short 3-second timeout.
    // If Ollama is running and hot, it responds in <100ms.
    // If it is sleeping/booting, this will time out and throw an error.
    const res = await fetch(rootUrl, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      return new Response(JSON.stringify({ status: 'online' }));
    }
  } catch (error) {
    return new Response(JSON.stringify({ status: 'offline' }));
  }
  
  return new Response(JSON.stringify({ status: 'offline' }));
}
