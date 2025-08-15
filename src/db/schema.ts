import {
  pgTable,
  serial,
  varchar,
  timestamp,
  boolean,
  uuid,
  integer,
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
});

export const trainings = pgTable("trainings", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  categoryId: uuid("category_id")
    .references(() => categories.id, { onDelete: "cascade" })
    .notNull(),
});

export const complexes = pgTable("complexes", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  trainingId: uuid("training_id")
    .references(() => trainings.id, { onDelete: "cascade" })
    .notNull(),
  rounds: integer("rounds"),
  restBetweenSec: integer("rest_between_sec"),
});

export const exercises = pgTable("exercises", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  complexId: uuid("complex_id")
    .references(() => complexes.id, { onDelete: "cascade" })
    .notNull(),
  video: varchar("video", { length: 512 }).notNull(),
  thumbnail: varchar("thumbnail", { length: 512 }),
  mode: varchar("mode", { length: 10 }).notNull(),
  durationSec: integer("duration_sec"),
  reps: integer("reps"),
  restSec: integer("rest_sec"),
});
