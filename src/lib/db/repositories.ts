import { Database } from 'bun:sqlite';
import { getDatabase } from './database';
import { Thread, Message } from './types';

export class ThreadRepository {
  private db: Database;

  constructor() {
    this.db = getDatabase();
  }

  async findAll(): Promise<Thread[]> {
    const stmt = this.db.prepare('SELECT * FROM threads ORDER BY updatedAt DESC');
    return stmt.all() as Thread[];
  }

  async findById(id: string): Promise<Thread | null> {
    const stmt = this.db.prepare('SELECT * FROM threads WHERE id = ?');
    const result = stmt.get(id) as Thread | undefined;
    return result || null;
  }

  async create(title: string): Promise<Thread> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const stmt = this.db.prepare(
      'INSERT INTO threads (id, title, createdAt, updatedAt) VALUES (?, ?, ?, ?)'
    );
    stmt.run(id, title, now, now);
    return { id, title, createdAt: now, updatedAt: now };
  }

  async update(id: string, title: string): Promise<void> {
    const now = new Date().toISOString();
    const stmt = this.db.prepare('UPDATE threads SET title = ?, updatedAt = ? WHERE id = ?');
    stmt.run(title, now, id);
  }

  async delete(id: string): Promise<void> {
    const stmt = this.db.prepare('DELETE FROM threads WHERE id = ?');
    stmt.run(id);
  }
}

export class MessageRepository {
  private db: Database;

  constructor() {
    this.db = getDatabase();
  }

  async findByThreadId(threadId: string): Promise<Message[]> {
    const stmt = this.db.prepare('SELECT * FROM messages WHERE threadId = ? ORDER BY createdAt ASC');
    return stmt.all(threadId) as Message[];
  }

  async create(threadId: string, role: 'user' | 'assistant' | 'system', content: string): Promise<Message> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const stmt = this.db.prepare(
      'INSERT INTO messages (id, threadId, role, content, createdAt) VALUES (?, ?, ?, ?, ?)'
    );
    stmt.run(id, threadId, role, content, now);
    return { id, threadId, role, content, createdAt: now };
  }

  async deleteByThreadId(threadId: string): Promise<void> {
    const stmt = this.db.prepare('DELETE FROM messages WHERE threadId = ?');
    stmt.run(threadId);
  }

  async delete(id: string): Promise<void> {
    const stmt = this.db.prepare('DELETE FROM messages WHERE id = ?');
    stmt.run(id);
  }
}

