---
title: 'Finally Understand Closures (for Real This Time (Hopefully))'
published: 2025-10-26
draft: false
tags: ['javascript', 'typescript', 'fundamental']
---

Have you ever come across the term `closure`? Or maybe even been asked about it during an interview? You might have a rough idea of what it means, but not a deep understanding. In this post, we’ll take a closer look at what closures really are and explore several practical examples of how they’re used in real-world applications.

## The Definition

Based on [MDN Docs](http://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures):

> A closure is the combination of a function bundled together (enclosed) with references to its surrounding state (the lexical environment). In other words, a closure gives a function access to its outer scope. In JavaScript, closures are created every time a function is created, at function creation time.

The simple way to think about it: whenever a function uses a variable that isn’t defined inside it or passed as a parameter, that’s a closure in action. The function basically “remembers” the variables from the place it was born, even after that execution context no longer exists.

The simplest example of closure would be like this:

```typescript
function outside() {
  const num = 123; // local scope variable

  return function inner() {
    console.log(num); // accessing outer scope variable
  };
}

const printNum = outside(); // outside() finishes executing
printNum(); // output: 123 - but num is still "remembered"!
```

In this example, the variable num is defined inside the local scope of outside().
Then we return the inner() function, which references that outer variable. When we call outside(), it returns the inner function and assigns it to printNum.
Even though outside() has already finished executing, the returned function still “remembers” the value of num thanks to closure.

## How It Works

Alright, let's get into the details. To really understand closures, we need to see what's actually happening inside the JavaScript engine. Don't worry though, we'll keep it practical.

### Execution Contexts and Scope Chains

When your JavaScript code runs, the engine creates **execution contexts**. Think of these as little worlds where your code lives. Every time you call a function, a new execution context is created. Each one has:

1. **Variable Environment** - where your variables and functions hang out
2. **Lexical Environment** - basically keeps track of what variables you can access
3. **Scope Chain** - the lookup path to find variables in outer scopes

Let's go back to our simple example and see what actually happens:

```typescript
function outside() {
  const num = 123;
  return function inner() {
    console.log(num);
  };
}

const printNum = outside();
printNum();
```

Here's what's going on behind the scenes:

```
Global Context
│
├─ printNum = <function inner>
│
└─ outside() Context (stays alive!)
   │
   ├─ num = 123
   └─ inner() ──┐
                │
                └─> [[Environment]] reference
                    (points back to outside's context)

When printNum() runs:
│
└─ looks for 'num'
   └─> not found locally
       └─> follows [[Environment]] reference
           └─> finds num = 123 in outside's context ✓
```

**Step 1: `outside()` gets called**

- JavaScript creates a new execution context for `outside()`
- The variable `num` lives in this context's environment
- When `inner` is created, here's the key part: it **captures a reference** to `outside()`'s environment
- That reference? That's your closure right there

**Step 2: `outside()` finishes and returns**

- Normally when a function finishes, its execution context gets destroyed
- All those variables? Gone. Garbage collected
- But wait, `inner` is still holding onto a reference to `outside()`'s environment
- So JavaScript keeps that environment alive in memory instead of throwing it away

**Step 3: `printNum()` runs**

- New execution context gets created for `inner` (which we're calling as `printNum`)
- It tries to find `num`, not in the local scope
- JavaScript follows the scope chain to the captured environment
- Finds `num = 123` sitting there waiting
- Logs it out like nothing ever happened

### The [[Environment]] Hidden Property

Here's something cool: every function in JavaScript has a secret internal property called `[[Environment]]` (sometimes you'll see it as `[[Scope]]`). This thing:

- Gets set when the function is **created** (not when you call it)
- Points back to where the function was born
- Sticks around for as long as the function exists
- Gets used to look up variables that aren't in the function's local scope

So when we say closures "remember" stuff - they literally do. They carry around a reference to their birthplace.

### Memory Stuff You Should Know

Because closures keep environments alive, there's a memory trade-off:

```typescript
function createCounter() {
  let count = 0;
  const history = []; // imagine this is huge

  return function increment() {
    count++;
    return count;
  };
}

const counter = createCounter();
// 'history' is just sitting there in memory
// even though we never touch it in increment()
```

The whole environment gets preserved, not just the variables you actually use. Modern JavaScript engines are smart about this and do some optimization, but it's worth keeping in mind if you're working with large datasets.

### Why Does JavaScript Even Do This?

JavaScript has closures because of **lexical scoping**. Basically, where you write a function in your code determines what variables it can see, not where you call it from.

Closures happen naturally because JavaScript has:

1. First-class functions (you can pass functions around like any other value)
2. Lexical scoping (scope is determined by where code is written)
3. Functions that can reach into outer scopes

Put these together, and you get closures. When you pass a function somewhere else or return it, it needs to bring its scope along for the ride. That's all a closure really is.

## Practical Example of Closures in Real Apps

Closures aren’t just a tricky interview question, they’re a core part of how modern JavaScript works. You may already use them all the time without realizing it. Let’s see various examples of where closure is used.

### Logger

Closure makes it easy to create a logger for each context, making it easy to track the flow of your application. It saves the context reference between calls.

```typescript
function createLogger(context: string) {
  function log(message: string) {
    const now = new Date().toISOString();
    console.log(`[${now}] [${context}] ${message}`);
  }

  return log;
}

const wsLogger = createLogger('WebSocket');
const dbLogger = createLogger('Database');

wsLogger('Subscribed');
dbLogger(`Query successful, takes ${10}ms`);
```

```shell title="output"
[2025-10-26T05:44:42.437Z] [WebSocket] Subscribed
[2025-10-26T05:44:42.437Z] [Database] Query successful, takes 10ms
```

### Debounce

Closure helps us to create a function that will only run once after a certain amount of time has passed since the last call. It saves the timeoutId reference between calls, so it "remembers" when is the last time the function was called.

```typescript
function debounce(func: Function, delay: number) {
  let timeoutId: NodeJS.Timeout | null = null;

  return function (...args: any[]) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

const debouncedSearch = debounce((query: string) => {
  console.log('Searching for', query);
}, 500);

debouncedSearch('a');
debouncedSearch('ap');
debouncedSearch('app');
debouncedSearch('appl');
debouncedSearch('apple'); // only runs once, after 500ms
```

```shell title="output"
Searching for apple
```

### Caching/Memoization

Closures fit naturally for caching previously computed results, as it allows us to save the result of a function call and reuse it later without recomputing it.

```typescript
function memoized(fn: Function) {
  const cache = new Map(); // beware of memory leaks, read the Memory section above

  return function (...args: any[]) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      const val = cache.get(key);
      console.log(`Cache hit for ${key}: ${val}`);
      return val;
    }

    const result = fn(...args);
    cache.set(key, result);
    console.log(`Cache miss for ${key}: ${result}`);
    return result;
  };
}

const memoizedAdd = memoized((a: number, b: number) => a + b);

memoizedAdd(1, 2);
memoizedAdd(3, 4);
memoizedAdd(1, 2);
memoizedAdd(3, 4);
memoizedAdd(3, 4);
```

```shell title="output"
Cache miss for [1,2]: 3
Cache miss for [3,4]: 7
Cache hit for [1,2]: 3
Cache hit for [3,4]: 7
Cache hit for [3,4]: 7
```

## Wrapping Up

And there you have it, closures explained! They might seem like this abstract concept that only comes up in interviews, but as we've seen, they're everywhere in real JavaScript code. From loggers to debounce functions to memoization, closures are quietly doing the heavy lifting in patterns you probably use every day. The key takeaway? A closure is just a function that remembers where it came from. Once you get that, everything else clicks into place. Now go use/explain closures with confidence!
