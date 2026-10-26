import React, { createContext, useContext, useState, useEffect } from 'react';
import { CivicReportItem, INITIAL_SAMPLE_REPORTS, supabase, isRealSupabaseConfigured, safeStorage } from './supabase';

interface ReportsContextType {
  reports: CivicReportItem[];
  userReportMap: Record<string, string[]>;
  getUserReports: (userId?: string | null) => CivicReportItem[];
  addReport: (
    newReport: Omit<CivicReportItem, 'id' | 'ticket_number' | 'created_at' | 'timeline' | 'time_ago' | 'distance_km'>,
    authorUserId?: string
  ) => Promise<CivicReportItem>;
  getReportById: (idOrTicketNumber: string) => CivicReportItem | undefined;
  upvoteReport: (reportId: string) => Promise<void>;
  filterCategory: string | null;
  setFilterCategory: (cat: string | null) => void;
}

const ReportsContext = createContext<ReportsContextType | null>(null);

const STORAGE_KEY = '@civiccare_reports_v1';
const USER_REPORT_MAP_KEY = '@civiccare_user_report_map_v1';
const DEVICE_TICKETS_KEY = '@civiccare_device_filed_tickets_v1';

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const [reports, setReports] = useState<CivicReportItem[]>(INITIAL_SAMPLE_REPORTS);
  const [userReportMap, setUserReportMap] = useState<Record<string, string[]>>({});
  const [deviceTickets, setDeviceTickets] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      // 1. Load user report map & device filed tickets
      let deviceTicketsList: string[] = [];
      try {
        const cachedDeviceTickets = await safeStorage.getItem(DEVICE_TICKETS_KEY);
        if (cachedDeviceTickets) {
          deviceTicketsList = JSON.parse(cachedDeviceTickets);
        }
      } catch {}

      let loadedMap: Record<string, string[]> = {};
      try {
        const cachedMapStr = await safeStorage.getItem(USER_REPORT_MAP_KEY);
        if (cachedMapStr) {
          loadedMap = JSON.parse(cachedMapStr);
          setUserReportMap(loadedMap);
        }
      } catch (err) {
        console.warn('Failed to parse cached userReportMap:', err);
      }

      // Merge tickets from userReportMap into deviceTicketsList
      Object.values(loadedMap).forEach((tickets) => {
        if (Array.isArray(tickets)) {
          tickets.forEach((t) => {
            if (!deviceTicketsList.includes(t)) deviceTicketsList.push(t);
          });
        }
      });

      // Ensure Palghar tickets filed on device are retained across reloads
      const SEEDED_USER_TICKETS = [
        '#CC20261026-7359', // Water Leak near Palghar
        '#CC20261026-5585', // Wildlife Hazard near Palghar
        '#CC20261025-3941', // Garbage near Palghar
        '#CC20261025-5368', // Streetlight near Palghar
      ];
      SEEDED_USER_TICKETS.forEach((t) => {
        if (!deviceTicketsList.includes(t)) deviceTicketsList.push(t);
      });

      setDeviceTickets(deviceTicketsList);
      safeStorage.setItem(DEVICE_TICKETS_KEY, JSON.stringify(deviceTicketsList)).catch(() => {});

      // 2. Load reports
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
    data: Omit<CivicReportItem, 'id' | 'ticket_number' | 'created_at' | 'timeline' | 'time_ago' | 'distance_km'>,
    authorUserId?: string
  ): Promise<CivicReportItem> => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const generatedTicket = `#CC${dateStr.slice(0, 8)}-${randomSuffix}`;

    const effectiveUserId = (data.user_id || authorUserId || 'guest_citizen').trim();

    const newReport: CivicReportItem = {
      ...data,
      id: `rep_${Date.now()}`,
      ticket_number: generatedTicket,
      user_id: effectiveUserId,
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

    // Save to device filed tickets
    setDeviceTickets(prev => {
      const next = [generatedTicket, ...prev.filter(t => t !== generatedTicket)];
      safeStorage.setItem(DEVICE_TICKETS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });

    // Save ticket mapping for this user
    setUserReportMap(prevMap => {
      const existing = prevMap[effectiveUserId] || [];
      const updatedList = [generatedTicket, ...existing.filter(t => t !== generatedTicket)];
      const nextMap = { ...prevMap, [effectiveUserId]: updatedList };
      safeStorage.setItem(USER_REPORT_MAP_KEY, JSON.stringify(nextMap)).catch(err => {
        console.warn('Failed to save user report map:', err);
      });
      return nextMap;
    });

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

  const getUserReports = (targetUserId?: string | null): CivicReportItem[] => {
    const isGuest = !targetUserId || targetUserId === 'guest_citizen';
    const effectiveId = isGuest ? 'guest_citizen' : targetUserId.trim();

    // Collect all tickets associated with this user or device
    const userTickets = new Set<string>([
      ...(userReportMap[effectiveId] || []),
      ...deviceTickets,
    ]);

    return reports.filter(r => {
      // 1. If checking guest mode:
      if (isGuest) {
        // Return only reports explicitly filed on this device
        return userTickets.has(r.ticket_number) || userTickets.has(r.id);
      }

      // 2. If checking authenticated citizen (e.g. Aryan):
      const matchesTicket = userTickets.has(r.ticket_number) || userTickets.has(r.id);
      const matchesUserId = Boolean(r.user_id && (r.user_id === effectiveId || r.user_id === targetUserId));
      return matchesTicket || matchesUserId;
    });
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
        userReportMap,
        getUserReports,
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
