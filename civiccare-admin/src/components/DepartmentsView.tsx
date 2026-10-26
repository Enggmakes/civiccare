import React from 'react';
import {
  Mail,
  Shield,
  ArrowUpRight,
} from 'lucide-react';

interface DepartmentsViewProps {
  onSelectDepartment: (deptName: string) => void;
}

const DEPARTMENTS = [
  {
    id: 'road',
    name: 'Road Maintenance Dept.',
    head: "John D'Souza (Platform Domain Lead)",
    email: 'roads@civiccare.com',
    sla: '48 Hours',
    activeTickets: 142,
    resolvedTickets: 512,
    staffCount: 38,
    completionRate: '94.2%',
    color: '#0066FF',
    icon: '🛣️',
  },
  {
    id: 'waste',
    name: 'Solid Waste Management Dept.',
    head: 'Sunita Deshmukh (Waste Operations Desk)',
    email: 'waste@civiccare.com',
    sla: '24 Hours',
    activeTickets: 89,
    resolvedTickets: 420,
    staffCount: 52,
    completionRate: '96.5%',
    color: '#10B981',
    icon: '♻️',
  },
  {
    id: 'lighting',
    name: 'Electrical & Lighting Dept.',
    head: 'Amitabh Sen (Utility Grid Triage)',
    email: 'lighting@civiccare.com',
    sla: '36 Hours',
    activeTickets: 64,
    resolvedTickets: 298,
    staffCount: 24,
    completionRate: '92.1%',
    color: '#F59E0B',
    icon: '💡',
  },
  {
    id: 'water',
    name: 'Water Supply Dept.',
    head: 'Vikram Joshi (Hydrology & Pipelines Triage)',
    email: 'water@civiccare.com',
    sla: '24 Hours',
    activeTickets: 47,
    resolvedTickets: 184,
    staffCount: 31,
    completionRate: '91.8%',
    color: '#06B6D4',
    icon: '🚰',
  },
  {
    id: 'planning',
    name: 'Town Planning & Encroachment',
    head: 'Kavita Rane (Zoning & Civic Escalations)',
    email: 'planning@civiccare.com',
    sla: '72 Hours',
    activeTickets: 28,
    resolvedTickets: 96,
    staffCount: 16,
    completionRate: '88.4%',
    color: '#8B5CF6',
    icon: '🏛️',
  },
];

export const DepartmentsView: React.FC<DepartmentsViewProps> = ({
  onSelectDepartment,
}) => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.pageTitle}>Service Categories & Escalation Directory</h2>
          <p style={styles.pageSubtitle}>
            Category SLAs, domain triage desks, and escalation routing to local authorities & field contractors
          </p>
        </div>
      </div>

      <div style={styles.grid}>
        {DEPARTMENTS.map((dept) => (
          <div key={dept.id} style={styles.card}>
            <div style={styles.cardTop}>
              <div style={styles.deptIconBadge}>
                <span style={{ fontSize: '24px' }}>{dept.icon}</span>
              </div>
              <button
                onClick={() => onSelectDepartment(dept.name)}
                style={styles.openDeptBtn}
                title="Filter Dashboard for this Department">
                <span>View Tickets</span>
                <ArrowUpRight size={14} />
              </button>
            </div>

            <h3 style={styles.deptName}>{dept.name}</h3>
            <div style={styles.deptHeadRow}>
              <Shield size={13} color="var(--brand-primary)" />
              <span>{dept.head}</span>
            </div>

            <div style={styles.emailRow}>
              <Mail size={13} color="var(--text-tertiary)" />
              <span>{dept.email}</span>
            </div>

            <div style={styles.divider} />

            <div style={styles.statsRow}>
              <div style={styles.statCol}>
                <span style={styles.statLabel}>Active</span>
                <span style={{ ...styles.statVal, color: '#D97706' }}>{dept.activeTickets}</span>
              </div>
              <div style={styles.statCol}>
                <span style={styles.statLabel}>Resolved</span>
                <span style={{ ...styles.statVal, color: '#059669' }}>{dept.resolvedTickets}</span>
              </div>
              <div style={styles.statCol}>
                <span style={styles.statLabel}>SLA Benchmark</span>
                <span style={styles.statVal}>{dept.sla}</span>
              </div>
              <div style={styles.statCol}>
                <span style={styles.statLabel}>Success Rate</span>
                <span style={{ ...styles.statVal, color: '#0066FF' }}>{dept.completionRate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pageTitle: {
    fontSize: '22px',
    fontWeight: '800',
    color: 'var(--text-main)',
    letterSpacing: '-0.4px',
  },
  pageSubtitle: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    marginTop: '2px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: '18px',
    padding: '22px',
    border: '1px solid var(--border-card)',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  cardTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deptIconBadge: {
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    backgroundColor: 'var(--bg-surface-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  openDeptBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#EFF6FF',
    color: '#0066FF',
    border: '1px solid #BFDBFE',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  deptName: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--text-main)',
    marginTop: '4px',
  },
  deptHeadRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-main)',
  },
  emailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--border-light)',
    margin: '4px 0',
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '6px',
  },
  statCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  statLabel: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontWeight: '600',
  },
  statVal: {
    fontSize: '14px',
    fontWeight: '800',
    color: 'var(--text-main)',
  },
};
