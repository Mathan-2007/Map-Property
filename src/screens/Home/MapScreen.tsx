import React, { useEffect, useState } from 'react';
import {
  View,
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  Alert,
  Linking,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// 📏 distance function
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function MapScreen({ navigation }) {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);

  const [radius, setRadius] = useState(10);
  const [filterType, setFilterType] = useState(null);

  const [userLocation, setUserLocation] = useState({
    latitude: 13.0827,
    longitude: 80.2707,
  });

  // 🔥 realtime fetch + filter
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('properties')
      .onSnapshot(snapshot => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        const filtered = data.filter(item => {
          const distance = getDistanceKm(
            userLocation.latitude,
            userLocation.longitude,
            item.latitude,
            item.longitude
          );

          const matchesType = filterType
            ? item.type === filterType
            : true;

          return distance <= radius && matchesType;
        });

        setProperties(filtered);
      });

    return () => unsubscribe();
  }, [userLocation, radius, filterType]);

  const logout = async () => {
    await GoogleSignin.signOut();
    await auth().signOut();
  };

  // 📞 CALL
  const makeCall = (phone) => {
    if (!phone) {
      Alert.alert('Error', 'Phone not available');
      return;
    }

    Alert.alert('Call Owner', `Call ${phone}?`, [
      { text: 'Cancel' },
      { text: 'Call', onPress: () => Linking.openURL(`tel:${phone}`) },
    ]);
  };

  // 💬 WHATSAPP
  const openWhatsApp = (phone) => {
    if (!phone) {
      Alert.alert('Error', 'Phone not available');
      return;
    }

    const message = `Hi, I am interested in your property`;
    const url = `https://wa.me/${phone.replace('+', '')}?text=${encodeURIComponent(message)}`;

    Linking.openURL(url).catch(() =>
      Alert.alert('Error', 'WhatsApp not installed')
    );
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* FILTER UI */}
      <View style={styles.filterBar}>
        <Button title="All" onPress={() => setFilterType(null)} />
        <Button title="Rent" onPress={() => setFilterType('rent')} />
        <Button title="Sale" onPress={() => setFilterType('sale')} />
      </View>

      {/* MAP */}
      <MapView
        style={styles.map}
        region={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
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
            coordinate={{
              latitude: item.latitude,
              longitude: item.longitude,
            }}
            pinColor={item.type === 'rent' ? 'yellow' : 'blue'}
            onPress={() => setSelectedProperty(item)}
          />
        ))}
      </MapView>

      {/* PROPERTY CARD */}
      {selectedProperty && (
        <View style={styles.card}>
          <Text style={styles.title}>{selectedProperty.title}</Text>
          <Text style={styles.price}>₹{selectedProperty.price}</Text>

          <Button title="Call" onPress={() => makeCall(selectedProperty.phone)} />
          <Button title="WhatsApp" onPress={() => openWhatsApp(selectedProperty.phone)} />
          <Button title="Close" onPress={() => setSelectedProperty(null)} />
        </View>
      )}

      {/* TOP BUTTONS */}
      <View style={styles.buttonContainer}>
        <Button title="Logout" onPress={logout} />
        <Button title="My Listings" onPress={() => navigation.navigate('MyListings')} />
        <Button title="Add Property" onPress={() => navigation.navigate('AddProperty')} />
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  map: { flex: 1 },

  buttonContainer: {
    position: 'absolute',
    top: 40,
    right: 10,
  },

  filterBar: {
    position: 'absolute',
    top: 40,
    left: 10,
    flexDirection: 'row',
    gap: 5,
    zIndex: 1,
  },

  card: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    elevation: 5,
  },

  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  price: {
    color: 'green',
    marginBottom: 10,
  },
});