import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Student, { IStudent } from '../models/Student';

import {
  decryptFromFrontend,
  decryptFromStorage,
  processIncomingField,
  processOutgoingField,
} from '../utils/crypto';


// Remove sensitive fields + prepare encrypted response
export function prepareStudentForFrontend(student: IStudent) {
  const obj = student.toObject();

  const { password, __v, ...rest } = obj;

  return {
    _id: rest._id,
    fullName: processOutgoingField(rest.fullName),
    email: processOutgoingField(rest.email),
    phoneNumber: processOutgoingField(rest.phoneNumber),
    dateOfBirth: processOutgoingField(rest.dateOfBirth),
    gender: processOutgoingField(rest.gender),
    address: processOutgoingField(rest.address),
    courseEnrolled: processOutgoingField(rest.courseEnrolled),
    createdAt: rest.createdAt,
    updatedAt: rest.updatedAt,
  };
}


// REGISTER
export async function registerStudentService(data: any) {
  const {
    fullName,
    email,
    phoneNumber,
    dateOfBirth,
    gender,
    address,
    courseEnrolled,
    password,
  } = data;

  const plainEmail = decryptFromFrontend(email);

  const students = await Student.find();

  for (const s of students) {
    if (decryptFromStorage(s.email) === plainEmail) {
      throw new Error('EMAIL_EXISTS');
    }
  }

  const plainPassword = decryptFromFrontend(password);

  const hashedPassword = await bcrypt.hash(plainPassword, 12);

  const student = await Student.create({
    fullName: processIncomingField(fullName),
    email: processIncomingField(email),
    phoneNumber: processIncomingField(phoneNumber),
    dateOfBirth: processIncomingField(dateOfBirth),
    gender: processIncomingField(gender),
    address: processIncomingField(address),
    courseEnrolled: processIncomingField(courseEnrolled),
    password: hashedPassword,
  });

  return prepareStudentForFrontend(student);
}


// LOGIN
export async function loginStudentService(data: any) {
  const { email, password } = data;

  const plainEmail = decryptFromFrontend(email);
  const plainPassword = decryptFromFrontend(password);

  const students = await Student.find();

  let foundStudent: IStudent | null = null;

  for (const s of students) {
    if (decryptFromStorage(s.email) === plainEmail) {
      foundStudent = s;
      break;
    }
  }

  if (!foundStudent) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const passwordMatch = await bcrypt.compare(
    plainPassword,
    foundStudent.password
  );

  if (!passwordMatch) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const token = jwt.sign(
    {
      id: foundStudent._id,
      email: plainEmail,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: '24h',
    }
  );

  return {
    token,
    student: prepareStudentForFrontend(foundStudent),
  };
}


// GET ALL
export async function getAllStudentsService() {
  const students = await Student.find().sort({ createdAt: -1 });

  return students.map(prepareStudentForFrontend);
}


// UPDATE
export async function updateStudentService(
  id: string,
  data: any
) {
  const updateData: Record<string, string> = {};

  if (data.fullName) {
    updateData.fullName = processIncomingField(data.fullName);
  }

  if (data.email) {
    updateData.email = processIncomingField(data.email);
    const plainEmail = decryptFromFrontend(data.email);

    const students = await Student.find();

    for (const s of students) {
      if (decryptFromStorage(s.email) === plainEmail) {
        throw new Error('EMAIL_EXISTS');
      }
    }
  }

  if (data.phoneNumber) {
    updateData.phoneNumber = processIncomingField(data.phoneNumber);
  }

  if (data.dateOfBirth) {
    updateData.dateOfBirth = processIncomingField(data.dateOfBirth);
  }

  if (data.gender) {
    updateData.gender = processIncomingField(data.gender);
  }

  if (data.address) {
    updateData.address = processIncomingField(data.address);
  }

  if (data.courseEnrolled) {
    updateData.courseEnrolled = processIncomingField(
      data.courseEnrolled
    );
  }

  if (data.password) {
    const plainPassword = decryptFromFrontend(data.password);

    updateData.password = await bcrypt.hash(
      plainPassword,
      12
    );
  }

  const student = await Student.findByIdAndUpdate(
    id,
    updateData,
    { new: true }
  );

  if (!student) {
    throw new Error('STUDENT_NOT_FOUND');
  }

  return prepareStudentForFrontend(student);
}


// DELETE
export async function deleteStudentService(id: string) {
  const student = await Student.findByIdAndDelete(id);

  if (!student) {
    throw new Error('STUDENT_NOT_FOUND');
  }

  return true;
}