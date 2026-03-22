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
    const subscriber = auth().onAuthStateChanged(async (user) => {
      if (user) {
        try {
  const doc = await firestore()
    .collection('users')
    .doc(user.uid)
    .get();

  const data = doc.data();

  if (doc.exists && data?.phone) {
    setProfileComplete(true);
  } else {
    setProfileComplete(false);
  }
} catch (e) {
  console.log('Firestore error:', e);

  // 🔥 IMPORTANT: DON'T BLOCK USER
  setProfileComplete(false);
}
      } else {
        setProfileComplete(false);
      }

      setUser(user);
      setLoading(false);
    });

    return subscriber;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, profileComplete }}>
      {children}
    </AuthContext.Provider>
  );
};