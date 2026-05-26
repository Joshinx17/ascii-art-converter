# ASCII Art Converter

A fast, fully client-side tool that converts any image into ASCII art — right in your browser. No server upload required.

![ASCII Art Converter](https://img.shields.io/badge/status-ready-brightgreen) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue) ![React](https://img.shields.io/badge/React-19-61dafb) ![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Features

- 🖼️ **Drag & drop** or click-to-upload images (PNG, JPG, GIF, WebP)
- 🎨 **5 character sets** — Standard, Detailed, Block Characters, Simple, Binary
- 🌈 **Colored ASCII** — renders each character in the original pixel's color
- 🔄 **Invert brightness** toggle
- 📐 **Adjustable width** — 40 to 300 columns with live preview
- 📋 **Copy to clipboard** in one click
- 💾 **Export as `.txt`** or **render to `.png`** with dark background
- ⚡ **100% client-side** — your images never leave your device

---

## 🗂️ Project Structure

```
ascii-art-converter/
├── artifacts/
│   ├── ascii-converter/     # React + Vite frontend (the main app)
│   ├── api-server/          # Express 5 API server (health check + future endpoints)
│   └── mockup-sandbox/      # Dev-only design preview tool (not shipped to production)
├── lib/
│   ├── api-spec/            # OpenAPI spec + Orval codegen config
│   ├── api-client-react/    # Auto-generated React Query hooks
│   ├── api-zod/             # Auto-generated Zod validation schemas
│   └── db/                  # Drizzle ORM setup (reserved for future use)
├── scripts/                 # Workspace utility scripts
├── .env.example             # Required environment variables (copy to .env)
└── pnpm-workspace.yaml      # pnpm monorepo config + dependency catalog
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 24+
- **pnpm** 9+ (`npm install -g pnpm`)

### Installation

```bash
git clone https://github.com/Joshinx17/ascii-art-converter.git
cd ascii-art-converter

# Copy environment variables
cp .env.example .env

# Install all dependencies
pnpm install
```

### Running the Frontend (main app)

```bash
pnpm --filter @workspace/ascii-converter run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Running the API Server

```bash
pnpm --filter @workspace/api-server run dev
```

The server starts on the port defined by `PORT` in your `.env`.

---

## 🔧 Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable          | Used by        | Default | Description                                              |
|-------------------|----------------|---------|----------------------------------------------------------|
| `PORT`            | Frontend & API | `5173`  | Port the dev server / API listens on                     |
| `BASE_PATH`       | Frontend       | `/`     | Base URL path (e.g. `/app` for sub-path deployments)     |
| `NODE_ENV`        | API server     | —       | Set to `production` to enable strict CORS                |
| `ALLOWED_ORIGINS` | API server     | —       | Comma-separated list of allowed origins in production    |

---

## 📦 Key Commands

| Command | Description |
|---------|-------------|
| `pnpm run typecheck` | Full TypeScript typecheck across all packages |
| `pnpm run build` | Typecheck + build all packages |
| `pnpm --filter @workspace/ascii-converter run dev` | Start the frontend dev server |
| `pnpm --filter @workspace/api-server run dev` | Start the API server |
| `pnpm --filter @workspace/api-spec run codegen` | Regenerate API hooks and Zod schemas from OpenAPI spec |

---

## 🌐 Deployment

### Frontend

The frontend is a static Vite build. After running `pnpm run build`, serve the contents of `artifacts/ascii-converter/dist/public` from any static host (Netlify, Vercel, GitHub Pages, S3, etc.).

Set `BASE_PATH` if deploying to a sub-path (e.g. `BASE_PATH=/ascii-converter/`).

### API Server

The API server (`artifacts/api-server`) can be deployed to any Node.js 24+ host.

**Required environment variables for production:**
```env
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=https://yourapp.com
```

> **Note:** The ASCII conversion is 100% client-side. The API server currently provides only a health check endpoint (`GET /api/healthz`) and is reserved for future server-side features.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 7, TypeScript 5.9 |
| Styling | Tailwind CSS v4, shadcn/ui (Radix UI) |
| Routing | Wouter |
| Data fetching | TanStack Query v5 |
| API framework | Express 5 |
| Logging | Pino |
| Validation | Zod |
| API codegen | Orval (from OpenAPI spec) |
| Package manager | pnpm workspaces |

---

## 📄 License

MIT © 2026