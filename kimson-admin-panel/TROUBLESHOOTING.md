# 🔧 Troubleshooting Guide

## Issue: App Not Running / Not Loading

### 1. Check if Dev Server is Running

**Symptoms**: Browser shows connection error or blank page

**Solution**:
```bash
cd kimson-admin-panel
npm run dev
```

You should see:
```
VITE v7.1.12  ready in X ms
➜  Local:   http://localhost:5173/
```

### 2. Check Browser Console

Open browser DevTools (F12) and check for errors:
- Red error messages in Console
- Network tab for failed requests
- Check if `localhost:5173` is accessible

### 3. Common Issues and Fixes

#### Issue: "Cannot GET /"

**Fix**: Make sure you're accessing `http://localhost:5173` not just `/`

#### Issue: Blank Page

**Fix**: Check browser console for React errors. Common causes:
- Firebase not initialized properly
- Module import errors
- CSS issues

#### Issue: TypeScript Errors

**Fix**: Already fixed! All TypeScript errors have been resolved.

#### Issue: Tailwind CSS Not Working

**Fix**: Tailwind is configured. If styles aren't applying:
- Clear browser cache
- Restart dev server
- Check `tailwind.config.js` is in root

### 4. Verify Setup

Run these commands to verify:

```bash
# Check Node version (should be 16+)
node --version

# Check if dependencies are installed
ls node_modules

# Reinstall if needed
rm -rf node_modules package-lock.json
npm install

# Try building
npm run build
```

### 5. Check Firebase Connection

The app needs Firebase to be properly configured:

1. Open browser console (F12)
2. Check for Firebase errors
3. Verify Firebase config in `src/config/firebase.ts`
4. Check if Email/Password auth is enabled in Firebase Console

### 6. Enable Email/Password Authentication

**Critical Step**:

1. Go to: https://console.firebase.google.com/project/kimson-3373e/authentication/providers
2. Click "Email/Password"
3. Enable it
4. Save

### 7. Create Admin User

Before you can login, create an admin user:

**Option A**: Use script
```bash
node scripts/createAdmin.js admin@kimson.com YourPassword
```

**Option B**: Manual
1. Firebase Console → Authentication → Add user
2. Firestore → admins collection → Add document with UID

### 8. Reset Everything

If nothing works:

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite

# Restart dev server
npm run dev
```

### 9. Check Port Availability

If port 5173 is busy:

```bash
# Use different port
npm run dev -- --port 3000
```

### 10. Browser Compatibility

Make sure you're using:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Quick Diagnostic Commands

```bash
# Check if everything compiles
npm run build

# Check for linting errors
npm run lint

# Verify dependencies
npm list firebase react react-dom
```

---

## Still Not Working?

1. Check the terminal output when running `npm run dev`
2. Open browser DevTools (F12) → Console tab
3. Share the error messages you see
4. Verify Firebase Console access

---

## Expected Behavior

When working correctly:
1. `npm run dev` should start without errors
2. Browser should show login page at `http://localhost:5173`
3. No console errors
4. Login form should display properly
5. After login, redirects to dashboard

