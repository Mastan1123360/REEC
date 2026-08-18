---
id: P0-W1-D1
phase: 0
week: 1
day: 1
title: 'Computational Thinking: The Compilation Pipeline and Memory Layout'
subtitle: Understanding how source code becomes a running process
estimated_time: 75
difficulty: Beginner
learning_objectives:
  - Trace a program's execution through the six-stage compilation pipeline
  - >-
    Classify every variable in a program by memory region (stack, heap, data,
    BSS, text)
  - >-
    Explain why stack allocation is fast and heap allocation requires
    bookkeeping
  - Predict the lifetime of a variable based on its memory region
  - Understand why Rust's ownership rules exist from a systems perspective
widgets:
  - story
  - mental-model
  - worked-example
  - compiler-thinking
  - mini-challenge
  - reflection
project: null
failure_lab: null
reading:
  - >-
    Computer Systems: A Programmer's Perspective, Chapter 1 (A Tour of Computer
    Systems)
  - >-
    The Rust Programming Language, Chapter 4 (Understanding Ownership) —
    introductory only
tags:
  - compilation
  - memory-layout
  - stack
  - heap
  - linker
  - loader
next: P0-W1-D2
previous: null
published: true
---

:::story

## The Program That Worked Until It Didn't

A novice programmer writes a C program that stores user input in a buffer and prints it back. It works correctly every time the programmer tests it:

```c
#include <stdio.h>

int main() {
    char name[10];
    printf("Enter your name: ");
    gets(name);
    printf("Hello, %s\n", name);
    return 0;
}
```

This program compiles without errors. It runs without crashes—as long as the user enters nine or fewer characters. If the user enters twenty characters, the program overwrites memory it should not touch, corrupting the stack, and may crash unpredictably or, worse, continue running with corrupted data.

This is not a historical curiosity. `gets` has been responsible for decades of security vulnerabilities, including the Morris worm of 1988, the first major internet worm. The C standard deprecated `gets` in C99 and removed it entirely in C11. But the lesson is not about C specifically; it is about the underlying reality of program memory:

**The machine does not understand the concept of a "string."** It understands bytes at addresses. The code `char name[10]` reserves ten bytes on the stack. `gets(name)` writes bytes into that region with no bounds checking. If the user supplies more than ten bytes, the bytes continue past the reserved region, overwriting whatever happens to be adjacent in memory—often the return address of the function, which the CPU will later jump to. That is how a buffer overflow becomes a remote code execution.

This is not an edge case. It is the default behaviour of the underlying hardware. Safe programming languages—Rust included—are distinguished by building abstractions that prevent this class of bug at compile time or runtime. But understanding *why* those abstractions exist, and *what* they are protecting you from, requires understanding the physical reality they are layered on top of.

:::

:::mental-model

Before proceeding to the detailed theory, internalise these three sentences. Everything in Phase 0 is an elaboration of them.

**Mental Model 1 — A program is data before it is behaviour.**

Source code is text. Text becomes bytes. Bytes become instructions the CPU executes and data the CPU reads and writes. There is no magic step where code becomes something other than bytes in memory. The compiler's job is to transform human-readable source text into machine-readable bytes. The linker's job is to combine those bytes with library bytes into a complete executable image. The loader's job is to copy that image into a process's address space and direct the CPU to start executing from the entry point.

When you debug a program, you are examining the state of these bytes at a specific moment in time. When you optimise a program, you are arranging these bytes to minimise the number of CPU cycles required to execute them. There is no layer of interpretation between the code you write and the machine that runs it—only translation.

**Mental Model 2 — Memory is not free-form. It is organised address space.**

Every running process sees a private, structured view of memory:

- The **stack** grows and shrinks with function calls. It stores local variables, function arguments, and return addresses. It is fast and automatically reclaimed, but its size is bounded and its lifetime is tied to the call stack.

- The **heap** is for data whose lifetime outlives a single function call. It is allocated and freed explicitly (or, in Rust, automatically via ownership). It is slower than the stack and requires bookkeeping to track which allocations are still in use.

- The **static regions** (data and BSS) store global and static variables. They exist for the entire lifetime of the process.

- The **text region** stores the compiled instructions. It is typically read-only to prevent accidental or malicious modification of code.

Every later Rust concept—ownership, borrowing, `Box`, lifetimes—is a set of compile-time rules layered on top of this physical reality. The rules are not arbitrary; they are precisely the invariants required to guarantee safe access to these memory regions.

**Mental Model 3 — Engineering is the management of complexity under constraints.**

A working solution is the minimum bar, not the goal. The goal is a solution whose complexity is understood, whose failure modes are known, and whose cost—time, memory, maintenance burden—is deliberate rather than accidental.

:::

## Theory

### From Source Text to Running Process

Consider the C program from the Opening Story. Nothing about "functions," "variables," or "return values" exists once this program runs. Those are conveniences for you, the human. The machine understands bytes at addresses. The toolchain performs a sequence of translations, each one moving further from human-readable semantics and closer to machine-executable bytes.

The full pipeline, from your editor to the CPU, is as follows:

```
source.c
   │
   ▼
[Stage 1: Preprocessor]
   │   Expands #include, #define, #ifdef directives.
   │   Pure text substitution—no understanding of C syntax.
   │   Output: preprocessed source (still human-readable text).
   ▼
preprocessed source
   │
   ▼
[Stage 2: Compiler Front-End]
   │   Parses the preprocessed source into an Abstract Syntax Tree (AST).
   │   Checks types, resolves names, reports syntax and type errors.
   │   Output: an intermediate representation (IR) that is
   │   language-agnostic but still high-level.
   ▼
Intermediate Representation (IR)
   │
   ▼
[Stage 3: Compiler Back-End]
   │   Lowers the IR to machine instructions for a specific CPU
   │   architecture (x86-64, ARM, etc.).
   │   Applies optimizations: inlining, loop unrolling, dead code
   │   elimination, instruction scheduling.
   │   Output: assembly language (.s file) — human-readable mnemonics
   │   still, but now specific to the target CPU.
   ▼
assembly (.s)
   │
   ▼
[Stage 4: Assembler]
   │   Translates human-readable mnemonics (MOV, ADD, JMP) into
   │   raw machine-code bytes.
   │   Output: an object file (.o or .obj) containing machine code,
   │   plus a table of unresolved symbol references (function calls
   │   to external libraries, global variable addresses that aren't
   │   known yet).
   ▼
object file (.o)
   │
   ▼
[Stage 5: Linker]
   │   Combines multiple object files and static libraries into one
   │   executable image.
   │   Resolves symbol references: finds the actual address of `printf`,
   │   `malloc`, `square`, and replaces placeholder addresses with
   │   real ones.
   │   Output: a complete executable binary (ELF on Linux, PE on Windows,
   │   Mach-O on macOS).
   ▼
executable binary
   │
   ▼
[Stage 6: Loader] (part of the operating system)
   │   Reads the executable binary's headers.
   │   Allocates address space for the process.
   │   Maps the binary's text (code) and data segments into that
   │   address space.
   │   Sets up the initial stack.
   │   Jumps to the program's entry point (usually `_start`, which
   │   calls `main`).
   ▼
running process
```

:::engineering-note

**Where errors occur.**

The stage that produces an error tells you what kind of problem you have:

- **Preprocessor errors** are rare in Rust (no preprocessor), but in C they indicate a missing include file or a malformed macro.
- **Compiler front-end errors** are syntax or type errors: you wrote `x = y +` without a right operand, or you passed a `String` to a function expecting an `i32`. This is where most beginners spend their time.
- **Compiler back-end errors** are almost never seen by the programmer; the backend is trusted to generate correct machine code.
- **Assembler errors** indicate invalid assembly output—extremely rare unless you're writing inline assembly.
- **Linker errors** tell you that a symbol (a function or variable name) was referenced but never defined. In Rust, this often happens when you forget to link a dependency, or when your Cargo.toml specifies a dependency but you haven't imported it correctly. Linker errors can be confusing because they are produced *after* your Rust code has already compiled successfully—the problem is in the combination step, not in your code's logic.
- **Loader errors** happen at runtime: "file not found," "permission denied," "exec format error."

**Why this matters for Rust.** When you run `cargo build`, it invokes `rustc` (the Rust compiler), which uses LLVM as its optimizing back-end. `rustc` handles Stages 2–3 (parsing, type-checking, IR generation, and lowering to assembly). Then it invokes the system assembler (Stage 4) and linker (Stage 5). The loader is part of your OS and is invoked when you run the resulting binary.

When you see a linker error in Rust, you now know exactly where in the pipeline it occurs: after your Rust code has been compiled correctly, at the moment the compiler tries to combine your code with libraries. This is the first skill of Compiler Thinking: recognising which stage produced an error, and therefore what kind of problem you have.

:::

### Memory Layout of a Running Process

Now the linker has produced an executable. The loader has loaded it into memory and started it running. What does that memory look like?

A process's address space is conventionally drawn as a vertical strip, from low addresses at the bottom to high addresses at the top:

```
High addresses
┌─────────────────────────────────┐
│   Kernel space                  │  (not directly accessible to your
│                                 │   process—protected by hardware)
├─────────────────────────────────┤
│   Stack                         │  grows DOWNWARD
│   ↓                             │
│                                 │
│   ← function call frames        │
│   ← local variables             │
│   ← return addresses            │
│                                 │
├─────────────────────────────────┤
│                                 │
│   (unused gap)                  │
│                                 │
├─────────────────────────────────┤
│                                 │
│   ↑                             │
│   Heap                          │  grows UPWARD
│                                 │
│   ← dynamically allocated data  │
│   ← `Box<T>` in Rust            │
│   ← `malloc` in C               │
│                                 │
├─────────────────────────────────┤
│   BSS (Block Started by Symbol) │  uninitialised static data
│   ← uninitialised globals       │
│   ← static variables without    │
│     explicit initializers       │
├─────────────────────────────────┤
│   Data                          │  initialised static data
│   ← initialised globals         │
│   ← string literals             │ 
│   ← static variables with       │
│     explicit values             │
├─────────────────────────────────┤
│   Text (Code)                   │  the compiled machine instructions
│   ← the `.text` section         │  (typically read-only)
└─────────────────────────────────┘
Low addresses
```

#### The Stack

The stack stores function call frames—the return address, function arguments, and local variables for each active function call. Each time a function is called, a new frame is pushed onto the stack (the stack pointer register is decremented). When the function returns, its frame is popped (the stack pointer is restored). This is why stack allocation is fast: it is just moving a register.

Stack allocation has two critical properties:

1. **It is bounded.** The stack has a fixed maximum size (typically 8 MB on Linux). Allocating a large array on the stack (`let arr = [0u8; 10_000_000];`) can overflow the stack, causing a crash.

2. **It is tied to call scope.** A local variable exists only while its function is on the call stack. Returning a pointer to a stack-allocated variable is a dangling pointer—the memory no longer holds valid data once the function returns. Rust's borrow checker prevents this at compile time.

#### The Heap

The heap is for data whose lifetime outlives a single function call—data that must persist after the function that created it returns, or data whose size is not known at compile time.

Allocating on the heap is more expensive than the stack for two reasons:

1. **Bookkeeping.** The allocator must maintain a data structure tracking which blocks of heap memory are free and which are in use. Finding a free block of the right size takes time.

2. **Indirection.** Accessing heap-allocated data requires following a pointer from the stack to the heap. This extra memory access has a cost, and more importantly, it has poor cache locality—the heap data is likely in a different cache line than the stack-resident pointer.

In unsafe languages, heap allocation is the primary source of memory bugs: use-after-free, double-free, and memory leaks. Rust's ownership system is specifically designed to make these bugs unrepresentable at compile time.

#### The Static Regions: Data and BSS

Global variables and static variables live in one of two regions:

- **Data**: initialised globals (`static FOO: i32 = 42;` in Rust, `int global = 42;` in C).
- **BSS**: uninitialised or zero-initialised globals (`static mut BAR: i32;` in Rust, `int global;` in C). The operating system zeroes the BSS region before the program starts, so you are guaranteed that uninitialised globals are zero, not random garbage.

These regions exist for the entire lifetime of the program. They are allocated when the process starts and freed when it exits.

#### The Text Region (Code)

The compiled machine instructions live in the text region. This region is typically read-only—the CPU can execute instructions from it, but the program cannot write to it. This is a security feature: it prevents a program from modifying its own code, which would be a vector for many types of attacks.

### Why This Matters for Rust

Three facts from this memory model are load-bearing for Rust's design:

**Fact 1: Stack allocation is just moving a pointer.**

Pushing a stack frame is nearly free—decrement (or increment, depending on convention) one register. This is why Rust prefers stack allocation by default. `Box::new` (heap allocation) is a deliberate, visible opt-in, not the default. You see a `Box` in your code and know that a heap allocation is occurring.

**Fact 2: Heap allocation requires bookkeeping.**

The allocator has to find a free block of the right size, track it, and later reclaim it. This is strictly more expensive than a stack push. It is also where use-after-free, double-free, and memory-leak bugs live in unsafe languages. Rust's ownership system exists specifically to make these bugs unrepresentable at compile time.

**Fact 3: A pointer is just a number.**

It is an address into this address space. Dereferencing an invalid pointer means asking the CPU to read or write memory your process does not own, or that no longer holds what you think it holds. This is undefined behaviour, not a well-defined error. The CPU will do whatever the bytes at that address happen to encode—which might be a crash, might be silent corruption, or might be code execution controlled by an attacker.

This single fact is the entire motivation for Rust's existence as a language.

:::worked-example

## Memory Trace

Let's apply the memory model to a concrete program. We'll use C for this example because it makes the memory regions visible—Rust abstracts them away with ownership, which you'll learn in Phase 1.

### The Program

```c
int global_counter = 0;

int increment(int n) {
    int doubled = n * 2;
    global_counter = global_counter + 1;
    return doubled;
}

int main() {
    int a = 5;
    int b = increment(a);
    int c = increment(b);
    return 0;
}
```

### Memory Trace

Let's trace this program's execution and classify every variable by memory region and lifetime.

**Global variables (Data region):**

- `global_counter` lives in the Data region (initialised static storage). It exists for the entire lifetime of the process.

**Local variables (Stack):**

| Variable | Region | Lifetime |
|---|---|---|
| `n` (parameter in `increment`) | Stack | Exists when `increment` is called, ceases when `increment` returns |
| `doubled` (local in `increment`) | Stack | Exists from declaration until `increment` returns |
| `a` (local in `main`) | Stack | Exists from declaration until `main` returns |
| `b` (local in `main`) | Stack | Exists from declaration until `main` returns |
| `c` (local in `main`) | Stack | Exists from declaration until `main` returns |

**Code (Text region):**

- The compiled instructions for `main` and `increment` live in the Text region. They exist for the entire lifetime of the process.

### Stack Diagram

Let's trace the stack frames as the program executes:

```
Time: Before main() is called

Stack: Empty

────────────────────────────────────────────────────────────

Time: main() is called. Frame for main is pushed.

Stack (grows downward):
┌───────────────────────┐
│ main() frame          │
│   a: 5                │
│   (return address)    │
│   (saved base pointer)│
└───────────────────────┘

────────────────────────────────────────────────────────────

Time: increment(a) is called. Frame for increment is pushed.

Stack (grows downward):
┌───────────────────────┐
│ increment() frame     │
│   n: 5 (parameter)    │
│   doubled: 10         │
│   (return address)    │
│   (saved base pointer)│
├───────────────────────┤
│ main() frame          │
│   a: 5                │
│   b: (unassigned)     │
│   (return address)    │
│   (saved base pointer)│
└───────────────────────┘

────────────────────────────────────────────────────────────

Time: increment(a) returns. Frame is popped.

Stack (grows downward):
┌───────────────────────┐
│ main() frame          │
│   a: 5                │
│   b: 10               │
│   (return address)    │
│   (saved base pointer)│
└───────────────────────┘

────────────────────────────────────────────────────────────

Time: increment(b) is called. Frame for increment is pushed.

Stack (grows downward):
┌───────────────────────┐
│ increment() frame     │
│   n: 10 (parameter)   │
│   doubled: 20         │
│   (return address)    │
│   (saved base pointer)│
├───────────────────────┤
│ main() frame          │
│   a: 5                │
│   b: 10               │
│   c: (unassigned)     │
│   (return address)    │
│   (saved base pointer)│
└───────────────────────┘

────────────────────────────────────────────────────────────

Time: increment(b) returns. Frame is popped.

Stack (grows downward):
┌───────────────────────┐
│ main() frame          │
│   a: 5                │
│   b: 10               │
│   c: 20               │
│   (return address)    │
│   (saved base pointer)│
└───────────────────────┘

────────────────────────────────────────────────────────────

Time: main() returns. Frame is popped.

Stack: Empty
```

### Global Counter Trace

`global_counter` starts at 0 and is modified by each call to `increment`:

1. Before any calls: `global_counter = 0`
2. After `increment(a)`: `global_counter = 1` (incremented inside the function)
3. After `increment(b)`: `global_counter = 2` (incremented inside the function)

### What This Tells Us About Safety

Notice what happens when `increment` returns: its stack frame is popped. The memory that held `n` and `doubled` is no longer considered part of the stack. The bytes are still physically present—nothing erases them—but they are now "available" for reuse by the next function call.

If you tried to return a pointer to `doubled` from `increment`, you would have a dangling pointer: the memory it points to would no longer be valid once the function returns. In C, the compiler would not stop you. In Rust, the borrow checker would reject the code at compile time.

This is why Phase 0 exists: to make you feel the absence of safety before you get the safety. When Phase 1 introduces Rust's ownership rules, you will understand why they exist—not as arbitrary restrictions, but as compile-time enforcement of the exact discipline you just traced by hand.

:::

:::compiler-thinking

The central skill of this phase is not memorising facts—it is building the habit of predicting, before any tool tells you, what a program's memory layout will be.

### Today's Exercise

Consider this C-like snippet:

```c
int global = 42;

void increment(int n) {
    int doubled = n * 2;
    global += 1;
}

int main() {
    int a = 5;
    increment(a);
    return 0;
}
```

**Question 1.** Where does each variable live—stack, heap, or static (data/BSS)?

<details>
<summary>Answer</summary>

- `global` lives in the **Data** region (initialised static storage). It exists for the entire lifetime of the program.
- `n` lives on the **Stack** (it is a function argument). It exists from the moment `increment` is called until it returns.
- `doubled` lives on the **Stack** (a local variable). It exists from its declaration until `increment` returns.
- `a` lives on the **Stack** (a local variable in `main`). It exists from its declaration until `main` returns.
</details>

---

**Question 2.** If you added `static int counter = 0;` at the top of the file, where would it live?

<details>
<summary>Answer</summary>

`counter` would live in the **BSS** region (uninitialised static storage). The operating system zeroes this region before the program starts, so `counter` is guaranteed to be 0 at program start.
</details>

---

**Question 3.** If you added `int *ptr = malloc(sizeof(int));` inside `main`, where would the pointer and the memory it points to live?

<details>
<summary>Answer</summary>

- The pointer `ptr` itself lives on the **Stack** (it is a local variable).
- The memory pointed to by `ptr` lives on the **Heap** (allocated via `malloc`).
</details>

:::

:::mini-challenge

### Challenge: Identify the Bug

The following C code has a serious bug. Identify where the bug is, which memory region is involved, and what would happen if this code ran.

```c
int* get_pointer() {
    int x = 42;
    return &x;
}

int main() {
    int *p = get_pointer();
    printf("%d\n", *p);
    return 0;
}
```

**Hint:** Think about where `x` lives and when it ceases to exist.

<details>
<summary>Solution</summary>

The bug is that `get_pointer` returns the address of a local variable `x`. `x` lives on the stack. When `get_pointer` returns, its stack frame is popped—`x` ceases to exist. The pointer `p` in `main` now points to memory that is no longer valid. This is a **dangling pointer**.

When `printf` tries to dereference `*p`, the behaviour is undefined. It might print `42` (if the bytes haven't been overwritten yet), or it might print garbage, or it might crash. The program compiles without errors but is incorrect.

Rust's borrow checker prevents this bug at compile time: you cannot return a reference to a stack-allocated variable.
</details>

:::

:::reflection

Write the answer to this question in a text file called `reflection-day1.md` in your `hello_reec` directory. Commit it.

**Question:** In the Opening Story, the `gets` function wrote past the end of the `name` buffer. Using the memory model from today's lesson, describe exactly what is happening: which memory region is being corrupted, and why the program might appear to work correctly before eventually failing?

<details>
<summary>Reflection Guidance</summary>

The `name[10]` buffer is allocated on the stack. It reserves 10 bytes. When `gets` writes more than 10 bytes, it continues writing past the end of the buffer into adjacent stack memory. The adjacent memory typically includes:

- The saved base pointer (which the function uses to restore the stack frame on return)
- The return address (which the CPU jumps to when the function returns)

If the overflow overwrites the return address, the CPU will jump to whatever address was written there. If the attacker controls that address, they can cause the program to execute arbitrary code. The program appears to work correctly for small inputs because the overflow doesn't reach the return address. It fails unpredictably for larger inputs because the return address is corrupted.

This is why bounds checking is essential. Rust's arrays and vectors perform bounds checking at runtime, and the borrow checker prevents returning pointers to stack variables.
</details>

:::

## End of Day 1

You now have:

- A working understanding of the six-stage compilation pipeline
- A complete mental model of process memory (stack, heap, data, BSS, text)
- An understanding of why Rust's ownership rules exist
- The habit of predicting memory layout before running code

**The engineering habit to carry forward:** before you write any code that uses pointers or references, ask yourself: *where does this data live? Who owns it? When does it go away?* This is the exact habit Rust's borrow checker will force on you starting in Phase 1.

**Next:** Day 2 covers the Unix toolchain, Git, and environment setup—the practical tools you will use for the next ten phases.
