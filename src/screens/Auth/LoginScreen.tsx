import React from 'react';
import { View, Button, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import firestore from '@react-native-firebase/firestore';

GoogleSignin.configure({
  webClientId: '49988757623-lt087lhhgf37j6epavudppqodm7to7c5.apps.googleusercontent.com',
});

export default function LoginScreen({ navigation }: any) {

  const signIn = async () => {
  try {
    console.log("START GOOGLE LOGIN");

    // 🔥 ADD THIS (VERY IMPORTANT)
    await GoogleSignin.signOut();

    await GoogleSignin.hasPlayServices();

    const userInfo = await GoogleSignin.signIn();

    console.log("USER INFO:", userInfo);

    const idToken = userInfo?.data?.idToken;

    if (!idToken) {
      console.log("NO ID TOKEN");
      return;
    }

    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    const userCredential = await auth().signInWithCredential(googleCredential);

    console.log("FIREBASE LOGIN SUCCESS:", userCredential.user.uid);

  } catch (error) {
    console.log("GOOGLE ERROR:", error);
  }
};

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />

      <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
        <Button title="Sign in with Google" onPress={signIn} />
      </View>
    </SafeAreaView>
  );
}