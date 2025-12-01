import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getAnalytics } from 'firebase/analytics'

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjpraACO6grhDWwozeF_ROjlB22SlYC88",
  authDomain: "rosca-61abe.firebaseapp.com",
  projectId: "rosca-61abe",
  storageBucket: "rosca-61abe.firebasestorage.app",
  messagingSenderId: "809910518024",
  appId: "1:809910518024:web:b0bac172b0836bd602ecbd",
  measurementId: "G-L7C8RZJRLG"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize services
export const db = getFirestore(app)
export const auth = getAuth(app)

// Initialize Analytics (only in browser environment)
let analytics = null
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app)
}

export default app

