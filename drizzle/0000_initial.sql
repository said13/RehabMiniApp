-- 0000_initial.sql

-- UUID generator for defaultRandom()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users
CREATE TABLE IF NOT EXISTS users (
  id serial PRIMARY KEY,
  user_id varchar(256) NOT NULL,
  name varchar(256) NOT NULL,
  username varchar(256),
  email varchar(256) NOT NULL,
  contact_number varchar(50),
  subscription_plan varchar(100),
  is_subscribed boolean DEFAULT false,
  subscription_expires_at timestamp
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(256) NOT NULL,
  cover_url varchar(512) NOT NULL
);

-- Trainings
CREATE TABLE IF NOT EXISTS trainings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  title varchar(256) NOT NULL,
  description text NOT NULL,
  cover_url varchar(512) NOT NULL
);

-- Complexes
CREATE TABLE IF NOT EXISTS complexes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id uuid NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  "order" integer NOT NULL,
  rounds integer NOT NULL CHECK (rounds >= 1)
  -- (опционально) обеспечить уникальность порядка в пределах тренировки:
  -- , CONSTRAINT complexes_order_unique UNIQUE (training_id, "order")
);

-- Exercises
CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complex_id uuid NOT NULL REFERENCES complexes(id) ON DELETE CASCADE,
  title varchar(256) NOT NULL,
  video_url varchar(512),
  mux_id varchar(256),
  video_duration_sec integer NOT NULL,
  perform_duration_sec integer NOT NULL,
  repetitions integer,
  rest_sec integer NOT NULL DEFAULT 0 CHECK (rest_sec >= 0),
  notes text
);

-- Helpful indexes on FKs
CREATE INDEX IF NOT EXISTS trainings_category_id_idx ON trainings(category_id);
CREATE INDEX IF NOT EXISTS complexes_training_id_idx ON complexes(training_id);
CREATE INDEX IF NOT EXISTS exercises_complex_id_idx ON exercises(complex_id);
