# UI & product implementation plan

A drafting-table collaborative board (Excalidraw-style). Fix **flow first**, then **UI**, then **canvas behavior**.

**Design direction:** physical studio, not a generic dashboard.

- Canvas paper: `#f4efe4` with a faint grid
- Chrome: charcoal `#1c1917`
- Accent: ink copper `#c45c26`
- Type: Newsreader (display) + Schibsted Grotesk (UI)
- Controls: floating pills over the canvas, not permanent fat sidebars

Tokens live in `apps/web/app/globals.css`.

---

## What’s wrong today

The product path is `/` → `/login` → `/user` → `/room` → `/room/[id]`.  
It should be **landing → auth → rooms → canvas**.

| Screen | Actual state |
|---|---|
| `/` | Next starter leftover: “Hi there!” |
| `/login`, `/signup` | Unstyled inputs, no errors, no loading, no link between them |
| `/user` | Debug dump of JWT + `JSON.stringify(user)` |
| `/room` | Unstyled lists + create form **and a full Whiteboard on the lobby** |
| `/room/[id]` | Room chrome + chat **plus** a Whiteboard that is itself `h-screen` with a 320px sidebar |

Canvas issues on top of that:

- Whiteboard assumes it owns the whole viewport (`window.innerWidth - 320`)
- Arrow tool is in the toolbar but never drawn
- Drawings stay in React state — they are **not** sent over the socket or saved as `canvasState`
- Members are fetched and unused
- Chat is a 256px strip that steals canvas height
- `/room` imports Whiteboard without `dynamic(..., { ssr: false })`, so `window` can blow up on SSR

---

## Target product flow

```
/                  marketing + “Open board”
/login  /signup    auth only
/rooms             hub: my rooms, join, create
/rooms/[id]        full-viewport studio (canvas + overlays)
```

- Delete `/user`. After login/signup go straight to `/rooms`.
- If token exists, `/` “Open board” and `/login` skip into `/rooms`.
- If no token, `/rooms` and `/rooms/[id]` redirect to `/login`.

---

## Phase 0 — Foundation

Status: **done** (lobby Whiteboard also removed so SSR does not crash on `window`)

1. **API client** — one axios instance from `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_WS_URL`. No hardcoded `localhost:3001` / `8080`.
2. **Auth types** — `user: { id, name, email } | null`, not `JSON`. Typed persist in Zustand.
3. **Route guard** — one provider in root layout. `RequireAuth` / `RedirectIfAuthed`.
4. **Shared shell**
   - `AppHeader` for landing + rooms (logo, user, logout)
   - `StudioChrome` for the canvas route only
5. **UI primitives** — `Button`, `Input`, `Card`, `Modal`, `EmptyState` in `apps/web`.

**Done when:** env-driven API/WS, typed auth, one guard pattern, tokens + primitives exist, lobby/canvas have the right chrome wrappers.

---

## Phase 1 — Kill the broken IA

Status: **done**

- Deleted `app/user/`
- Frontend routes are `/rooms` and `/rooms/[id]` (API stays `/api/room`)
- Login and signup go to `/rooms`
- Lobby has no nested Whiteboard
- Logout clears auth + room persist (Phase 0)
- `/user` and `/room` redirect to `/rooms`

**Done when:** a new user can register, land on rooms, and never see the Users debug page. Landing copy is Phase 2.

---

## Phase 2 — Landing + auth UI

Status: **done**

**Landing (`/`)**  
Short pitch, 2 CTAs (Start drawing / Sign in), a paper board preview. Logged-in users see “Go to rooms”.

**Login / Signup**  
Split layout: ink illustration on one side, form on the other (stacks on mobile). Shared `AuthForm`:

- Labels, validation, password show/hide
- Inline API errors (no `alert`)
- Loading on submit
- “Need an account?” / “Already have one?”
- Signup wrapped in `<form>`

**Done when:** auth looks like a product, not a homework form.

---

## Phase 3 — Rooms hub

Status: **done**

One page, three zones, no nested canvas:

1. **Header** — greeting, create button
2. **My boards** — cards: name, description, member count, updated, **Open**
3. **Discover / join** — other rooms with **Join**, then open

Create room = modal (name + description only).

Empty state: illustration + “Create your first board”.

Join then `router.push(/rooms/${id})` in one action.

**Done when:** create / join / open is obvious in under 5 seconds.

---

## Phase 4 — Canvas studio layout

Status: **done**

`/rooms/[id]` is one full viewport. Chrome floats:

- Thin top bar: back, room name, live dot, members, chat
- Floating tool pill with SVG icons
- Paper canvas fills the leftover box via `ResizeObserver`
- Ink properties as a popover
- Chat as a right drawer, closed by default

```
┌─────────────────────────────────────────────┐
│  [back]  Room name          members  chat   │  thin top bar
│                                             │
│     [select ▭ ○ ◇ / T ✏]                   │  floating tool pill
│                                             │
│              PAPER CANVAS                   │
│                                             │
│  [stroke · fill · width]     [chat drawer]  │  properties only when needed
└─────────────────────────────────────────────┘
```

- Whiteboard **fills the remaining box** via `ResizeObserver` — never `window.innerWidth - 320`, never inner `h-screen`
- Toolbar: horizontal floating cluster, SVG icons (no emoji)
- Properties: popover on the selected tool/shape
- Members: avatar stack in the top bar
- Chat: right **drawer**, closed by default
- Connection: small dot in the top bar

Split `Whiteboard.tsx` into `StudioLayout`, `Toolbar`, `PropertiesPopover`, `KonvaStage`, `ChatDrawer`, `MembersMenu`.

**Done when:** the canvas is the page, not a widget trapped inside sidebars and a chat strip.

---

## Phase 5 — Canvas behavior

Do this **after** the layout split.

1. **Stage sizing** — observe parent; update on resize.
2. **Arrow tool** — implement or remove from the toolbar.
3. **Keyboard** — `V` select, `R` rect, `O` ellipse, `L` line, `P` pen, `T` text, `Delete`, `Esc`.
4. **Pan/zoom** — wheel zoom, space+drag pan.
5. **Realtime** — emit `shape:add` / `shape:update` / `shape:delete`; apply remote events. Do not append a raw string as a chat message object.
6. **Persistence** — load `room.canvasState` on join; debounce save.
7. **SSR** — only the Konva stage is `dynamic(..., { ssr: false })`.

**Done when:** two browsers in the same room see the same strokes and a reload restores the board.

---

## Phase 6 — Polish

- Empty canvas hint that disappears after first shape
- Toast errors for join-full / unauthorized
- Loading skeletons on rooms
- Favicon + metadata (replace “Create Next App”)
- Mobile: rooms hub works; canvas gets a bottom tool dock

---

## Suggested PR order

1. **Foundation + IA** — Phase 0 then Phase 1
2. **Design tokens + primitives + landing/auth** — Phase 2 (tokens start in Phase 0)
3. **Rooms hub** — Phase 3
4. **Studio chrome + Whiteboard layout refactor** — Phase 4
5. **Sync, persist, pan/zoom, missing tools** — Phase 5–6

Do not restyle the current canvas in place. The layout math is wrong; restyling `h-screen` inside `h-screen` will still look broken.
