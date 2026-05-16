import mongoose, { Document, Schema } from 'mongoose';

export interface IStudent extends Document {
  fullName: string;       // stored AES-encrypted (Level 2)
  email: string;          // stored AES-encrypted (Level 2)
  phoneNumber: string;    // stored AES-encrypted (Level 2)
  dateOfBirth: string;    // stored AES-encrypted (Level 2)
  gender: string;         // stored AES-encrypted (Level 2)
  address: string;        // stored AES-encrypted (Level 2)
  courseEnrolled: string; // stored AES-encrypted (Level 2)
  password: string;       // bcrypt hashed (not encrypted, hashed)
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    fullName:       { type: String, required: true },
    email:          { type: String, required: true, unique: true },
    phoneNumber:    { type: String, required: true },
    dateOfBirth:    { type: String, required: true },
    gender:         { type: String, required: true },
    address:        { type: String, required: true },
    courseEnrolled: { type: String, required: true },
    password:       { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IStudent>('Student', StudentSchema);