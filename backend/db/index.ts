import sqlite3 from 'sqlite3';
import { runMigrations } from './migration/runMigrations';

const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    runMigrations(db).catch(console.error);
  }
});

export default db;