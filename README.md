# SprintDesk

SprintDesk is a sprint management dashboard built for the **GrubPac Frontend Engineer assessment**.

It allows users to manage sprint tasks through a Kanban board, track progress, view analytics, and receive activity notifications from a responsive dashboard.

---

## Features

- 🔐 Authentication with protected routes, in-memory access tokens, and automatic refresh
- 📋 Kanban board with drag-and-drop task management across Backlog → In Progress → Review → Done
- ✏️ Create, edit, delete, and reorder tasks
- 💬 Task descriptions and comments
- 🎯 Priority and assignee filtering
- 📊 Sprint velocity, task status, priority breakdown, and completion trend analytics
- 🔔 Notification center with unread tracking, duplicate protection, and visibility-aware polling
- 🍞 Toast feedback with contextual actions (e.g. Undo)
- 🌗 Light and dark mode across the entire UI
- 💾 Persistent board and notification state across reloads
- 📱 Responsive UI
- 🧪 Automated tests with Vitest and React Testing Library

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React 18 + TypeScript | Frontend development |
| Vite | Development and production build |
| Tailwind CSS | Styling |
| Zustand | Application state management |
| TanStack Query | Server state and polling |
| Axios | API communication |
| React Router | Routing and protected routes |
| @dnd-kit | Drag-and-drop interactions |
| Recharts | Analytics and charts |
| Vitest + React Testing Library | Testing |

---

## Architecture

```text
UI / Pages
    ↓
Hooks & TanStack Query
    ↓
API / Service Layer
    ↓
Mock Data / External APIs
```

- **Zustand** manages authentication, board, notifications, and UI preferences.
- **TanStack Query** manages server state, data fetching, and notification polling.
- **Axios** handles API requests, authentication headers, token refresh, and error normalization.
- **@dnd-kit** powers Kanban drag-and-drop interactions.
- **Recharts** powers the analytics dashboard.

Server state and application state are intentionally kept separate to avoid mixing caching/loading concerns with global UI state.

---

## Authentication Flow

```text
User Login
    ↓
DummyJSON
    ├── Access Token   → Memory
    └── Refresh Token  → localStorage
                          ↓
                   Session restoration
                          ↓
                Automatic token refresh
```

On a `401 Unauthorized` response, the API layer requests a new access token, retries the original request, and deduplicates simultaneous refresh calls so concurrent requests don't trigger multiple refresh operations.

---

## Data Sources

| Source | Purpose |
|---|---|
| `public/mock-data.json` | Primary application data (unmodified) |
| DummyJSON | Authentication and token refresh |
| JSONPlaceholder | Simulated notification polling |

---

## Demo Login

```text
Username: emilys
Password: emilyspass
```

---

## Getting Started

**Installation**
```bash
npm install
```

**Development**
```bash
npm run dev
```

**Production Build**
```bash
npm run build
```

**Preview Production Build**
```bash
npm run preview
```

---

## Testing

```bash
npm run test
```

Current test coverage:
- 4 test files passed
- 10 tests passed

Covers: board store actions (add/move/delete task), notification store (duplicate protection, mark-all-read), toast behaviour, and the authentication refresh/retry interceptor.

---

## Project Structure

```text
src/
├── api/          # Axios client, interceptors, and authentication services
├── components/   # Reusable UI primitives
├── features/     # Feature-specific components
├── hooks/        # Custom React hooks
├── pages/        # Application pages (Login, Dashboard, Board, Analytics)
├── store/        # Zustand stores (auth, board, notifications, UI)
└── types/        # TypeScript types

tests/            # Automated tests
public/           # Static application data
```

---

## Security Notes

This is an assessment application using simulated authentication rather than a production backend:

- Access tokens are kept in memory only, never persisted.
- Refresh tokens are stored in `localStorage`, as required by the assessment setup.
- Protected routes block unauthenticated access.
- API errors are normalized into a single `ApiError` shape before reaching UI components.

In a production system, tokens would be handled via secure, HttpOnly cookies according to the backend's security model.

---

## Author

**Deepak Kumar**
Frontend / Full-Stack Developer
