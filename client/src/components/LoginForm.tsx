import React, { useState } from 'react';
import axios from 'axios';
import { encrypt } from '../utils/crypto';

interface LoginFormProps {
  onLoginSuccess: (token: string, studentId: string) => void;
  onSwitchToRegister: () => void;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors]     = useState<FormErrors>({});
  const [loading, setLoading]   = useState(false);
  const [showPwd, setShowPwd]   = useState(false);

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!email) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Enter a valid email address';
    }
    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      // Level 1 encryption: encrypt before sending to backend
      const payload = {
        email:    encrypt(email),
        password: encrypt(password),
      };

      const { data } = await axios.post('/api/login', payload);
      onLoginSuccess(data.token, data.student._id);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="lock-icon">🔐</div>
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to Student Portal</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        {errors.general && (
          <div className="alert alert-error">{errors.general}</div>
        )}

        <div className="form-group">
          <label htmlFor="email" className="form-label">Email Address</label>
          <div className="input-wrapper">
            <span className="input-icon">✉</span>
            <input
              id="email"
              type="email"
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          {errors.email && <span className="error-msg">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">Password</label>
          <div className="input-wrapper">
            <span className="input-icon">🔑</span>
            <input
              id="password"
              type={showPwd ? 'text' : 'password'}
              className={`form-input ${errors.password ? 'input-error' : ''}`}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="pwd-toggle"
              onClick={() => setShowPwd(v => !v)}
              aria-label="Toggle password visibility"
            >
              {showPwd ? '🙈' : '👁'}
            </button>
          </div>
          {errors.password && <span className="error-msg">{errors.password}</span>}
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <span className="spinner" /> : 'Sign In'}
        </button>

        <div className="encryption-badge">
          <span>🛡</span> Data encrypted with AES-256 (2-layer)
        </div>
      </form>

      <div className="auth-footer">
        <p>Don't have an account?{' '}
          <button type="button" className="link-btn" onClick={onSwitchToRegister}>
            Register here
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;