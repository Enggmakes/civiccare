import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Filter,
  Layers,
  Calendar,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { matchesDepartment, type CivicReport } from '../types';

interface MapViewProps {
  reports: CivicReport[];
  onSelectReport: (report: CivicReport) => void;
  selectedDepartment: string;
}

// Auto-center and fit map bounds to active report coordinates
function MapAutoCenter({ reports }: { reports: CivicReport[] }) {
  const map = useMap();

  useEffect(() => {
    if (reports.length > 0) {
      const validCoords = reports
        .filter((r) => typeof r.latitude === 'number' && typeof r.longitude === 'number' && !isNaN(r.latitude) && !isNaN(r.longitude))
        .map((r) => [r.latitude, r.longitude] as [number, number]);

      if (validCoords.length === 1) {
        map.setView(validCoords[0], 13);
      } else if (validCoords.length > 1) {
        const bounds = L.latLngBounds(validCoords);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    }
  }, [reports, map]);

  return null;
}

// Inner Popup card that cleanly closes popup before triggering details drawer
function MapPopupCard({
  report,
  onSelectReport,
}: {
  report: CivicReport;
  onSelectReport: (r: CivicReport) => void;
}) {
  const map = useMap();

  return (
    <div style={styles.popupCard}>
      <img
        src={report.primary_image_url || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=300&auto=format&fit=crop&q=80'}
        alt={report.title}
        style={styles.popupImage}
      />
      <div style={styles.popupBody}>
        <div style={styles.popupTitleRow}>
          <span style={styles.popupTitle}>{report.title}</span>
          <span style={styles.popupId}>{report.ticket_number}</span>
        </div>

        <div style={styles.popupMetaRow}>
          <span
            style={{
              ...styles.popupBadge,
              backgroundColor:
                report.severity === 'High' ? '#FEE2E2' : '#EFF6FF',
              color: report.severity === 'High' ? '#DC2626' : '#2563EB',
            }}>
            {report.severity}
          </span>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <img
              src={getCategoryMeta(report.category_id).icon}
              alt={report.category_id}
              style={{ width: '16px', height: '16px', objectFit: 'contain' }}
            />
            <span style={styles.popupCategory}>{report.category_id}</span>
          </div>
        </div>

        <p style={styles.popupAddress}>{report.formatted_address}</p>

        <button
          onClick={() => {
            map.closePopup();
            onSelectReport(report);
          }}
          style={styles.popupBtn}>
          <span>View Details</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

// 9 Official Issue Categories matching Mobile App with Flaticons & Unique Colors
export const CATEGORY_META: Record<string, { color: string; icon: string; label: string }> = {
  Pothole: {
    color: '#0066FF',
    icon: '/assets/categories/pothole.png',
    label: 'Pothole',
  },
  Garbage: {
    color: '#10B981',
    icon: '/assets/categories/garbage.png',
    label: 'Garbage',
  },
  Streetlight: {
    color: '#F59E0B',
    icon: '/assets/categories/streetlight.png',
    label: 'Streetlight',
  },
  'Water Leak': {
    color: '#06B6D4',
    icon: '/assets/categories/water_leak.png',
    label: 'Water Leak',
  },
  'Broken Road': {
    color: '#8B5CF6',
    icon: '/assets/categories/broken_road.png',
    label: 'Broken Road',
  },
  Sewage: {
    color: '#92400E',
    icon: '/assets/categories/sewage.png',
    label: 'Sewage',
  },
  'Illegal Dumping': {
    color: '#EA580C',
    icon: '/assets/categories/illegal_dumping.png',
    label: 'Illegal Dumping',
  },
  Encroachment: {
    color: '#E11D48',
    icon: '/assets/categories/encroachment.png',
    label: 'Encroachment',
  },
  Others: {
    color: '#64748B',
    icon: '/assets/categories/others.png',
    label: 'Others',
  },
};

export const getCategoryMeta = (categoryName: string) => {
  if (!categoryName) return CATEGORY_META['Others'];
  const foundKey = Object.keys(CATEGORY_META).find(
    (k) => k.toLowerCase() === categoryName.toLowerCase() || categoryName.toLowerCase().includes(k.toLowerCase())
  );
  return foundKey ? CATEGORY_META[foundKey] : CATEGORY_META['Others'];
};

// Custom Leaflet SVG Map Pin generator with Flaticon inside and distinct category colors
const createPinIcon = (category: string, status: string, severity: string) => {
  const meta = getCategoryMeta(category);

  // Status indicator ring / dot color
  let statusColor = '#0284C7'; // In-Progress
  if (status === 'Resolved' || status === 'Closed') statusColor = '#10B981';
  else if (status === 'Pending' || status === 'Submitted') {
    statusColor = severity === 'High' ? '#DC2626' : '#F59E0B';
  }

  const svgHtml = `
    <div style="
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 44px;
      height: 52px;
      cursor: pointer;
      filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.28));
      transition: transform 0.18s ease;
    ">
      <!-- Head Circle with category border and white center -->
      <div style="
        position: relative;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: #FFFFFF;
        border: 3px solid ${meta.color};
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.18);
        box-sizing: border-box;
      ">
        <img
          src="${meta.icon}"
          alt="${meta.label}"
          style="
            width: 22px;
            height: 22px;
            object-fit: contain;
            display: block;
            pointer-events: none;
          "
        />
        <!-- Status indicator badge on top right -->
        <span style="
          position: absolute;
          top: -3px;
          right: -3px;
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background-color: ${statusColor};
          border: 2px solid #FFFFFF;
          box-shadow: 0 1px 3px rgba(0,0,0,0.25);
          display: block;
        "></span>
      </div>

      <!-- Pointing Triangle Anchor -->
      <div style="
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 8px solid ${meta.color};
        margin-top: -2px;
      "></div>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-category-map-pin',
    iconSize: [44, 52],
    iconAnchor: [22, 52],
    popupAnchor: [0, -50],
  });
};

export const MapView: React.FC<MapViewProps> = ({
  reports,
  onSelectReport,
  selectedDepartment,
}) => {
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');

  const filteredReports = reports.filter((r) => {
    if (!matchesDepartment(r, selectedDepartment)) {
      return false;
    }
    if (statusFilter !== 'All') {
      if (statusFilter === 'Pending' && r.status !== 'Pending' && r.status !== 'Submitted') return false;
      if (statusFilter === 'In Progress' && r.status !== 'In Progress') return false;
      if (statusFilter === 'Resolved' && r.status !== 'Resolved' && r.status !== 'Closed') return false;
    }
    if (categoryFilter !== 'All' && r.category_id !== categoryFilter) return false;
    if (severityFilter !== 'All' && r.severity !== severityFilter) return false;
    return true;
  });

  // Calculate dynamic center coordinate
  const firstWithCoords = filteredReports.find((r) => r.latitude && r.longitude) || reports.find((r) => r.latitude && r.longitude);
  const defaultCenter: [number, number] = firstWithCoords
    ? [firstWithCoords.latitude, firstWithCoords.longitude]
    : [19.6971, 72.7588];

  return (
    <div style={styles.container}>
      {/* Top Filter Bar matching Screen 21 */}
      <div style={styles.topBar}>
        <div style={styles.filtersRow}>
          {/* Category Filter */}
          <div style={styles.filterControl}>
            <Layers size={14} color="var(--text-tertiary)" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={styles.select}>
              <option value="All">All Categories</option>
              <option value="Pothole">Pothole</option>
              <option value="Garbage">Garbage</option>
              <option value="Streetlight">Streetlight</option>
              <option value="Water Leak">Water Leak</option>
              <option value="Broken Road">Broken Road</option>
              <option value="Others">Others</option>
            </select>
          </div>

          {/* Status Filter */}
          <div style={styles.filterControl}>
            <Filter size={14} color="var(--text-tertiary)" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.select}>
              <option value="All">All Statuses</option>
              <option value="Pending">Pending / Submitted (Amber/Red)</option>
              <option value="In Progress">In-Progress (Blue)</option>
              <option value="Resolved">Resolved (Green)</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div style={styles.filterControl}>
            <AlertTriangle size={14} color="var(--text-tertiary)" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              style={styles.select}>
              <option value="All">All Severities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Date Range Badge */}
          <div style={styles.dateBadge}>
            <Calendar size={13} color="var(--text-muted)" />
            <span>Oct 1, 2026 - Oct 26, 2026</span>
          </div>
        </div>

        {/* Active Markers Count Badge */}
        <div style={styles.pinsCounter}>
          <span>{filteredReports.length} Map Markers</span>
        </div>
      </div>

      {/* Map Canvas matching Screen 21 */}
      <div style={styles.mapWrapper}>
        <MapContainer
          center={defaultCenter}
          zoom={12}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapAutoCenter reports={filteredReports} />

          {filteredReports.map((report) => (
            <Marker
              key={report.id}
              position={[report.latitude || 19.1197, report.longitude || 72.8397]}
              icon={createPinIcon(report.category_id, report.status, report.severity)}>
              <Popup className="custom-popup">
                <MapPopupCard report={report} onSelectReport={onSelectReport} />
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    height: 'calc(100vh - 74px)',
  },
  topBar: {
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '16px',
    padding: '14px 20px',
    border: '1px solid var(--border-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
    boxShadow: 'var(--shadow-sm)',
    position: 'relative',
    zIndex: 5,
  },
  filtersRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  filterControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--bg-surface-secondary)',
    border: '1px solid var(--border-light)',
    borderRadius: '10px',
    padding: '6px 12px',
  },
  select: {
    background: 'none',
    border: 'none',
    color: 'var(--text-main)',
    fontSize: '13px',
    fontWeight: '600',
    outline: 'none',
    cursor: 'pointer',
  },
  dateBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'var(--bg-surface-secondary)',
    border: '1px solid var(--border-light)',
    borderRadius: '10px',
    padding: '8px 12px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-muted)',
  },
  pinsCounter: {
    backgroundColor: '#EFF6FF',
    color: '#0066FF',
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '9999px',
    border: '1px solid #BFDBFE',
  },
  mapWrapper: {
    flex: 1,
    borderRadius: '20px',
    overflow: 'hidden',
    border: '1px solid var(--border-light)',
    boxShadow: 'var(--shadow-md)',
    position: 'relative',
    zIndex: 1,
    isolation: 'isolate',
  },
  popupCard: {
    width: '240px',
    borderRadius: '12px',
    overflow: 'hidden',
    fontFamily: 'inherit',
  },
  popupImage: {
    width: '100%',
    height: '110px',
    objectFit: 'cover',
  },
  popupBody: {
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  popupTitleRow: {
    display: 'flex',
    flexDirection: 'column',
  },
  popupTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: '1.3',
  },
  popupId: {
    fontSize: '11px',
    color: '#64748B',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  popupMetaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '2px',
  },
  popupBadge: {
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  popupCategory: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#64748B',
  },
  popupAddress: {
    fontSize: '11px',
    color: '#64748B',
    lineHeight: '1.3',
  },
  popupBtn: {
    marginTop: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    backgroundColor: '#0066FF',
    color: '#FFFFFF',
    padding: '8px 12px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
  },
};
