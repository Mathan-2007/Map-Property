import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Button,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  getMyProperties,
  deleteProperty,
} from '../../services/propertyService';

export default function MyListingsScreen() {
  const [properties, setProperties] = useState([]);

  const fetchData = async () => {
    const data = await getMyProperties();
    setProperties(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Property',
      'Are you sure?',
      [
        { text: 'Cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            await deleteProperty(id);
            fetchData(); // refresh list
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text>₹{item.price}</Text>
      <Text>{item.address}</Text>

      <Button title="Delete" onPress={() => handleDelete(item.id)} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Listings</Text>

      <FlatList
        data={properties}
        keyExtractor={(item: any) => item.id}
        renderItem={renderItem}
      />
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

  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 3,
  },

  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});