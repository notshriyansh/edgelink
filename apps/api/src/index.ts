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
    origin: ["http://localhost:3000", "https://edgelink.vercel.app"],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: false,
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

app.get("/", (c) => {
  return c.json({
    message: "EdgeLink API running",
  });
});

app.post("/links", async (c) => {
  const payload = await verifyClerkToken(c.req.raw, c.env.CLERK_SECRET_KEY);
  const userId = payload.sub;

  const body = await c.req.json();
  const { originalUrl, expiresInDays, customAlias } = body;

  if (!originalUrl) {
    return c.json({ error: "Missing URL" }, 400);
  }

  const shortCode = customAlias || generateShortCode();

  const now = Date.now();
  const expiresAt = expiresInDays
    ? now + expiresInDays * 24 * 60 * 60 * 1000
    : null;

  const existing = await c.env.DB.prepare(
    `SELECT id FROM links WHERE short_code = ?`,
  )
    .bind(shortCode)
    .first();

  if (existing) {
    return c.json({ error: "Alias already exists" }, 400);
  }

  await c.env.DB.prepare(
    `
    INSERT INTO links (id, user_id, short_code, original_url, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `,
  )
    .bind(crypto.randomUUID(), userId, shortCode, originalUrl, expiresAt, now)
    .run();

  const baseUrl = new URL(c.req.url).origin;

  return c.json({
    shortCode,
    shortUrl: `${baseUrl}/${shortCode}`,
  });
});

app.get("/links", async (c) => {
  const payload = await verifyClerkToken(c.req.raw, c.env.CLERK_SECRET_KEY);
  const userId = payload.sub;

  const result = await c.env.DB.prepare(
    `
    SELECT 
      links.id,
      links.short_code,
      links.original_url,
      COUNT(clicks.id) as clicks
    FROM links
    LEFT JOIN clicks 
      ON links.id = clicks.link_id
    WHERE links.user_id = ?
    GROUP BY links.id
    ORDER BY links.created_at DESC
  `,
  )
    .bind(userId)
    .all();

  return c.json({
    links: result.results,
  });
});

app.get("/analytics/:linkId", async (c) => {
  const payload = await verifyClerkToken(c.req.raw, c.env.CLERK_SECRET_KEY);
  const userId = payload.sub;

  const linkId = c.req.param("linkId");

  const result = await c.env.DB.prepare(
    `
    SELECT country, device, created_at
    FROM clicks
    WHERE link_id = ?
  `,
  )
    .bind(linkId)
    .all();

  return c.json({
    clicks: result.results,
  });
});

app.get("/stats", async (c) => {
  const payload = await verifyClerkToken(c.req.raw, c.env.CLERK_SECRET_KEY);
  const userId = payload.sub;

  const totalLinks = await c.env.DB.prepare(
    `SELECT COUNT(*) as count FROM links WHERE user_id = ?`,
  )
    .bind(userId)
    .first();

  const totalClicks = await c.env.DB.prepare(
    `
    SELECT COUNT(clicks.id) as count
    FROM clicks
    JOIN links ON clicks.link_id = links.id
    WHERE links.user_id = ?
    `,
  )
    .bind(userId)
    .first();

  const today = new Date().setHours(0, 0, 0, 0);

  const clicksToday = await c.env.DB.prepare(
    `
    SELECT COUNT(clicks.id) as count
    FROM clicks
    JOIN links ON clicks.link_id = links.id
    WHERE links.user_id = ? AND clicks.created_at > ?
    `,
  )
    .bind(userId, today)
    .first();

  return c.json({
    totalLinks: totalLinks?.count || 0,
    totalClicks: totalClicks?.count || 0,
    clicksToday: clicksToday?.count || 0,
  });
});

app.get("/analytics/live/:linkId", async (c) => {
  const linkId = c.req.param("linkId");

  let interval: any;

  const stream = new ReadableStream({
    start(controller) {
      interval = setInterval(async () => {
        const countResult = await c.env.DB.prepare(
          `SELECT COUNT(*) as count FROM clicks WHERE link_id = ?`,
        )
          .bind(linkId)
          .first();

        const latest = await c.env.DB.prepare(
          `
          SELECT country
          FROM clicks
          WHERE link_id = ?
          ORDER BY created_at DESC
          LIMIT 1
          `,
        )
          .bind(linkId)
          .first();

        const data = JSON.stringify({
          clicks: countResult?.count || 0,
          country: latest?.country || null,
        });

        controller.enqueue(`data: ${data}\n\n`);
      }, 2000);
    },

    cancel() {
      clearInterval(interval);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
});

app.get("/:shortCode", async (c) => {
  const { shortCode } = c.req.param();

  const link = await c.env.DB.prepare(
    `
    SELECT * FROM links
    WHERE short_code = ?
  `,
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
