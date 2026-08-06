---
id: P1-W6-D3
phase: 1
week: 6
day: 3
title: 'Production Reading: Vec''s Growth Strategy'
subtitle: Understanding how the standard library manages memory efficiently
estimated_time: 60
difficulty: Intermediate
learning_objectives:
  - Understand how Vec<T> manages memory allocation and growth
  - Explain the difference between capacity and length
  - Understand the amortized O(1) cost of push operations
  - Identify the tradeoffs in Vec's growth strategy
  - Connect Vec's internals to the memory model from Phase 0
  - Apply insights from reading production code to your own code
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
  - 'alloc::vec::Vec source (Rust standard library)'
  - 'The Rustonomicon: Vec implementation'
  - >-
    REEC-08-Phase4-SystemsProgramming.md §4.9 (Production Reading — Vec's
    internals)
tags:
  - production-reading
  - vec
  - allocation
  - capacity
  - memory-management
  - standard-library
next: P1-W6-D4
previous: P1-W6-D2
published: true
---

:::story

## The Developer Who Couldn't Grow

A developer—call her Priya—was building a high-performance application. She was using `Vec<T>` everywhere. It was fast, simple, and safe.

Then she noticed a performance problem: her program was spending too much time allocating memory. Every time she pushed an element onto a vector, the program got slower.

She added logging:

```rust
let mut v = Vec::new();
for i in 0..100_000 {
    v.push(i);
    if v.len() == v.capacity() {
        println!("Reallocating at capacity {}", v.capacity());
    }
}
```

She was shocked. The vector was reallocating 16 times. Each reallocation copied all existing elements to a new memory location. The cost was growing.

A senior engineer explained: "`Vec` grows exponentially. It doubles its capacity each time it runs out of space. This makes the average cost of each `push` O(1), but you're still paying the cost of copying."

Priya looked at the output:

```
Reallocating at capacity 1
Reallocating at capacity 2
Reallocating at capacity 4
Reallocating at capacity 8
Reallocating at capacity 16
Reallocating at capacity 32
Reallocating at capacity 64
Reallocating at capacity 128
Reallocating at capacity 256
Reallocating at capacity 512
Reallocating at capacity 1024
Reallocating at capacity 2048
Reallocating at capacity 4096
Reallocating at capacity 8192
Reallocating at capacity 16384
Reallocating at capacity 32768
Reallocating at capacity 65536
```

She understood the problem. The vector was growing, but the growth was causing repeated allocations and copies.

The engineer showed her the solution: "Use `Vec::with_capacity(100_000)` to preallocate the memory upfront."

Priya changed her code:

```rust
let mut v = Vec::with_capacity(100_000);
```

The reallocations disappeared. The program was fast.

Today, you learn how `Vec` grows—and how to use it efficiently.

:::

:::mental-model

Before we dive into `Vec`'s internals, internalise these three mental models. They reframe collection usage from "just use it" to "use it with awareness."

**Mental Model 1 — Vec has two measures: length and capacity.**

- **Length:** The number of elements currently in the vector.
- **Capacity:** The amount of memory allocated for the vector's elements.

Length ≤ Capacity. When length reaches capacity, the vector must reallocate.

**Mental Model 2 — Reallocation is expensive.**

When `Vec` runs out of capacity, it allocates a new, larger buffer and copies all elements from the old buffer to the new one. This is an O(n) operation.

The old buffer is freed. The new buffer has larger capacity.

**Mental Model 3 — Exponential growth makes push O(1) amortized.**

`Vec` grows exponentially (usually doubling). This means the average cost of each `push` is constant—even though individual pushes that cause reallocation are expensive.

The amortized O(1) guarantee is why `Vec` is the default choice for dynamic arrays.

:::

## Theory

### The Architecture of Vec

`Vec<T>` is a smart pointer to a heap-allocated buffer. It has three fields:

```rust
struct Vec<T> {
    ptr: Unique<T>,    // pointer to the heap buffer
    len: usize,        // number of elements currently in the vector
    cap: usize,        // capacity of the buffer in elements
}
```

**ptr:** A raw pointer to the heap memory where the elements are stored. This is the same pointer you used in Phase 4's manual memory trace.

**len:** The current length of the vector.

**cap:** The total capacity of the vector. `cap >= len`.

### The Growth Strategy

When `len == cap` and you try to push a new element:

1. `Vec` allocates a new buffer with larger capacity (usually `cap * 2`).
2. It copies all existing elements from the old buffer to the new buffer.
3. It drops the old buffer.
4. It updates `ptr` to point to the new buffer.
5. It updates `cap` to the new capacity.
6. It pushes the new element into the new buffer.

### The Cost of Growth

**The worst case:** Each reallocation copies `len` elements. The total cost of all copies for a vector that grows from 1 to `n` elements is:

`1 + 2 + 4 + 8 + ... + n ≈ 2n`

This means the average cost of each `push` is O(1).

**The tradeoff:** Reallocation is expensive, but it happens rarely.

### Preallocating Capacity

You can avoid reallocations by preallocating capacity:

```rust
let mut v = Vec::with_capacity(100); // capacity is 100
for i in 0..100 {
    v.push(i);
}
```

No reallocations occur. The vector already has enough capacity.

### The Memory Model Connection

Recall Phase 0's memory model. `Vec` allocates on the heap:

```
Stack (v)                  Heap (buffer)
┌─────────────────┐       ┌──────────────────┐
│ ptr ─────────────┼──────▶│ [elements]       │
│ len: n           │       │                  │
│ cap: N           │       └──────────────────┘
└─────────────────┘
```

When `Vec` reallocates:

1. A new heap buffer is allocated.
2. Elements are copied from the old buffer to the new buffer.
3. The old buffer is freed.
4. The pointer is updated to point to the new buffer.

### The Exponential Growth Constants

The standard library's growth strategy is not just "double." It is tuned for performance:

```rust
// Simplified from the standard library
fn grow(&mut self) {
    // It may grow by more than double (for small vectors)
    let new_cap = cmp::max(self.cap * 2, 4);
    // Reallocate to new_cap
}
```

For very small vectors, the initial capacity is 4, not 1.

---

## Worked Example

### Exploring Vec's Growth with Code

Let's explore `Vec`'s growth strategy with a small program.

```rust
fn main() {
    let mut v = Vec::new();
    println!("Initial length: {}, capacity: {}", v.len(), v.capacity());

    for i in 0..100 {
        v.push(i);
        if v.len() == v.capacity() {
            println!("Reallocated at length {} (capacity: {})", v.len(), v.capacity());
        }
        println!("After push {}: len {}, cap {}", i, v.len(), v.capacity());
    }
}
```

**Output:**

```
Initial length: 0, capacity: 0
After push 0: len 1, cap 4
Reallocated at length 4 (capacity: 8)
After push 4: len 5, cap 8
Reallocated at length 8 (capacity: 16)
After push 8: len 9, cap 16
Reallocated at length 16 (capacity: 32)
After push 16: len 17, cap 32
Reallocated at length 32 (capacity: 64)
After push 32: len 33, cap 64
Reallocated at length 64 (capacity: 128)
After push 64: len 65, cap 128
```

**Key observations:**
- Initial capacity is 0. The first push allocates capacity for 4 elements.
- Capacity grows by doubling (4 → 8 → 16 → 32 → 64 → 128).
- Reallocation happens when `len == cap`.

### Preallocating Capacity

```rust
fn main() {
    let mut v = Vec::with_capacity(100);
    println!("Initial capacity: {}", v.capacity());

    for i in 0..100 {
        v.push(i);
    }
    // No reallocations occurred
}
```

### The Cost of Reallocation

```rust
use std::time::Instant;

fn main() {
    let start = Instant::now();
    let mut v = Vec::new();
    for i in 0..1_000_000 {
        v.push(i);
    }
    println!("No preallocation: {:?}", start.elapsed());

    let start = Instant::now();
    let mut v = Vec::with_capacity(1_000_000);
    for i in 0..1_000_000 {
        v.push(i);
    }
    println!("With preallocation: {:?}", start.elapsed());
}
```

**Typical output:**

```
No preallocation: 45ms
With preallocation: 15ms
```

Preallocating capacity can significantly improve performance.

---

## Engineering Notes

### Engineering Note: When to Preallocate

**Do preallocate when:**
- You know the approximate size of the vector.
- You are pushing many elements.
- Performance is critical.

**Don't preallocate when:**
- You don't know the size.
- The vector is small.
- Memory is limited.

### Engineering Note: The Capacity of Empty Vec

`Vec::new()` creates a vector with capacity 0. The first push allocates capacity for 4 elements. This is a design choice that balances performance and memory.

### Engineering Note: Capacity vs. Memory

The capacity of a vector is the amount of memory allocated. Even if the vector is empty, the memory is still allocated until the vector is dropped.

If you know you won't need more elements, you can call `shrink_to_fit()` to reduce capacity to the current length.

```rust
let mut v = vec![1, 2, 3];
v.clear(); // length becomes 0, capacity stays the same
v.shrink_to_fit(); // capacity becomes 0, memory is freed
```

### Engineering Note: The Vec Source Code

The standard library implementation of `Vec` is a great resource for learning systems programming. It handles:
- Raw pointer manipulation.
- Memory allocation and deallocation.
- Type safety.
- Drop handling.

You can read the source code at: https://doc.rust-lang.org/src/alloc/vec/mod.rs.html

---

## Compiler Thinking

**Prediction 1:**

What happens when you call `let mut v = Vec::new(); v.push(1);`?

<details>
<summary>Answer</summary>

1. `Vec::new()` creates a vector with `len = 0`, `cap = 0`.
2. `push(1)` sees that `len == cap` (0 == 0).
3. It allocates a new buffer with capacity 4.
4. It copies the element (no elements to copy).
5. It sets `len = 1`, `cap = 4`.
6. The element is stored in the first slot.

</details>

---

**Prediction 2:**

What happens when you call `let mut v = Vec::with_capacity(10);` and then `push` 11 elements?

<details>
<summary>Answer</summary>

1. The vector has capacity 10.
2. Elements 1-10 are pushed without reallocation.
3. When the 11th element is pushed, `len == cap` (10 == 10).
4. The vector reallocates to a new capacity (usually 20).
5. It copies all 10 elements to the new buffer.
6. It pushes the 11th element.

</details>

---

**Prediction 3:**

Why does `Vec` grow exponentially instead of adding 1 element at a time?

<details>
<summary>Answer</summary>

If `Vec` grew by 1 each time, each `push` would require copying all existing elements. The average cost would be O(n). With exponential growth, the average cost is O(1).

</details>

---

## Mini Challenge

### Challenge 1 — Measure Capacity Growth

Write a program that prints the capacity of a `Vec` after each `push` for the first 100 elements. Compare the results to the doubling pattern.

### Challenge 2 — Preallocate for Performance

Write a benchmark comparing `Vec::new()` to `Vec::with_capacity()` for 1,000,000 elements. Measure the time difference.

### Challenge 3 — Explore Vec's Source

Read the `Vec` source code in the standard library. Find the `grow` function. What is the growth strategy for small vectors?

---

## Reflection

Write the answer to this question in a text file called `reflection-phase1-w6-d3.md` in your Phase 1 repository. Commit it.

**Question:**

"Today you learned how `Vec<T>` manages memory allocation and growth. The standard library uses exponential growth to make `push` amortized O(1). How does this connect to Phase 0's memory model? Why does `Vec` reallocate its elements when capacity is exceeded, and what is the cost of reallocation?"

<details>
<summary>Reflection Guidance</summary>

`Vec` allocates its elements on the heap. The heap is managed by the allocator, which provides a contiguous block of memory. When `Vec` runs out of capacity, it must request a new, larger block from the allocator. The old block is freed.

The cost of reallocation is O(n)—all existing elements must be copied to the new buffer. This is why reallocation is expensive.

The connection to Phase 0's memory model is direct: `Vec` is a heap allocation. The pointer, length, and capacity are stored on the stack. The actual elements are stored on the heap. When `Vec` reallocates, the pointer changes to point to the new heap memory.

Understanding this helps you write efficient code. By preallocating capacity, you can avoid reallocation costs.

</details>

---

## End of Day 3, Week 6

### What You Have Accomplished

By the end of this session, you have:

- **Learned how `Vec<T>` manages memory** with length and capacity.
- **Understood the growth strategy** and its performance implications.
- **Learned about reallocation** and its cost.
- **Connected `Vec`'s internals to Phase 0's memory model.**
- **Explored the standard library source code.**
- **Applied insights to write more efficient code.**

### What This Builds Toward

Tomorrow, you will review the Task Tracker v1 against the Engineering Review rubric and plan a refactor pass.

**Week 6, Day 4 — Engineering Review + Refactor Pass**

You will:
- Score the Task Tracker v1 against all quality dimensions.
- Identify improvement opportunities.
- Refactor the code to meet the Definition of Done.

### The Engineering Habit to Carry Forward

When using collections, think about capacity. Preallocate when you know the size. Understand the performance characteristics of the collections you use.

This is the discipline of performance-aware programming.

### Tomorrow

**Week 6, Day 4 — Engineering Review + Refactor Pass**

You will:
- Apply the Engineering Review rubric.
- Identify refactor opportunities.
- Refactor the code.
- Prepare for the Phase 1 Milestone.

Rest well. Tomorrow, you review your work.
