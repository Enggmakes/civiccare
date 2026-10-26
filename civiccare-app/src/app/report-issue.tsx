import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CivicCareColors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useAppTheme } from '@/services/themeContext';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import {
  ArrowLeft,
  Camera,
  Image as ImageIcon,
  X,
  MapPin,
  RefreshCw,
  Edit3,
  Compass,
  AlertTriangle,
} from 'lucide-react-native';

import { useAuth, useUser } from '@/services/auth';

const { width } = Dimensions.get('window');

export default function ReportIssueScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useAppTheme();
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  
  // Real dynamic states - completely empty by default
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [description, setDescription] = useState<string>('');
  const [address, setAddress] = useState<string>('Detecting your GPS location...');
  const [latitude, setLatitude] = useState<number>(19.1197);
  const [longitude, setLongitude] = useState<number>(72.8397);
  const [isLocating, setIsLocating] = useState<boolean>(true);
  const [isCustomAddress, setIsCustomAddress] = useState<boolean>(false);
  const [manualAddressInput, setManualAddressInput] = useState<string>('');

  // Gate: Unauthenticated / guest users are immediately brought to sign in
  useEffect(() => {
    if (!isLoaded) return;
    const isRealCitizen = isSignedIn && user && user.id && user.id !== 'guest_citizen';
    if (!isRealCitizen) {
      Alert.alert(
        'Sign In Required',
        'Please sign in or create an account to file and track civic issues.',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => router.replace('/welcome') },
          { text: 'Sign In', onPress: () => router.replace('/auth') },
        ]
      );
      router.replace('/welcome');
    }
  }, [isLoaded, isSignedIn, user]);

  useEffect(() => {
    fetchCurrentLocation();
  }, []);

  const fetchCurrentLocation = async () => {
    setIsLocating(true);
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            setLatitude(lat);
            setLongitude(lon);
            await reverseGeocode(lat, lon);
            setIsLocating(false);
          },
          (err) => {
            console.warn('Web GPS fallback:', err);
            // Default Mumbai civic location if user denies location permission
            setAddress('Andheri West, Mumbai, Maharashtra (Tap Change to edit)');
            setIsLocating(false);
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setAddress('Location permission denied. Tap "Change" to enter manually.');
          setIsLocating(false);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setLatitude(loc.coords.latitude);
        setLongitude(loc.coords.longitude);
        await reverseGeocode(loc.coords.latitude, loc.coords.longitude);
        setIsLocating(false);
      }
    } catch (e) {
      console.warn('Location detection failed:', e);
      setAddress('Andheri West, Mumbai, Maharashtra (Tap Change to edit)');
      setIsLocating(false);
    }
  };

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      // Use OpenStreetMap Nominatim reverse geocoding for real street & neighborhood
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        { headers: { 'User-Agent': 'CivicCareApp/1.0' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          const parts = data.display_name.split(',');
          // Form a concise civic address from parts
          const cleanAddress = parts.slice(0, 4).join(',').trim();
          setAddress(cleanAddress || data.display_name);
          return;
        }
      }
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
    }

    setAddress(`Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)} (Near Current Location)`);
  };

  const handlePickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
        setPhotoBase64(result.assets[0].base64 || null);
      }
    } catch (e) {
      console.warn('Gallery picker error', e);
      Alert.alert('Upload Error', 'Could not access photo gallery.');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Camera Permission', 'Please allow camera access to take photo proof of the civic issue.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
        setPhotoBase64(result.assets[0].base64 || null);
      }
    } catch (e) {
      console.warn('Camera launch error', e);
      // Fallback to gallery if camera is unavailable on device/browser
      handlePickFromGallery();
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUri(null);
    setPhotoBase64(null);
  };

  const handleSaveManualAddress = () => {
    if (manualAddressInput.trim().length > 3) {
      setAddress(manualAddressInput.trim());
      setIsCustomAddress(false);
    } else {
      Alert.alert('Invalid Address', 'Please provide a valid street or landmark name.');
    }
  };

  const handleSubmit = () => {
    if (!photoUri) {
      Alert.alert(
        'Photo Proof Required',
        'Please take a photo or upload an image of the civic issue so AI can analyze and route it.'
      );
      return;
    }

    if (!description.trim() || description.trim().length < 5) {
      Alert.alert(
        'Description Required',
        'Please enter at least a few words describing the issue and hazard level.'
      );
      return;
    }

    // Navigate to Screen 5: AI Processing with real data and image base64
    router.push({
      pathname: '/ai-analysis',
      params: {
        photoUri,
        photoBase64: photoBase64 || '',
        description: description.trim(),
        address,
        latitude: latitude.toString(),
        longitude: longitude.toString(),
      },
    });
  };

  // Map tile URL centered at coordinates
  const mapTileUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=15&size=600x240&markers=${latitude},${longitude},red-pushpin`;

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }, isDark && { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Top Navigation Bar */}
      <View style={[styles.navBar, isDark && { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}>
          <ArrowLeft size={22} color={isDark ? colors.text : CivicCareColors.textMain} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, isDark && { color: colors.text }]}>Report Issue</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={[styles.scrollView, isDark && { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 60 }]}
        showsVerticalScrollIndicator={false}>
        
        {/* Photo Evidence Section */}
        <Text style={[styles.fieldLabel, isDark && { color: colors.text }]}>Photo Evidence (Required)</Text>
        
        {photoUri ? (
          <View style={[styles.photoAttachedContainer, isDark && { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            <Image source={{ uri: photoUri }} style={styles.photoPreviewFull} />
            <TouchableOpacity
              style={styles.deletePhotoBadge}
              activeOpacity={0.8}
              onPress={handleRemovePhoto}>
              <X size={16} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.photoBadgeRow}>
              <TouchableOpacity
                style={styles.retakeButton}
                activeOpacity={0.8}
                onPress={handleTakePhoto}>
                <Camera size={14} color="#FFFFFF" />
                <Text style={styles.retakeButtonText}>Retake</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.retakeButton}
                activeOpacity={0.8}
                onPress={handlePickFromGallery}>
                <ImageIcon size={14} color="#FFFFFF" />
                <Text style={styles.retakeButtonText}>Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.emptyPhotoBox}>
            <View style={styles.photoChoiceRow}>
              <TouchableOpacity
                style={[styles.photoActionCard, isDark && { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
                activeOpacity={0.8}
                onPress={handleTakePhoto}>
                <View style={[styles.photoIconCircle, { backgroundColor: isDark ? 'rgba(30, 96, 213, 0.18)' : '#EFF6FF' }]}>
                  <Camera size={26} color={isDark ? colors.tint : CivicCareColors.brandPrimary} />
                </View>
                <Text style={[styles.photoActionTitle, isDark && { color: colors.text }]}>Take Live Photo</Text>
                <Text style={[styles.photoActionSub, isDark && { color: colors.textSecondary }]}>Use phone camera</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.photoActionCard, isDark && { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
                activeOpacity={0.8}
                onPress={handlePickFromGallery}>
                <View style={[styles.photoIconCircle, { backgroundColor: isDark ? 'rgba(22, 163, 74, 0.18)' : '#F0FDF4' }]}>
                  <ImageIcon size={26} color="#16A34A" />
                </View>
                <Text style={[styles.photoActionTitle, isDark && { color: colors.text }]}>Choose Photo</Text>
                <Text style={[styles.photoActionSub, isDark && { color: colors.textSecondary }]}>Upload from gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Issue Description Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.fieldLabel, isDark && { color: colors.text }]}>Issue Description</Text>
          <View style={[styles.textAreaWrapper, isDark && { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
            <TextInput
              style={[styles.textArea, isDark && { color: colors.text }]}
              placeholder="Describe the issue, defect severity, and nearby landmarks (e.g. Deep pothole near city mall causing traffic danger)..."
              placeholderTextColor={isDark ? colors.textTertiary : CivicCareColors.textTertiary}
              multiline
              maxLength={300}
              value={description}
              onChangeText={setDescription}
              textAlignVertical="top"
            />
            <Text style={[styles.charCounter, isDark && { color: colors.textTertiary }]}>{description.length}/300</Text>
          </View>
        </View>

        {/* Auto-detected GPS Location Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.locationHeaderRow}>
            <View style={styles.locationTitleRow}>
              <Compass size={18} color={isDark ? colors.tint : CivicCareColors.brandPrimary} />
              <Text style={[styles.fieldLabel, isDark && { color: colors.text }]}>Auto-detected Location</Text>
            </View>
            <TouchableOpacity
              style={styles.refreshLocButton}
              activeOpacity={0.7}
              onPress={fetchCurrentLocation}>
              {isLocating ? (
                <ActivityIndicator size="small" color={isDark ? colors.tint : CivicCareColors.brandPrimary} />
              ) : (
                <View style={styles.refreshInner}>
                  <RefreshCw size={13} color={isDark ? colors.tint : CivicCareColors.brandPrimary} />
                  <Text style={[styles.refreshText, isDark && { color: colors.tint }]}>GPS Sync</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Real Map Preview Card */}
          <View style={[styles.mapCard, isDark && { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            <View style={styles.mapCanvasWrapper}>
              <Image
                source={{ uri: mapTileUrl }}
                style={styles.mapTileImage}
                resizeMode="cover"
              />
              <View style={styles.pinOverlay}>
                <MapPin size={34} color="#DC2626" fill="#FEE2E2" />
                <View style={styles.pinShadow} />
              </View>
              <View style={[styles.gpsCoordsBadge, isDark && { backgroundColor: 'rgba(0,0,0,0.75)' }]}>
                <Text style={styles.gpsCoordsText}>
                  {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </Text>
              </View>
            </View>

            {/* Address Row with Change / Edit Action */}
            <View style={[styles.addressRow, isDark && { borderTopColor: colors.border }]}>
              <View style={styles.addressTextWrapper}>
                <MapPin size={16} color={isDark ? colors.tint : CivicCareColors.brandPrimary} style={{ marginTop: 2 }} />
                <Text style={[styles.addressText, isDark && { color: colors.text }]}>{address}</Text>
              </View>
              <TouchableOpacity
                style={[styles.changeAddressButton, isDark && { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => {
                  setManualAddressInput(address);
                  setIsCustomAddress(!isCustomAddress);
                }}>
                <Text style={[styles.changeAddressText, isDark && { color: colors.tint }]}>
                  {isCustomAddress ? 'Cancel' : 'Change'}
                </Text>
              </TouchableOpacity>
            </View>

            {isCustomAddress && (
              <View style={[styles.customAddressBox, isDark && { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.customAddressInput, isDark && { color: colors.text }]}
                  placeholder="Enter street, landmark, or ward name..."
                  placeholderTextColor={isDark ? colors.textTertiary : CivicCareColors.textTertiary}
                  value={manualAddressInput}
                  onChangeText={setManualAddressInput}
                />
                <TouchableOpacity
                  style={styles.customAddressSaveBtn}
                  onPress={handleSaveManualAddress}>
                  <Text style={styles.customAddressSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Primary Submit Action */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!photoUri || description.trim().length < 5) && styles.submitButtonDisabled,
            ]}
            activeOpacity={0.88}
            onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Report to AI Analysis</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  navBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: CivicCareColors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: CivicCareColors.textMain,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.eight,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: CivicCareColors.textMain,
    marginBottom: Spacing.two,
  },
  emptyPhotoBox: {
    marginBottom: Spacing.five,
  },
  photoChoiceRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  photoActionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  photoActionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: CivicCareColors.textMain,
    marginBottom: 2,
  },
  photoActionSub: {
    fontSize: 11,
    color: CivicCareColors.textSecondary,
  },
  photoAttachedContainer: {
    position: 'relative',
    height: 180,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: CivicCareColors.border,
    marginBottom: Spacing.five,
    backgroundColor: '#0F172A',
  },
  photoPreviewFull: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  deletePhotoBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoBadgeRow: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    gap: 8,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  retakeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionContainer: {
    marginBottom: Spacing.five,
  },
  textAreaWrapper: {
    backgroundColor: CivicCareColors.bgSubtle,
    borderWidth: 1,
    borderColor: CivicCareColors.border,
    borderRadius: BorderRadius.xl,
    padding: Spacing.three,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  textArea: {
    fontSize: 14,
    color: CivicCareColors.textMain,
    lineHeight: 20,
    minHeight: 80,
  },
  charCounter: {
    fontSize: 12,
    color: CivicCareColors.textTertiary,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  locationHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  locationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  refreshLocButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  refreshInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  refreshText: {
    fontSize: 12,
    fontWeight: '700',
    color: CivicCareColors.brandPrimary,
  },
  mapCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: CivicCareColors.border,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  mapCanvasWrapper: {
    height: 140,
    backgroundColor: '#E2E8F0',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  mapTileImage: {
    width: '100%',
    height: '100%',
  },
  pinOverlay: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10,
  },
  pinShadow: {
    width: 14,
    height: 4,
    borderRadius: 7,
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    marginTop: -4,
  },
  gpsCoordsBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  gpsCoordsText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  addressRow: {
    padding: Spacing.three,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  addressTextWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    flex: 1,
  },
  addressText: {
    fontSize: 13,
    color: CivicCareColors.textMain,
    fontWeight: '500',
    lineHeight: 18,
    flex: 1,
  },
  changeAddressButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
  },
  changeAddressText: {
    fontSize: 13,
    fontWeight: '700',
    color: CivicCareColors.brandPrimary,
  },
  customAddressBox: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
    gap: 8,
  },
  customAddressInput: {
    flex: 1,
    backgroundColor: CivicCareColors.bgSubtle,
    borderWidth: 1,
    borderColor: CivicCareColors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.two,
    height: 38,
    fontSize: 13,
    color: CivicCareColors.textMain,
  },
  customAddressSaveBtn: {
    backgroundColor: CivicCareColors.brandPrimary,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: BorderRadius.lg,
  },
  customAddressSaveText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  bottomSection: {
    marginTop: Spacing.two,
  },
  submitButton: {
    backgroundColor: CivicCareColors.brandPrimary,
    height: 52,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: CivicCareColors.brandPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
