import { Request, Response } from 'express';

import {
  registerStudentService,
  loginStudentService,
  getAllStudentsService,
  updateStudentService,
  deleteStudentService,
} from '../services/student.service';


// REGISTER
export async function registerStudent(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const student = await registerStudentService(req.body);

    res.status(201).json({
      message: 'Student registered successfully',
      student,
    });

  } catch (error: any) {

    if (error.message === 'EMAIL_EXISTS') {
      res.status(409).json({
        message: 'Email already registered',
      });
      return;
    }

    res.status(500).json({
      message: 'Server error during registration',
    });
  }
}


// LOGIN
export async function loginStudent(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const result = await loginStudentService(req.body);

    res.json({
      message: 'Login successful',
      ...result,
    });

  } catch (error: any) {

    if (error.message === 'INVALID_CREDENTIALS') {
      res.status(401).json({
        message: 'Invalid email or password',
      });
      return;
    }

    res.status(500).json({
      message: 'Server error during login',
    });
  }
}


// GET ALL
export async function getAllStudents(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    const students = await getAllStudentsService();

    res.json({ students });

  } catch (error) {
    res.status(500).json({
      message: 'Server error fetching students',
    });
  }
}


// UPDATE
export async function updateStudent(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const student = await updateStudentService(
      req.params.id,
      req.body
    );

    res.json({
      message: 'Student updated successfully',
      student,
    });

  } catch (error: any) {

    if (error.message === 'STUDENT_NOT_FOUND') {
      res.status(404).json({
        message: 'Student not found',
      });
      return;
    }

    if(error.message === 'EMAIL_EXISTS'){
      res.status(409).json({
        message: 'Email already in use by another student',
      });
      return;
    }

    res.status(500).json({
      message: 'Server error during update',
    });
  }
}


// DELETE
export async function deleteStudent(
  req: Request,
  res: Response
): Promise<void> {
  try {
    await deleteStudentService(req.params.id);

    res.json({
      message: 'Student deleted successfully',
    });

  } catch (error: any) {

    if (error.message === 'STUDENT_NOT_FOUND') {
      res.status(404).json({
        message: 'Student not found',
      });
      return;
    }

    res.status(500).json({
      message: 'Server error during delete',
    });
  }
}