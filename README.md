# PunkShop – HD Movie & TV Series Streaming & Download Platform

PunkShop is a dynamic cinema portal inspired by Flixcha, featuring custom HTML5 video streaming with multiple CDN mirrors, multi-quality lossless downloads (4K UHD, 1080p FHD, 720p HD, 480p SD), an advanced Admin Panel, dynamic SEO optimization, and 100% Google AdSense compliance.

---

## 🚀 One-Click Deployment to Vercel

1. Push this project to GitHub (see below).
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Select your GitHub repository.
4. Framework Preset: **Vite**
5. Under **Environment Variables**, configure:
   - `VITE_ADMIN_USERNAME`: Your custom admin username (e.g. `arafatadmin`)
   - `VITE_ADMIN_PASSWORD`: Your custom admin secret password (e.g. `StrongPass2026!`)
   - `DATABASE_URL`: Your database connection URL (e.g. PostgreSQL / Supabase / Neon connection string)
   - `VITE_DATABASE_URL`: Same database connection string for client inspector
6. Click **Deploy**!

---

## 🛠️ Push Changes to GitHub

To push this codebase to a new repository on your GitHub account:

### Option A: Using GitHub CLI (`gh`)
```bash
# Initialize and commit (already initialized)
git add .
git commit -m "feat: complete PunkShop platform with Vercel env support, admin panel, and video streaming"

# Create a new repository on GitHub and push in 1 step:
gh repo create punkshop --public --source=. --push
```

### Option B: Using Standard Git
1. Go to [github.com/new](https://github.com/new) and create a new repository named `punkshop`.
2. Run the following commands in your terminal:

```bash
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/punkshop.git
git branch -M main
git push -u origin main
```

---

## 👑 Admin Panel Access

- **URL Route:** Click the **Admin** button in the top navigation bar, or navigate to `/#admin`.
- **Default Dev Credentials:** Username: `admin` | Password: `admin123`
- **Production Credentials:** Managed dynamically via Vercel Environment Variables (`VITE_ADMIN_USERNAME` and `VITE_ADMIN_PASSWORD`).

### Admin Capabilities:
- **Add / Update / Delete Content:** Create or edit titles, video stream mirrors (CDN nodes), multi-resolution downloads (4K, 1080p, 720p, 480p), and cast members.
- **Photo Uploads:** Upload poster and backdrop pictures or supply remote image URLs with live previews.
- **Community Requests:** Review movie requests submitted by visitors and convert them directly into published catalog titles.
- **Reviews Moderation:** Moderate user discussion comments.
- **JSON Backup & Restore:** Export or import the entire database as a portable JSON file.

---

## 📈 Google AdSense & SEO Compliance

- **AdSense Ready:** Standard fixed-aspect ratio ad slots (`728x90` Leaderboard, `300x250` Rectangle, In-article Responsive, and Bottom Anchor) labeled with "Advertisement" and zero Cumulative Layout Shift (CLS = 0).
- **Mandatory Legal Suite:** Fully populated Privacy Policy (GDPR / CCPA / DART Cookies), DMCA & Copyright Infringement notice (with designated agent details), and Terms of Service.
- **Dynamic SEO Engine:** Automatic `<title>`, `<meta name="description">`, OpenGraph, Twitter Cards, and Schema.org JSON-LD structured data (`@type: "Movie"`, `@type: "TVSeries"`, `@type: "VideoObject"`) for Google Rich Search Results.
