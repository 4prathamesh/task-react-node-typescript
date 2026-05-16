import { Router } from 'express';
import {
  registerStudent,
  loginStudent,
  getAllStudents,
  updateStudent,
  deleteStudent,
} from '../controllers/student.controller';

import { authMiddleware } from '../middleware/auth.middleware';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authRateLimiter, registerStudent);
router.post('/login', authRateLimiter, loginStudent);
router.get('/students', authMiddleware, getAllStudents);
router.put('/student/:id', authMiddleware, updateStudent);
router.delete('/student/:id', authMiddleware, deleteStudent);

export default router;