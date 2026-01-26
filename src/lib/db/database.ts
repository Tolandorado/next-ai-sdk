import { Database } from 'bun:sqlite';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DATABASE_PATH || './data/chat.db';

let db: Database | null = null;

export function getDatabase(): Database {
  if (!db) {
    // Ensure data directory exists
    const dbDir = path.dirname(DB_PATH);
    try {
      fs.mkdirSync(dbDir, { recursive: true });
    } catch {
      // Directory might already exist or cannot be created
    }

    db = new Database(DB_PATH);
    initializeDatabase(db);
  }
  return db;
}

function initializeDatabase(db: Database) {
  // Create threads table
  db.run(`
    CREATE TABLE IF NOT EXISTS threads (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  // Create messages table
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      threadId TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
      content TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (threadId) REFERENCES threads(id) ON DELETE CASCADE
    )
  `);

  // Create index for faster queries
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_messages_threadId ON messages(threadId)
  `);
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

