import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getMyProperties, deleteProperty } from '../../services/propertyService';

export default function MyListingsScreen({ navigation }: any) {
  const [properties, setProperties] = useState<any[]>([]);

  const fetchData = async () => {
    const data = await getMyProperties();
    setProperties(data);
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = (id: string) => {
    Alert.alert('Remove listing', 'This will permanently remove your property listing.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => { await deleteProperty(id); fetchData(); },
      },
    ]);
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={[styles.typeBadge, item.type === 'rent' ? styles.badgeRent : styles.badgeSale]}>
          <Text style={[styles.badgeText, item.type === 'rent' ? styles.badgeTextRent : styles.badgeTextSale]}>
            {item.type?.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.cardPrice}>₹{Number(item.price).toLocaleString('en-IN')}</Text>
        {item.address ? (
          <Text style={styles.cardAddress} numberOfLines={2}>📍  {item.address}</Text>
        ) : null}
      </View>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => handleDelete(item.id)}
        activeOpacity={0.8}
      >
        <Text style={styles.deleteBtnIcon}>🗑</Text>
      </TouchableOpacity>
    </View>
  );

  const ListEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🏠</Text>
      <Text style={styles.emptyTitle}>No listings yet</Text>
      <Text style={styles.emptySubtitle}>Your listed properties will appear here</Text>
      <TouchableOpacity
        style={styles.emptyBtn}
        onPress={() => navigation.navigate('AddProperty')}
        activeOpacity={0.85}
      >
        <Text style={styles.emptyBtnText}>Add your first property →</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F5F2" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.screenTitle}>My Listings</Text>
          <Text style={styles.screenSubtitle}>
            {properties.length} {properties.length === 1 ? 'property' : 'properties'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddProperty')}
          activeOpacity={0.85}
        >
          <Text style={styles.addBtnText}>＋</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={properties}
        keyExtractor={(item: any) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={[styles.list, properties.length === 0 && { flex: 1 }]}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F5F2' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2,
  },
  backBtnText: { fontSize: 20, color: '#1A1A1A' },
  screenTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', textAlign: 'center', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  screenSubtitle: { fontSize: 12, color: '#8A8078', textAlign: 'center', marginTop: 2 },
  addBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#1C3D3A', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#1C3D3A', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 3 }, shadowRadius: 8, elevation: 4,
  },
  addBtnText: { fontSize: 20, color: '#FFFFFF', lineHeight: 22 },

  list: { paddingHorizontal: 16, paddingBottom: 32 },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: 18, padding: 18,
    marginBottom: 12, flexDirection: 'row', alignItems: 'flex-start',
    shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 10, elevation: 2,
  },
  cardLeft: { flex: 1, marginRight: 12 },
  typeBadge: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 8 },
  badgeRent: { backgroundColor: '#FEF3C7' },
  badgeSale: { backgroundColor: '#EEF5F4' },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  badgeTextRent: { color: '#D97706' },
  badgeTextSale: { color: '#1C3D3A' },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  cardPrice: { fontSize: 20, fontWeight: '800', color: '#1C3D3A', marginBottom: 6 },
  cardAddress: { fontSize: 13, color: '#8A8078', lineHeight: 18 },

  deleteBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: '#FFF0F0', alignItems: 'center', justifyContent: 'center',
  },
  deleteBtnIcon: { fontSize: 16 },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyIcon: { fontSize: 52, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#8A8078', textAlign: 'center', lineHeight: 20, marginBottom: 28 },
  emptyBtn: {
    backgroundColor: '#1C3D3A', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 24,
    shadowColor: '#1C3D3A', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 5,
  },
  emptyBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});