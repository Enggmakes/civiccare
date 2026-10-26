import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  MapPin,
  Building2,
  BarChart3,
  Settings,
  LogOut,
  Sun,
  Moon,
  Shield,
} from 'lucide-react';
import type { AdminUser } from '../types';

interface AdminSidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  adminUser: AdminUser;
  onLogout: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onTabChange,
  adminUser,
  onLogout,
  isDark,
  onToggleTheme,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'reports', label: 'Reports', icon: ClipboardList },
    { id: 'map', label: 'Map View', icon: MapPin },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside style={styles.sidebar}>
      {/* Brand Header matching Screen 19 */}
      <div style={styles.brandContainer}>
        <div style={styles.logoMarkWrapper}>
          <img
            src="/assets/logo.png"
            alt="CivicCare"
            style={styles.logoImage}
          />
        </div>
        <div style={styles.brandTextGroup}>
          <div style={styles.brandName}>CivicCare</div>
          <div style={styles.portalBadge}>Admin Portal</div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={styles.navMenu}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              style={{
                ...styles.navButton,
                backgroundColor: isActive ? 'var(--brand-primary)' : 'transparent',
                color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
              }}>
              <Icon size={20} color={isActive ? '#FFFFFF' : 'currentColor'} />
              <span>{item.label}</span>
              {item.id === 'reports' && (
                <span style={styles.navCountBadge}>Live</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Controls: Theme Toggle & User Info & Logout */}
      <div style={styles.footerContainer}>
        <button
          onClick={onToggleTheme}
          style={styles.themeToggleBtn}
          title="Toggle Light/Dark Theme">
          {isDark ? <Sun size={17} color="#FBBF24" /> : <Moon size={17} color="#64748B" />}
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <div style={styles.userInfoCard}>
          <img
            src={adminUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={adminUser.name}
            style={styles.userAvatar}
          />
          <div style={styles.userMeta}>
            <div style={styles.userName}>{adminUser.name}</div>
            <div style={styles.userDept}>
              <Shield size={11} color="var(--brand-primary)" />
              <span>{adminUser.role === 'superadmin' ? 'Super Admin' : 'Dept Officer'}</span>
            </div>
          </div>
          <button
            onClick={onLogout}
            style={styles.logoutBtn}
            title="Sign Out">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: '260px',
    minWidth: '260px',
    height: '100vh',
    backgroundColor: 'var(--bg-surface)',
    borderRight: '1px solid var(--border-light)',
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: 0,
    zIndex: 30,
    transition: 'background-color 0.2s ease, border-color 0.2s ease',
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '24px 20px',
    borderBottom: '1px solid var(--border-light)',
  },
  logoMarkWrapper: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    backgroundColor: '#EFF6FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    border: '1px solid #DBEAFE',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  brandTextGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  brandName: {
    fontSize: '18px',
    fontWeight: '800',
    color: 'var(--text-main)',
    letterSpacing: '-0.3px',
    lineHeight: '1.2',
  },
  portalBadge: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--brand-primary)',
    letterSpacing: '0.2px',
  },
  navMenu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '16px 12px',
    flex: 1,
    overflowY: 'auto',
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    textAlign: 'left',
    transition: 'all 0.15s ease',
    position: 'relative',
  },
  navCountBadge: {
    marginLeft: 'auto',
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '9999px',
    backgroundColor: '#10B981',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  footerContainer: {
    padding: '16px 14px',
    borderTop: '1px solid var(--border-light)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  themeToggleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '9px 12px',
    borderRadius: '10px',
    backgroundColor: 'var(--bg-surface-secondary)',
    border: '1px solid var(--border-light)',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-main)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  userInfoCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 10px',
    borderRadius: '12px',
    backgroundColor: 'var(--bg-surface-secondary)',
  },
  userAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  userMeta: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text-main)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userDept: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: '#EF4444',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.15s ease',
  },
};
