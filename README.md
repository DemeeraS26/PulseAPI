# Pulse API

A local API testing tool: a FastAPI proxy backend + a React/Vite/Tailwind
frontend, with a request tester, dashboard, reports, and saved
requests/collections — all backed by an in-memory backend store and
`localStorage` on the frontend. No database, no auth. This is a personal
dev tool, not a hosted product — see "Known limitations" below before you
put it anywhere public.

## Run it

**Backend**
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload
```
Runs on `http://localhost:8000`.

**Frontend** (separate terminal)
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173` and proxies `/api/*` to the backend (see
`vite.config.js`).

## What's here

- **Tester** — build a request (method, URL, params, headers, JSON/raw
  body), send it through the backend proxy, inspect the response
  (headers, pretty/raw body, timing, size). `Cmd/Ctrl+Enter` sends.
  Save a request for later; recent sends show up in the side rail.
- **Dashboard** — total requests, success rate, average response time,
  status-code and method distribution, slowest/fastest endpoints.
  Auto-refreshes every 5s.
- **Reports** — generate a point-in-time summary and export it as JSON.
- **Saved** — search, load, delete saved requests; export/import a whole
  collection as JSON.
- **Environments** — a variable set (e.g. `base_url`, `token`) you can
  reference in any URL/header/body field as `{{base_url}}`; swapped in at
  send time. Managed via `storage.js`; the default environment ships
  empty — edit it in `localStorage` or extend the UI if you want an
  in-app editor (not built yet, see below).

## Known limitations (by design, not oversight)

- **No persistence on the backend.** History/analytics live in memory
  and reset on restart. Add a SQLite file if you want it to survive
  restarts — the `HISTORY` list in `main.py` is the only place that
  would touch.
- **No auth, CORS wide open.** Fine for `localhost`. Do not deploy this
  as-is somewhere reachable by other people.
- **No environment editor UI yet.** The environments system
  (`storage.js`) is functional but there's no settings screen to add/
  edit variables from the UI — you'd add one as the next real feature
  rather than have it half-built and empty here.
- **No automated tests.** Given this was rebuilt specifically to stop
  chasing empty/broken files, the priority was working code over test
  scaffolding. Add `pytest` (backend) and `vitest` (frontend) as a next
  step if this becomes more than a personal tool.

## Project structure

```
api-sentinel/
├── backend/
│   ├── main.py            # FastAPI app: proxy, history, analytics, reports
│   └── requirements.txt
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── main.jsx        # React entry point
        ├── App.jsx         # Tab routing, toast host
        ├── api.js          # fetch wrapper for the backend
        ├── storage.js      # localStorage: saved requests, envs
        ├── index.css       # Tailwind directives + a few keyframes
        └── components/
            ├── Sidebar.jsx
            ├── Tester.jsx          # composes RequestEditor + ResponseViewer + history
            ├── RequestEditor.jsx   # method/url/params/headers/body
            ├── ResponseViewer.jsx  # status/headers/body, copy/download
            ├── Dashboard.jsx
            ├── Reports.jsx
            ├── SavedRequests.jsx
            ├── KeyValueEditor.jsx  # shared by params + headers
            ├── JsonViewer.jsx      # pretty-print + syntax highlight
            ├── StatusBar.jsx       # method/status badges, response meta
            └── Toast.jsx
```
