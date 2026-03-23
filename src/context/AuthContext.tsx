import React, { createContext, useEffect, useState } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

type AuthContextType = {
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
  profileComplete: boolean;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  profileComplete: false,
});

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
  let unsubscribeFirestore: any = null;

  const unsubscribeAuth = auth().onAuthStateChanged(async (user) => {
    setLoading(true);

    if (user) {
      await user.reload();

      const isEmailUser = user.providerData.some(
        p => p.providerId === 'password'
      );

if (isEmailUser && !user.emailVerified) {
  console.log("Email not verified yet");

  setUser(user); // ✅ keep user
  setProfileComplete(false);
  setLoading(false);
  return;
}

      // 🔥 REAL FIX: listen to Firestore changes
      unsubscribeFirestore = firestore()
        .collection('users')
        .doc(user.uid)
        .onSnapshot((doc) => {
          console.log("PROFILE CHECK:", doc.exists);

          setUser(user);
          setProfileComplete(doc.exists);
          setLoading(false);
        });

    } else {
      setUser(null);
      setProfileComplete(false);
      setLoading(false);
    }
  });

  return () => {
    unsubscribeAuth();
    if (unsubscribeFirestore) unsubscribeFirestore();
  };
}, []);

  return (
    <AuthContext.Provider value={{ user, loading, profileComplete }}>
      {children}
    </AuthContext.Provider>
  );
};