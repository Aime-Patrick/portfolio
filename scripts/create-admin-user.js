// Script to create an admin user in Firebase Authentication
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import dotenv from 'dotenv';
import readline from 'readline';

// Load environment variables
dotenv.config();

// Your Firebase configuration
const firebaseConfig = {
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
const auth = getAuth(app);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function createAdminUser() {
  try {
    const email = await new Promise(resolve => {
      rl.question('Enter admin email: ', resolve);
    });
    
    const password = await new Promise(resolve => {
      rl.question('Enter admin password (min 6 characters): ', resolve);
    });
    
    const displayName = await new Promise(resolve => {
      rl.question('Enter admin display name: ', resolve);
    });
    
    console.log('Creating admin user...');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with display name
    await updateProfile(userCredential.user, {
      displayName: displayName
    });
    
    console.log('Admin user created successfully!');
    console.log(`UID: ${userCredential.user.uid}`);
    console.log('Please save this UID for your Firestore security rules if needed.');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    rl.close();
  }
}

// Run the function
createAdminUser().catch(error => {
  console.error('Failed to create admin user:', error);
  process.exit(1);
});