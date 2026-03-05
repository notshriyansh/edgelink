import { verifyToken } from "@clerk/backend";

export async function verifyClerkToken(request: Request, secretKey: string) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader) {
    throw new Error("Missing Authorization header");
  }

  const token = authHeader.replace("Bearer ", "");

  const payload = await verifyToken(token, {
    secretKey,
  });

  return payload;
}
