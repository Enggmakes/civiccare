import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Building2, Sparkles } from 'lucide-react';
import type { AdminUser } from '../types';

interface AdminLoginProps {
  onLoginSuccess: (user: AdminUser) => void;
}

const PRESET_USERS: AdminUser[] = [
  {
    id: 'admin-01',
    name: 'Rajesh Kulkarni',
    email: 'admin@municipal.gov.in',
    role: 'superadmin',
    department: 'Municipal Corporation HQ',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'admin-02',
    name: 'Suresh More',
    email: 'roads@municipal.gov.in',
    role: 'dept_admin',
    department: 'Road Maintenance Dept.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'admin-03',
    name: 'Sunita Deshmukh',
    email: 'sanitation@municipal.gov.in',
    role: 'dept_admin',
    department: 'Solid Waste Management Dept.',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'admin-04',
    name: 'Amitabh Sen',
    email: 'electrical@municipal.gov.in',
    role: 'dept_admin',
    department: 'Electrical & Lighting Dept.',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
];

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@municipal.gov.in');
  const [password, setPassword] = useState('Admin@2026#Civic');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide your department email and password.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // Find matching preset user or synthesize one
      const matchedUser = PRESET_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
      const userToLogin: AdminUser = matchedUser || {
        id: 'admin-custom',
        name: email.split('@')[0].toUpperCase() + ' (Officer)',
        email: email,
        role: 'dept_admin',
        department: 'Municipal Operations Unit',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      };

      setLoading(false);
      onLoginSuccess(userToLogin);
    }, 600);
  };

  const handleSelectPreset = (preset: AdminUser) => {
    setEmail(preset.email);
    setPassword('Admin@2026#Civic');
    setError('');
  };

  return (
    <div style={styles.pageBackground}>
      {/* Decorative ambient lights */}
      <div style={styles.ambientGlowTop} />
      <div style={styles.ambientGlowBottom} />

      {/* Main Dual-Panel Login Container matching Screen 18 */}
      <div style={styles.loginModal}>
        {/* Left Side: Brand Visual Card */}
        <div style={styles.leftBanner}>
          {/* Top Logo & Heading */}
          <div style={styles.leftTopBrand}>
            <div style={styles.logoRow}>
              <img
                src="/assets/logo.png"
                alt="CivicCare Logo"
                style={styles.logoMark}
              />
            </div>
            <h1 style={styles.brandTitle}>CivicCare</h1>
            <p style={styles.brandSubtitle}>Municipal Portal</p>
            <p style={styles.brandTagline}>Manage. Resolve. Build a Better City.</p>
          </div>

          {/* Bottom Illustration: Building & Trees */}
          <div style={styles.illustrationWrapper}>
            <img
              src="/assets/admin_welcome_banner.png"
              alt="Municipal Glass Building Headquarters"
              style={styles.bannerImage}
            />
            <div style={styles.illustrationOverlay} />
          </div>
        </div>

        {/* Right Side: Sign-In Form matching Screen 18 */}
        <div style={styles.rightFormPanel}>
          <div style={styles.formHeader}>
            <h2 style={styles.welcomeHeading}>Welcome Back</h2>
            <p style={styles.welcomeSubtitle}>Sign in to your department account</p>
          </div>

          {error && <div style={styles.errorAlert}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Email Field */}
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Email</label>
              <div style={styles.inputWrapper}>
                <Mail size={18} style={styles.inputIcon} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@municipal.gov.in"
                  required
                  style={styles.textInput}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Password</label>
              <div style={styles.inputWrapper}>
                <Lock size={18} style={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  style={styles.textInput}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  tabIndex={-1}>
                  {showPassword ? <EyeOff size={18} color="#94A3B8" /> : <Eye size={18} color="#94A3B8" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password Row */}
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
                onClick={() => alert('Password reset instructions sent to registered government email.')}
                style={styles.forgotLink}>
                Forgot password?
              </button>
            </div>

            {/* Primary Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.signInButton,
                opacity: loading ? 0.75 : 1,
              }}>
              {loading ? (
                <span>Authenticating Officer...</span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  Sign In <ArrowRight size={18} />
                </span>
              )}
            </button>
          </form>

          {/* Quick Demo Department Login Shortcuts */}
          <div style={styles.demoSection}>
            <div style={styles.demoHeader}>
              <Sparkles size={14} color="#0066FF" />
              <span>Quick Demo Department Access:</span>
            </div>
            <div style={styles.presetGrid}>
              {PRESET_USERS.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelectPreset(user)}
                  style={{
                    ...styles.presetPill,
                    borderColor: email === user.email ? '#0066FF' : '#E2E8F0',
                    backgroundColor: email === user.email ? '#EFF6FF' : '#F8FAFC',
                  }}>
                  <Building2 size={13} color={email === user.email ? '#0066FF' : '#64748B'} />
                  <span>{user.department.replace(' Dept.', '').replace(' Department', '')}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Security Badge */}
          <div style={styles.securityFooter}>
            <ShieldCheck size={14} color="#10B981" />
            <span>GovNet 256-bit Encrypted Session · ISO/IEC 27001 Certified Municipal Gateway</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  pageBackground: {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#07101E',
    backgroundImage: 'radial-gradient(circle at 50% 15%, #0F284E 0%, #07101E 75%)',
    position: 'relative',
    overflow: 'hidden',
    padding: '24px',
  },
  ambientGlowTop: {
    position: 'absolute',
    top: '-150px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '600px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(0, 102, 255, 0.25) 0%, rgba(0, 102, 255, 0) 70%)',
    pointerEvents: 'none',
  },
  ambientGlowBottom: {
    position: 'absolute',
    bottom: '-200px',
    right: '10%',
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0) 70%)',
    pointerEvents: 'none',
  },
  loginModal: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    maxWidth: '1040px',
    minHeight: '620px',
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08)',
    position: 'relative',
    zIndex: 10,
  },
  leftBanner: {
    flex: '1 1 48%',
    backgroundColor: '#08172D',
    background: 'linear-gradient(180deg, #091931 0%, #061122 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
    padding: '44px 36px 0 36px',
    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
  },
  leftTopBrand: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    zIndex: 5,
  },
  logoRow: {
    marginBottom: '10px',
  },
  logoMark: {
    width: '68px',
    height: '48px',
    objectFit: 'contain',
    filter: 'drop-shadow(0 4px 12px rgba(0, 102, 255, 0.4))',
  },
  brandTitle: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: '-0.5px',
    marginBottom: '4px',
  },
  brandSubtitle: {
    fontSize: '17px',
    fontWeight: '600',
    color: '#93C5FD',
    marginBottom: '12px',
    letterSpacing: '0.2px',
  },
  brandTagline: {
    fontSize: '15px',
    color: '#E2E8F0',
    fontWeight: '500',
    maxWidth: '280px',
    lineHeight: '1.4',
  },
  illustrationWrapper: {
    width: '100%',
    height: '320px',
    position: 'relative',
    marginTop: 'auto',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'bottom center',
    borderTopLeftRadius: '16px',
    borderTopRightRadius: '16px',
  },
  illustrationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '70px',
    background: 'linear-gradient(180deg, #091931 0%, rgba(9, 25, 49, 0) 100%)',
    pointerEvents: 'none',
  },
  rightFormPanel: {
    flex: '1 1 52%',
    backgroundColor: '#FFFFFF',
    padding: '48px 44px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  formHeader: {
    marginBottom: '28px',
  },
  welcomeHeading: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: '-0.5px',
    marginBottom: '6px',
  },
  welcomeSubtitle: {
    fontSize: '14px',
    color: '#64748B',
    fontWeight: '500',
  },
  errorAlert: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    border: '1px solid #FECACA',
    borderRadius: '10px',
    padding: '10px 14px',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  inputLabel: {
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
    color: '#94A3B8',
    pointerEvents: 'none',
  },
  textInput: {
    width: '100%',
    padding: '12px 14px 12px 42px',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    backgroundColor: '#FFFFFF',
    fontSize: '14px',
    color: '#0F172A',
    outline: 'none',
    transition: 'all 0.15s ease',
  },
  eyeButton: {
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
  forgotLink: {
    background: 'none',
    border: 'none',
    color: '#0066FF',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
    padding: 0,
  },
  signInButton: {
    backgroundColor: '#0066FF',
    color: '#FFFFFF',
    padding: '13px',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(0, 102, 255, 0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '6px',
    transition: 'all 0.2s ease',
  },
  demoSection: {
    marginTop: '28px',
    paddingTop: '20px',
    borderTop: '1px solid #F1F5F9',
  },
  demoHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#475569',
    marginBottom: '10px',
  },
  presetGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  presetPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 10px',
    borderRadius: '8px',
    border: '1px solid #E2E8F0',
    fontSize: '11px',
    fontWeight: '600',
    color: '#334155',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  securityFooter: {
    marginTop: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: '#94A3B8',
    justifyContent: 'center',
  },
};
