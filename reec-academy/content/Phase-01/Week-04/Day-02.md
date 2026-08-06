---
id: P1-W4-D2
phase: 1
week: 4
day: 2
title: Pattern Matching and Exhaustiveness
subtitle: The control flow construct that makes enums truly powerful
estimated_time: 75
difficulty: Beginner
learning_objectives:
  - Use the match expression to handle enum variants
  - Bind values from enum variants using patterns
  - Understand exhaustiveness and why the compiler enforces it
  - Use if let and let...else as concise alternatives
  - Recognize when match is appropriate and when simpler constructs are better
  - Connect pattern matching to the memory model and type safety
widgets:
  - story
  - mental-model
  - worked-example
  - engineering-note
  - compiler-thinking
  - mini-challenge
  - reflection
project:
  - Number Converter (planning continued)
failure_lab: null
reading:
  - 'The Rust Programming Language, Chapter 6 (Enums and Pattern Matching)'
  - REEC-05-Phase1-RustFoundations.md §1.3.5 (Pattern Matching & Exhaustiveness)
tags:
  - pattern-matching
  - exhaustiveness
  - match
  - if-let
  - control-flow
next: P1-W4-D3
previous: P1-W4-D1
published: true
---

:::story

## The Developer Who Refused to Match

A developer—call him Alex—had been using enums for weeks. He loved them. They made invalid states impossible. They cleaned up his code.

But he had one habit: he always used the catch-all `_` in his `match` expressions.

```rust
match status {
    TaskStatus::Pending => println!("Not started"),
    TaskStatus::InProgress { .. } => println!("Working on it"),
    _ => println!("Other"),
}
```

A senior engineer reviewed his code and pointed out the problem.

"Your enum has three variants," the senior said. "You're handling Pending and InProgress explicitly. But the `_` is silently handling Done—and any future variant that might be added. You're hiding the fact that you're not handling Done specifically."

Alex shrugged. "It works, doesn't it?"

"It works today," the senior said. "But what happens when someone adds a fourth variant? Your `_` will silently handle it, and the compiler won't tell you. The business logic might need to treat that new variant specially, but your code will just swallow it."

The senior deleted the `_` and added an explicit `Done` arm:

```rust
match status {
    TaskStatus::Pending => println!("Not started"),
    TaskStatus::InProgress { .. } => println!("Working on it"),
    TaskStatus::Done { .. } => println!("Finished!"),
}
```

"Now the compiler will force you to handle every variant. When someone adds a new variant, the code won't compile until you handle it. That's not a bug—it's a safety feature."

Alex had been using the catch-all as a shortcut. But it was actually a bug waiting to happen. He stopped using `_` by default and started being explicit about every variant.

Today, you learn to match exhaustively.

:::

:::mental-model

Before we dive into pattern matching, internalise these three mental models. They reframe `match` from a switch statement into a compile-time safety guarantee.

**Mental Model 1 — A match is not a switch statement. It is a completeness check.**

In other languages, `switch` is a convenience. You write a `default` case, and if you forget a specific case, the program still compiles. In Rust, `match` is a requirement. The compiler checks that you have handled every possible case. If you haven't, the code does not compile.

This is not a restriction. It is a guarantee. It ensures that invalid states are impossible.

**Mental Model 2 — The compiler is enforcing domain correctness.**

When you define an enum, you are defining all possible states in your domain. When you use `match`, the compiler checks that you have handled every one of those states.

This is not just about code correctness. It is about domain correctness. If a new state is added to the enum, every place that uses that enum must be updated. The compiler ensures you don't miss any.

**Mental Model 3 — if let is for when you only care about one case.**

Sometimes you don't need to handle every variant. Sometimes you only care about one specific case. That's when `if let` is appropriate.

`if let` is a syntactic sugar for a `match` with one arm and a `_ => ()` catch-all. It says: "If the value matches this pattern, do something. Otherwise, do nothing."

But be careful: `if let` does not enforce exhaustiveness. Use it when you genuinely don't care about the other cases.

:::

## Theory

### The match Expression

The `match` expression compares a value against a series of patterns and executes the code for the first matching pattern.

```rust
enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter,
}

fn value_in_cents(coin: Coin) -> u8 {
    match coin {
        Coin::Penny => 1,
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter => 25,
    }
}
```

**Key points:**
- `match` is exhaustive: all variants must be covered.
- Arms are evaluated in order.
- The value is returned from the `match` expression.

### Patterns That Bind to Values

When a variant contains data, the pattern can bind that data to a variable:

```rust
enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter(String), // state name for quarters
}

fn describe_coin(coin: Coin) -> String {
    match coin {
        Coin::Penny => "One cent".to_string(),
        Coin::Nickel => "Five cents".to_string(),
        Coin::Dime => "Ten cents".to_string(),
        Coin::Quarter(state) => format!("Quarter from {}", state),
    }
}
```

### Matching on Option

`Option<T>` is commonly used with `match`:

```rust
fn plus_one(x: Option<i32>) -> Option<i32> {
    match x {
        None => None,
        Some(i) => Some(i + 1),
    }
}
```

The `match` is exhaustive: both `None` and `Some` are handled.

### Exhaustiveness Checking

The compiler ensures that every possible case is handled:

```rust
fn plus_one(x: Option<i32>) -> Option<i32> {
    match x {
        Some(i) => Some(i + 1),
    }
}
```

This code does not compile:

```
error[E0004]: non-exhaustive patterns: `None` not covered
```

The compiler tells you exactly which pattern is missing.

### Catch-All Patterns

Sometimes you want to handle all remaining cases with one arm:

```rust
let dice_roll = 9;
match dice_roll {
    3 => add_fancy_hat(),
    7 => remove_fancy_hat(),
    other => move_player(other),
}
```

The `other` variable captures any value not matched by the first two arms.

**But be careful:** A catch-all arm means you are not handling specific cases explicitly. If new variants are added to an enum, the catch-all will handle them silently. This can hide bugs.

### The _ Placeholder

If you don't need to use the value in the catch-all arm, use `_`:

```rust
match dice_roll {
    3 => add_fancy_hat(),
    7 => remove_fancy_hat(),
    _ => reroll(),
}
```

### if let Syntax

When you only care about one pattern, `if let` is more concise:

```rust
let config_max = Some(3u8);
match config_max {
    Some(max) => println!("The maximum is configured to be {}", max),
    _ => (),
}
```

The `_ => ()` is boilerplate. `if let` removes it:

```rust
if let Some(max) = config_max {
    println!("The maximum is configured to be {}", max);
}
```

**When to use `if let`:**
- You only care about one specific variant.
- You don't need to handle the other cases.
- The exhaustiveness check is not important.

**When to use `match`:**
- You need to handle all variants.
- Exhaustiveness checking is important.
- The logic for different variants is different.

### let...else

`let...else` is useful when you want to handle the `None`/`Err` case and continue with the `Some`/`Ok` case:

```rust
fn describe_state_quarter(coin: Coin) -> Option<String> {
    let Coin::Quarter(state) = coin else {
        return None;
    };
    Some(format!("Quarter from {}", state))
}
```

This is cleaner than `if let` for the "happy path" pattern.

---

## Worked Example

### Processing a Collection with Match

Let's process a collection of coins:

```rust
enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter(String),
}

fn process_coins(coins: Vec<Coin>) -> (u32, Vec<String>) {
    let mut total_cents = 0;
    let mut quarters = Vec::new();

    for coin in coins {
        match coin {
            Coin::Penny => total_cents += 1,
            Coin::Nickel => total_cents += 5,
            Coin::Dime => total_cents += 10,
            Coin::Quarter(state) => {
                total_cents += 25;
                quarters.push(state);
            }
        }
    }

    (total_cents, quarters)
}
```

### Using match with Custom Types

```rust
struct Task {
    title: String,
    status: TaskStatus,
}

enum TaskStatus {
    Pending,
    InProgress { started_at: String },
    Done { completed_at: String },
}

impl Task {
    fn description(&self) -> String {
        match self.status {
            TaskStatus::Pending => format!("Pending: {}", self.title),
            TaskStatus::InProgress { ref started_at } => {
                format!("In progress: {} (started {})", self.title, started_at)
            }
            TaskStatus::Done { ref completed_at } => {
                format!("Done: {} (completed {})", self.title, completed_at)
            }
        }
    }
}
```

### The Option Unwrap Pattern

```rust
fn get_config_value(key: &str) -> Option<String> {
    // Simulated config lookup
    match key {
        "host" => Some("localhost".to_string()),
        "port" => Some("8080".to_string()),
        _ => None,
    }
}

fn main() {
    let host = get_config_value("host");
    if let Some(h) = host {
        println!("Host: {}", h);
    } else {
        println!("Host not configured");
    }

    let port = get_config_value("port").unwrap_or("3000".to_string());
    println!("Port: {}", port);
}
```

---

## Engineering Notes

### Engineering Note: Why Exhaustiveness Matters

Exhaustiveness is not a nice-to-have. It is a correctness guarantee.

When you add a new variant to an enum, the compiler will point to every `match` that needs to be updated. This is the compiler doing work for you—preventing bugs before they happen.

**Without exhaustiveness:**
- You add a variant.
- You update some matches but miss others.
- The program compiles.
- The program behaves incorrectly in production.

**With exhaustiveness:**
- You add a variant.
- The compiler tells you every match that is affected.
- You update all of them.
- The program compiles.
- The program behaves correctly.

Exhaustiveness is why enums are so powerful in Rust. They make invalid states impossible.

### Engineering Note: When to Use _ (and When Not To)

The catch-all `_` is powerful but dangerous. Use it when:

- You genuinely don't care about the other cases.
- The other cases are handled elsewhere.
- You are willing to handle new variants silently.

**Don't** use `_` when:
- You are handling enum variants.
- New variants might be added in the future.
- The logic for other variants is different.

The rule: be explicit unless you have a good reason not to be.

### Engineering Note: if let vs. match

`if let` is syntactic sugar for a `match` with one arm and a `_ => ()` catch-all.

```rust
// This:
if let Some(x) = value {
    // do something with x
}

// Is equivalent to this:
match value {
    Some(x) => {
        // do something with x
    }
    _ => (),
}
```

`if let` is more concise, but it hides the catch-all. Use it when you genuinely don't care about the other cases.

`let...else` is useful when you want to handle the "failure" case and continue with the "success" case.

---

## Compiler Thinking

**Prediction 1:**

Will this code compile?

```rust
enum Direction {
    North,
    South,
    East,
    West,
}

fn describe(d: Direction) -> String {
    match d {
        Direction::North => "North".to_string(),
        Direction::South => "South".to_string(),
        Direction::East => "East".to_string(),
    }
}
```

<details>
<summary>Answer</summary>

**No.** The `West` variant is not handled. The compiler will report:

```
error[E0004]: non-exhaustive patterns: `West` not covered
```

</details>

---

**Prediction 2:**

Will this code compile?

```rust
enum Direction {
    North,
    South,
    East,
    West,
}

fn describe(d: Direction) -> String {
    match d {
        Direction::North => "North".to_string(),
        Direction::South => "South".to_string(),
        Direction::East => "East".to_string(),
        _ => "Other".to_string(),
    }
}
```

<details>
<summary>Answer</summary>

**Yes.** The catch-all `_` covers the remaining variant. But be careful: if a new variant is added, it will be silently handled by `_`.

</details>

---

**Prediction 3:**

Will this code compile?

```rust
fn maybe_add_one(x: Option<i32>) -> Option<i32> {
    match x {
        Some(i) => Some(i + 1),
        None => None,
    }
}
```

<details>
<summary>Answer</summary>

**Yes.** Both `Some` and `None` are handled. The match is exhaustive.

</details>

---

**Prediction 4:**

Will this code compile?

```rust
fn maybe_add_one(x: Option<i32>) -> Option<i32> {
    if let Some(i) = x {
        Some(i + 1)
    }
}
```

<details>
<summary>Answer</summary>

**No.** The function must return a value. The `if let` only handles the `Some` case. When `x` is `None`, the function doesn't return anything. This is a type mismatch.

</details>

---

## Mini Challenge

### Challenge 1 — Complete the Match

Complete the `match` expression for this enum:

```rust
enum TrafficLight {
    Red,
    Yellow,
    Green,
}

fn action(light: TrafficLight) -> &'static str {
    match light {
        // Complete this match
    }
}
```

### Challenge 2 — Bind the Data

Handle all variants of this enum, binding the data:

```rust
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}

fn process(msg: Message) {
    // Use match to handle all variants
}
```

### Challenge 3 — Convert to if let

Rewrite this `match` as an `if let`:

```rust
let config_max = Some(3u8);
match config_max {
    Some(max) => println!("The maximum is {}", max),
    _ => (),
}
```

### Challenge 4 — Convert to let...else

Rewrite this `if let` as a `let...else`:

```rust
fn describe_quarter(coin: Coin) -> Option<String> {
    if let Coin::Quarter(state) = coin {
        Some(format!("Quarter from {}", state))
    } else {
        None
    }
}
```

---

## Reflection

Write the answer to this question in a text file called `reflection-phase1-w4-d2.md` in your Phase 1 repository. Commit it.

**Question:**

"The compiler enforces exhaustiveness in match expressions. At first, this can feel tedious—you have to handle every variant, even the ones you don't care about. But this is actually a feature, not a bug. Explain why exhaustiveness is a safety guarantee, and describe a real scenario where it would prevent a bug."

<details>
<summary>Reflection Guidance</summary>

Exhaustiveness is a safety guarantee because it ensures that every possible state in your domain is handled. When you define an enum, you are defining all possible states. The compiler ensures that every place you use that enum handles every state.

**Real scenario:** You have an enum `OrderStatus` with variants `Pending`, `Processing`, `Shipped`, and `Delivered`. Your code uses `match` to send notifications to customers. You add a new variant `Cancelled`. The compiler tells you every match that needs to be updated. If you used a catch-all `_`, the `Cancelled` state would be silently handled, and customers wouldn't receive the correct notification.

Exhaustiveness is the compiler helping you maintain correctness as your system evolves. It is not a restriction—it is a safety net.

</details>

---

## End of Day 2, Week 4

### What You Have Accomplished

By the end of this session, you have:

- **Learned the match expression** and how it works.
- **Bound values from enum variants** using patterns.
- **Understood exhaustiveness** and why the compiler enforces it.
- **Used if let and let...else** as concise alternatives.
- **Recognized when to use match, if let, and let...else.**
- **Connected pattern matching to type safety and domain modeling.**

### What This Builds Toward

Tomorrow, you will build the Number Converter—your first project using enums and pattern matching.

**Week 4, Day 3 — Project Work: Number Converter**

You will:
- Define an enum `NumberBase` (Binary, Decimal, Hex, Octal).
- Parse user input from command-line arguments.
- Use match to handle each base.
- Convert numbers between bases.

You have the concepts. Tomorrow, you build.

### The Engineering Habit to Carry Forward

When you use `match`, resist the temptation to use `_` as a shortcut. Be explicit about every variant. The compiler is helping you maintain correctness.

If you find yourself using `_` frequently, ask yourself: "Do I genuinely not care about the other cases, or am I being lazy?"

Rest well. Tomorrow, you build the Number Converter.
