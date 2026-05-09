@echo off
echo ================================================
echo   KIMSON APP - Build APK with Icon
echo ================================================
echo.
echo This will build an APK that shows your app icon.
echo Expo Go cannot display custom icons - you need APK!
echo.
echo ================================================
echo   Step 1: Installing EAS CLI...
echo ================================================
call npm install -g eas-cli

echo.
echo ================================================
echo   Step 2: Building APK...
echo ================================================
echo.
echo Please login when prompted.
echo After login, the build will start automatically.
echo.
call eas build --profile production --platform android

echo.
echo ================================================
echo   BUILD COMPLETE!
echo ================================================
echo.
echo Download the APK from the link above.
echo Install it on your Android device.
echo Your app icon will appear on the home screen!
echo.
pause

