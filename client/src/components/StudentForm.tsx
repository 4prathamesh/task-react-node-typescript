import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { encrypt } from '../utils/crypto';

export interface StudentData {
  _id?: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  courseEnrolled: string;
  password?: string;
}

interface StudentFormProps {
  mode: 'create' | 'edit';
  initialData?: StudentData;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormErrors {
  [key: string]: string;
}

const COURSES = [
  'B.Tech Computer Science',
  'B.Tech Information Technology',
  'B.Sc Mathematics',
  'B.Sc Physics',
  'MBA Business Administration',
  'M.Tech Software Engineering',
  'BCA Computer Applications',
  'MCA Computer Applications',
  'B.Com Commerce',
  'B.A English Literature',
];

const StudentForm: React.FC<StudentFormProps> = ({ mode, initialData, onSuccess, onCancel }) => {
  const [form, setForm] = useState<StudentData>({
    fullName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    courseEnrolled: '',
    password: '',
  });
  const [errors, setErrors]   = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (initialData) {
      setForm({ ...initialData, password: '' });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};

    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    else if (form.fullName.trim().length < 2) errs.fullName = 'Name must be at least 2 characters';

    if (!form.email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';

    if (!form.phoneNumber) errs.phoneNumber = 'Phone number is required';
    else if (!/^\+?[\d\s\-()]{10,15}$/.test(form.phoneNumber)) errs.phoneNumber = 'Enter a valid phone number';

    if (!form.dateOfBirth) errs.dateOfBirth = 'Date of birth is required';
    else {
      const dob = new Date(form.dateOfBirth);
      const minAge = new Date();
      minAge.setFullYear(minAge.getFullYear() - 10);
      if (dob > minAge) errs.dateOfBirth = 'Student must be at least 10 years old';
    }

    if (!form.gender) errs.gender = 'Please select a gender';
    if (!form.address.trim()) errs.address = 'Address is required';
    else if (form.address.trim().length < 10) errs.address = 'Please enter a complete address';
    if (!form.courseEnrolled) errs.courseEnrolled = 'Please select a course';

    if (mode === 'create') {
      if (!form.password) errs.password = 'Password is required';
      else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
      else if (!/(?=.*[A-Z])(?=.*\d)/.test(form.password))
        errs.password = 'Must contain at least one uppercase letter and one number';
    } else if (form.password && form.password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError('');

    try {
      // Level 1: encrypt all sensitive fields before sending
      const payload: Record<string, string> = {
        fullName:       encrypt(form.fullName),
        email:          encrypt(form.email),
        phoneNumber:    encrypt(form.phoneNumber),
        dateOfBirth:    encrypt(form.dateOfBirth),
        gender:         encrypt(form.gender),
        address:        encrypt(form.address),
        courseEnrolled: encrypt(form.courseEnrolled),
      };
      if (form.password) {
        payload.password = encrypt(form.password);
      }

      if (mode === 'create') {
        await axios.post('/api/register', payload);
      } else {
        await axios.put(`/api/student/${initialData?._id}`, payload);
      }

      onSuccess();
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Operation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'fullName',    label: 'Full Name',     type: 'text',     icon: '👤', placeholder: 'John Doe' },
    { name: 'email',       label: 'Email Address', type: 'email',    icon: '✉',  placeholder: 'john@example.com' },
    { name: 'phoneNumber', label: 'Phone Number',  type: 'tel',      icon: '📞', placeholder: '+91 98765 43210' },
    { name: 'dateOfBirth', label: 'Date of Birth', type: 'date',     icon: '📅', placeholder: '' },
  ];

  return (
    <div className="student-form-container">
      <div className="form-header">
        <h2 className="form-title">
          {mode === 'create' ? '➕ Register New Student' : '✏️ Update Student'}
        </h2>
        <p className="form-subtitle">All data is AES-256 encrypted before transmission</p>
      </div>

      {serverError && (
        <div className="alert alert-error">{serverError}</div>
      )}

      <form onSubmit={handleSubmit} className="student-form" noValidate>
        <div className="form-grid">
          {fields.map(({ name, label, type, icon, placeholder }) => (
            <div className="form-group" key={name}>
              <label className="form-label">{icon} {label}</label>
              <input
                type={type}
                name={name}
                className={`form-input ${errors[name] ? 'input-error' : ''}`}
                placeholder={placeholder}
                value={(form as any)[name]}
                onChange={handleChange}
                max={name === 'dateOfBirth' ? new Date().toISOString().split('T')[0] : undefined}
              />
              {errors[name] && <span className="error-msg">{errors[name]}</span>}
            </div>
          ))}

          <div className="form-group">
            <label className="form-label">⚧ Gender</label>
            <select
              name="gender"
              className={`form-input form-select ${errors.gender ? 'input-error' : ''}`}
              value={form.gender}
              onChange={handleChange}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
            {errors.gender && <span className="error-msg">{errors.gender}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">📚 Course Enrolled</label>
            <select
              name="courseEnrolled"
              className={`form-input form-select ${errors.courseEnrolled ? 'input-error' : ''}`}
              value={form.courseEnrolled}
              onChange={handleChange}
            >
              <option value="">Select a course</option>
              {COURSES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.courseEnrolled && <span className="error-msg">{errors.courseEnrolled}</span>}
          </div>

          <div className="form-group form-group-full">
            <label className="form-label">🏠 Address</label>
            <textarea
              name="address"
              className={`form-input form-textarea ${errors.address ? 'input-error' : ''}`}
              placeholder="123 Main Street, City, State, ZIP"
              value={form.address}
              onChange={handleChange}
              rows={3}
            />
            {errors.address && <span className="error-msg">{errors.address}</span>}
          </div>

          <div className="form-group form-group-full">
            <label className="form-label">
              🔐 Password {mode === 'edit' && <span className="optional-tag">(leave blank to keep unchanged)</span>}
            </label>
            <div className="input-wrapper">
              <input
                type={showPwd ? 'text' : 'password'}
                name="password"
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                placeholder={mode === 'create' ? 'Min 8 chars, 1 uppercase, 1 number' : 'New password (optional)'}
                value={form.password || ''}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="pwd-toggle"
                onClick={() => setShowPwd(v => !v)}
              >
                {showPwd ? '🙈' : '👁'}
              </button>
            </div>
            {errors.password && <span className="error-msg">{errors.password}</span>}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : (mode === 'create' ? 'Register Student' : 'Update Student')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;