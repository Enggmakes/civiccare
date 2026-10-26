import React, { useState } from 'react';
import {
  Download,
  Eye,
  Search,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { matchesDepartment, type CivicReport } from '../types';

interface ReportsManagementProps {
  reports: CivicReport[];
  onSelectReport: (report: CivicReport) => void;
  selectedDepartment: string;
}

export const ReportsManagement: React.FC<ReportsManagementProps> = ({
  reports,
  onSelectReport,
  selectedDepartment,
}) => {
  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'In Progress' | 'Resolved'>('All');
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');

  // Filter reports
  const filteredReports = reports.filter((r) => {
    // Dept filter
    if (!matchesDepartment(r, selectedDepartment)) {
      return false;
    }
    // Status tab filter
    if (activeTab === 'Pending' && r.status !== 'Pending' && r.status !== 'Submitted') return false;
    if (activeTab === 'In Progress' && r.status !== 'In Progress') return false;
    if (activeTab === 'Resolved' && r.status !== 'Resolved' && r.status !== 'Closed') return false;

    // Category filter
    if (categoryFilter !== 'All' && r.category_id !== categoryFilter) return false;

    // Severity filter
    if (severityFilter !== 'All' && r.severity !== severityFilter) return false;

    // Search query
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchId = r.ticket_number.toLowerCase().includes(q);
      const matchLoc = r.formatted_address.toLowerCase().includes(q);
      if (!matchTitle && !matchId && !matchLoc) return false;
    }

    return true;
  });

  const handleExportCSV = () => {
    const headers = ['Ticket ID,Title,Category,Severity,Status,Location,Subscribers,AI Confidence,Created At\n'];
    const rows = filteredReports.map(
      (r) =>
        `"${r.ticket_number}","${r.title.replace(/"/g, '""')}","${r.category_id}","${r.severity}","${r.status}","${r.formatted_address.replace(/"/g, '""')}","${r.subscriber_count}","${(r.ai_confidence * 100).toFixed(1)}%","${r.created_at}"`
    );
    const blob = new Blob([...headers, rows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CivicCare_Reports_Export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div style={styles.container}>
      {/* Top Header & Export Row */}
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.pageTitle}>Reports Management</h2>
          <p style={styles.pageSubtitle}>
            Review, verify, and escalate citizen civic grievances in real time
          </p>
        </div>
        <button onClick={handleExportCSV} style={styles.exportButton}>
          <Download size={16} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Status Segment Tabs matching Screen 20 */}
      <div style={styles.tabsRow}>
        <div style={styles.segmentedControl}>
          {(['All', 'Pending', 'In Progress', 'Resolved'] as const).map((tab) => {
            const isActive = activeTab === tab;
            const deptReports = reports.filter((r) => matchesDepartment(r, selectedDepartment));
            let count = deptReports.length;
            if (tab === 'Pending') count = deptReports.filter((r) => r.status === 'Pending' || r.status === 'Submitted').length;
            if (tab === 'In Progress') count = deptReports.filter((r) => r.status === 'In Progress').length;
            if (tab === 'Resolved') count = deptReports.filter((r) => r.status === 'Resolved' || r.status === 'Closed').length;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  ...styles.segmentBtn,
                  backgroundColor: isActive ? 'var(--brand-primary)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                  fontWeight: isActive ? 700 : 500,
                }}>
                <span>{tab}</span>
                <span
                  style={{
                    ...styles.tabCount,
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'var(--bg-surface-secondary)',
                    color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                  }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter Controls Row */}
        <div style={styles.filtersGroup}>
          {/* Search Box */}
          <div style={styles.searchBox}>
            <Search size={15} color="var(--text-tertiary)" style={styles.searchIcon} />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search by ID, keyword..."
              style={styles.searchInput}
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={styles.selectFilter}>
            <option value="All">All Categories</option>
            <option value="Pothole">Pothole</option>
            <option value="Garbage">Garbage</option>
            <option value="Streetlight">Streetlight</option>
            <option value="Water Leak">Water Leak</option>
            <option value="Broken Road">Broken Road</option>
            <option value="Others">Others</option>
          </select>

          {/* Severity Dropdown */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            style={styles.selectFilter}>
            <option value="All">All Severities</option>
            <option value="High">High / Critical</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Main Data Table matching Screen 20 */}
      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thRow}>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Image</th>
              <th style={styles.th}>Issue Title</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Severity</th>
              <th style={styles.th}>Location / Ward</th>
              <th style={styles.th}>AI Confidence</th>
              <th style={styles.th}>Status</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={9} style={styles.emptyState}>
                  <AlertTriangle size={32} color="var(--text-tertiary)" />
                  <p style={{ marginTop: '8px', fontWeight: 600 }}>No reports found matching criteria</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Try adjusting your filters or search terms</p>
                </td>
              </tr>
            ) : (
              filteredReports.map((report) => (
                <tr key={report.id} style={styles.tr}>
                  <td style={styles.tdId}>{report.ticket_number}</td>
                  <td style={styles.td}>
                    <img
                      src={report.primary_image_url || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=120&auto=format&fit=crop&q=80'}
                      alt={report.title}
                      style={styles.tableThumb}
                    />
                  </td>
                  <td style={styles.td}>
                    <div style={styles.titleCol}>
                      <span style={styles.reportTitle}>{report.title}</span>
                      <span style={styles.reportDate}>
                        {new Date(report.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.categoryBadge}>{report.category_id}</span>
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
                  <td style={styles.tdLocation}>{report.formatted_address}</td>
                  <td style={styles.td}>
                    <div style={styles.aiConfidenceBadge}>
                      <Sparkles size={12} color="#059669" />
                      <span>{(report.ai_confidence * 100).toFixed(1)}%</span>
                    </div>
                  </td>
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
                      style={styles.triageBtn}>
                      <Eye size={15} />
                      <span>Update</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  headerRow: {
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
  exportButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--brand-primary)',
    color: '#FFFFFF',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 102, 255, 0.25)',
    transition: 'all 0.15s ease',
  },
  tabsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
  },
  segmentedControl: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'var(--bg-surface-secondary)',
    borderRadius: '12px',
    padding: '4px',
    gap: '4px',
    border: '1px solid var(--border-light)',
  },
  segmentBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '7px 14px',
    borderRadius: '9px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'all 0.15s ease',
  },
  tabCount: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 7px',
    borderRadius: '9999px',
  },
  filtersGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  searchBox: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '10px',
    pointerEvents: 'none',
  },
  searchInput: {
    padding: '8px 12px 8px 32px',
    borderRadius: '10px',
    border: '1px solid var(--border-light)',
    backgroundColor: 'var(--bg-surface)',
    color: 'var(--text-main)',
    fontSize: '13px',
    outline: 'none',
    width: '200px',
  },
  selectFilter: {
    padding: '8px 12px',
    borderRadius: '10px',
    border: '1px solid var(--border-light)',
    backgroundColor: 'var(--bg-surface)',
    color: 'var(--text-main)',
    fontSize: '13px',
    fontWeight: '500',
    outline: 'none',
    cursor: 'pointer',
  },
  tableCard: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: '18px',
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
    padding: '14px 18px',
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
    maxWidth: '220px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    verticalAlign: 'middle',
  },
  tableThumb: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    objectFit: 'cover',
    border: '1px solid var(--border-light)',
  },
  titleCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  reportTitle: {
    fontWeight: '600',
    color: 'var(--text-main)',
  },
  reportDate: {
    fontSize: '11px',
    color: 'var(--text-tertiary)',
  },
  categoryBadge: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    backgroundColor: 'var(--bg-surface-secondary)',
    padding: '4px 10px',
    borderRadius: '8px',
    border: '1px solid var(--border-light)',
  },
  severityTag: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '9999px',
  },
  aiConfidenceBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#059669',
    backgroundColor: '#ECFDF5',
    padding: '3px 8px',
    borderRadius: '6px',
    border: '1px solid #A7F3D0',
  },
  statusTag: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '9999px',
  },
  triageBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#EFF6FF',
    color: '#0066FF',
    border: '1px solid #BFDBFE',
    padding: '7px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  emptyState: {
    padding: '48px',
    textAlign: 'center',
    color: 'var(--text-muted)',
  },
};
