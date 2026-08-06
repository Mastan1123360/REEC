---
id: P1-W4-D1
phase: 1
week: 4
day: 1
title: 'Structs and Enums: Modeling the Real World'
subtitle: Building custom types to represent your domain
estimated_time: 75
difficulty: Beginner
learning_objectives:
  - Define and instantiate structs with named fields
  - Use the field init shorthand and struct update syntax
  - Define and instantiate tuple structs and unit-like structs
  - Define enums with variants that carry different types of data
  - Understand the Option enum and why Rust uses it instead of null
  - Write methods on structs and enums using impl blocks
  - Connect structs and enums to the memory model from Phase 0
widgets:
  - story
  - mental-model
  - worked-example
  - engineering-note
  - compiler-thinking
  - mini-challenge
  - reflection
project:
  - Number Converter (planning)
failure_lab: null
reading:
  - >-
    The Rust Programming Language, Chapter 5 (Using Structs to Structure Related
    Data)
  - 'The Rust Programming Language, Chapter 6 (Enums and Pattern Matching)'
  - REEC-05-Phase1-RustFoundations.md §1.3.4 (Structs and Enums)
  - REEC-05-Phase1-RustFoundations.md §1.3.5 (Pattern Matching & Exhaustiveness)
tags:
  - structs
  - enums
  - pattern-matching
  - custom-types
  - modeling
next: P1-W4-D2
previous: P1-W3-D7
published: true
---

:::story

## The Developer Who Couldn't Name Things

A developer—call him James—had just started working on a large Rust project. He understood ownership, borrowing, and references. He could write functions and loops. But he was struggling with one fundamental skill: modeling.

The codebase was full of tuples and primitive types. A `(String, String, u64)` represented a user. A `(f64, f64, f64, u32)` represented a rectangle with color. A `Vec<Vec<String>>` represented a spreadsheet.

James couldn't remember what each field in the tuple meant. Was the first `String` the username or the email? Did the `u64` in the user tuple represent the ID or the creation timestamp? Every time he read the code, he had to check the documentation or trace the usage to figure out what the data meant.

He asked a senior engineer for help.

"You're using tuples for everything," the senior said. "Tuples are fine for small, temporary groupings. But when data has meaning, you need to name it. Use structs."

The senior opened the code and refactored the `(String, String, u64)` into:

```rust
struct User {
    username: String,
    email: String,
    id: u64,
}
```

Suddenly, the meaning was obvious. `user.username`, `user.email`, `user.id`. No more guessing. No more tuple indices.

"And if something can be in multiple states," the senior continued, "use an enum. Don't use a `String` field with `"pending"`, `"active"`, `"suspended"`. Use an enum."

James refactored the status field from a `String` to:

```rust
enum AccountStatus {
    Pending,
    Active,
    Suspended,
}
```

Now the compiler enforced that the status was always one of three valid values. No more typos. No more invalid states.

James had just discovered the power of custom types. Today, you learn the same lesson.

:::

:::mental-model

Before we dive into structs and enums, internalise these three mental models. They reframe custom types from syntax features into domain-modeling tools.

**Mental Model 1 — A struct is a named container for related data.**

When you group related data together and give it a name, you are not just organising code. You are building a mental model of your domain. The struct is a concept: a `User`, a `Task`, a `Rectangle`.

Tuples are for temporary groupings of data that have no independent meaning. Structs are for data that represents something in your problem domain.

**Mental Model 2 — An enum is a closed set of possible states.**

When something can be in one of several states, use an enum. The enum explicitly lists all possible states. The compiler ensures you handle all of them.

Using a `String` for status invites typos (`"active"` vs `"actve"`). Using an enum makes invalid states impossible.

**Mental Model 3 — Methods attach behaviour to data.**

Structs and enums define data. Methods (defined in `impl` blocks) attach behaviour to that data. This is the same pattern you've seen in other languages—but in Rust, methods can take ownership, borrow immutably, or borrow mutably, just like any other function.

:::

## Theory

### Structs: Grouping Related Data

A struct is a custom type that groups related data together.

**Defining a struct:**

```rust
struct User {
    username: String,
    email: String,
    id: u64,
}
```

**Instantiating a struct:**

```rust
let user = User {
    username: String::from("alice"),
    email: String::from("alice@example.com"),
    id: 42,
};
```

**Accessing fields:**

```rust
println!("Username: {}", user.username);
println!("Email: {}", user.email);
```

**Mutating fields (if the instance is mutable):**

```rust
let mut user = User {
    username: String::from("alice"),
    email: String::from("alice@example.com"),
    id: 42,
};
user.email = String::from("alice@newdomain.com");
```

### The Field Init Shorthand

When the parameter name and field name match, you can use shorthand:

```rust
fn build_user(username: String, email: String) -> User {
    User {
        username,  // same as username: username
        email,     // same as email: email
        id: 42,
    }
}
```

### The Struct Update Syntax

To create a new struct instance based on an existing one:

```rust
let user2 = User {
    email: String::from("bob@example.com"),
    ..user1  // rest of the fields from user1
};
```

Note that `..user1` moves any non-`Copy` fields. In this example, `user1.username` is moved to `user2`, so `user1` can no longer be used.

### Tuple Structs

Sometimes you want to name a type but don't need named fields:

```rust
struct Color(u8, u8, u8);
struct Point(f64, f64);

let black = Color(0, 0, 0);
let origin = Point(0.0, 0.0);
```

Tuple structs are useful for "wrapper" types or simple data containers.

### Unit-Like Structs

Structs with no fields:

```rust
struct AlwaysEqual;
let subject = AlwaysEqual;
```

These are sometimes used with traits (you'll see these later).

### Enums: Modeling States

An enum defines a type that can be one of several variants:

```rust
enum TaskStatus {
    Pending,
    InProgress {
        started_at: String,
    },
    Done {
        completed_at: String,
    },
}
```

**Important:** Each variant can carry different types of data. This is what makes Rust's enums more powerful than C-style enums.

### The Option Enum

`Option<T>` is Rust's alternative to null values:

```rust
enum Option<T> {
    Some(T),
    None,
}
```

Instead of a null value, you get either `Some(value)` or `None`. The compiler forces you to handle both cases.

```rust
let some_number = Some(5);
let no_number: Option<i32> = None;

match some_number {
    Some(n) => println!("The number is: {}", n),
    None => println!("No number"),
}
```

### Methods on Structs and Enums

Methods are defined in `impl` blocks:

```rust
impl User {
    fn display_name(&self) -> String {
        format!("{} ({})", self.username, self.id)
    }

    fn change_email(&mut self, new_email: String) {
        self.email = new_email;
    }
}
```

**Associated functions** (like constructors) don't take `self`:

```rust
impl User {
    fn new(username: String, email: String) -> Self {
        User {
            username,
            email,
            id: 0,  // would be assigned by a database in real code
        }
    }
}

let user = User::new("alice".to_string(), "alice@example.com".to_string());
```

### Memory Layout of Structs

Recall Phase 0's memory model. A struct's fields are laid out in memory:

```
struct User {
    username: String,  // pointer, length, capacity (24 bytes on 64-bit)
    email: String,     // pointer, length, capacity (24 bytes)
    id: u64,           // 8 bytes
}

// size_of::<User>() is likely 64 bytes (with padding)
```

The struct as a whole is stored in the same region as its fields—either on the stack (if owned) or on the heap (if inside a `Box` or similar).

---

## Worked Example

### Refactoring Tuples to Structs

Let's refactor a tuple-based program to use structs.

**Before:**

```rust
fn main() {
    let rect = (30, 50);
    let area = rect.0 * rect.1;
    println!("Area: {}", area);
}
```

**After:**

```rust
struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {
    let rect = Rectangle {
        width: 30,
        height: 50,
    };
    let area = rect.width * rect.height;
    println!("Area: {}", area);
}
```

**After with methods:**

```rust
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }

    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && self.height > other.height
    }
}

fn main() {
    let rect1 = Rectangle { width: 30, height: 50 };
    let rect2 = Rectangle { width: 20, height: 40 };
    println!("Area: {}", rect1.area());
    println!("Can hold rect2? {}", rect1.can_hold(&rect2));
}
```

### Modeling with Enums

Let's model a task status with an enum:

```rust
enum TaskStatus {
    Pending,
    InProgress {
        started_at: String,
    },
    Done {
        completed_at: String,
    },
}

impl TaskStatus {
    fn is_done(&self) -> bool {
        matches!(self, TaskStatus::Done { .. })
    }
}

fn main() {
    let status = TaskStatus::InProgress {
        started_at: String::from("2024-08-05 10:00:00"),
    };

    if status.is_done() {
        println!("Task is complete!");
    } else {
        println!("Task is not yet complete.");
    }
}
```

---

## Engineering Notes

### Engineering Note: Structs vs. Tuples

Use structs when:
- The data has meaning beyond its individual components.
- You will access fields by name.
- The type will be used across multiple parts of your codebase.

Use tuples when:
- The grouping is temporary (e.g., returning multiple values from a function).
- The meaning is obvious from context.
- You don't need to name the fields.

**The rule:** If you find yourself using tuple indices and wondering what they mean, use a struct instead.

### Engineering Note: The Power of Enums

Enums are one of Rust's most powerful features because they:
- Make invalid states impossible.
- Force you to handle all cases with `match`.
- Let you encode complex data (each variant can have different fields).

Using a `String` for status values is a common anti-pattern. Use enums instead.

### Engineering Note: Deriving Traits

You can add the `#[derive(Debug)]` attribute to print structs and enums easily:

```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {
    let rect = Rectangle { width: 30, height: 50 };
    println!("{:?}", rect);  // Rectangle { width: 30, height: 50 }
    println!("{:#?}", rect); // Pretty-printed
}
```

---

## Compiler Thinking

**Prediction 1:**

Will this code compile?

```rust
struct User {
    username: String,
    email: String,
    id: u64,
}

fn main() {
    let user = User {
        username: "alice".to_string(),
        email: "alice@example.com".to_string(),
        id: 42,
    };
    user.id = 43;
}
```

<details>
<summary>Answer</summary>

**No.** `user` is immutable. The `id` field cannot be changed. You need to declare `user` as `mut`:

```rust
let mut user = User { ... };
user.id = 43;
```

</details>

---

**Prediction 2:**

Will this code compile?

```rust
enum Status {
    Pending,
    InProgress(String),
    Done,
}

fn main() {
    let status = Status::InProgress("started".to_string());
    match status {
        Status::Pending => println!("Pending"),
        Status::InProgress(s) => println!("In progress: {}", s),
        // Missing Done case
    }
}
```

<details>
<summary>Answer</summary>

**No.** `match` is exhaustive. The compiler will complain that the `Done` variant is not handled:

```
error[E0004]: non-exhaustive patterns: `Done` not covered
```

</details>

---

**Prediction 3:**

Will this code compile?

```rust
struct Rectangle {
    width: u32,
    height: u32,
}

fn area(rect: Rectangle) -> u32 {
    rect.width * rect.height
}

fn main() {
    let rect = Rectangle { width: 30, height: 50 };
    let a = area(rect);
    let b = area(rect);  // what happens here?
}
```

<details>
<summary>Answer</summary>

**No.** `Rectangle` does not implement `Copy`. The first call to `area` moves ownership of `rect` into the function. The second call tries to use a value that has been moved.

The fix: use a reference: `fn area(rect: &Rectangle) -> u32`.

</details>

---

## Mini Challenge

### Challenge 1 — Define a Struct

Define a struct called `Task` with fields for:
- `title: String`
- `priority: u8` (1-10)
- `status: TaskStatus` (use the enum from earlier)

### Challenge 2 — Add Methods

Add methods to `Task`:
- `is_high_priority()`: returns true if priority > 7.
- `mark_done()`: changes status to `Done` with the current time.

### Challenge 3 — Model with Enums

Define an enum `Color` with variants:
- `Rgb(u8, u8, u8)`
- `Hex(String)`

Then define a struct `Car` with:
- `make: String`
- `model: String`
- `color: Color`

---

## Reflection

Write the answer to this question in a text file called `reflection-phase1-w4-d1.md` in your Phase 1 repository. Commit it.

**Question:**

"Phase 0 taught you about memory layout—where data lives and how it's organised. Today you learned about structs and enums—how to organise data at the language level. How do these two concepts connect? Why does the way you model data in Rust affect how it is stored in memory?"

<details>
<summary>Reflection Guidance</summary>

The way you model data in Rust directly affects how it is stored in memory. A struct's fields are laid out in the order they are declared, with padding for alignment. An enum's variants share memory space, with a discriminant tag indicating which variant is active.

When you model with structs and enums, you are not just making the code more readable. You are defining the exact layout of data in memory. This is why structs and enums are so important in a systems programming language—they let you control how data is represented.

The connection to Phase 0 is direct. In Phase 0, you traced memory by hand. Now you are defining the layout of that memory. You are telling the compiler exactly what the structure should look like.

</details>

---

## End of Day 1, Week 4

### What You Have Accomplished

By the end of this session, you have:

- **Learned to define and instantiate structs** with named fields.
- **Used the field init shorthand and struct update syntax.**
- **Defined tuple structs and unit-like structs.**
- **Learned to define enums** with variants that carry data.
- **Understood the Option enum** and why Rust uses it instead of null.
- **Written methods on structs and enums** using `impl` blocks.
- **Connected structs and enums to the memory model** from Phase 0.

### What This Builds Toward

Tomorrow, you will learn pattern matching and exhaustiveness—the control flow constructs that make enums truly powerful.

**Week 4, Day 2 — Pattern Matching and Exhaustiveness**

You will learn:
- The `match` expression in depth.
- Patterns that bind to values.
- Exhaustiveness checking.
- `if let` and `let...else` syntax.

You have the data structures. Tomorrow, you learn to work with them.

### The Engineering Habit to Carry Forward

When you model data, think about the domain first, then the code. What are the concepts? What are the states? What are the relationships?

The code should reflect the domain. If you find yourself fighting the language, you may have chosen the wrong abstraction.

Rest well. Tomorrow, you learn pattern matching.
