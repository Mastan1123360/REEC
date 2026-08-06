---
id: P0-W1-D5
phase: 0
week: 1
day: 5
title: 'Manual Memory Trace: Stack Diagrams in Practice'
subtitle: Building the mental discipline to trace program execution by hand
estimated_time: 75
difficulty: Beginner
learning_objectives:
  - Draw complete stack diagrams for a multi-function program
  - Trace global state changes across function calls
  - 'Classify every variable by region, lifetime, and ownership'
  - Identify the exact moment each variable comes into and goes out of scope
  - Connect the manual trace to Rust's ownership and borrowing rules
  - Use the manual trace as a debugging and reasoning tool
widgets:
  - story
  - mental-model
  - worked-example
  - engineering-note
  - compiler-thinking
  - mini-challenge
  - reflection
project: null
failure_lab: P0-FL0
reading:
  - REEC-01b-FailureLab0.md (review)
tags:
  - memory-trace
  - stack
  - lifetimes
  - scope
  - manual-tracing
  - debugging
next: P0-W1-D6
previous: P0-W1-D4
published: true
---

:::story

## The "Printf" Debugger's Last Stand

A developer—let's call her Priya—was debugging a subtle bug in a Rust program. She had been at it for three hours.

The program was reading a file, parsing records, and building a data structure. The bug was intermittent: sometimes the data structure was correct, sometimes it was corrupted. Priya had added `println!` statements everywhere. She had run the program dozens of times. She had even tried the debugger, but the code was complex and the debugger was slow.

Nothing worked.

A senior engineer walked over and asked: "What does the stack look like at the point of failure?"

Priya stared blankly. She had never drawn a stack diagram by hand. She had never needed to.

The senior engineer sat down and, without running the code, traced the program's execution on a whiteboard—not just the function calls, but the exact memory layout of every frame. Within ten minutes, the bug was obvious: a pointer was being used after the data it pointed to had gone out of scope. The Rust compiler would have caught it, but the code was in an unsafe block. The borrow checker couldn't help.

Priya had spent three hours running code, and the senior engineer had spent ten minutes tracing it.

This is not because the senior engineer was smarter. It was because they had built the discipline of manual memory tracing—the ability to hold the complete state of a program in their mind, expressed as a stack diagram, and reason about its correctness without running it.

Today, you build that same discipline.

:::

:::mental-model

Before we dive into the tracing exercise, internalise these three mental models. They are the bridge between Day 1's abstract memory layout and Day 5's hands-on practice.

**Mental Model 1 — The stack diagram is the source of truth for function-local state.**

When you debug a program, you are trying to reconstruct what the stack looked like at the moment of failure. The stack diagram is a complete, unambiguous representation of:

- The call stack (which functions are active)
- The local variables in each frame
- The values of those variables
- The relationship between variables and memory regions

If you can draw the stack diagram for any execution point, you can reason about the program's state without running it. This is the foundation of manual debugging.

**Mental Model 2 — Every variable has a precise moment it comes into existence and a precise moment it ceases to exist.**

These moments are determined by scope:

- **Stack variables** come into existence when their declaration is executed and cease to exist when their scope (usually the function body) ends.
- **Heap allocations** come into existence when `Box::new`, `Vec::new`, or `String::new` is called and cease to exist when ownership ends (in Rust) or when `free` is called (in C).
- **Static variables** come into existence when the program starts and cease to exist when the program ends.

The moment a variable ceases to exist is the moment any pointer to it becomes dangling. Rust's borrow checker enforces that you cannot use a reference after the data it references has ceased to exist.

**Mental Model 3 — Manual tracing is a superpower because it forces you to make every assumption explicit.**

When you run code, the computer does the work for you. You can be lazy—you just observe the output and guess. When you trace the code by hand, you must resolve every ambiguity. You must decide exactly which instruction executes next. You must account for every memory write. You must track every variable's state.

This is uncomfortable at first. But it is precisely this discomfort that builds genuine understanding. When you can trace a program by hand, you are no longer at the mercy of the debugger or the println. You become the debugger.

:::

## Theory

### The Structure of a Stack Frame

Before we trace a full program, let's formalise what a stack frame contains.

```
┌─────────────────────────────────────────────────────────────┐
│                    STACK FRAME (x86-64)                     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  RSP ────▶  (low address)                          │   │
│  │            Local variables (N bytes)               │   │
│  │            (allocated at compile time)             │   │
│  │                                                   │   │
│  │            (unused padding for alignment)          │   │
│  │                                                   │   │
│  │            Saved RBP (base pointer)               │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │            Return address (RIP)                    │   │
│  │            (where to jump when function returns)   │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │            Function arguments (if not in regs)    │   │
│  │            (passed on the stack)                   │   │
│  └─────────────────────────────────────────────────────┘   │
│  RBP ────▶  (high address)                                 │
└─────────────────────────────────────────────────────────────┘
```

**Key observations:**

1. **The frame is allocated when the function is called.** The stack pointer (`RSP`) is decremented by the total size of all local variables plus padding.

2. **Local variables are accessed relative to the base pointer (`RBP`).** In x86-64, `RBP` is typically used as the "frame pointer" that remains constant while the stack pointer changes (e.g., during function calls inside the function). `RBP - 8` might be one local variable, `RBP - 16` another.

3. **The return address is pushed by the `CALL` instruction.** The CPU automatically pushes the address of the next instruction onto the stack before jumping to the function.

4. **The frame is deallocated when the function returns.** The `RET` instruction pops the return address and jumps to it. The stack pointer is restored to its previous value.

5. **The bytes are not erased.** The memory remains with whatever bytes were last written. This is why dangling pointers can read old data—the bytes are still there until overwritten.

### The Call Stack in Action

When a function is called, the call stack grows:

```
Before call:
┌─────────────────────┐
│ main frame           │
│   x: 5               │
│   (return address)   │
└─────────────────────┘

During call:
┌─────────────────────┐
│ foo frame            │  ← RSP
│   y: 10              │
│   (return address)   │
├─────────────────────┤
│ main frame           │  ← RBP
│   x: 5               │
│   (return address)   │
└─────────────────────┘

After return:
┌─────────────────────┐
│ main frame           │  ← RSP
│   x: 5               │
│   (return address)   │
└─────────────────────┘
```

The stack grows downward. The top of the stack (lowest address) is the most recent frame.

### The `global_counter` Trace

Now let's trace a program that combines stack, static, and global state. This is the program we will trace in the worked example:

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

We traced the memory regions in Day 1. Now we will trace the execution step-by-step, drawing the stack at each significant moment.

---

:::worked-example

## Complete Stack Trace of the `global_counter` Program

### Step 1: Program Starts

The loader loads the program into memory. `global_counter` is in the Data region, initialised to 0.

```
Memory Layout:
┌─────────────────────────────────────────────────────────┐
│ Text: instructions for main and increment              │
├─────────────────────────────────────────────────────────┤
│ Data: global_counter = 0                              │
├─────────────────────────────────────────────────────────┤
│ BSS: (empty)                                          │
├─────────────────────────────────────────────────────────┤
│ Heap: (empty)                                         │
├─────────────────────────────────────────────────────────┤
│ Stack: (empty)                                        │
└─────────────────────────────────────────────────────────┘
```

---

### Step 2: `main()` is Called

The `main` function is called by the runtime. A frame for `main` is pushed onto the stack.

```
┌─────────────────────────────────────────────────────────┐
│ Stack:                                                │
│ ┌───────────────────────────────────────────────────┐ │
│ │  main frame                                      │ │
│ │    a: 5                                          │ │
│ │    b: (unassigned)                               │ │
│ │    c: (unassigned)                               │ │
│ │    (return address: _start)                      │ │
│ │    (saved RBP)                                   │ │
│ └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

global_counter = 0 (unchanged)
```

**Key observation:** `a` has been assigned `5`. `b` and `c` are unassigned. They have stack space reserved but no meaningful value yet.

---

### Step 3: `increment(a)` is Called

The function call pushes a new frame for `increment` on top of the stack. The argument `a` (value `5`) is passed in the `RDI` register (or on the stack, depending on the calling convention).

```
┌─────────────────────────────────────────────────────────┐
│ Stack:                                                │
│ ┌───────────────────────────────────────────────────┐ │
│ │  increment frame                                 │ │
│ │    n: 5 (argument, likely in RDI)                │ │
│ │    doubled: (unassigned until computed)          │ │
│ │    (return address: return to main)              │ │
│ │    (saved RBP)                                   │ │
│ ├───────────────────────────────────────────────────┤ │
│ │  main frame                                      │ │
│ │    a: 5                                          │ │
│ │    b: (unassigned)                               │ │
│ │    c: (unassigned)                               │ │
│ │    (return address: _start)                      │ │
│ │    (saved RBP)                                   │ │
│ └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

global_counter = 0 (unchanged)
```

**Key observation:** The `increment` frame sits on top of the `main` frame. The argument `n` holds the value `5`.

---

### Step 4: `doubled = n * 2` is Executed

The CPU multiplies `n` (5) by 2 and stores the result in `doubled`.

```
┌─────────────────────────────────────────────────────────┐
│ Stack:                                                │
│ ┌───────────────────────────────────────────────────┐ │
│ │  increment frame                                 │ │
│ │    n: 5                                           │ │
│ │    doubled: 10                                   │ │
│ │    (return address: return to main)              │ │
│ │    (saved RBP)                                   │ │
│ ├───────────────────────────────────────────────────┤ │
│ │  main frame                                      │ │
│ │    a: 5                                          │ │
│ │    b: (unassigned)                               │ │
│ │    c: (unassigned)                               │ │
│ │    (return address: _start)                      │ │
│ │    (saved RBP)                                   │ │
│ └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

global_counter = 0 (unchanged)
```

---

### Step 5: `global_counter = global_counter + 1` is Executed

The CPU reads `global_counter` (0), adds 1, and writes the result back to `global_counter`.

```
┌─────────────────────────────────────────────────────────┐
│ Stack:                                                │
│ ┌───────────────────────────────────────────────────┐ │
│ │  increment frame                                 │ │
│ │    n: 5                                           │ │
│ │    doubled: 10                                   │ │
│ │    (return address: return to main)              │ │
│ │    (saved RBP)                                   │ │
│ ├───────────────────────────────────────────────────┤ │
│ │  main frame                                      │ │
│ │    a: 5                                          │ │
│ │    b: (unassigned)                               │ │
│ │    c: (unassigned)                               │ │
│ │    (return address: _start)                      │ │
│ │    (saved RBP)                                   │ │
│ └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

global_counter = 1 (updated)
```

---

### Step 6: `increment(a)` Returns

The `increment` function returns the value in `doubled` (10). The CPU pops the `increment` frame off the stack and jumps back to `main`.

```
┌─────────────────────────────────────────────────────────┐
│ Stack:                                                │
│ ┌───────────────────────────────────────────────────┐ │
│ │  main frame                                      │ │
│ │    a: 5                                          │ │
│ │    b: 10                                         │ │
│ │    c: (unassigned)                               │ │
│ │    (return address: _start)                      │ │
│ │    (saved RBP)                                   │ │
│ └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

global_counter = 1
```

**Key observation:** The `increment` frame is gone. The return value (10) is now stored in `b`.

**Crucial note:** The memory that held the `increment` frame still contains the bytes that were there. The stack pointer has moved, but the bytes are still physically present. This is why a dangling pointer into that memory would read 10, even though `n` and `doubled` no longer exist.

---

### Step 7: `increment(b)` is Called

The `main` function calls `increment` with `b` (10) as the argument. A new `increment` frame is pushed on the stack.

```
┌─────────────────────────────────────────────────────────┐
│ Stack:                                                │
│ ┌───────────────────────────────────────────────────┐ │
│ │  increment frame                                 │ │
│ │    n: 10                                          │ │
│ │    doubled: (unassigned)                         │ │
│ │    (return address: return to main)              │ │
│ │    (saved RBP)                                   │ │
│ ├───────────────────────────────────────────────────┤ │
│ │  main frame                                      │ │
│ │    a: 5                                          │ │
│ │    b: 10                                         │ │
│ │    c: (unassigned)                               │ │
│ │    (return address: _start)                      │ │
│ │    (saved RBP)                                   │ │
│ └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

global_counter = 1
```

**Key observation:** A new `increment` frame is created. The old `increment` frame's memory may still exist, but it is now overwritten as the new frame is allocated.

---

### Step 8: Second `increment` Executes

The second call executes. `doubled` is computed (20), and `global_counter` is incremented to 2.

```
┌─────────────────────────────────────────────────────────┐
│ Stack:                                                │
│ ┌───────────────────────────────────────────────────┐ │
│ │  increment frame                                 │ │
│ │    n: 10                                          │ │
│ │    doubled: 20                                   │ │
│ │    (return address: return to main)              │ │
│ │    (saved RBP)                                   │ │
│ ├───────────────────────────────────────────────────┤ │
│ │  main frame                                      │ │
│ │    a: 5                                          │ │
│ │    b: 10                                         │ │
│ │    c: (unassigned)                               │ │
│ │    (return address: _start)                      │ │
│ │    (saved RBP)                                   │ │
│ └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

global_counter = 2 (updated)
```

---

### Step 9: Second `increment` Returns

The second `increment` returns 20, which is stored in `c`.

```
┌─────────────────────────────────────────────────────────┐
│ Stack:                                                │
│ ┌───────────────────────────────────────────────────┐ │
│ │  main frame                                      │ │
│ │    a: 5                                          │ │
│ │    b: 10                                         │ │
│ │    c: 20                                         │ │
│ │    (return address: _start)                      │ │
│ │    (saved RBP)                                   │ │
│ └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

global_counter = 2
```

---

### Step 10: `main()` Returns

The `main` function returns. The program exits.

```
┌─────────────────────────────────────────────────────────┐
│ Stack: (empty)                                        │
└─────────────────────────────────────────────────────────┘

global_counter = 2 (still in memory, but program is ending)
```

### Complete Variable Table

At the end of the trace:

| Variable | Region | Lifetime | Final Value |
|---|---|---|---|
| `global_counter` | Data | Program lifetime | 2 |
| `a` (in `main`) | Stack | `main`'s lifetime | 5 |
| `b` (in `main`) | Stack | `main`'s lifetime | 10 |
| `c` (in `main`) | Stack | `main`'s lifetime | 20 |
| `n` (first call) | Stack | First `increment` call | 5 (then destroyed) |
| `doubled` (first) | Stack | First `increment` call | 10 (then destroyed) |
| `n` (second call) | Stack | Second `increment` call | 10 (then destroyed) |
| `doubled` (second) | Stack | Second `increment` call | 20 (then destroyed) |

---

### Connection to Rust's Ownership Model

Now consider how this trace changes in Rust. In Rust:

1. **Each value has exactly one owner.** In the C version, `global_counter` is shared across all functions. In Rust, sharing mutable state requires `Mutex<T>` or `RefCell<T>`.

2. **Ownership is tied to scope.** When a variable goes out of scope, it is dropped. This is the Rust equivalent of the stack frame being popped—but Rust adds the concept of `Drop` to clean up heap resources.

3. **References are not owners.** Borrowing a value means you cannot drop it while the reference exists. This prevents the dangling pointer bug.

4. **Lifetimes ensure references outlive the data they reference.** The manual trace of stack frames is exactly what Rust's borrow checker computes at compile time.

**The connection:** If you can trace the stack by hand, you can predict Rust's borrow-checker errors before the compiler tells you. This is the deepest reason Phase 0 exists: to build the mental model that makes Rust's rules feel natural rather than arbitrary.

:::

:::engineering-note

**Why manual tracing beats println debugging.**

When you use `println!` to debug, you are asking the program to tell you its state. This works for simple bugs, but it fails for:

1. **Intermittent bugs**—the print statements themselves can change the timing, masking the bug.
2. **Complex bugs**—there are too many states to print, and you can't see the pattern.
3. **Bugs in unsafe code**—the print statements might dereference invalid pointers, crashing the program.

Manual tracing forces you to reason about the entire state of the program. It is slower upfront but faster overall. It builds your mental model rather than papering over gaps in it.

**The professional debugger's hierarchy:**

1. **Can you reason about the bug without running the code?** (Manual trace)
2. **Can you add `println!` or `dbg!` to confirm your hypothesis?**
3. **Can you use a debugger to step through the code?**
4. **Can you add more instrumentation and re-run?**

Manual tracing is the highest level of the hierarchy. It is the skill that distinguishes senior engineers from juniors.

:::

:::compiler-thinking

**Prediction 1:**

Consider this Rust code:

```rust
fn main() {
    let x = 5;
    let y = 10;
    let z = x + y;
    println!("{}", z);
}
```

Draw the stack diagram at the point after `z` is computed, before `println!` is called. Where does each variable live? What is its lifetime?

<details>
<summary>Answer</summary>

```
┌─────────────────────────────────────────────────────────┐
│ Stack:                                                │
│ ┌───────────────────────────────────────────────────┐ │
│ │  main frame                                      │ │
│ │    x: 5                                          │ │
│ │    y: 10                                         │ │
│ │    z: 15                                         │ │
│ │    (return address: _start)                      │ │
│ │    (saved RBP)                                   │ │
│ └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

All three variables live on the stack. They exist for the entire execution of `main`. This is a simple, safe pattern—no references, no heap allocation.
</details>

---

**Prediction 2:**

Consider this C code:

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

Draw the stack diagram at the point after `get_pointer` returns, before `printf` is called. What is wrong with this program?

<details>
<summary>Answer</summary>

```
┌─────────────────────────────────────────────────────────┐
│ Stack:                                                │
│ ┌───────────────────────────────────────────────────┐ │
│ │  main frame                                      │ │
│ │    p: 0x7FFFFFFF... (address of x)               │ │
│ │    (return address: _start)                      │ │
│ │    (saved RBP)                                   │ │
│ └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**What is wrong:** `x` was allocated on the stack in `get_pointer`. When `get_pointer` returned, its frame was popped. The memory that held `x` is now invalid. `p` points to invalid memory.

When `printf` tries to read `*p`, it will read whatever bytes happen to be at that address. This is undefined behaviour. Rust's borrow checker would reject this code at compile time.
</details>

---

**Prediction 3:**

Rust's ownership model is designed to prevent exactly the bug in Prediction 2. How would this code look in Rust, and why would it fail to compile?

<details>
<summary>Answer</summary>

```rust
fn get_pointer() -> &i32 {
    let x = 42;
    &x
}

fn main() {
    let p = get_pointer();
    println!("{}", p);
}
```

This code would fail to compile with:

```
error[E0106]: missing lifetime specifier
 --> src/main.rs:1:25
  |
1 | fn get_pointer() -> &i32 {
  |                       ^ expected named lifetime parameter
  |
  = help: this function's return type contains a borrowed value, but there is no value for it to be borrowed from
```

The compiler knows that `x` is a stack-local variable. It also knows that returning a reference to it is invalid. It rejects the code at compile time.

**The connection:** The manual trace you just did is what the borrow checker does at compile time. By tracing by hand, you are training yourself to think like the borrow checker.

</details>

:::

:::mini-challenge

### Challenge 1 — Trace This Program

Draw the stack diagram for this program at the point after `b` is assigned, before `increment` is called.

```c
int counter = 0;

void increment(int n) {
    counter += n;
}

int main() {
    int a = 5;
    int b = a + 2;
    increment(b);
    return 0;
}
```

What does the stack look like? Where does each variable live?

<details>
<summary>Answer</summary>

At the point after `b` is assigned, before `increment` is called:

```
┌─────────────────────────────────────────────────────────┐
│ Stack:                                                │
│ ┌───────────────────────────────────────────────────┐ │
│ │  main frame                                      │ │
│ │    a: 5                                          │ │
│ │    b: 7                                          │ │
│ │    (return address: _start)                      │ │
│ │    (saved RBP)                                   │ │
│ └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

counter = 0 (Data region)
```

`counter` is a global variable in the Data region. `a` and `b` are stack-local variables.
</details>

---

### Challenge 2 — The Recursive Case

Draw the stack diagram for this recursive function after three calls to `factorial`, before any returns occur.

```c
int factorial(int n) {
    if (n <= 1) {
        return 1;
    }
    return n * factorial(n - 1);
}

int main() {
    int result = factorial(3);
    return 0;
}
```

How many frames are on the stack? What does each frame contain?

<details>
<summary>Answer</summary>

After three calls to `factorial` (i.e., at the deepest point, before returning from the base case):

```
┌─────────────────────────────────────────────────────────┐
│ Stack:                                                │
│ ┌───────────────────────────────────────────────────┐ │
│ │  factorial(1) frame                              │ │
│ │    n: 1                                          │ │
│ │    (return address: return to factorial(2))      │ │
│ │    (saved RBP)                                   │ │
│ ├───────────────────────────────────────────────────┤ │
│ │  factorial(2) frame                              │ │
│ │    n: 2                                          │ │
│ │    (return address: return to factorial(3))      │ │
│ │    (saved RBP)                                   │ │
│ ├───────────────────────────────────────────────────┤ │
│ │  factorial(3) frame                              │ │
│ │    n: 3                                          │ │
│ │    (return address: return to main)              │ │
│ │    (saved RBP)                                   │ │
│ ├───────────────────────────────────────────────────┤ │
│ │  main frame                                      │ │
│ │    result: (unassigned)                          │ │
│ │    (return address: _start)                      │ │
│ │    (saved RBP)                                   │ │
│ └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

There are 4 frames on the stack: `main`, `factorial(3)`, `factorial(2)`, and `factorial(1)`.

**Key observation:** Each recursive call adds a new frame. The stack grows deeper with each call. If the recursion is too deep, the stack will overflow.
</details>

---

### Challenge 3 — Rust's Borrow Checker, Applied

Given this invalid Rust code, draw the stack diagram that would exist at the point the borrow checker would reject it.

```rust
fn get_first(vec: &Vec<i32>) -> &i32 {
    &vec[0]
}

fn main() {
    let v = vec![1, 2, 3];
    let first = get_first(&v);
    // v would go out of scope here in a real program, but the borrow checker rejects it earlier
}
```

Why does the borrow checker reject this code? Where is the ownership problem?

<details>
<summary>Answer</summary>

The borrow checker rejects this code because `first` is a reference to an element of `v`. `v` is dropped at the end of `main`, but `first` still exists. The reference would be dangling.

The stack diagram at the point of the borrow checker's analysis:

```
┌─────────────────────────────────────────────────────────┐
│ Stack:                                                │
│ ┌───────────────────────────────────────────────────┐ │
│ │  main frame                                      │ │
│ │    v: (pointer, length, capacity)                │ │
│ │    first: &i32 (borrow of v's element)           │ │
│ │    (return address: _start)                      │ │
│ │    (saved RBP)                                   │ │
│ └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

Heap (v's data):
[1, 2, 3] (owned by v)

Borrow relationship:
v owns the heap data.
first borrows a reference to the first element of v's data.
first's borrow must be valid for as long as the data exists.
v will be dropped at the end of main, but first still needs to exist.
This is a lifetime violation.
```

**The solution:** In Rust, you must ensure that all references are valid for their entire lifetime. This code compiles if the reference `first` is used before `v` goes out of scope.
</details>

:::

:::reflection

Write the answer to this question in a text file called `reflection-day5.md` in your `hello_reec` directory. Commit it.

**Question:**

"Reflect on the experience of tracing the `global_counter` program by hand. At first, it probably felt tedious—why not just run the code and see what it does? Now, after having done the trace, what did you learn that running the code would not have taught you? Why is the ability to trace by hand a superpower for debugging complex systems, and how does it connect to Rust's borrow checker?"

<details>
<summary>Reflection Guidance</summary>

Running the code tells you *what* happens. Tracing by hand tells you *why* it happens. When you run the code, you see the final state. When you trace by hand, you see the entire progression—the creation and destruction of each frame, the exact moment each variable comes into existence and goes out of scope.

This is the superpower: you can reason about the program without executing it. You can predict bugs before they happen. You can understand the compiler's error messages because you know what the compiler is checking.

The connection to Rust's borrow checker is direct. The borrow checker is, in essence, automating this manual tracing. It tracks ownership, lifetimes, and references. When you understand the manual trace, you understand what the borrow checker is doing—and why its rules exist.
</details>

:::

## End of Day 5

### What You Have Accomplished

By the end of this session, you have:

- **Mastered the skill of drawing stack diagrams** for real programs.
- **Traced a complete program** with global state and multiple function calls.
- **Identified the exact lifetime of every variable** in the trace.
- **Connected the manual trace to Rust's ownership and borrowing rules.**
- **Built the discipline to reason about programs without running them.**

### What This Builds Toward

Day 5 completes the first week of Phase 0. You have now:

- **Day 1:** Understood the compilation pipeline and memory layout.
- **Day 2:** Learned the Unix toolchain, Git, and the engineering workspace.
- **Day 3:** Explored the binary interface and how CPUs execute instructions.
- **Day 4:** Diagnosed broken mental models in Failure Lab 0.
- **Day 5:** Practiced manual memory tracing on real programs.

**Tomorrow, Day 6, is your Engineering Review day.** You will:

- **Review all the concepts from the week** with a self-assessment.
- **Complete the Documentation Deliverables** for Phase 0.
- **Finalise your Engineering Environment Repository.**
- **Reflect on the week's learning** and prepare for Phase 1.

**The skill you have built this week is the foundation for everything that follows.** When Phase 1 introduces Rust's ownership, borrowing, and lifetimes, you will not see arbitrary rules. You will see the same physical reality you have been tracing by hand—now enforced by the compiler.

Take 5-10 minutes to rest your mind. Tomorrow, you consolidate everything you have learned.
