import React, { useState } from 'react';
import {
  X,
  Sparkles,
  MapPin,
  Clock,
  User,
  CheckCircle2,
  Save,
  MessageSquare,
} from 'lucide-react';
import type { CivicReport, ReportStatus, SeverityLevel } from '../types';

interface UpdateReportDrawerProps {
  report: CivicReport | null;
  onClose: () => void;
  onSaveUpdate: (
    reportId: string,
    newStatus: ReportStatus,
    remarks: string,
    assignedTo: string,
    severity: SeverityLevel
  ) => Promise<void>;
}

const FIELD_STAFF = [
  'Rajesh Kulkarni (Platform Operations Lead)',
  'Suresh More (Roads & Infrastructure Triage)',
  'Sunita Deshmukh (Sanitation Operations Desk)',
  'Priya Sharma (Public Lighting Liaison)',
  'Vikram Joshi (Water & Drainage Liaison)',
  'CivicCare Field Quality Auditor',
];

export const UpdateReportDrawer: React.FC<UpdateReportDrawerProps> = ({
  report,
  onClose,
  onSaveUpdate,
}) => {
  if (!report) return null;

  const [status, setStatus] = useState<ReportStatus>(report.status);
  const [assignedTo, setAssignedTo] = useState<string>(
    report.assigned_to || FIELD_STAFF[0]
  );
  const [severity, setSeverity] = useState<SeverityLevel>(report.severity);
  const [remarks, setRemarks] = useState<string>(
    report.official_remarks || 'Work order issued. Field team deployed on site.'
  );
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveUpdate(report.id, status, remarks, assignedTo, severity);
      setToastMessage('Report updated successfully and broadcasted in real time!');
      setTimeout(() => {
        setSaving(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  return (
    <div style={styles.backdrop}>
      <div style={styles.drawerCard}>
        {/* Drawer Header matching Screen 22 */}
        <div style={styles.drawerHeader}>
          <div style={styles.headerLeft}>
            <span style={styles.badgeLabel}>Triage & Resolution Workflow</span>
            <h3 style={styles.headerTitle}>Update Report</h3>
          </div>
          <button onClick={onClose} style={styles.closeBtn} title="Close Drawer">
            <X size={20} color="var(--text-muted)" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div style={styles.scrollBody}>
          {toastMessage && (
            <div style={styles.toastSuccess}>
              <CheckCircle2 size={16} />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Report Overview Card */}
          <div style={styles.reportOverviewCard}>
            <img
              src={report.primary_image_url || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=500&auto=format&fit=crop&q=80'}
              alt={report.title}
              style={styles.heroImage}
            />
            <div style={styles.overviewMeta}>
              <div style={styles.titleRow}>
                <h4 style={styles.reportTitle}>{report.title}</h4>
                <span style={styles.ticketPill}>{report.ticket_number}</span>
              </div>
              <p style={styles.description}>{report.description}</p>

              <div style={styles.metaRow}>
                <div style={styles.metaChip}>
                  <MapPin size={13} color="var(--brand-primary)" />
                  <span>{report.formatted_address}</span>
                </div>
                <div style={styles.metaChip}>
                  <Sparkles size={13} color="#059669" />
                  <span>AI Verified: {(report.ai_confidence * 100).toFixed(1)}%</span>
                </div>
                <div style={styles.metaChip}>
                  <Clock size={13} color="var(--text-tertiary)" />
                  <span>
                    Reported {new Date(report.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields matching Screen 22 */}
          <form onSubmit={handleSave} style={styles.form}>
            {/* Status Field */}
            <div style={styles.formRow}>
              <label style={styles.fieldLabel}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ReportStatus)}
                style={styles.selectInput}>
                <option value="Pending">Pending (Awaiting Crew)</option>
                <option value="In Progress">In-Progress (Work Started)</option>
                <option value="Resolved">Resolved (Repairs Finished)</option>
                <option value="Closed">Closed (Citizen Approved)</option>
                <option value="Duplicate">Duplicate (Merged)</option>
              </select>
            </div>

            {/* Assigned To Field */}
            <div style={styles.formRow}>
              <label style={styles.fieldLabel}>Assigned To</label>
              <div style={styles.inputWithIcon}>
                <User size={16} color="var(--text-tertiary)" style={styles.inputIcon} />
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  style={{ ...styles.selectInput, paddingLeft: '38px' }}>
                  {FIELD_STAFF.map((staff) => (
                    <option key={staff} value={staff}>
                      {staff}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Priority / Severity Field */}
            <div style={styles.formRow}>
              <label style={styles.fieldLabel}>Priority / Severity</label>
              <div style={styles.priorityGroup}>
                {(['High', 'Medium', 'Low'] as SeverityLevel[]).map((level) => {
                  const isSelected = severity === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSeverity(level)}
                      style={{
                        ...styles.priorityPill,
                        backgroundColor: isSelected
                          ? level === 'High'
                            ? '#FEE2E2'
                            : level === 'Medium'
                            ? '#FEF3C7'
                            : '#EFF6FF'
                          : 'var(--bg-surface-secondary)',
                        color: isSelected
                          ? level === 'High'
                            ? '#DC2626'
                            : level === 'Medium'
                            ? '#D97706'
                            : '#2563EB'
                          : 'var(--text-muted)',
                        borderColor: isSelected
                          ? level === 'High'
                            ? '#FCA5A5'
                            : level === 'Medium'
                            ? '#FDE68A'
                            : '#BFDBFE'
                          : 'var(--border-light)',
                        fontWeight: isSelected ? 700 : 500,
                      }}>
                      <span>● {level}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Official Remarks Field */}
            <div style={styles.formRow}>
              <label style={styles.fieldLabel}>Department Remarks & Notes</label>
              <div style={styles.textareaWrapper}>
                <MessageSquare size={16} color="var(--text-tertiary)" style={styles.textareaIcon} />
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  placeholder="e.g. Work started. Expected completion in 2 days..."
                  style={styles.textarea}
                />
              </div>
            </div>

            {/* Resolution Progress Milestones */}
            <div style={styles.milestonesSection}>
              <h5 style={styles.milestonesHeading}>Resolution Progress Timeline</h5>
              <div style={styles.timelineList}>
                {(report.timeline && report.timeline.length > 0
                  ? report.timeline
                  : [
                      { step: 1, title: 'Report Submitted', remarks: 'Geo-tagged citizen intake', is_completed: true },
                      { step: 2, title: 'AI Verification', remarks: 'Defect classified with confidence score', is_completed: true },
                      { step: 3, title: 'Routed to Department', remarks: report.department_name, is_completed: true },
                      { step: 4, title: 'Work In-Progress', remarks: 'Field crew assigned', is_completed: status === 'In Progress' || status === 'Resolved' },
                      { step: 5, title: 'Issue Resolved', remarks: 'Repairs completed & verified', is_completed: status === 'Resolved' },
                    ]
                ).map((item, idx) => (
                  <div key={idx} style={styles.timelineItem}>
                    <div
                      style={{
                        ...styles.timelineDot,
                        backgroundColor: item.is_completed ? '#10B981' : 'var(--border-light)',
                        color: '#FFFFFF',
                      }}>
                      {item.is_completed ? <CheckCircle2 size={12} /> : <span>{idx + 1}</span>}
                    </div>
                    <div style={styles.timelineContent}>
                      <div style={styles.timelineTitle}>{item.title}</div>
                      <div style={styles.timelineRemarks}>{item.remarks}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={styles.actionsFooter}>
              <button type="button" onClick={onClose} style={styles.cancelBtn}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{
                  ...styles.submitBtn,
                  opacity: saving ? 0.75 : 1,
                }}>
                <Save size={16} />
                <span>{saving ? 'Updating Database...' : 'Update Report'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    justifyContent: 'flex-end',
    zIndex: 99999,
  },
  drawerCard: {
    width: '100%',
    maxWidth: '520px',
    height: '100vh',
    backgroundColor: 'var(--bg-surface)',
    boxShadow: '-8px 0 24px rgba(0, 0, 0, 0.25)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    zIndex: 100000,
    animation: 'slideInRight 0.25s ease-out',
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid var(--border-light)',
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
  },
  badgeLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--brand-primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  headerTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: 'var(--text-main)',
    letterSpacing: '-0.3px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  toastSuccess: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#ECFDF5',
    color: '#059669',
    border: '1px solid #A7F3D0',
    padding: '10px 14px',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
  },
  reportOverviewCard: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: '16px',
    border: '1px solid var(--border-card)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-sm)',
  },
  heroImage: {
    width: '100%',
    height: '170px',
    objectFit: 'cover',
  },
  overviewMeta: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
  },
  reportTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  ticketPill: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--brand-primary)',
    fontFamily: 'monospace',
    backgroundColor: '#EFF6FF',
    padding: '3px 8px',
    borderRadius: '6px',
  },
  description: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
  },
  metaRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginTop: '4px',
  },
  metaChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  fieldLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-main)',
  },
  inputWithIcon: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    pointerEvents: 'none',
  },
  selectInput: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid var(--border-light)',
    backgroundColor: 'var(--bg-surface)',
    color: 'var(--text-main)',
    fontSize: '13px',
    fontWeight: '500',
    outline: 'none',
    cursor: 'pointer',
  },
  priorityGroup: {
    display: 'flex',
    gap: '10px',
  },
  priorityPill: {
    flex: 1,
    padding: '9px',
    borderRadius: '8px',
    border: '1px solid',
    cursor: 'pointer',
    fontSize: '12px',
    textAlign: 'center',
    transition: 'all 0.15s ease',
  },
  textareaWrapper: {
    position: 'relative',
  },
  textareaIcon: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    pointerEvents: 'none',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px 10px 38px',
    borderRadius: '10px',
    border: '1px solid var(--border-light)',
    backgroundColor: 'var(--bg-surface)',
    color: 'var(--text-main)',
    fontSize: '13px',
    fontFamily: 'inherit',
    outline: 'none',
    resize: 'vertical',
  },
  milestonesSection: {
    marginTop: '6px',
    padding: '14px',
    borderRadius: '12px',
    backgroundColor: 'var(--bg-surface-secondary)',
    border: '1px solid var(--border-light)',
  },
  milestonesHeading: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--text-main)',
    marginBottom: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  timelineList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  timelineItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  timelineDot: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: '700',
    flexShrink: 0,
    marginTop: '1px',
  },
  timelineContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  timelineTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  timelineRemarks: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  actionsFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '10px',
    paddingTop: '16px',
    borderTop: '1px solid var(--border-light)',
  },
  cancelBtn: {
    padding: '10px 18px',
    borderRadius: '10px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-light)',
    color: 'var(--text-muted)',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  submitBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '10px',
    backgroundColor: '#0066FF',
    color: '#FFFFFF',
    border: 'none',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 102, 255, 0.3)',
    transition: 'all 0.15s ease',
  },
};
