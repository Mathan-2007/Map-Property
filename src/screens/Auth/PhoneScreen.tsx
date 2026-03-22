import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';

export default function PhoneScreen({ navigation }: any) {
  const [phone, setPhone] = useState('');

  const sendOTP = async () => {
    const confirmation = await auth().signInWithPhoneNumber(phone);
    navigation.navigate('OTP', { confirmation });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 20 }}>
        <TextInput
          placeholder="Enter phone"
          onChangeText={setPhone}
          style={{ borderWidth: 1, marginBottom: 20, padding: 10 }}
        />
        <Button title="Send OTP" onPress={sendOTP} />
      </View>
    </SafeAreaView>
  );
}