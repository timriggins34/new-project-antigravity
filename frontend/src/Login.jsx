import React, { useState } from 'react';
import { Copyleft, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('tf_token', data.token);
        localStorage.setItem('tf_user', JSON.stringify(data.user));
        onLogin(data.user, data.token);
      } else {
        setError(data.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Cannot connect to server. Please ensure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card glass-card">
        <div className="login-header">
          <div className="logo-icon-large">
            <Copyleft size={32} />
          </div>
          <h1>TradeFlow <span>CHA</span></h1>
          <p>Internal Operations Management</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="login-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? 'Authenticating...' : (
              <>
                Sign In <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>© 2026 TradeFlow Logistics Solutions</p>
          <div className="badge">Internal Access Only</div>
        </div>
      </div>

      <style>{`
        .login-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: #0f172a;
          background-image: 
            radial-gradient(at 0% 0%, rgba(56, 189, 248, 0.1) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(14, 165, 233, 0.1) 0px, transparent 50%);
          padding: 2rem;
          font-family: 'Inter', -apple-system, sans-serif;
        }

        .login-card {
          width: 100%;
          max-width: 400px;
          padding: 2.5rem;
          border-radius: 1.25rem;
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          text-align: center;
        }

        .login-header {
          margin-bottom: 2rem;
        }

        .logo-icon-large {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
          color: white;
          border-radius: 0.875rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.25rem;
          box-shadow: 0 10px 15px -3px rgba(14, 165, 233, 0.4);
        }

        .login-header h1 {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin: 0 0 0.375rem 0;
        }

        .login-header h1 span {
          color: #38bdf8;
        }

        .login-header p {
          color: #94a3b8;
          font-size: 0.8125rem;
          margin: 0;
        }

        .login-form {
          text-align: left;
        }

        .input-group {
          margin-bottom: 1.25rem;
        }

        .input-group label {
          display: block;
          font-size: 0.8125rem;
          font-weight: 500;
          color: #e2e8f0;
          margin-bottom: 0.5rem;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 0.875rem;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
        }

        .input-wrapper input {
          width: 100%;
          padding: 0.625rem 0.875rem 0.625rem 2.5rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.625rem;
          color: white;
          font-size: 0.875rem;
          transition: all 0.2s;
          box-sizing: border-box;
        }

        .input-wrapper input:focus {
          outline: none;
          border-color: #38bdf8;
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.1);
        }

        .login-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 0.875rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 0.625rem;
          color: #f87171;
          font-size: 0.75rem;
          margin-bottom: 1.25rem;
        }

        .login-btn {
          width: 100%;
          padding: 0.75rem;
          background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
          color: white;
          border: none;
          border-radius: 0.625rem;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .login-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 15px -3px rgba(14, 165, 233, 0.3);
        }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .login-footer {
          margin-top: 2.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .login-footer p {
          color: #475569;
          font-size: 0.6875rem;
          margin: 0 0 0.75rem 0;
        }

        .badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: rgba(30, 41, 59, 1);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 2rem;
          color: #94a3b8;
          font-size: 0.5625rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
};

export default Login;
