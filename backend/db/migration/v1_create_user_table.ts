import { generateCreateTableSQL } from './dsl/generator';
import { table, column } from './dsl/builder';
import { Database } from 'sqlite3';

export const version = 1;
export const description = 'Create user table';

const userTable = table('users', [
  column('id', 'INTEGER', ['PRIMARY KEY', 'AUTOINCREMENT']),
  column('username', 'TEXT', ['UNIQUE']),
  column('password', 'TEXT'),
  column('created_at', 'DATETIME', ['DEFAULT CURRENT_TIMESTAMP']),
]);

export function up(db: Database) {
  return new Promise<void>((resolve, reject) => {
    db.run(generateCreateTableSQL(userTable), (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}