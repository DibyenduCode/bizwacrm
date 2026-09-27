# BizWACRM — Enterprise WhatsApp CRM & Automation Suite

> Modern, self-hostable CRM and customer engagement platform for the official WhatsApp® Business Cloud API. Featuring a **Super Admin Dashboard**, **User Approval & Verification Workflow**, **Multi-Agent Shared Inbox**, **Visual No-Code Flow Builder**, **AI Assistant with RAG Knowledge Base**, **Kanban Sales Pipelines**, and **Meta-Approved Broadcasts**.

<p align="center">
  <a href="https://github.com/DibyenduCode/bizwacrm/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-violet.svg" alt="License: MIT"></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16.3-black?logo=nextdotjs" alt="Next.js 16"></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19.2-blue?logo=react" alt="React 19"></a>
  <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth%20%2B%20RLS-3ecf8e?logo=supabase" alt="Supabase"></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss" alt="Tailwind CSS v4"></a>
  <a href="https://developers.facebook.com/docs/whatsapp/cloud-api"><img src="https://img.shields.io/badge/WhatsApp-Cloud%20API-25d366?logo=whatsapp" alt="WhatsApp Cloud API"></a>
</p>

---

## 🌟 What Sets BizWACRM Apart?

**BizWACRM** extends the power of WhatsApp CRM with platform administration controls, enterprise user approval gating, and production-ready resilience:

1. **🛡️ Super Admin Control Center (`/admin`)**
   - Centralized management console for platform operators.
   - Comprehensive overview of all registered users, tenant organizations, account roles, and real-time status.
   - One-click actions: Approve pending users, deactivate accounts, reactivate, or permanently delete users with Supabase Auth cleanup.
2. **🚦 User Approval & Verification Workflow**
   - New user registrations enter `pending` state by default.
   - Custom middleware guards every route: unapproved users are automatically directed to `/pending-approval`.
   - Dedicated notice screens with real-time refresh and sign-out controls (`/pending-approval` and `/account-deactivated`).
   - Secure Super Admin portal (`/admin/login`) with strict RBAC route protection.
3. **🎨 Refined Modern Interface**
   - Polished glassmorphic aesthetic with ambient lighting, badges, smooth transitions, and responsive mobile-first layouts.
   - Enhanced authentication flow (`/login`, `/signup`, `/forgot-password`, `/join/[token]`).
4. **🚀 Cloud & Self-Host Ready**
   - Zero-crash build guards for Vercel, Hostinger Managed Node.js, Docker, and standard VPS instances.

---

## ✨ Features Overview

### 💬 Shared WhatsApp Business Inbox
- **Official Cloud API Integration**: Connect your Meta WhatsApp Business Account (WABA) with secure webhooks and token encryption.
- **Multi-Agent Collaboration**: Multiple agents collaborate on a single WhatsApp number.
- **Assignment & Notes**: Assign chats to specific team members, update conversation statuses (Open, Pending, Resolved), and leave private internal notes.
- **Rich Media**: Send and receive images, audio voice notes (`opus-recorder`), documents, videos, and interactive message buttons/lists.

### 🤖 Visual Flow Builder & Automations
- **Drag-and-Drop Canvas**: Build multi-step automation workflows visually using `@xyflow/react` and Dagre.
- **Triggers**: Inbound message text, exact/regex keyword matches, new contact creation, or scheduled cron runs.
- **Step Actions**: Send WhatsApp messages/templates, conditional logic branches, timed delays/waits, contact tag assignment, and external webhook triggers.

### 🧠 AI Reply Assistant & Knowledge Base (RAG)
- **Bring Your Own Key (BYOK)**: Connect OpenAI or Anthropic API keys (encrypted at rest with AES-256-GCM). No per-seat AI surcharge.
- **One-Click Reply Drafts**: Draft contextual, tone-adjusted replies in the inbox with one click.
- **Auto-Reply Bot**: Optional autonomous responder with conversation caps and transparent human handoff.
- **Knowledge Base**: Index product documents, FAQs, and support guides using hybrid search (PostgreSQL full-text search + optional `pgvector` semantic embeddings).

### 👥 Contacts & CRM Sales Pipelines
- **Contact Management**: Custom fields, tags, phone number deduplication, and bulk CSV import/export.
- **Kanban Sales Pipelines**: Drag-and-drop deals across stages, track expected revenue, and jump straight into linked WhatsApp chats.

### 📢 Broadcast Campaigns
- **Meta-Approved Templates**: Send mass broadcasts using approved WhatsApp templates with rich headers (text, image).
- **Personalized Variables**: Substitute custom fields and recipient parameters.
- **Detailed Delivery Metrics**: Track sent, delivered, read, and failed counts with native Meta error code diagnostics.

### 🏢 Team Accounts & Access Control (RBAC)
- **Multi-Role Permissions**: `super_admin`, `owner`, `admin`, `agent`, and `viewer`.
- **Team Invitations**: Invite team members via unique, revocable invitation links (`/join/[token]`).

### 🔌 Developer APIs & Model Context Protocol (MCP)
- **Public REST API (`/api/v1`)**: Programmatically send messages, manage contacts, query deals, and trigger automations with scoped API keys. See [docs/public-api.md](./docs/public-api.md).
- **MCP Server**: Connect your CRM to Claude Desktop, Cursor, or AI coding agents using the [Model Context Protocol](https://modelcontextprotocol.io). See [docs/mcp.md](./docs/mcp.md).

### 🌐 Internationalization (i18n)
- Native multi-language interface: English (`en`), Korean (`ko`), Brazilian Portuguese (`pt`), and Spanish (`es`).

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router, Server Actions, Route Handlers) |
| **Frontend** | [React 19](https://react.dev), [Tailwind CSS v4](https://tailwindcss.com), [Radix / Base UI](https://base-ui.com) |
| **Database & Auth** | [Supabase](https://supabase.com) (PostgreSQL, Supabase Auth, Storage, Row-Level Security) |
| **WhatsApp Integration** | [Meta WhatsApp Business Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api) |
| **Workflow Builder** | [@xyflow/react](https://xyflow.com), Dagre layout |
| **Icons & UI** | [Lucide React](https://lucide.dev), [Sonner](https://sonner.emilkowal.ski), [Recharts](https://recharts.org) |
| **Language & Tooling** | TypeScript 5+, ESLint 9, Vitest |

---

## 🏁 Quick Start

### 1. Prerequisites
- **Node.js**: `v20.0.0` or higher
- **Package Manager**: `npm` (v10+ recommended)
- **Supabase Account**: A free or paid Supabase project
- **Meta for Developers**: A Meta App with WhatsApp Business API enabled

### 2. Clone & Install

```bash
git clone https://github.com/DibyenduCode/bizwacrm.git
cd bizwacrm
npm install
```

### 3. Configure Environment Variables

Copy the example environment configuration:

```bash
cp .env.local.example .env.local
```

Open `.env.local` and provide your credentials:

```ini
# Supabase credentials (Project Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# WhatsApp token encryption key (32 bytes = 64 hex characters)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=your-64-character-hex-encryption-key

# Meta App Secret (Meta for Developers → App Settings → Basic)
META_APP_SECRET=your-meta-app-secret

# Application canonical URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# UI language: en | ko | pt | es
NEXT_PUBLIC_APP_LOCALE=en
```

### 4. Database Setup

You can set up your Supabase database in either of two ways:

#### Option A: Run the Complete Schema (Fastest)
1. In your Supabase Dashboard, open the **SQL Editor**.
2. Open [`supabase/full_schema.sql`](./supabase/full_schema.sql) in this repo, copy its contents, and run it.
3. This creates all tables, views, RLS policies, triggers, and the Super Admin system in a single step.

#### Option B: Supabase CLI Migrations
If you use the Supabase CLI:
```bash
supabase link --project-ref your-project-ref
supabase db push
```

---

## 👑 Super Admin Setup & User Verification

By default, any user signing up through `/signup` is created in **`pending`** status and cannot access the CRM dashboard until approved.

### Creating the First Super Admin
To promote an account to **Super Administrator**, execute the following SQL in your Supabase SQL Editor:

```sql
-- Replace with the email address of your administrator account
UPDATE public.profiles
SET 
  is_super_admin = TRUE,
  status = 'active'
WHERE email = 'admin@yourdomain.com';
```

### Accessing the Super Admin Console
1. Navigate to: `http://localhost:3000/admin/login`
2. Sign in with your Super Administrator credentials.
3. You will be redirected to the **Super Admin Console** at `/admin`.
4. From here you can:
   - Review pending user registrations.
   - Click **Approve** to activate a user.
   - Click **Deactivate** to revoke system access.
   - Permanently remove users and their Supabase Auth records.

---

## ⚙️ Environment Variables Reference

| Variable | Required | Description |
|---|:---:|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | Your Supabase project URL (`https://xyz.supabase.co`). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | Public anonymous client key for Supabase. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | Secret service-role key for server routes, webhooks, and admin APIs. |
| `ENCRYPTION_KEY` | **Yes** | 64-character hex key (AES-256-GCM) for encrypting WhatsApp & AI tokens. |
| `META_APP_SECRET` | **Yes** | Secret from Meta App dashboard for HMAC-SHA256 webhook validation. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical base URL (e.g. `https://crm.yourdomain.com`). |
| `NEXT_PUBLIC_APP_LOCALE` | Optional | Default locale: `en` (default), `ko`, `pt`, or `es`. |
| `AUTOMATION_CRON_SECRET` | Optional | Bearer secret for securing `GET /api/automations/cron`. |
| `META_APP_ID` | Optional | Required for uploading image headers in template creation. |
| `WHATSAPP_TEMPLATES_DRY_RUN` | Optional | Set to `"true"` in local development to mock template submissions. |
| `AI_REQUEST_TIMEOUT_MS` | Optional | Timeout for OpenAI / Anthropic requests in ms (default `30000`). |
| `AI_CONTEXT_MESSAGE_LIMIT` | Optional | Number of conversation messages passed as context (default `20`). |

---

## 🚢 Deployment

### Deploying to Vercel
1. Import the repository into your Vercel dashboard.
2. Configure all environment variables in project settings.
3. Deploy! The project includes build-time fallbacks and middleware guards to ensure zero-failure builds even during static generation passes.

### Deploying to Hostinger / Node.js Hosting
BizWACRM runs smoothly on Hostinger Managed Node.js or any Node.js host:
1. Push your repository to GitHub.
2. In your hosting panel (e.g. Hostinger **hPanel → Websites → Create/Manage**, select **Node.js**).
3. Connect your GitHub repository (`DibyenduCode/bizwacrm`).
4. Set the build command to `npm run build` and start command to `npm run start`.
5. Enter all required environment variables in the environment settings.
6. Trigger deployment.

### Deploying with Docker
BizWACRM includes production-ready Docker support:
```bash
docker compose up -d --build
```
See the complete guide in [docs/docker.md](./docs/docker.md).

---

## 📁 Project Structure

```
bizwacrm/
├── docs/                   # Extended guides (Docker, MCP, Public API, WABA)
├── messages/               # Internationalization catalogs (en, es, ko, pt)
├── public/                 # Static assets and icons
├── src/
│   ├── app/
│   │   ├── (auth)/         # Auth pages (login, signup, pending-approval, etc.)
│   │   ├── admin/          # Super Admin dashboard & admin login
│   │   ├── api/            # Route handlers (admin, automations, whatsapp, v1)
│   │   ├── automations/    # Visual flow builder interface
│   │   ├── broadcasts/     # WhatsApp template broadcast manager
│   │   ├── contacts/       # Contact directory & import
│   │   ├── dashboard/      # Real-time analytics dashboard
│   │   ├── inbox/          # Shared multi-agent WhatsApp chat inbox
│   │   ├── pipelines/      # Kanban sales pipeline
│   │   └── settings/       # Account, team, WhatsApp & AI configuration
│   ├── components/         # Reusable UI components & dialogs
│   ├── lib/                # Supabase clients, crypto, Meta API helpers
│   └── middleware.ts       # RBAC, tenant status & authentication guards
├── supabase/
│   ├── full_schema.sql     # Complete, single-run database schema
│   └── migrations/         # Individual incremental SQL migrations
├── package.json
└── README.md
```

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE). You are free to fork, customize, rebrand, and deploy it for your personal or commercial business operations.
