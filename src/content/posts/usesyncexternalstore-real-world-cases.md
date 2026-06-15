---
title: 'useSyncExternalStore in Real Apps: Part 2'
published: 2026-06-15
draft: true
description: 'Use React useSyncExternalStore with browser APIs, localStorage, selectors, SSR, and practical external state patterns.'
tags: ['javascript', 'typescript', 'react']
---

In [Part 1](/posts/reading-external-state-with-usesyncexternalstore), we kept things tiny on purpose.

One store. One component. One basic `useSyncExternalStore` contract:

```tsx
const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
```

This part is about the stuff that shows up as soon as the example leaves the blog post:

- Browser APIs
- `localStorage`
- Cross-tab updates
- WebSocket data caches
- Server rendering
- Selectors
- Stable snapshots
- Invalid external data

Let's go through the practical cases, one at a time.

## Online Status

This is the cleanest browser API example because the browser already gives us events.

```tsx
import { useSyncExternalStore } from 'react';

function subscribe(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);

  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

function getServerSnapshot() {
  return true;
}

export function useOnlineStatus() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
```

Then use it like normal React state:

```tsx
function NetworkBadge() {
  const isOnline = useOnlineStatus();

  return <p>{isOnline ? 'Online' : 'Offline'}</p>;
}
```

The source of truth is the browser. React just subscribes to it.

## URL Pathname

The current URL is also external state.

Here is a tiny pathname hook:

```tsx
import { useSyncExternalStore } from 'react';

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener('popstate', emitChange);

  return () => {
    listeners.delete(callback);
    window.removeEventListener('popstate', emitChange);
  };
}

function getSnapshot() {
  return window.location.pathname;
}

function getServerSnapshot() {
  return '/';
}

export function usePathname() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function navigate(pathname: string) {
  history.pushState(null, '', pathname);
  emitChange();
}
```

This handles back and forward navigation.

The `navigate` helper covers programmatic navigation too, because `history.pushState` does not fire a `popstate` event by itself.

That is the pattern to remember:

```text
External value changed
Notify subscribers
React reads getSnapshot again
```

## Local Storage

`localStorage` is a common external source, but it has one annoying detail.

The browser's `storage` event fires in other tabs, not the same tab that called `localStorage.setItem`.

So if we want same-tab updates, our store needs to notify local listeners manually.

```ts
const key = 'theme';
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

export const themeStore = {
  getSnapshot() {
    return localStorage.getItem(key) ?? 'light';
  },

  setTheme(theme: 'light' | 'dark') {
    localStorage.setItem(key, theme);
    emitChange();
  },

  subscribe(listener: () => void) {
    listeners.add(listener);

    window.addEventListener('storage', listener);

    return () => {
      listeners.delete(listener);
      window.removeEventListener('storage', listener);
    };
  },
};
```

And the hook:

```tsx
import { useSyncExternalStore } from 'react';
import { themeStore } from './themeStore';

export function useTheme() {
  return useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getSnapshot,
    () => 'light',
  );
}
```

Then a component:

```tsx
function ThemeToggle() {
  const theme = useTheme();
  const nextTheme = theme === 'light' ? 'dark' : 'light';

  return (
    <button onClick={() => themeStore.setTheme(nextTheme)}>Switch to {nextTheme}</button>
  );
}
```

This covers same-tab updates and cross-tab updates.

## WebSocket Cache

A WebSocket cache is another good fit because market data changes outside React.

Let's say the server sends price updates like this:

```json
{ "symbol": "BTC-USD", "open": 104200, "high": 105100, "low": 103900, "close": 104850 }
```

The store can own the socket and keep the latest candle in memory.

```ts
export type Ohlc = {
  open: number;
  high: number;
  low: number;
  close: number;
};

export type MarketSnapshot = {
  status: 'connecting' | 'open' | 'closed';
  current: Ohlc | null;
  change: number;
};

const listeners = new Set<() => void>();
let snapshot: MarketSnapshot = {
  status: 'connecting',
  current: null,
  change: 0,
};

function emitChange() {
  listeners.forEach((listener) => listener());
}

function setSnapshot(nextSnapshot: MarketSnapshot) {
  snapshot = nextSnapshot;
  emitChange();
}

const socket = new WebSocket('wss://example.com/markets/BTC-USD');

socket.addEventListener('open', () => {
  setSnapshot({ ...snapshot, status: 'open' });
});

socket.addEventListener('close', () => {
  setSnapshot({ ...snapshot, status: 'closed' });
});

socket.addEventListener('message', (event) => {
  const next = JSON.parse(event.data) as Ohlc;
  const previousClose = snapshot.current?.close ?? next.open;

  setSnapshot({
    ...snapshot,
    current: next,
    change: next.close - previousClose,
  });
});

export const marketStore = {
  getSnapshot() {
    return snapshot;
  },

  subscribe(listener: () => void) {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  },
};
```

Then React gets a normal hook:

```tsx
import { useSyncExternalStore } from 'react';
import type { MarketSnapshot } from './marketStore';
import { marketStore } from './marketStore';

const emptyMarketSnapshot: MarketSnapshot = {
  status: 'closed',
  current: null,
  change: 0,
};

export function useMarket() {
  return useSyncExternalStore(
    marketStore.subscribe,
    marketStore.getSnapshot,
    () => emptyMarketSnapshot,
  );
}
```

And the component just renders the current snapshot:

```tsx
function MarketTicker() {
  const market = useMarket();

  return (
    <section>
      <p>Status: {market.status}</p>
      <p>Close: {market.current?.close ?? '-'}</p>
      <p>Change: {market.change}</p>
    </section>
  );
}
```

Notice the important part: `getSnapshot` returns the current cached snapshot. It does not create a fresh object during render.

If a component only cares about the latest close price, make the snapshot smaller:

```tsx
export function useCurrentClose() {
  return useSyncExternalStore(
    marketStore.subscribe,
    () => marketStore.getSnapshot().current?.close ?? null,
    () => null,
  );
}
```

Now that component only re-renders when the selected primitive changes.

```tsx
function CurrentPrice() {
  const close = useCurrentClose();

  return <strong>{close ?? '-'}</strong>;
}
```

## Stable Snapshots

This part matters enough to repeat.

This snapshot is stable:

```ts
function getSnapshot() {
  return localStorage.getItem('theme') ?? 'light';
}
```

It returns a string. If the value is still `'light'`, React sees the same value.

This snapshot is not stable:

```ts
function getSnapshot() {
  return {
    theme: localStorage.getItem('theme') ?? 'light',
  };
}
```

It returns a new object every time. React sees a different value even when the theme did not change.

If you need an object, cache it.

```ts
let lastTheme: string | null = null;
let lastSnapshot = { theme: 'light' };

function getSnapshot() {
  const theme = localStorage.getItem('theme') ?? 'light';

  if (theme !== lastTheme) {
    lastTheme = theme;
    lastSnapshot = { theme };
  }

  return lastSnapshot;
}
```

Not glamorous. Correct.

## Selectors

Sometimes the store has a big snapshot, but a component only needs one field.

```ts
type AppState = {
  user: { name: string } | null;
  theme: 'light' | 'dark';
  unreadCount: number;
};
```

The lazy version is to make `getSnapshot` return just the field you need.

```tsx
function useUnreadCount() {
  return useSyncExternalStore(
    appStore.subscribe,
    () => appStore.getSnapshot().unreadCount,
    () => 0,
  );
}
```

That works well for primitives.

For object selections, you need the same stability rule. Do not create a fresh object unless the selected data really changed.

React's separate `use-sync-external-store/with-selector` package exists for this kind of case, especially for libraries. For app code, start simple and add selector helpers only when repeated selector logic becomes annoying.

## Server Rendering

If your app renders on the server, browser globals like `window`, `navigator`, and `localStorage` do not exist there.

That is what `getServerSnapshot` is for.

```tsx
function getServerSnapshot() {
  return true;
}

export function useOnlineStatus() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
```

`getServerSnapshot` gives React a safe value to use during server rendering and hydration.

Keep it boring. The server snapshot should match what you expect the first client render to see, or hydration can complain.

For values that are truly client-only, a simple fallback is usually enough:

```tsx
function getServerSnapshot() {
  return 'light';
}
```

Then the client can update after hydration if the real value is different.

## Error Handling

`getSnapshot` should be boring and safe.

But external data can be messy. For example, `localStorage` can contain invalid JSON.

```ts
function getSnapshot() {
  try {
    const raw = localStorage.getItem('settings');
    return raw ? JSON.parse(raw) : defaultSettings;
  } catch {
    return defaultSettings;
  }
}
```

Do not let every render crash because one external value is malformed.

Keep the validation close to the external boundary. Once the data enters React, it should already be shaped like something your component can render.

## When To Use It

Use `useSyncExternalStore` when React needs to render a value that lives outside React and can change over time.

Good fits:

- Custom stores
- Browser APIs with events
- State management libraries
- WebSocket-backed caches
- Shared client-side data sources
- URL or storage-backed state

The hook is especially useful when you are building a small store or wrapping an existing non-React API.

## When Not To Use It

Do not use `useSyncExternalStore` for normal component state.

This is still the right tool for local UI state:

```tsx
const [isOpen, setIsOpen] = useState(false);
```

This is still the right tool for app state passed through React:

```tsx
const user = useContext(UserContext);
```

And if you are using a state management library, you probably do not need to call `useSyncExternalStore` directly. The library may already use it internally.

## What We've Built

We used `useSyncExternalStore` with:

1. Online status
2. URL pathname
3. `localStorage`
4. WebSocket-backed caches
5. Stable object snapshots
6. Field selectors
7. Server rendering fallbacks

The core contract stayed the same every time:

```text
getSnapshot reads the current value
subscribe tells React when to read again
getServerSnapshot gives SSR a safe first value
```

That is the whole thing.

Keep the store simple. Keep snapshots stable. Notify React when the external value changes.

## References

- https://react.dev/reference/react/useSyncExternalStore
- https://github.com/reactjs/rfcs/blob/main/text/0214-use-sync-external-store.md
- https://github.com/reactwg/react-18/discussions/86
- https://github.com/facebook/react/tree/main/packages/use-sync-external-store
