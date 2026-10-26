import React, { useState } from 'react';
import {
  Bell,
  Search,
  Building,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
} from 'lucide-react';
import type { AdminUser, CivicReport } from '../types';

interface AdminHeaderProps {
  adminUser: AdminUser;
  selectedDepartment: string;
  onDepartmentChange: (dept: string) => void;
  reports: CivicReport[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectReport: (report: CivicReport) => void;
}

const DEPARTMENTS = [
  'All Categories & Services',
  'Road Maintenance',
  'Solid Waste Management',
  'Electrical & Lighting',
  'Water Supply & Drainage',
];

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  adminUser,
  selectedDepartment,
  onDepartmentChange,
  reports,
  searchQuery,
  onSearchChange,
  onSelectReport,
}) => {
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const pendingCount = reports.filter((r) => r.status === 'Pending').length;
  const criticalCount = reports.filter((r) => r.severity === 'High' || r.severity === 'Critical').length;

  return (
    <header style={styles.header}>
      {/* Left: Service Domain Switcher */}
      <div style={styles.leftSection}>
        <div style={styles.deptSelectorWrapper}>
          <button
            onClick={() => setShowDeptDropdown(!showDeptDropdown)}
            style={styles.deptButton}>
            <div style={styles.deptIconBadge}>
              <Building size={16} color="var(--brand-primary)" />
            </div>
            <div style={styles.deptTextCol}>
              <span style={styles.deptLabel}>Service Domain</span>
              <span style={styles.deptCurrent}>{selectedDepartment}</span>
            </div>
            <ChevronDown size={16} color="var(--text-muted)" />
          </button>

          {showDeptDropdown && (
            <div style={styles.dropdownMenu}>
              {DEPARTMENTS.map((dept) => (
                <button
                  key={dept}
                  onClick={() => {
                    onDepartmentChange(dept);
                    setShowDeptDropdown(false);
                  }}
                  style={{
                    ...styles.dropdownItem,
                    backgroundColor: selectedDepartment === dept ? 'var(--bg-surface-secondary)' : 'transparent',
                    color: selectedDepartment === dept ? 'var(--brand-primary)' : 'var(--text-main)',
                    fontWeight: selectedDepartment === dept ? 700 : 500,
                  }}>
                  <span>{dept}</span>
                  {selectedDepartment === dept && <CheckCircle2 size={16} color="var(--brand-primary)" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Realtime Status Indicator */}
        <div style={styles.realtimePill}>
          <span style={styles.realtimeDot} />
          <span>Realtime Live</span>
        </div>
      </div>

      {/* Center: Quick Search Input */}
      <div style={styles.searchContainer}>
        <Search size={16} color="var(--text-tertiary)" style={styles.searchIcon} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search ticket #, ward, defect..."
          style={styles.searchInput}
        />
      </div>

      {/* Right Section: Notifications & Admin Profile */}
      <div style={styles.rightSection}>
        {/* Notification Bell */}
        <div style={styles.notifyWrapper}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={styles.iconButton}
            title="Notifications">
            <Bell size={19} color="var(--text-main)" />
            {pendingCount > 0 && <span style={styles.notificationBadge}>{pendingCount}</span>}
          </button>

          {showNotifications && (
            <div style={styles.notificationDropdown}>
              <div style={styles.notifyHeader}>
                <div style={styles.notifyTitle}>Live Grievances Feed</div>
                <div style={styles.notifySubtitle}>{criticalCount} high priority items</div>
              </div>
              <div style={styles.notifyList}>
                {reports.slice(0, 4).map((r) => (
                  <div
                    key={r.id}
                    onClick={() => {
                      onSelectReport(r);
                      setShowNotifications(false);
                    }}
                    style={styles.notifyItem}>
                    <div style={styles.notifyIconBox}>
                      {r.severity === 'High' ? (
                        <AlertTriangle size={16} color="#DC2626" />
                      ) : (
                        <Clock size={16} color="#0284C7" />
                      )}
                    </div>
                    <div style={styles.notifyBody}>
                      <div style={styles.notifyItemTitle}>{r.title}</div>
                      <div style={styles.notifyItemMeta}>
                        <span>{r.ticket_number}</span> · <span>{r.category_id}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Mini Profile matching Screen 19 */}
        <div style={styles.profileBadge}>
          <img
            src={adminUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={adminUser.name}
            style={styles.profileAvatar}
          />
          <div style={styles.profileInfo}>
            <div style={styles.profileName}>{adminUser.name}</div>
            <div style={styles.profileRole}>
              <Sparkles size={11} color="#059669" />
              <span>Verified Officer</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const styles: Record<string, React.CSSProperties> = {
  header: {
    height: '74px',
    backgroundColor: 'var(--bg-surface)',
    borderBottom: '1px solid var(--border-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 28px',
    position: 'sticky',
    top: 0,
    zIndex: 25,
    gap: '20px',
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  deptSelectorWrapper: {
    position: 'relative',
  },
  deptButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'var(--bg-surface-secondary)',
    border: '1px solid var(--border-light)',
    borderRadius: '12px',
    padding: '7px 14px',
    cursor: 'pointer',
    textAlign: 'left',
  },
  deptIconBadge: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: '#EFF6FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deptTextCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  deptLabel: {
    fontSize: '10px',
    fontWeight: '600',
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  deptCurrent: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: 0,
    minWidth: '260px',
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '14px',
    border: '1px solid var(--border-light)',
    boxShadow: 'var(--shadow-lg)',
    padding: '6px',
    zIndex: 50,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    textAlign: 'left',
    transition: 'background-color 0.15s ease',
  },
  realtimePill: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#059669',
    backgroundColor: '#ECFDF5',
    border: '1px solid #A7F3D0',
    padding: '5px 10px',
    borderRadius: '9999px',
  },
  realtimeDot: {
    width: '7px',
    height: '7px',
    backgroundColor: '#10B981',
    borderRadius: '50%',
    boxShadow: '0 0 8px #10B981',
  },
  searchContainer: {
    flex: 1,
    maxWidth: '380px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '9px 14px 9px 36px',
    borderRadius: '10px',
    border: '1px solid var(--border-light)',
    backgroundColor: 'var(--bg-surface-secondary)',
    color: 'var(--text-main)',
    fontSize: '13px',
    outline: 'none',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  notifyWrapper: {
    position: 'relative',
  },
  iconButton: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: 'var(--bg-surface-secondary)',
    border: '1px solid var(--border-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    backgroundColor: '#EF4444',
    color: '#FFFFFF',
    fontSize: '10px',
    fontWeight: '800',
    minWidth: '18px',
    height: '18px',
    borderRadius: '9999px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
    border: '2px solid var(--bg-surface)',
  },
  notificationDropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    width: '320px',
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '16px',
    border: '1px solid var(--border-light)',
    boxShadow: 'var(--shadow-xl)',
    overflow: 'hidden',
    zIndex: 50,
  },
  notifyHeader: {
    padding: '14px 16px',
    borderBottom: '1px solid var(--border-light)',
    backgroundColor: 'var(--bg-surface-secondary)',
  },
  notifyTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  notifySubtitle: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginTop: '2px',
  },
  notifyList: {
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '280px',
    overflowY: 'auto',
  },
  notifyItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px 16px',
    borderBottom: '1px solid var(--border-light)',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  notifyIconBox: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-surface-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '2px',
  },
  notifyBody: {
    flex: 1,
    minWidth: 0,
  },
  notifyItemTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-main)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  notifyItemMeta: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginTop: '2px',
  },
  profileBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  profileAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid var(--brand-primary)',
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  profileName: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text-main)',
    lineHeight: '1.2',
  },
  profileRole: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    color: '#059669',
    fontWeight: '600',
  },
};
