import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Zap,
  CheckCircle2,
  X,
  Server,
  Activity,
  KeyRound,
  Cpu,
  ShieldCheck,
  Radio,
  Layers,
  Sparkles,
} from 'lucide-react';
import './Login.css';

interface DemoAccount {
  name: string;
  email: string;
  pass: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
  tenant: string;
  desc: string;
}

const DEMO_ACCOUNTS: { tenantName: string; accounts: DemoAccount[] }[] = [
  {
    tenantName: 'Tenant A — Acme Security Corp',
    accounts: [
      {
        name: 'Alice Walker',
        email: 'admin@acme.com',
        pass: 'Admin@123',
        role: 'ADMIN',
        tenant: 'Acme Corp',
        desc: 'Full administrative access, user management, audit trails',
      },
      {
        name: 'Bob Martinez',
        email: 'manager@acme.com',
        pass: 'Manager@123',
        role: 'MANAGER',
        tenant: 'Acme Corp',
        desc: 'Campaign management, incident triage, team assignments',
      },
      {
        name: 'Charlie Hayes',
        email: 'user@acme.com',
        pass: 'User@123',
        role: 'USER',
        tenant: 'Acme Corp',
        desc: 'Assigned campaigns, security event reporting, read-only',
      },
    ],
  },
  {
    tenantName: 'Tenant B — Globex Security Solutions',
    accounts: [
      {
        name: 'Ethan Hunt',
        email: 'admin@globex.com',
        pass: 'Admin@123',
        role: 'ADMIN',
        tenant: 'Globex Sec',
        desc: 'Tenant B Administrator with strictly isolated environment',
      },
      {
        name: 'Frank Castle',
        email: 'user@globex.com',
        pass: 'User@123',
        role: 'USER',
        tenant: 'Globex Sec',
        desc: 'Standard analyst in Globex tenant context',
      },
    ],
  },
];

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [instantLoginLoading, setInstantLoginLoading] = useState<string | null>(null);

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

  const handleInstantDemoLogin = async (demoEmail: string, demoPass: string, roleName: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setInstantLoginLoading(demoEmail);
    try {
      await login(demoEmail, demoPass);
      success(`Logged in as ${roleName}`, `Switched to ${demoEmail} session`);
      setShowDemoModal(false);
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Demo login failed';
      error('Demo Login Error', msg);
    } finally {
      setInstantLoginLoading(null);
    }
  };

  return (
    <div className="login-page-wrapper">
      {/* Background Cyber Mesh & Grid */}
      <div className="login-bg-grid" />

      {/* Floating Animated Cyber Symbols */}
      <div className="floating-symbol floating-symbol-1">
        <Shield size={32} />
      </div>
      <div className="floating-symbol floating-symbol-2">
        <Cpu size={36} />
      </div>
      <div className="floating-symbol floating-symbol-3">
        <Lock size={28} />
      </div>
      <div className="floating-symbol floating-symbol-4">
        <Activity size={34} />
      </div>
      <div className="floating-symbol floating-symbol-5">
        <Server size={26} />
      </div>
      <div className="floating-symbol floating-symbol-6">
        <Sparkles size={30} />
      </div>

      {/* Top Navigation Bar */}
      <header className="login-top-bar">
        <div className="login-top-brand">
          <div className="login-top-brand-icon">
            <ShieldCheck size={22} />
          </div>
          <span>Deep Trace Cybernetics</span>
        </div>

        {/* Top-Right Quick Demo Access Button */}
        <button
          type="button"
          className="quick-demo-btn"
          onClick={() => setShowDemoModal(true)}
          title="Open Demo Accounts Modal"
        >
          <span className="pulse-indicator" />
          <Zap size={16} />
          <span>Quick Demo Access</span>
        </button>
      </header>

      {/* Quick Demo Accounts Modal / Popover */}
      {showDemoModal && (
        <div className="demo-modal-overlay" onClick={() => setShowDemoModal(false)}>
          <div className="demo-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="demo-modal-header">
              <div className="demo-modal-title">
                <KeyRound size={18} color="#2563eb" />
                <span>1-Click Quick Demo Login</span>
              </div>
              <button
                type="button"
                className="demo-modal-close"
                onClick={() => setShowDemoModal(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="demo-modal-body">
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                Select any test account below to <strong>instant-login</strong> and test tenant isolation and RBAC access controls:
              </p>

              {DEMO_ACCOUNTS.map((tenantGroup, idx) => (
                <div key={idx} className="demo-tenant-section">
                  <div className="demo-tenant-badge">
                    <Layers size={14} />
                    <span>{tenantGroup.tenantName}</span>
                  </div>

                  <div className="demo-account-grid">
                    {tenantGroup.accounts.map((account) => {
                      const isLoggingIn = instantLoginLoading === account.email;
                      return (
                        <button
                          key={account.email}
                          type="button"
                          className="demo-account-btn"
                          disabled={!!instantLoginLoading}
                          onClick={() => handleInstantDemoLogin(account.email, account.pass, `${account.name} (${account.role})`)}
                        >
                          <div className="demo-account-name">
                            <span>{account.name}</span>
                            <span
                              className={`demo-account-role ${
                                account.role === 'ADMIN'
                                  ? 'role-admin'
                                  : account.role === 'MANAGER'
                                  ? 'role-manager'
                                  : 'role-user'
                              }`}
                            >
                              {account.role}
                            </span>
                          </div>
                          <span className="demo-account-email">{account.email}</span>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                            {isLoggingIn ? '⚡ Authenticating...' : account.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Split Layout: Left Content & Animated Cards + Right Form */}
      <main className="login-main-container">
        {/* Left Side: Modern Platform Highlights & Live Animation Cards */}
        <section className="login-hero-section">
          <div className="hero-pill-badge">
            <Radio size={14} />
            <span>Zero-Trust Architecture &bull; SOC 2 Type II</span>
          </div>

          <h1 className="hero-title">
            Unified Cloud <span className="hero-title-gradient">Security & Incident</span> Platform
          </h1>

          <p className="hero-subtitle">
            Enterprise-grade multi-tenant threat detection, incident management, automated security campaigns, and real-time audit logging with complete tenant isolation.
          </p>

          {/* Interactive Project Telemetry Animation Cards */}
          <div className="hero-cards-grid">
            {/* Card 1: Threat Prevention Telemetry */}
            <div className="telemetry-card">
              <div className="telemetry-header">
                <div className="telemetry-icon-wrap">
                  <ShieldCheck size={18} />
                </div>
                <div className="telemetry-live-tag">
                  <span className="telemetry-live-dot" />
                  <span>ACTIVE DEFENSE</span>
                </div>
              </div>
              <div className="telemetry-value">99.98%</div>
              <div className="telemetry-label">Real-time Threat Mitigation Rate</div>
            </div>

            {/* Card 2: Tenant Isolation Protocol */}
            <div className="telemetry-card">
              <div className="telemetry-header">
                <div className="telemetry-icon-wrap">
                  <Layers size={18} />
                </div>
                <div className="telemetry-live-tag">
                  <span className="telemetry-live-dot" />
                  <span>ENCRYPTED VAULT</span>
                </div>
              </div>
              <div className="telemetry-value">100% Isolated</div>
              <div className="telemetry-label">Cross-Tenant Zero Data Leakage</div>
            </div>
          </div>

          {/* Feature Badges */}
          <div className="hero-features-row">
            <div className="feature-tag">
              <CheckCircle2 size={15} />
              <span>Multi-Tenant DB Row-Level Security</span>
            </div>
            <div className="feature-tag">
              <CheckCircle2 size={15} />
              <span>Role-Based Granular RBAC</span>
            </div>
            <div className="feature-tag">
              <CheckCircle2 size={15} />
              <span>Immutable Audit Logs</span>
            </div>
          </div>
        </section>

        {/* Right Side: Clean Minimalist Sign-in Card */}
        <section className="login-card-container">
          <div className="login-auth-card">
            <h2 className="login-card-title">Sign In</h2>
            <p className="login-card-desc">Enter your credentials to access your security workspace</p>

            <form onSubmit={handleSubmit}>
              {/* Email Input */}
              <div className="login-input-group">
                <label className="login-input-label" htmlFor="corporate-email">
                  Corporate Email Address
                </label>
                <div className="login-input-wrapper">
                  <Mail size={17} className="login-input-icon" />
                  <input
                    id="corporate-email"
                    type="email"
                    className="login-input-field"
                    placeholder="name@organization.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Input with Eye Toggle */}
              <div className="login-input-group">
                <label className="login-input-label" htmlFor="account-password">
                  Password
                </label>
                <div className="login-input-wrapper">
                  <Lock size={17} className="login-input-icon" />
                  <input
                    id="account-password"
                    type={showPassword ? 'text' : 'password'}
                    className="login-input-field"
                    style={{ paddingRight: '2.75rem' }}
                    placeholder="Enter your security password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="login-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span>Verifying Session...</span>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            {/* Security Guarantee */}
            <div className="security-guarantee">
              <CheckCircle2 size={15} />
              <span>TLS 1.3 256-bit Encrypted Session</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
