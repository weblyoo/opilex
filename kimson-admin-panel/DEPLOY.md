# Kimson Admin Panel – Deploy to Netlify

- **No "Documents" page** – Removed. Use **Price List** and **Product Catalog** for PDFs/images.
- **Build:** `npm run build`
- **Publish:** `dist`

## Option A: Netlify “Build from Git”
1. Connect repo `weblyoo/kimson-admin-panel` to Netlify.
2. Set **Base directory:** `kimson-admin-panel`
3. Build command and Publish directory read from `netlify.toml` (build: `npm run build`, publish: `dist`).
4. Trigger **Clear cache and deploy site** if the old “Documents” version still appears.

## Option B: GitHub Actions
- Workflow builds `kimson-admin-panel` and deploys `kimson-admin-panel/dist` to Netlify.
- Add repo secrets: `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`.
