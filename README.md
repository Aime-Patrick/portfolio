# Portfolio

Personal portfolio and CMS for **Aime Patrick Ndagijimana**, built with **Next.js 15**, **React 19**, and **Tailwind CSS**. Public site plus an authenticated admin dashboard with an AI copilot.

## Features

- **Public portfolio** — Home, About, Services, Projects, Certificates, Contact
- **Admin CMS** — Manage profile, content, messages, and site settings
- **AI assistants** — [assistant-ui](https://www.assistant-ui.com/) chat for visitors (modal) and admins (resizable sidebar / sheet)
- **NVIDIA NIM** — Server-side chat via OpenAI-compatible API (`/api/chat`)
- **CMS SEO audit** — Admin tool scores on-page meta and content completeness
- **Firecrawl imports** — Pull project drafts from a URL; import resume data into profile/about
- **Firebase** — Auth, Firestore CMS data, Admin SDK for server tools
- **EmailJS** — Contact form delivery
- **Cloudinary** — Image uploads from the admin UI

## Tech Stack

| Area | Stack |
|------|--------|
| App | Next.js 15 (App Router), React 19, TypeScript |
| UI | Tailwind CSS 4, shadcn/ui, Framer Motion, GSAP |
| AI | assistant-ui, Vercel AI SDK, NVIDIA Integrate API |
| Data | Firebase Auth + Firestore (+ Admin SDK) |
| Media / mail | Cloudinary, EmailJS |
| Scraping | Firecrawl |

## Getting Started

1. **Clone and install**

   ```bash
   git clone https://github.com/Aime-Patrick/portfolio.git
   cd portfolio
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env.local` and fill in values:

   | Variable | Purpose |
   |----------|---------|
   | `NEXT_PUBLIC_FIREBASE_CONFIG_BASE64` | Base64 of the Firebase web config JSON |
   | `FIREBASE_ADMIN_CONFIG_BASE64` | Base64 of the service account JSON (server tools / admin chat) |
   | `NVIDIA_API_KEY` | NVIDIA NIM API key |
   | `NVIDIA_MODEL` | Optional; default `meta/llama-3.1-8b-instruct` |
   | `FIRECRAWL_API_KEY` | Project / resume URL import |
   | `NEXT_PUBLIC_CLOUDINARY_*` | Image uploads |
   | `NEXT_PUBLIC_EMAILJS_*` | Contact form |

   Encode JSON configs with `scripts/encode-firebase-config.mjs` or your own base64 encoder.

   **Do not commit** `.env.local`, `firebase-web.json`, or service-account JSON files.

3. **Develop**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

4. **Production**

   ```bash
   npm run build
   npm start
   ```

## Routes

| Path | Description |
|------|-------------|
| `/` | Public portfolio |
| `/login` | Admin login |
| `/admin` | Protected CMS (`?section=dashboard\|content\|messages\|settings\|…`) |
| `/api/chat` | Streaming chat (scopes: `public` \| `admin`) |
| `/api/projects/import` | Firecrawl + AI project draft |
| `/api/profile/import-resume` | Firecrawl + AI resume import |

## Folder Structure

```
portfolio/
├── src/
│   ├── app/                 # Next.js App Router (pages + API routes)
│   ├── components/
│   │   ├── admin/           # CMS managers
│   │   ├── assistant-ui/    # Thread, sidebar, modal, DotMatrix
│   │   └── ui/              # shadcn primitives
│   ├── Sections/            # Public portfolio sections
│   ├── lib/server/          # Chat handler, tools, imports, Firebase Admin
│   └── firebase.ts          # Client Firebase
├── public/                  # Static assets
├── scripts/                 # Admin / config helpers
├── .env.example
├── next.config.ts
└── package.json
```

## Admin copilot

The admin assistant can read live CMS data (stats, inbox, settings, content) and run **`auditCmsSeo`** for an on-page SEO score. It cannot invent tools (e.g. Analytics) or write Firestore — use the CMS UI for edits.

Prefer a faster NIM model for chat (8B). Use a larger model only if you need heavier reasoning and accept higher latency.

## Customization

- **Content** — `/admin` CMS
- **Styles** — `src/app/globals.css` and Tailwind utilities
- **Chat behavior** — `src/lib/server/scopes.ts` (prompts) and `src/lib/server/tools.ts` (tools)
- **Site meta** — Admin → Settings (title, description, keywords)

## License

Private / personal use unless otherwise stated.
