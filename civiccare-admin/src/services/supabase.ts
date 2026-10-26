import { createClient } from '@supabase/supabase-js';
import type { CivicReport, KPIStats, ReportStatus, SeverityLevel, TimelineEvent } from '../types';

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
      .select('*, report_status_history(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Using seeded reports fallback due to Supabase error:', error?.message);
      return SEED_REPORTS;
    }

    if (!data) return [];

    // Merge or normalize Supabase reports
    return data.map((item) => {
      // Sort status history milestones by creation time or step
      const historyList = (item.report_status_history || []).sort(
        (a: any, b: any) => (a.step ?? 0) - (b.step ?? 0)
      );

      // Extract latest history remarks & assignee if present
      const latestHistory = historyList[historyList.length - 1];
      let assignedTo = 'Operations Triage Desk';
      let officialRemarks = 'Report actively monitored by CivicCare Operations Hub.';

      if (latestHistory?.remarks) {
        officialRemarks = latestHistory.remarks;
        const match = latestHistory.remarks.match(/Assigned to: ([^)]+)/);
        if (match && match[1]) {
          assignedTo = match[1].trim();
        }
      }

      // Map DB status to UI status ('Submitted' in PostgreSQL -> 'Pending' in UI)
      const uiStatus: ReportStatus =
        item.status === 'Submitted' ? 'Pending' : (item.status as ReportStatus);

      const isInProgress = uiStatus === 'In Progress';
      const isResolved = uiStatus === 'Resolved' || uiStatus === 'Closed';

      let timeline: TimelineEvent[];
      if (historyList.length > 0) {
        timeline = historyList.map((h: any) => ({
          step: h.step,
          title: h.title,
          remarks: h.remarks,
          is_completed: h.is_completed ?? true,
          created_at: h.created_at || item.created_at,
        }));

        // Ensure steps up to current status are represented
        if (isInProgress && !timeline.some((t) => t.step === 4)) {
          timeline.push({
            step: 4,
            title: 'In Progress (Field Unit Deployed)',
            remarks: assignedTo ? `Crew: ${assignedTo}` : 'Maintenance team deployed on site',
            is_completed: true,
            created_at: '',
          });
        }
        if (isResolved && !timeline.some((t) => t.step === 5)) {
          timeline.push({
            step: 5,
            title: 'Resolved (Repairs Finished)',
            remarks: officialRemarks || 'Work certified and closed',
            is_completed: true,
            created_at: '',
          });
        }
      } else {
        timeline = [
          { step: 1, title: 'Report Submitted', remarks: 'Citizen submitted grievance', is_completed: true, created_at: item.created_at },
          { step: 2, title: 'AI Verification', remarks: `AI model validated defect (${((item.ai_confidence || 0.94) * 100).toFixed(1)}%)`, is_completed: true, created_at: item.created_at },
          { step: 3, title: 'Department Assigned', remarks: item.department_name || 'Routed to operations desk', is_completed: true, created_at: item.created_at },
          { step: 4, title: 'In Progress', remarks: isInProgress || isResolved ? (assignedTo ? `Crew: ${assignedTo}` : 'Field unit deployed') : 'Awaiting field dispatch', is_completed: isInProgress || isResolved, created_at: '' },
          { step: 5, title: 'Resolved', remarks: isResolved ? (officialRemarks || 'Work certified and closed') : 'Repairs pending completion', is_completed: isResolved, created_at: '' },
        ];
      }

      return {
        id: item.id,
        ticket_number: item.ticket_number || `#CC-${item.id.slice(0, 8)}`,
        title: item.title,
        description: item.description,
        category_id: item.category_id,
        severity: item.severity || 'Medium',
        status: uiStatus,
        formatted_address: item.formatted_address || 'City Ward Area',
        latitude: item.latitude || 19.6971,
        longitude: item.longitude || 72.7588,
        primary_image_url: item.primary_image_url || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
        department_name: item.department_name || 'Road Maintenance & Infrastructure',
        subscriber_count: item.subscriber_count || 1,
        ai_confidence: item.ai_confidence ? parseFloat(item.ai_confidence) : 0.94,
        assigned_to: assignedTo,
        official_remarks: officialRemarks,
        resolution_proof_url: item.resolution_proof_url,
        created_at: item.created_at,
        updated_at: latestHistory?.created_at || item.created_at,
        timeline,
      };
    });
  } catch (err) {
    console.error('Error fetching reports from Supabase:', err);
    return SEED_REPORTS;
  }
}

export async function updateReportStatus(
  reportId: string,
  newStatus: ReportStatus,
  remarks?: string,
  assignedTo?: string,
  severity?: SeverityLevel
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Map UI status to Supabase PostgreSQL enum:
    // report_status_enum: 'Submitted' | 'AI_Verified' | 'Routed' | 'In Progress' | 'Resolved' | 'Closed' | 'Duplicate'
    let dbStatus: string = newStatus;
    if (newStatus === 'Pending') {
      dbStatus = 'Submitted';
    }

    // 2. Prepare payload for 'reports' table.
    // Note: 'reports' columns are: id, ticket_number, title, description, category_id, severity, status, formatted_address, latitude, longitude, primary_image_url, department_name, subscriber_count, ai_confidence, created_at.
    const updatePayload: Record<string, any> = {
      status: dbStatus,
    };
    if (severity) {
      updatePayload.severity = severity;
    }

    const { error: reportError } = await supabase
      .from('reports')
      .update(updatePayload)
      .eq('id', reportId);

    if (reportError) {
      console.error('Supabase update failed on reports table:', reportError);
      return { success: false, error: reportError.message };
    }

    // 3. Record milestone in 'report_status_history'
    let stepNum = 3;
    let stepTitle = 'Department Triage Updated';
    if (newStatus === 'In Progress') {
      stepNum = 4;
      stepTitle = 'Work In Progress (Field Crew Deployed)';
    } else if (newStatus === 'Resolved') {
      stepNum = 5;
      stepTitle = 'Issue Resolved (Repairs Certified)';
    } else if (newStatus === 'Closed') {
      stepNum = 6;
      stepTitle = 'Ticket Closed';
    } else if (newStatus === 'Duplicate') {
      stepNum = 0;
      stepTitle = 'Marked as Duplicate';
    }

    const remarksText = remarks?.trim() || '';
    const assignedText = assignedTo?.trim() || '';
    let historyRemarks = '';
    if (remarksText && assignedText) {
      historyRemarks = `${remarksText} (Assigned to: ${assignedText})`;
    } else if (remarksText) {
      historyRemarks = remarksText;
    } else if (assignedText) {
      historyRemarks = `Assigned to: ${assignedText}`;
    } else {
      historyRemarks = `Status updated to ${newStatus}`;
    }

    const { error: histError } = await supabase
      .from('report_status_history')
      .insert({
        report_id: reportId,
        step: stepNum,
        title: stepTitle,
        remarks: historyRemarks,
        is_completed: true,
      });

    if (histError) {
      console.warn('Could not insert report_status_history milestone:', histError.message);
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error updating report status:', err);
    return { success: false, error: err?.message || 'Update failed' };
  }
}

export function computeKPIStats(reports: CivicReport[]): KPIStats {
  const totalReports = reports.length;
  const pendingReports = reports.filter((r) => r.status === 'Pending' || r.status === 'Submitted').length;
  const inProgressReports = reports.filter((r) => r.status === 'In Progress').length;
  const resolvedReports = reports.filter((r) => r.status === 'Resolved' || r.status === 'Closed').length;

  return {
    totalReports,
    totalGrowth: reports.length > 0 ? 100 : 0,
    pendingReports,
    pendingGrowth: pendingReports > 0 ? 100 : 0,
    inProgressReports,
    inProgressGrowth: inProgressReports > 0 ? 100 : 0,
    resolvedReports,
    resolvedGrowth: resolvedReports > 0 ? 100 : 0,
  };
}
