import { Hono } from "hono";
import { verifyClerkToken } from "./middleware/auth";
import { cors } from "hono/cors";

type Bindings = {
  DB: D1Database;
  ANALYTICS: DurableObjectNamespace;
  CLERK_SECRET_KEY: string;
};

type LinkRow = {
  id: string;
  user_id: string;
  short_code: string;
  original_url: string;
  expires_at: number | null;
  created_at: number;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(
  "*",
  cors({
    origin: "http://localhost:3000",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
  }),
);

function generateShortCode(length = 6): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let result = "";
  const randomValues = crypto.getRandomValues(new Uint8Array(length));

  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }

  return result;
}

function detectDevice(userAgent: string): string {
  const ua = userAgent.toLowerCase();

  if (ua.includes("mobile")) return "mobile";
  if (ua.includes("tablet")) return "tablet";
  if (ua.includes("bot")) return "bot";

  return "desktop";
}

app.post("/links", async (c) => {
  const payload = await verifyClerkToken(c.req.raw, c.env.CLERK_SECRET_KEY);

  const userId = payload.sub;

  const body = await c.req.json();
  const { originalUrl, expiresInDays } = body;

  if (!originalUrl) {
    return c.json({ error: "Missing URL" }, 400);
  }

  const shortCode = generateShortCode();

  const now = Date.now();
  const expiresAt = expiresInDays
    ? now + expiresInDays * 24 * 60 * 60 * 1000
    : null;

  await c.env.DB.prepare(
    `INSERT INTO links (id, user_id, short_code, original_url, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  )
    .bind(crypto.randomUUID(), userId, shortCode, originalUrl, expiresAt, now)
    .run();

  return c.json({
    shortCode,
    shortUrl: `http://localhost:8787/${shortCode}`,
  });
});

app.get("/:shortCode", async (c) => {
  const { shortCode } = c.req.param();

  const link = await c.env.DB.prepare(
    `SELECT * FROM links WHERE short_code = ?`,
  )
    .bind(shortCode)
    .first<LinkRow>();

  if (!link) {
    return c.json({ error: "Link not found" }, 404);
  }

  if (link.expires_at && Date.now() > link.expires_at) {
    return c.json({ error: "Link expired" }, 410);
  }

  const country = (c.req.raw as any).cf?.country || "unknown";
  const userAgent = c.req.header("user-agent") || "unknown";
  const device = detectDevice(userAgent);

  const id = c.env.ANALYTICS.idFromName(shortCode);
  const stub = c.env.ANALYTICS.get(id);

  await stub.fetch("http://analytics", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      linkId: link.id,
      country,
      device,
    }),
  });

  return c.redirect(link.original_url, 302);
});

export default app;
export { AnalyticsDO } from "./analytics";
