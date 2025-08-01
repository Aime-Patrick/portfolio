// Script to initialize site settings in Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import dotenv from 'dotenv';
import readline from 'readline';

// Load environment variables
dotenv.config();

// Your Firebase configuration
const firebaseConfig = {
  // Use environment variables with VITE_ prefix
  apiKey: process.env.VITE_API_KEY,
  authDomain: process.env.VITE_AUTH_DOMAIN,
  projectId: process.env.VITE_PROJECT_ID,
  storageBucket: process.env.VITE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_APP_ID,
  measurementId: process.env.VITE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Default site settings
const defaultSettings = {
  siteTitle: 'Aime Patrick Ndagijimana - Portfolio',
  siteDescription: 'Software Engineer Portfolio',
  siteKeywords: 'software engineer, web development, react, portfolio',
  footerText: '© 2023 Aime Patrick Ndagijimana. All rights reserved.',
  enableChatbot: true,
  primaryColor: '#ff5d56',
  secondaryColor: '#121212',
};

async function initSiteSettings() {
  try {
    // Authenticate first
    const email = await new Promise(resolve => {
      rl.question('Enter your admin email: ', resolve);
    });
    
    const password = await new Promise(resolve => {
      rl.question('Enter your admin password: ', resolve);
    });
    
    console.log('Authenticating...');
    await signInWithEmailAndPassword(auth, email, password);
    console.log('Authentication successful!');
    
    // Set the default settings in Firestore
    await setDoc(doc(db, 'settings', 'site'), defaultSettings);
    console.log('Site settings initialized successfully!');
  } catch (error) {
    console.error('Error initializing site settings:', error);
  } finally {
    rl.close();
  }
}

// Run the initialization
initSiteSettings().catch(error => {
  console.error('Failed to initialize site settings:', error);
  process.exit(1);
});