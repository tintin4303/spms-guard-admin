import { Request, Response } from 'express';
import * as usersService from './users.service';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await usersService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, role, password } = req.body;
    if (!email || !password || !role) {
      res.status(400).json({ error: 'Email, password, and role are required' });
      return;
    }
    const user = await usersService.createUser({ email, name, role, password });
    res.json(user);
  } catch (err: any) {
    if (err.message === 'User already exists') {
      res.status(409).json({ error: err.message });
    } else {
      console.error(err);
      res.status(500).json({ error: 'Failed to provision user account' });
    }
  }
};

export const removeUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await usersService.deleteUser(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user account' });
  }
};
