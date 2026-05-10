# 🚀 Deployment Guide - Opilex Admin Panel to Netlify

## Step 1: Push to GitHub

### If you don't have a GitHub repository yet:

1. **Create a new repository on GitHub**:
   - Go to https://github.com/new
   - Name it: `opilex-admin-panel`
   - Make it Private (recommended)
   - Don't initialize with README (we already have one)
   - Click "Create repository"

2. **Connect local repository to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/opilex-admin-panel.git
   git branch -M main
   git push -u origin main
   ```

### If you already have a GitHub repository:

```bash
git remote add origin https://github.com/YOUR_USERNAME/opilex-admin-panel.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Netlify

### Option A: Connect via GitHub (Recommended)

1. **Sign up/Login to Netlify**:
   - Go to https://www.netlify.com
   - Sign up or login with GitHub

2. **Import your project**:
   - Click "Add new site" → "Import an existing project"
   - Click "Deploy with GitHub"
   - Authorize Netlify to access your GitHub account
   - Select the `opilex-admin-panel` repository

3. **Configure build settings** (should auto-detect):
   - Build command: `npm run build`
   - Publish directory: `dist`
   - These are already configured in `netlify.toml`

4. **Deploy**:
   - Click "Deploy site"
   - Netlify will automatically build and deploy your app
   - Your site will be live at: `https://your-site-name.netlify.app`

### Option B: Deploy via Netlify CLI

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Initialize site**:
   ```bash
   netlify init
   ```
   - Choose "Create & configure a new site"
   - Choose a site name or use default
   - Confirm build command: `npm run build`
   - Confirm publish directory: `dist`

4. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

## Step 3: Configure Environment Variables (if needed)

If you need to change Firebase configuration:

1. Go to Netlify Dashboard → Your Site → Site settings → Build & deploy → Environment variables
2. Add any required environment variables

## Step 4: Continuous Deployment

- Every push to the `main` branch will automatically trigger a new deployment
- Netlify will rebuild and redeploy your app automatically

## 🌐 Access Your Deployed Site

After deployment, your admin panel will be available at:
- **Auto-generated URL**: `https://your-site-name.netlify.app`
- **Custom domain**: You can add a custom domain in Netlify settings

## 📋 Post-Deployment Checklist

- [ ] Verify the site is accessible
- [ ] Test login functionality
- [ ] Verify Firebase connection
- [ ] Test QR code generation
- [ ] Check all pages load correctly
- [ ] Verify responsive design

## 🔧 Troubleshooting

### Build Fails
- Check Netlify build logs
- Verify Node version (should be 18+)
- Ensure all dependencies are in `package.json`

### Firebase Connection Issues
- Verify Firebase configuration in `src/config/firebase.ts`
- Check Firestore security rules are deployed
- Verify admin user exists in Firebase

### 404 Errors on Routes
- Verify `netlify.toml` has redirects configured
- Check that `dist` folder contains `index.html`

## 📞 Support

For issues or questions, check the project documentation or contact the development team.

