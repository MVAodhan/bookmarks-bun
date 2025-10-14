import { Hono } from "hono";
import { db } from "./lib/db";
import { bookmarksTable } from "./db/schema";

const app = new Hono();

app.get("/bookmarks", async (c) => {
  const res = await db.select().from(bookmarksTable);

  return c.json({
    res,
  });
});
app.get("/health", async (c) => {
  c.status(200);
  return c.json({
    success: true,
  });
});
app.post("/bookmarks", async (c) => {
  const body = await c.req.json();

  const res = await db.insert(bookmarksTable).values({
    url: body.url,
  });
  return c.json({
    res,
  });
});

export default app;
