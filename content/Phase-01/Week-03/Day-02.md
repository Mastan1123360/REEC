---
id: P1-W3-D2
phase: 1
week: 3
day: 2
title: Borrowing and References
subtitle: Using values without taking ownership
estimated_time: 75
difficulty: Beginner
learning_objectives:
  - Explain what borrowing is and why it exists
  - Distinguish between immutable and mutable references
  - Understand the mutable-XOR-shared rule and why it exists
  - Identify when a reference's lifetime ends
  - Avoid dangling references
  - Write code that uses references correctly
widgets:
  - story
  - mental-model
  - worked-example
  - engineering-note
  - compiler-thinking
  - mini-challenge
  - reflection
project:
  - Calculator CLI (Milestone 1 — continued)
failure_lab: null
reading:
  - 'The Rust Programming Language, Chapter 4 (References and Borrowing)'
  - REEC-05-Phase1-RustFoundations.md §1.3.3 (Theory)
tags:
  - borrowing
  - references
  - mutability
  - mutable-xor-shared
  - dangling-references
next: P1-W3-D3
previous: P1-W3-D1
published: true
---

:::story

## The Function That Wanted to Borrow

A developer—call her Priya—was writing a function to count the number of characters in a string. She had learned about ownership from Day 1, so she knew that if she passed the string by value, ownership would move into the function and she couldn't use it afterward.

She didn't want to lose ownership. She needed the string after the function returned.

She tried returning the string from the function, like this:

```rust
fn count_chars(s: String) -> (String, usize) {
    let count = s.len();
    (s, count)
}

fn main() {
    let name = String::from("Priya");
    let (name, count) = count_chars(name);
    println!("{} has {} characters", name, count);
}
```

It worked. But it felt cumbersome. She had to return the string along with the result, and she had to use tuple destructuring to get both values. For simple operations like counting characters, this felt like overkill.

She asked a senior engineer for advice.

"Just borrow it," the engineer said.

Priya stared at them blankly.

"Use a reference," the engineer explained. "A `&String`. It points to the string but doesn't own it. You can use the value inside the function, but the ownership stays with the caller."

Priya tried it:

```rust
fn count_chars(s: &String) -> usize {
    s.len()
}

fn main() {
    let name = String::from("Priya");
    let count = count_chars(&name);
    println!("{} has {} characters", name, count);
}
```

It worked. No tuple gymnastics. No loss of ownership. The function borrowed the value, used it, and gave it back.

"Now try to modify it," the engineer said.

Priya tried to change the string inside the function:

```rust
fn make_greeting(s: &String) {
    s.push_str("!");
}
```

The compiler rejected it:

```
error[E0596]: cannot borrow `*s` as mutable, as it is behind a `&` reference
```

"Right," the engineer said. "That's the rule. You can borrow a value immutably and read it. But to modify it, you need a mutable reference, and you can only have one at a time. It's called the mutable-XOR-shared rule."

Priya had just encountered borrowing. Today, you will learn it properly.

:::

:::mental-model

Before we dive into the details, internalise these three mental models. They connect borrowing to the memory model and to the mutability rules you've seen in other languages.

**Mental Model 1 — Borrowing is a loan, not a transfer.**

When you borrow a value, you are using it but not owning it. You must give it back.

This is analogous to borrowing a book from a library. You can read it (immutable borrow). Sometimes you can write in it (mutable borrow), but only if no one else is reading it. The library (the original owner) still owns the book. You must return it in the same condition.

**Mental Model 2 — A reference is a pointer that the compiler guarantees is valid.**

In Phase 0, you learned that a pointer is just a number—an address in memory. A reference is a pointer that the compiler guarantees is valid for its entire lifetime.

When you write `&s`, you are creating a reference to `s`. The compiler checks that `s` exists for as long as the reference does. This is the borrow checker's job: ensuring references never outlive the data they point to.

**Mental Model 3 — The mutable-XOR-shared rule is about data races and invalidation.**

Rust's rule—"you can have either one mutable reference or any number of immutable references, but not both"—exists to prevent two problems:

1. **Data races.** If two threads read and write the same data at the same time, you can get unpredictable results. In single-threaded code, data races are less common, but the rule prevents them at compile time.

2. **Iterator invalidation.** If you mutate a collection while an iterator is referencing it, the iterator's internal pointer becomes invalid. C++ programmers know this as "iterator invalidation." Rust prevents it at compile time.

The rule is not arbitrary. It is a compile-time guarantee that your code will never have these bugs.

:::

## Theory

### Borrowing: The Mental Model

**The fundamental rule:**

> "A reference is a pointer that borrows the value it points to. It does not own the value."

When you create a reference (`&s` or `&mut s`), you are borrowing the value from its owner. The owner retains ownership. The reference is valid only for as long as the owner exists.

**Immutable borrows (read-only):**

```rust
let s = String::from("hello");
let r = &s; // immutable borrow
println!("{}", r); // read the string
// r goes out of scope here
```

You can have any number of immutable borrows at the same time:

```rust
let s = String::from("hello");
let r1 = &s;
let r2 = &s;
let r3 = &s;
println!("{}, {}, {}", r1, r2, r3);
```

This is allowed because immutable borrows only read data. They don't modify it, so there's no risk of interfering with each other.

**Mutable borrows (read-write):**

```rust
let mut s = String::from("hello");
let r = &mut s; // mutable borrow
r.push_str(", world!");
println!("{}", r);
// r goes out of scope here
```

You can only have one mutable borrow at a time:

```rust
let mut s = String::from("hello");
let r1 = &mut s;
let r2 = &mut s; // ERROR: cannot borrow `s` as mutable more than once
println!("{}, {}", r1, r2);
```

This prevents data races and concurrent mutation.

### The Mutable-XOR-Shared Rule

The rule is simple:

> "At any given time, you can have either:
> - One mutable reference, OR
> - Any number of immutable references.
> But not both."

**Why this rule exists:**

1. **Data races.** If you have a mutable reference, you are writing to the data. If you also have immutable references, they might be reading the data at the same time. The data could be inconsistent.

2. **Iterator invalidation.** If you have an immutable reference to a vector and then push an element, the vector might reallocate, invalidating the reference. Rust prevents this by requiring a mutable reference to modify the vector.

3. **Aliasing and mutation.** If you have two mutable references to the same data, they might write to the same location at the same time, causing corrupted data.

The compiler enforces this at compile time. There is no runtime overhead.

### Reference Scopes

A reference's scope starts where it is created and ends at its last use.

```rust
let mut s = String::from("hello");
let r1 = &s; // immutable borrow starts here
println!("{}", r1); // r1 used here
// r1's scope ends here
let r2 = &mut s; // mutable borrow starts after r1's scope ends
r2.push_str(", world!");
```

The compiler tracks the lifetime of each reference. It knows that `r1` is not used after the `println!`, so the immutable borrow ends. The mutable borrow can begin.

This is called **non-lexical lifetimes**. The compiler is smarter than just looking at the scope of the variable. It looks at where the reference is actually used.

### Dangling References

A dangling reference is a reference that points to memory that has been freed. In C, this is a common bug. In Rust, the borrow checker prevents it.

```rust
fn dangle() -> &String {
    let s = String::from("hello");
    &s
} // s goes out of scope here. The reference is dangling.
```

The compiler rejects this:

```
error[E0106]: missing lifetime specifier
```

And explains:

```
this function's return type contains a borrowed value, but there is no value for it to be borrowed from
```

The fix is to return the `String` itself (moving ownership) or to ensure the referenced data lives longer than the reference.

### The Three Ways to Use a Value

In Rust, you can interact with a value in three ways:

1. **Take ownership:** The value moves into your scope. You are responsible for it. It is dropped when you go out of scope.

2. **Borrow immutably:** You have a read-only reference (`&T`). You can read the value, but you cannot change it.

3. **Borrow mutably:** You have a read-write reference (`&mut T`). You can read and modify the value, but you must have exclusive access.

```rust
fn take_ownership(s: String) {
    // s is owned here
}

fn read_only(s: &String) {
    // s is borrowed immutably
    println!("{}", s);
}

fn modify(s: &mut String) {
    // s is borrowed mutably
    s.push_str("!");
}

fn main() {
    let mut s = String::from("hello");
    read_only(&s);
    modify(&mut s);
    take_ownership(s);
    // s is no longer valid here
}
```

---

## Worked Example

### Tracing Borrowing by Hand

Let's trace a program with borrowing using the stack diagram discipline from Phase 0.

```rust
fn main() {
    let mut s = String::from("hello");
    let r1 = &s;
    let r2 = &s;
    println!("{}, {}", r1, r2);
    let r3 = &mut s;
    r3.push_str(", world!");
    println!("{}", r3);
}
```

**Step 1: `let mut s = String::from("hello")`**

```
Stack: s (ptr → heap "hello", len: 5, cap: 5)
Heap:  "hello"
```

**Step 2: `let r1 = &s`** — immutable borrow

```
Stack: s (ptr → heap "hello", len: 5, cap: 5)
        r1 (ptr → s)
Heap:  "hello"
```

**Step 3: `let r2 = &s`** — another immutable borrow

```
Stack: s (ptr → heap "hello", len: 5, cap: 5)
        r1 (ptr → s)
        r2 (ptr → s)
Heap:  "hello"
```

**Step 4: `println!("{}, {}", r1, r2)`** — r1 and r2 are used; their borrows end here

```
Stack: s (ptr → heap "hello", len: 5, cap: 5)
        r1 (ptr → s) [no longer borrowed]
        r2 (ptr → s) [no longer borrowed]
Heap:  "hello"
```

**Step 5: `let r3 = &mut s`** — mutable borrow begins

```
Stack: s (ptr → heap "hello", len: 5, cap: 5)
        r1 [invalid]
        r2 [invalid]
        r3 (mut ptr → s)
Heap:  "hello"
```

**Step 6: `r3.push_str(", world!")`** — mutate through the mutable borrow

```
Stack: s (ptr → heap "hello, world!", len: 13, cap: maybe more)
        r3 (mut ptr → s)
Heap:  "hello, world!"
```

**Step 7: `println!("{}", r3)`** — r3 is used; borrow ends

```
Stack: s (ptr → heap "hello, world!", len: 13, cap: 13)
        r3 [no longer borrowed]
Heap:  "hello, world!"
```

**Step 8: main ends** — s goes out of scope; heap memory is freed

```
Stack: (empty)
Heap:  (empty)
```

### The Three Borrowing Rules

1. **At any given time, you can have either one mutable reference or any number of immutable references.**

2. **References must always be valid.** You cannot have a reference to data that has gone out of scope.

3. **References are not "free."** They create a relationship between the borrower and the owner. The owner cannot drop the data while there are references to it.

---

## Engineering Notes

### Engineering Note: Why Borrowing Exists

Borrowing exists because taking ownership every time you need to use a value is inconvenient.

If you had to take ownership and return it every time you wanted to read a value, your code would be full of tuple gymnastics:

```rust
let (s, count) = count_chars(s);
let (s, is_long) = check_length(s);
let (s, capitalized) = make_capital(s);
```

Borrowing allows you to use a value without taking ownership. It's like lending a book: you get to read it, but you must give it back.

### Engineering Note: The Cost of Borrowing

Borrowing is free. There is no runtime overhead. A reference is just a pointer—a number representing an address in memory.

However, borrowing has a cost at compile time. The compiler must verify that all borrows are valid. This is the borrow checker's job. If you write code that violates the borrowing rules, the compiler will reject it.

The compile-time cost is worth it. It guarantees memory safety at runtime.

### Engineering Note: When to Use Borrowing vs. Ownership

| Situation | Use |
|---|---|
| You need to read a value but not change it | Immutable borrow (`&T`) |
| You need to read and modify a value | Mutable borrow (`&mut T`) |
| You need to store a value for later | Ownership (`T`) |
| You need to pass a value to another thread | Ownership or `Arc` |
| The value is large and you want to avoid copying | Borrowing |

The general rule is: borrow when you can, own when you must.

---

## Compiler Thinking

**Prediction 1:**

Will this code compile?

```rust
let mut s = String::from("hello");
let r1 = &s;
let r2 = &mut s;
println!("{}", r1);
```

<details>
<summary>Answer</summary>

**No.** `r1` is an immutable borrow. `r2` is a mutable borrow. You cannot have a mutable borrow while an immutable borrow exists.

The error is:

```
error[E0502]: cannot borrow `s` as mutable because it is also borrowed as immutable
```

</details>

---

**Prediction 2:**

Will this code compile?

```rust
let mut s = String::from("hello");
let r1 = &s;
let r2 = &s;
println!("{}, {}", r1, r2);
let r3 = &mut s;
r3.push_str(", world!");
```

<details>
<summary>Answer</summary>

**Yes.** The immutable borrows `r1` and `r2` end after the `println!` call. After that, a mutable borrow can be created.

This is non-lexical lifetimes in action. The compiler knows that `r1` and `r2` are not used after the `println!`.

</details>

---

**Prediction 3:**

Will this code compile?

```rust
fn dangle() -> &String {
    let s = String::from("hello");
    &s
}
```

<details>
<summary>Answer</summary>

**No.** `s` is a local variable in `dangle`. It goes out of scope when the function returns. The returned reference would point to freed memory.

The error is:

```
error[E0106]: missing lifetime specifier
```

</details>

---

**Prediction 4:**

Will this code compile?

```rust
fn no_dangle() -> String {
    let s = String::from("hello");
    s
}
```

<details>
<summary>Answer</summary>

**Yes.** Ownership of `s` is moved to the caller. The string's memory is not freed when the function returns.

</details>

---

## Mini Challenge

### Challenge 1 — Identify the Error

Why does this code fail to compile?

```rust
let mut s = String::from("hello");
let r1 = &s;
s.push_str(", world!");
println!("{}", r1);
```

<details>
<summary>Answer</summary>

`s` is mutably borrowed by the `push_str` call. But `r1` is an immutable borrow that is still alive. You cannot mutably borrow data while it is immutably borrowed.

The error is:

```
error[E0502]: cannot borrow `s` as mutable because it is also borrowed as immutable
```

</details>

---

### Challenge 2 — Fix the Error

Fix the code from Challenge 1 so it compiles.

<details>
<summary>Solution</summary>

Move the mutation after the immutable borrow ends:

```rust
let mut s = String::from("hello");
let r1 = &s;
println!("{}", r1);
s.push_str(", world!");
```

Or use a mutable borrow:

```rust
let mut s = String::from("hello");
s.push_str(", world!");
println!("{}", s);
```

</details>

---

### Challenge 3 — Manual Memory Trace

Draw a stack diagram for this code at each step:

```rust
let mut v = vec![1, 2, 3];
let first = &v[0];
let second = &v[1];
println!("{}, {}", first, second);
v.push(4);
```

Why does the compiler reject this code?

<details>
<summary>Answer</summary>

The compiler rejects this code because `first` and `second` are immutable borrows of `v`. The `v.push(4)` call attempts to mutably borrow `v`. The immutable borrows are still alive because they are used in the `println!` call.

The error is:

```
error[E0502]: cannot borrow `v` as mutable because it is also borrowed as immutable
```

**The deeper reason:** `push` might reallocate the vector. If it does, the memory that `first` and `second` point to would be freed. The references would become dangling.

This is exactly the kind of bug Rust prevents at compile time.

</details>

---

## Reflection

Write the answer to this question in a text file called `reflection-phase1-d2.md` in your Phase 1 repository. Commit it.

**Question:**

"The mutable-XOR-shared rule might feel restrictive at first. You cannot have a mutable reference and an immutable reference to the same data at the same time. But this rule exists for a reason. What is that reason? What bugs does it prevent, and why are those bugs impossible in languages without this rule?"

<details>
<summary>Reflection Guidance</summary>

The mutable-XOR-shared rule exists to prevent data races and iterator invalidation.

**Data races:** If two threads access the same data, and at least one access is a write, the result is unpredictable. Rust prevents this at compile time by ensuring that mutable references are exclusive. In single-threaded code, data races are less common, but the rule still protects against concurrency bugs.

**Iterator invalidation:** If you modify a collection while iterating over it, the iterator's internal pointer becomes invalid. This can cause crashes or memory corruption. Rust prevents this by requiring a mutable reference to modify the collection, and you cannot have an immutable reference (the iterator) and a mutable reference at the same time.

In languages without this rule, these bugs are common. In C++, you can have iterators that become invalid. In Java, you can have concurrent modification exceptions at runtime. In Rust, these bugs are impossible.

The rule is not arbitrary. It is a compile-time guarantee that your code is safe.

</details>

---

## End of Day 2, Week 3

### What You Have Accomplished

By the end of this session, you have:

- **Learned what borrowing is** and why it exists.
- **Distinguished between immutable and mutable references.**
- **Understood the mutable-XOR-shared rule** and why it matters.
- **Identified when a reference's lifetime ends** (non-lexical lifetimes).
- **Avoided dangling references** by understanding ownership.
- **Connected borrowing to the memory model** from Phase 0.

### What This Builds Toward

Tomorrow, you will apply your knowledge of ownership and borrowing to your first Rust project: the Calculator CLI. You will:

- Parse command-line arguments
- Handle user input
- Use ownership and borrowing correctly
- Handle errors with `Result` and `Option`

You have the mental model. Tomorrow, you build something real.

### The Engineering Habit to Carry Forward

Before you write any code that uses references, ask yourself:

1. **Am I reading or modifying?** If reading, use `&`. If modifying, use `&mut`.
2. **Is there any other reference to this data?** If there is a mutable reference, there cannot be immutable references.
3. **Does the data live long enough?** Will the data still be valid when the reference is used?
4. **Can I avoid borrowing altogether?** Sometimes ownership is simpler.

This is the discipline that makes Rust's borrow checker feel intuitive. The compiler enforces it. But you must understand it.

Rest well. Tomorrow, you build your first Rust project.
