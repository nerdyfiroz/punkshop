# PunkShop – Cloudflare R2 Video Hosting System Setup Guide

This guide walks through configuring **Cloudflare R2** private object storage and connecting it to **PunkShop** hosted on Vercel at `https://punkshop-flame.vercel.app`.

---

## 1. Cloudflare R2 Free-Tier Allowance

Cloudflare R2 Standard includes the following monthly allowances **at $0.00 cost**:

| Metric | Free Tier Allowance | PunkShop Internal Budget |
| :--- | :--- | :--- |
| **Storage** | **10 GB-month** free | **9.00 GB** Safety Ceiling |
| **Class A Operations** (Uploads, Lists) | **1,000,000 requests/month** free | Well within free tier |
| **Class B Operations** (Streams, Downloads) | **10,000,000 requests/month** free | Well within free tier |
| **Data Egress (Bandwidth)** | **$0.00 / Free (Zero Egress Fees)** | Unlimited bandwidth within free tier |

> **Safety Ceiling Note:** PunkShop enforces an internal **9.00 GB storage ceiling** with **no single-file size limit** (you can upload full-length high-definition movies and series). Once the 9 GB total library ceiling is reached, new uploads are blocked until older files are removed, preventing unintended charges.

---

## 2. Step-by-Step Setup

### Step 1: Create the Cloudflare R2 Bucket

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the left navigation, click on **R2 Object Storage**.
3. If this is your first time using R2, click **Get Started** (free tier enabled).
4. Click **Create bucket**.
5. Set Bucket name: `punkshop-videos`
6. Location: **Automatic** (or nearest region).
7. Keep the bucket **Private** (do not enable Public R2 URL – PunkShop uses secure temporary signed URLs).
8. Click **Create Bucket**.

---

### Step 2: Configure Bucket CORS (Crucial for Direct Browser Uploads)

Direct uploads from the administrator's browser directly to Cloudflare R2 require Cross-Origin Resource Sharing (CORS) so the browser can execute `PUT` requests:

1. In your `punkshop-videos` bucket page, click the **Settings** tab.
2. Scroll down to the **CORS Policy** section and click **Add CORS policy** (or Edit).
3. Paste the following JSON policy:

```json
[
  {
    "AllowedOrigins": [
      "https://punkshop-flame.vercel.app",
      "http://localhost:3000",
      "http://localhost:5173"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "HEAD",
      "POST",
      "DELETE"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag",
      "Content-Length",
      "Content-Range",
      "Accept-Ranges"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

4. Click **Save CORS policy**.

---

### Step 3: Generate R2 API Tokens

1. In the Cloudflare dashboard, go back to **R2 Object Storage** &rarr; Overview.
2. On the right-hand panel, click **Manage R2 API Tokens**.
3. Click **Create API token**.
4. Name: `punkshop-vercel-uploader`
5. Permissions: Select **Object Read & Write**.
6. Specify bucket: You can select **Specific bucket only** &rarr; `punkshop-videos` (or All buckets).
7. TTL: Leave blank for permanent token.
8. Click **Create API Token**.
9. Copy the generated credentials:
   - **Access Key ID**
   - **Secret Access Key**
   - **Account ID** (visible under *Endpoint* URL or R2 overview page: `https://<account_id>.r2.cloudflarestorage.com`)

---

### Step 4: Configure Vercel Environment Variables

1. Go to your [Vercel Dashboard](https://vercel.com/) and open your `punkshop` project.
2. Navigate to **Settings** &rarr; **Environment Variables**.
3. Add the following variables (apply to **Production**, **Preview**, and **Development**):

| Variable Name | Example Value | Description |
| :--- | :--- | :--- |
| `R2_ACCOUNT_ID` | `a1b2c3d4e5f6...` | Your Cloudflare Account ID |
| `R2_ACCESS_KEY_ID` | `0123456789abcdef...` | R2 API Token Access Key |
| `R2_SECRET_ACCESS_KEY` | `fedcba9876543210...` | R2 API Token Secret Key |
| `R2_BUCKET` | `punkshop-videos` | Private bucket name |
| `ADMIN_USERNAME` | `admin` | Admin dashboard username |
| `ADMIN_PASSWORD` | `YourSecretPassword123!` | Strong secret password |
| `SESSION_SECRET` | `4f8a...` (32 random hex characters) | Key for signing session cookies |
| `MONGODB_URI` | `mongodb+srv://...` | MongoDB connection string |

4. Click **Save** and trigger a **Redeploy** on Vercel so the new environment variables take effect.

---

## 3. How the Architecture Works

```
[Administrator Browser] 
       │
       ├─ 1. POST /api/videos?action=upload-url (Vercel Serverless)
       │     └─ Validates session, checks MIME type, checks size < 500 MB,
       │        and enforces the 9 GB storage ceiling.
       │     └─ Returns presigned PUT URL.
       │
       ├─ 2. Direct HTTP PUT video binary ───► [Cloudflare R2 Bucket]
       │     (Video payload NEVER passes through Vercel)
       │
       └─ 3. POST /api/videos?action=complete (Vercel Serverless)
             └─ Verifies object in R2 via HeadObjectCommand.
             └─ Saves metadata to MongoDB / catalog.

[Consumer / Viewer]
       │
       ├─ Watch Video: GET /api/stream?id=...
       │     └─ Returns temporary signed GET URL (valid 2h).
       │     └─ Plays in HTML5 player with HTTP Range scrubbing support.
       │
       └─ Download Video: GET /api/download?id=...
             └─ Returns temporary signed GET URL with `Content-Disposition: attachment`.
             └─ Downloads file with original name directly from R2.
```

---

## 4. Acceptance Checklist

- [x] **Direct R2 Uploads:** Video binaries upload directly from the browser to Cloudflare R2 without passing through Vercel serverless request bodies.
- [x] **Admin Authentication:** Server-side authentication with rate limiting and signed `HttpOnly` session cookies. Admin credentials are never stored in client code.
- [x] **Cost Controls & Storage Meter:** Real-time visual gauge monitoring the 9 GB internal safety ceiling with no arbitrary single-file limit.
- [x] **Video Streaming:** HTML5 player with play/pause, volume, fullscreen, speed, theater mode, and seekable HTTP Range request support.
- [x] **Direct Downloads:** Signed download URLs with safe `attachment; filename="..."` Content-Disposition headers.
- [x] **Metadata Management:** Edit video title, description, category, and thumbnail.
- [x] **Permanent Deletion:** Explicit confirmation modal deletes the object from R2 and removes its catalog entry.
