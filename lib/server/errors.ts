/** A problem the person running the app can fix, so its message is safe to show them. */
export class SetupError extends Error {}

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new SetupError(`${name} is not set. Follow the setup steps in README.md.`);
  }
  return value;
}

export function badRequest(message: string, status = 400): Response {
  return Response.json({ error: message }, { status });
}

export function serverError(error: unknown): Response {
  console.error(error);
  const message =
    error instanceof SetupError
      ? error.message
      : "Something went wrong on the server. Check the terminal for details.";
  return Response.json({ error: message }, { status: 500 });
}
