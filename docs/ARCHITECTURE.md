# SprintDesk Architecture

## Layers
1. **Pages / Components** — presentation and user interaction only.
2. **Hooks / Query Layer** — TanStack Query owns API lifecycle, caching, loading, errors and polling.
3. **Service Layer** — `src/api/client.ts` centralizes HTTP access and auth interception.
4. **Application State** — Zustand owns auth, board, notifications and theme.
5. **Data Sources** — provided `mock-data.json`, DummyJSON auth and JSONPlaceholder notification polling.

## State boundaries
- Server state: TanStack Query.
- Shared application state: Zustand.
- Temporary form state: component `useState`.

## Drag and drop
`@dnd-kit/core` handles pointer interaction. Board columns are droppable zones and tasks are draggable. Cross-column moves and same-column reordering update the Zustand store, which is persisted locally.

## Authentication
Access tokens remain in memory. Refresh tokens are simulated in localStorage. The Axios interceptor attaches Bearer tokens and performs one silent refresh + retry after a 401 response.
