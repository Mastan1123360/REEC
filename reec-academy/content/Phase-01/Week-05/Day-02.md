---
id: P1-W5-D2
phase: 1
week: 5
day: 2
title: 'Collections and Ownership: Vec, HashMap, and Inside-Out Thinking'
subtitle: Managing groups of data while respecting ownership and borrowing
estimated_time: 75
difficulty: Intermediate
learning_objectives:
  - Use Vec to store variable-length lists of values
  - Use HashMap to store key-value associations
  - Understand how ownership works inside collections
  - >-
    Distinguish between iterating by value, immutable reference, and mutable
    reference
  - Use enums to store multiple types in a single collection
  - Recognize when to use Vec vs. HashMap vs. other collections
  - Apply borrowing rules to collection operations
widgets:
  - story
  - mental-model
  - worked-example
  - engineering-note
  - compiler-thinking
  - mini-challenge
  - reflection
project:
  - Task Tracker v1 (planning continued)
failure_lab: null
reading:
  - 'The Rust Programming Language, Chapter 8 (Common Collections)'
  - >-
    REEC-05-Phase1-RustFoundations.md §1.3.7 (Collections and Ownership
    Interaction)
tags:
  - collections
  - vec
  - hashmap
  - ownership
  - iteration
next: P1-W5-D3
previous: P1-W5-D1
published: true
---

:::story

## The Developer Who Lost Track of Ownership

A developer—call him Marcus—was building a task tracker. He needed to store a list of tasks and look them up by ID. He knew about `Vec` and `HashMap`, so he used both.

But he kept running into ownership errors.

```rust
let tasks = vec![Task::new("Buy milk"), Task::new("Write report")];
let first = tasks[0]; // ERROR: cannot move out of indexed content
```

He couldn't understand why. He had used vectors in other languages. Why couldn't he just take an element out?

A senior engineer explained: "`Vec` owns its elements. When you write `tasks[0]`, you're trying to move ownership out of the vector. That would leave the vector with a hole. Rust won't allow it."

Marcus was confused. "But I just want to read the task, not take ownership."

"Then borrow it," the engineer said. "Use `&tasks[0]` to get a reference, or iterate with `&tasks`."

Marcus changed his code:

```rust
let first = &tasks[0]; // borrow, not move
```

It worked. He learned a lesson: collections own their data. You can borrow from them, but you can't take ownership without leaving a hole.

Today, you learn to work with collections while respecting ownership.

:::

:::mental-model

Before we dive into collections, internalise these three mental models. They reframe collections from simple containers into ownership-managed data structures.

**Mental Model 1 — A collection owns its elements.**

When you push a value into a `Vec`, ownership moves into the vector. The vector becomes the owner. You can no longer use the original variable.

When you insert a key-value pair into a `HashMap`, both the key and the value are moved into the map. The map becomes the owner.

**Mental Model 2 — Iterating over a collection either moves or borrows.**

- `for x in vec` moves each element out of the vector. The vector is consumed.
- `for x in &vec` borrows each element immutably.
- `for x in &mut vec` borrows each element mutably.

The choice determines whether the collection is consumed or remains usable.

**Mental Model 3 — Collections are homogeneous, but enums provide polymorphism.**

A `Vec<T>` can only store one type `T`. If you need to store different types, use an enum:

```rust
enum Value {
    Int(i32),
    Float(f64),
    Text(String),
}

let values: Vec<Value> = vec![
    Value::Int(42),
    Value::Float(3.14),
    Value::Text("hello".to_string()),
];
```

:::

## Theory

### The Vec Type

`Vec<T>` is a growable, heap-allocated array. It owns its elements.

**Creating a vector:**

```rust
let v1: Vec<i32> = Vec::new();
let v2 = vec![1, 2, 3];
```

**Adding elements:**

```rust
let mut v = Vec::new();
v.push(5);
v.push(6);
v.push(7);
```

**Reading elements:**

```rust
let v = vec![1, 2, 3];
let first = &v[0]; // borrow, not move
let second = v.get(1); // returns Option<&i32>
```

**Iterating:**

```rust
// Borrow immutably
for x in &v {
    println!("{}", x);
}

// Borrow mutably
for x in &mut v {
    *x += 1;
}

// Move out of the vector (consumes it)
for x in v {
    println!("{}", x);
}
// v is no longer usable here
```

### Vec and Ownership

When you push a value into a vector, ownership moves:

```rust
let s = String::from("hello");
let mut v = Vec::new();
v.push(s);
// s is no longer valid here
println!("{}", s); // ERROR: borrow of moved value
```

If you need to keep the value, borrow it first:

```rust
let s = String::from("hello");
let mut v = Vec::new();
v.push(&s); // store a reference
println!("{}", s); // s is still valid
```

But storing references requires lifetimes (Phase 2). For now, store owned values.

### The HashMap Type

`HashMap<K, V>` stores key-value pairs. It owns both keys and values.

**Creating a hash map:**

```rust
use std::collections::HashMap;

let mut scores = HashMap::new();
scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Yellow"), 50);
```

**Accessing values:**

```rust
let score = scores.get("Blue").copied().unwrap_or(0);
```

**Iterating:**

```rust
for (key, value) in &scores {
    println!("{}: {}", key, value);
}
```

### HashMap and Ownership

When you insert a key and value, ownership moves into the map:

```rust
let key = String::from("Blue");
let value = 10;
let mut map = HashMap::new();
map.insert(key, value);
// key and value are no longer valid here
```

### Iterating Over Collections

**Immutable borrow:**

```rust
let v = vec![1, 2, 3];
for x in &v {
    println!("{}", x);
}
// v is still usable here
```

**Mutable borrow:**

```rust
let mut v = vec![1, 2, 3];
for x in &mut v {
    *x += 1;
}
// v is still usable here
```

**Move (consuming the collection):**

```rust
let v = vec![1, 2, 3];
for x in v {
    println!("{}", x);
}
// v is no longer usable here
```

### Multiple Types in a Collection

Use enums to store multiple types:

```rust
enum SpreadsheetCell {
    Int(i32),
    Float(f64),
    Text(String),
}

let row = vec![
    SpreadsheetCell::Int(3),
    SpreadsheetCell::Text(String::from("blue")),
    SpreadsheetCell::Float(10.12),
];
```

### Choosing a Collection

| Use case | Collection |
|---|---|
| Ordered list of values | `Vec<T>` |
| Unique values with fast lookup | `HashSet<T>` |
| Key-value associations | `HashMap<K, V>` |
| Ordered key-value pairs | `BTreeMap<K, V>` |
| Queue or stack | `VecDeque<T>` |

---

## Worked Example

### Building a Simple Task Tracker

Let's build a simple in-memory task tracker using collections.

```rust
use std::collections::HashMap;

#[derive(Debug, Clone)]
struct Task {
    id: u64,
    title: String,
    completed: bool,
}

struct TaskTracker {
    tasks: Vec<Task>,
    next_id: u64,
}

impl TaskTracker {
    fn new() -> Self {
        TaskTracker {
            tasks: Vec::new(),
            next_id: 1,
        }
    }

    fn add(&mut self, title: String) -> &Task {
        let task = Task {
            id: self.next_id,
            title,
            completed: false,
        };
        self.next_id += 1;
        self.tasks.push(task);
        self.tasks.last().unwrap()
    }

    fn list(&self) -> &[Task] {
        &self.tasks
    }

    fn complete(&mut self, id: u64) -> Option<&Task> {
        for task in &mut self.tasks {
            if task.id == id {
                task.completed = true;
                return Some(task);
            }
        }
        None
    }

    fn remove(&mut self, id: u64) -> Option<Task> {
        if let Some(index) = self.tasks.iter().position(|t| t.id == id) {
            Some(self.tasks.remove(index))
        } else {
            None
        }
    }
}
```

### Using a HashMap for Lookup

The `Vec` approach requires scanning for lookups (`O(n)`). A `HashMap` gives `O(1)` lookups:

```rust
struct TaskTracker {
    tasks: HashMap<u64, Task>,
    next_id: u64,
}

impl TaskTracker {
    fn new() -> Self {
        TaskTracker {
            tasks: HashMap::new(),
            next_id: 1,
        }
    }

    fn add(&mut self, title: String) -> &Task {
        let id = self.next_id;
        self.next_id += 1;
        let task = Task { id, title, completed: false };
        self.tasks.insert(id, task);
        self.tasks.get(&id).unwrap()
    }

    fn list(&self) -> Vec<&Task> {
        self.tasks.values().collect()
    }

    fn complete(&mut self, id: u64) -> Option<&Task> {
        if let Some(task) = self.tasks.get_mut(&id) {
            task.completed = true;
            return Some(task);
        }
        None
    }

    fn remove(&mut self, id: u64) -> Option<Task> {
        self.tasks.remove(&id)
    }
}
```

### Iterating with Borrowing

```rust
let tracker = TaskTracker::new();
// ... add tasks ...

// Borrow immutably
for task in tracker.list() {
    println!("{}: {}", task.id, task.title);
}

// Or using & on the Vec directly
for task in &tracker.tasks {
    println!("{}: {}", task.id, task.title);
}
```

### The Danger of Moving Out

```rust
let mut tracker = TaskTracker::new();
tracker.add("Buy milk".to_string());

// This would compile but fail at runtime if the vector is not empty
// let first = tracker.tasks.remove(0); // Would work, but moves out

// This is the correct way
let first = &tracker.tasks[0]; // borrow
```

---

## Engineering Notes

### Engineering Note: Vec vs. HashMap

`Vec` is faster for iteration and maintains order. `HashMap` is faster for lookups by key.

**Choose Vec when:**
- You need to maintain insertion order.
- You iterate over all elements frequently.
- You access elements by index.

**Choose HashMap when:**
- You need fast lookup by key.
- You don't care about order.
- You have a key-value relationship.

### Engineering Note: Ownership Inside Collections

Remember: collections own their data.

- `Vec<T>` owns its `T`s.
- `HashMap<K, V>` owns its `K`s and `V`s.
- When you iterate by value (`for x in vec`), the collection is consumed.

If you need to keep the collection, iterate by reference (`for x in &vec`).

### Engineering Note: The Cost of clone()

`clone()` creates a deep copy. It is expensive for large data.

If you need to store something in a collection and also keep a copy, consider whether you really need the copy. Could you store a reference instead? (Requires lifetimes.)

---

## Compiler Thinking

**Prediction 1:**

Will this code compile?

```rust
let mut v = vec![1, 2, 3];
for x in v {
    println!("{}", x);
}
println!("Length: {}", v.len());
```

<details>
<summary>Answer</summary>

**No.** The `for x in v` loop consumes the vector. After the loop, `v` is no longer valid.

The error is:

```
error[E0382]: borrow of moved value: `v`
```

</details>

---

**Prediction 2:**

Will this code compile?

```rust
let mut v = vec![1, 2, 3];
for x in &v {
    println!("{}", x);
}
println!("Length: {}", v.len());
```

<details>
<summary>Answer</summary>

**Yes.** The `for x in &v` loop borrows immutably. After the loop, `v` is still valid.

</details>

---

**Prediction 3:**

Will this code compile?

```rust
let mut map = HashMap::new();
map.insert("a".to_string(), 1);
let key = "a".to_string();
let value = map.get(&key);
println!("{}", key);
```

<details>
<summary>Answer</summary>

**Yes.** `key` was not moved into the map—the `insert` used a different key. `key` is still valid.

</details>

---

**Prediction 4:**

Will this code compile?

```rust
let mut map = HashMap::new();
map.insert("a".to_string(), 1);
let key = map.keys().next().unwrap();
println!("{}", key);
```

<details>
<summary>Answer</summary>

**Yes.** `keys()` returns an iterator over references to the keys. `key` is a `&String`.

</details>

---

## Mini Challenge

### Challenge 1 — Iterate Correctly

The following code fails to compile. Fix it:

```rust
let v = vec![String::from("hello"), String::from("world")];
for s in v {
    println!("{}", s);
}
println!("First: {}", v[0]); // ERROR
```

### Challenge 2 — Use HashMap for Lookup

Refactor this code to use `HashMap` instead of `Vec` for faster lookups:

```rust
struct Student {
    id: u32,
    name: String,
}

struct Class {
    students: Vec<Student>,
}

impl Class {
    fn find(&self, id: u32) -> Option<&Student> {
        self.students.iter().find(|s| s.id == id)
    }
}
```

### Challenge 3 — Store Multiple Types

Store a list of values that can be integers, floating-point numbers, or strings. Use an enum.

---

## Reflection

Write the answer to this question in a text file called `reflection-phase1-w5-d2.md` in your Phase 1 repository. Commit it.

**Question:**

"In Phase 0, you learned that memory is organised into regions—stack, heap, data, BSS, text. Today, you learned that `Vec` and `HashMap` allocate their data on the heap. What does this mean for ownership? Why does `Vec` need to own its elements? What happens if you try to move an element out of a `Vec` without removing it?"

<details>
<summary>Reflection Guidance</summary>

`Vec` allocates its data on the heap. The `Vec` itself owns that heap memory. When you push a value into a `Vec`, ownership moves into the `Vec`. The `Vec` is now responsible for freeing that memory when it goes out of scope.

When you try to move an element out of a `Vec` (e.g., `let x = v[0]`), you are trying to take ownership of data that the `Vec` owns. The `Vec` would be left with a hole in its allocation. Rust prevents this by disallowing moves from indexed access.

To take ownership of an element, you must remove it from the `Vec`: `let x = v.remove(0)`. This returns ownership and shifts the remaining elements.

The heap allocation is why `Vec` and `HashMap` need to own their data. Without ownership, there would be no clear responsibility for freeing memory.

</details>

---

## End of Day 2, Week 5

### What You Have Accomplished

By the end of this session, you have:

- **Learned to use `Vec`** for variable-length lists.
- **Learned to use `HashMap`** for key-value associations.
- **Understood ownership** inside collections.
- **Distinguished between iterating by value, immutable reference, and mutable reference.**
- **Used enums to store multiple types** in a single collection.
- **Applied borrowing rules to collection operations.**

### What This Builds Toward

Tomorrow, you will learn about traits and generics—Rust's system for shared behaviour and abstraction.

**Week 5, Day 3 — Traits and Generics (First Contact)**

You will learn:
- What traits are and why they exist.
- How to implement traits on types.
- Generic functions and structs.
- Trait bounds.

The Task Tracker v1 will need traits for custom behaviour. You are building the foundation.

### The Engineering Habit to Carry Forward

When choosing a collection, consider:
- Do you need order? (Use `Vec`.)
- Do you need lookup by key? (Use `HashMap`.)
- Do you need fast iteration? (Use `Vec`.)

And remember: collections own their data. If you want to use the data without consuming the collection, borrow it.

Rest well. Tomorrow, you learn about traits and generics.
