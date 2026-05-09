# Opilex Firebase Migration Runbook

This project has been reconfigured for the Opilex Firebase account. Firestore setup, rules/index deployment, and Firestore data copy are complete; Firebase Auth phone sign-in and Storage bucket creation still need to be completed in the Firebase console.

## Required Values

- New Firebase project ID: `opilex-2a79f`
- Firebase project number: `403960941472`
- Web app ID: `1:403960941472:web:a339b5199bc6eee51432c5`
- Android app ID: `1:403960941472:android:94ec248999123ed81432c5`
- Android package: `com.opilex.cables`
- Storage bucket: `opilex-2a79f.firebasestorage.app`
- Source Firebase service-account JSON path
- Target Firebase service-account JSON path
- Source Storage bucket
- Target Storage bucket
- First Opilex admin Firebase Auth UID, optional but recommended

## Configure Mobile

Create `KimsonApp/.env` from `KimsonApp/.env.example` and fill:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_ANDROID_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

These files have already been replaced with the new Opilex Android config:

- `KimsonApp/google-services.json`
- `KimsonApp/android/app/google-services.json`
- `google-services.json`

with the real file downloaded from the new Firebase Android app.

## Configure Admin

`kimson-admin-panel/.env` has been created with the new Opilex web Firebase config.

## Android SHA Fingerprints

The new Android app has these fingerprints registered:

- Release SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- Release SHA-256: `FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C`
- Local debug SHA-1: `8A:49:A1:63:AB:33:02:7A:7A:4F:6F:1B:E7:24:B7:0D:90:5C:65:74`
- Local debug SHA-256: `3D:C1:D5:C3:8C:27:D3:ED:91:3D:D4:8B:CB:CE:93:7F:54:A1:11:1D:C6:5E:E2:C7:E4:9B:26:AE:3C:87:AC:5D`

## Deploy Rules And Indexes

`.firebaserc` now points to `opilex-2a79f`.

Firestore has been created in `asia-south1` with delete protection enabled. Firestore rules and indexes have been deployed.

To redeploy:

```bash
firebase deploy --only firestore:rules,firestore:indexes --project opilex-2a79f
```

Firebase Storage rules are ready locally, but the target project currently blocks command-line Firebase Storage bucket creation with `PERMISSION_DENIED` / billing setup requirements. Open `https://console.firebase.google.com/project/opilex-2a79f/storage`, click **Get Started**, create the default bucket, then run:

```bash
firebase deploy --only storage --project opilex-2a79f
```

## Enable Phone Auth

Firebase Auth was not initialized by the public Admin API for this project (`CONFIGURATION_NOT_FOUND`). The Identity Platform initialization endpoint requires billing, so enable standard Firebase Authentication manually in the console:

1. Open `https://console.firebase.google.com/project/opilex-2a79f/authentication/providers`
2. Click **Get started** if prompted.
3. Enable **Phone** sign-in.
4. Add the production support email/domain settings Firebase asks for.

## Copy Firestore And Storage

From `KimsonApp`:

```bash
set SOURCE_GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\old-service-account.json
set TARGET_GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\new-service-account.json
set SOURCE_STORAGE_BUCKET=old-bucket-name
set TARGET_STORAGE_BUCKET=new-bucket-name
set OPILEX_FIRST_ADMIN_UID=new-admin-auth-uid
npm run migrate:firebase
```

The script copies Firestore documents and Storage files, creates `legacyClaims/{+91phone}` records from old user profiles, and does not migrate Firebase Auth users.

Firestore has already been copied from `kimson-3373e` to `opilex-2a79f` using the Firebase CLI login migration script:

```bash
npm run migrate:firestore:login
```

Copied target counts after cleanup:

- `admins`: 1
- `bankAccounts`: 9
- `gst_verifications`: 4
- `kyc_verifications`: 3
- `legacyClaims`: 4
- `products`: 6
- `rewardQRCodes`: 258
- `rewards`: 35
- `schemeJoins`: 2
- `schemes`: 7
- `scratchRewards`: 9
- `settings`: 1
- `transactions`: 14
- `users`: 5
- `wireAuthentications`: 1

The old `/test` collection was removed from the target project after migration.

## Verify

- Register a fresh phone-auth user in the new project.
- Confirm the matching `legacyClaims/{+91phone}` document is marked claimed once.
- Confirm old records in `users`, `rewards`, `transactions`, `wireAuthentications`, `bankAccounts`, `schemeJoins`, `scratchRewards`, and used `rewardQRCodes` are linked to the new UID.
- Generate a new admin reward QR and confirm its payload type is `opilex_reward`.
- Scan an old `kimson_reward` or `KIMSON_` code and confirm it is rejected.

## Build Verification

Completed locally:

```bash
cd KimsonApp
npm run build

cd ../kimson-admin-panel
npm run build

cd ../KimsonApp/android
set NODE_ENV=production
gradlew.bat :app:assembleRelease --no-daemon --console plain --stacktrace -x lint -x test
```

The Android release APK was generated at:

```text
KimsonApp/android/app/build/outputs/apk/release/app-release.apk
```

The active mobile/admin source and built bundles were scanned for old user-facing brand markers (`Kimson`, `KIMSON`, `kimson_reward`, `KIMSON_`, `kimson.com`, `com.kimson`) and no matches were found.
