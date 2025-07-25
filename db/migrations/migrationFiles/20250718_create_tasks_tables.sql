DO $$
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
    CREATE TYPE task_priority AS ENUM ('lowest', 'low', 'medium', 'high', 'highest');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(500) NOT NULL,
  due_date TIMESTAMP NOT NULL,
  added_by INTEGER REFERENCES team_users (id) NOT NULL,
  priority task_priority NOT NULL DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'team_user_task_status') THEN
    CREATE TYPE team_user_task_status AS ENUM ('completed', 'in-progress', 'not-started', 'closed');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS team_user_tasks (
  id SERIAL PRIMARY KEY,
  team_user_id INTEGER REFERENCES team_users (id) NOT NULL,
  task_id INTEGER REFERENCES tasks (id) NOT NULL,
  status team_user_task_status NOT NULL DEFAULT 'not-started',
  remark VARCHAR(300),
  completed_at TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS task_comments (
  id SERIAL PRIMARY KEY,
  task_id INTEGER REFERENCES tasks (id) NOT NULL,
  added_by INTEGER REFERENCES team_users (id) NOT NULL,
  data TEXT NOT NULL,
  likes_count INTEGER NOT NULL DEFAULT 0
);

DO $$
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_attachments_media_type') THEN
    CREATE TYPE task_attachments_media_type AS ENUM ('image', 'video', 'document');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS task_attachments (
  id SERIAL PRIMARY KEY,
  task_id INTEGER REFERENCES tasks (id) NOT NULL,
  added_by INTEGER REFERENCES team_users (id) NOT NULL,
  media_url VARCHAR(200) NOT NULL,
  media_type task_attachments_media_type NOT NULL
);