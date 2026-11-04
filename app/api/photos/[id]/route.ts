export async function GET() {
  return new Response("GET works.Training.");
}

export async function POST(request: Request) {
  const body = await request.json();
  console.log(body);
  return new Response(`POST works. You sent the name "${body.name}".`);
}

export async function DELETE(request: Request) {
  const body = await request.json();
  console.log(body);
  return new Response(`POST works. You sent the name "${body.name}".`);
}

export async function PATCH(request: Request) {
  const body = await request.json();
  console.log(body);
  return new Response(`POST works. You sent the name "${body.name}".`);
}
