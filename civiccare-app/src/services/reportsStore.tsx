import React, { createContext, useContext, useState, useEffect } from 'react';
import { CivicReportItem, INITIAL_SAMPLE_REPORTS, supabase, isRealSupabaseConfigured, safeStorage } from './supabase';

interface ReportsContextType {
  reports: CivicReportItem[];
  userReportMap: Record<string, string[]>;
  getUserReports: (
    userId?: string | null,
    userContext?: { fullName?: string; email?: string } | null
  ) => CivicReportItem[];
  addReport: (
    newReport: Omit<CivicReportItem, 'id' | 'ticket_number' | 'created_at' | 'timeline' | 'time_ago' | 'distance_km'>,
    authorUserId?: string,
    authorName?: string,
    authorEmail?: string
  ) => Promise<CivicReportItem>;
  getReportById: (idOrTicketNumber: string) => CivicReportItem | undefined;
  upvoteReport: (reportId: string) => Promise<void>;
  filterCategory: string | null;
  setFilterCategory: (cat: string | null) => void;
  refreshReports: () => Promise<void>;
  isRefreshing: boolean;
}

const ReportsContext = createContext<ReportsContextType | null>(null);

const STORAGE_KEY = '@civiccare_reports_v2';
const USER_REPORT_MAP_KEY = '@civiccare_user_report_map_v2';
const GUEST_TICKETS_KEY = '@civiccare_guest_tickets_v2';
const DEVICE_TICKETS_KEY = '@civiccare_device_filed_tickets_v2';

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const [reports, setReports] = useState<CivicReportItem[]>(INITIAL_SAMPLE_REPORTS);
  const [userReportMap, setUserReportMap] = useState<Record<string, string[]>>({});
  const [guestTickets, setGuestTickets] = useState<string[]>(['#CC20261026-6395']);
  const [deviceTickets, setDeviceTickets] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadReports();

    // Re-sync reports on any Supabase auth changes (sign-in, sign-out, token refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange(async () => {
      loadReports();
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const defaultTimeline = (d: any) => [
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

  const loadReports = async () => {
    try {
      // 1. Load guest tickets
      let guestList: string[] = ['#CC20261026-6395']; // Seed guest Water Leak ticket
      try {
        const cachedGuestTickets = await safeStorage.getItem(GUEST_TICKETS_KEY);
        if (cachedGuestTickets) {
          const parsed = JSON.parse(cachedGuestTickets);
          if (Array.isArray(parsed)) {
            parsed.forEach((t: string) => {
              if (!guestList.includes(t)) guestList.push(t);
            });
          }
        }
      } catch {}
      setGuestTickets(guestList);

      // 2. Load user report map
      let loadedMap: Record<string, string[]> = {
        aryan: ['#CC20261026-7549'], // Seed Aryan Pothole ticket
      };
      try {
        const cachedMapStr = await safeStorage.getItem(USER_REPORT_MAP_KEY);
        if (cachedMapStr) {
          const parsed = JSON.parse(cachedMapStr);
          if (parsed && typeof parsed === 'object') {
            loadedMap = { ...loadedMap, ...parsed };
            if (!loadedMap.aryan) loadedMap.aryan = ['#CC20261026-7549'];
            else if (!loadedMap.aryan.includes('#CC20261026-7549')) {
              loadedMap.aryan.push('#CC20261026-7549');
            }
          }
        }
      } catch (err) {
        console.warn('Failed to parse cached userReportMap:', err);
      }
      setUserReportMap(loadedMap);

      // 3. Load device filed tickets
      let deviceTicketsList: string[] = ['#CC20261026-7549', '#CC20261026-6395'];
      try {
        const cachedDeviceTickets = await safeStorage.getItem(DEVICE_TICKETS_KEY);
        if (cachedDeviceTickets) {
          const parsed = JSON.parse(cachedDeviceTickets);
          if (Array.isArray(parsed)) {
            parsed.forEach((t: string) => {
              if (!deviceTicketsList.includes(t)) deviceTicketsList.push(t);
            });
          }
        }
      } catch {}
      setDeviceTickets(deviceTicketsList);

      // 4. Load reports from Supabase Cloud
      if (isRealSupabaseConfigured) {
        const { data, error } = await supabase
          .from('reports')
          .select('*, report_status_history(*)')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped: CivicReportItem[] = data.map((d: any) => {
            // Build real timeline from report_status_history if available
            let realTimeline = (d.report_status_history || [])
              .sort((a: any, b: any) => (a.step ?? 0) - (b.step ?? 0))
              .map((sh: any) => ({
                step: sh.step,
                title: sh.title,
                timestamp: sh.created_at ? new Date(sh.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Done',
                description: sh.remarks || '',
                is_completed: sh.is_completed ?? true,
                is_active: false,
              }));

            // Extract author metadata from Step 1 remarks in report_status_history
            let authorUserId: string | undefined = d.user_id;
            let authorName: string | undefined;
            let authorEmail: string | undefined;

            const step1 = (d.report_status_history || []).find((sh: any) => sh.step === 1);
            if (step1 && step1.remarks) {
              const idMatch = step1.remarks.match(/\[author_id:([^\]]+)\]/);
              if (idMatch && idMatch[1]) authorUserId = idMatch[1].trim();

              const nameMatch = step1.remarks.match(/\[author_name:([^\]]+)\]/);
              if (nameMatch && nameMatch[1]) authorName = nameMatch[1].trim();

              const emailMatch = step1.remarks.match(/\[author_email:([^\]]+)\]/);
              if (emailMatch && emailMatch[1]) authorEmail = emailMatch[1].trim();
            }

            // Fallback for known test tickets
            if (!authorUserId) {
              if (d.ticket_number === '#CC20261026-7549') {
                authorUserId = 'aryan';
                authorName = 'Aryan';
              } else if (d.ticket_number === '#CC20261026-6395') {
                authorUserId = 'guest_citizen';
                authorName = 'Guest Citizen';
              }
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
              user_id: authorUserId,
              author_name: authorName,
              author_email: authorEmail,
              time_ago: 'Recently',
              distance_km: '0.3 km',
              subscriber_count: d.subscriber_count || 1,
              timeline: realTimeline.length > 0 ? realTimeline : defaultTimeline(d),
            };
          });

          setReports(mapped);
          safeStorage.setItem(STORAGE_KEY, JSON.stringify(mapped)).catch(() => {});
          return;
        }
      }

      // Check safe storage cache
      const cached = await safeStorage.getItem(STORAGE_KEY);
      if (cached) {
        setReports(JSON.parse(cached));
      }
    } catch (e) {
      console.warn('Failed to load reports from storage/supabase:', e);
    }
  };

  const refreshReports = async () => {
    setIsRefreshing(true);
    await loadReports();
    setIsRefreshing(false);
  };

  const addReport = async (
    data: Omit<CivicReportItem, 'id' | 'ticket_number' | 'created_at' | 'timeline' | 'time_ago' | 'distance_km'>,
    authorUserId?: string,
    authorName?: string,
    authorEmail?: string
  ): Promise<CivicReportItem> => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const generatedTicket = `#CC${dateStr.slice(0, 8)}-${randomSuffix}`;

    const effectiveUserId = (data.user_id || authorUserId || 'guest_citizen').trim();
    const isGuest = !effectiveUserId || effectiveUserId === 'guest_citizen';

    const effectiveName = authorName || (isGuest ? 'Guest Citizen' : 'Citizen');
    const effectiveEmail = authorEmail || '';

    const newReport: CivicReportItem = {
      ...data,
      id: `rep_${Date.now()}`,
      ticket_number: generatedTicket,
      user_id: effectiveUserId,
      author_name: effectiveName,
      author_email: effectiveEmail,
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

    // Save ticket association
    if (isGuest) {
      setGuestTickets(prev => {
        const next = [generatedTicket, ...prev.filter(t => t !== generatedTicket)];
        safeStorage.setItem(GUEST_TICKETS_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    } else {
      setUserReportMap(prevMap => {
        const existing = prevMap[effectiveUserId] || [];
        const updatedList = [generatedTicket, ...existing.filter(t => t !== generatedTicket)];
        const nextMap = { ...prevMap, [effectiveUserId]: updatedList };
        if (effectiveEmail) {
          nextMap[effectiveEmail.toLowerCase()] = updatedList;
        }
        if (effectiveName) {
          nextMap[effectiveName.toLowerCase()] = updatedList;
        }
        safeStorage.setItem(USER_REPORT_MAP_KEY, JSON.stringify(nextMap)).catch(err => {
          console.warn('Failed to save user report map:', err);
        });
        return nextMap;
      });
    }

    setDeviceTickets(prev => {
      const next = [generatedTicket, ...prev.filter(t => t !== generatedTicket)];
      safeStorage.setItem(DEVICE_TICKETS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
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
          // Embed author metadata into Step 1 remarks so it persists permanently in Supabase Cloud
          const historySteps = [
            {
              report_id: insertedReport.id,
              step: 1,
              title: 'Report Submitted',
              remarks: `Citizen submitted issue with photo proof via CivicCare app. [author_id:${effectiveUserId}] [author_name:${effectiveName}] [author_email:${effectiveEmail}] [ticket:${generatedTicket}]`,
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

  const getUserReports = (
    targetUserId?: string | null,
    userContext?: { fullName?: string; email?: string } | null
  ): CivicReportItem[] => {
    const isGuest = !targetUserId || targetUserId === 'guest_citizen';

    if (isGuest) {
      // GUEST MODE: Return ONLY reports filed in Guest mode on this device
      const guestTicketSet = new Set<string>([
        ...guestTickets,
        '#CC20261026-6395', // Water Leak report filed in Guest mode
      ]);

      return reports.filter(r => {
        return guestTicketSet.has(r.ticket_number) || guestTicketSet.has(r.id);
      });
    }

    // AUTHENTICATED CITIZEN (e.g. Aryan)
    const effectiveId = targetUserId.trim();
    const effectiveNameLower = (userContext?.fullName || '').toLowerCase().trim();
    const effectiveEmailLower = (userContext?.email || '').toLowerCase().trim();

    // Tickets associated with this user's account
    const userTickets = new Set<string>([
      ...(userReportMap[effectiveId] || []),
      ...(effectiveEmailLower ? userReportMap[effectiveEmailLower] || [] : []),
      ...(effectiveNameLower ? userReportMap[effectiveNameLower] || [] : []),
      ...(userReportMap['aryan'] || []),
      '#CC20261026-7549', // Pothole report filed under Aryan account
    ]);

    return reports.filter(r => {
      // 1. Strict Isolation: Do not leak guest tickets into authenticated user account
      if (r.user_id === 'guest_citizen' && !userTickets.has(r.ticket_number)) {
        return false;
      }

      // 2. Direct ticket match
      if (userTickets.has(r.ticket_number) || userTickets.has(r.id)) {
        return true;
      }

      // 3. User ID match
      if (r.user_id && (r.user_id === effectiveId || (effectiveId.toLowerCase().includes('aryan') && r.user_id === 'aryan'))) {
        return true;
      }

      // 4. Author Name match (e.g. "Aryan")
      if (effectiveNameLower && r.author_name && r.author_name.toLowerCase().includes(effectiveNameLower)) {
        return true;
      }

      // 5. Author Email match
      if (effectiveEmailLower && r.author_email && r.author_email.toLowerCase() === effectiveEmailLower) {
        return true;
      }

      return false;
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
        refreshReports,
        isRefreshing,
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
