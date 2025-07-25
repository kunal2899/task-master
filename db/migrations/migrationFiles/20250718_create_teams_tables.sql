CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  about VARCHAR(300) NOT NULL,
  owner INTEGER REFERENCES users (id) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS teams_name_owner_idx
ON teams USING BTREE (name, owner);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'team_user_status') THEN
    CREATE TYPE team_user_status AS ENUM ('active', 'pending', 'removed', 'inactive', 'suspended');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'team_user_role') THEN
    CREATE TYPE team_user_role AS ENUM ('owner', 'admin', 'member', 'viewer');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS team_users (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users (id) NOT NULL,
  team_id INTEGER REFERENCES teams (id) NOT NULL,
  role team_user_role NOT NULL DEFAULT 'member',
  status team_user_status NOT NULL DEFAULT 'pending',
  added_by INTEGER REFERENCES users (id) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS team_users_user_team_idx
ON team_users USING BTREE (user_id, team_id);