# Microsoft Azure AD Authentication System

A full-stack enterprise authentication system using **Microsoft Azure AD (Entra ID)** as the identity provider, built with **NestJS** and **Next.js 14**.

## Features

- **Sign in with Microsoft** — OAuth 2.0 / OpenID Connect via MSAL
- **Two-Factor Authentication** — TOTP-based MFA compatible with Microsoft Authenticator
- **JWT Token Management** — Short-lived access tokens with refresh token rotation and reuse detection
- **Role-Based Access Control** — USER, ADMIN, SUPER_ADMIN roles with guard-based enforcement
- **Session Management** — Redis-cached sessions with device tracking and remote revocation
- **User Profile Sync** — Automatic profile sync from Microsoft Graph API
- **Audit Logging** — All authentication events logged with IP and user agent
- **Security Hardened** — Helmet, CORS, rate limiting, encrypted MFA secrets, HTTP-only cookies

## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| NestJS | Enterprise Node.js framework |
| TypeScript | Full type safety |
| Prisma 7 | Type-safe PostgreSQL ORM |
| PostgreSQL | Primary database |
| Redis | Session cache, token blacklist, rate limiting |
| @azure/msal-node | Microsoft identity platform integration |
| Passport.js | JWT authentication strategies |
| otpauth | TOTP generation and validation |

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js 14+ (App Router) | React framework with SSR |
| TypeScript | Full type safety |
| TanStack Query v5 | Server state management |
| Zustand | Client state management |
| Axios | HTTP client with token refresh interceptors |
| Zod | Runtime schema validation |
| shadcn/ui + Tailwind CSS | UI components and styling |
| React Hook Form | Form handling with validation |

## Prerequisites

- **Node.js** 18+
- **PostgreSQL** 14+
- **Redis** 6+
- **Microsoft Azure AD** app registration ([setup guide](#azure-ad-setup))

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/StevenGabule/microsoft-azure-authentication.git
cd microsoft-azure-authentication
```

### 2. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configure environment variables

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

Edit both `.env` files with your credentials (see [Configuration](#configuration)).

### 4. Set up the database

```bash
cd backend

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed the database
npx tsx prisma/seed.ts
```

### 5. Start the services

```bash
# Terminal 1 — Backend (http://localhost:4000)
cd backend
npm run start:dev

# Terminal 2 — Frontend (http://localhost:3000)
cd frontend
npm run dev
```

### 6. Open the app

Navigate to [http://localhost:3000](http://localhost:3000) and click **Sign in with Microsoft**.

## Configuration

### Backend (`backend/.env`)

```env
# Application
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000

# Azure AD
AZURE_AD_CLIENT_ID=your-client-id
AZURE_AD_CLIENT_SECRET=your-client-secret-value
AZURE_AD_TENANT_ID=your-tenant-id
AZURE_AD_REDIRECT_URI=http://localhost:4000/api/v1/auth/callback

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/azure_auth_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT (use strong random values, minimum 32 characters)
JWT_SECRET=your-access-token-secret
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Security
MFA_ENCRYPTION_KEY=your-mfa-encryption-key
```

### Frontend (`frontend/.env`)

```env
AZURE_AD_CLIENT_ID=your-client-id
AZURE_AD_CLIENT_SECRET=your-client-secret-value
AZURE_AD_TENANT_ID=your-tenant-id
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

## Azure AD Setup

1. Go to [Azure Portal](https://portal.azure.com) > **Microsoft Entra ID** > **App registrations** > **New registration**
2. Set a name for your application
3. Choose **Supported account types** based on your requirements
4. Under **Redirect URI**, select **Web** and enter:
   ```
   http://localhost:4000/api/v1/auth/callback
   ```
5. Click **Register**

After registration:

6. Copy the **Application (client) ID** and **Directory (tenant) ID** to your `.env` files
7. Go to **Certificates & secrets** > **New client secret**
   - Copy the **Value** (not the Secret ID) immediately — it's only shown once
8. Go to **API permissions** > **Add a permission** > **Microsoft Graph** > **Delegated permissions**
   - Add: `openid`, `profile`, `email`, `User.Read`, `offline_access`
   - Click **Grant admin consent**
9. Go to **Authentication**
   - Ensure **ID tokens** is checked under Implicit grant
   - Add `http://localhost:3000` under **Front-channel logout URL** (optional)

## Project Structure

```
├── backend/                      # NestJS API server
│   ├── src/
│   │   ├── common/               # Guards, decorators, filters, pipes
│   │   ├── config/               # Environment configuration modules
│   │   ├── modules/
│   │   │   ├── auth/             # OAuth flow, JWT strategies, login/logout
│   │   │   ├── user/             # Profile CRUD, admin management
│   │   │   ├── mfa/              # TOTP setup, verification, recovery codes
│   │   │   ├── session/          # Session tracking and revocation
│   │   │   ├── token/            # JWT lifecycle, rotation, blacklisting
│   │   │   └── microsoft-graph/  # Microsoft Graph API integration
│   │   ├── prisma/               # Database client and health check
│   │   └── redis/                # Redis client wrapper
│   └── prisma/
│       └── schema.prisma         # Database schema (4 models)
│
├── frontend/                     # Next.js 14 application
│   └── src/
│       ├── app/                  # App Router pages and layouts
│       │   ├── (auth)/           # Login, MFA setup/verify pages
│       │   ├── (dashboard)/      # Dashboard, profile, settings pages
│       │   └── auth/callback/    # OAuth callback handler
│       ├── auth/                 # NextAuth configuration
│       ├── components/           # UI components (auth, profile, layout)
│       ├── hooks/                # React Query hooks and mutations
│       ├── lib/                  # API client, validators, utilities
│       ├── stores/               # Zustand state stores
│       └── types/                # TypeScript type definitions
```

## Authentication Flow

```
User clicks "Sign in with Microsoft"
    → Backend redirects to Azure AD /authorize
    → User authenticates with Microsoft
    → Azure AD redirects to backend /auth/callback with authorization code
    → Backend exchanges code for tokens via MSAL
    → Backend fetches profile from Microsoft Graph API
    → Backend upserts user in PostgreSQL
    → Backend creates session (DB + Redis)
    → Backend issues JWT access token + refresh token (HTTP-only cookie)
    → Backend redirects to frontend /auth/callback?token=...
    → Frontend stores token in memory, redirects to /dashboard
```

## Security Features

| Feature | Implementation |
|---------|---------------|
| Token storage | Access tokens in memory only (never localStorage) |
| Refresh tokens | HTTP-only, Secure, SameSite=Strict cookies |
| Token rotation | Family-based reuse detection with automatic revocation |
| MFA secrets | AES-256-GCM encryption at rest |
| Recovery codes | Bcrypt hashed, single-use |
| Rate limiting | 10 req/min login, 5 attempts/15min MFA lockout |
| Security headers | Helmet (CSP, HSTS, X-Frame-Options, etc.) |
| Input validation | class-validator (backend) + Zod (frontend) |
| SQL injection | Prisma parameterized queries |
| CORS | Strict origin whitelist with credentials |

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/login` | Initiate OAuth flow |
| GET | `/auth/callback` | OAuth callback handler |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout and revoke session |
| GET | `/auth/me` | Get current user info |
| POST | `/auth/mfa/verify` | Verify MFA during login |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/me` | Get own profile |
| PATCH | `/users/me` | Update own profile |
| GET | `/users` | List users (admin) |
| PATCH | `/users/:id/role` | Update user role (super admin) |

### MFA
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/mfa/setup` | Generate TOTP secret + QR code |
| POST | `/mfa/enable` | Verify and enable MFA |
| GET | `/mfa/status` | Get MFA status |
| DELETE | `/mfa` | Disable MFA |
| POST | `/mfa/recovery-codes/regenerate` | Regenerate recovery codes |

### Sessions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sessions` | List active sessions |
| DELETE | `/sessions/:id` | Revoke specific session |
| DELETE | `/sessions` | Revoke all sessions |

All endpoints are prefixed with `/api/v1`.

## Database Schema

Four models with full indexing:

- **User** — Microsoft ID, email, profile fields, role, MFA configuration
- **Session** — Device tracking, MFA completion status, expiration
- **RefreshToken** — Hashed tokens with family-based rotation tracking
- **AuditLog** — Authentication events with IP and user agent

## License

MIT
