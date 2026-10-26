import React, { useState, useEffect } from 'react';
import type { AdminUser, CivicReport, ReportStatus, SeverityLevel } from './types';
import {
  supabase,
  fetchCivicReports,
  updateReportStatus,
  computeKPIStats,
  SEED_REPORTS,
} from './services/supabase';
import { AdminLogin } from './components/AdminLogin';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminHeader } from './components/AdminHeader';
import { DashboardOverview } from './components/DashboardOverview';
import { ReportsManagement } from './components/ReportsManagement';
import { MapView } from './components/MapView';
import { AnalyticsView } from './components/AnalyticsView';
import { DepartmentsView } from './components/DepartmentsView';
import { UpdateReportDrawer } from './components/UpdateReportDrawer';

export function App() {
  // Persistent Admin Session (survives page refreshes)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('civiccare_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Persistent Tab Selection (remembers active view)
  const [currentTab, setCurrentTab] = useState<string>(() => {
    try {
      return localStorage.getItem('civiccare_admin_tab') || 'dashboard';
    } catch {
      return 'dashboard';
    }
  });

  const [selectedDepartment, setSelectedDepartment] = useState<string>('All Categories & Services');
  const [reports, setReports] = useState<CivicReport[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedReport, setSelectedReport] = useState<CivicReport | null>(null);
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('civiccare_admin_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Load initial reports from Supabase & keep live with WebSocket + 2.5s background sync
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const data = await fetchCivicReports();
        if (isMounted) {
          setReports((prev) => {
            if (prev.length === 0) return data;
            // Compare IDs to see if there's any change
            const prevMap = new Map(prev.map((r) => [r.id, r]));
            const isDifferent =
              data.length !== prev.length ||
              data.some((r) => {
                const existing = prevMap.get(r.id);
                return !existing || existing.status !== r.status || existing.updated_at !== r.updated_at;
              });

            return isDifferent ? data : prev;
          });
        }
      } catch (err) {
        console.error('Realtime sync error:', err);
      }
    }

    // Initial fetch
    loadData();

    // High-frequency 2.5-second live sync pulse for instantaneous updates without manual reload
    const livePulse = setInterval(() => {
      loadData();
    }, 2500);

    // Subscribe to real-time PostgreSQL updates on 'reports' table
    const channelName = `realtime:admin_reports_${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reports' },
        (payload) => {
          console.log('⚡ Realtime Postgres Event:', payload);
          if (payload.eventType === 'INSERT') {
            const newRow = payload.new as any;
            const formatted: CivicReport = {
              id: newRow.id,
              ticket_number: newRow.ticket_number || `#CC-${newRow.id.slice(0, 8)}`,
              title: newRow.title,
              description: newRow.description,
              category_id: newRow.category_id,
              severity: newRow.severity || 'Medium',
              status: newRow.status || 'Pending',
              formatted_address: newRow.formatted_address || 'City Ward Area',
              latitude: newRow.latitude || 19.6971,
              longitude: newRow.longitude || 72.7588,
              primary_image_url: newRow.primary_image_url || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
              department_name: newRow.department_name || 'Road Maintenance & Infrastructure',
              subscriber_count: newRow.subscriber_count || 1,
              ai_confidence: newRow.ai_confidence ? parseFloat(newRow.ai_confidence) : 0.94,
              created_at: newRow.created_at || new Date().toISOString(),
            };
            setReports((prev) => [formatted, ...prev.filter((r) => r.id !== formatted.id)]);
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as any;
            const uiStatus: ReportStatus =
              updated.status === 'Submitted' ? 'Pending' : (updated.status as ReportStatus);
            setReports((prev) =>
              prev.map((r) =>
                r.id === updated.id
                  ? {
                      ...r,
                      status: uiStatus,
                      severity: updated.severity || r.severity,
                    }
                  : r
              )
            );
            setSelectedReport((prev) =>
              prev && prev.id === updated.id
                ? {
                    ...prev,
                    status: uiStatus,
                    severity: updated.severity || prev.severity,
                  }
                : prev
            );
          } else if (payload.eventType === 'DELETE') {
            const oldRow = payload.old as any;
            setReports((prev) => prev.filter((r) => r.id !== oldRow.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('Supabase Realtime Channel Status:', status);
      });

    return () => {
      isMounted = false;
      clearInterval(livePulse);
      supabase.removeChannel(channel);
    };
  }, []);

  // Theme effect
  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      try {
        localStorage.setItem('civiccare_admin_theme', 'dark');
      } catch {}
    } else {
      document.documentElement.removeAttribute('data-theme');
      try {
        localStorage.setItem('civiccare_admin_theme', 'light');
      } catch {}
    }
  }, [isDark]);

  const handleToggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    try {
      localStorage.setItem('civiccare_admin_tab', tab);
    } catch (err) {
      console.warn('Failed to persist active tab:', err);
    }
  };

  const handleLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
    try {
      localStorage.setItem('civiccare_admin_user', JSON.stringify(user));
    } catch (err) {
      console.warn('Failed to persist admin session:', err);
    }
    if (
      user.role === 'dept_admin' &&
      user.department &&
      !user.department.includes('Operations') &&
      !user.department.includes('HQ')
    ) {
      setSelectedDepartment(user.department);
    }
  };

  const handleLogout = () => {
    setAdminUser(null);
    try {
      localStorage.removeItem('civiccare_admin_user');
      localStorage.removeItem('civiccare_admin_tab');
    } catch (err) {
      console.warn('Failed to clear admin session:', err);
    }
  };

  const handleSaveReportUpdate = async (
    reportId: string,
    newStatus: ReportStatus,
    remarks: string,
    assignedTo: string,
    severity: SeverityLevel
  ) => {
    // 1. Commit to Supabase
    const result = await updateReportStatus(reportId, newStatus, remarks, assignedTo, severity);
    if (!result.success) {
      throw new Error(result.error || 'Failed to update report status in database');
    }

    // 2. Update local state
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: newStatus,
              official_remarks: remarks || (assignedTo ? `Assigned to: ${assignedTo}` : r.official_remarks),
              assigned_to: assignedTo || r.assigned_to,
              severity: severity,
              updated_at: new Date().toISOString(),
              timeline: [
                { step: 1, title: 'Report Submitted', remarks: 'Geo-tagged citizen intake', is_completed: true, created_at: r.created_at },
                { step: 2, title: 'AI Verification', remarks: `AI model validated defect (${((r.ai_confidence || 0.94) * 100).toFixed(1)}%)`, is_completed: true, created_at: r.created_at },
                { step: 3, title: 'Department Assigned', remarks: r.department_name, is_completed: true, created_at: r.created_at },
                { step: 4, title: 'In Progress', remarks: assignedTo ? `Crew: ${assignedTo}` : 'Field crew deployed', is_completed: newStatus === 'In Progress' || newStatus === 'Resolved' || newStatus === 'Closed', created_at: new Date().toISOString() },
                { step: 5, title: 'Resolved', remarks: remarks || 'Repairs completed & verified', is_completed: newStatus === 'Resolved' || newStatus === 'Closed', created_at: newStatus === 'Resolved' || newStatus === 'Closed' ? new Date().toISOString() : '' },
              ],
            }
          : r
      )
    );

    // Also sync selectedReport
    setSelectedReport((prev) =>
      prev && prev.id === reportId
        ? {
            ...prev,
            status: newStatus,
            official_remarks: remarks || (assignedTo ? `Assigned to: ${assignedTo}` : prev.official_remarks),
            assigned_to: assignedTo || prev.assigned_to,
            severity: severity,
          }
        : prev
    );
  };

  // If not logged in, show Screen 18 (Admin Login)
  if (!adminUser) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  const stats = computeKPIStats(reports);

  return (
    <div className="app-container">
      {/* Left Sidebar matching Screen 19 */}
      <AdminSidebar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        adminUser={adminUser}
        onLogout={handleLogout}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <div style={styles.mainWrapper}>
        {/* Top Header matching Screen 19 */}
        <AdminHeader
          adminUser={adminUser}
          selectedDepartment={selectedDepartment}
          onDepartmentChange={(dept) => setSelectedDepartment(dept)}
          reports={reports}
          searchQuery={searchQuery}
          onSearchChange={(q) => setSearchQuery(q)}
          onSelectReport={(report) => setSelectedReport(report)}
        />

        {/* Tab Content */}
        <main style={styles.contentArea}>
          {currentTab === 'dashboard' && (
            <DashboardOverview
              stats={stats}
              reports={reports}
              onSelectReport={(r) => setSelectedReport(r)}
              onViewAllReports={() => handleTabChange('reports')}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsManagement
              reports={reports}
              onSelectReport={(r) => setSelectedReport(r)}
              selectedDepartment={selectedDepartment}
            />
          )}

          {currentTab === 'map' && (
            <MapView
              reports={reports}
              onSelectReport={(r) => setSelectedReport(r)}
              selectedDepartment={selectedDepartment}
            />
          )}

          {currentTab === 'departments' && (
            <DepartmentsView
              onSelectDepartment={(deptName) => {
                setSelectedDepartment(deptName);
                setCurrentTab('reports');
              }}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView
              reports={reports}
              selectedDepartment={selectedDepartment}
            />
          )}

          {currentTab === 'settings' && (
            <div style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>
                Portal Settings & Integrations
              </h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                Manage civic grievance API gateways, PostGIS spatial clusters, and automated triage rules.
              </p>
              <div
                style={{
                  backgroundColor: 'var(--bg-card)',
                  padding: '24px',
                  borderRadius: '16px',
                  border: '1px solid var(--border-card)',
                  maxWidth: '600px',
                }}>
                <div style={{ fontWeight: 700, marginBottom: '8px' }}>Connected Supabase Cloud Instance</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  https://soxepjypgtbcjiiurhmk.supabase.co
                </div>
                <div style={{ fontWeight: 700, marginBottom: '8px' }}>FastAPI Inference Microservice</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  http://localhost:8000 (Active YOLOv8 Worker)
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Slide-over Triage Drawer matching Screen 22 */}
      {selectedReport && (
        <UpdateReportDrawer
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onSaveUpdate={handleSaveReportUpdate}
        />
      )}
    </div>
  );
}

export default App;

const styles: Record<string, React.CSSProperties> = {
  mainWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    backgroundColor: 'var(--bg-app)',
    minHeight: '100vh',
  },
  contentArea: {
    flex: 1,
  },
};
