# KenVerse Job OS

> A personal job search and application operating system. Discovers relevant jobs, scores fit, tailors CVs truthfully, and tracks every application — packaged as a Windows desktop app.

---

## Table of Contents

- [What It Does](#what-it-does)
- [Prerequisites](#prerequisites)
- [Quick Start (Development)](#quick-start-development)
- [First-Time Setup](#first-time-setup)
- [Project Structure](#project-structure)
- [Running Tests](#running-tests)
- [Building for Windows](#building-for-windows)
- [Adding Job Sources](#adding-job-sources)
- [Configuration Reference](#configuration-reference)
- [Architecture](#architecture)
- [Troubleshooting](#troubleshooting)
- [Limitations and Compliance Notes](#limitations-and-compliance-notes)

---

## What It Does

| Feature | Detail |
|---------|--------|
| **Job Discovery** | Fetches from Remotive, Arbeitnow, WeWorkRemotely, RemoteOK — every 6 hours |
| **Fit Scoring** | 0–100 score per job vs your profile: skills, role alignment, location, salary |
| **CV Tailoring** | GPT-4o generates a tailored CV using only your real experience — never fabricates |
| **Application Tracking** | Pipeline from Shortlisted → Applied → Interview → Offer/Rejected |
| **Audit Trail** | Immutable log of every action, document version, and status change |
| **Dashboard** | Overview, jobs table, pipeline board, document library, logs |
| **Reminders** | Auto follow-up reminders 7 days after applying |

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 20 LTS | Required — [nodejs.org](https://nodejs.org) |
| npm | 10+ | Comes with Node.js |
| Git | Any | For cloning |
| OpenAI API key | — | For CV tailoring. Free trial works. Get one at [platform.openai.com](https://platform.openai.com) |

> **Windows users**: No additional toolchain needed for running the app. For development, Python 3 may be needed by `better-sqlite3` native build — install from Microsoft Store if prompted.

---

## Quick Start (Development)

```bash
# 1. Clone
git clone https://github.com/kenverse/job-os.git
cd job-os

# 2. Install dependencies
npm install

# 3. Create local env file (no secrets go in here)
cp .env.example .env

# 4. Start dev server (renderer) + main process watcher + Electron
npm run start
```

The app will open in a desktop window. Hot-reload is active for the renderer. Main process changes require an app restart.

---

## First-Time Setup

When the app opens for the first time:

1. **Settings → Profile** — Fill in your name, email, summary, LinkedIn, and portfolio URL.
2. **Settings → Profile → Skills** — Add your skills with levels and years.
3. **Settings → Profile → Preferences** — Add target roles (Product Designer, Virtual Assistant, Automation Specialist) and preferred locations.
4. **Settings → AI & Tailoring** — Enter your OpenAI API key. It is stored encrypted, never logged.
5. **Overview → Fetch Jobs Now** — Triggers the first ingestion run. Expect 50–200 jobs to appear.
6. **Discover → Browse** — Jobs are now scored and filtered. High-fit jobs are highlighted in green.

---

## Project Structure

```
src/
├── main/                   # Electron main process (Node.js)
│   ├── db/                 # Drizzle schema, migrations, seed
│   ├── ipc/                # IPC handler registration
│   ├── scheduler/          # node-cron background tasks
│   └── services/
│       ├── applications/   # Status machine, duplicate blocking
│       ├── ingestion/      # Adapters, normalizer, deduplicator
│       ├── profile/        # User profile CRUD
│       ├── scoring/        # Weighted fit scoring engine
│       └── tailoring/      # OpenAI-based CV tailoring
├── renderer/               # React frontend
│   ├── components/         # Layout, UI primitives
│   ├── hooks/              # Notification listener
│   ├── pages/              # Overview, Jobs, JobDetail, Pipeline, etc.
│   └── store/              # Zustand state stores
└── shared/types/           # Shared TypeScript types (main + renderer)

tests/
├── fixtures/               # Mock profile and job data
├── unit/                   # Scoring, normalizer, adapter tests
└── integration/            # Application service state machine tests
```

---

## Running Tests

```bash
# Run all tests once
npm test

# Watch mode
npm run test:watch

# With coverage report
npm run test:coverage
```

**Test coverage targets:**

| Module | Tests |
|--------|-------|
| Scoring engine | Unit: score bounds, tier assignment, skill matching |
| Normalizer | Unit: fingerprint determinism, field mapping, truncation |
| Adapters | Unit: mock API/RSS parse, error handling |
| Application service | Integration: full status machine via in-memory SQLite |

---

## Building for Windows

### Development build (unpacked — for testing packaging)

```bash
npm run package:dir
```

Output: `release/{version}/win-unpacked/KenVerse Job OS.exe`

### Full installer build

```bash
npm run package
```

Output:
- `release/{version}/KenVerse Job OS Setup {version}.exe` — NSIS installer
- `release/{version}/KenVerse-Job-OS-Portable-{version}.exe` — Portable executable

### Build requirements for packaging

- Windows 10/11 or a Windows VM (native-build of better-sqlite3 requires Windows for NSIS)
- On CI: Use a Windows GitHub Actions runner

```yaml
# .github/workflows/build.yml excerpt
jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run package
      - uses: actions/upload-artifact@v4
        with:
          name: windows-installer
          path: release/**/*.exe
```

---

## Adding Job Sources

Each source is a config entry in the database (seeded on first run) pointing to a named adapter.

### Add a new RSS source

1. Open the app → Settings → Job Sources
2. Click **Add Source**
3. Choose adapter type: `rss`
4. Set `feedUrl` in the config JSON field:

```json
{
  "feedUrl": "https://example.com/remote-jobs.rss",
  "sourceName": "Example Board"
}
```

### Add a new API source

1. Write a new adapter class extending `BaseAdapter` in `src/main/services/ingestion/adapters/`
2. Register it in `ADAPTER_REGISTRY` in `adapters/index.ts`
3. Insert a new `job_source` record via the Settings page with your `adapterKey`

Example adapter skeleton:

```typescript
export class MyBoardAdapter extends BaseAdapter {
  async fetch(): Promise<IngestionResult> {
    const response = await axios.get("https://api.myboard.com/jobs", {
      headers: { "User-Agent": "KenVerse-JobOS/1.0 (personal job search tool)" },
      timeout: 15000,
    });

    return {
      records: response.data.map((job) => ({
        externalId: `myboard_${job.id}`,
        title: job.title,
        company: job.company,
        locationType: job.remote ? "remote" : undefined,
        descriptionRaw: job.description,
        applyUrl: job.url,
        tags: job.tags,
      })),
      totalFetched: response.data.length,
      source: "myboard",
      fetchedAt: Date.now(),
    };
  }
}
```

---

## Configuration Reference

### Environment variables (`.env`)

```
# Development only — production uses OS keychain via electron-store
NODE_ENV=development

# Optional: override ingestion schedule (cron syntax)
INGESTION_SCHEDULE="0 */6 * * *"
```

### System settings (stored in SQLite)

| Key | Default | Description |
|-----|---------|-------------|
| `ingestion_schedule_hours` | `6` | Hours between auto-ingestion runs |
| `follow_up_days` | `7` | Days after applying before follow-up reminder |
| `high_fit_threshold` | `70` | Minimum score for "high fit" classification |
| `notifications_enabled` | `true` | Show in-app notifications |

### Secure settings (encrypted via electron-store)

| Key | Set via |
|-----|---------|
| `openai` API key | Settings → AI & Tailoring |

---

## Architecture

```
Renderer (React)
    │  IPC (contextBridge)
    ▼
Main Process (Node.js)
    ├── Services (profile, ingestion, scoring, tailoring, applications)
    ├── Scheduler (node-cron) → runs ingestion every 6h
    └── SQLite (Drizzle ORM) → local database
         └── ~/AppData/Roaming/kenverse-job-os/kenverse.db
```

Full architecture documentation: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## Troubleshooting

### App won't open / white screen

- Check `dev-data/kenverse.db` exists and is not corrupted
- Run `npm run db:migrate` to apply any missing migrations
- Check console output with `npm run start` for detailed error messages

### No jobs appearing after "Fetch Jobs Now"

- Check internet connectivity
- Check Settings → Job Sources — all sources should show "Active"
- Check Logs page for ingestion errors
- Remotive and Arbeitnow APIs may have temporary downtime — try again in a few minutes

### CV tailoring fails

- Verify your OpenAI API key is set in Settings → AI & Tailoring
- Ensure your profile has skills and a summary filled in
- Check your OpenAI account has available credits

### High antivirus false positives on the installer

- This is common with unsigned Electron apps on Windows Defender
- Solution A: Add the app folder to Windows Defender exclusions
- Solution B: Run the portable `.exe` directly instead of the installer
- Solution C (Phase 2): Code-sign the installer with an EV certificate

### Database corruption after crash

- The DB uses WAL mode which provides crash recovery in most cases
- If corrupt: delete `kenverse.db` and restart — data will need to be re-ingested
- Phase 2: Automatic nightly backup to `kenverse.db.bak`

---

## Limitations and Compliance Notes

- **No automated form submission**: The system never auto-fills or submits job applications. You always apply manually via your browser. The app opens the apply URL and provides a checklist.
- **No captcha bypass**: The system never attempts to bypass CAPTCHAs or anti-bot protections.
- **No credential fabrication**: The CV tailoring engine is explicitly prompted never to invent experience, dates, companies, or qualifications. Review every generated document before use.
- **Platform rate limits**: The ingestion scheduler runs every 6 hours and uses small delays between requests to respect rate limits. Do not reduce these intervals.
- **Single user only**: This app is designed for personal use on one machine. It has no authentication, encryption of job data, or multi-user isolation.
- **OpenAI data processing**: When you tailor a CV, your job description and profile data are sent to the OpenAI API. Review OpenAI's data usage policy at [openai.com/policies/privacy-policy](https://openai.com/policies/privacy-policy).

---

## Development Checklist

- [x] Phase 1: Requirements, compliance boundaries, scope definition
- [x] Phase 2: Phased roadmap, out-of-scope list
- [x] Phase 3: Stack decision (Electron + React + Drizzle/SQLite), architecture, data model, workflows
- [x] Phase 4: Repository scaffold, tooling, configuration
- [x] Phase 5: Core services (profile, ingestion, scoring, tailoring, applications)
- [x] Phase 6: Test suite (unit + integration)
- [x] Phase 7: Windows packaging configuration (electron-builder, NSIS + portable)
- [x] Phase 8: Documentation (README, planning doc, architecture notes)
- [ ] Phase 2 roadmap: Browser assistant, email import, analytics, plugin architecture

---

*KenVerse Job OS — built for one user, built to last.*
