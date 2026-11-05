import { getApp, getApps, initializeApp } from 'firebase/app'
import {
    getAuth,
    GoogleAuthProvider,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signInWithPopup,
    createUserWithEmailAndPassword,
    updateProfile,
    signOut
} from 'firebase/auth'

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
}

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean)

export const firebaseAuth = isFirebaseConfigured
    ? getAuth(getApps().length ? getApp() : initializeApp(firebaseConfig))
    : null

const requireFirebaseAuth = () => {
    if (!firebaseAuth) {
        throw new Error('Firebase Auth is not configured. Add its web app settings to frontend/.env.')
    }
    return firebaseAuth
}

export const signInWithFirebaseEmail = (email, password) =>
    signInWithEmailAndPassword(requireFirebaseAuth(), email, password)

export const signInWithFirebaseGoogle = () =>
    signInWithPopup(requireFirebaseAuth(), new GoogleAuthProvider())

export const registerWithFirebaseEmail = async (name, email, password) => {
    const auth = requireFirebaseAuth()
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    try {
        await updateProfile(credential.user, { displayName: name })
        await sendEmailVerification(credential.user)
    } catch (error) {
        await signOut(auth)
        throw error
    }
    await signOut(auth)
}

export const sendFirebasePasswordReset = (email) =>
    sendPasswordResetEmail(requireFirebaseAuth(), email)

export const signOutFirebase = () =>
    firebaseAuth ? signOut(firebaseAuth) : Promise.resolve()
