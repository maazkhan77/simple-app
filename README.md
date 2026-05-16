# simpleapp

A small starter app: log in with GitHub or Google, see your repos, turn them into projects, and deploy to Kubernetes.

## Stack

- **Backend:** FastAPI, psycopg2, requests, PyJWT
- **Frontend:** React + Vite, Tailwind CSS, react-router-dom, Context API, lucide-react
- **DB:** PostgreSQL (local Docker or managed like Neon)

## Prerequisites

- Python 3.10+
- Node 18+
- Docker (only if using local Postgres)

## 1. Database

### Option A: Neon (recommended for cloud deploys)

1. Sign up at https://neon.tech
2. Create a project named `simpleapp`
3. Copy the connection string from the dashboard
4. Paste it into `backend/.env` as `DATABASE_URL`

It looks like:
```env
DATABASE_URL=postgresql://user:pass@host.neon.tech/simpleapp?sslmode=require
```

### Option B: Local Postgres via Docker

```bash
docker compose up -d
```

This starts Postgres on port `5432` with:
- Database: `simpleapp`
- User: `postgres`
- Password: `postgres`

## 2. Create OAuth apps

### GitHub OAuth App

1. Go to https://github.com/settings/developers
2. Click **New OAuth App**
3. Fill in:
   - Application name: `simpleapp` (or whatever)
   - Homepage URL: `http://localhost:5173`
   - **Authorization callback URL:** `http://localhost:8000/auth/github/callback`
4. Click **Register application**
5. Click **Generate a new client secret**
6. Copy the **Client ID** and **Client Secret**

### Google OAuth Client

1. Go to https://console.cloud.google.com/apis/credentials
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Fill in:
   - Name: `simpleapp`
   - **Authorized JavaScript origins:** `http://localhost:5173`
   - **Authorized redirect URI:** `http://localhost:8000/auth/google/callback`
5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

## 3. Backend setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate           # PowerShell on Windows
# source .venv/bin/activate      # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
```

Now edit `.env` and fill in your values:

```env
# Use your Neon connection string here, or keep the local one if using Docker
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/simpleapp
SECRET_KEY=your-random-secret-key-here

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000
```

Generate a secret key:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Create the database tables (run once):
```bash
python init_db.py
```

Start the server:
```bash
uvicorn main:app --reload --port 8000
```

The backend will be running at `http://localhost:8000`.

## 4. Frontend setup

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be running at `http://localhost:5173`.

## How it works

- OAuth login via GitHub or Google. JWT stored in an HTTP-only cookie.
- GitHub users get repos auto-fetched (public and private). Google users can connect GitHub afterwards.
- "Add as project" links a repo to a project row.
- "Deploy to K8S" currently just flips the project status to `deployed`.

## Notes

- Cookies are `secure=False` in dev. Enable `secure=True` and `samesite="strict"` for production.
- GitHub scope is `repo` — this grants access to both public and private repositories.
- The `BACKEND_URL` must match whatever domain you deploy to. Same for OAuth callback URLs.
