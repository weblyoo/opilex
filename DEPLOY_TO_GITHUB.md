# Deploy this repo to GitHub

This repository includes:
- **KimsonApp** – mobile app (Expo/React Native) and web
- **kimson-admin-panel** – admin web panel (React/Vite)

Pushing to GitHub deploys both. You can later split into two repos if needed.

## 1. Create a new repository on GitHub

1. Go to [github.com](https://github.com) and sign in.
2. Click **New repository** (or **+** → **New repository**).
3. Choose a name (e.g. `kimson-app` or `kimson`).
4. Leave it **empty** (do not add README, .gitignore, or license).
5. Click **Create repository**.

## 2. Add GitHub as remote and push

In a terminal, from this folder (`kimson\app`), run (replace `YOUR_USERNAME` and `YOUR_REPO` with your GitHub username and repo name):

```powershell
cd "c:\Users\info\OneDrive\Desktop\kimson\kimson\app"

git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

**Example** (if your username is `johndoe` and repo is `kimson-app`):

```powershell
git remote add origin https://github.com/johndoe/kimson-app.git
git branch -M main
git push -u origin main
```

## 3. If you use SSH instead of HTTPS

```powershell
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## 4. If you already have a remote named `origin`

Check first:

```powershell
git remote -v
```

To replace it:

```powershell
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

**Note:** Your latest changes are already committed. After you run the commands above, your code will be on GitHub.
