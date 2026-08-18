---
id: phase0-week1-day1
phase: 0
week: 1
day: 1
title: "Computational Thinking & Engineering Foundations"
subtitle: "From source text to a running process — before Rust exists in the picture"
difficulty: 1
estimated_time: "90 min"
learning_objectives:
  - "Trace a C-like program's memory by hand, correctly classifying every variable by region and lifetime"
  - "Explain the five-stage compilation pipeline unprompted"
  - "Explain WHY Rust's ownership model exists, using this chapter's vocabulary"
prerequisites: []
tags: ["memory", "compilation", "foundations", "unix"]
widgets: []
reading:
  - title: "Computer Systems: A Programmer's Perspective, Ch.1 & 3.1–3.3"
  - title: "The Rust Book, Ch.1 (Getting Started)"
next: "phase0-week1-day2"
previous: null
published: true
---

## Opening Story

:::story
When you write a tiny C-like program and compile it, nothing about
"functions" or "variables" exists once it actually runs. Those are
conveniences for *you*, the human. The toolchain performs a sequence of
lossy translations — source text becomes bytes, bytes become instructions
the CPU executes and data the CPU reads and writes. There is no magic
step where code becomes something other than bytes in memory.
:::

## Why This Chapter Exists

Before touching Rust syntax at all, this phase builds the vocabulary
every later chapter leans on: memory regions, the compilation pipeline,
and the habit of asking *where does this live, who owns it, when does it
go away* — the exact habit Rust's borrow checker will later force on you,
except here the compiler won't stop you if you get it wrong.

:::mental-model[Memory is organized address space]
Every running process sees a private, structured view of memory: a
**stack** that grows and shrinks with function calls, a **heap** for data
whose lifetime outlives a single function call, and **static regions**
for constants and code itself. Every later Rust concept — ownership,
borrowing, `Box`, lifetimes — is a set of compile-time rules layered on
top of this physical reality.
:::

## From Source Text to a Running Process

```
source.c → preprocessed → AST → assembly (.s) → object file (.o) → executable → running process
```

Rust's `cargo build` runs this exact pipeline under the hood via `rustc`,
which itself uses LLVM as its optimizing back-end.

:::compiler-thinking[Where does `x` live?]
**Prediction:** In a function `square(x)` returning `x * x`, where does
`x` live — stack or heap?

**Answer:** Stack. It's a fixed-size, function-local value. When
`square` returns, the stack frame is popped; that memory is immediately
available for reuse — `x` doesn't "exist" anymore in any meaningful
sense, even though the bytes may still be sitting there.
:::

:::engineering-note[Decision Journal prompt]
Why does Rust's existence make sense given what you now know about heap
allocation and pointers? Answer using the vocabulary of this chapter,
not marketing language.
:::

:::worked-example[Minimal environment check]
```bash
cargo new hello_reec
cd hello_reec
cargo run
```

This should print `Hello, world!`. If it does, and the directory is a
clean Git repository with one initial commit, Lab 0.1's Definition of
Done is satisfied.
:::

:::historical-context[Why C is the warm-up language]
C has no ownership system at all — the programmer is trusted to call
`free()` at exactly the right moment. Starting here, in a language where
the compiler *won't* stop you if you get memory wrong, is deliberate:
you'll feel the absence of safety before you get the safety in Phase 1,
which makes you value it correctly rather than treating it as
bureaucratic friction.
:::

:::mini-challenge[Classify these variables]
For the following program, classify every variable by memory region
(stack vs. data/BSS) and lifetime:

```c
int global_counter = 0;

int increment(int n) {
    int doubled = n * 2;
    global_counter = global_counter + 1;
    return doubled;
}
```
:::

:::reflection[Before you continue]
Describe, in your own words, what a linker error tells you versus what
a compiler (front-end) error tells you, using the pipeline diagram
above.
:::

## Production Reading

:::production-note[ripgrep's shape]
Skim (not deeply study yet) the source of `ripgrep`
(github.com/BurntSushi/ripgrep). Open `Cargo.toml` and identify the
crate's dependencies, and open the top-level `src/main.rs` to observe
how a real Rust project's entry point is structured — just get
comfortable with the *shape* of a real Rust codebase before Phase 1
asks you to write one from scratch.
:::
