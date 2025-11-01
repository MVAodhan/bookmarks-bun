import { Hono } from "hono";
import { cors } from "hono/cors";
import { db } from "./lib/db";
import { bookmarksTable } from "./db/schema";
import { parseHTML } from "linkedom";
import "dotenv/config";
import { Readability } from "@mozilla/readability";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { basicAuth } from "hono/basic-auth";
import { serve } from "bun";
import { eq } from "drizzle-orm";
const app = new Hono();

app.use("/user/*", clerkMiddleware());
app.use(
  "/server/*",
  basicAuth({
    username: process.env.BASIC_AUTH_USERNAME!,
    password: process.env.BASIC_AUTH_PASSWORD!,
  })
);

app.get("/user/bookmarks", async (c) => {
  const auth = getAuth(c);

  if (!auth?.userId) {
    c.status(401);
    return c.json({
      message: "You are not logged in. Please log in to see bookmarks",
    });
  }

  const res = await db
    .select()
    .from(bookmarksTable)
    .where(eq(bookmarksTable.user_id, auth.userId));

  return c.json({
    res: res,
  });
});
app.get("/health", async (c) => {
  c.status(200);
  return c.json({
    success: true,
  });
});

app.post("/user/url", async (c) => {
  const auth = getAuth(c);

  if (!auth?.userId) {
    c.status(401);
    return c.json({
      message: "You are not logged in. Please login to add a bookmark",
    });
  }

  const body = await c.req.json();
  const username = process.env.BASIC_AUTH_USERNAME!;
  const password = process.env.BASIC_AUTH_PASSWORD!;

  const encodedCredentials = btoa(`${username}:${password}`);

  const response = await fetch(body.url);
  const html = await response.text();
  const { document } = parseHTML(html);

  let reader: Readability | null = null;

  try {
    reader = new Readability(document);
  } catch (error) {
    console.error("Readability error", (error as Error).message);
  }
  const article = reader?.parse();

  if (article?.content) {
    const res = await fetch(process.env.WEBHOOK_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${encodedCredentials}`,
      },
      body: JSON.stringify({
        cleanArticle: article.content,
        url: body.url,
        user: auth.userId,
      }),
    });
  }

  return c.json({
    message: "Bookmark processing ",
  });
});

app.post("/server/summary", async (c) => {
  const body = await c.req.json();

  const res = await db.insert(bookmarksTable).values({
    url: body.url,
    description: body.summary,
    tags: body.tags,
    user_id: body.userId,
  });
  return c.json({
    success: true,
  });
});

serve({
  fetch: app.fetch,
  port: 8787,
});
