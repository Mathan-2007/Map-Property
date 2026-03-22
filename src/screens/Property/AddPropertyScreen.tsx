import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    Alert,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import { addProperty } from '../../services/propertyService';
import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid } from 'react-native';
import { GOOGLE_MAPS_API_KEY } from '../../utils/constants';
import auth from '@react-native-firebase/auth';


// 🔑 initialize
Geocoder.init(GOOGLE_MAPS_API_KEY);

export default function AddPropertyScreen({ navigation }: any) {
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [address, setAddress] = useState('');
    const [locationSelected, setLocationSelected] = useState(false);

    const [location, setLocation] = useState({
        latitude: 13.0827,
        longitude: 80.2707,
    });

    const [type, setType] = useState<'rent' | 'sale' | null>(null);

    // 📍 Select location + fetch address
    const handleMapPress = async (e: any) => {
        const coords = e.nativeEvent.coordinate;

        setLocation(coords);
        setLocationSelected(true);

        try {
            const res = await Geocoder.from(coords.latitude, coords.longitude);
            const addr = res.results[0].formatted_address;

            setAddress(addr);
        } catch (error) {
            console.log('Geocoding error:', error);
        }
    };

    // 💾 Save property
    const saveProperty = async () => {
        if (!title || !price) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        if (!type) {
            Alert.alert('Error', 'Please select Rent or Sale');
            return;
        }

        if (!locationSelected || !address) {
            Alert.alert('Error', 'Please select location on map');
            return;
        }

        try {
            await addProperty({
                title,
                price: Number(price),
                latitude: location.latitude,
                longitude: location.longitude,
                address,
                type,
                phone: auth().currentUser?.phoneNumber || 'N/A',
            });

            Alert.alert('Success', 'Property added!');
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const requestLocationPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn(err);
    return false;
  }
};

useEffect(() => {
  const getLocation = async () => {
    const hasPermission = await requestLocationPermission();

    if (!hasPermission) return;

    Geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude } = position.coords;

        setLocation({ latitude, longitude });
        setLocationSelected(true); // ✅ FIX

        try {
          const res = await Geocoder.from(latitude, longitude);
          const addr = res.results[0].formatted_address;

          setAddress(addr); // ✅ auto-fill address
        } catch (err) {
          console.log(err);
        }
      },
      error => console.log(error),
      { enableHighAccuracy: true }
    );
  };

  getLocation();
}, []);

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Add Property</Text>

            {/* TITLE */}
            <Text style={styles.label}>Title</Text>
            <TextInput
                style={styles.input}
                placeholder="2BHK House"
                value={title}
                onChangeText={setTitle}
            />

            {/* PRICE */}
            <Text style={styles.label}>Price</Text>
            <TextInput
                style={styles.input}
                placeholder="15000"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
            />

            {/* TYPE */}
            <Text style={styles.label}>Type</Text>
            <View style={styles.row}>
                <Button
                    title="Rent"
                    color={type === 'rent' ? 'green' : 'gray'}
                    onPress={() => setType('rent')}
                />
                <Button
                    title="Sale"
                    color={type === 'sale' ? 'green' : 'gray'}
                    onPress={() => setType('sale')}
                />
            </View>

            {/* ADDRESS */}

            <Text style={styles.label}>Address</Text>
            <TextInput
  style={styles.input}
  value={address}
  onChangeText={setAddress}
/>

            {/* MAP */}
            <Text style={styles.label}>Select Location</Text>
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
                <Marker coordinate={location} />
            </MapView>

            {/* SUBMIT */}
            <Button title="Submit Property" onPress={saveProperty} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
    },

    heading: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },

    label: {
        marginTop: 10,
        fontWeight: 'bold',
    },

    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 8,
        marginTop: 5,
    },

    row: {
        flexDirection: 'row',
        marginVertical: 10,
    },

    address: {
        marginVertical: 10,
        color: 'green',
    },

    addressPlaceholder: {
        marginVertical: 10,
        color: 'gray',
    },

    map: {
        height: 200,
        marginVertical: 10,
    },
});