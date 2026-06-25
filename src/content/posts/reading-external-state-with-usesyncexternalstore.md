---
title: 'useSyncExternalStore, Without the Mystery: Part 1'
published: 2026-06-15
draft: false
description: 'Learn the basic useSyncExternalStore contract and what React roughly does internally when an external store changes.'
tags: ['javascript', 'typescript', 'react']
---

Have you ever had some state sitting just outside React, then wondered why your component did not update when that state changed?

That is the exact little gap `useSyncExternalStore` is built for.

Most React state is boring in a good way.

You call `useState`, React stores the value, and your component re-renders when that value changes.

```tsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

But sometimes React is not the owner of the state.

Maybe the value lives in:

- A tiny custom store
- A state management library
- A WebSocket cache
- `window.location`
- `navigator.onLine`
- `localStorage`

That is where `useSyncExternalStore` comes in.

The short version:

**`useSyncExternalStore` lets React read and subscribe to state that lives outside React.**

In this first part, we'll keep the scope small: one tiny store, one component, and a practical look at what React roughly does internally.

## The Problem

Let's say we have a tiny counter store outside React.

```ts
let count = 0;
const listeners = new Set<() => void>();

export const counterStore = {
  get() {
    return count;
  },

  increment() {
    count++;
    listeners.forEach((listener) => listener());
  },

  subscribe(listener: () => void) {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  },
};
```

This store works fine by itself:

```ts
counterStore.increment();
console.log(counterStore.get()); // 1
```

But React does not know when `count` changes.

If a component simply reads `counterStore.get()`, it will not re-render when the store updates.

```tsx
function Counter() {
  const count = counterStore.get();

  return <button onClick={() => counterStore.increment()}>Count: {count}</button>;
}
```

Clicking the button changes the store, but the UI can stay stuck. React was never told to render again.

## The Naive Approach

The first idea is usually `useState` plus `useEffect`.

```tsx
import { useEffect, useState } from 'react';

function Counter() {
  const [count, setCount] = useState(counterStore.get());

  useEffect(() => {
    return counterStore.subscribe(() => {
      setCount(counterStore.get());
    });
  }, []);

  return <button onClick={() => counterStore.increment()}>Count: {count}</button>;
}
```

This is not ridiculous. For many small apps, it may appear to work.

But there is a mismatch:

1. The source of truth is the external store.
2. React state is now a copy of that external value.
3. The subscription starts after render, inside an effect.
4. React has no clear contract for asking, "What is the store value right now?"

So React gives us a hook made for this exact job.

## The Hook

`useSyncExternalStore` takes two required functions and one optional function.

```tsx
const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
```

Here is what each piece means:

- **`subscribe`** tells React how to listen for store changes.
- **`getSnapshot`** tells React how to read the current value.
- **`getServerSnapshot`** tells React what value to use during server rendering.

If you are not doing server rendering, you can ignore the third argument for now.

The name sounds intimidating, but the idea is small:

```text
React: "How do I read the current value?"
Store: "Call getSnapshot."

React: "How do I know when it changed?"
Store: "Call subscribe."
```

That is the contract.

## Using The Store

Let's connect our counter store to React.

```tsx
import { useSyncExternalStore } from 'react';
import { counterStore } from './counterStore';

function Counter() {
  const count = useSyncExternalStore(counterStore.subscribe, counterStore.get);

  return <button onClick={() => counterStore.increment()}>Count: {count}</button>;
}
```

Now React knows two things:

1. How to read the current count.
2. How to subscribe when the count changes.

When `counterStore.increment()` runs, it calls every listener. React hears that signal, calls `counterStore.get()` again, compares the result, and re-renders if the value changed.

No copied state. No effect in the component. No manual syncing.

## Extracting A Hook

You probably do not want every component to know about `subscribe` and `get`.

So wrap it in a custom hook.

```tsx
import { useSyncExternalStore } from 'react';
import { counterStore } from './counterStore';

export function useCounter() {
  return useSyncExternalStore(counterStore.subscribe, counterStore.get);
}
```

Now the component becomes boring again.

```tsx
function Counter() {
  const count = useCounter();

  return <button onClick={() => counterStore.increment()}>Count: {count}</button>;
}
```

That boring API is the point.

## What Is A Snapshot?

A **snapshot** is the value React reads from the external store during render.

For our counter, the snapshot is simple:

```ts
counterStore.get(); // 0, 1, 2, ...
```

The important rule: if the store has not changed, `getSnapshot` should return the same value as before.

This is easy for strings, numbers, booleans, and stable objects from a store.

This is bad:

```tsx
function getSnapshot() {
  return { count: counterStore.get() };
}
```

That creates a new object every time. React sees a different object and thinks the snapshot changed.

Better:

```tsx
function getSnapshot() {
  return counterStore.get();
}
```

If your snapshot really needs to be an object, cache it in the store and only replace it when the underlying data changes.

## What React Does Internally

Let's make a tiny fake version.

This is not React's real source code. It is just the useful mental model.

```ts
function useTinyExternalStore<T>(
  subscribe: (callback: () => void) => () => void,
  getSnapshot: () => T,
) {
  const snapshot = getSnapshot();

  afterReactCommits(() => {
    // During commit, React subscribes to future changes.
    return subscribe(() => {
      const nextSnapshot = getSnapshot();

      if (!Object.is(snapshot, nextSnapshot)) {
        // Tell React this component needs to render again.
        rerender();
      }
    });
  });

  beforeReactCommits(() => {
    const nextSnapshot = getSnapshot();

    if (!Object.is(snapshot, nextSnapshot)) {
      // The store changed while React was rendering.
      rerender();
    }
  });

  return snapshot;
}
```

Real React is more careful than this, but this gets the shape right:

1. Read the snapshot during render.
2. Store the snapshot React just rendered with.
3. Subscribe to the external store.
4. When the store notifies React, read the snapshot again.
5. Compare the old and new snapshots with `Object.is`.
6. Re-render if they are different.

That explains why returning a fresh object from `getSnapshot` is a problem. React keeps asking, "Did the value change?" and the answer is always yes.

## The Render Gap

There is one more detail worth knowing.

React does not only check the store when your subscription fires. It also does consistency checks around rendering.

Why?

Because an external store can change outside React.

Imagine this flow:

```text
React starts rendering with count = 1
External store changes to count = 2
React is about to commit the UI for count = 1
```

Without an extra check, React could commit a UI based on stale external data.

So React's implementation keeps enough information to ask:

```text
"Is the snapshot I rendered still the latest snapshot?"
```

If not, React forces another render with the new value.

This is one of the reasons the hook exists. It gives React a reliable way to read the current external value and verify that the value did not change at an awkward time.

## Why "Sync" Is In The Name

The word **sync** is there because updates from external stores are treated synchronously.

That does not mean your whole app becomes synchronous. It means React needs store subscriptions to behave in a very direct way:

```text
Store changed
Notify React
React reads latest snapshot
React updates if needed
```

External stores usually do not have multiple in-progress versions of state for React to choose from. There is just the current store value.

So React keeps this contract strict and simple.

## What We've Built

We built a tiny external counter store and connected it to React with `useSyncExternalStore`.

The hook needs two main things:

1. `getSnapshot`, so React can read the current value.
2. `subscribe`, so React can re-render when the value changes.

Then we looked at the internal shape:

```text
read snapshot
subscribe
on change, read again
compare with Object.is
re-render if changed
```

React owns the rendering. The external store owns the data. `useSyncExternalStore` is the bridge between them.

In [Part 2](/posts/usesyncexternalstore-real-world-cases), we'll cover the stuff we skipped here: `localStorage`, online status, URL state, server rendering, selectors, and the rough edges that show up in real apps.

## References

- https://react.dev/reference/react/useSyncExternalStore
- https://github.com/reactjs/rfcs/blob/main/text/0214-use-sync-external-store.md
- https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberHooks.js
