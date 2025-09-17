import sqlite3 from 'sqlite3';

const DB_PATH: string = process.env.DB_PATH || "./database.sqlite";

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

export default db;