import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';

interface ThemeSwitchProps {
  isDark: boolean;
  onToggle: () => void;
}

export function ThemeSwitch({ isDark, onToggle }: ThemeSwitchProps) {
  const animatedValue = useRef(new Animated.Value(isDark ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isDark ? 1 : 0,
      duration: 380,
      useNativeDriver: false,
    }).start();
  }, [isDark]);

  // Container Background: Day Sky (#3D7EAE) to Night Sky (#1D1F2C)
  const containerBg = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#3D7EAE', '#1D1F2C'],
  });

  // Orb Sliding: 32px travel distance
  const orbTranslateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 32],
  });

  // Moon slides in from right (+100%) to 0 inside the orb
  const moonTranslateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 0],
  });

  // Clouds slide down and fade away in dark mode
  const cloudsTranslateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });

  const cloudsOpacity = animatedValue.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [1, 0.2, 0],
  });

  // Stars drop down from top and fade in in dark mode
  const starsTranslateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-16, 0],
  });

  const starsOpacity = animatedValue.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0.3, 1],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onToggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: isDark }}
      accessibilityLabel="Toggle Dark and Light Mode">
      <Animated.View style={[styles.container, { backgroundColor: containerBg }]}>
        {/* Night Stars (Layered white twinkle points) */}
        <Animated.View
          style={[
            styles.starsContainer,
            {
              transform: [{ translateY: starsTranslateY }],
              opacity: starsOpacity,
            },
          ]}>
          {/* Star 1 */}
          <View style={[styles.starDot, { top: 6, left: 8, width: 2.5, height: 2.5 }]} />
          {/* Star 2 (Center sparkle) */}
          <View style={[styles.starDot, { top: 13, left: 14, width: 3.5, height: 3.5, borderRadius: 1.75 }]} />
          {/* Star 3 */}
          <View style={[styles.starDot, { top: 18, left: 7, width: 2, height: 2 }]} />
          {/* Star 4 */}
          <View style={[styles.starDot, { top: 5, left: 21, width: 2, height: 2 }]} />
          {/* Star 5 */}
          <View style={[styles.starDot, { top: 11, left: 26, width: 2.5, height: 2.5 }]} />
          {/* Tiny accent 6 */}
          <View style={[styles.starDot, { top: 19, left: 22, width: 1.5, height: 1.5 }]} />
        </Animated.View>

        {/* Day Clouds (Layered Back #AACADF and Front #F3FDFF) */}
        <Animated.View
          style={[
            styles.cloudsContainer,
            {
              transform: [{ translateY: cloudsTranslateY }],
              opacity: cloudsOpacity,
            },
          ]}>
          {/* Back Clouds (Subtle cyan-blue shading #AACADF) */}
          <View style={[styles.cloud, styles.cloudBack, { width: 15, height: 15, right: 19, bottom: -4 }]} />
          <View style={[styles.cloud, styles.cloudBack, { width: 20, height: 20, right: 7, bottom: -3 }]} />
          <View style={[styles.cloud, styles.cloudBack, { width: 14, height: 14, right: -1, bottom: -4 }]} />

          {/* Front Clouds (Crisp cloud puffs #F3FDFF) */}
          <View style={[styles.cloud, styles.cloudFront, { width: 17, height: 17, right: 15, bottom: -6 }]} />
          <View style={[styles.cloud, styles.cloudFront, { width: 22, height: 22, right: 3, bottom: -5 }]} />
          <View style={[styles.cloud, styles.cloudFront, { width: 14, height: 14, right: 22, bottom: -7 }]} />
        </Animated.View>

        {/* Sliding Orb: Sun & Moon */}
        <Animated.View
          style={[
            styles.orbWrapper,
            {
              transform: [{ translateX: orbTranslateX }],
            },
          ]}>
          {/* Atmospheric Halo Ring */}
          <View style={styles.haloRing} />

          {/* Sun Container (#ECCA2F) */}
          <View style={styles.sun}>
            {/* Sun Glow Highlight */}
            <View style={styles.sunHighlight} />

            {/* Moon Container (#C4C9D1) that slides in over Sun */}
            <Animated.View
              style={[
                styles.moon,
                {
                  transform: [{ translateX: moonTranslateX }],
                },
              ]}>
              {/* Moon Lunar Crater Spots (#959DB1) */}
              <View style={[styles.crater, { width: 5.5, height: 5.5, top: 4, left: 4, borderRadius: 2.75 }]} />
              <View style={[styles.crater, { width: 3.5, height: 3.5, top: 11, left: 10, borderRadius: 1.75 }]} />
              <View style={[styles.crater, { width: 2.5, height: 2.5, top: 4, left: 12, borderRadius: 1.25 }]} />
            </Animated.View>
          </View>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 60,
    height: 28,
    borderRadius: 14,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.5,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.25), 0 1px 2px rgba(255,255,255,0.4)',
      },
    }),
  },
  orbWrapper: {
    width: 22,
    height: 22,
    position: 'absolute',
    left: 3,
    top: 2,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  haloRing: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
    pointerEvents: 'none',
  },
  sun: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ECCA2F',
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#A1872A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.35,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: 'inset 1px 1px 1px rgba(254, 255, 239, 0.6), inset -1px -1px 1px #a1872a',
      },
    }),
  },
  sunHighlight: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  moon: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#C4C9D1',
    top: 0,
    left: 0,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: 'inset 1px 1px 1px rgba(254, 255, 239, 0.6), inset -1px -1px 1px #969696',
      },
    }),
  },
  crater: {
    position: 'absolute',
    backgroundColor: '#959DB1',
    opacity: 0.85,
  },
  cloudsContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 42,
    height: 22,
    pointerEvents: 'none',
  },
  cloud: {
    position: 'absolute',
    borderRadius: 12,
  },
  cloudBack: {
    backgroundColor: '#AACADF',
    opacity: 0.92,
  },
  cloudFront: {
    backgroundColor: '#F3FDFF',
    opacity: 0.98,
  },
  starsContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 36,
    height: 28,
    pointerEvents: 'none',
  },
  starDot: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 1.5,
    opacity: 0.95,
  },
});
