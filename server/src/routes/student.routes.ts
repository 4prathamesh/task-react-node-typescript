import { Router } from 'express';
import {
  registerStudent,
  loginStudent,
  getAllStudents,
  updateStudent,
  deleteStudent,
} from '../controllers/student.controller';

import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authRateLimiter, registerStudent);
router.post('/login', authRateLimiter, loginStudent);
router.get('/students', getAllStudents);
router.put('/student/:id', updateStudent);
router.delete('/student/:id', deleteStudent);

export default router;