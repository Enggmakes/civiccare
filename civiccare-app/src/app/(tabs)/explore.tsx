import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CivicCareColors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useReports } from '@/services/reportsStore';
import { CivicReportItem } from '@/services/supabase';
import {
  MapPin,
  Navigation,
  Compass,
  Layers,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react-native';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

export default function NearbyMapScreen() {
  const router = useRouter();
  const { reports } = useReports();
  const webViewRef = useRef<any>(null);

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Active selected report (defaults to the first report)
  const selectedReport = useMemo(() => {
    if (selectedReportId) {
      const found = reports.find(r => r.id === selectedReportId);
      if (found) return found;
    }
    return reports[0] || null;
  }, [selectedReportId, reports]);

  // Filter reports according to selected category
  const filteredReports = useMemo(() => {
    if (categoryFilter === 'All') return reports;
    return reports.filter(r => r.category === categoryFilter);
  }, [reports, categoryFilter]);

  // Center map on the selected report's coordinates or default to Palghar/Mumbai
  const centerLat = selectedReport?.latitude || 19.6967;
  const centerLng = selectedReport?.longitude || 72.7699;

  // Generate markers JSON for the Leaflet map with Flaticon-style category details
  const markersJson = useMemo(() => {
    const data = filteredReports.map(rep => {
      const isSelected = rep.id === selectedReport?.id;
      const cat = (rep.category || '').toLowerCase();
      let catType = 'others';
      let gradient = 'linear-gradient(135deg, #6366F1, #4F46E5)'; // Default Indigo

      if (cat.includes('garbage')) {
        catType = 'garbage';
        gradient = 'linear-gradient(135deg, #10B981, #047857)'; // Emerald green for garbage
      } else if (cat.includes('pothole') || cat.includes('road')) {
        catType = 'pothole';
        gradient = 'linear-gradient(135deg, #EF4444, #B91C1C)'; // Crimson red for pothole/road
      } else if (cat.includes('streetlight') || cat.includes('light')) {
        catType = 'streetlight';
        gradient = 'linear-gradient(135deg, #F59E0B, #D97706)'; // Amber gold for lighting
      } else if (cat.includes('water')) {
        catType = 'water';
        gradient = 'linear-gradient(135deg, #0EA5E9, #0284C7)'; // Ocean blue for water
      }

      return {
        id: rep.id,
        lat: rep.latitude || 19.6967,
        lng: rep.longitude || 72.7699,
        title: rep.title,
        category: rep.category,
        catType,
        gradient,
        isSelected,
        severity: rep.severity,
      };
    });
    return JSON.stringify(data);
  }, [filteredReports, selectedReport]);

  // Handle messages received from the interactive Leaflet map
  const handleMapMessage = (event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'SELECT_REPORT') {
        setSelectedReportId(msg.id);
      }
    } catch (e) {
      console.warn('Map interaction error:', e);
    }
  };

  // HTML content rendering interactive Leaflet OpenStreetMap with Flaticon-style 3D pins
  const leafletHtml = useMemo(() => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { -webkit-tap-highlight-color: transparent; }
    body, html, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
    .custom-pin-marker {
      background: transparent !important;
      border: none !important;
    }
    .pin-container {
      position: relative;
      width: 40px;
      height: 48px;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
    }
    .pin-head {
      width: 38px;
      height: 38px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2.5px solid #FFFFFF;
      box-shadow: 0 5px 14px rgba(0,0,0,0.32);
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
    }
    .pin-head.selected {
      transform: rotate(-45deg) scale(1.22);
      box-shadow: 0 8px 22px rgba(0,0,0,0.45), 0 0 0 4px rgba(37, 99, 235, 0.45);
      border-color: #FFFFFF;
      z-index: 999;
    }
    .pin-icon {
      transform: rotate(45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      filter: drop-shadow(0 1px 2px rgba(0,0,0,0.25));
    }
    .pin-shadow {
      position: absolute;
      bottom: 0px;
      left: 50%;
      transform: translateX(-50%);
      width: 14px;
      height: 5px;
      background: rgba(0,0,0,0.28);
      border-radius: 50%;
      filter: blur(1.5px);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      zoomControl: false,
      attributionControl: false,
      maxZoom: 20
    }).setView([${centerLat}, ${centerLng}], 14);

    // High-resolution OpenStreetMap tiles (Full coverage in India down to street level, no 'not available' placeholders)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 20,
      maxNativeZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    var markersData = ${markersJson};

    function getCategorySvg(type) {
      if (type === 'garbage') {
        // Flaticon Trash Can Icon
        return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>';
      }
      if (type === 'pothole') {
        // Flaticon Hazard Caution Icon
        return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
      }
      if (type === 'streetlight') {
        // Flaticon Streetlight / Lightbulb Icon
        return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v3M12 19v3M5 5l2 2M17 17l2 2M2 12h3M19 12h3M5 19l2-2M17 7l2-2M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/></svg>';
      }
      if (type === 'water') {
        // Flaticon Water Droplet Icon
        return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>';
      }
      // Default Flaticon Shield Icon
      return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
    }

    markersData.forEach(function(m) {
      var selectedClass = m.isSelected ? 'selected' : '';
      var pinHtml = '<div class="pin-container">' +
        '<div class="pin-head ' + selectedClass + '" style="background:' + m.gradient + ';">' +
        '<div class="pin-icon">' + getCategorySvg(m.catType) + '</div>' +
        '</div>' +
        '<div class="pin-shadow"></div>' +
        '</div>';

      var customIcon = L.divIcon({
        className: 'custom-pin-marker',
        html: pinHtml,
        iconSize: [40, 48],
        iconAnchor: [20, 47]
      });

      var marker = L.marker([m.lat, m.lng], { icon: customIcon }).addTo(map);
      marker.on('click', function() {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECT_REPORT', id: m.id }));
        } else if (window.parent) {
          window.parent.postMessage(JSON.stringify({ type: 'SELECT_REPORT', id: m.id }), '*');
        }
      });
    });

    window.panToCoordinates = function(lat, lng) {
      map.flyTo([lat, lng], 15, { duration: 1.0 });
    };
  </script>
</body>
</html>
    `;
  }, [centerLat, centerLng, markersJson]);

  const handleRecenter = () => {
    if (webViewRef.current && selectedReport) {
      const lat = selectedReport.latitude || 19.6967;
      const lng = selectedReport.longitude || 72.7699;
      webViewRef.current.injectJavaScript(`if (window.panToCoordinates) { window.panToCoordinates(${lat}, ${lng}); } true;`);
    }
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Top Filter Bar */}
      <View style={styles.topFilterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {['All', 'Pothole', 'Garbage', 'Streetlight', 'Water Leak', 'Broken Road'].map(cat => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterChip,
                categoryFilter === cat && styles.filterChipActive,
              ]}
              onPress={() => setCategoryFilter(cat)}>
              <Text
                style={[
                  styles.filterChipText,
                  categoryFilter === cat && styles.filterChipTextActive,
                ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Real Interactive Map Canvas */}
      <View style={styles.mapCanvas}>
        {Platform.OS === 'web' ? (
          <iframe
            srcDoc={leafletHtml}
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        ) : (
          <WebView
            ref={webViewRef}
            source={{ html: leafletHtml }}
            style={styles.webView}
            onMessage={handleMapMessage}
            scrollEnabled={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={false}
          />
        )}

        {/* Floating Recenter GPS Action Button */}
        <TouchableOpacity
          style={styles.recenterButton}
          activeOpacity={0.85}
          onPress={handleRecenter}>
          <Navigation size={20} color={CivicCareColors.brandPrimary} />
        </TouchableOpacity>

        {/* Selected Incident Popup Card with Complete Rich Metadata */}
        {selectedReport && (
          <View style={[styles.popupCardContainer, { bottom: insets.bottom + 80 }]}>
            <View style={styles.popupCard}>
              {/* Report Thumbnail Image */}
              <Image
                source={{
                  uri:
                    selectedReport.image_url ||
                    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600',
                }}
                style={styles.popupImage}
              />

              {/* Rich Metadata Section */}
              <View style={styles.popupDetails}>
                <View style={styles.popupTitleRow}>
                  <Text style={styles.popupTitle} numberOfLines={1}>
                    {selectedReport.title}
                  </Text>
                  <View
                    style={[
                      styles.severityBadge,
                      selectedReport.severity === 'High' || selectedReport.severity === 'Critical'
                        ? styles.bgHigh
                        : selectedReport.severity === 'Medium'
                        ? styles.bgMed
                        : styles.bgLow,
                    ]}>
                    <Text
                      style={[
                        styles.severityText,
                        selectedReport.severity === 'High' || selectedReport.severity === 'Critical'
                          ? styles.textHigh
                          : selectedReport.severity === 'Medium'
                          ? styles.textMed
                          : styles.textLow,
                      ]}>
                      {selectedReport.severity}
                    </Text>
                  </View>
                </View>

                {/* Ticket Number & Category */}
                <Text style={styles.popupTicket}>
                  {selectedReport.ticket_number} • {selectedReport.category}
                </Text>

                {/* Location Address & Timestamp */}
                <Text style={styles.popupAddress} numberOfLines={1}>
                  {selectedReport.location_address || 'Palghar, Maharashtra'} • {selectedReport.time_ago || 'Recently'}
                </Text>

                {/* View Details Button */}
                <TouchableOpacity
                  style={styles.viewDetailsButton}
                  activeOpacity={0.85}
                  onPress={() =>
                    router.push({ pathname: '/report-details', params: { id: selectedReport.id } })
                  }>
                  <Text style={styles.viewDetailsText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topFilterBar: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: CivicCareColors.border,
    justifyContent: 'center',
  },
  filterRow: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: CivicCareColors.bgSubtle,
    borderWidth: 1,
    borderColor: CivicCareColors.border,
  },
  filterChipActive: {
    backgroundColor: CivicCareColors.brandPrimary,
    borderColor: CivicCareColors.brandPrimary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: CivicCareColors.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  mapCanvas: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#F8FAFC',
  },
  webView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  recenterButton: {
    position: 'absolute',
    top: Spacing.four,
    right: Spacing.four,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
    borderWidth: 1,
    borderColor: CivicCareColors.border,
    zIndex: 10,
  },
  popupCardContainer: {
    position: 'absolute',
    bottom: 95,
    left: Spacing.four,
    right: Spacing.four,
    zIndex: 50,
  },
  popupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.three,
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CivicCareColors.border,
    ...Shadows.lg,
  },
  popupImage: {
    width: 82,
    height: 82,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#E2E8F0',
  },
  popupDetails: {
    flex: 1,
  },
  popupTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  popupTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: CivicCareColors.textMain,
    flex: 1,
    marginRight: 6,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '800',
  },
  bgHigh: {
    backgroundColor: '#FEE2E2',
  },
  textHigh: {
    color: '#DC2626',
  },
  bgMed: {
    backgroundColor: '#FFEDD5',
  },
  textMed: {
    color: '#EA580C',
  },
  bgLow: {
    backgroundColor: '#DCFCE7',
  },
  textLow: {
    color: '#16A34A',
  },
  popupTicket: {
    fontSize: 12,
    fontWeight: '700',
    color: CivicCareColors.brandPrimary,
    marginBottom: 2,
  },
  popupAddress: {
    fontSize: 11,
    color: CivicCareColors.textSecondary,
    marginBottom: 8,
  },
  viewDetailsButton: {
    backgroundColor: CivicCareColors.brandPrimary,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  viewDetailsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
