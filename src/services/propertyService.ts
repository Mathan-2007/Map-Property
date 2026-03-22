import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export const addProperty = async (property: any) => {
  const userId = auth().currentUser?.uid;

  if (!userId) throw new Error('User not logged in');

  // get limit from settings
  const configDoc = await firestore()
    .collection('settings')
    .doc('appConfig')
    .get();

  const maxLimit = configDoc.data()?.maxPropertiesPerUser || 3;

  // count user properties
  const snapshot = await firestore()
    .collection('properties')
    .where('userId', '==', userId)
    .get();

  if (snapshot.size >= maxLimit) {
    throw new Error(`Max ${maxLimit} properties allowed`);
  }

  // save property
  return firestore().collection('properties').add({
    ...property,
    userId,
    createdAt: firestore.FieldValue.serverTimestamp(),
  });
  
};

export const getMyProperties = async () => {
  const userId = auth().currentUser?.uid;

  if (!userId) return [];

  const snapshot = await firestore()
    .collection('properties')
    .where('userId', '==', userId)
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const deleteProperty = async (id: string) => {
  return firestore().collection('properties').doc(id).delete();
};