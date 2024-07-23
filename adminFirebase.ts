import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { adminFirebaseConfig } from './adminFirebaseConfig';

let adminApp;
if (!getApps().some(app => app.name === 'adminApp')) {
    adminApp = initializeApp(adminFirebaseConfig, 'adminApp');
} else {
    adminApp = getApp('adminApp');
}

const adminAuth = getAuth(adminApp);
const adminDb = getFirestore(adminApp);
const adminStorage = getStorage(adminApp);

// 永続性の設定
setPersistence(adminAuth, browserLocalPersistence);

export { adminAuth, adminDb, adminStorage };
