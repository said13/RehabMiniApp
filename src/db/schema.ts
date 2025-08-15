import {
  pgTable,
  serial,
  varchar,
  timestamp,
  boolean,
  uuid,
  integer,
  text,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  userID: varchar("user_id", { length: 256 }).notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  username: varchar("username", { length: 256 }),
  email: varchar("email", { length: 256 }).notNull(),
  contactNumber: varchar("contact_number", { length: 50 }),
  subscriptionPlan: varchar("subscription_plan", { length: 100 }),
  isSubscribed: boolean("is_subscribed").default(false),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
});

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  coverUrl: varchar("cover_url", { length: 512 }).notNull(),
});

export const trainings = pgTable("trainings", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryId: uuid("category_id")
    .references(() => categories.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description").notNull(),
  coverUrl: varchar("cover_url", { length: 512 }).notNull(),
});

export const complexes = pgTable("complexes", {
  id: uuid("id").defaultRandom().primaryKey(),
  trainingId: uuid("training_id")
    .references(() => trainings.id, { onDelete: "cascade" })
    .notNull(),
  order: integer("order").notNull(),
  rounds: integer("rounds").notNull(),
});

export const exercises = pgTable("exercises", {
  id: uuid("id").defaultRandom().primaryKey(),
  complexId: uuid("complex_id")
    .references(() => complexes.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  videoUrl: varchar("video_url", { length: 512 }),
  muxId: varchar("mux_id", { length: 256 }),
  videoDurationSec: integer("video_duration_sec").notNull(),
  performDurationSec: integer("perform_duration_sec").notNull(),
  repetitions: integer("repetitions"),
  restSec: integer("rest_sec").notNull().default(0),
  notes: text("notes"),
});
