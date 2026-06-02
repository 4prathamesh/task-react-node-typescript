import { Request, Response } from 'express';

import {
  registerStudentService,
  loginStudentService,
  getAllStudentsService,
  updateStudentService,
  deleteStudentService,
} from '../services/student.service';
import { catchAsync } from '../utils/catchAsync';

export const uploadStudentImage = async(req: Request, res: Response): Promise<void> => {
  try {
    console.log('Received file:', req.file);
    if(!req.file){
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }
    res.status(200).json({
      success: true,
      filename: req.file.filename,
      path: `/volume/student/${req.file.filename}`
    });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading file' });
  }
};


// REGISTER
export const registerStudent = catchAsync(async (req: Request, res: Response) => {
  const student = await registerStudentService(req.body);

  res.status(201).json({
    message: 'Student registered successfully',
    student,
  });
});

// LOGIN
export const loginStudent = catchAsync(async (req: Request, res: Response) => {
  const result = await loginStudentService(req.body);

  res.status(200).json({
    message: 'Login successful',
    ...result,
  });
})


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
export const updateStudent = 
  catchAsync(async (req: Request, res: Response) => {
    const student = await updateStudentService(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      student,
    });
});


// DELETE
export const deleteStudent = catchAsync(async (req: Request, res: Response) => {
  await deleteStudentService(req.params.id);

  res.status(204).json({
    message: 'Student deleted successfully',
  });
})