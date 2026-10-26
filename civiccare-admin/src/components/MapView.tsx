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

// Custom Leaflet SVG Map Pin generator
const createPinIcon = (status: string, severity: string) => {
  let color = '#0284C7'; // In-Progress blue
  if (status === 'Resolved' || status === 'Closed') color = '#10B981'; // Green
  else if (status === 'Pending' || status === 'Submitted') {
    color = severity === 'High' ? '#DC2626' : '#F59E0B'; // Red or Amber
  }

  const svgHtml = `
    <div style="
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
    ">
      <div style="
        width: 32px;
        height: 32px;
        background-color: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        border: 2px solid #FFFFFF;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background-color: #FFFFFF;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-map-pin',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
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

        {/* Legend */}
        <div style={styles.legendRow}>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendDot, backgroundColor: '#DC2626' }} />
            <span>Pending (Critical)</span>
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendDot, backgroundColor: '#0284C7' }} />
            <span>In-Progress</span>
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendDot, backgroundColor: '#10B981' }} />
            <span>Resolved</span>
          </div>
          <div style={styles.pinsCounter}>
            <span>{filteredReports.length} Map Markers</span>
          </div>
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
              icon={createPinIcon(report.status, report.severity)}>
              <Popup className="custom-popup">
                {/* Popup Card matching Screen 21 */}
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
                      <span style={styles.popupCategory}>{report.category_id}</span>
                    </div>

                    <p style={styles.popupAddress}>{report.formatted_address}</p>

                    <button
                      onClick={() => onSelectReport(report)}
                      style={styles.popupBtn}>
                      <span>View Details</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
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
  legendRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-muted)',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  legendDot: {
    width: '9px',
    height: '9px',
    borderRadius: '50%',
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
