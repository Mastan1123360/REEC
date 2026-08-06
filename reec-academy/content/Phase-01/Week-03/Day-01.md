---
id: P1-W3-D1
phase: 1
week: 3
day: 1
title: Ownership and Move Semantics
subtitle: Rust's answer to the heap bookkeeping problem
estimated_time: 75
difficulty: Beginner
learning_objectives:
  - Explain what ownership means in Rust and why it exists
  - Understand move semantics and what happens when a value is moved
  - Distinguish between types that implement Copy and types that don't
  - 'Predict when a value will be moved, copied, or dropped'
  - Connect Rust's ownership model to the memory model from Phase 0
  - Write code that uses ownership correctly
widgets:
  - story
  - mental-model
  - worked-example
  - engineering-note
  - compiler-thinking
  - mini-challenge
  - reflection
project:
  - Calculator CLI (Milestone 1 — planning)
failure_lab: null
reading:
  - 'The Rust Programming Language, Chapter 4 (Understanding Ownership)'
  - REEC-05-Phase1-RustFoundations.md §1.3.1 (Theory)
tags:
  - ownership
  - move-semantics
  - memory-safety
  - copy
  - drop
next: P1-W3-D2
previous: P0-W2-D7
published: true
---

:::story

## The Memory Mystery

A developer—call him Mateo—had been writing Rust for about a month. He understood the syntax. He could make his code compile. But he was still confused by ownership errors.

He wrote a function to read a file and return its contents:

```rust
fn read_file(path: &str) -> String {
    let contents = std::fs::read_to_string(path).unwrap();
    contents
}

fn main() {
    let text = read_file("hello.txt");
    println!("{}", text);
}
```

It worked. But he couldn't shake the feeling that he didn't understand *why* it worked. Why could he return `contents` from the function? Why didn't the memory get freed when `read_file` returned?

He tried the same thing with a reference:

```rust
fn read_file_ref(path: &str) -> &String {
    let contents = std::fs::read_to_string(path).unwrap();
    &contents
}
```

This time the compiler rejected it:

```
error[E0515]: cannot return value referencing local variable `contents`
```

But why? It was the same pattern—returning a value. Except now he was trying to return a *reference* to a local variable. The compiler's error message said something about "borrowed value does not live long enough."

Mateo had no idea what that meant. He knew Rust was trying to prevent memory errors, but he didn't understand how.

This is the problem with learning ownership by trial and error. You end up with a mental model based on compiler messages, not based on the *reality* of how memory works. You learn to make the compiler happy, but you don't learn why the compiler cares.

Today, you learn why.

:::

:::mental-model

Before we dive into the details, internalise these three mental models. They connect Rust's ownership rules directly to the memory model you built in Phase 0.

**Mental Model 1 — Ownership is Rust's compile-time solution to the heap bookkeeping problem.**

Recall Phase 0's lesson: heap allocation requires bookkeeping. Someone must know when to reclaim the memory. Rust's answer: track exactly one owner for each value, at compile time. When the owner goes out of scope, the memory is reclaimed.

This is not a language feature. It is a systems design. Rust is not "checking ownership." It is enforcing, at compile time, the exact discipline you traced by hand in Phase 0.

**Mental Model 2 — Moving a value copies the stack data but invalidates the source.**

In Phase 0, you learned that a `String` has three stack fields (pointer, length, capacity) and a heap buffer containing the actual text.

When you assign `b = a`, Rust copies the stack fields (pointer, length, capacity) and invalidates `a`. The heap data is not copied. This is a *move*, not a *copy*. The old variable cannot be used again because the heap data now has only one owner.

**Mental Model 3 — Copy types are different because the entire value fits on the stack.**

Some types, like `i32`, `bool`, and `char`, store all their data on the stack. There is no heap data to bookkeep. Copying the stack bytes is cheap and safe.

These types implement the `Copy` trait. When you assign `b = a`, the stack bytes are copied, and both `a` and `b` remain valid. There is no need to invalidate `a` because there is no heap data to manage.

This is not a special case. It is a direct consequence of the memory model. If a value has heap data, it cannot be `Copy`. If it doesn't, it can.

:::

## Theory

### Ownership: The Mental Model

**The fundamental rule:**

> "Every value has exactly one owner, and when the owner goes out of scope, the value is dropped."

This is Rust's answer to the heap bookkeeping problem. It says:

- Exactly one variable is responsible for each value.
- When that variable goes out of scope, the value is freed.
- The compiler enforces this—you cannot compile code that violates it.

**Why this matters:**

In C, you must call `free()` manually. If you forget, you leak memory. If you call it twice, you double-free. If you use the pointer after freeing, you have a use-after-free.

In Java, JavaScript, and other garbage-collected languages, the runtime tracks memory usage and frees it automatically. But the runtime is unpredictable. Pauses can happen at any time.

Rust does neither. It tracks ownership at compile time. The `drop` function is called automatically when the owner goes out of scope. There is no runtime overhead. There is no manual bookkeeping. The compiler guarantees that memory is freed correctly.

### Move Semantics

```rust
let a = String::from("hello");
let b = a;
// a is no longer valid here
println!("{}", a); // compiler error!
```

**What happens:**

1. The `String` is allocated on the heap.
2. `a` owns the `String`—it has the pointer, length, and capacity.
3. `b = a` copies the stack data (pointer, length, capacity) into `b`.
4. `a` is invalidated. It can no longer be used.
5. The heap data now has only one owner: `b`.

**Why this is necessary:**

If both `a` and `b` owned the heap data, two variables would try to free the same memory when they go out of scope. This would be a double-free bug.

By invalidating `a`, Rust ensures there is only one owner. When `b` goes out of scope, the heap data is freed exactly once.

**Visual representation:**

```
Before move:
Stack (a)                 Heap
┌─────────────────┐       ┌──────────────────┐
│ ptr ─────────────┼──────▶│ "hello"          │
│ len: 5           │       └──────────────────┘
│ cap: 5           │
└─────────────────┘

After `let b = a`:
Stack (a) [INVALID]        Heap
┌─────────────────┐       ┌──────────────────┐
│ ptr ─────────────┼──────▶│ "hello"          │
│ len: 5           │       └──────────────────┘
│ cap: 5           │
└─────────────────┘
Stack (b)
┌─────────────────┐
│ ptr ─────────────┼──────▶ (same heap data)
│ len: 5           │
│ cap: 5           │
└─────────────────┘
```

### The Copy Trait

```rust
let a = 5;
let b = a;
// a is still valid here
println!("{}", a); // 5
```

**Why this works:**

`i32` implements the `Copy` trait. This means the entire value fits on the stack. There is no heap data to manage.

When `b = a`, the stack bytes are copied. Both `a` and `b` are valid. When they go out of scope, there is no heap data to free.

**Which types implement Copy:**

- All integer types (`i8`, `u8`, `i16`, `u16`, `i32`, `u32`, `i64`, `u64`, etc.)
- All floating-point types (`f32`, `f64`)
- `bool`
- `char`
- Tuples of `Copy` types (`(i32, bool)` is `Copy`; `(i32, String)` is not)

**Types that do not implement Copy:**

- `String`
- `Vec<T>`
- `Box<T>`
- Any type that owns heap data

### The Drop Trait

When a value goes out of scope, Rust automatically calls the `drop` function. This is how heap memory is reclaimed.

```rust
fn main() {
    {
        let s = String::from("hello");
        // s is valid here
    } // s goes out of scope. drop is called. Memory is freed.
    // s is no longer valid here
}
```

`drop` is called automatically. You don't need to call it manually. This is Rust's equivalent of RAII (Resource Acquisition Is Initialization) from C++.

### Ownership and Functions

Passing a value to a function moves ownership, unless the type implements `Copy`.

```rust
fn take_ownership(s: String) {
    // s owns the String
    println!("{}", s);
} // s goes out of scope. drop is called.

fn main() {
    let s = String::from("hello");
    take_ownership(s);
    // s is no longer valid here
}
```

If you want to use `s` after calling `take_ownership`, you need to borrow it (covered tomorrow) or return ownership.

```rust
fn take_and_give_back(s: String) -> String {
    println!("{}", s);
    s // return ownership to the caller
}

fn main() {
    let s = String::from("hello");
    let s = take_and_give_back(s);
    println!("{}", s); // s is valid again
}
```

### The Three Questions

Every time you write code that involves a value, ask yourself:

1. **Where does this data live?** Stack or heap?
2. **Who owns this value?** Which variable is responsible?
3. **When does it go away?** When does the owner go out of scope?

This is the same habit Phase 0 built. Rust makes it explicit. The compiler enforces it. But the questions are the same.

---

## Worked Example

### Tracing a Rust Program by Hand

Let's trace a Rust program using the same discipline you developed in Phase 0.

```rust
fn main() {
    let a = String::from("hello");
    let b = a;
    let c = String::from("world");
    let d = c;
    println!("{}, {}", b, d);
}
```

**Step 1: `let a = String::from("hello")`**

```
Stack: a (ptr → heap "hello", len: 5, cap: 5)
Heap:  "hello"
```

**Step 2: `let b = a`** — move ownership from `a` to `b`

```
Stack: a [INVALID]
        b (ptr → heap "hello", len: 5, cap: 5)
Heap:  "hello"
```

**Step 3: `let c = String::from("world")`**

```
Stack: a [INVALID]
        b (ptr → heap "hello", len: 5, cap: 5)
        c (ptr → heap "world", len: 5, cap: 5)
Heap:  "hello"
       "world"
```

**Step 4: `let d = c`** — move ownership from `c` to `d`

```
Stack: a [INVALID]
        b (ptr → heap "hello", len: 5, cap: 5)
        c [INVALID]
        d (ptr → heap "world", len: 5, cap: 5)
Heap:  "hello"
       "world"
```

**Step 5: `println!("{}, {}", b, d)`** — b and d are valid; a and c are not

```
Stack: a [INVALID]
        b (ptr → heap "hello", len: 5, cap: 5)
        c [INVALID]
        d (ptr → heap "world", len: 5, cap: 5)
Heap:  "hello"
       "world"
```

**Step 6: main ends** — b and d go out of scope; heap memory is freed

```
Stack: (empty)
Heap:  (empty)
```

### Move Semantics in Functions

```rust
fn print_string(s: String) {
    println!("{}", s);
} // s is dropped here

fn main() {
    let s = String::from("hello");
    print_string(s);
    // s is no longer valid here
    // println!("{}", s); // would be a compiler error
}
```

**Step 1: `let s = String::from("hello")`**

```
Stack: s (ptr → heap "hello", len: 5, cap: 5)
Heap:  "hello"
```

**Step 2: `print_string(s)`** — ownership moves from `s` to the function's parameter

```
Stack: s [INVALID]
        (function frame) s_param (ptr → heap "hello", len: 5, cap: 5)
Heap:  "hello"
```

**Step 3: `println!("{}", s_param)`**

```
Stack: s [INVALID]
        (function frame) s_param (ptr → heap "hello", len: 5, cap: 5)
Heap:  "hello"
```

**Step 4: `print_string` returns** — `s_param` goes out of scope; heap memory is freed

```
Stack: s [INVALID]
Heap:  (empty)
```

**Step 5: main continues** — `s` is still invalid; cannot be used

---

## Engineering Notes

### Engineering Note: Why Ownership Exists

Ownership exists because Rust is a systems programming language that does not use a garbage collector. Without ownership, Rust would have to choose between:

1. **Manual memory management (C/C++):** Fast but error-prone. Use-after-free, double-free, and memory leaks are common.

2. **Garbage collection (Java, Go):** Safe but unpredictable. Pauses can happen at any time. Runtime overhead.

3. **Reference counting (Python, Swift):** Predictable but has overhead. Cycles cause memory leaks.

Rust's ownership model is a different approach: compile-time memory management. The compiler tracks ownership and lifetime, and inserts `drop` calls automatically. The result is memory safety without garbage collection.

### Engineering Note: Move Semantics and Performance

Move semantics are not just about safety. They are also about performance.

When you move a `String`, Rust copies the stack data (pointer, length, capacity) but does not copy the heap data. The heap data is never duplicated. This means moves are O(1) operations, regardless of the size of the heap data.

By contrast, a deep copy (`.clone()`) copies the heap data. This is O(n), where n is the size of the data.

This is why Rust moves by default. You get both safety and performance.

### Common Mistake: Reaching for `.clone()` Too Early

When the compiler complains about a move, beginners often reach for `.clone()` to make the error go away. This is a mistake.

```rust
fn process(s: String) {
    // ... do something with s
}

fn main() {
    let s = String::from("hello");
    process(s.clone()); // this makes a full copy
    println!("{}", s); // s is still valid because we cloned it
}
```

This works, but it's inefficient. The `.clone()` creates a full copy of the heap data. If you're calling this function many times, you will pay a performance cost.

A better approach is to change the function to borrow instead:

```rust
fn process(s: &String) {
    // ... do something with s
}

fn main() {
    let s = String::from("hello");
    process(&s); // no copy, just a reference
    println!("{}", s); // s is still valid
}
```

Or to take ownership and return it:

```rust
fn process(s: String) -> String {
    // ... do something with s
    s // return ownership to the caller
}

fn main() {
    let s = String::from("hello");
    let s = process(s); // ownership moves to process and back to s
    println!("{}", s); // s is valid again
}
```

The borrow approach is covered tomorrow. For now, remember: `.clone()` is a tool, not a default.

---

## Compiler Thinking

**Prediction 1:**

Will this code compile?

```rust
let a = String::from("hello");
let b = a;
println!("{}", a);
```

<details>
<summary>Answer</summary>

**No.** `a` is moved to `b` on line 2. `a` is no longer valid. The compiler error is:

```
error[E0382]: borrow of moved value: `a`
```

</details>

---

**Prediction 2:**

Will this code compile?

```rust
let a = 5;
let b = a;
println!("{}", a);
```

<details>
<summary>Answer</summary>

**Yes.** `i32` implements `Copy`. `a` is copied, not moved. Both `a` and `b` are valid.

</details>

---

**Prediction 3:**

Will this code compile?

```rust
fn take(s: String) {}

fn main() {
    let s = String::from("hello");
    take(s);
    println!("{}", s);
}
```

<details>
<summary>Answer</summary>

**No.** `s` is moved into `take`. After the call, `s` is no longer valid. The compiler error is:

```
error[E0382]: borrow of moved value: `s`
```

</details>

---

**Prediction 4:**

Will this code compile?

```rust
fn take(s: String) {}

fn main() {
    let s = String::from("hello");
    let t = s;
    take(t);
    println!("{}", t);
}
```

<details>
<summary>Answer</summary>

**No.** `s` is moved to `t` on line 4. `t` is moved into `take` on line 5. After line 5, both `s` and `t` are invalid. `println!` tries to use `t`, which is invalid.

The error is:

```
error[E0382]: borrow of moved value: `t`
```

</details>

---

**Prediction 5:**

Will this code compile?

```rust
fn take_and_give_back(s: String) -> String {
    println!("{}", s);
    s
}

fn main() {
    let s = String::from("hello");
    let t = take_and_give_back(s);
    println!("{}", t);
    println!("{}", s);
}
```

<details>
<summary>Answer</summary>

**No.** `s` is moved into `take_and_give_back` on line 8. The function returns `s` on line 3, and ownership is assigned to `t` on line 8. `s` is invalid after line 8, but `println!` on line 10 tries to use it.

The error is:

```
error[E0382]: borrow of moved value: `s`
```

</details>

---

## Mini Challenge

### Challenge 1 — Predict the Output

Without running the code, predict the output:

```rust
let a = String::from("hello");
let b = a;
let c = String::from("world");
let d = c;
println!("{}, {}", b, d);
```

<details>
<summary>Answer</summary>

Output: `hello, world`

Explanation: `a` is moved to `b`; `c` is moved to `d`. `b` and `d` are valid.

</details>

---

### Challenge 2 — Identify the Error

Why does this code fail to compile?

```rust
fn main() {
    let s1 = String::from("hello");
    let s2 = s1;
    println!("{}, {}", s1, s2);
}
```

<details>
<summary>Answer</summary>

`s1` is moved to `s2` on line 3. `s1` is invalid after that line. The `println!` tries to use `s1`, which is invalid.

</details>

---

### Challenge 3 — Fix the Error

Fix the code from Challenge 2 so it compiles.

<details>
<summary>Solution 1</summary>

Use `.clone()`:

```rust
fn main() {
    let s1 = String::from("hello");
    let s2 = s1.clone();
    println!("{}, {}", s1, s2);
}
```

</details>

<details>
<summary>Solution 2</summary>

Don't create `s2`—use `s1` directly:

```rust
fn main() {
    let s1 = String::from("hello");
    println!("{}", s1);
}
```

</details>

<details>
<summary>Solution 3</summary>

Use references (covered tomorrow):

```rust
fn main() {
    let s1 = String::from("hello");
    let s2 = &s1;
    println!("{}, {}", s1, s2);
}
```

</details>

---

### Challenge 4 — Manual Memory Trace

Draw a stack diagram for the code in Challenge 2 at each step:

1. After `let s1 = String::from("hello")`
2. After `let s2 = s1`
3. At the `println!` call

---

## Reflection

Write the answer to this question in a text file called `reflection-phase1-d1.md` in your Phase 1 repository. Commit it.

**Question:**

"Phase 0 taught you to trace the exact memory region and lifetime of every variable. Today, you learned that Rust's ownership model is a compile-time enforcement of exactly that discipline. In your own words, explain why Rust uses ownership instead of a garbage collector. What problem does ownership solve, and how does it solve it?"

<details>
<summary>Reflection Guidance</summary>

Ownership solves the heap bookkeeping problem. In C, you must manually call `free()`. In garbage-collected languages, the runtime manages memory. In Rust, the compiler tracks ownership.

The problem is: heap memory must be reclaimed when it is no longer used. If you free it too early, you get a use-after-free. If you free it too late, you leak memory. If you free it twice, you get a double-free.

Rust's solution is ownership:
- Each value has exactly one owner.
- When the owner goes out of scope, the value is dropped.
- The compiler enforces this at compile time.

This gives Rust memory safety without a garbage collector. There is no runtime overhead. There is no manual bookkeeping. The compiler does the work.

The insight from Phase 0 is that this is not an arbitrary language feature. It is a compile-time enforcement of the exact discipline you traced by hand. Every time you ask "where does this live, who owns it, when does it go away," you are doing the same reasoning the compiler does.

</details>

---

## End of Day 1, Week 3

### What You Have Accomplished

By the end of this session, you have:

- **Learned the ownership model**—every value has exactly one owner.
- **Understood move semantics**—when a value is moved, the source is invalidated.
- **Distinguished between `Copy` and non-`Copy` types** based on memory layout.
- **Traced ownership in code** using the same discipline from Phase 0.
- **Connected ownership to the heap bookkeeping problem.**

### What This Builds Toward

Today was the foundation of Rust's memory model. Tomorrow, you will learn borrowing and references—how to use a value without taking ownership.

**Tomorrow — Day 2, Week 3:**

- Borrowing and references (`&` and `&mut`)
- The mutable-XOR-shared rule
- More Compiler Thinking practice

You have the mental model. Tomorrow, you learn the syntax that enforces it.

### The Engineering Habit to Carry Forward

Before you write any Rust code involving values and references, ask yourself the three questions:

1. Where does this data live? (Stack or heap?)
2. Who owns this value? (Which variable is responsible?)
3. When does it go away? (When does the owner go out of scope?)

This is the discipline that makes Rust's ownership model intuitive. The compiler enforces it. But you must understand it.

Rest well. Tomorrow, you learn to borrow.
