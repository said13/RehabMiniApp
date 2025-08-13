import { pgTable, serial, varchar, timestamp, boolean } from "drizzle-orm/pg-core";

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
