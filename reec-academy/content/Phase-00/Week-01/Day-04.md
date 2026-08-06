---
id: P0-W1-D4
phase: 0
week: 1
day: 4
title: 'Failure Lab 0: The Broken Mental Model'
subtitle: Diagnosing conceptual bugs before you write your first Rust code
estimated_time: 75
difficulty: Beginner
learning_objectives:
  - Recognize that false mental models about memory lead to systematic errors
  - >-
    Distinguish between scope (name visibility) and memory region (storage
    location)
  - Explain why "not yet freed" does not mean "safe to read"
  - >-
    Identify the difference between heap use-after-free and stack dangling
    pointers
  - Build the habit of tracing memory behavior before trusting intuition
  - Understand why Rust's borrow checker catches these bugs at compile time
widgets:
  - story
  - mental-model
  - worked-example
  - compiler-thinking
  - mini-challenge
  - reflection
project: null
failure_lab: true
reading: []
tags:
  - failure-lab
  - memory-model
  - dangling-pointers
  - undefined-behavior
  - conceptual-bugs
next: P0-W1-D5
previous: P0-W1-D3
published: true
---

:::story

## The Bug That Wasn't a Bug—Until It Was

A learner—call her Priya—had been writing Rust for three weeks. She understood the syntax. She could make the compiler happy. But she still couldn't predict borrow-checker errors.

Every time the compiler rejected her code, she felt like she was fighting the language. She would try adding `&` here, `*` there, `.clone()` when she got desperate—until the compiler stopped complaining. Then she would move on, never quite understanding why the first version was wrong.

One day, she asked a mentor: "Why does Rust make this so hard?"

The mentor asked: "What do you think happens when a function returns?"

"All its local variables are deleted, right?"

"Deleted, or marked as available?"

"Same thing, isn't it?"

The mentor opened a terminal and ran a C program that returned a pointer to a local variable. The program printed the correct value.

"Wait," Priya said, "that should have crashed. That's a dangling pointer."

"The bytes are still there," the mentor said. "The memory isn't 'deleted' in the sense of being overwritten or cleared. The stack pointer moves, and the region is marked as available. The old bytes are still sitting there. Reading them often works—until something else writes over them."

Priya had been thinking about memory as if it were a filing cabinet where files were physically removed. In reality, it was more like a whiteboard where old marks were left until someone drew over them.

"That's why Rust's borrow checker feels arbitrary," she said. "It's not arbitrary. It's enforcing something I had the wrong mental model for."

This is the most common source of frustration with Rust: not the language itself, but the gap between the learner's mental model and reality. The rules feel arbitrary when you don't understand the underlying physical reality they are enforcing.

Today, you close that gap.

:::

:::mental-model

**Mental Model 1 — "Deleted" memory is not erased; it is just marked as available.**

When a stack frame is popped, the bytes are still physically present. Nothing overwrites them. The stack pointer moves, making that region of memory available for reuse by future function calls. But the old data remains until something else writes to that location.

This is why reading a dangling pointer often works in practice—the bytes are still there. It is also why such bugs are insidious: they can appear to work correctly for a long time before manifesting as corrupted data or crashes.

**Mental Model 2 — Scope and memory region are independent axes.**

Scope answers: "Who can see this name?"
Memory region answers: "Where do these bytes live?"

These are completely different questions. A global variable (visible everywhere) and a heap-allocated value pointed to by a global pointer (also visible everywhere) both have global scope—but they live in entirely different memory regions. Confusing these two axes produces the false belief that "globals live on the heap because they can be accessed from anywhere."

**Mental Model 3 — There is more than one way to create a dangling reference.**

A dangling reference is any reference to memory that has been reclaimed. This can happen through:

1. **Heap use-after-free:** the memory was freed but the pointer still exists.
2. **Stack dangling pointer:** the stack frame was popped, and a pointer to a local variable escapes.
3. **Data races:** in concurrent code, one thread frees memory while another still holds a reference.

Rust's borrow checker prevents all three categories at compile time—not by making them "safe," but by making them unrepresentable in the type system.

:::

## Theory

### The Problem with Intuition

Human intuition about memory is often wrong. Here is why.

**Intuition 1: "If I can see it, it must be there."**

When a variable is in scope, we assume its memory is valid. This is true in safe languages, but not in general. A pointer to a local variable can be created, returned, and dereferenced after the function returns—long after the variable went out of scope. The name is gone, but the pointer might still exist.

**Intuition 2: "Freeing means the memory is gone."**

Freeing memory does not erase it. It marks it as available. The bytes stay where they were until something else writes to them. This is why use-after-free bugs are so hard to find: the old data often looks correct for a while.

**Intuition 3: "If the program works, the code is correct."**

This is the most dangerous intuition. A program can work for years and still contain a serious bug. The bug might only manifest under specific conditions: a larger input size, a different compiler version, a different CPU architecture. This is what makes memory safety bugs so insidious—they are not always immediately visible.

### The Two Dangling Pointers

There are two distinct mechanisms for creating a dangling pointer:

**1. Stack Dangling Pointer**

```c
int* get_pointer() {
    int x = 42;      // x lives on the stack
    return &x;       // returns address of a stack-allocated value
}                    // x's stack frame is popped

int main() {
    int* p = get_pointer();
    printf("%d\n", *p);  // undefined behaviour: p points to reclaimed memory
}
```

The pointer `p` is dangling. The memory it points to has been reclaimed by the stack pointer moving. The bytes might still be `42`, or they might have been overwritten by something else. The behaviour is undefined.

**2. Heap Use-After-Free**

```c
int* ptr = malloc(sizeof(int));  // allocate on the heap
*ptr = 42;
free(ptr);                       // free the memory
printf("%d\n", *ptr);            // undefined behaviour: ptr points to freed memory
```

The pointer `ptr` is dangling. The memory it points to has been returned to the allocator's free list. It might still contain `42`, or it might have been reused by a subsequent allocation. The behaviour is undefined.

**The difference:** The stack dangling pointer results from a lifetime violation (the data outlives its scope), while the heap use-after-free results from explicit deallocation. Both are undefined behaviour. Both are prevented by Rust's ownership system.

### Why This Matters for Rust

Rust's ownership rules are not arbitrary restrictions. They are compile-time enforcement of the invariants required to prevent these bugs.

| Bug | Rust's Prevention |
|---|---|
| Stack dangling pointer | You cannot return a reference to a local variable. The borrow checker rejects the code. |
| Heap use-after-free | Ownership determines when memory is freed. Exactly one owner exists at any time. When the owner goes out of scope, the memory is freed. You cannot use a value after it has been moved. |
| Data races | The type system enforces thread safety: `Send` and `Sync` traits ensure values can be safely shared across threads. |

When the borrow checker rejects your code, it is not being arbitrary. It is protecting you from a class of bugs that have caused billions of dollars in damage.

:::engineering-note

**The billion-dollar mistake.**

Tony Hoare, the inventor of null references, called them his "billion-dollar mistake." The ability to have a null pointer—a pointer that points to nothing—has caused countless crashes, security vulnerabilities, and debugging nightmares.

Rust does not have null. Instead, it has `Option<T>`, which encodes the possibility of absence in the type system. You cannot dereference a `None` value without handling the `None` case explicitly. The compiler enforces this.

This is the same pattern: Rust replaces a runtime bug (null pointer dereference) with a compile-time check (handling the `Option`).

:::

### The Compiler's Perspective

When you write Rust code that the borrow checker rejects, the compiler is trying to tell you something about your mental model. Here is how to read those error messages:

**"cannot borrow as mutable because it is also borrowed as immutable"**

This means you are trying to mutate data while an immutable reference to it exists elsewhere. This could cause the other reference to see inconsistent data.

**"cannot move out of borrowed content"**

This means you are trying to move a value out of a reference (taking ownership of a value you only borrowed). This would leave the original owner with invalid memory.

**"borrowed value does not live long enough"**

This means you are trying to use a reference to data that will be freed before the reference is used. The compiler has detected a lifetime mismatch.

Each of these errors corresponds to a physical safety violation. The compiler is not just enforcing arbitrary rules—it is ensuring that your code cannot violate the memory model.

---

## Failure Lab: The Broken Mental Model

This is the first Failure Lab in the curriculum. Unlike later Failure Labs, which involve real code and compiler errors, this lab targets **conceptual** bugs—false beliefs about memory and compilation that feel true until examined.

The skill being trained is the same one you will need for real compiler errors starting in Phase 1: do not accept the first plausible-sounding explanation. Trace it against the actual model.

### Student Tasks

**Task 1:** For each claim below, before reading further, write one sentence stating whether you believe it is true, false, or partially true—commit to an answer before you look anything up.

**Task 2:** For each claim you marked true or partially true, find the specific place in Day 1's memory model (the sections on stack, heap, data, and BSS) that contradicts or confirms it.

**Task 3:** Rewrite each claim so it is fully correct, without losing the part (if any) that was actually true.

**Task 4:** For Claim 3 specifically: construct a concrete scenario (in plain English, no code needed yet) where an *unfreed* pointer is still unsafe to read. If you cannot construct one, re-read Day 1's sections on stack and heap before moving on—the scenario exists and is common.

---

## The Broken Claims

### Claim 1

> "Global variables live on the heap because they can be accessed from anywhere in the program."

### Claim 2

> "Once `main` calls `increment(a)` and it returns, `a`'s memory is deleted."

### Claim 3

> "A pointer that hasn't been freed yet is always safe to read, because freeing is what causes memory bugs."

---

## Hints

**Weakest hint:** Re-read the definition of "scope" versus "memory region"—these are two different axes, and Claim 1 conflates them.

**Stronger hint:** For Claim 2, ask: does "the stack pointer moves" mean the same thing as "the bytes are erased"? What would you actually see if you could inspect that memory address immediately after `increment` returns, before anything else runs?

**Strongest hint:** For Claim 3, think about a pointer to a stack variable from a function that has already returned—the pointer itself hasn't been "freed" in the heap sense, but the memory it points to has been reclaimed by a *different* mechanism (stack frame popping). This is called a "dangling pointer" and it is a distinct bug from a heap use-after-free, though both fall under the same broad danger.

---

## Solution Walkthrough

### Claim 1 — Corrected

> **Global/static variables are stored in the Data or BSS region, sized and placed at compile time, because their *lifetime* is the entire program run.**

The heap exists for a different problem entirely: data whose *size or lifetime isn't known until runtime*. Wide accessibility (scope) is a property of the *name* being visible across the program; it says nothing about *where the bytes live*. A `static` variable and a heap-allocated `Box` can both be made globally accessible via different mechanisms (a direct static reference vs. a global pointer to heap data)—the accessibility is a language-level naming/visibility feature layered on top of, and independent from, the physical memory region.

### Claim 2 — Corrected

> **Nothing is deleted or overwritten by the mere act of a function returning. The stack pointer is adjusted so that region of memory is considered "available," but the old bytes are typically still physically present until something else writes over them.**

This is why, in unsafe languages, reading a stack address after its frame has been popped often doesn't crash—it silently returns stale, garbage-looking-valid data. A crash would actually be the *safer* outcome; silent wrong data is worse because it can propagate undetected.

### Claim 3 — Corrected

> **Freeing is *one* way to create a dangling reference, but not the only one. A pointer to a stack-allocated local variable becomes dangling the instant the function that owns that variable returns—no `free()` call involved at all.**

This exact bug class (returning a pointer/reference to a local variable) is one of the very first things Rust's borrow checker is designed to catch at compile time, and it is worth remembering this scenario precisely because Phase 1 will show you the compiler error for it and you will be able to say "I already know why this is wrong" before the compiler even tells you.

---

## Engineering Lessons

**Scope and memory region are independent axes.** Confusing "who can see this name" with "where do these bytes live" produces wrong mental models that compile-time safety features (like Rust's) are specifically designed to make irrelevant—but only if you understand the distinction well enough to appreciate what is being protected.

**"Not yet freed" is not the same as "safe."** Memory safety bugs come from multiple distinct mechanisms—heap misuse, stack frame lifetime violations, and (later, in Phase 4) data races. Rust's ownership and borrowing rules address all of these as one unified discipline, which is precisely why the language feels strict: it is closing several historically separate bug classes with one set of compile-time rules.

**Committing to an answer before checking is the actual exercise.** The value of this lab isn't reading the corrected claims—it is noticing which of your own prior beliefs turned out to be imprecise. Do not skip Task 1.

---

## Mini Challenge

### Challenge: Predict the Bug

Consider this Rust code (which, unlike the C examples, *will not compile*):

```rust
fn make_task_name() -> &String {
    let name = String::from("Untitled Task");
    &name
}
```

**Question:** Why does the compiler reject this code? Trace what happens to `name` when `make_task_name` returns, using the memory model from Day 1.

<details>
<summary>Answer</summary>

The function tries to return a reference to a local variable `name`. `name` is a `String` stored on the stack (the pointer part) with heap-allocated data.

When `make_task_name` returns, its stack frame is popped. The `name` variable ceases to exist. The reference `&name` would point to memory that is no longer valid—the bytes are still there, but they are now considered "available" for reuse.

The compiler rejects this because it cannot guarantee that the reference points to valid memory after the function returns. This is exactly the same bug as the C example from Day 1, now caught at compile time.

The fix is to return `String` (owned) instead of `&String` (borrowed):

```rust
fn make_task_name() -> String {
    String::from("Untitled Task")
}
```

</details>

---

## Reflection

Write the answer to this question in a text file called `reflection-day4.md` in your `hello_reec` directory. Commit it.

**Question:** "Claim 1 said 'global variables live on the heap because they can be accessed from anywhere.' After working through this lab, explain in your own words why this is wrong. Why is it important to distinguish between scope (where a name is visible) and memory region (where the bytes actually live)? What would happen if you conflated these two concepts when reasoning about code?"

<details>
<summary>Reflection Guidance</summary>

Scope and memory region are independent. A global variable can be accessed from anywhere (global scope) but lives in the Data or BSS region of static storage. A heap-allocated value can also be globally accessible if a global pointer points to it—but the value lives on the heap, not in static storage.

Conflating these concepts leads to wrong mental models. If you believe "globals live on the heap because they are globally accessible," you will misunderstand where data lives, when it is allocated, and when it is freed. This can lead to bugs in unsafe code and confusion when reasoning about Rust's ownership rules.

The distinction matters because it informs your understanding of lifetimes, allocation patterns, and memory safety. When you understand that scope is about names and regions are about bytes, you can trace memory correctly.
</details>

---

## End of Day 4

### What You Have Accomplished

By the end of this session, you have:

- **Identified and corrected three common false mental models** about memory.
- **Distinguished between scope and memory region** as independent concepts.
- **Understood the difference between stack dangling pointers and heap use-after-free.**
- **Practised committing to an answer** before checking it against the model.
- **Seen why Rust's borrow checker catches these bugs** at compile time.

### What This Builds Toward

Day 4 is the first Failure Lab, and it is deliberately placed before Phase 1 begins. The goal is to catch false mental models *before* you start writing Rust code—so when you see a borrow-checker error in Phase 1, you recognise it as a real hazard, not an arbitrary restriction.

**The engineering habit to carry forward:** When you encounter a bug, do not ask "what does the compiler want?" Ask "what does the physical reality demand?" The compiler is a teacher, not an obstacle.

**Tomorrow, Day 5, you will put your environment to work.** You will create your first real Rust project with Cargo, run `cargo build` and `cargo run`, and write a simple program that is more than "Hello, world!" You will also revisit the memory model from Day 1—this time, with Rust's ownership rules enforcing it.
