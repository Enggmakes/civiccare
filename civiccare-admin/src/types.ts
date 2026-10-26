export type ReportStatus = 'Submitted' | 'Pending' | 'In Progress' | 'Resolved' | 'Closed' | 'Duplicate';

export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type IssueCategory = 'Pothole' | 'Garbage' | 'Streetlight' | 'Water Leak' | 'Broken Road' | 'Others';

export interface TimelineEvent {
  step: number;
  title: string;
  remarks?: string;
  is_completed: boolean;
  created_at: string;
}

export interface CivicReport {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  category_id: IssueCategory | string;
  severity: SeverityLevel;
  status: ReportStatus;
  formatted_address: string;
  latitude: number;
  longitude: number;
  primary_image_url?: string;
  department_name: string;
  subscriber_count: number;
  ai_confidence: number;
  assigned_to?: string;
  official_remarks?: string;
  resolution_proof_url?: string;
  created_at: string;
  updated_at?: string;
  timeline?: TimelineEvent[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'dept_admin' | 'field_officer';
  department: string;
  avatar_url?: string;
}

export interface KPIStats {
  totalReports: number;
  totalGrowth: number;
  pendingReports: number;
  pendingGrowth: number;
  inProgressReports: number;
  inProgressGrowth: number;
  resolvedReports: number;
  resolvedGrowth: number;
}

export function matchesDepartment(report: CivicReport, selectedDept: string): boolean {
  if (
    !selectedDept ||
    selectedDept === 'All Categories & Services' ||
    selectedDept === 'All Departments' ||
    selectedDept === 'All' ||
    selectedDept.startsWith('All') ||
    selectedDept.includes('Operations HQ') ||
    selectedDept.includes('Platform Operations')
  ) {
    return true;
  }

  const sel = selectedDept.toLowerCase();
  const dept = (report.department_name || '').toLowerCase();
  const cat = (report.category_id || '').toLowerCase();

  if (sel.includes('road')) {
    return dept.includes('road') || cat.includes('pothole') || cat.includes('road');
  }
  if (sel.includes('waste') || sel.includes('sanitation') || sel.includes('garbage')) {
    return dept.includes('waste') || dept.includes('sanitat') || cat.includes('garbage');
  }
  if (sel.includes('electric') || sel.includes('lighting') || sel.includes('light')) {
    return dept.includes('electric') || dept.includes('light') || cat.includes('streetlight');
  }
  if (sel.includes('water') || sel.includes('drainage') || sel.includes('leak')) {
    return dept.includes('water') || dept.includes('drain') || cat.includes('water');
  }

  return dept.includes(sel) || sel.includes(dept) || cat.includes(sel) || sel.includes(cat);
}
