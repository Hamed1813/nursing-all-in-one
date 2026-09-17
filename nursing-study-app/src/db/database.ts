import * as SQLite from 'expo-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  dbInstance = await SQLite.openDatabaseAsync('nursing_study.db');
  await dbInstance.execAsync('PRAGMA journal_mode = WAL;');
  await dbInstance.execAsync('PRAGMA foreign_keys = ON;');
  return dbInstance;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS domains (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain_id INTEGER NOT NULL REFERENCES domains(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pages_domain ON pages(domain_id);

CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id INTEGER NOT NULL REFERENCES pages(id),
  question TEXT NOT NULL,
  choice_a TEXT NOT NULL,
  choice_b TEXT NOT NULL,
  choice_c TEXT NOT NULL,
  choice_d TEXT NOT NULL,
  correct_choice TEXT NOT NULL,
  explanation TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_questions_page ON questions(page_id);

CREATE TABLE IF NOT EXISTS progress (
  page_id INTEGER PRIMARY KEY REFERENCES pages(id),
  is_read INTEGER NOT NULL DEFAULT 0,
  first_read_at TEXT,
  last_read_at TEXT,
  times_read INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS leitner (
  page_id INTEGER PRIMARY KEY REFERENCES pages(id),
  box INTEGER NOT NULL DEFAULT 1,
  next_review_at TEXT NOT NULL,
  last_reviewed_at TEXT,
  correct_in_a_row INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  is_correct INTEGER NOT NULL,
  answered_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_attempts_page ON quiz_attempts(page_id);

CREATE TABLE IF NOT EXISTS exam_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain_filter TEXT NOT NULL,
  streak INTEGER NOT NULL,
  achieved_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;

export async function initDatabase(): Promise<void> {
  const db = await getDb();
  await db.execAsync(SCHEMA);
}

export async function nowIso(): Promise<string> {
  return new Date().toISOString();
}
