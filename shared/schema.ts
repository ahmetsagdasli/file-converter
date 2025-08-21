import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const processedFiles = pgTable("processed_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  originalName: text("original_name").notNull(),
  processedName: text("processed_name").notNull(),
  fileSize: integer("file_size").notNull(),
  operation: text("operation").notNull(),
  status: text("status").notNull().default("processing"),
  downloadUrl: text("download_url"),
  expiresAt: timestamp("expires_at").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProcessedFileSchema = createInsertSchema(processedFiles).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type ProcessedFile = typeof processedFiles.$inferSelect;
export type InsertProcessedFile = z.infer<typeof insertProcessedFileSchema>;

// PDF operation schemas
export const mergeSchema = z.object({
  files: z.array(z.string()).min(2).max(10),
  filename: z.string().optional(),
  pageRanges: z.record(z.string()).optional(),
});

export const splitSchema = z.object({
  file: z.string(),
  ranges: z.string(),
  filename: z.string().optional(),
});

export const compressSchema = z.object({
  file: z.string(),
  level: z.enum(['balanced', 'strong']),
  filename: z.string().optional(),
});

export const imageToPdfSchema = z.object({
  files: z.array(z.string()).min(1).max(10),
  filename: z.string().optional(),
});

export const pdfToImageSchema = z.object({
  file: z.string(),
  dpi: z.number().min(72).max(300).default(150),
  format: z.enum(['png', 'jpg']).default('png'),
});

export const reorderSchema = z.object({
  file: z.string(),
  newOrder: z.array(z.number()),
  rotations: z.record(z.number()).optional(),
  deletions: z.array(z.number()).optional(),
  filename: z.string().optional(),
});

export type MergeRequest = z.infer<typeof mergeSchema>;
export type SplitRequest = z.infer<typeof splitSchema>;
export type CompressRequest = z.infer<typeof compressSchema>;
export type ImageToPdfRequest = z.infer<typeof imageToPdfSchema>;
export type PdfToImageRequest = z.infer<typeof pdfToImageSchema>;
export type ReorderRequest = z.infer<typeof reorderSchema>;
