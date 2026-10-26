import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity,
  ArrowRight,
  Eye,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import type { CivicReport, KPIStats } from '../types';

interface DashboardOverviewProps {
  stats: KPIStats;
  reports: CivicReport[];
  onSelectReport: (report: CivicReport) => void;
  onViewAllReports: () => void;
}

const TREND_DATA = [
  { date: 'Oct 20', submitted: 85, resolved: 65 },
  { date: 'Oct 21', submitted: 112, resolved: 88 },
  { date: 'Oct 22', submitted: 98, resolved: 92 },
  { date: 'Oct 23', submitted: 145, resolved: 110 },
  { date: 'Oct 24', submitted: 160, resolved: 135 },
  { date: 'Oct 25', submitted: 190, resolved: 155 },
  { date: 'Oct 26', submitted: 210, resolved: 180 },
];

const CATEGORY_DATA = [
  { name: 'Pothole', value: 35, color: '#0066FF' },
  { name: 'Garbage', value: 22, color: '#10B981' },
  { name: 'Streetlight', value: 18, color: '#F59E0B' },
  { name: 'Water Leak', value: 12, color: '#06B6D4' },
  { name: 'Broken Road', value: 8, color: '#8B5CF6' },
  { name: 'Others', value: 5, color: '#64748B' },
];

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats,
  reports,
  onSelectReport,
  onViewAllReports,
}) => {
  return (
    <div style={styles.container}>
      {/* 4 KPI Metric Cards matching Screen 19 */}
      <div style={styles.kpiGrid}>
        {/* Total Reports */}
        <div style={styles.kpiCard}>
          <div style={styles.kpiTopRow}>
            <span style={styles.kpiTitle}>Total Reports</span>
            <div style={{ ...styles.kpiIconBox, backgroundColor: '#EFF6FF' }}>
              <Activity size={18} color="#0066FF" />
            </div>
          </div>
          <div style={styles.kpiValueRow}>
            <span style={styles.kpiNumber}>{stats.totalReports.toLocaleString()}</span>
            <div style={{ ...styles.trendBadge, color: '#059669', backgroundColor: '#ECFDF5' }}>
              <TrendingUp size={13} />
              <span>+{stats.totalGrowth}%</span>
            </div>
          </div>
          <span style={styles.kpiFootnote}>Citizen grievances across all wards</span>
        </div>

        {/* Pending */}
        <div style={styles.kpiCard}>
          <div style={styles.kpiTopRow}>
            <span style={styles.kpiTitle}>Pending</span>
            <div style={{ ...styles.kpiIconBox, backgroundColor: '#FEF3C7' }}>
              <Clock size={18} color="#D97706" />
            </div>
          </div>
          <div style={styles.kpiValueRow}>
            <span style={styles.kpiNumber}>{stats.pendingReports.toLocaleString()}</span>
            <div style={{ ...styles.trendBadge, color: '#DC2626', backgroundColor: '#FEE2E2' }}>
              <TrendingDown size={13} />
              <span>{stats.pendingGrowth}%</span>
            </div>
          </div>
          <span style={styles.kpiFootnote}>Awaiting department triage</span>
        </div>

        {/* In-Progress */}
        <div style={styles.kpiCard}>
          <div style={styles.kpiTopRow}>
            <span style={styles.kpiTitle}>In-Progress</span>
            <div style={{ ...styles.kpiIconBox, backgroundColor: '#E0F2FE' }}>
              <AlertCircle size={18} color="#0284C7" />
            </div>
          </div>
          <div style={styles.kpiValueRow}>
            <span style={styles.kpiNumber}>{stats.inProgressReports.toLocaleString()}</span>
            <div style={{ ...styles.trendBadge, color: '#0284C7', backgroundColor: '#E0F2FE' }}>
              <TrendingUp size={13} />
              <span>+{stats.inProgressGrowth}%</span>
            </div>
          </div>
          <span style={styles.kpiFootnote}>Field officers actively working</span>
        </div>

        {/* Resolved */}
        <div style={styles.kpiCard}>
          <div style={styles.kpiTopRow}>
            <span style={styles.kpiTitle}>Resolved</span>
            <div style={{ ...styles.kpiIconBox, backgroundColor: '#D1FAE5' }}>
              <CheckCircle2 size={18} color="#059669" />
            </div>
          </div>
          <div style={styles.kpiValueRow}>
            <span style={styles.kpiNumber}>{stats.resolvedReports.toLocaleString()}</span>
            <div style={{ ...styles.trendBadge, color: '#059669', backgroundColor: '#ECFDF5' }}>
              <TrendingUp size={13} />
              <span>+{stats.resolvedGrowth}%</span>
            </div>
          </div>
          <span style={styles.kpiFootnote}>Redressed & citizen verified</span>
        </div>
      </div>

      {/* Charts Section matching Screen 19 */}
      <div style={styles.chartsGrid}>
        {/* Reports Trend Line Chart */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <div>
              <h3 style={styles.chartTitle}>Reports Trend</h3>
              <p style={styles.chartSubtitle}>Intake volume vs Redressed complaints</p>
            </div>
            <div style={styles.chartLegend}>
              <div style={styles.legendItem}>
                <span style={{ ...styles.legendDot, backgroundColor: '#0066FF' }} />
                <span>Submitted</span>
              </div>
              <div style={styles.legendItem}>
                <span style={{ ...styles.legendDot, backgroundColor: '#10B981' }} />
                <span>Resolved</span>
              </div>
            </div>
          </div>

          <div style={styles.chartCanvasWrapper}>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0066FF" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#0066FF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" opacity={0.6} />
                <XAxis dataKey="date" stroke="var(--text-tertiary)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-tertiary)" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-light)',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-lg)',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="submitted"
                  stroke="#0066FF"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorSubmitted)"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorResolved)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reports by Category Donut Chart */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <div>
              <h3 style={styles.chartTitle}>Reports by Category</h3>
              <p style={styles.chartSubtitle}>Distribution of defect types</p>
            </div>
          </div>

          <div style={styles.donutCanvasWrapper}>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={CATEGORY_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value">
                  {CATEGORY_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => `${val}%`}
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-light)',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-lg)',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                />
                <Legend
                  verticalAlign="middle"
                  align="right"
                  layout="vertical"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px', fontWeight: 600 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Triage Feed / Quick Action Table matching Screen 19 */}
      <div style={styles.recentSection}>
        <div style={styles.recentHeader}>
          <div>
            <h3 style={styles.recentTitle}>Live Grievances Stream</h3>
            <p style={styles.recentSubtitle}>Real-time citizen reports monitored for verification and escalation</p>
          </div>
          <button onClick={onViewAllReports} style={styles.viewAllButton}>
            <span>View All Reports</span>
            <ArrowRight size={15} />
          </button>
        </div>

        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Issue Title</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Severity</th>
                <th style={styles.th}>Location</th>
                <th style={styles.th}>Status</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.slice(0, 5).map((report) => (
                <tr key={report.id} style={styles.tr}>
                  <td style={styles.tdId}>{report.ticket_number}</td>
                  <td style={styles.td}>
                    <div style={styles.issueTitleBox}>
                      <img
                        src={report.primary_image_url || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=100&auto=format&fit=crop&q=80'}
                        alt={report.title}
                        style={styles.tableThumb}
                      />
                      <span style={styles.issueTitleText}>{report.title}</span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.categoryTag}>{report.category_id}</span>
                  </td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.severityTag,
                        backgroundColor:
                          report.severity === 'High' ? '#FEE2E2' : report.severity === 'Medium' ? '#FEF3C7' : '#EFF6FF',
                        color:
                          report.severity === 'High' ? '#DC2626' : report.severity === 'Medium' ? '#D97706' : '#2563EB',
                      }}>
                      {report.severity}
                    </span>
                  </td>
                  <td style={styles.tdLocation}>{report.formatted_address.split(',')[0]}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.statusTag,
                        backgroundColor:
                          report.status === 'Resolved'
                            ? '#D1FAE5'
                            : report.status === 'In Progress'
                            ? '#E0F2FE'
                            : '#FEF3C7',
                        color:
                          report.status === 'Resolved'
                            ? '#059669'
                            : report.status === 'In Progress'
                            ? '#0284C7'
                            : '#D97706',
                      }}>
                      {report.status}
                    </span>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'right' }}>
                    <button
                      onClick={() => onSelectReport(report)}
                      style={styles.actionBtn}
                      title="Inspect & Update">
                      <Eye size={15} />
                      <span>Triage</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '18px',
  },
  kpiCard: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: '18px',
    padding: '20px 22px',
    border: '1px solid var(--border-card)',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  kpiTopRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kpiTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-muted)',
  },
  kpiIconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValueRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '2px',
  },
  kpiNumber: {
    fontSize: '28px',
    fontWeight: '800',
    color: 'var(--text-main)',
    letterSpacing: '-0.5px',
  },
  trendBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '9999px',
  },
  kpiFootnote: {
    fontSize: '11px',
    color: 'var(--text-tertiary)',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
    gap: '20px',
  },
  chartCard: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: '18px',
    padding: '24px',
    border: '1px solid var(--border-card)',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    flexDirection: 'column',
  },
  chartHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '18px',
  },
  chartTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  chartSubtitle: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginTop: '2px',
  },
  chartLegend: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-muted)',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  legendDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  chartCanvasWrapper: {
    width: '100%',
    height: '260px',
  },
  donutCanvasWrapper: {
    width: '100%',
    height: '260px',
  },
  recentSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  recentHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  recentSubtitle: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginTop: '2px',
  },
  viewAllButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    color: 'var(--brand-primary)',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  tableCard: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: '16px',
    border: '1px solid var(--border-card)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-sm)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  thRow: {
    backgroundColor: 'var(--bg-surface-secondary)',
    borderBottom: '1px solid var(--border-light)',
  },
  th: {
    padding: '12px 18px',
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  tr: {
    borderBottom: '1px solid var(--border-light)',
    transition: 'background-color 0.15s ease',
  },
  td: {
    padding: '14px 18px',
    fontSize: '13px',
    color: 'var(--text-main)',
    verticalAlign: 'middle',
  },
  tdId: {
    padding: '14px 18px',
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--brand-primary)',
    fontFamily: 'monospace',
    verticalAlign: 'middle',
  },
  tdLocation: {
    padding: '14px 18px',
    fontSize: '13px',
    color: 'var(--text-muted)',
    maxWidth: '180px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    verticalAlign: 'middle',
  },
  issueTitleBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  tableThumb: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    objectFit: 'cover',
    border: '1px solid var(--border-light)',
  },
  issueTitleText: {
    fontWeight: '600',
    color: 'var(--text-main)',
  },
  categoryTag: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    backgroundColor: 'var(--bg-surface-secondary)',
    padding: '3px 8px',
    borderRadius: '6px',
  },
  severityTag: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '9999px',
  },
  statusTag: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '9999px',
  },
  actionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#EFF6FF',
    color: '#0066FF',
    border: '1px solid #BFDBFE',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
};
