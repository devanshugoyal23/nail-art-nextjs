export async function GET() {
  return new Response('Gone', { status: 410 });
}

export async function HEAD() {
  return new Response(null, { status: 410 });
}


