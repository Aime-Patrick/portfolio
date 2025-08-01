# Firebase Setup Guide

## Overview
This guide explains how to set up Firebase for your portfolio project, including configuring Firestore security rules and initializing site settings.

## Prerequisites
- Firebase account
- Firebase project created
- Firebase CLI installed (`npm install -g firebase-tools`)

## Setup Steps

### 1. Create a Firestore Database
1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project ("portifolio-61211")
3. In the left sidebar, click on "Firestore Database"
4. Click "Create database"
5. Choose either production mode or test mode (you can start with test mode for development)
6. Select a location closest to your users
7. Click "Enable"

### 2. Deploy Firestore Security Rules
The project includes a set of security rules that allow public read access to most collections but restrict write access to authenticated users only.

```bash
# Run the deployment script
./scripts/deploy-firestore-rules.sh
```

This will deploy the rules defined in `firestore.rules`.

### 3. Create an Admin User
You can create an admin user using the provided script:

```bash
# Run the admin user creation script
node scripts/create-admin-user.js
```

This script will:
1. Prompt you for an admin email, password, and display name
2. Create the user in Firebase Authentication
3. Display the user's UID

Alternatively, you can create a user through the Firebase Console:
1. Go to the Firebase Console
2. Navigate to Authentication > Users
3. Click "Add User"
4. Enter your email and a password
5. Save the user

### 4. Update Security Rules with Admin UID
After creating your admin user, you need to update the Firestore security rules with your admin UID:

1. Open `firestore.rules`
2. Replace `'YOUR_ADMIN_UID'` with your actual admin UID (obtained from the create-admin-user script)
3. Deploy the updated rules using the deployment script

### 5. Initialize Site Settings
After creating an admin user and updating the security rules, you can initialize the default site settings:

```bash
# Run the initialization script
node scripts/initSiteSettings.js
```

You'll be prompted to enter your admin email and password for authentication.

## Security Rules Explanation

The security rules in `firestore.rules` are configured as follows:

- **Public Read Access**: The following collections allow public read access:
  - `settings`
  - `profile`
  - `projects`
  - `services`

- **Admin-Only Write Access**: Write operations to most collections require admin authentication

- **Messages Collection**: 
  - Read operations require admin authentication
  - Write operations require any authenticated user (allowing visitors to send messages)

- **Admin Authentication**: A user is considered an admin if:
  - Their UID matches the specified admin UID in the rules
  - OR they have an admin claim in their authentication token

## Troubleshooting

### Missing or Insufficient Permissions
If you see "Missing or insufficient permissions" errors:

1. Ensure you've deployed the security rules
2. Check that you're authenticated when trying to write to the database
3. Verify that your Firebase project ID matches the one in your `.env` file

### Authentication Issues
If you're having trouble authenticating:

1. Ensure your admin user is created in the Firebase Authentication console
2. Check that you're using the correct email and password
3. Verify that your Firebase configuration in `firebase.ts` is correct