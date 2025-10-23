import { integer, jsonb, pgTable, text, varchar } from "drizzle-orm/pg-core";

export const bookmarksTable = pgTable("urls", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  user_id: text().notNull(),
  url: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }),
  tags: jsonb(),
});
