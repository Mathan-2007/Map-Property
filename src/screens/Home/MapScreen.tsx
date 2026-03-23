import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Ionicons from 'react-native-vector-icons/Ionicons';

const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function MapScreen({ navigation }: any) {
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [radius] = useState(10);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState({ latitude: 13.0827, longitude: 80.2707 });

  useEffect(() => {
    const unsubscribe = firestore().collection('properties').onSnapshot(snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const filtered = data.filter((item: any) => {
        const distance = getDistanceKm(userLocation.latitude, userLocation.longitude, item.latitude, item.longitude);
        return distance <= radius && (filterType ? item.type === filterType : true);
      });
      setProperties(filtered);
    });
    return () => unsubscribe();
  }, [userLocation, radius, filterType]);

  const logout = async () => {
    await GoogleSignin.signOut();
    await auth().signOut();
  };

  const makeCall = (phone: string) => {
    if (!phone) { Alert.alert('Error', 'Phone not available'); return; }
    Alert.alert('Call Owner', `Call ${phone}?`, [
      { text: 'Cancel' },
      { text: 'Call', onPress: () => Linking.openURL(`tel:${phone}`) },
    ]);
  };

  const openWhatsApp = (phone: string) => {
    if (!phone) { Alert.alert('Error', 'Phone not available'); return; }
    const url = `https://wa.me/${phone.replace('+', '')}?text=${encodeURIComponent('Hi, I am interested in your property')}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'WhatsApp not installed'));
  };

  const filters = [
    { key: null, label: 'All' },
    { key: 'rent', label: 'Rent' },
    { key: 'sale', label: 'Sale' },
  ];

  return (
    <SafeAreaView style={styles.container}>

      {/* Filter Pills — top left */}
      <View style={styles.filterBar}>
        {filters.map(f => (
          <TouchableOpacity
            key={String(f.key)}
            style={[styles.filterPill, filterType === f.key && styles.filterPillActive]}
            onPress={() => setFilterType(f.key)}
            activeOpacity={0.85}
          >
            <Text style={[styles.filterPillText, filterType === f.key && styles.filterPillTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Action Buttons — top right */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('AddProperty')} activeOpacity={0.85}>
          <Text style={styles.iconBtnText}>＋</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('MyListings')} activeOpacity={0.85}>
          <Text style={styles.iconBtnText}>☰</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconBtn, styles.iconBtnDanger]} onPress={logout} activeOpacity={0.85}>
          <Ionicons name="power" size={20} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      {/* Map */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onRegionChangeComplete={(region) => {
          setUserLocation({
            latitude: region.latitude,
            longitude: region.longitude,
          });
        }}
      >

        {properties.map(item => (
          <Marker
            key={item.id}
            coordinate={{ latitude: item.latitude, longitude: item.longitude }}
            pinColor={item.type === 'rent' ? '#F59E0B' : '#1C3D3A'}
            onPress={() => setSelectedProperty(item)}
          />
        ))}
      </MapView>

      {/* Property Card */}
      {selectedProperty && (
        <View style={styles.propertyCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleGroup}>
              <View style={[styles.typeBadge, selectedProperty.type === 'rent' ? styles.typeBadgeRent : styles.typeBadgeSale]}>
                <Text style={styles.typeBadgeText}>{selectedProperty.type?.toUpperCase()}</Text>
              </View>
              <Text style={styles.cardTitle} numberOfLines={1}>{selectedProperty.title}</Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedProperty(null)} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.cardPrice}>₹{Number(selectedProperty.price).toLocaleString('en-IN')}</Text>
          {selectedProperty.address ? (
            <Text style={styles.cardAddress} numberOfLines={1}>📍  {selectedProperty.address}</Text>
          ) : null}

          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.actionCallBtn} onPress={() => makeCall(selectedProperty.phone)} activeOpacity={0.85}>
              <Text style={styles.actionCallText}>📞  Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionWABtn} onPress={() => openWhatsApp(selectedProperty.phone)} activeOpacity={0.85}>
              <Text style={styles.actionWAText}>💬  WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  map: { flex: 1 },

  filterBar: {
    position: 'absolute', top: 52, left: 16,
    flexDirection: 'row', gap: 8, zIndex: 10,
  },
  filterPill: {
    backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
    shadowColor: '#000', shadowOpacity: 0.12, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 4,
  },
  filterPillActive: { backgroundColor: '#1C3D3A' },
  filterPillText: { fontSize: 13, fontWeight: '600', color: '#1A1A1A' },
  filterPillTextActive: { color: '#FFFFFF' },

  actionBar: {
    position: 'absolute', top: 52, right: 16,
    gap: 8, zIndex: 10,
  },
  iconBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.12, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 4,
  },
  iconBtnDanger: { backgroundColor: 'rgba(255,240,240,0.95)' },
  iconBtnText: { fontSize: 18, color: '#1A1A1A' },

  propertyCard: {
    position: 'absolute', bottom: 24, left: 16, right: 16,
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOpacity: 0.18, shadowOffset: { width: 0, height: -2 }, shadowRadius: 20, elevation: 10,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  cardTitleGroup: { flex: 1, marginRight: 12 },
  typeBadge: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 6 },
  typeBadgeRent: { backgroundColor: '#FEF3C7' },
  typeBadgeSale: { backgroundColor: '#EEF5F4' },
  typeBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A' },
  closeBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#F7F5F2', alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { fontSize: 12, color: '#8A8078', fontWeight: '600' },
  cardPrice: { fontSize: 22, fontWeight: '800', color: '#1C3D3A', marginBottom: 6 },
  cardAddress: { fontSize: 13, color: '#8A8078', marginBottom: 16 },
  cardActions: { flexDirection: 'row', gap: 10 },
  actionCallBtn: {
    flex: 1, backgroundColor: '#1C3D3A', borderRadius: 12,
    paddingVertical: 13, alignItems: 'center',
  },
  actionCallText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  actionWABtn: {
    flex: 1, backgroundColor: '#EEF5F4', borderRadius: 12,
    paddingVertical: 13, alignItems: 'center',
    borderWidth: 1.5, borderColor: '#C8E0DC',
  },
  actionWAText: { color: '#1C3D3A', fontWeight: '700', fontSize: 14 },
});