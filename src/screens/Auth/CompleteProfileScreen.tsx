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
import { SafeAreaView } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { PhoneAuthProvider } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export default function CompleteProfileScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [code, setCode] = useState('');
  const [confirmation, setConfirmation] = useState<any>(null);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [tempUser, setTempUser] = useState<any>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [step, setStep] = useState<'details' | 'otp'>('details');

  const sendOTP = async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) { Alert.alert('User not logged in'); return; }
      setTempUser(currentUser);
      const confirm = await auth().signInWithPhoneNumber(phone);
      setConfirmation(confirm);
      setStep('otp');
      Alert.alert('OTP Sent', `A verification code was sent to ${phone}`);
    } catch (e) {
      console.log('OTP ERROR:', e);
      Alert.alert('Failed to send OTP. Check the number and try again.');
    }
  };

  const verifyAndSave = async () => {
    if (loadingVerify) return;
    setLoadingVerify(true);
    try {
      if (!confirmation) { Alert.alert('Send OTP first'); return; }
      const credential = PhoneAuthProvider.credential(confirmation.verificationId, code);
      const phoneUser = auth().currentUser;
      const emailUser = tempUser;
      if (!phoneUser || !emailUser) { Alert.alert('Session error. Try again.'); return; }
      try {
        await emailUser.linkWithCredential(credential);
      } catch (e: any) {
        if (e.code !== 'auth/provider-already-linked') throw e;
      }
      await firestore().collection('users').doc(emailUser.uid).set({
        name, phone, address, email: emailUser.email, createdAt: new Date(),
      });
      await emailUser.reload();
      Alert.alert('Profile complete!', 'Welcome to Nestfinder.');
    } catch (e: any) {
      Alert.alert('Verification failed', e.message);
    } finally {
      setLoadingVerify(false);
    }
  };

  const logout = async () => {
    try {
      await GoogleSignin.signOut();
      await auth().signOut();
    } catch (e) { console.log('LOGOUT ERROR:', e); }
  };

  const inputStyle = (field: string) => [
    styles.input,
    focusedField === field && styles.inputFocused,
  ];

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F5F2" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.stepIndicator}>
              <View style={[styles.stepDot, step === 'details' && styles.stepDotActive]} />
              <View style={styles.stepLine} />
              <View style={[styles.stepDot, step === 'otp' && styles.stepDotActive]} />
            </View>
            <Text style={styles.title}>
              {step === 'details' ? 'Complete your profile' : 'Verify your phone'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 'details'
                ? 'Tell us a bit about yourself'
                : `Enter the code sent to ${phone}`}
            </Text>
          </View>

          {step === 'details' ? (
            <View style={styles.card}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Full name</Text>
                <TextInput
                  style={inputStyle('name')}
                  placeholder="Arjun Sharma"
                  placeholderTextColor="#B0A99F"
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Phone number</Text>
                <TextInput
                  style={inputStyle('phone')}
                  placeholder="+91 98765 43210"
                  placeholderTextColor="#B0A99F"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Your location</Text>
                <TextInput
                  style={inputStyle('address')}
                  placeholder="Chennai, Tamil Nadu"
                  placeholderTextColor="#B0A99F"
                  value={address}
                  onChangeText={setAddress}
                  onFocus={() => setFocusedField('address')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              <TouchableOpacity style={styles.primaryBtn} onPress={sendOTP} activeOpacity={0.85}>
                <Text style={styles.primaryBtnText}>Send Verification Code →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.card}>
              <View style={styles.otpInfoBanner}>
                <Text style={styles.otpInfoText}>📱  Code sent to {phone}</Text>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Verification code</Text>
                <TextInput
                  style={[inputStyle('otp'), styles.otpInput]}
                  placeholder="• • • • • •"
                  placeholderTextColor="#B0A99F"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  onFocus={() => setFocusedField('otp')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, loadingVerify && styles.primaryBtnDisabled]}
                onPress={verifyAndSave}
                activeOpacity={0.85}
                disabled={loadingVerify}
              >
                <Text style={styles.primaryBtnText}>
                  {loadingVerify ? 'Verifying...' : 'Complete Profile'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setStep('details')} style={styles.backBtn}>
                <Text style={styles.backBtnText}>← Change details</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity onPress={logout} style={styles.logoutRow}>
            <Text style={styles.logoutText}>Use a different account</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F5F2' },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 40, paddingBottom: 40 },

  header: { marginBottom: 32 },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  stepDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#D5CFC8',
  },
  stepDotActive: { backgroundColor: '#1C3D3A', width: 28, borderRadius: 5 },
  stepLine: { flex: 1, height: 2, backgroundColor: '#EAE7E3', marginHorizontal: 6 },

  title: { fontSize: 26, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.3, marginBottom: 6, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  subtitle: { fontSize: 15, color: '#8A8078', lineHeight: 22 },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 28,
    shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 4 },
    shadowRadius: 20, elevation: 3, marginBottom: 20,
  },
  fieldGroup: { marginBottom: 18 },
  label: { fontSize: 12, fontWeight: '600', color: '#4A4540', marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' },
  input: {
    backgroundColor: '#F7F5F2', borderRadius: 12, paddingHorizontal: 16,
    paddingVertical: 14, fontSize: 15, color: '#1A1A1A',
    borderWidth: 1.5, borderColor: 'transparent',
  },
  inputFocused: { borderColor: '#1C3D3A', backgroundColor: '#FFFFFF' },

  otpInfoBanner: {
    backgroundColor: '#EEF5F4', borderRadius: 12, paddingVertical: 12,
    paddingHorizontal: 16, marginBottom: 22,
  },
  otpInfoText: { color: '#1C3D3A', fontSize: 14, fontWeight: '500' },
  otpInput: { fontSize: 22, letterSpacing: 10, textAlign: 'center', fontWeight: '700' },

  primaryBtn: {
    backgroundColor: '#1C3D3A', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 4,
    shadowColor: '#1C3D3A', shadowOpacity: 0.35, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 5,
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },

  backBtn: { alignItems: 'center', marginTop: 16 },
  backBtnText: { color: '#1C3D3A', fontSize: 14, fontWeight: '600' },

  logoutRow: { alignItems: 'center' },
  logoutText: { color: '#B0A99F', fontSize: 14, textDecorationLine: 'underline' },
});