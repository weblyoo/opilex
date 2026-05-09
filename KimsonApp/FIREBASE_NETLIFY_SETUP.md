# Firebase setup for KimsonApp on Netlify

Login on Netlify will fail until your Netlify domain is authorized in Firebase.

## 1. Add your Netlify domain to Firebase Auth

1. Open [Firebase Console](https://console.firebase.google.com) and select project **kimson-3373e**.
2. Go to **Authentication** → **Settings** (or **Sign-in method** tab) → scroll to **Authorized domains**.
3. Click **Add domain**.
4. Enter your Netlify domain **without** `https://`, for example:
   - `your-site-name.netlify.app`
   - or your custom domain, e.g. `app.yourcompany.com`
5. Click **Add**.

If you see an error like *"This domain (xxx.netlify.app) is not authorized for login"* in the app, the domain you’re using is not in this list. Add it and try again.

## 2. Enable Email/Password sign-in (admin panel)

1. In Firebase Console: **Authentication** → **Sign-in method**.
2. Open **Email/Password**.
3. Turn **Enable** on and **Save**.

## 3. Admin users (admin panel only)

The admin panel checks that the signed-in user exists in Firestore collection **admins**.  
Add each admin like this:

1. **Authentication** → **Users** → get the user’s **User UID** after they sign up (or use your own UID).
2. **Firestore Database** → create or open collection **admins**.
3. Add a document with **Document ID** = that User UID, and fields e.g.:
   - `role`: `"admin"` or `"superAdmin"`
   - `email`: their email (optional)
   - `name`: display name (optional)

Without a matching **admins** document, the app will sign the user out immediately after login.

## Summary

| Step | Where | What |
|------|--------|------|
| Authorized domains | Auth → Settings → Authorized domains | Add `yoursite.netlify.app` |
| Email/Password | Auth → Sign-in method | Enable Email/Password |
| Admin users | Firestore → `admins` | One doc per admin (Document ID = User UID) |
