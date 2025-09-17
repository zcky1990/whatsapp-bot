export type ColumnType = 'INTEGER' | 'TEXT' | 'DATETIME' | 'REAL' | 'BLOB';
export type Constraint = 'PRIMARY KEY' | 'AUTOINCREMENT' | 'UNIQUE' | 'DEFAULT CURRENT_TIMESTAMP' | `FOREIGN KEY (${string}) REFERENCES ${string} (${string})`;
export type Column = {
  name: string;
  type: ColumnType;
  constraints?: Constraint[];
};
export type TableSchema = {
  name: string;
  columns: Column[];
};

import { Database } from 'sqlite3';

export interface Migration {
  version: number;
  description: string;
  up: (db: Database) => Promise<void>;
}