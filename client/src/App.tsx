import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import StudentList from './components/StudentList';
import StudentForm from './components/StudentForm';
import './App.css';

type View = 'login' | 'register' | 'dashboard';

const App: React.FC = () => {
  const [view, setView]   = useState<View>('login');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('auth_token');
    if (saved) {
      setToken(saved);
      setView('dashboard');
    }
  }, []);

  const handleLoginSuccess = (newToken: string, _studentId: string) => {
    localStorage.setItem('auth_token', newToken);
    setToken(newToken);
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setView('login');
  };

  return (
    <div className="app">
      {view === 'login' && (
        <div className="auth-page">
          <div className="auth-bg" />
          <LoginForm
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setView('register')}
          />
        </div>
      )}

      {view === 'register' && (
        <div className="auth-page">
          <div className="auth-bg" />
          <div className="auth-card register-card">
            <StudentForm
              mode="create"
              onSuccess={() => { setView('login'); alert('Registration successful — please sign in.'); }}
              onCancel={() => setView('login')}
            />
          </div>
        </div>
      )}

      {view === 'dashboard' && token && (
        <StudentList onLogout={handleLogout} />
      )}
    </div>
  );
};

export default App;