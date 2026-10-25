import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CivicCareColors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useReports } from '@/services/reportsStore';
import { useAppTheme } from '@/services/themeContext';
import { uploadReportImageToSupabase } from '@/services/storageUploader';
import { ArrowLeft, Cpu, CheckCircle2, Circle } from 'lucide-react-native';

interface StepItem {
  id: number;
  label: string;
  status: 'completed' | 'processing' | 'pending';
}

export default function AIAnalysisScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useAppTheme();
  const params = useLocalSearchParams<{
    photoUri?: string;
    photoBase64?: string;
    description?: string;
    address?: string;
    latitude?: string;
    longitude?: string;
  }>();
  const { addReport } = useReports();

  const [steps, setSteps] = useState<StepItem[]>([
    { id: 1, label: 'Image analysis', status: 'completed' },
    { id: 2, label: 'Text analysis', status: 'completed' },
    { id: 3, label: 'Detecting category', status: 'processing' },
    { id: 4, label: 'Estimating severity', status: 'pending' },
    { id: 5, label: 'Finding similar reports', status: 'pending' },
  ]);

  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Subtle breathing animation for AI emblem
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Sequence simulated AI inference pipeline matching Screen 5 in image.png
    const timer1 = setTimeout(() => {
      setSteps(prev =>
        prev.map(s => {
          if (s.id === 3) return { ...s, status: 'completed' };
          if (s.id === 4) return { ...s, status: 'processing' };
          return s;
        })
      );
    }, 900);

    const timer2 = setTimeout(() => {
      setSteps(prev =>
        prev.map(s => {
          if (s.id === 4) return { ...s, status: 'completed' };
          if (s.id === 5) return { ...s, status: 'processing' };
          return s;
        })
      );
    }, 1700);

    const timer3 = setTimeout(async () => {
      setSteps(prev => prev.map(s => ({ ...s, status: 'completed' })));

      const realLat = params.latitude ? parseFloat(params.latitude) : 19.1197;
      const realLng = params.longitude ? parseFloat(params.longitude) : 72.8397;
      const realDesc = params.description || 'Civic issue reported';
      const realAddress = params.address || 'Mumbai, Maharashtra';
      const realPhoto = params.photoUri || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80';

      let aiCategory = 'Pothole';
      let aiSeverity: 'Low' | 'Medium' | 'High' | 'Critical' = 'High';
      let aiDept = 'Road Maintenance Department';
      let aiDeptId = 'b3a985d2-6d43-4f51-b844-3d0d8bb00101';

      // 1. Verify photo with AI Defect Detection BEFORE uploading to Supabase Storage
      try {
        const aiUrl =
          process.env.EXPO_PUBLIC_AI_BACKEND_URL ||
          (Platform.OS === 'web' ? 'http://localhost:8000/analyze' : 'http://192.168.7.9:8000/analyze');
        
        const aiRes = await fetch(aiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description: realDesc,
            latitude: realLat,
            longitude: realLng,
            image_url: null,
            image_base64: params.photoBase64 || null,
          }),
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          
          // Anti-False-Positive check: Reject selfies / personal indoor photos
          // NO IMAGE IS UPLOADED TO SUPABASE IF REJECTED!
          if (aiData.is_valid_civic === false) {
            Alert.alert(
              'Civic Issue Verification',
              aiData.rejection_reason || 'This photo was flagged as a selfie or indoor/personal image. CivicCare requires photos of public civic issues (e.g. pothole, garbage, streetlight, water leak).',
              [
                {
                  text: 'Retake Photo',
                  onPress: () => router.back(),
                },
              ]
            );
            return;
          }

          aiCategory = aiData.category_predicted || 'Pothole';
          aiSeverity = (aiData.severity_estimated as any) || 'High';
          aiDept = aiData.suggested_department || 'Road Maintenance Department';
          if (aiData.department_id) {
            aiDeptId = aiData.department_id;
          }
        }
      } catch (e) {
        console.warn('AI analysis call fallback:', e);
      }

      // 2. ONLY upload photo to Supabase Storage AFTER passing civic verification
      let cloudImageUrl = realPhoto;
      if (realPhoto && !realPhoto.startsWith('http')) {
        cloudImageUrl = await uploadReportImageToSupabase(realPhoto, params.photoBase64);
      }

      // Generate intelligent title from category and location
      const addressHeadline = realAddress.split(',')[0].trim();
      let reportTitle = `${aiCategory} near ${addressHeadline}`;
      if (aiCategory === 'Others') {
        const lowerDesc = realDesc.toLowerCase();
        if (
          lowerDesc.includes('snake') ||
          lowerDesc.includes('cobra') ||
          lowerDesc.includes('python') ||
          lowerDesc.includes('viper') ||
          lowerDesc.includes('animal') ||
          aiDept.includes('Animal')
        ) {
          reportTitle = `Wildlife Hazard near ${addressHeadline}`;
        } else if (lowerDesc.includes('tree') || lowerDesc.includes('branch')) {
          reportTitle = `Fallen Tree / Debris near ${addressHeadline}`;
        } else {
          reportTitle = `Public Safety Hazard near ${addressHeadline}`;
        }
      }

      // Commit report to store and live Supabase
      const created = await addReport({
        title: reportTitle,
        description: realDesc,
        category: aiCategory as any,
        severity: aiSeverity,
        status: 'Submitted',
        location_address: realAddress,
        latitude: realLat,
        longitude: realLng,
        image_url: cloudImageUrl,
        department_name: aiDept,
        department_id: aiDeptId,
      });

      // Navigate to Screen 6: Report Submitted
      setTimeout(() => {
        router.replace({
          pathname: '/report-submitted',
          params: {
            reportId: created.id,
            ticketNumber: created.ticket_number,
            category: created.category,
            severity: created.severity,
            address: created.location_address,
          },
        });
      }, 600);
    }, 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }, isDark && { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Top Nav */}
      <View style={[styles.navBar, isDark && { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}>
          <ArrowLeft size={22} color={isDark ? colors.text : CivicCareColors.textMain} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, isDark && { color: colors.text }]}>AI Analysis</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Central Glowing AI Neural Icon */}
        <View style={styles.emblemContainer}>
          <Animated.View
            style={[
              styles.glowHalo,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}>
            <View style={[styles.iconCircle, isDark && { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Cpu size={42} color={isDark ? colors.tint : CivicCareColors.brandPrimary} strokeWidth={2.2} />
            </View>
          </Animated.View>
        </View>

        {/* Headings */}
        <View style={styles.headerTextSection}>
          <Text style={[styles.mainTitle, isDark && { color: colors.text }]}>Analyzing your report...</Text>
          <Text style={[styles.subTitle, isDark && { color: colors.textSecondary }]}>
            Our AI is analyzing the image and description to detect the issue type and severity.
          </Text>
        </View>

        {/* Processing Checklist */}
        <View style={[styles.checklistCard, isDark && { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          {steps.map(step => (
            <View key={step.id} style={[styles.checklistItem, isDark && { borderBottomColor: colors.border }]}>
              <Text style={[styles.stepLabel, isDark && { color: colors.text }]}>{step.label}</Text>
              
              <View style={styles.stepIndicator}>
                {step.status === 'completed' ? (
                  <CheckCircle2 size={22} color={CivicCareColors.success} fill={isDark ? 'rgba(22, 163, 74, 0.25)' : '#DCFCE7'} />
                ) : step.status === 'processing' ? (
                  <ActivityIndicator size="small" color={isDark ? colors.tint : CivicCareColors.brandPrimary} />
                ) : (
                  <Circle size={22} color={isDark ? colors.border : '#CBD5E1'} strokeWidth={1.5} />
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
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
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
    alignItems: 'center',
  },
  emblemContainer: {
    marginVertical: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowHalo: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DBEAFE',
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  headerTextSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    marginBottom: Spacing.six,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: CivicCareColors.textMain,
    marginBottom: Spacing.one,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 14,
    color: CivicCareColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.three,
  },
  checklistCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderWidth: 1,
    borderColor: CivicCareColors.border,
    ...Shadows.sm,
  },
  checklistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two + 2,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  stepLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: CivicCareColors.textMain,
  },
  stepIndicator: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
