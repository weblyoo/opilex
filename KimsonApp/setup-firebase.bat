@echo off
echo ========================================
echo Firebase Setup Script for Windows
echo ========================================
echo.

echo [1/4] Installing Firebase CLI...
call npm install -g firebase-tools
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Firebase CLI
    pause
    exit /b 1
)
echo.

echo [2/4] Checking Firebase login...
firebase login:list >nul 2>&1
if %errorlevel% neq 0 (
    echo You need to login to Firebase.
    echo This will open your browser for authentication.
    pause
    firebase login
    if %errorlevel% neq 0 (
        echo ERROR: Firebase login failed
        pause
        exit /b 1
    )
) else (
    echo Already logged in to Firebase
)
echo.

echo [3/4] Verifying project configuration...
if not exist ".firebaserc" (
    echo ERROR: .firebaserc file not found
    pause
    exit /b 1
)
if not exist "firebase.json" (
    echo ERROR: firebase.json file not found
    pause
    exit /b 1
)
if not exist "firestore.rules" (
    echo ERROR: firestore.rules file not found
    pause
    exit /b 1
)
echo Configuration files found
echo.

echo [4/4] Deploying Firestore rules...
firebase deploy --only firestore:rules
if %errorlevel% neq 0 (
    echo ERROR: Failed to deploy rules
    pause
    exit /b 1
)
echo.

echo ========================================
echo Firebase setup complete!
echo ========================================
echo.
echo Next: Run "node test-firebase.js" to verify
pause
