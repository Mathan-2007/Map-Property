import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  PermissionsAndroid,
  KeyboardAvoidingView,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import { addProperty } from '../../services/propertyService';
import Geolocation from '@react-native-community/geolocation';
import { GOOGLE_MAPS_API_KEY } from '../../utils/constants';
import auth from '@react-native-firebase/auth';

Geocoder.init(GOOGLE_MAPS_API_KEY);

export default function AddPropertyScreen({ navigation }: any) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [address, setAddress] = useState('');
  const [locationSelected, setLocationSelected] = useState(false);
  const [location, setLocation] = useState({ latitude: 13.0827, longitude: 80.2707 });
  const [type, setType] = useState<'rent' | 'sale' | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleMapPress = async (e: any) => {
    const coords = e.nativeEvent.coordinate;
    setLocation(coords);
    setLocationSelected(true);
    try {
      const res = await Geocoder.from(coords.latitude, coords.longitude);
      setAddress(res.results[0].formatted_address);
    } catch (error) { console.log('Geocoding error:', error); }
  };

  const saveProperty = async () => {
    if (!title || !price) { Alert.alert('Missing fields', 'Please fill in the title and price.'); return; }
    if (!type) { Alert.alert('Select type', 'Choose Rent or Sale for this property.'); return; }
    if (!locationSelected || !address) { Alert.alert('Location needed', 'Tap on the map to set the property location.'); return; }
    try {
      await addProperty({
        title, price: Number(price),
        latitude: location.latitude, longitude: location.longitude,
        address, type,
        phone: auth().currentUser?.phoneNumber || 'N/A',
      });
      Alert.alert('Listed! 🎉', 'Your property is now live on the map.');
      navigation.goBack();
    } catch (error: any) { Alert.alert('Error', error.message); }
  };

  useEffect(() => {
    const getLocation = async () => {
      try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
        Geolocation.getCurrentPosition(async position => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          setLocationSelected(true);
          try {
            const res = await Geocoder.from(latitude, longitude);
            setAddress(res.results[0].formatted_address);
          } catch (err) { console.log(err); }
        }, err => console.log(err), { enableHighAccuracy: true });
      } catch (err) { console.warn(err); }
    };
    getLocation();
  }, []);

  const inputStyle = (field: string) => [
    styles.input,
    focusedField === field && styles.inputFocused,
  ];

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.screenTitle}>List a Property</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Section: Details */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Property Details</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={inputStyle('title')}
              placeholder="e.g. 2BHK Flat in Anna Nagar"
              placeholderTextColor="#B0A99F"
              value={title}
              onChangeText={setTitle}
              onFocus={() => setFocusedField('title')}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Price (₹)</Text>
            <TextInput
              style={inputStyle('price')}
              placeholder="e.g. 15000"
              placeholderTextColor="#B0A99F"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
              onFocus={() => setFocusedField('price')}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Listing type</Text>
            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[styles.typeBtn, type === 'rent' && styles.typeBtnActive]}
                onPress={() => setType('rent')}
                activeOpacity={0.8}
              >
                <Text style={[styles.typeBtnText, type === 'rent' && styles.typeBtnTextActive]}>🏠  For Rent</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, type === 'sale' && styles.typeBtnActive]}
                onPress={() => setType('sale')}
                activeOpacity={0.8}
              >
                <Text style={[styles.typeBtnText, type === 'sale' && styles.typeBtnTextActive]}>🔑  For Sale</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Section: Location */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Location</Text>
          <Text style={styles.sectionHint}>Tap on the map to pin your property</Text>

          <MapView
            style={styles.map}
            region={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            onPress={handleMapPress}
          >
            <Marker coordinate={location} pinColor="#1C3D3A" />
          </MapView>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[inputStyle('address'), styles.addressInput]}
              value={address}
              onChangeText={setAddress}
              placeholder="Address will auto-fill from map"
              placeholderTextColor="#B0A99F"
              multiline
              onFocus={() => setFocusedField('address')}
              onBlur={() => setFocusedField(null)}
            />
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity style={styles.submitBtn} onPress={saveProperty} activeOpacity={0.85}>
          <Text style={styles.submitBtnText}>Publish Listing →</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F5F2' },
  scroll: { paddingBottom: 40 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 48 : 16, paddingBottom: 16,
    backgroundColor: '#F7F5F2',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2,
  },
  backBtnText: { fontSize: 20, color: '#1A1A1A' },
  screenTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },

  sectionCard: {
    backgroundColor: '#FFFFFF', marginHorizontal: 16, borderRadius: 20, padding: 20, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 10, elevation: 2,
  },
  sectionHeading: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  sectionHint: { fontSize: 13, color: '#8A8078', marginBottom: 14 },

  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', color: '#4A4540', marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' },
  input: {
    backgroundColor: '#F7F5F2', borderRadius: 12, paddingHorizontal: 16,
    paddingVertical: 13, fontSize: 15, color: '#1A1A1A',
    borderWidth: 1.5, borderColor: 'transparent',
  },
  inputFocused: { borderColor: '#1C3D3A', backgroundColor: '#FFFFFF' },
  addressInput: { minHeight: 60, textAlignVertical: 'top' },

  typeRow: { flexDirection: 'row', gap: 12 },
  typeBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center',
    backgroundColor: '#F7F5F2', borderWidth: 1.5, borderColor: 'transparent',
  },
  typeBtnActive: { backgroundColor: '#EEF5F4', borderColor: '#1C3D3A' },
  typeBtnText: { fontSize: 14, fontWeight: '600', color: '#8A8078' },
  typeBtnTextActive: { color: '#1C3D3A' },

  map: { height: 200, borderRadius: 14, marginBottom: 16, overflow: 'hidden' },

  submitBtn: {
    backgroundColor: '#1C3D3A', borderRadius: 16, paddingVertical: 18,
    alignItems: 'center', marginHorizontal: 16, marginTop: 4,
    shadowColor: '#1C3D3A', shadowOpacity: 0.35, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 6,
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
});