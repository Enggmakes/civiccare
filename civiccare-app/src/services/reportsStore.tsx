import React, { createContext, useContext, useState, useEffect } from 'react';
import { CivicReportItem, INITIAL_SAMPLE_REPORTS, supabase, isRealSupabaseConfigured, safeStorage } from './supabase';

interface ReportsContextType {
  reports: CivicReportItem[];
  addReport: (newReport: Omit<CivicReportItem, 'id' | 'ticket_number' | 'created_at' | 'timeline' | 'time_ago' | 'distance_km'>) => Promise<CivicReportItem>;
  getReportById: (idOrTicketNumber: string) => CivicReportItem | undefined;
  upvoteReport: (reportId: string) => Promise<void>;
  filterCategory: string | null;
  setFilterCategory: (cat: string | null) => void;
}

const ReportsContext = createContext<ReportsContextType | null>(null);

const STORAGE_KEY = '@civiccare_reports_v1';

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const [reports, setReports] = useState<CivicReportItem[]>(INITIAL_SAMPLE_REPORTS);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      if (isRealSupabaseConfigured) {
        const { data, error } = await supabase
          .from('reports')
          .select('*, report_status_history(*)')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped: CivicReportItem[] = data.map((d: any) => {
            // Build real timeline from report_status_history if available
            let realTimeline = (d.report_status_history || [])
              .sort((a: any, b: any) => a.step - b.step)
              .map((sh: any) => ({
                step: sh.step,
                title: sh.title,
                timestamp: sh.created_at ? new Date(sh.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Done',
                description: sh.remarks || '',
                is_completed: sh.is_completed ?? true,
                is_active: false,
              }));

            if (realTimeline.length === 0) {
              realTimeline = [
                {
                  step: 1,
                  title: 'Report Submitted',
                  timestamp: new Date(d.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  description: 'Your report has been received and queued for dispatch.',
                  is_completed: true,
                },
                {
                  step: 2,
                  title: 'AI Classification',
                  timestamp: d.created_at ? new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Done',
                  description: `Detected as ${d.category_id || 'Civic Issue'} (${d.severity || 'Medium'} Severity)`,
                  is_completed: true,
                },
                {
                  step: 3,
                  title: `Sent to ${d.department_name || 'Municipal Dept.'}`,
                  timestamp: d.created_at ? new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Done',
                  description: 'Routed to the responsible department with SLA tracking.',
                  is_completed: true,
                  is_active: true,
                },
                {
                  step: 4,
                  title: 'In Progress',
                  timestamp: 'Pending',
                  description: 'Department is dispatching field personnel to the site.',
                  is_completed: false,
                },
                {
                  step: 5,
                  title: 'Resolved',
                  timestamp: 'Pending',
                  description: 'Pending physical repair and resolution proof.',
                  is_completed: false,
                },
              ];
            }

            return {
              id: d.id,
              ticket_number: d.ticket_number,
              title: d.title,
              description: d.description,
              category: d.category_id || 'Pothole',
              severity: d.severity || 'Medium',
              status: d.status || 'Submitted',
              location_address: d.formatted_address,
              latitude: d.latitude,
              longitude: d.longitude,
              image_url: d.primary_image_url || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600',
              created_at: d.created_at,
              department_name: d.department_name || 'Municipal Department',
              user_id: d.user_id,
              time_ago: 'Recently',
              distance_km: '0.3 km',
              subscriber_count: d.subscriber_count || 1,
              timeline: realTimeline,
            };
          });
          setReports(mapped);
          return;
        }
      }

      // Check safe storage cache
      const cached = await safeStorage.getItem(STORAGE_KEY);
      if (cached) {
        setReports(JSON.parse(cached));
      }
    } catch (e) {
      console.warn('Failed to load reports from storage/supabase, using baseline data:', e);
    }
  };

  const addReport = async (
    data: Omit<CivicReportItem, 'id' | 'ticket_number' | 'created_at' | 'timeline' | 'time_ago' | 'distance_km'>
  ): Promise<CivicReportItem> => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const generatedTicket = `#CC${dateStr.slice(0, 8)}-${randomSuffix}`;

    const newReport: CivicReportItem = {
      ...data,
      id: `rep_${Date.now()}`,
      ticket_number: generatedTicket,
      created_at: today.toISOString(),
      time_ago: 'Just now',
      distance_km: '0.1 km',
      subscriber_count: 1,
      timeline: [
        {
          step: 1,
          title: 'Report Submitted',
          timestamp: today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          description: 'Your report has been received and queued for dispatch.',
          is_completed: true,
        },
        {
          step: 2,
          title: 'AI Classification',
          timestamp: today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          description: `Detected as ${data.category} (${data.severity} Severity)`,
          is_completed: true,
        },
        {
          step: 3,
          title: `Sent to ${data.department_name}`,
          timestamp: today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          description: 'Your report has been routed to the appropriate municipal department.',
          is_completed: true,
        },
        {
          step: 4,
          title: 'In Progress',
          timestamp: 'Pending',
          description: 'Department is dispatching a field crew to inspect the site.',
          is_completed: false,
          is_active: true,
        },
        {
          step: 5,
          title: 'Resolved',
          timestamp: 'Pending',
          description: 'Pending physical remediation and resolution proof.',
          is_completed: false,
        },
      ],
    };

    const updated = [newReport, ...reports];
    setReports(updated);
    try {
      await safeStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // If live Supabase is configured, push to database table
      if (isRealSupabaseConfigured) {
        const { data: insertedReport, error: insertError } = await supabase
          .from('reports')
          .insert({
            ticket_number: generatedTicket,
            title: newReport.title,
            description: newReport.description,
            category_id: newReport.category,
            severity: newReport.severity,
            status: 'Submitted',
            formatted_address: newReport.location_address,
            latitude: newReport.latitude,
            longitude: newReport.longitude,
            primary_image_url: newReport.image_url,
            department_name: newReport.department_name,
          })
          .select()
          .single();

        if (insertError) {
          console.warn('[CivicCare Supabase] Report insert error:', insertError.message);
        } else if (insertedReport?.id) {
          // Populate the initial progress history steps in report_status_history
          const historySteps = [
            {
              report_id: insertedReport.id,
              step: 1,
              title: 'Report Submitted',
              remarks: 'Citizen submitted issue with photo proof via CivicCare app.',
              is_completed: true,
            },
            {
              report_id: insertedReport.id,
              step: 2,
              title: 'AI Classification',
              remarks: `Classified as ${newReport.category} (${newReport.severity} Severity) with defect localization.`,
              is_completed: true,
            },
            {
              report_id: insertedReport.id,
              step: 3,
              title: `Sent to ${newReport.department_name}`,
              remarks: `Queued and dispatched to ${newReport.department_name} with SLA tracking.`,
              is_completed: true,
            },
          ];

          const { error: historyErr } = await supabase
            .from('report_status_history')
            .insert(historySteps);

          if (historyErr) {
            console.warn('[CivicCare Supabase] Status history insert note:', historyErr.message);
          }
        }
      }
    } catch (e) {
      console.warn('Storage save failed', e);
    }

    return newReport;
  };

  const getReportById = (idOrTicketNumber: string) => {
    return reports.find(
      r => r.id === idOrTicketNumber || r.ticket_number.toLowerCase() === idOrTicketNumber.toLowerCase()
    );
  };

  const upvoteReport = async (reportId: string) => {
    const updated = reports.map(r => {
      if (r.id === reportId) {
        return { ...r, subscriber_count: (r.subscriber_count || 1) + 1 };
      }
      return r;
    });
    setReports(updated);
    await safeStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <ReportsContext.Provider
      value={{
        reports: filterCategory ? reports.filter(r => r.category === filterCategory) : reports,
        addReport,
        getReportById,
        upvoteReport,
        filterCategory,
        setFilterCategory,
      }}>
      {children}
    </ReportsContext.Provider>
  );
}

export function useReports() {
  const ctx = useContext(ReportsContext);
  if (!ctx) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return ctx;
}
