# Writing Style Guide for Ray's Blog

This document captures Ray's writing tone and style based on analysis of published blog posts. Reference this when creating or editing content.

## Overall Tone

**Conversational & Friendly** - Write like you're explaining something to a friend over coffee, not lecturing to an audience. The goal is to make complex technical concepts feel approachable and less intimidating.

## Key Characteristics

### 1. Relatable Openings
- Start with questions readers have likely asked themselves
- Use shared experiences as hooks ("Have you ever...", "Do you ever...")
- Make readers feel seen and understood before diving into technical content

**Examples:**
- "Have you ever come across the term `closure`? Or maybe even been asked about it during an interview?"
- "Do you ever use TanStack Query and think, 'Wow, this library is so cool...'"

### 2. Honest & Humble
- Acknowledge when things are confusing or complex
- Use self-deprecating humor, especially in titles
- Show vulnerability about learning journey

**Examples:**
- "Finally Understand Closures (for Real This Time (Hopefully))"
- "Building a Poor Man's React Query"
- "Don't worry though, we'll keep it practical"

### 3. Progressive Complexity
- Start simple, build to complex
- Always define concepts before using them
- Use the "what, how, why" structure
- Break down intimidating topics into digestible pieces

**Structure pattern:**
1. Simple definition
2. Basic example
3. How it actually works (deeper dive)
4. Practical real-world applications

### 4. Casual Language Mixed with Technical Accuracy
- Use conversational phrases while maintaining technical correctness
- Don't be afraid of casual words like "stuff", "cool", "hang out"
- Make analogies and metaphors ("little worlds where your code lives")
- Use phrases like "Here's the thing", "Let's see", "Alright"

**Examples:**
- "All those variables? Gone. Garbage collected"
- "Finds `num = 123` sitting there waiting"
- "That's all a closure really is"

### 5. Direct Reader Address
- Use "you", "we", "let's" throughout
- Make it collaborative, not instructional
- Frame as a journey taken together

**Prefer:**
- "Let's take a closer look"
- "You might have a rough idea"
- "We'll keep it practical"

**Avoid:**
- "One should understand..."
- "It is important to note..."
- Passive, academic voice

### 6. Visual Learning
- Include code examples for every concept
- Use ASCII diagrams or visual representations when helpful
- Show output/results of code examples
- Use comments in code to explain what's happening

### 7. Practical Focus
- Always include "real-world" or "practical examples" section
- Show where concepts are actually used
- Don't just explain theory - demonstrate application
- Multiple varied examples that readers will recognize

### 8. Clear Structure
- Use descriptive headings and subheadings
- Create logical flow: concept → mechanism → application
- Include a "Wrapping Up" or conclusion that ties it together
- Set expectations upfront ("To keep this post short, we will only cover...")

**For step-by-step tutorials:**
- Number the steps clearly (Step 1, Step 2, etc.)
- Keep step titles short and punchy (3-5 words max)
- Each step should build logically on the previous one
- Use descriptive subsection names that convey meaning ("The Fast Path", "The Smart Path", "The Slow Path")

**Examples of good step titles:**
- ✓ "Step 1: Setting Up the Foundation"
- ✓ "Step 2: Building the QueryClient"
- ✓ "Step 3: The Observable Pattern"
- ✗ "Step 2: Building the QueryClient - The Brain of Our Operation" (too long)
- ✗ "Step 3: Adding the Observable Pattern - Making Components React to Changes" (too long)

### 9. Encouraging & Empowering
- End with confidence-building statements
- Acknowledge the reader's growth through the article
- Make complex topics feel conquerable

**Examples:**
- "Now go use/explain closures with confidence!"
- "Once you get that, everything else clicks into place"

### 10. Code Examples Standards
- Use TypeScript when relevant
- Include actual runnable examples
- Show output/results when helpful
- Add explanatory comments
- Use realistic variable names and scenarios

### 11. Design Pattern Connections
- Weave design patterns naturally into explanations, not as separate callouts
- Use bold formatting for pattern names (**Observer Pattern**, **Singleton Pattern**)
- Explain patterns in the context of what you're building
- Connect to real-world examples of where the pattern appears
- Keep it conversational - patterns should enhance understanding, not interrupt flow

**Good examples (natural flow):**
- "You typically create one QueryClient instance for your entire app and share it everywhere (the **Singleton pattern**)."
- "We're basically adapting our QueryClient (which knows nothing about React) to work seamlessly with React's rendering model. `useSyncExternalStore` is the bridge - the **Adapter pattern** in action."
- "This pattern shows up everywhere in UI frameworks - it's literally how React itself works under the hood!"

**Avoid (too formal/forced):**
- ❌ "**Design Pattern Connection:** This is the **Observer Pattern** in action..."
- ❌ Having a separate section just for pattern explanations
- ❌ Interrupting the narrative with pattern callouts

### 12. Progressive Disclosure
- Show the full code block first, then break down key parts
- Use numbered subsections to explain complex logic (1., 2., 3.)
- Pull out specific code snippets to focus on after showing the whole
- Add descriptive labels to code sections ("The Fast Path", "The Smart Path")

**Structure:**
```typescript
// Full code block here
[Large implementation]
```

Let's break down what's happening here:

**1. [First Concept] (Descriptive Label)**
```typescript
// Extract of relevant code
```
[Explanation]

**2. [Second Concept] (Descriptive Label)**
```typescript
// Extract of relevant code
```
[Explanation]

### 13. Metaphors & Analogies
- Use everyday analogies to explain technical concepts
- Keep them simple and relatable
- Place them after technical explanations for reinforcement

**Examples:**
- "Think of it like subscribing to a newsletter. You sign up (subscribe), get updates when new content arrives (notify), and can unsubscribe anytime you want."
- "Think of these as little worlds where your code lives."

### 14. Visual Aids
- Use ASCII flow diagrams for complex logic flows
- Keep diagrams simple and clear
- Use emojis sparingly for visual markers (✅ ⏳ 🚀)
- Always explain the diagram in text as well

**Example structure:**
```
Component calls function
       |
       v
   Decision point?
    /        \
  Yes        No
   |          |
   v          v
Path A     Path B
```

### 15. Managing Expectations
- Include "What We've Built" section to celebrate accomplishments
- Include "What's Missing" section to acknowledge limitations
- Be honest about scope: "To keep this post short, we will only cover..."
- Use checkmarks (✅) in "What We've Built" lists
- Format "What's Missing" with bold labels for clarity

**Example:**
```markdown
## What We've Built

- **Feature 1**: Description of what was accomplished
- **Feature 2**: Description of what was accomplished

## What's Missing (Compared to the Real Thing)

- **Feature X**: What the real library does differently
- **Feature Y**: Advanced feature not covered
```

### 16. Numbered Behavioral Lists
- Use numbered lists with bold headings to explain behavior step-by-step
- Keep each item concise (one line if possible)
- Use present tense for active processes

**Example:**
Here's what happens when you run this:

1. **First mount**: Component fetches data, shows loading state, then shows the result
2. **Add more components**: They all share the same cached data instantly (cache hit!)
3. **After 10 seconds**: Data becomes stale, next component mount triggers a new fetch

### 17. Connecting to Broader Patterns
- In conclusion, connect specific concepts to broader software patterns
- Show where else readers will encounter these ideas
- Name-drop related technologies/libraries to create mental connections

**Example:**
"The Observer pattern shows up everywhere (Redux, MobX, RxJS). The caching strategy is used in databases, CDNs, and browsers."

## Formatting Conventions

### Bullet Lists
- Use **bold** for key terms or labels at the start of list items
- Keep items concise but complete
- Use colons after bold labels: "**Term**: Description here"
- For feature lists, use format: "**Feature Name** - Brief description"

### Code Formatting
- Use inline code for variable names, function names, and technical terms
- Use code blocks with language tags (```typescript, ```tsx)
- Add `title` attribute to code blocks when showing file names
- Break long lines in code examples for readability

### Emphasis
- Use **bold** for: pattern names, key concepts, important terms
- Use *italics* sparingly, prefer bold
- Use `code formatting` for: technical terms, variable names, function names
- Use "quotes" for: user thoughts, hypothetical statements

### Emojis
- Use sparingly in console log examples (✅ ⏳ 🚀 ✨ ❌ 🔄)
- Use checkmarks (✅) in "What We've Built" lists
- Avoid in body text unless it adds clear value
- Never overuse - one per line maximum

## What to Avoid

- Overly formal or academic language
- Assuming too much prior knowledge without explanation
- Jumping to complex examples without building up
- Being condescending or making readers feel dumb
- Long paragraphs without breaks
- Theory without practical application
- Jargon without explanation
- Step titles that are too long (keep under 5 words)
- Design pattern callouts that interrupt flow (weave them in naturally instead)
- Forgetting to manage expectations (scope, limitations)
- Formal "Design Pattern Connection:" labels (integrate patterns into narrative)

## Title Style

- Conversational and relatable
- Often includes self-deprecating humor or honesty
- Can include parenthetical asides
- Should make the topic feel approachable

**Examples:**
- ✓ "Finally Understand Closures (for Real This Time (Hopefully))"
- ✓ "Building a Poor Man's React Query from Scratch"
- ✗ "A Comprehensive Guide to JavaScript Closures"
- ✗ "Advanced Closure Patterns in Modern JavaScript"

## Article Structure Templates

### Template A: Concept Explanation (e.g., Closures post)

```markdown
---
title: '[Conversational, honest title]'
published: YYYY-MM-DD
draft: false/true
tags: ['relevant', 'tags']
---

[Opening hook - relatable question or scenario]

## The Definition

[Clear, simple definition, often with a quote from authoritative source]
[Follow with simpler explanation in your own words]

## How It Works

[Deeper dive into mechanisms]
[Progressive complexity]
[Visual aids/diagrams if helpful]

## Practical Example of [Topic] in Real Apps

[Multiple real-world examples]
[Code with explanations]
[Different use cases]

## Wrapping Up

[Friendly summary]
[Confidence-building conclusion]
```

### Template B: Building/Implementation Tutorial (e.g., React Query post)

```markdown
---
title: 'Building a [Poor Man's/Simple] [Thing] from Scratch'
published: YYYY-MM-DD
draft: false/true
tags: ['relevant', 'tags']
---

[Opening hook - "Do you ever use X and think..."]

## What is [Topic]?

[Brief explanation of the library/concept being recreated]
[Show example of how the real thing works]

To keep this post short, we will only cover the core functionality:

1. [Feature 1]
2. [Feature 2]
3. [Feature 3]

Alright, let's roll up our sleeves and build this thing step by step!

## Step 1: [Foundation/Setup]

[Explain the basic building blocks]
[Code example]
[Bullet point explanation of key parts]
[Naturally weave in pattern name if applicable]

## Step 2: [Next Component]

[Progressive build on previous step]
[Code example]
[Explanation that naturally includes pattern reference]

## Step 3-N: [Continue building...]

[Each step adds complexity]
[Weave design patterns into narrative naturally]
[Use progressive disclosure for complex code]

## Step N: Putting It All Together

[Complete working example]
[Numbered list of behavior]
[Screenshots if applicable]

## What We've Built

[Bulleted list with bold labels and descriptions]

## What's Missing (Compared to the Real Thing)

[Honest acknowledgment of limitations]
[Bulleted list with bold labels]

## Wrapping Up

[Summary of what was learned]
[Connect to broader patterns and other technologies]
[Empowering call to action]
```

## Voice & Personality

- Enthusiastic but not over-the-top
- Knowledgeable but humble
- Patient teacher, not expert lecturer
- Honest about complexity
- Excited to share knowledge
- Warm and welcoming

## Target Audience

- Developers who know the basics but want deeper understanding
- People who've encountered concepts but never fully grasped them
- Self-taught or learning developers
- Anyone who's felt intimidated by technical topics

## Remember

The goal is to make readers feel:
1. **Seen** - "They get my confusion"
2. **Capable** - "I can understand this"
3. **Confident** - "Now I really get it"
4. **Empowered** - "I can explain this to others"

Write to teach and empower, not to impress or show off knowledge.

---

## Quick Reference Checklist

When writing a new post, ensure you:

- [ ] Start with a relatable question or scenario
- [ ] Set scope/expectations early if complex topic
- [ ] Use conversational language throughout
- [ ] Include code examples with explanations
- [ ] Break down complex code with progressive disclosure
- [ ] Weave design patterns naturally into narrative (not as callouts)
- [ ] Use visual aids (ASCII diagrams) for complex flows
- [ ] Include "What We've Built" / "What's Missing" sections (for tutorials)
- [ ] Use numbered lists for behavioral explanations
- [ ] Add metaphors/analogies for complex concepts
- [ ] Connect to broader patterns in conclusion
- [ ] End with empowering, confidence-building statement
- [ ] Keep step titles short (under 5 words)
- [ ] Use bold formatting for emphasis in lists
- [ ] Proofread for casual but technically accurate tone
