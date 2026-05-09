# Deploy KimsonApp to Netlify

The repo’s **netlify.toml** is set up to deploy the **mobile app** (Expo web), not the admin panel.

---

## Deploy the mobile app (Expo web) – default

1. In Netlify: **Add new site → Import an existing project** → connect your repo.
2. Set **Base directory** to `KimsonApp` (if your repo root is the parent of KimsonApp).
3. Leave **Build command** and **Publish directory** empty so Netlify uses **netlify.toml**:
   - Build command: `npm run build:mobile-web`
   - Publish directory: `web-build`
4. Deploy. The live site will be the Kimson mobile app (login, wire auth, QR, etc.) in the browser.

### Manual upload (mobile app)

1. Build: `npm run build:mobile-web`
2. In Netlify: **Deploys → Drag and drop** → drop the **web-build** folder.

---

## Deploy the admin panel instead

If you want this Netlify site to serve the **admin panel** (Dashboard, Users, Rewards, etc.):

1. In Netlify: **Site settings → Build & deploy → Build settings**.
2. Override:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. Redeploy.

---

## Firebase

Add your Netlify domain (e.g. `yoursite.netlify.app`) in [Firebase Console](https://console.firebase.google.com) → **Authentication → Authorized domains** so login works.
