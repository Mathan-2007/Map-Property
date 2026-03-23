import React, { useContext, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Platform,
} from 'react-native';
import CompleteProfileScreen from './src/screens/Auth/CompleteProfileScreen';

function LoadingScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Logo entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 600, useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1, friction: 6, tension: 80, useNativeDriver: true,
      }),
    ]).start();

    // Pulsing dots
    const pulse = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 350, useNativeDriver: true }),
          Animated.delay(700 - delay),
        ])
      );

    pulse(dot1, 0).start();
    pulse(dot2, 200).start();
    pulse(dot3, 400).start();
  }, []);

  return (
    <View style={styles.loadingRoot}>
      <StatusBar barStyle="light-content" backgroundColor="#1C3D3A" />

      {/* Decorative circles */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <Animated.View style={[styles.logoWrap, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.logoMark}>
          <Text style={styles.logoIcon}>⌂</Text>
        </View>
        <Text style={styles.appName}>Map Property</Text>
        <Text style={styles.tagline}>Find your perfect place</Text>
      </Animated.View>

      {/* Dots */}
      <View style={styles.dotsRow}>
        <Animated.View style={[styles.dot, { opacity: dot1 }]} />
        <Animated.View style={[styles.dot, { opacity: dot2 }]} />
        <Animated.View style={[styles.dot, { opacity: dot3 }]} />
      </View>
    </View>
  );
}

function Root() {
  const { user, loading, profileComplete } = useContext(AuthContext);

  if (loading) return <LoadingScreen />;
  if (!user) return <AuthNavigator />;
  if (user && !profileComplete) return <CompleteProfileScreen />;
  return <AppNavigator />;
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Root />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingRoot: {
    flex: 1,
    backgroundColor: '#1C3D3A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // decorative blobs
  bgCircle1: {
    position: 'absolute', width: 320, height: 320, borderRadius: 160,
    backgroundColor: 'rgba(255,255,255,0.04)', top: -80, right: -80,
  },
  bgCircle2: {
    position: 'absolute', width: 240, height: 240, borderRadius: 120,
    backgroundColor: 'rgba(255,255,255,0.04)', bottom: 60, left: -60,
  },

  logoWrap: { alignItems: 'center', marginBottom: 60 },

  logoMark: {
    width: 88, height: 88, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000', shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 }, shadowRadius: 20, elevation: 10,
  },
  logoIcon: { fontSize: 40, color: '#E8D5B0' },

  appName: {
    fontSize: 34, fontWeight: '800', color: '#FFFFFF',
    letterSpacing: -0.5,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15, color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.4,
  },

  dotsRow: { flexDirection: 'row', gap: 10, position: 'absolute', bottom: 80 },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#E8D5B0',
  },
});