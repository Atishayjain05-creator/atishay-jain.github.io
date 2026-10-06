import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  getDocs,
  collection,
  deleteDoc
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { TripItinerary } from '../../shared/types.ts';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testFirestoreConnection(): Promise<boolean> {
  const testPath = 'test/connection';
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('✅ Firestore connection verified.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline check, client appears offline.');
      return false;
    }
    // If permission or server check
    try {
      handleFirestoreError(error, OperationType.GET, testPath);
    } catch {
      // Handled and logged
    }
    return false;
  }
}

// User Profile & Trips Firestore Helpers
export async function saveUserTripToFirestore(userId: string, trip: TripItinerary) {
  const path = `users/${userId}/trips/${trip.id}`;
  try {
    const tripRef = doc(db, 'users', userId, 'trips', trip.id);
    await setDoc(tripRef, {
      ...trip,
      userId,
      savedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getUserTripsFromFirestore(userId: string): Promise<TripItinerary[]> {
  const path = `users/${userId}/trips`;
  try {
    const colRef = collection(db, 'users', userId, 'trips');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => d.data() as TripItinerary);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

export async function deleteUserTripFromFirestore(userId: string, tripId: string) {
  const path = `users/${userId}/trips/${tripId}`;
  try {
    const tripRef = doc(db, 'users', userId, 'trips', tripId);
    await deleteDoc(tripRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export { onAuthStateChanged, signInWithPopup, signOut };
export type { User };
