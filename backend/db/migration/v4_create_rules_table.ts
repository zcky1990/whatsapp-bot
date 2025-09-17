import { Database } from 'sqlite3';

export const version = 4;
export const description = 'Create rules table';

export function up(db: Database) {
  return new Promise<void>((resolve, reject) => {
    const sql = `
      CREATE TABLE IF NOT EXISTS rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        is_active INTEGER DEFAULT 1,
        priority INTEGER DEFAULT 0,
        condition_type TEXT NOT NULL,
        condition_value TEXT NOT NULL,
        condition_operator TEXT DEFAULT 'contains',
        action_type TEXT NOT NULL,
        action_value TEXT NOT NULL,
        action_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );
      
      CREATE INDEX IF NOT EXISTS idx_rules_user_id ON rules (user_id);
      CREATE INDEX IF NOT EXISTS idx_rules_active ON rules (is_active);
      CREATE INDEX IF NOT EXISTS idx_rules_priority ON rules (priority);
      CREATE INDEX IF NOT EXISTS idx_rules_condition_type ON rules (condition_type);
    `;
    
    db.exec(sql, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}
