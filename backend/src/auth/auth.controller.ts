import { Request, Response } from 'express';
import * as authService from './auth.service';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }
    const result = await authService.registerUser(email, password, name);
    res.json(result);
  } catch (e: any) {
    if (e.message === 'User already exists') {
      res.status(409).json({ error: e.message });
    } else {
      console.error('Registration error:', e);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }
    const result = await authService.loginUser(email, password);
    res.json(result);
  } catch(e: any) {
    if (e.message === 'Invalid credentials') {
      res.status(401).json({ error: e.message });
    } else {
      console.error('Login error:', e);
      res.status(500).json({ error: 'Login failed' });
    }
  }
};
