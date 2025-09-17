import dotenv from 'dotenv';
import { runMigrations } from './migration/runMigrations';
dotenv.config();
import db from '../src/lib/database';

runMigrations(db)
    .then(() => {
        console.log('All migrations completed successfully.');
        db.close();
    })
    .catch((error) => {
        console.error('Migrations failed:', error);
        db.close();
        process.exit(1);
    });