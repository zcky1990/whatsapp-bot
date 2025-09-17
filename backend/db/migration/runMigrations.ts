import { Database } from 'sqlite3';
import migrations from './index';
import { Migration } from './dsl/types';

// Create schema_version table if it doesn't exist
const createSchemaTable = (db: Database) => {
  return new Promise<void>((resolve, reject) => {
    db.run(
      `CREATE TABLE IF NOT EXISTS schema_version (
        version INTEGER PRIMARY KEY,
        description TEXT,
        installed_on DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
};

// Get the current schema version
const getCurrentVersion = (db: Database) => {
  return new Promise<number>((resolve, reject) => {
    db.get('SELECT MAX(version) as version FROM schema_version', (err, row: { version: number }) => {
      if (err) return reject(err);
      resolve(row.version || 0);
    });
  });
};

export async function runMigrations(db: Database) {
  await createSchemaTable(db);
  const currentVersion = await getCurrentVersion(db);

  const pendingMigrations = migrations.filter((m:Migration) => m.version > currentVersion);

  if (pendingMigrations.length === 0) {
    console.log('No pending migrations to run.');
    return;
  }

  // Sort migrations to ensure they run in the correct order
  pendingMigrations.sort((a: Migration, b:Migration) => a.version - b.version);

  for (const migration of pendingMigrations) {
    try {
      console.log(`Running migration V${migration.version}: ${migration.description}...`);
      await migration.up(db);
      db.run('INSERT INTO schema_version (version, description) VALUES (?, ?)', [
        migration.version,
        migration.description,
      ]);
      console.log(`Migration V${migration.version} completed.`);
    } catch (error) {
      console.error(`Migration V${migration.version} failed:`, error);
      // Optional: Rollback logic or exit process
      return;
    }
  }
}