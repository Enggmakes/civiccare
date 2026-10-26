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
