import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';
import { ActivityIndicator, View } from 'react-native';
import CompleteProfileScreen from './src/screens/Auth/CompleteProfileScreen';



function Root() {
  const { user, loading, profileComplete } = useContext(AuthContext);

  if (loading) return null;

  if (!user) {
    return <AuthNavigator />;
  }

  if (user && !profileComplete) {
    return <CompleteProfileScreen />;
  }

  return <AppNavigator />;
}

export default function App() {
  return (
    <AuthProvider >
      <NavigationContainer>
        <Root />
      </NavigationContainer>
    </AuthProvider>
  );
}