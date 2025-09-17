import { generateCreateTableSQL } from './dsl/generator';
import { table, column } from './dsl/builder';
import { Database } from 'sqlite3';

export const version = 3;
export const description = 'Create ai config table';

const aiConfigsTable = table('ai_configs', [
  column('id', 'INTEGER', ['PRIMARY KEY', 'AUTOINCREMENT']),
  column('user_id', 'INTEGER'),
  column('name', 'TEXT'),
  column('endpoint', 'TEXT'),
  column('api_key', 'TEXT'),
  column('created_at', 'DATETIME', ['DEFAULT CURRENT_TIMESTAMP']),
  column('user_id', 'INTEGER', ['FOREIGN KEY (user_id) REFERENCES users (id)']),
]);

export function up(db: Database) {
  return new Promise<void>((resolve, reject) => {
    db.run(generateCreateTableSQL(aiConfigsTable), (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}