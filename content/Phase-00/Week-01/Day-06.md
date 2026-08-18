---
id: P0-W1-D6
phase: 0
week: 1
day: 6
title: 'Engineering Review: Consolidating the Week''s Foundations'
subtitle: 'Self-assessment, documentation, and preparing for Phase 1'
estimated_time: 60
difficulty: Beginner
learning_objectives:
  - Review and consolidate all concepts from Week 1
  - Complete the documentation deliverables for Phase 0
  - Finalise the Engineering Environment Repository
  - Self-assess understanding against the week's learning objectives
  - Reflect on the transition from systems thinking to Rust programming
widgets:
  - story
  - mental-model
  - worked-example
  - engineering-note
  - compiler-thinking
  - mini-challenge
  - reflection
project: null
failure_lab: null
reading:
  - REEC-01-Phase0-Foundations.md (review Sections 0.11–0.15)
  - REEC-04-EngineeringStandardsAppendix.md (review)
tags:
  - review
  - documentation
  - engineering-environment
  - self-assessment
  - phase-0-completion
next: P0-W2-D1
previous: P0-W1-D5
published: true
---

:::story

## The Week That Changed Everything

It is the end of Week 1. Five days ago, you had never drawn a stack diagram. You had never traced a program's execution by hand. You had never thought about what the CPU actually does when it runs your code.

Now you have traced stack frames, predicted compiler behaviour, diagnosed broken mental models, and built a complete engineering environment. You have learned that a program is data before it is behaviour, that memory is organised address space, that the Unix toolchain is a set of composable programs, that Git is a time machine for the engineering process, and that Rust's ownership rules exist because pointers are just numbers.

But the real change is not in what you know. It is in how you think.

When you read code now, you see more than text. You see the stack, the heap, the registers, the instruction pointer. You see the compilation pipeline and the linker errors. You see the Git history that should have been written. You see the system.

This is the transition from "programming" to "engineering." Programming is knowing how to write code. Engineering is knowing why the code matters, what it costs, and how to keep it correct as it grows.

Today, you consolidate that transition.

:::

:::mental-model

Before we dive into the review, internalise these three mental models. They tie the week's lessons together into a coherent framework for Phase 1.

**Mental Model 1 — The engineering process is not linear.**

You do not: learn theory, then practice, then build. You learn, practice, break, repair, and learn again. Each day of this week has built on the previous, but not in a straight line. Day 4's Failure Lab broke Day 1's assumptions. Day 5's manual trace clarified Day 3's CPU model. The process is iterative, and each iteration deepens understanding.

This is how engineering actually works. You do not get everything right the first time. You learn by doing, by failing, and by understanding why you failed. The skills you have built this week are not endpoints—they are foundations for future iteration.

**Mental Model 2 — Documentation is the memory of the engineering process.**

A codebase without documentation is a codebase that has forgotten its own history. Documentation is not a burden; it is a form of engineering discipline. When you write a README, you are not just explaining what the code does. You are forcing yourself to understand the code well enough to explain it.

This is why Phase 0 requires documentation deliverables. The act of writing is itself a learning tool. You cannot write clear documentation about something you do not understand. The process of writing reveals the gaps in your understanding.

**Mental Model 3 — The transition to Phase 1 is not a transition to a different subject.**

Phase 1 is called "Rust Foundations." But it is not a new subject. It is the same subject—systems engineering—now taught in Rust. The memory model you have traced by hand is the exact model Rust's ownership rules enforce. The stack diagrams you have drawn are the exact diagrams the borrow checker uses. The manual tracing you have practiced is the exact reasoning you will need to debug Rust code.

Phase 1 does not replace Phase 0. Phase 1 builds on it.

:::

## Theory

### Review: The Week in Retrospect

Let's review the week's learning and see how each day connects to the others.

#### Day 1: The Compilation Pipeline and Memory Layout

**Key concepts:**
- The six-stage compilation pipeline
- Process memory: stack, heap, data, BSS, text
- The stack is fast but bounded; the heap requires bookkeeping
- A pointer is just a number—undefined behaviour is the result of invalid pointer arithmetic

**Connection to later days:**
- The stack diagrams in Day 5 are direct applications of the memory layout from Day 1.
- The CPU model in Day 3 explains why undefined behaviour is undefined—the CPU will do whatever the bytes say.
- Git and Cargo (Day 2) operate at the file and dependency level, but they are built on the same memory model.

#### Day 2: The Unix Toolchain, Git, and the Engineer's Workspace

**Key concepts:**
- The Unix philosophy of small, composable tools
- Filesystem hierarchy, absolute vs. relative paths, PATH
- stdin, stdout, stderr, pipes, and redirection
- Git's mental model: working tree, staging area, commit, history
- Cargo's role as an orchestrator of the Rust toolchain

**Connection to later days:**
- Git is the tool that makes the engineering process visible. Without it, there is no history, only snapshots.
- The shell's composability mirrors the composability of functions in Rust—small, focused pieces that combine to do larger work.
- Cargo's orchestration model is the same pattern you will use to structure Rust projects.

#### Day 3: The Binary Interface—How CPUs Execute Instructions

**Key concepts:**
- The CPU is a simple sequential machine executing instructions
- Registers, addressing modes, and the instruction cycle
- Instructions are tradeoffs between generality and speed
- How high-level code maps to assembly

**Connection to later days:**
- The CPU model explains why performance matters—some instructions are slow, and the compiler cannot fix bad algorithm design.
- Understanding assembly helps you read compiler output and debug performance issues.
- The stack frame structure from Day 1 is exactly what the CPU uses when it executes function calls.

#### Day 4: Failure Lab 0—The Broken Mental Model

**Key concepts:**
- Distinguishing between scope and memory region
- The stack pointer moves, but bytes are not erased
- An unfreed pointer can still be unsafe to read
- Memory safety bugs come from multiple distinct mechanisms

**Connection to later days:**
- The Failure Lab tested the concepts from Days 1-3 in a practical, diagnostic format.
- The lesson about dangling pointers is directly relevant to Rust's borrow checker.
- The distinction between scope and memory region is fundamental to understanding why Rust's ownership rules exist.

#### Day 5: Manual Memory Trace—Stack Diagrams in Practice

**Key concepts:**
- Drawing complete stack diagrams for multi-function programs
- Tracing global state changes across function calls
- Classifying variables by region, lifetime, and ownership
- Connecting manual trace to Rust's ownership rules

**Connection to later days:**
- The manual trace is the foundation for understanding Rust's borrow checker.
- The ability to trace by hand is a superpower for debugging and reasoning.
- The stack diagrams you have drawn are exactly what the Rust compiler analyses.

### The Engineering Environment Repository

Throughout this week, you have been building an Engineering Environment Repository. Let's review what should be in it:

```
hello_reec/
├── README.md                      # What this repository is and how to use it
├── .gitignore                     # Configured for Rust (target/, etc.)
├── memory-trace.md                # Your manual memory trace from the worked examples
├── toolchain-notes.md             # Your personal Unix command reference
├── failure-lab-0.md               # Your corrected claims from Failure Lab 0
├── engineering-review-0.md        # Your answers to the Engineering Review questions
├── reflection-day1.md             # Your reflection from Day 1
├── reflection-day2.md             # Your reflection from Day 2
├── reflection-day3.md             # Your reflection from Day 3
├── reflection-day5.md             # Your reflection from Day 5
└── reflection-day6.md             # Your reflection from today
```

**Each file should be committed with a meaningful commit message.** This is not just busywork. This is the first repository you will use to demonstrate your engineering discipline. A clean, well-documented repository tells a reviewer that you understand version control, documentation, and professional standards.

:::engineering-note

**Why commit messages matter in a learning repository.**

You might think: "This is just a learning project. No one will read these commit messages."

You are wrong on two counts:

1. **You will read them.** Six months from now, when you are deep in Phase 5, you will look back at Phase 0 and remember what you learned. A history of meaningful commits makes that memory vivid. "fix: update README" tells you nothing. "docs: add memory-trace diagram with complete stack frames" tells you exactly what you did.

2. **Your portfolio is a story.** When you share this repository with a hiring manager or a collaborator, the commit history is part of the story. It shows that you have discipline, that you understand version control, that you care about quality.

Commit messages are not just for the code. They are for the story of the code.

:::

---

:::worked-example

## Self-Assessment: Week 1 Concepts

Let's review the learning objectives from the week and assess your understanding.

### Day 1: Compilation Pipeline and Memory Layout

- [ ] Can you explain the six stages of the compilation pipeline without looking at the diagram?
- [ ] Can you name the five memory regions of a process and give one example of what lives in each?
- [ ] Can you explain why heap allocation requires bookkeeping?
- [ ] Can you explain why a pointer is "just a number" and what that means for memory safety?

**Self-assessment:** Rate your confidence 1-5 (1 = "I could teach this"; 5 = "I need to review this").

### Day 2: Unix Toolchain, Git, and Workspace

- [ ] Can you explain the Unix philosophy in your own words?
- [ ] Can you navigate the filesystem using absolute and relative paths?
- [ ] Can you explain why `$PATH` exists and how the shell uses it?
- [ ] Can you distinguish between stdin, stdout, and stderr and give an example of redirecting each?
- [ ] Can you explain Git's mental model (working tree, staging area, commit, history)?
- [ ] Can you write a commit message that explains *why* a change was made?
- [ ] Can you explain Cargo's role as an orchestrator, not a compiler?

**Self-assessment:** Rate your confidence 1-5.

### Day 3: The Binary Interface

- [ ] Can you explain what a register is and why it is faster than memory?
- [ ] Can you identify the key components of a CPU instruction (opcode, operands, addressing modes)?
- [ ] Can you read a simple assembly instruction and explain what it does?
- [ ] Can you explain why division is slower than addition?
- [ ] Can you explain how high-level code maps to CPU instructions?

**Self-assessment:** Rate your confidence 1-5.

### Day 5: Manual Memory Trace

- [ ] Can you draw a stack diagram for a multi-function program?
- [ ] Can you trace global state changes across function calls?
- [ ] Can you classify every variable by region, lifetime, and ownership?
- [ ] Can you identify the exact moment each variable comes into and goes out of scope?
- [ ] Can you connect the manual trace to Rust's ownership and borrowing rules?

**Self-assessment:** Rate your confidence 1-5.

### Overall Reflection

**What was the hardest concept this week?**

<details>
<summary>Common answer</summary>

Many learners find the distinction between *scope* and *memory region* the hardest concept. A variable's scope determines when it is valid to use. Its memory region determines where it lives. These are independent axes—a variable can be in scope but on the heap, or out of scope but still with bytes present. Understanding this distinction is key to understanding Rust's ownership model.
</details>

**What concept will be most useful in Phase 1?**

<details>
<summary>Common answer</summary>

The manual memory trace is the most directly useful skill for Phase 1. Rust's borrow checker is essentially a compiler-enforced manual trace. When you learn ownership and borrowing, you will be doing the same reasoning you practiced on Day 5, but with compiler assistance. The only difference is that Rust catches errors at compile time rather than at runtime.
</details>

**What would you do differently if you started the week again?**

<details>
<summary>Common answer</summary>

Most learners wish they had started the manual trace exercises earlier. The early days felt abstract, but the trace exercises made everything concrete. If you feel this way, you are not alone—the curriculum is designed to build slowly, then accelerate. The manual trace is the acceleration point.
</details>

---

### Engineering Review Questions

Answer these in writing, committed as `engineering-review-0.md`:

1. Why does Rust's existence make sense given what you now know about heap allocation and pointers? Answer using the vocabulary of this week, not marketing language.

2. What tradeoff does the stack's speed advantage come with? (i.e., what can the stack *not* do that the heap can?)

3. Describe, in your own words, what a linker error tells you versus what a compiler (front-end) error tells you, using the pipeline diagram from Day 1.

---

### Documentation Deliverables Checklist

Before continuing to Week 2, confirm that your repository contains:

- [ ] `README.md` describing what the repository is and how to run it (or note that it is a documentation repository)
- [ ] `memory-trace.md` (your trace from Day 5's worked example)
- [ ] `toolchain-notes.md` (your personal Unix command reference, written in your own words)
- [ ] `failure-lab-0.md` (your corrected claims and reflection from Failure Lab 0)
- [ ] `engineering-review-0.md` (your answers to the review questions above)
- [ ] `.gitignore` configured for Rust (target/, etc.)
- [ ] All files committed with meaningful commit messages

:::

:::compiler-thinking

**Prediction 1:**

Consider this code:

```rust
fn main() {
    let x = 5;
    let y = x;
    println!("{}", x); // This compiles in Rust
}
```

Why does this code compile, even though `x` appears to be "moved" to `y`? How does the manual trace from Day 5 explain this?

<details>
<summary>Answer</summary>

In Rust, types that implement the `Copy` trait are copied by default. `i32` implements `Copy`, so `x` is not moved to `y`; it is copied. The stack trace would show both `x` and `y` as separate stack slots, each holding the value 5.

Contrast this with `String`, which does not implement `Copy`. Moving a `String` would transfer ownership of the heap data. The manual trace from Day 5 shows why: `String` owns heap data, and there can only be one owner.
</details>

---

**Prediction 2:**

Given this code:

```rust
fn main() {
    let v = vec![1, 2, 3];
    let first = &v[0];
    v.push(4);
    println!("{}", first);
}
```

Why does the borrow checker reject this code? Draw the stack diagram that explains the problem.

<details>
<summary>Answer</summary>

```
┌───────────────────────────────────────────────────────┐
│ Stack:                                                │
│ ┌───────────────────────────────────────────────────┐ │
│ │  main frame                                       │ │
│ │    v: (ptr, len, cap)                             │ │
│ │    first: &i32 (borrow of v[0])                   │ │
│ │    (return address: _start)                       │ │
│ │    (saved RBP)                                    │ │
│ └───────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────┘

Heap (v's data before push):
[1, 2, 3]

Heap (v's data after push):
[1, 2, 3, 4] (reallocated, possibly at a new address)

first holds a pointer into the old heap memory. When v.push(4) reallocates, that memory is freed. first becomes a dangling pointer.
```

The borrow checker rejects this because `first` is an immutable borrow of `v` that lives across the `v.push(4)` call. The manual trace shows why: the reallocation could invalidate the pointer.
</details>

---

**Prediction 3:**

Why did Rust choose to make variables immutable by default? Connect this to the manual trace and the CPU model.

<details>
<summary>Answer</summary>

Immutability by default enforces a constraint: a variable cannot be changed after it is assigned. This simplifies reasoning about the program's state. In a manual trace, you never have to worry about a variable changing value unexpectedly—you know it is constant.

The CPU model also supports this. Immutability allows the compiler to make stronger optimisations. If a variable is immutable, the compiler can assume its value never changes, enabling constant propagation and other optimisations.
</details>

:::

:::mini-challenge

### Challenge 1 — Finalise Your Repository

Review your `hello_reec` repository. Ensure:

1. `cargo build` and `cargo run` still work (if you have a `hello_reec` binary).
2. All documentation files are present and committed.
3. All commit messages are meaningful.
4. The repository is clean (no stray files, no `target/` committed).

Run this command to verify:

```bash
$ git status
On branch main
nothing to commit, working tree clean
```

---

### Challenge 2 — Self-Assessment

Rate your confidence on each of the week's core concepts:

| Concept | Confidence (1-5) |
|---|---|
| Six-stage compilation pipeline | |
| Stack, heap, data, BSS, text regions | |
| Why heap allocation requires bookkeeping | |
| Unix philosophy and tool composition | |
| PATH, stdin, stdout, stderr | |
| Git's mental model | |
| Cargo's role as orchestrator | |
| CPU registers and instruction cycle | |
| Reading simple assembly | |
| Drawing stack diagrams | |
| Tracing global state changes | |
| Connecting trace to Rust's borrow checker | |

If any concept is below 3, review the relevant day's reading before continuing to Week 2.

---

### Challenge 3 — The Bridge to Phase 1

Write a short paragraph explaining how Week 1's concepts will be used in Phase 1's first project: the Calculator CLI. What from this week will matter most?

<details>
<summary>Answer Guidance</summary>

Phase 1's Calculator CLI will be a simple Rust program. The concepts from this week that matter most are:

- **Memory regions:** The Calculator CLI will use the stack for local variables and the heap for `String` inputs (via `String::new()` and the `parse` method). Understanding where data lives helps predict ownership and borrowing behaviour.

- **Manual trace:** The Calculator CLI will take input from stdin, parse it, and compute a result. Tracing the program by hand—where each value lives, who owns it, when it goes out of scope—is exactly the skill you will need to debug ownership errors.

- **Compiler pipeline:** When you run `cargo build` and encounter a compiler error, you will know exactly which stage of the pipeline produced it. A syntax error is a front-end error. A linker error is a Stage 5 error.

- **Engineering discipline:** You will use Git from the first commit. You will write meaningful commit messages. You will format your code with `rustfmt` and lint with `clippy`. The habits you built in Week 1 will carry forward.
</details>

:::

:::reflection

Write the answer to this question in a text file called `reflection-day6.md` in your `hello_reec` directory. Commit it.

**Question:**

"Looking back at the week, what is the single most important insight you gained about the relationship between high-level programming languages (like Rust) and the underlying hardware? How will this insight change the way you write code in Phase 1?"

<details>
<summary>Reflection Guidance</summary>

The most important insight is that high-level languages are not magic. They are layers of abstraction on top of a simple, physical machine. Rust's ownership rules are not arbitrary; they are compile-time enforcement of the exact discipline you have been tracing by hand.

This insight changes the way you write code because you stop thinking in terms of "what the language allows" and start thinking in terms of "what the machine requires." You write code with an awareness of where data lives, who owns it, and when it goes away. This awareness makes Rust's rules feel natural rather than restrictive.

The manual trace is the bridge between the abstract language and the concrete machine. It is the skill that makes you a systems engineer rather than just a programmer.
</details>

:::

## End of Day 6

### What You Have Accomplished

By the end of this session, you have:

- **Reviewed and consolidated all Week 1 concepts.**
- **Completed the documentation deliverables for Phase 0.**
- **Finalised your Engineering Environment Repository.**
- **Self-assessed your understanding against the week's learning objectives.**
- **Reflected on the transition from systems thinking to Rust programming.**

### What This Week Has Built

Week 1 has built the foundation for everything that follows. You now have:

- A complete mental model of how programs run (compilation, memory, CPU).
- A complete engineering environment (toolchain, Git, Cargo).
- The habit of tracing code by hand (stack diagrams, variable lifetimes).
- The discipline of documentation and version control.

These are not just skills for this curriculum. They are skills for your entire career.

### The Bridge to Week 2

Week 2 begins the transition from systems thinking to Rust programming. You will:

- **Day 1:** Introduction to Rust's syntax and structure.
- **Day 2:** Ownership and borrowing—the heart of Rust.
- **Day 3:** More ownership practice and the borrow checker.
- **Day 4:** The Slice type and lifetimes introduction.
- **Day 5:** The `Result` and `Option` types—Rust's error handling.
- **Day 6:** Engineering Review and Phase 0 completion.

**The key insight to carry forward:** Everything you learned in Week 1 will be used in Week 2. The manual trace is how you will debug borrow-checker errors. The memory model is why ownership exists. The CPU model is why performance matters.

You are ready for Phase 1. Not because you know Rust syntax—you don't yet. But because you understand *why* Rust exists. The syntax is the easy part. The systems thinking is what makes you a Rust engineer.

Take the rest of the day to rest and consolidate. Tomorrow, you write your first Rust code.
