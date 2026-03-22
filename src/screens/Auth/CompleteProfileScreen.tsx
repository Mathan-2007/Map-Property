import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';


export default function CompleteProfileScreen({ navigation }: any) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [code, setCode] = useState('');
    const [confirmation, setConfirmation] = useState<any>(null);
    const [loadingVerify, setLoadingVerify] = useState(false);

    // 🔐 Send OTP
    const sendOTP = async () => {
        try {
            const confirm = await auth().signInWithPhoneNumber(phone);

            console.log("CONFIRMATION:", confirm);

            setConfirmation(confirm);
            Alert.alert('OTP sent');
        } catch (e) {
            console.log("OTP ERROR:", e);
            Alert.alert('Error sending OTP');
        }
    };

    // ✅ Verify OTP + Save user
    const verifyAndSave = async () => {
  if (loadingVerify) return;

  setLoadingVerify(true);

  try {
    if (!confirmation) {
      Alert.alert("Send OTP first");
      return;
    }

    const credential = auth.PhoneAuthProvider.credential(
      confirmation.verificationId,
      code
    );

    const user = auth().currentUser;
    if (!user) return;

    try {
      // 🔥 Try linking
      await user.linkWithCredential(credential);
    } catch (e: any) {
      if (e.code === 'auth/provider-already-linked') {
        console.log("Already linked, continue...");
      } else {
        throw e;
      }
    }

    // 🔥 SAVE DATA
    await firestore()
      .collection('users')
      .doc(user.uid)
      .set({
        name,
        phone,
        address,
        email: user.email,
        createdAt: new Date(),
      });

    // 🔥 FORCE REFRESH UI
    await auth().currentUser?.reload();

  } catch (e: any) {
    console.log("VERIFY ERROR:", e);

    if (e.code === 'auth/invalid-verification-code') {
      Alert.alert("Wrong OTP");
    } else {
      Alert.alert("Error verifying");
    }
  } finally {
    setLoadingVerify(false);
  }
};


    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ padding: 20 }}>

                <TextInput
                    placeholder="Name"
                    value={name}
                    onChangeText={setName}
                    style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
                />

                <TextInput
                    placeholder="Phone (+91...)"
                    value={phone}
                    onChangeText={setPhone}
                    style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
                />

                <Button title="Send OTP" onPress={sendOTP} />

                {confirmation && (
                    <>
                        <TextInput
                            placeholder="Enter OTP"
                            value={code}
                            onChangeText={setCode}
                            style={{ borderWidth: 1, marginVertical: 10, padding: 10 }}
                        />

                        <TextInput
                            placeholder="Address"
                            value={address}
                            onChangeText={setAddress}
                            style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
                        />

                        <Button title="Verify & Continue" onPress={verifyAndSave} />
                    </>
                )}

            </View>
        </SafeAreaView>
    );
}