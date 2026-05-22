import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { toolsTable } from "./tools";

export const toolUsageEventsTable = pgTable("tool_usage_events", {
  id: serial("id").primaryKey(),
  toolId: text("tool_id").notNull().references(() => toolsTable.id),
  fileType: text("file_type"),
  fileSizeKb: integer("file_size_kb"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertToolUsageEventSchema = createInsertSchema(toolUsageEventsTable).omit({ id: true, createdAt: true });
export type InsertToolUsageEvent = z.infer<typeof insertToolUsageEventSchema>;
export type ToolUsageEvent = typeof toolUsageEventsTable.$inferSelect;
