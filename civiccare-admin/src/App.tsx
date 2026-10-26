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
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All Categories & Services');
  const [reports, setReports] = useState<CivicReport[]>(SEED_REPORTS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedReport, setSelectedReport] = useState<CivicReport | null>(null);
  const [isDark, setIsDark] = useState<boolean>(false);

  // Load initial reports from Supabase
  useEffect(() => {
    async function loadData() {
      const data = await fetchCivicReports();
      setReports(data);
    }
    loadData();

    // Subscribe to real-time PostgreSQL updates on 'reports'
    const channel = supabase
      .channel('realtime:admin_reports')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reports' },
        (payload) => {
          console.log('Realtime Postgres Change received:', payload);
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
              latitude: newRow.latitude || 19.076,
              longitude: newRow.longitude || 72.8777,
              primary_image_url: newRow.primary_image_url || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
              department_name: newRow.department_name || 'Road Maintenance & Infrastructure',
              subscriber_count: newRow.subscriber_count || 1,
              ai_confidence: newRow.ai_confidence ? parseFloat(newRow.ai_confidence) : 0.94,
              created_at: newRow.created_at || new Date().toISOString(),
            };
            setReports((prev) => [formatted, ...prev.filter((r) => r.id !== formatted.id)]);
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as any;
            setReports((prev) =>
              prev.map((r) =>
                r.id === updated.id
                  ? {
                      ...r,
                      status: updated.status || r.status,
                      official_remarks: updated.official_remarks || r.official_remarks,
                      assigned_to: updated.assigned_to || r.assigned_to,
                      severity: updated.severity || r.severity,
                      updated_at: updated.updated_at,
                    }
                  : r
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Theme effect
  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isDark]);

  const handleToggleTheme = () => {
    setIsDark(!isDark);
  };

  const handleLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
    if (user.role === 'dept_admin' && user.department) {
      setSelectedDepartment(user.department);
    }
  };

  const handleLogout = () => {
    setAdminUser(null);
  };

  const handleSaveReportUpdate = async (
    reportId: string,
    newStatus: ReportStatus,
    remarks: string,
    assignedTo: string,
    severity: SeverityLevel
  ) => {
    // Optimistic UI update
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: newStatus,
              official_remarks: remarks,
              assigned_to: assignedTo,
              severity: severity,
              updated_at: new Date().toISOString(),
            }
          : r
      )
    );

    // Commit to Supabase
    await updateReportStatus(reportId, newStatus, remarks, assignedTo);
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
        onTabChange={(tab) => setCurrentTab(tab)}
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
              onViewAllReports={() => setCurrentTab('reports')}
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
