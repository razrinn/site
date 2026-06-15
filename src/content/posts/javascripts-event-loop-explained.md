---
title: "JavaScript's Event Loop, Without the Headache"
published: 2026-06-15
draft: false
description: 'A practical deep dive into the JavaScript event loop, call stack, task queue, microtasks, rendering, and async code.'
tags: ['javascript', 'fundamental']
---

Have you ever written JavaScript that looked obvious, then the logs came out in a completely different order?

Something like this:

```javascript
console.log('A');

setTimeout(() => {
  console.log('B');
}, 0);

Promise.resolve().then(() => {
  console.log('C');
});

console.log('D');
```

And the output is:

```shell
A
D
C
B
```

At first, this feels like JavaScript is being sneaky. `setTimeout(..., 0)` says zero milliseconds, right? So why does the promise run first?

The answer is the **event loop**.

Don't worry though. We won't turn this into a giant browser internals lecture. Let's build the mental model piece by piece, then use it to explain real bugs you will actually see in apps.

## The Simple Definition

The **event loop** is the thing that lets JavaScript run asynchronous work without stopping the whole program.

JavaScript runs your code on one main thread. That means it can only execute one piece of JavaScript at a time.

But apps still need to do many things:

- Handle clicks
- Wait for timers
- Read files
- Fetch data
- Run promise callbacks
- Update the screen

The event loop coordinates all of that. It waits until the current JavaScript code is done, then picks the next callback that is ready to run.

The tiny version:

```text
Run current code
Run all microtasks
Maybe render the page
Run one task
Repeat
```

That is most of the article, honestly. The rest is learning what counts as "current code", "microtasks", and "tasks".

If this feels like a lot of vocabulary, hang on to this shortcut: sync code runs now, microtasks run right after, and tasks run later.

## The First Example

Let's start with the classic timer example.

```javascript
console.log('Start');

setTimeout(() => {
  console.log('Timeout');
}, 0);

console.log('End');
```

Output:

```shell
Start
End
Timeout
```

Even with `0`, the timer callback does not interrupt the current code.

Here is what happens:

1. `console.log('Start')` runs immediately.
2. `setTimeout` registers a timer callback somewhere outside the call stack.
3. `console.log('End')` runs immediately.
4. The current script finishes.
5. The event loop picks up the timer callback and runs it.

`setTimeout(..., 0)` does not mean "run now". It means "run after the current JavaScript is finished, once the timer task is allowed to run".

## The Pieces

To understand the event loop, we need four pieces.

### The Call Stack

The **call stack** tracks what JavaScript function is currently running.

```javascript
function third() {
  console.log('third');
}

function second() {
  third();
}

function first() {
  second();
}

first();
```

The stack looks roughly like this:

```text
first()
  second()
    third()
      console.log('third')
```

JavaScript keeps pushing function calls onto the stack. When a function finishes, it gets popped off.

While the stack is busy, nothing else can run. No click handler. No timer callback. No promise callback. They all wait.

### Browser APIs

Some things are not handled directly by the JavaScript engine.

In the browser, things like timers, network requests, DOM events, and rendering are provided by the browser environment.

```javascript
setTimeout(() => {
  console.log('Later');
}, 1000);
```

JavaScript does not sit there counting to 1000. The browser handles the timer. When the timer is ready, the callback gets placed into a queue.

In Node.js, the environment is different, but the idea is similar. Node has APIs for timers, files, network sockets, and more.

### The Task Queue

The **task queue** stores callbacks from things like:

- `setTimeout`
- `setInterval`
- User events like clicks
- Some browser events
- Message channel callbacks

A task is sometimes called a **macrotask**. You will see both names around. I will call it a task here.

The event loop usually takes one task, runs it to completion, then checks other work.

### The Microtask Queue

The **microtask queue** stores smaller, high-priority callbacks.

Common microtasks include:

- `Promise.then`
- `Promise.catch`
- `Promise.finally`
- `queueMicrotask`
- `MutationObserver` callbacks in the browser

Microtasks run after the current JavaScript finishes, but before the next task.

That one sentence explains a lot.

## Tasks vs Microtasks

Now let's explain the weird output from the beginning.

```javascript
console.log('A');

setTimeout(() => {
  console.log('B');
}, 0);

Promise.resolve().then(() => {
  console.log('C');
});

console.log('D');
```

Output:

```shell
A
D
C
B
```

Here's the flow:

```text
Current script:
  log A
  schedule timeout callback as a task
  schedule promise callback as a microtask
  log D

Microtask queue:
  log C

Task queue:
  log B
```

So JavaScript runs:

1. `A`, because it is normal synchronous code.
2. `D`, because the current script keeps running.
3. `C`, because microtasks run after the current script.
4. `B`, because tasks run after microtasks.

The important rule:

**Microtasks drain completely before the next task runs.**

That means if a microtask schedules another microtask, JavaScript runs that new microtask too before moving to the next task.

```javascript
Promise.resolve().then(() => {
  console.log('microtask 1');

  Promise.resolve().then(() => {
    console.log('microtask 2');
  });
});

setTimeout(() => {
  console.log('task');
}, 0);
```

Output:

```shell
microtask 1
microtask 2
task
```

Microtasks are powerful, but this also means they can block timers and rendering if you create too many of them.

## A More Complete Picture

Here is a simplified browser event loop model:

```text
+-----------------------------+
| Run current JavaScript       |
| call stack must become empty |
+-------------+---------------+
              |
              v
+-----------------------------+
| Run all microtasks           |
| promises, queueMicrotask     |
+-------------+---------------+
              |
              v
+-----------------------------+
| Browser may render           |
| style, layout, paint         |
+-------------+---------------+
              |
              v
+-----------------------------+
| Run one task                 |
| timers, clicks, events       |
+-------------+---------------+
              |
              +-- repeat
```

The browser does not render in the middle of your JavaScript function.

If your code blocks the call stack for three seconds, the page cannot repaint during those three seconds. That is why long synchronous work makes the UI freeze.

## Why The UI Freezes

Let's say we update text, then immediately do heavy work.

```html
<button id="button">Run</button>
<p id="status">Idle</p>

<script>
  const button = document.querySelector('#button');
  const status = document.querySelector('#status');

  button.addEventListener('click', () => {
    status.textContent = 'Working...';

    const start = Date.now();
    while (Date.now() - start < 3000) {
      // Simulate expensive work
    }

    status.textContent = 'Done';
  });
</script>
```

You might expect the user to see `Working...` for three seconds.

But often they will only see `Done`.

Why?

The click handler is one task. The browser cannot render until that task finishes. You changed the text to `Working...`, then blocked the thread, then changed it to `Done`, all before the browser had a chance to paint.

One small fix is to yield back to the browser before starting the heavy work.

```javascript
button.addEventListener('click', () => {
  status.textContent = 'Working...';

  setTimeout(() => {
    const start = Date.now();
    while (Date.now() - start < 3000) {
      // Simulate expensive work
    }

    status.textContent = 'Done';
  }, 0);
});
```

Now the heavy work is moved into a new task. The browser gets a chance to paint `Working...` before that task runs.

This is not magic performance optimization. It just gives the browser a breath.

## Promises Are Not Background Threads

This trips people up a lot.

Promises help coordinate asynchronous results, but the JavaScript inside a `.then()` still runs on the main thread.

```javascript
Promise.resolve().then(() => {
  const start = Date.now();
  while (Date.now() - start < 3000) {
    // Still blocks the main thread
  }

  console.log('Done');
});
```

This code still freezes the page for three seconds.

The promise callback is a microtask. It runs soon, but it does not run in parallel with the rest of your JavaScript.

If you have CPU-heavy work, common options are:

- Break it into smaller chunks
- Move it to a Web Worker in the browser
- Move it outside the request path on the server

For many UI cases, chunking is enough.

```javascript
function processInChunks(items, processItem) {
  let index = 0;

  function runChunk() {
    const deadline = Date.now() + 8;

    while (index < items.length && Date.now() < deadline) {
      processItem(items[index]);
      index++;
    }

    if (index < items.length) {
      setTimeout(runChunk, 0);
    }
  }

  runChunk();
}
```

This processes items for a few milliseconds, yields back to the browser, then continues later.

Is it fancy? No. Does it keep the page from freezing in a lot of cases? Yes.

## Async/Await And The Event Loop

`async` and `await` make promise code easier to read, but they do not remove the event loop.

```javascript
async function run() {
  console.log('A');

  await Promise.resolve();

  console.log('B');
}

run();

console.log('C');
```

Output:

```shell
A
C
B
```

Here is the simple way to read it:

1. `run()` starts immediately.
2. `A` logs.
3. `await` pauses the rest of `run()`.
4. `C` logs because the outer script keeps going.
5. The continuation after `await` runs as a microtask.
6. `B` logs.

You can think of this:

```javascript
await something;
console.log('B');
```

as being similar to:

```javascript
Promise.resolve(something).then(() => {
  console.log('B');
});
```

Not exactly the same in every detail, but close enough for the mental model.

## Fetch And The Event Loop

Network requests are a nice example because they involve both the environment and promises.

```javascript
async function loadUser() {
  console.log('Before fetch');

  const response = await fetch('/api/user');
  const user = await response.json();

  console.log('User:', user.name);
}

loadUser();
console.log('After calling loadUser');
```

The order is:

1. `loadUser()` starts.
2. `Before fetch` logs.
3. `fetch` starts the network request in the browser.
4. `await` pauses `loadUser`.
5. `After calling loadUser` logs.
6. Later, when the response is ready, the promise settles.
7. The rest of `loadUser` continues in a microtask.

While the network is happening, JavaScript is not blocked. The browser can still handle clicks, render updates, and run other code.

But once your callback continues, that JavaScript still runs on the main thread.

## Practical Example: Loading State

This is where event loop knowledge becomes useful.

Imagine a button that fetches data:

```javascript
button.addEventListener('click', async () => {
  button.disabled = true;
  button.textContent = 'Loading...';

  const response = await fetch('/api/products');
  const products = await response.json();

  renderProducts(products);

  button.disabled = false;
  button.textContent = 'Load products';
});
```

This usually works nicely because `await fetch(...)` yields back to the browser. The browser has time to paint the loading state while the network request is in progress.

But compare that with CPU-heavy work:

```javascript
button.addEventListener('click', () => {
  button.disabled = true;
  button.textContent = 'Working...';

  calculateHugeReport();

  button.disabled = false;
  button.textContent = 'Run report';
});
```

Here, the browser may not paint `Working...` before `calculateHugeReport()` blocks the thread.

Same UI pattern. Different event loop behavior.

That is the practical lesson: `await` helps when you are waiting for asynchronous work. It does not help if your own JavaScript is hogging the thread.

## Practical Example: Debounce

Debounce is another event loop pattern you probably use all the time.

```javascript
function debounce(fn, delay) {
  let timeoutId;

  return (...args) => {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

const search = debounce((query) => {
  console.log('Searching for:', query);
}, 300);

search('j');
search('ja');
search('jav');
search('java');
```

Only the final call runs.

Each call clears the previous timer and schedules a new task. If the user keeps typing, the old task never gets its chance.

This is the event loop being useful: we are not manually tracking time in a loop. We let the environment wake us up later.

## Practical Example: Letting The DOM Update

Sometimes you want to wait until the browser has applied DOM changes.

For a quick "after the current work" callback, use a microtask:

```javascript
element.textContent = 'Saved';

queueMicrotask(() => {
  console.log('DOM text has been changed:', element.textContent);
});
```

But remember: microtasks run before rendering. If you want the browser to actually paint first, use a task or `requestAnimationFrame`.

```javascript
element.textContent = 'Saved';

requestAnimationFrame(() => {
  console.log('Browser is about to paint a frame');
});
```

Use the smallest tool that matches what you mean:

- Need to run after this synchronous code? `queueMicrotask`
- Need to run later and let rendering/events breathe? `setTimeout`
- Need to coordinate with visual updates? `requestAnimationFrame`

## Common Misconceptions

### "setTimeout(fn, 0) runs immediately"

Nope. It schedules a task. The current stack and microtasks run first.

```javascript
setTimeout(() => console.log('timeout'), 0);
Promise.resolve().then(() => console.log('promise'));
console.log('sync');
```

Output:

```shell
sync
promise
timeout
```

### "await blocks JavaScript"

`await` pauses the current async function, not the whole thread.

```javascript
async function run() {
  await Promise.resolve();
  console.log('after await');
}

run();
console.log('outside');
```

Output:

```shell
outside
after await
```

### "Promises make slow code fast"

Promises make async code easier to coordinate. They do not move CPU-heavy JavaScript off the main thread.

```javascript
Promise.resolve().then(() => {
  expensiveCalculation();
});
```

That calculation still blocks while it runs.

## Browser vs Node.js

The big idea is the same in browsers and Node.js: JavaScript runs on a call stack, async work queues callbacks, and the event loop decides what runs next.

But Node has its own details:

- `process.nextTick` has special priority in Node.
- `setImmediate` exists in Node, not browsers.
- File system and network operations go through Node's runtime.
- Event loop phases are more explicit in Node.

For most app-level JavaScript, this mental model is enough:

```text
synchronous code first
microtasks next
tasks later
```

If you are writing performance-sensitive Node internals, then yes, learn Node's event loop phases separately. For normal web app work, do not start there.

## A Good Debugging Habit

When async ordering gets confusing, label each line as one of these:

- **Sync:** runs right now
- **Microtask:** promise continuation, `queueMicrotask`
- **Task:** timer, click handler, message event
- **Render:** browser paint opportunity

Let's practice:

```javascript
console.log('1');

setTimeout(() => console.log('2'), 0);

queueMicrotask(() => console.log('3'));

Promise.resolve().then(() => {
  console.log('4');
  setTimeout(() => console.log('5'), 0);
});

console.log('6');
```

Output:

```shell
1
6
3
4
2
5
```

Why?

1. `1` and `6` are synchronous.
2. `3` and `4` are microtasks, so they run next.
3. `2` is the first timer task.
4. `5` was scheduled later, inside a microtask, so it runs after `2`.

No guessing. Just sort the work into buckets.

## What To Remember

The event loop sounds scarier than it is.

JavaScript runs one thing at a time. When async work is ready, its callback waits in a queue. The event loop waits for the call stack to clear, drains microtasks, gives the browser a chance to render, then runs the next task.

The practical rules:

1. Synchronous code always runs first.
2. Promise callbacks and `await` continuations are microtasks.
3. Timers and events are tasks.
4. Microtasks run before the next task.
5. Long-running JavaScript blocks everything on that thread.

Once you see those rules, async JavaScript starts feeling less random. The logs make sense. Loading states make sense. UI freezes make sense.

And when something still feels weird, just ask: "Is this sync code, a microtask, or a task?"
