import { NextFunction, Request, Response } from 'express';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { TokenPayload } from '../types/auth';

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as TokenPayload;
        req.user = payload;
        next();
    } catch (err: any) {
        if (err instanceof JsonWebTokenError) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        return res.status(500).json({ error: 'Authentication failed' });
    }
}