import React, { useState, useMemo, useRef, useEffect } from 'react';
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
import { useAppTheme } from '@/services/themeContext';
import { CivicReportItem } from '@/services/supabase';
import {
  MapPin,
  Navigation,
  Compass,
  Layers,
  ChevronRight,
  ShieldAlert,
  AlertCircle,
} from 'lucide-react-native';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

export default function NearbyMapScreen() {
  const router = useRouter();
  const { reports } = useReports();
  const { isDark, colors } = useAppTheme();
  const webViewRef = useRef<any>(null);

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Filter reports strictly according to selected category
  const filteredReports = useMemo(() => {
    if (categoryFilter === 'All') return reports;
    return reports.filter(r => (r.category || '').toLowerCase() === categoryFilter.toLowerCase());
  }, [reports, categoryFilter]);

  // Active selected report: MUST come from filteredReports
  const selectedReport = useMemo(() => {
    if (selectedReportId) {
      const foundInFiltered = filteredReports.find(r => r.id === selectedReportId);
      if (foundInFiltered) return foundInFiltered;
    }
    return filteredReports[0] || null;
  }, [selectedReportId, filteredReports]);

  // Center map on the active selected report's coordinates
  const centerLat = selectedReport?.latitude || 19.6970;
  const centerLng = selectedReport?.longitude || 72.7588;

  // Listen to web postMessage when running in browser or Expo Web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handleWebMessage = (event: MessageEvent) => {
        try {
          const msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          if (msg?.type === 'SELECT_REPORT' && msg.id) {
            setSelectedReportId(msg.id);
          }
        } catch {}
      };
      window.addEventListener('message', handleWebMessage);
      return () => window.removeEventListener('message', handleWebMessage);
    }
  }, []);

  const handleCategoryPress = (cat: string) => {
    setCategoryFilter(cat);
    const newFiltered = cat === 'All'
      ? reports
      : reports.filter(r => (r.category || '').toLowerCase() === cat.toLowerCase());

    if (newFiltered.length > 0) {
      const firstItem = newFiltered[0];
      setSelectedReportId(firstItem.id);
      if (webViewRef.current && firstItem.latitude && firstItem.longitude) {
        webViewRef.current.injectJavaScript(
          `if (window.panToCoordinates) { window.panToCoordinates(${firstItem.latitude}, ${firstItem.longitude}); } true;`
        );
      }
    } else {
      setSelectedReportId(null);
    }
  };

  // Generate markers JSON for Leaflet with colored category pins
  const markersJson = useMemo(() => {
    const data = filteredReports.map(rep => {
      const isSelected = rep.id === selectedReport?.id;
      const cat = (rep.category || '').toLowerCase();
      let catType = 'others';
      let gradient = 'linear-gradient(135deg, #6366F1, #4F46E5)'; // Default Indigo

      if (cat.includes('garbage')) {
        catType = 'garbage';
        gradient = 'linear-gradient(135deg, #10B981, #047857)'; // Emerald green
      } else if (cat.includes('pothole') || cat.includes('road')) {
        catType = 'pothole';
        gradient = 'linear-gradient(135deg, #EF4444, #B91C1C)'; // Crimson red
      } else if (cat.includes('streetlight') || cat.includes('light')) {
        catType = 'streetlight';
        gradient = 'linear-gradient(135deg, #F59E0B, #D97706)'; // Amber gold
      } else if (cat.includes('water')) {
        catType = 'water';
        gradient = 'linear-gradient(135deg, #0EA5E9, #0284C7)'; // Ocean blue
      }

      return {
        id: rep.id,
        lat: rep.latitude || 19.6970,
        lng: rep.longitude || 72.7588,
        title: rep.title,
        category: rep.category,
        catType,
        gradient,
        isSelected,
        severity: rep.severity,
      };
    });
    return JSON.stringify(data);
  }, [filteredReports, selectedReport?.id]);

  // Handle messages received from the interactive Leaflet map
  const handleMapMessage = (event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'SELECT_REPORT' && msg.id) {
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
    * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
    body, html, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: ${isDark ? '#121212' : '#F8FAFC'}; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
    ${isDark ? `
    .leaflet-tile-pane {
      filter: invert(100%) hue-rotate(180deg) brightness(88%) contrast(102%) saturate(70%);
    }
    ` : ''}
    .custom-pin-marker {
      background: transparent !important;
      border: none !important;
    }
    .pin-container {
      position: relative;
      width: 32px;
      height: 40px;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
    }
    .pin-head {
      width: 30px;
      height: 30px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2.5px solid #FFFFFF;
      box-shadow: 0 4px 10px rgba(0,0,0,0.35);
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
    }
    .pin-head.selected {
      transform: rotate(-45deg) scale(1.22);
      box-shadow: 0 6px 16px rgba(0,0,0,0.45), 0 0 0 4px rgba(59, 130, 246, 0.65);
      border-color: #FFFFFF;
      z-index: 999;
    }
    .pin-icon {
      transform: rotate(45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      filter: drop-shadow(0 1px 1.5px rgba(0,0,0,0.3));
    }
    .pin-shadow {
      position: absolute;
      bottom: 0px;
      left: 50%;
      transform: translateX(-50%);
      width: 12px;
      height: 4px;
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
      tap: false,
      maxZoom: 20
    }).setView([${centerLat}, ${centerLng}], 15);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 20,
      maxNativeZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    var markersData = ${markersJson};

    function getCategorySvg(type) {
      if (type === 'garbage') {
        return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>';
      }
      if (type === 'pothole') {
        return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
      }
      if (type === 'streetlight') {
        return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v3M12 19v3M5 5l2 2M17 17l2 2M2 12h3M19 12h3M5 19l2-2M17 7l2-2M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/></svg>';
      }
      if (type === 'water') {
        return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>';
      }
      return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
    }

    markersData.forEach(function(m) {
      var selectedClass = m.isSelected ? 'selected' : '';
      var pinHtml = '<div class="pin-container" data-id="' + m.id + '">' +
        '<div class="pin-head ' + selectedClass + '" style="background:' + m.gradient + ';">' +
        '<div class="pin-icon">' + getCategorySvg(m.catType) + '</div>' +
        '</div>' +
        '<div class="pin-shadow"></div>' +
        '</div>';

      var customIcon = L.divIcon({
        className: 'custom-pin-marker',
        html: pinHtml,
        iconSize: [32, 40],
        iconAnchor: [16, 39]
      });

      var marker = L.marker([m.lat, m.lng], { icon: customIcon }).addTo(map);

      marker.on('click', function(e) {
        L.DomEvent.stopPropagation(e);
        document.querySelectorAll('.pin-head').forEach(function(el) {
          el.classList.remove('selected');
        });
        var head = marker.getElement() ? marker.getElement().querySelector('.pin-head') : null;
        if (head) head.classList.add('selected');

        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECT_REPORT', id: m.id }));
        } else if (window.parent) {
          window.parent.postMessage(JSON.stringify({ type: 'SELECT_REPORT', id: m.id }), '*');
        }
      });
    });

    window.panToCoordinates = function(lat, lng) {
      map.flyTo([lat, lng], 15, { duration: 0.8 });
    };
  </script>
</body>
</html>
    `;
  }, [centerLat, centerLng, markersJson, isDark]);

  const handleRecenter = () => {
    if (webViewRef.current && selectedReport) {
      const lat = selectedReport.latitude || 19.6970;
      const lng = selectedReport.longitude || 72.7588;
      webViewRef.current.injectJavaScript(`if (window.panToCoordinates) { window.panToCoordinates(${lat}, ${lng}); } true;`);
    }
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }, isDark && { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Top Filter Bar */}
      <View style={[styles.topFilterBar, isDark && { backgroundColor: colors.backgroundElement, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {['All', 'Pothole', 'Garbage', 'Streetlight', 'Water Leak', 'Broken Road'].map(cat => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterChip,
                isDark && { backgroundColor: colors.card, borderColor: colors.border },
                categoryFilter === cat && styles.filterChipActive,
                categoryFilter === cat && isDark && { backgroundColor: colors.tint, borderColor: colors.tint },
              ]}
              onPress={() => handleCategoryPress(cat)}>
              <Text
                style={[
                  styles.filterChipText,
                  isDark && { color: colors.textSecondary },
                  categoryFilter === cat && styles.filterChipTextActive,
                  categoryFilter === cat && isDark && { color: '#FFFFFF' },
                ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Real Interactive Map Canvas */}
      <View style={[styles.mapCanvas, isDark && { backgroundColor: colors.background }]}>
        {Platform.OS === 'web' ? (
          <iframe
            srcDoc={leafletHtml}
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        ) : (
          <WebView
            ref={webViewRef}
            source={{ html: leafletHtml }}
            style={[styles.webView, isDark && { backgroundColor: colors.background }]}
            onMessage={handleMapMessage}
            scrollEnabled={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={false}
          />
        )}

        {/* Floating Recenter GPS Action Button */}
        <TouchableOpacity
          style={[styles.recenterButton, isDark && { backgroundColor: colors.card, borderColor: colors.border }]}
          activeOpacity={0.85}
          onPress={handleRecenter}>
          <Navigation size={20} color={isDark ? colors.tint : CivicCareColors.brandPrimary} />
        </TouchableOpacity>

        {/* Selected Incident Popup Card with Complete Rich Metadata */}
        {selectedReport ? (
          <View style={[styles.popupCardContainer, { bottom: insets.bottom + 80 }]}>
            <View style={[styles.popupCard, isDark && { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
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
                  <Text style={[styles.popupTitle, isDark && { color: colors.text }]} numberOfLines={1}>
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
                <Text style={[styles.popupTicket, isDark && { color: colors.tint }]}>
                  {selectedReport.ticket_number} • {selectedReport.category}
                </Text>

                {/* Location Address & Timestamp */}
                <Text style={[styles.popupAddress, isDark && { color: colors.textSecondary }]} numberOfLines={1}>
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
        ) : (
          <View style={[styles.emptyBannerContainer, { bottom: insets.bottom + 85 }]}>
            <View style={[styles.emptyBanner, isDark && { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
              <AlertCircle size={16} color={CivicCareColors.textSecondary} />
              <Text style={[styles.emptyBannerText, isDark && { color: colors.textSecondary }]}>
                No {categoryFilter} reports found in this area.
              </Text>
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
  emptyBannerContainer: {
    position: 'absolute',
    left: Spacing.four,
    right: Spacing.four,
    alignItems: 'center',
    zIndex: 50,
  },
  emptyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: CivicCareColors.border,
    ...Shadows.md,
  },
  emptyBannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: CivicCareColors.textSecondary,
  },
});
