CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(256) NOT NULL
);

CREATE TABLE IF NOT EXISTS trainings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(256) NOT NULL,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS complexes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(256) NOT NULL,
  training_id uuid NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  rounds integer,
  rest_between_sec integer
);

CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(256) NOT NULL,
  complex_id uuid NOT NULL REFERENCES complexes(id) ON DELETE CASCADE,
  video varchar(512) NOT NULL,
  thumbnail varchar(512),
  mode varchar(10) NOT NULL,
  duration_sec integer,
  reps integer,
  rest_sec integer,
  cues jsonb
);

CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(256) NOT NULL,
  url varchar(512) NOT NULL,
  thumbnail varchar(512)
);
