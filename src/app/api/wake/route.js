export const runtime = 'edge';

export async function GET() {
  const baseUrl = process.env.OLLAMA_BASE_URL;
  
  if (!baseUrl) {
    return new Response('Missing URL', { status: 200 });
  }

  try {
    // Extract just the root domain of Hugging Face (e.g., https://username-my-ollama.hf.space)
    const rootUrl = new URL(baseUrl).origin;
    
    // We send a tiny GET request just to knock on the door and wake up the sleeping container.
    // Edge will abort this fetch after 3 seconds so we don't hold up unnecessary resources.
    await fetch(rootUrl, { signal: AbortSignal.timeout(3000) });
  } catch (error) {
    // We perfectly expect this to abort/fail due to the 3-second timeout! 
    // The knock on the door still successfully registered on Hugging Face's network.
  }

  return new Response('Wake signal sent', { status: 200 });
}
