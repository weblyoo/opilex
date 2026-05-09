# Opilex Admin Panel

React/Vite admin panel for the Opilex Wires & Cables rewards, QR, user, document, scheme, slider, and transaction workflows.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Fill `.env` with the Opilex Firebase web app values before running locally or deploying.

## Build

```bash
npm run build
```

The production bundle is generated in `dist/`.

## Deploy

This repository includes `netlify.toml`:

- Build command: `npm run build`
- Publish directory: `dist`

Configure the same `VITE_*` environment variables in the hosting provider.
