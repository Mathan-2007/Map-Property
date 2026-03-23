import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const navigation = useNavigation();

  const register = async () => {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = auth().currentUser;
      if (!user) { Alert.alert('User not ready. Try again.'); return; }
      await new Promise(resolve => setTimeout(resolve, 500));
      await user.sendEmailVerification();
      Alert.alert('Verification sent', 'Please check your inbox and verify your email before signing in.');
      await auth().signOut();
      navigation.navigate('Login');
    } catch (e: any) {
      Alert.alert('Registration failed', e.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F7F5F2" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoMark}>
            <Text style={styles.logoIcon}>⌂</Text>
          </View>
          <Text style={styles.appName}>nestfinder</Text>
          <Text style={styles.tagline}>Find your perfect place</Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create account</Text>
          <Text style={styles.cardSubtitle}>Join thousands of property seekers</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={[styles.input, focusedField === 'email' && styles.inputFocused]}
              placeholder="you@example.com"
              placeholderTextColor="#B0A99F"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, focusedField === 'password' && styles.inputFocused]}
              placeholder="Create a strong password"
              placeholderTextColor="#B0A99F"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          {/* Password hint */}
          <View style={styles.hintRow}>
            <Text style={styles.hintText}>✓  At least 8 characters</Text>
            <Text style={styles.hintText}>✓  One number or symbol</Text>
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={register} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Create Account</Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By registering, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>

        {/* Footer */}
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Text style={styles.footerLink}>Sign in</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F5F2' },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },

  header: { alignItems: 'center', marginBottom: 36 },
  logoMark: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: '#1C3D3A', alignItems: 'center', justifyContent: 'center',
    marginBottom: 14, shadowColor: '#1C3D3A', shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 }, shadowRadius: 14, elevation: 8,
  },
  logoIcon: { fontSize: 28, color: '#E8D5B0' },
  appName: { fontSize: 28, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.5, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  tagline: { fontSize: 14, color: '#8A8078', marginTop: 4, letterSpacing: 0.3 },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 28,
    shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 4 },
    shadowRadius: 20, elevation: 3, marginBottom: 24,
  },
  cardTitle: { fontSize: 22, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: '#8A8078', marginBottom: 28 },

  fieldGroup: { marginBottom: 18 },
  label: { fontSize: 12, fontWeight: '600', color: '#4A4540', marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' },
  input: {
    backgroundColor: '#F7F5F2', borderRadius: 12, paddingHorizontal: 16,
    paddingVertical: 14, fontSize: 15, color: '#1A1A1A',
    borderWidth: 1.5, borderColor: 'transparent',
  },
  inputFocused: { borderColor: '#1C3D3A', backgroundColor: '#FFFFFF' },

  hintRow: { flexDirection: 'row', gap: 16, marginBottom: 20, flexWrap: 'wrap' },
  hintText: { fontSize: 12, color: '#8A8078' },

  primaryBtn: {
    backgroundColor: '#1C3D3A', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginBottom: 18,
    shadowColor: '#1C3D3A', shadowOpacity: 0.35, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 5,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },

  termsText: { fontSize: 12, color: '#8A8078', textAlign: 'center', lineHeight: 18 },
  termsLink: { color: '#1C3D3A', fontWeight: '600' },

  footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: 14, color: '#8A8078' },
  footerLink: { fontSize: 14, fontWeight: '700', color: '#1C3D3A' },
});