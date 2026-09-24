import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Shield, Lock, Mail, ArrowRight, KeyRound } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Validation Error', 'Please enter both email and password');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      success('Authentication Successful', 'Welcome to the Security Management Platform');
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Invalid email or password';
      error('Authentication Failed', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        background: `radial-gradient(circle at 50% 20%, rgba(14, 165, 233, 0.08) 0%, transparent 60%),
                     radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.06) 0%, transparent 50%),
                     #080c14`,
      }}
    >
      <div style={{ maxWidth: '460px', width: '100%' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              boxShadow: '0 0 25px rgba(14, 165, 233, 0.4)',
            }}
          >
            <Shield size={28} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
            Deep Trace Cybernetics
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Multi-Tenant Security Operations Platform
          </p>
        </div>

        {/* Login Form Card */}
        <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.8)' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>Account Sign In</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email-input">
                Corporate Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input
                  id="email-input"
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="name@organization.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password-input">
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input
                  id="password-input"
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'Authenticating...'
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Quick 1-Click Demo Accounts */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 700 }}>
            <KeyRound size={14} />
            <span>QUICK-LOAD DEMO CREDENTIALS</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.25rem' }}>
              Tenant A (Acme Security):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@acme.com', 'Admin@123')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.72rem', padding: '0.35rem 0.2rem' }}
              >
                Acme Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('manager@acme.com', 'Manager@123')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.72rem', padding: '0.35rem 0.2rem' }}
              >
                Acme Manager
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('user@acme.com', 'User@123')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.72rem', padding: '0.35rem 0.2rem' }}
              >
                Acme User
              </button>
            </div>

            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.4rem' }}>
              Tenant B (Globex Security):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@globex.com', 'Admin@123')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.72rem', padding: '0.35rem 0.2rem' }}
              >
                Globex Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('user@globex.com', 'User@123')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.72rem', padding: '0.35rem 0.2rem' }}
              >
                Globex User
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
