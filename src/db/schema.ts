import { integer, jsonb, pgTable, varchar } from "drizzle-orm/pg-core";

export const bookmarksTable = pgTable("urls", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  url: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }),
  tags: jsonb(),
});
