import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roleCheck';
import { getUsers, createUser, removeUser } from './users.controller';

const router = Router();
router.use(authenticateToken);
router.get('/', requireRole(['ADMIN', 'OPERATION_MANAGER']), getUsers);
router.post('/', requireRole(['ADMIN']), createUser);
router.delete('/:id', requireRole(['ADMIN']), removeUser);

export default router;
