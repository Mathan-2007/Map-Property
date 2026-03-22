import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OTPScreen({ route }: any) {
  const [code, setCode] = useState('');
  const { confirmation } = route.params;

  const confirmOTP = async () => {
    await confirmation.confirm(code);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 20 }}>
        <TextInput
          placeholder="Enter OTP"
          onChangeText={setCode}
          style={{ borderWidth: 1, marginBottom: 20, padding: 10 }}
        />
        <Button title="Verify" onPress={confirmOTP} />
      </View>
    </SafeAreaView>
  );
}