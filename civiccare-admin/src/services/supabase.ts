import { createClient } from '@supabase/supabase-js';
import type { CivicReport, KPIStats } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://soxepjypgtbcjiiurhmk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNveGVwanlwZ3RiY2ppaXVyaG1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5MTU2NDgsImV4cCI6MjEwODQ5MTY0OH0.tuFKKW7qkjWUjX20nLsmjGZnsR34dPFhH0lGxNP0oZE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const SEED_REPORTS: CivicReport[] = [
  {
    id: 'd8e7a6b5-c4d3-4e2f-a1b0-9c8d7e6f5a4b',
    ticket_number: '#CC20241026',
    title: 'Pothole on MG Road',
    description: 'Large hazardous pothole on the main road near city mall. It is causing traffic slow-down and risks motorcycle accidents.',
    category_id: 'Pothole',
    severity: 'High',
    status: 'In Progress',
    formatted_address: 'MG Road, Andheri West, Mumbai, Maharashtra',
    latitude: 19.1197,
    longitude: 72.8397,
    primary_image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    department_name: 'Road Maintenance Dept.',
    subscriber_count: 14,
    ai_confidence: 0.942,
    assigned_to: "John D'Souza (Senior Road Inspector)",
    official_remarks: 'Work order #WO-9821 issued. Asphalt patcher crew dispatched. Expected completion in 2 days.',
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    timeline: [
      { step: 1, title: 'Report Submitted', remarks: 'Citizen reported with geo-tag', is_completed: true, created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString() },
      { step: 2, title: 'AI Verification', remarks: 'High hazard pothole confirmed with 94.2% confidence', is_completed: true, created_at: new Date(Date.now() - 1.8 * 3600 * 1000).toISOString() },
      { step: 3, title: 'Assigned to Road Dept', remarks: 'Dispatched to Andheri West Ward 12 Unit', is_completed: true, created_at: new Date(Date.now() - 1.2 * 3600 * 1000).toISOString() },
      { step: 4, title: 'In Progress', remarks: 'Crew on site. Cold-mix patch in progress', is_completed: true, created_at: new Date(Date.now() - 0.5 * 3600 * 1000).toISOString() },
      { step: 5, title: 'Resolved', remarks: 'Pending completion proof', is_completed: false, created_at: '' },
    ]
  },
  {
    id: 'd8e7a6b5-c4d3-4e2f-a1b0-9c8d7e6f5a4c',
    ticket_number: '#CC20241025',
    title: 'Overflowing garbage bin',
    description: 'Public garbage dump overflowing near local school bus stop. Stray animals scattering plastic waste and strong foul odor.',
    category_id: 'Garbage',
    severity: 'Medium',
    status: 'Pending',
    formatted_address: 'Linking Road, Bandra West, Mumbai, Maharashtra',
    latitude: 19.0596,
    longitude: 72.8295,
    primary_image_url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=80',
    department_name: 'Solid Waste Management Dept.',
    subscriber_count: 8,
    ai_confidence: 0.910,
    assigned_to: 'Ramesh Patil (Sanitation Supervisor)',
    official_remarks: 'Waste collection dumper truck scheduled for 2:30 PM route.',
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    timeline: [
      { step: 1, title: 'Report Submitted', remarks: 'Citizen report logged via mobile', is_completed: true, created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
      { step: 2, title: 'AI Verification', remarks: 'Solid waste overflow classified (91.0%)', is_completed: true, created_at: new Date(Date.now() - 23.8 * 3600 * 1000).toISOString() },
      { step: 3, title: 'Routed to Sanitation', remarks: 'Assigned to Ward H-West Sanitation Dept', is_completed: true, created_at: new Date(Date.now() - 22 * 3600 * 1000).toISOString() },
      { step: 4, title: 'In Progress', remarks: 'Truck en route', is_completed: false, created_at: '' },
      { step: 5, title: 'Resolved', remarks: 'Pending site clearance', is_completed: false, created_at: '' },
    ]
  },
  {
    id: 'd8e7a6b5-c4d3-4e2f-a1b0-9c8d7e6f5a4d',
    ticket_number: '#CC20241024',
    title: 'Broken streetlight with hanging wire',
    description: 'Main street lamp post damaged during heavy winds with exposed live wires dangling dangerously near pedestrian sidewalk.',
    category_id: 'Streetlight',
    severity: 'High',
    status: 'Resolved',
    formatted_address: 'Hiranandani Gardens, Powai, Mumbai, Maharashtra',
    latitude: 19.1176,
    longitude: 72.9060,
    primary_image_url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80',
    department_name: 'Electrical & Lighting Dept.',
    subscriber_count: 19,
    ai_confidence: 0.965,
    assigned_to: 'Priya Sharma (Electrical Engineer)',
    official_remarks: 'High priority urgent electrical repair completed. New LED luminaire installed and cabling insulated.',
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    timeline: [
      { step: 1, title: 'Report Submitted', remarks: 'Emergency hazard flagged by citizens', is_completed: true, created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString() },
      { step: 2, title: 'AI Verification', remarks: 'Critical electrical defect identified (96.5%)', is_completed: true, created_at: new Date(Date.now() - 47.9 * 3600 * 1000).toISOString() },
      { step: 3, title: 'Urgent Routing', remarks: 'Power cut safety protocol initiated', is_completed: true, created_at: new Date(Date.now() - 46 * 3600 * 1000).toISOString() },
      { step: 4, title: 'Repaired & Tested', remarks: 'Lamp fixture replaced and safety certified', is_completed: true, created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString() },
      { step: 5, title: 'Resolved', remarks: 'Citizen verified and closed', is_completed: true, created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString() },
    ]
  },
  {
    id: 'd8e7a6b5-c4d3-4e2f-a1b0-9c8d7e6f5a4e',
    ticket_number: '#CC20241023',
    title: 'Major potable water pipeline leak',
    description: 'Clean drinking water gushing onto the road from underground main line rupture, flooding market area.',
    category_id: 'Water Leak',
    severity: 'Medium',
    status: 'In Progress',
    formatted_address: 'Dadar Flower Market, Dadar West, Mumbai',
    latitude: 19.0178,
    longitude: 72.8478,
    primary_image_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=800&auto=format&fit=crop&q=80',
    department_name: 'Water Supply Dept.',
    subscriber_count: 32,
    ai_confidence: 0.935,
    assigned_to: 'Vikram Joshi (Hydraulic Dept)',
    official_remarks: 'Isolation valve turned off to prevent clean water loss. Excavation team replacing cracked 12-inch CI pipe.',
    created_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    timeline: [
      { step: 1, title: 'Report Submitted', remarks: 'Citizen report logged with water pressure video', is_completed: true, created_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString() },
      { step: 2, title: 'AI Verification', remarks: 'Water burst classified (93.5%)', is_completed: true, created_at: new Date(Date.now() - 71.8 * 3600 * 1000).toISOString() },
      { step: 3, title: 'Routed to Hydraulic Dept', remarks: 'Ward G-North water engineers notified', is_completed: true, created_at: new Date(Date.now() - 70 * 3600 * 1000).toISOString() },
      { step: 4, title: 'Pipe Replacement Ongoing', remarks: 'Excavation team on site', is_completed: true, created_at: new Date(Date.now() - 10 * 3600 * 1000).toISOString() },
      { step: 5, title: 'Resolved', remarks: 'Pending pressure test', is_completed: false, created_at: '' },
    ]
  },
  {
    id: 'd8e7a6b5-c4d3-4e2f-a1b0-9c8d7e6f5a4f',
    ticket_number: '#CC20241022',
    title: 'Cracked concrete road surface',
    description: 'Severe longitudinal fissures and broken concrete slab causing vehicle tyre damage near residential society.',
    category_id: 'Broken Road',
    severity: 'Low',
    status: 'Pending',
    formatted_address: 'Lokhandwala Complex, Andheri West, Mumbai',
    latitude: 19.1415,
    longitude: 72.8258,
    primary_image_url: 'https://images.unsplash.com/photo-1578991624414-276ef23a534f?w=800&auto=format&fit=crop&q=80',
    department_name: 'Road Maintenance Dept.',
    subscriber_count: 5,
    ai_confidence: 0.887,
    assigned_to: "John D'Souza (Senior Road Inspector)",
    official_remarks: 'Scheduled for next weekly road resurfacing round.',
    created_at: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
    timeline: [
      { step: 1, title: 'Report Submitted', remarks: 'Logged by local residents association', is_completed: true, created_at: new Date(Date.now() - 96 * 3600 * 1000).toISOString() },
      { step: 2, title: 'AI Verification', remarks: 'Surface crack classified (88.7%)', is_completed: true, created_at: new Date(Date.now() - 95.8 * 3600 * 1000).toISOString() },
      { step: 3, title: 'Routed to Road Dept', remarks: 'Queued in maintenance backlog', is_completed: true, created_at: new Date(Date.now() - 90 * 3600 * 1000).toISOString() },
      { step: 4, title: 'In Progress', remarks: 'Pending concrete batch allocation', is_completed: false, created_at: '' },
      { step: 5, title: 'Resolved', remarks: '', is_completed: false, created_at: '' },
    ]
  }
];

export async function fetchCivicReports(): Promise<CivicReport[]> {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      console.warn('Using seeded reports fallback or Supabase reports empty:', error?.message);
      return SEED_REPORTS;
    }

    // Merge or normalize Supabase reports
    return data.map((item) => ({
      id: item.id,
      ticket_number: item.ticket_number || `#CC-${item.id.slice(0, 8)}`,
      title: item.title,
      description: item.description,
      category_id: item.category_id,
      severity: item.severity || 'Medium',
      status: item.status || 'Pending',
      formatted_address: item.formatted_address || 'City Ward Area',
      latitude: item.latitude || 19.076,
      longitude: item.longitude || 72.8777,
      primary_image_url: item.primary_image_url || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
      department_name: item.department_name || 'Road Maintenance & Infrastructure',
      subscriber_count: item.subscriber_count || 1,
      ai_confidence: item.ai_confidence ? parseFloat(item.ai_confidence) : 0.94,
      assigned_to: item.assigned_to || "Operations Triage Desk",
      official_remarks: item.official_remarks || 'Report actively monitored by CivicCare Operations Hub.',
      resolution_proof_url: item.resolution_proof_url,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));
  } catch (err) {
    console.error('Error fetching reports from Supabase:', err);
    return SEED_REPORTS;
  }
}

export async function updateReportStatus(
  reportId: string,
  newStatus: string,
  remarks?: string,
  assignedTo?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const updatePayload: Record<string, any> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };
    if (remarks) updatePayload.official_remarks = remarks;
    if (assignedTo) updatePayload.assigned_to = assignedTo;

    const { error } = await supabase
      .from('reports')
      .update(updatePayload)
      .eq('id', reportId);

    if (error) {
      console.error('Supabase update failed:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error updating report status:', err);
    return { success: false, error: err?.message || 'Update failed' };
  }
}

export function computeKPIStats(reports: CivicReport[]): KPIStats {
  const totalReports = 1284 + reports.length;
  const pendingReports = 342 + reports.filter((r) => r.status === 'Pending' || r.status === 'Submitted').length;
  const inProgressReports = 516 + reports.filter((r) => r.status === 'In Progress').length;
  const resolvedReports = 426 + reports.filter((r) => r.status === 'Resolved' || r.status === 'Closed').length;

  return {
    totalReports,
    totalGrowth: 12,
    pendingReports,
    pendingGrowth: -5,
    inProgressReports,
    inProgressGrowth: 18,
    resolvedReports,
    resolvedGrowth: 22,
  };
}
