import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import type { AdminUser } from '../types';

interface AdminLoginProps {
  onLoginSuccess: (user: AdminUser) => void;
}

const DEFAULT_ADMIN: AdminUser = {
  id: 'admin-01',
  name: 'Rajesh Kulkarni',
  email: 'admin@civiccare.com',
  role: 'superadmin',
  department: 'Platform Operations HQ',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@civiccare.com');
  const [password, setPassword] = useState('Password');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const userToLogin: AdminUser =
        email.toLowerCase() === DEFAULT_ADMIN.email.toLowerCase()
          ? DEFAULT_ADMIN
          : {
              id: 'admin-officer',
              name: email.split('@')[0].toUpperCase(),
              email: email,
              role: 'dept_admin',
              department: 'CivicCare Platform Operations',
              avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            };

      setLoading(false);
      onLoginSuccess(userToLogin);
    }, 350);
  };

  return (
    <div className="login-split-page">
      {/* Left Side: Exact aspect ratio matching first_welcome_web.png with zero crop */}
      <div className="login-left-banner">
        <img
          src="/assets/first_welcome_web.png"
          alt="CivicCare Portal"
          className="login-banner-img"
        />
      </div>

      {/* Right Side: Clean White Full-Screen Section for Form */}
      <div className="login-right-form">
        <div style={styles.formContainer}>
          {/* Header */}
          <div style={styles.headerBlock}>
            <h1 style={styles.welcomeTitle}>Welcome Back</h1>
            <p style={styles.welcomeSubtitle}>Sign in to CivicCare Operations Hub</p>
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Email Field */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <Mail size={18} color="#94A3B8" style={styles.inputIcon} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@civiccare.com"
                  required
                  style={styles.textInput}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <Lock size={18} color="#94A3B8" style={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={styles.textInput}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  tabIndex={-1}
                  aria-label="Toggle password visibility">
                  {showPassword ? <EyeOff size={18} color="#94A3B8" /> : <Eye size={18} color="#94A3B8" />}
                </button>
              </div>
            </div>

            {/* Options Row: Remember Me & Forgot Password */}
            <div style={styles.optionsRow}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={styles.checkbox}
                />
                <span style={styles.checkboxText}>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => alert('Password reset instructions have been sent to your administrator email.')}
                style={styles.forgotBtn}>
                Forgot password?
              </button>
            </div>

            {/* Primary Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.signInBtn,
                opacity: loading ? 0.8 : 1,
              }}>
              {loading ? (
                <span>Signing In...</span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  Sign In <ArrowRight size={18} />
                </span>
              )}
            </button>
          </form>

          {/* Security note */}
          <div style={styles.securityNote}>
            <ShieldCheck size={14} color="#10B981" />
            <span>CivicCare Secure Operations Platform · 256-bit SSL Protected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  formContainer: {
    width: '100%',
    maxWidth: '420px',
    display: 'flex',
    flexDirection: 'column',
  },
  headerBlock: {
    marginBottom: '32px',
  },
  welcomeTitle: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: '-0.6px',
    marginBottom: '8px',
  },
  welcomeSubtitle: {
    fontSize: '15px',
    color: '#64748B',
    fontWeight: '500',
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    border: '1px solid #FECACA',
    borderRadius: '10px',
    padding: '10px 14px',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '18px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    pointerEvents: 'none',
  },
  textInput: {
    width: '100%',
    padding: '13px 14px 13px 44px',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    backgroundColor: '#FFFFFF',
    fontSize: '14px',
    color: '#0F172A',
    outline: 'none',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '13px',
    marginTop: '-4px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    userSelect: 'none',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    accentColor: '#0066FF',
    cursor: 'pointer',
  },
  checkboxText: {
    color: '#475569',
    fontWeight: '500',
  },
  forgotBtn: {
    background: 'none',
    border: 'none',
    color: '#0066FF',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
    padding: 0,
  },
  signInBtn: {
    backgroundColor: '#0066FF',
    color: '#FFFFFF',
    padding: '14px',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 6px 16px rgba(0, 102, 255, 0.32)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '8px',
    transition: 'all 0.15s ease',
  },
  securityNote: {
    marginTop: '36px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: '#94A3B8',
    justifyContent: 'center',
  },
};
