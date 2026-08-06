---
id: P0-W2-D5
phase: 0
week: 2
day: 5
title: 'Assessment: Phase 0 Complete'
subtitle: 'Self-evaluation, review, and official completion of the first phase'
estimated_time: 60
difficulty: Beginner
learning_objectives:
  - Complete the Phase 0 self-assessment against the official rubric
  - Verify all competencies unlocked during the phase
  - Review the Engineering Environment Repository for completeness
  - Reflect on the transition from systems thinking to Rust programming
  - Officially complete Phase 0 and prepare for Phase 1
widgets:
  - story
  - mental-model
  - worked-example
  - engineering-note
  - mini-challenge
  - reflection
project: null
failure_lab: null
reading:
  - REEC-01-Phase0-Foundations.md §0.14 (Assessment)
  - REEC-01-Phase0-Foundations.md §0.15 (Transition to Phase 1)
tags:
  - assessment
  - phase-0-completion
  - self-evaluation
  - competencies
  - transition
next: P0-W2-D6
previous: P0-W2-D4
published: true
---

:::story

## The Moment You Realise You've Changed

A learner—call her Sarah—was finishing her Phase 0 assessment. She had been working through the curriculum for two weeks, and she was tired. But she was also energised.

She opened the assessment questions and started writing:

> *"The compilation pipeline has six stages: preprocessor, compiler front-end, compiler back-end, assembler, linker, and loader. The linker resolves symbol references and combines object files into an executable. A linker error means a symbol was referenced but never defined—the problem is in the combination step, not in the source code itself."*

She paused. Two weeks ago, she couldn't have written that sentence. Two weeks ago, she would have said "compilation is when code turns into a program" and left it at that.

She continued:

> *"Memory is organised into five regions: text (code), data (initialised globals), BSS (uninitialised globals), heap (dynamic allocation), and stack (function frames). The stack is fast but bounded; the heap requires bookkeeping and is slower. Rust's ownership model is a compile-time system for managing heap memory, guaranteeing memory safety without a garbage collector."*

She wrote the answer without looking at her notes. The concepts were not just memorised. They were understood. They were part of her mental model.

She finished the assessment and closed her laptop. She felt different. Not just more knowledgeable—more capable. More confident. More like an engineer.

She had started Phase 0 knowing almost nothing about systems. She was ending it with a complete mental model of how programs run, how memory is organised, and why Rust exists.

The change was real. And it was permanent.

Today, you experience that same moment.

:::

:::mental-model

Before we dive into the assessment, internalise these three mental models. They reframe assessment from a test into a confirmation of learning.

**Mental Model 1 — Assessment is not a judgment. It is a reflection.**

An assessment does not tell you whether you are "good" or "bad." It tells you what you understand and what you still need to work on.

The purpose of assessment is not to grade you. It is to guide you. It is to show you where your understanding is solid and where there are gaps. It is a tool for self-awareness, not a tool for judgment.

**Mental Model 2 — You are the primary audience for this assessment.**

No one else will read your assessment. It is not being graded by a teacher or a system. It is for you.

This changes everything. When you are assessing for yourself, you have no reason to inflate your answers or pretend you understand something you don't. The only person you are cheating is yourself.

Be honest. Be thorough. Be reflective. The assessment is your opportunity to solidify your understanding.

**Mental Model 3 — Completing Phase 0 is not an endpoint. It is a launchpad.**

Phase 0 is the foundation. You have built it. Now Phase 1 begins.

Phase 0 was about understanding the system. Phase 1 is about writing code on top of that system. The systems thinking you have built is not something you leave behind. It is something you carry forward. Every piece of Rust code you write from now on will be informed by your understanding of the machine, the memory, and the toolchain.

:::

## Theory

### Phase 0 Assessment

Per REEC-01-Phase0-Foundations.md §0.14, the Phase 0 Assessment has four components:

1. **Knowledge check**
2. **Prediction check**
3. **Implementation check**
4. **Review check**

### Component 1: Knowledge Check

Answer these questions in writing, committed as `assessment-knowledge.md` in your `hello_reec` repository.

---

**Question 1: Compilation Pipeline**

Explain the six stages of the compilation pipeline without looking at the diagram. For each stage, state:

- What the stage does.
- What it produces.
- What kind of error would occur at this stage.

<details>
<summary>Answer Guidance</summary>

1. **Preprocessor:** Expands macros and includes. Produces preprocessed source. Errors: missing include files, malformed macros.

2. **Compiler Front-End:** Parses source into AST, checks types, resolves names. Produces intermediate representation (IR). Errors: syntax errors, type errors.

3. **Compiler Back-End:** Lowers IR to machine instructions, applies optimisations. Produces assembly (.s file). Errors: rarely seen—compiler bugs.

4. **Assembler:** Translates mnemonics to machine code bytes. Produces object file (.o) with unresolved symbol references. Errors: invalid assembly.

5. **Linker:** Combines object files, resolves symbol references. Produces executable binary. Errors: undefined symbol, duplicate symbol.

6. **Loader:** Maps binary into process address space, jumps to entry point. Produces running process. Errors: file not found, permission denied.
</details>

---

**Question 2: Memory Regions**

Name the five memory regions of a process and give one example of what lives in each region.

<details>
<summary>Answer Guidance</summary>

| Region | Example |
|---|---|
| **Text** | Compiled machine instructions for `main()` and other functions |
| **Data** | Initialised global variables (`global_counter = 0`) |
| **BSS** | Uninitialised static variables (`static counter: i32`) |
| **Heap** | Dynamically allocated data (`Box::new(5)`, `vec![]`, `String`) |
| **Stack** | Local variables, function arguments, return addresses |
</details>

---

**Question 3: Scope vs Memory Region**

Explain the difference between a variable's *scope* and its *memory region*. Why does confusing these two concepts lead to incorrect mental models of program execution?

<details>
<summary>Answer Guidance</summary>

**Scope** determines when a variable is valid to use—its lifetime in terms of the program's execution. **Memory region** determines where the variable's bytes are stored—stack, heap, data, BSS, or text.

These are independent axes. A variable can be in scope but on the heap (e.g., a `Box` that is still in scope). A variable can be out of scope but with bytes still present (e.g., a stack frame that has been popped).

Confusing them leads to incorrect mental models: thinking "global variables live on the heap because they're globally accessible" (scope and memory region are confused), or thinking "when a function returns, its memory is deleted" (the stack pointer moves, but bytes aren't erased).
</details>

---

**Question 4: Rust's Ownership Model**

Using the vocabulary of Phase 0, explain why Rust's ownership model exists. What memory management problem does it solve, and how does it solve it?

<details>
<summary>Answer Guidance</summary>

Heap allocation requires knowing when to reclaim memory. Without a garbage collector, the programmer must explicitly free memory—but doing this correctly is difficult, leading to use-after-free, double-free, and memory leaks.

Rust's ownership model solves this by tracking, at compile time, exactly one owner for each value. When the owner goes out of scope, the value is dropped and the memory is reclaimed. This makes double-free bugs impossible, use-after-free bugs impossible (for safe code), and memory leaks harder to create.

The key insight is that ownership is not a language feature. It is a compile-time enforcement of the exact discipline you traced by hand in Day 5: every value has exactly one owner, and the owner is responsible for its memory.
</details>

### Component 2: Prediction Check

Given the following short C-like snippet, predict the order in which stack frames are pushed and popped. Write your prediction in `assessment-prediction.md`.

```c
int global = 0;

int increment(int n) {
    global = global + n;
    return global;
}

int main() {
    int a = 5;
    int b = increment(a);
    int c = increment(b);
    return global;
}
```

**Tasks:**
1. Write the order in which stack frames are pushed.
2. Write the order in which stack frames are popped.
3. Trace the value of `global` after each call.
4. Identify which memory region each variable lives in.

<details>
<summary>Answer Guidance</summary>

**Stack frame order:**

1. `main` frame is pushed.
2. `increment(a)` frame is pushed (called from `main`).
3. `increment(a)` frame is popped (returns to `main`).
4. `increment(b)` frame is pushed (called from `main`).
5. `increment(b)` frame is popped (returns to `main`).
6. `main` frame is popped (program exits).

**global trace:**
- Initially: `global = 0`
- After `increment(a)` (n=5): `global = 5`
- After `increment(b)` (n=10): `global = 15`

**Memory regions:**
- `global` → Data region (initialised global)
- `n` → Stack (function argument)
- `a`, `b`, `c` → Stack (local variables in `main`)
</details>

### Component 3: Implementation Check

Verify that your `hello_reec` repository meets the Phase 0 Definition of Done.

**Tasks:**

1. Run `cargo build` — does it succeed?
2. Run `cargo fmt` — does it pass?
3. Run `cargo clippy -D warnings` — does it pass with zero warnings?
4. Run `git status` — is your working tree clean?
5. Run `git log --oneline` — do you have a meaningful commit history?
6. List the files in your repository — are all required files present?

**Document your results in `assessment-implementation.md`.**

### Component 4: Review Check

Review your `engineering-review-0.md` file. Ensure your answers:

1. Are internally consistent.
2. Use the phase's vocabulary correctly (stack vs. heap, ownership of memory regions, linker vs. compiler errors).
3. Are written in your own words (not copied from the book).

**If any answer fails these criteria, rewrite it.** Document the review in `assessment-review.md`.

---

## Worked Example

### Sample Assessment Answers

#### Knowledge Check: Compilation Pipeline

*"The compilation pipeline has six stages. The preprocessor expands macros and includes. The compiler front-end parses source into an AST and checks types. The compiler back-end lowers IR to machine instructions. The assembler converts mnemonics to machine code. The linker resolves symbol references and combines object files. The loader maps the binary into memory and starts execution. A linker error means a symbol was referenced but never defined—the problem is in the combination step, not in the source code."*

#### Knowledge Check: Memory Regions

*"Memory has five regions. The Text region holds compiled machine instructions. The Data region holds initialised global variables. The BSS region holds uninitialised globals (zeroed at startup). The Heap holds dynamically allocated data like Box and Vec. The Stack holds local variables, function arguments, and return addresses."*

#### Knowledge Check: Scope vs Memory Region

*"Scope determines when a variable is valid to use. Memory region determines where its bytes are stored. These are independent: a heap-allocated Box can be in scope, and a stack-allocated variable can be out of scope while its bytes remain. Confusing them leads to wrong mental models of memory management."*

#### Knowledge Check: Rust's Ownership Model

*"Heap allocation requires bookkeeping to know when to reclaim memory. Rust's ownership model tracks exactly one owner per value at compile time. When the owner goes out of scope, the value is dropped and the memory is reclaimed. This makes double-free and use-after-free bugs impossible in safe code."*

---

## Engineering Notes

### Engineering Note: The Transition to Phase 1

You are about to transition from Phase 0 to Phase 1. This is a significant moment. Here is what is changing:

| Phase 0 | Phase 1 |
|---|---|
| Understanding the system | Writing code on top of the system |
| No Rust syntax | Rust syntax and semantics |
| Manual memory tracing | Compiler-enforced ownership |
| Toolchain as a concept | Toolchain as a daily practice |
| Systems thinking | Systems thinking + Rust fluency |

The systems thinking you have built in Phase 0 is the foundation for everything in Phase 1. You will not leave it behind. You will carry it forward.

### Engineering Note: What "Understanding" Really Means

You do not need to memorise every fact from Phase 0. You need to understand the mental models.

**Understanding means:**

- You can explain the concept in your own words.
- You can apply the concept to new situations.
- You can connect the concept to other concepts.
- You can recognise the concept when you see it.

If you can do these things, you understand. If you cannot, you have more work to do.

---

## Mini Challenge

### Challenge 1 — Complete the Assessment

Complete all four components of the Phase 0 Assessment:

1. **Knowledge check:** Answer the four questions in `assessment-knowledge.md`.
2. **Prediction check:** Trace the stack and global state in `assessment-prediction.md`.
3. **Implementation check:** Verify your repository in `assessment-implementation.md`.
4. **Review check:** Review your Engineering Review answers in `assessment-review.md`.

### Challenge 2 — Phase 0 Repository Final Verification

Run this final verification script:

```bash
# Verify code quality
cargo build
cargo fmt -- --check
cargo clippy -D warnings

# Verify repository state
git status
git log --oneline

# List all required files
ls -la

# Count commits
git log --oneline | wc -l
```

**Expected results:**
- `cargo build`: success
- `cargo fmt -- --check`: success
- `cargo clippy -D warnings`: success
- `git status`: clean
- `git log`: meaningful history
- Files: all required files present

### Challenge 3 — The Phase 0 Competencies Checklist

Review the Phase 0 Competencies Unlocked (from REEC-01-Phase0-Foundations.md). Check each one you have demonstrated:

```
[ ] memory-model-reasoning — trace a C-like program's memory by hand, classifying every variable by region and lifetime
[ ] unix-fluency — operate a Unix terminal and Git without reference material for common operations
[ ] git-fluency — use Git as an engineering tool, not just a "save" button
[ ] compiler-pipeline-literacy — explain the compilation pipeline unprompted
```

---

## Reflection

Write the answer to this question in a text file called `reflection-w2d5.md` in your `hello_reec` directory. Commit it.

**Question:**

"You have just completed Phase 0. Two weeks ago, you knew almost nothing about systems programming. Now you have a complete mental model of the compilation pipeline, memory layout, CPU instructions, the Unix toolchain, and Git. How has your understanding of what it means to 'program' changed? What do you now know about what happens when you run code that you didn't know before?"

<details>
<summary>Reflection Guidance</summary>

Before Phase 0, programming was about writing code. After Phase 0, programming is about understanding what happens when code runs.

The most significant shift is from abstraction to reality. Before, a program was something that "ran." After, a program is something that is translated, linked, loaded, and executed on a physical machine with memory, CPU, and an operating system.

You now understand:
- Compilation is not a black box. It is a pipeline of six stages.
- Memory is not free-form. It is organised address space.
- The CPU is not magic. It is a simple machine executing instructions.
- The toolchain is not a launcher. It is a set of composable tools.
- Git is not a save button. It is a time machine for the engineering process.

This is the difference between a programmer and an engineer. You are now an engineer.
</details>

---

## End of Day 5, Week 2

### What You Have Accomplished

By the end of this session, you have:

- **Completed the Phase 0 Assessment** across all four components.
- **Verified your understanding** of the compilation pipeline, memory layout, and stack diagrams.
- **Verified your repository** meets all quality and completeness standards.
- **Reflected on the transition** from systems thinking to Rust programming.
- **Officially completed Phase 0.**

### Phase 0 Complete: The Milestone

```
You can now:
✓ Trace a C-like program's memory by hand, correctly classifying every variable by region and lifetime
✓ Operate a Unix terminal and Git without reference material for common operations
✓ Explain the compilation pipeline unprompted
✓ Explain why Rust's ownership model exists, using systems vocabulary
```

### The Bridge to Phase 1

Phase 1 begins with the Calculator CLI—your first real Rust program. The systems thinking you have built in Phase 0 is the foundation for everything you will learn.

**In Phase 1, you will:**

- Write Rust code for the first time.
- Learn ownership, borrowing, and lifetimes.
- Build real, tested, documented programs.
- Apply the systems thinking from Phase 0 to Rust programming.

You are ready.

Take the rest of today to rest and celebrate. Tomorrow is a review day. Then, Phase 1 begins.
