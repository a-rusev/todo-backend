import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("User", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
