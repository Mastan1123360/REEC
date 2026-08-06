---
id: phase1-week3-day1
phase: 1
week: 3
day: 1
title: "Ownership & Move Semantics"
subtitle: "Every value has exactly one owner"
difficulty: 2
estimated_time: "70 min"
learning_objectives:
  - "Predict, before compiling, whether a borrow-checker error will occur"
  - "Explain move semantics in ownership terms, not just 'the compiler said so'"
prerequisites: ["phase0-week1-day1"]
tags: ["ownership", "rust", "move-semantics"]
project:
  id: "calculator-cli"
  name: "Calculator CLI"
  difficulty: 1
  major: false
failure_lab:
  id: "failure-lab-1"
  name: "The Borrow Checker Fights Back"
  path: "phase1-failure-lab-1"
reading:
  - title: "The Rust Book, Ch.4 (Ownership)"
next: null
previous: "phase0-week1-day1"
published: true
---

## Opening Story

:::story
A learner writes a function that takes ownership of a `Vec<String>`,
consumes it in a loop, and returns the longest string. Back in `main`,
they try to print the original vector again — and the compiler rejects
it: `error[E0382]: borrow of moved value`. A learner coming from Python
or JavaScript reads this as an arbitrary restriction. By the end of this
lesson, that reaction becomes: "of course — the function took ownership
and consumed it in the loop, so `main` no longer has anything valid to
print."
:::

:::mental-model[Ownership]
**"Every value has exactly one owner, and when the owner goes out of
scope, the value is dropped."**

This single sentence is Rust's answer to the heap-bookkeeping problem.
Garbage collectors answer it by periodically scanning for unreachable
memory at runtime. C/C++ answer it by trusting the programmer to call
`free()` at exactly the right moment. Rust's answer: the compiler
tracks, statically, exactly one variable responsible for each value.
:::

## Move Semantics

```rust
let a = String::from("hello");
let b = a;
// `a` is no longer valid here — ownership MOVED to `b`
```

:::compiler-thinking[Will this compile?]
```rust
let a = String::from("hello");
let b = a;
println!("{}", a);
```

**Ownership:** moves from `a` to `b` on line 2 — that's the whole
answer. **Answer: no**, with error E0382, "borrow of moved value."
:::

:::mini-challenge[Fix the Opening Story]
Rewrite `longest_task_name` so it borrows the `Vec<String>` instead of
consuming it, and explain what changes about its return type as a
result.
:::

:::project[Calculator CLI]
Accept two numbers and an operator from command-line args or stdin;
print the result. `std` only — no external crates. This is a warm-up
project: its value is proving Definition of Done discipline early, when
the code is simple enough that the discipline is the point.
:::

:::reading[Required this week]
- The Rust Book, Chapter 4 (Ownership)
- Niko Matsakis, "Non-Lexical Lifetimes" blog post
:::

:::reflection[Before you continue]
Where did you reach for `.clone()` out of uncertainty rather than a
deliberate tradeoff? Pick one specific instance and explain what the
alternative would have required.
:::
