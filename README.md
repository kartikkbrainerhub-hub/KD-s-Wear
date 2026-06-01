# KD's Wear | Premium Custom Streetwear & Live Design eCommerce

KD's Wear is a high-fidelity, production-ready decoupled full-stack eCommerce application for a custom t-shirt label. Users can browse trending fashion drops, customize heavyweight 240GSM cotton blank tees in real time using a powerful Fabric.js canvas editor, manage wishlists, track shipment staging in their dashboards, and settle checkouts securely using COD or Razorpay payment verification gateways.

This monorepo houses a fast **FastAPI (Python) Backend** connected to a **PostgreSQL** database, and a stunning **Next.js 15 App Router (TypeScript) Frontend** styled with Tailwind CSS, animated with Framer Motion, and powered by Zustand.

---

## 🏛️ Technical Stack & Architecture

### Backend (`/backend`)
- **FastAPI** — high-performance Python 3 framework for building modular REST APIs.
- **PostgreSQL** — production database.
- **SQLAlchemy** — ORM for model definitions, migrations, and relationship controls.
- **JWT & Bcrypt** — secure authorization utilizing HS256 tokens and hashed passphrases.
- **HMAC Signatures** — cryptographically verified webhooks/callbacks for Razorpay gates.
- **SQLite Fallback** — smart fallback engine that mounts local file databases if a live PostgreSQL server is absent, ensuring zero-configuration local runs!

### Frontend (`/frontend`)
- **Next.js 15 (App Router)** — React framework providing quick page loads, routing, and SEO.
- **Fabric.js** — dynamically client-loaded canvas overlay system for real-time t-shirt layout modifications.
- **Zustand** — high-performance state stores managing Auth cookies and Cart drawer items.
- **Framer Motion** — fluid hover zooms and page navigation transitions.
- **Tailwind CSS** — precise design systems styled around sleek glassmorphism and accents.

---

## 📂 Decoupled Folder Structure

```text
Ajay-website/
├── backend/                    # Python FastAPI API App
│   ├── app/
│   │   ├── main.py            # API Server setup, CORS, auto-schema mounting
│   │   ├── config.py          # Environment loader schema
│   │   ├── database.py        # SQLAlchemy postgres engine & sqlite fallbacks
│   │   ├── models/            # Database schemas (User, Product, Design, Order...)
│   │   ├── schemas/           # Pydantic validation structures
│   │   ├── routers/           # Sub-controllers (Auth, Catalog, Cart, Admin...)
│   │   └── utils/             # Security crypts, token parsing dependencies
│   ├── requirements.txt       # Python library dependencies
│   └── seed.py                # Database seeder (Category, Blank customizable, drops)
│
├── frontend/                   # TypeScript Next.js 15 Web Application
│   ├── app/                    # App Router Pages
│   │   ├── layout.tsx         # Global Providers, glass headers, styled footers
│   │   ├── page.tsx           # Luxury Homepage with CTAs & Collections
│   │   ├── shop/              # Catalog list with multi-filters and sorting
│   │   ├── customize/         # Live Fabric.js Canvas T-Shirt Studio
│   │   ├── checkout/          # Razorpay checkout script modal integration
│   │   ├── dashboard/         # Order track progress bars, saved designs, login
│   │   └── admin/             # Operations metric charts, order fulfillers, publishers
│   ├── components/             # Reusable UI Card, Navbar, and Footer layouts
│   ├── store/                  # Zustand Auth and Shopping Cart drawers
│   ├── tailwind.config.ts
│   └── package.json
```

---

## ⚡ 1. Local Setup: FastAPI Backend

### Prerequisites
- Python 3.9 or higher
- Optional: PostgreSQL running locally (FastAPI defaults to standard PostgreSQL at `localhost:5432` but falls back to SQLite `ajay_wear.db` automatically if no database is running, making local runs zero-configuration!).

### Setup Steps
1. Navigate to `/backend`:
   ```bash
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the database seeder:
   ```bash
   python seed.py
   ```
5. Spin up the backend API server in hot-reloading development mode:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   The backend API documentation is now live at `http://localhost:8000/docs`.

---

## 💻 2. Local Setup: Next.js 15 Frontend

### Prerequisites
- Node.js 18.x or higher
- npm or pnpm package manager

### Setup Steps
1. Navigate to `/frontend`:
   ```bash
   cd frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Spin up the Next.js development server:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

---

## 🔒 Testing Sandboxed Accounts

For local demonstration, we have seeded standard accounts and bypass signatures to allow testing:

### 1. Default Admin Credentials
- **Email**: `admin@kdswear.com`
- **Password**: `admin123`
- Use this account on the dashboard login (`/dashboard`) to get immediate visual access to the secure administrative panels (`/admin`).

### 2. Customizer Studio Testing
- Open `/customize`. Select color swatches (Carbon, Sage, Crimson).
- Add text layers. Modify typeface (Impact, Playfair, Outfit) or colors.
- Upload standard PNG files. Rotate and scale bounds directly on the t-shirt boundary.
- Click "Add custom to bag" to see it instantly load in your sliding Navbar cart drawer with the custom canvas rendering!

### 3. Razorpay Payments Sandbox testing
- Open `/checkout`. Enter shipping credentials.
- Choose "Secure Razorpay". Click Checkout.
- The standard Razorpay transaction modal will open. In sandbox, you can choose "Success" to trigger the cryptographic signature callback.
- We have configured signature verification fallback bypasses so payments succeed out-of-the-box in the local sandbox!

---

## ☁️ Production Deployment Guides

### 1. Backend Deployment (Render / Railway / Heroku / VPS)
1. Deploy a PostgreSQL Database on Render or ElephantSQL and obtain the database URL connection string.
2. Setup environment variables inside your Web Service:
   - `DATABASE_URL`: `postgresql://your_user:your_password@your_host/your_db`
   - `JWT_SECRET`: your secret key signature
   - `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`: real keys obtained from Razorpay Dashboard.
3. Start command:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

### 2. Frontend Deployment (Vercel)
Vercel is the recommended hosting platform for Next.js out of the box:
1. Log in to Vercel and import your GitHub repository (`KD-s-Wear`).
2. **IMPORTANT:** In the Project Settings, under **Root Directory**, enter:
   ```text
   frontend
   ```
3. Under **Build & Development Settings**, Vercel automatically detects Next.js configurations.
4. Set the Environment Variables under **Settings > Environment Variables**:
   * Create `NEXT_PUBLIC_API_URL` pointing to your deployed Backend URL (e.g. `https://kds-wear-api.onrender.com`).
5. Click **Deploy**! Vercel will build the production bundle and serve your frontend globally in seconds.
