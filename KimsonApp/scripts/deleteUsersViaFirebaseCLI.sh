#!/bin/bash
# Script to delete users using Firebase CLI
# This requires Firebase CLI to be authenticated

echo "🚀 Deleting users using Firebase CLI..."
echo "📱 Phone numbers: +918380843472, +919112005199"
echo ""

# Note: Firebase CLI doesn't have direct Firestore delete commands
# This script will guide you through the process or use Firebase Console

echo "⚠️  Firebase CLI doesn't support direct Firestore document deletion."
echo "📋 Please use one of these methods:"
echo ""
echo "Method 1: Firebase Console (Recommended)"
echo "   1. Go to: https://console.firebase.google.com/project/kimson-3373e/firestore"
echo "   2. Navigate to 'users' collection"
echo "   3. Search for phone numbers: 8380843472 or 9112005199"
echo "   4. Delete the user documents"
echo ""
echo "Method 2: Use Admin Panel Browser Console"
echo "   1. Open admin panel and login"
echo "   2. Open browser console (F12)"
echo "   3. Run: window.deleteUsers.deleteTheseUsers()"
echo ""
