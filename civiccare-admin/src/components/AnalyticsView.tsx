import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import {
  Clock,
  Award,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import type { CivicReport } from '../types';

interface AnalyticsViewProps {
  reports: CivicReport[];
  selectedDepartment: string;
}

const DEPT_PERFORMANCE_DATA = [
  { name: 'Road Maint.', reports: 38, resolved: 32, percentage: '38%' },
  { name: 'Sanitation', reports: 22, resolved: 19, percentage: '22%' },
  { name: 'Electrical', reports: 18, resolved: 16, percentage: '18%' },
  { name: 'Water Supply', reports: 14, resolved: 11, percentage: '14%' },
  { name: 'Others', reports: 8, resolved: 6, percentage: '8%' },
];

const MONTHLY_TREND_DATA = [
  { month: 'Jul', reported: 140, resolved: 120 },
  { month: 'Aug', reported: 185, resolved: 160 },
  { month: 'Sep', reported: 230, resolved: 205 },
  { month: 'Oct', reported: 290, resolved: 265 },
  { month: 'Nov', reported: 340, resolved: 310 },
  { month: 'Dec', reported: 420, resolved: 395 },
];

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  reports: _reports,
  selectedDepartment: _selectedDepartment,
}) => {
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.pageTitle}>Analytics & Department Redressal</h2>
          <p style={styles.pageSubtitle}>
            Cross-department resolution velocity, SLA benchmarks, and monthly grievance patterns
          </p>
        </div>
        <div style={styles.dateBadge}>
          <Calendar size={14} />
          <span>Quarter 4 Benchmark (2026)</span>
        </div>
      </div>

      {/* Top 3 Metric Cards */}
      <div style={styles.metricGrid}>
        <div style={styles.metricCard}>
          <div style={styles.metricTop}>
            <span style={styles.metricLabel}>Average Resolution Time (TAT)</span>
            <div style={{ ...styles.iconBox, backgroundColor: '#EFF6FF' }}>
              <Clock size={18} color="#0066FF" />
            </div>
          </div>
          <div style={styles.metricValue}>28.4 hrs</div>
          <div style={styles.metricSub}>-4.2 hrs faster than 48h SLA</div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricTop}>
            <span style={styles.metricLabel}>Citizen Satisfaction Rate</span>
            <div style={{ ...styles.iconBox, backgroundColor: '#ECFDF5' }}>
              <Award size={18} color="#10B981" />
            </div>
          </div>
          <div style={styles.metricValue}>94.8%</div>
          <div style={styles.metricSub}>+3.6% positive ratings after AI triage</div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricTop}>
            <span style={styles.metricLabel}>AI Auto-Routing Accuracy</span>
            <div style={{ ...styles.iconBox, backgroundColor: '#FDF4FF' }}>
              <CheckCircle2 size={18} color="#A855F7" />
            </div>
          </div>
          <div style={styles.metricValue}>97.2%</div>
          <div style={styles.metricSub}>Zero manual dispatch re-routes needed</div>
        </div>
      </div>

      {/* Dual Charts Grid matching Screen 23 */}
      <div style={styles.chartsGrid}>
        {/* Reports by Department Bar Chart matching Screen 23 */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Reports by Department</h3>
            <span style={styles.chartSubtitle}>Intake share and completion count</span>
          </div>

          <div style={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={DEPT_PERFORMANCE_DATA} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" opacity={0.6} />
                <XAxis dataKey="name" stroke="var(--text-tertiary)" fontSize={12} tickLine={false} />
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
                <Bar dataKey="reports" fill="#0066FF" radius={[6, 6, 0, 0]} name="Received" />
                <Bar dataKey="resolved" fill="#10B981" radius={[6, 6, 0, 0]} name="Resolved" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend Line Chart matching Screen 23 */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Monthly Trend</h3>
            <span style={styles.chartSubtitle}>Reported vs Resolved progression</span>
          </div>

          <div style={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={MONTHLY_TREND_DATA} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" opacity={0.6} />
                <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={12} tickLine={false} />
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
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />
                <Line
                  type="monotone"
                  dataKey="reported"
                  stroke="#0066FF"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  name="Reported"
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  name="Resolved"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
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
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
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
  dateBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--bg-surface-secondary)',
    border: '1px solid var(--border-light)',
    padding: '8px 14px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-muted)',
  },
  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '18px',
  },
  metricCard: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: '16px',
    padding: '20px 22px',
    border: '1px solid var(--border-card)',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  metricTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-muted)',
  },
  iconBox: {
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: '26px',
    fontWeight: '800',
    color: 'var(--text-main)',
    letterSpacing: '-0.5px',
  },
  metricSub: {
    fontSize: '11px',
    color: '#059669',
    fontWeight: '600',
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
    marginBottom: '16px',
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
  chartWrapper: {
    width: '100%',
    height: '280px',
  },
};
