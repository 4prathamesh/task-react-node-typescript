import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { decryptStudentFields } from '../utils/crypto';
import StudentForm, { StudentData } from './StudentForm';

interface RawStudent {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  courseEnrolled: string;
  createdAt: string;
}

interface Student {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  courseEnrolled: string;
  createdAt: string;
}

interface StudentListProps {
  onLogout: () => void;
}

const StudentList: React.FC<StudentListProps> = ({ onLogout }) => {
  const [students, setStudents]       = useState<Student[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [showForm, setShowForm]       = useState(false);
  const [editStudent, setEditStudent] = useState<StudentData | undefined>();
  const [deleteId, setDeleteId]       = useState<string | null>(null);
  const [searchTerm, setSearchTerm]   = useState('');
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [successMsg, setSuccessMsg]   = useState('');

  const decryptStudent = (raw: RawStudent): Student => {
    const decrypted = decryptStudentFields(raw as unknown as Record<string, string>);
    return {
      _id:            raw._id,
      fullName:       decrypted.fullName,
      email:          decrypted.email,
      phoneNumber:    decrypted.phoneNumber,
      dateOfBirth:    decrypted.dateOfBirth,
      gender:         decrypted.gender,
      address:        decrypted.address,
      courseEnrolled: decrypted.courseEnrolled,
      createdAt:      raw.createdAt,
    };
  };

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get('/api/students');
      // Backend sends Level-1 encrypted data; frontend decrypts
      const decrypted = data.students.map(decryptStudent);
      setStudents(decrypted);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditStudent(undefined);
    fetchStudents();
    showSuccess(editStudent ? 'Student updated successfully!' : 'Student registered successfully!');
  };

  const handleEdit = (student: Student) => {
    setEditStudent({
      _id:            student._id,
      fullName:       student.fullName,
      email:          student.email,
      phoneNumber:    student.phoneNumber,
      dateOfBirth:    student.dateOfBirth,
      gender:         student.gender,
      address:        student.address,
      courseEnrolled: student.courseEnrolled,
    });
    setShowForm(true);
    setViewStudent(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`/api/student/${deleteId}`);
      setDeleteId(null);
      fetchStudents();
      showSuccess('Student deleted successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Delete failed');
      setDeleteId(null);
    }
  };

  const filtered = students.filter(s =>
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.courseEnrolled.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showForm) {
    return (
      <div className="page-wrapper">
        <StudentForm
          mode={editStudent ? 'edit' : 'create'}
          initialData={editStudent}
          onSuccess={handleFormSuccess}
          onCancel={() => { setShowForm(false); setEditStudent(undefined); }}
        />
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">🎓</div>
          <div>
            <h1 className="dashboard-title">Student Portal</h1>
            <p className="dashboard-subtitle">Manage student records securely</p>
          </div>
        </div>
        <div className="header-right">
          <div className="encryption-indicator">
            <span className="enc-dot" /> AES-256 Encrypted
          </div>
          <button className="btn btn-outline" onClick={onLogout}>
            Sign Out
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {successMsg && (
          <div className="alert alert-success">{successMsg}</div>
        )}
        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        {/* Controls */}
        <div className="controls-bar">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, email, or course..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="controls-right">
            <span className="student-count">{filtered.length} student{filtered.length !== 1 ? 's' : ''}</span>
            <button className="btn btn-primary" onClick={() => { setEditStudent(undefined); setShowForm(true); }}>
              ➕ Add Student
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Loading students...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>{searchTerm ? 'No results found' : 'No students yet'}</h3>
            <p>{searchTerm ? 'Try a different search term' : 'Click "Add Student" to register the first student'}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="student-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Course</th>
                  <th>Gender</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student, idx) => (
                  <tr key={student._id} className="table-row">
                    <td className="row-num">{idx + 1}</td>
                    <td className="student-name">
                      <div className="avatar">{student.fullName.charAt(0).toUpperCase()}</div>
                      {student.fullName}
                    </td>
                    <td>{student.email}</td>
                    <td>{student.phoneNumber}</td>
                    <td><span className="course-badge">{student.courseEnrolled}</span></td>
                    <td>{student.gender}</td>
                    <td>{new Date(student.createdAt).toLocaleDateString()}</td>
                    <td className="actions-cell">
                      <button
                        className="action-btn view-btn"
                        onClick={() => setViewStudent(student)}
                        title="View details"
                      >👁</button>
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEdit(student)}
                        title="Edit student"
                      >✏️</button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => setDeleteId(student._id)}
                        title="Delete student"
                      >🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {viewStudent && (
        <div className="modal-overlay" onClick={() => setViewStudent(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-avatar">{viewStudent.fullName.charAt(0).toUpperCase()}</div>
              <h3 className="modal-title">{viewStudent.fullName}</h3>
              <button className="modal-close" onClick={() => setViewStudent(null)}>✕</button>
            </div>
            <div className="modal-body">
              {[
                { label: 'Email',    value: viewStudent.email,          icon: '✉' },
                { label: 'Phone',    value: viewStudent.phoneNumber,    icon: '📞' },
                { label: 'DOB',      value: viewStudent.dateOfBirth,    icon: '📅' },
                { label: 'Gender',   value: viewStudent.gender,         icon: '⚧' },
                { label: 'Course',   value: viewStudent.courseEnrolled, icon: '📚' },
                { label: 'Address',  value: viewStudent.address,        icon: '🏠' },
              ].map(({ label, value, icon }) => (
                <div className="detail-row" key={label}>
                  <span className="detail-icon">{icon}</span>
                  <div>
                    <span className="detail-label">{label}</span>
                    <span className="detail-value">{value}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setViewStudent(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => handleEdit(viewStudent)}>Edit Student</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal modal-confirm" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon">⚠️</div>
            <h3 className="confirm-title">Delete Student?</h3>
            <p className="confirm-msg">This action is permanent and cannot be undone.</p>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;