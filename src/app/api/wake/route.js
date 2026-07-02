export const runtime = 'edge';

export async function GET() {
  return new Response('Wake signal sent', { status: 200 });
}
