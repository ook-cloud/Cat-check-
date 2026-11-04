export async function GET() {
  return new Response("GET works. Later Haha this sends the list of photos.");
}

export async function POST(request: Request) {
  const body = await request.json();
  console.log(body)
  return new Response(`POST works. You sent the name "${body.name}".`);
}
