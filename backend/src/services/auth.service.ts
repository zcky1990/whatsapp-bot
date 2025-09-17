import { hash, compare } from 'bcrypt-ts';
import jwt from 'jsonwebtoken';
import db from '../lib/database';
import { User } from '../types';


/**
 * Registers a new user and returns a token and user details.
 * @param username The username of the new user.
 * @param password The raw password of the new user.
 * @returns A promise that resolves with the new user's token and details, or rejects with an error.
 */

export async function registerUser(username: string, password: string): Promise<{ token: string; userId: number; username: string }> {
    const hashedPassword = await hash(password, 10);

    return new Promise((resolve, reject) => {
        db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return reject(new Error('Username already exists'));
                }
                return reject(new Error('Database error'));
            }
            const token = jwt.sign({ userId: this.lastID, username }, process.env.JWT_SECRET || 'your-secret-key');
            resolve({ token, userId: this.lastID, username });
        });
    });
}

/**
 * Validates user credentials and returns a JWT if successful.
 * @param username The username provided by the user.
 * @param password The raw password provided by the user.
 * @returns A promise that resolves with the JWT and user data on success, or rejects with an error.
 */
export async function loginUser(username: string, password: string): Promise<{ token: string; userId: number; username: string }> {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user: User) => {
            if (err) return reject(new Error('Database error'));
            if (!user) return reject(new Error('Invalid credentials'));

            const validPassword = await compare(password, user.password!);
            if (!validPassword) return reject(new Error('Invalid credentials'));

            const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET || 'your-secret-key');
            resolve({ token, userId: user.id, username: user.username });
        });
    });
}