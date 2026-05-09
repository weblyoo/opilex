#!/bin/bash

echo "========================================"
echo "Firebase Setup Script for Linux/Mac"
echo "========================================"
echo ""

echo "[1/4] Installing Firebase CLI..."
npm install -g firebase-tools || {
    echo "ERROR: Failed to install Firebase CLI"
    exit 1
}
echo ""

echo "[2/4] Checking Firebase login..."
if ! firebase login:list 2>/dev/null | grep -q "No authorized accounts"; then
    echo "Already logged in to Firebase"
else
    echo "You need to login to Firebase."
    echo "This will open your browser for authentication."
    firebase login || {
        echo "ERROR: Firebase login failed"
        exit 1
    }
fi
echo ""

echo "[3/4] Verifying project configuration..."
if [ ! -f ".firebaserc" ]; then
    echo "ERROR: .firebaserc file not found"
    exit 1
fi
if [ ! -f "firebase.json" ]; then
    echo "ERROR: firebase.json file not found"
    exit 1
fi
if [ ! -f "firestore.rules" ]; then
    echo "ERROR: firestore.rules file not found"
    exit 1
fi
echo "Configuration files found"
echo ""

echo "[4/4] Deploying Firestore rules..."
firebase deploy --only firestore:rules || {
    echo "ERROR: Failed to deploy rules"
    exit 1
}
echo ""

echo "========================================"
echo "Firebase setup complete!"
echo "========================================"
echo ""
echo "Next: Run 'node test-firebase.js' to verify"
