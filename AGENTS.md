# AGENTS.md

Writing guide for Ray's blog. Use this when creating or editing posts.

## Voice

- Write like explaining to a friend over coffee: warm, clear, practical.
- Be honest when a topic is confusing. Make readers feel seen, not judged.
- Use "you", "we", and "let's". Avoid academic/passive phrasing.
- Casual language is fine: "stuff", "here's the thing", "alright", "hang out".
- Keep technical claims accurate. Simple should not mean hand-wavy.

## Article Shape

For concept deep dives:

1. Relatable hook: a question or situation readers recognize.
2. Simple definition.
3. Tiny runnable example.
4. What actually happens under the hood.
5. Practical examples readers will see in real apps.
6. Short wrap-up that makes the concept feel usable.

For build/tutorial posts:

1. Show the goal and scope early.
2. Build step by step, from simple to useful.
3. Show full code before breaking down tricky parts.
4. Explain behavior with numbered lists.
5. End with "What We've Built" and "What's Missing" when useful.

## Style Rules

- Start simple, then add depth.
- Define concepts before using jargon.
- Prefer short sections with descriptive headings.
- Use code examples for every important idea.
- Show output when it helps.
- Use ASCII diagrams for tricky flow.
- Use analogies, but keep them short and everyday.
- Weave design patterns into the explanation naturally. Do not add formal "Design Pattern Connection" callouts.
- Use bold for key terms and list labels.
- Use inline `code` for APIs, variables, functions, and technical terms.
- Use fenced code blocks with language tags.
- Step titles should be short, ideally under 5 words.

## Tone Examples

Good:

- "Have you ever come across the term `closure` and felt like you almost understood it?"
- "Don't worry though, we'll keep it practical."
- "Think of it as a tiny world where your variables live."
- "That's all a closure really is."

Avoid:

- "One should understand..."
- "It is important to note..."
- Long theory before examples.
- Jargon without explanation.
- Condescending jokes about beginners.

## Code Examples

- Use TypeScript/JavaScript when relevant.
- Keep examples runnable.
- Use realistic names and small scenarios.
- Add comments only where they clarify behavior.
- After large code blocks, pull out the important snippets and explain them.

## Titles

Prefer approachable, honest titles:

- "Finally Understand Closures (for Real This Time (Hopefully))"
- "Building a Poor Man's React Query from Scratch"
- "JavaScript's Event Loop, Without the Headache"

Avoid dry titles:

- "A Comprehensive Guide to JavaScript Closures"
- "Advanced Closure Patterns in Modern JavaScript"

## Checklist

- [ ] Relatable opening
- [ ] Clear scope
- [ ] Simple definition
- [ ] Runnable examples
- [ ] Under-the-hood explanation
- [ ] Practical real-world section
- [ ] Diagrams where flow is hard to see
- [ ] Casual but accurate tone
- [ ] Short, confidence-building wrap-up
