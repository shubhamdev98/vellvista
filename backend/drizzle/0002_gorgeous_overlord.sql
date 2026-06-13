-- Rename name column to full_name and add password column
ALTER TABLE users RENAME COLUMN name TO full_name;
ALTER TABLE users ADD COLUMN password TEXT NOT NULL DEFAULT '';