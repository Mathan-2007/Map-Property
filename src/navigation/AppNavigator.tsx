import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MapScreen from '../screens/Home/MapScreen';
import AddPropertyScreen from '../screens/Property/AddPropertyScreen';
import MyListingsScreen from '../screens/Profile/MyListingsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Map" component={MapScreen} />
      <Stack.Screen name="AddProperty" component={AddPropertyScreen} />
      <Stack.Screen name="MyListings" component={MyListingsScreen} />
    </Stack.Navigator>
  );
}