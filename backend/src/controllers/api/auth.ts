import { Router, Request, Response } from 'express';
import { loginUser, registerUser } from '../../services/auth.service';
import { authenticateToken } from '../../middleware/authenticate'

const authRouter = Router();

// Auth routes
authRouter.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const result = await registerUser(username, password);
    res.json(result);
  } catch (error: any) {
    if (error.message.includes('Username already exists')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

authRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const result = await loginUser(username, password);
    res.json(result);
  } catch (error: any) {
    if (error.message === 'Invalid credentials') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

authRouter.get('/auth/verify', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json({ 
    user: {
      userId: user.userId,
      username: user.username
    },
    message: "Token is valid"
  });
});

export default authRouter;
