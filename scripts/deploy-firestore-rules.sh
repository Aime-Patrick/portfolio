#!/bin/bash

# Script to deploy Firestore security rules
echo "Deploying Firestore security rules..."

# Login to Firebase (if not already logged in)
firebase login

# Deploy only Firestore rules
firebase deploy --only firestore:rules

echo "Firestore security rules deployed successfully!"