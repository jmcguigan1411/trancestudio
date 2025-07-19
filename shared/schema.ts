import { pgTable, text, serial, integer, boolean, jsonb, timestamp, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const samples = pgTable("samples", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // drums, bass, synths, leads, pads, fx, vocals
  filename: text("filename").notNull(),
  bpm: integer("bpm"),
  duration: integer("duration"), // in milliseconds
  tags: text("tags").array().default([]),
  isUserUploaded: boolean("is_user_uploaded").default(false),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tracks = pgTable("tracks", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  name: text("name").notNull(),
  volume: integer("volume").default(75), // 0-100
  pan: integer("pan").default(50), // 0-100 (50 = center)
  isMuted: boolean("is_muted").default(false),
  isSoloed: boolean("is_soloed").default(false),
  sampleId: integer("sample_id").references(() => samples.id),
  steps: jsonb("steps").default([]), // array of step states
  effects: jsonb("effects").default({}), // effect parameters
  order: integer("order").notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  bpm: integer("bpm").default(128),
  isPlaying: boolean("is_playing").default(false),
  currentStep: integer("current_step").default(0),
  userId: varchar("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSampleSchema = createInsertSchema(samples).omit({
  id: true,
  createdAt: true,
});

export const insertTrackSchema = createInsertSchema(tracks).omit({
  id: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// User types for auth
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type Sample = typeof samples.$inferSelect;
export type InsertSample = z.infer<typeof insertSampleSchema>;
export type Track = typeof tracks.$inferSelect;
export type InsertTrack = z.infer<typeof insertTrackSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
