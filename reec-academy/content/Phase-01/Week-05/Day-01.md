---
id: P1-W5-D1
phase: 1
week: 5
day: 1
title: 'Error Handling: Result, Option, and the ? Operator'
subtitle: Building robust programs that handle failure gracefully
estimated_time: 75
difficulty: Intermediate
learning_objectives:
  - >-
    Distinguish between unrecoverable errors (panic!) and recoverable errors
    (Result)
  - Use the Result type to handle operations that can fail
  - Propagate errors with the ? operator
  - Use Option to represent values that may be absent
  - Choose appropriately between Result and Option for different scenarios
  - Create custom error types for domain-specific failures
  - Apply Appendix A.2's error handling philosophy
widgets:
  - story
  - mental-model
  - worked-example
  - engineering-note
  - compiler-thinking
  - mini-challenge
  - reflection
project:
  - Task Tracker v1 (planning)
failure_lab: null
reading:
  - 'The Rust Programming Language, Chapter 9 (Error Handling)'
  - >-
    REEC-05-Phase1-RustFoundations.md §1.3.6 (Result, Option, and the ?
    operator)
  - REEC-04-EngineeringStandardsAppendix.md §A.2 (Error Handling Philosophy)
tags:
  - error-handling
  - result
  - option
  - question-operator
  - propagation
next: P1-W5-D2
previous: P1-W4-D7
published: true
---

:::story

## The Developer Who Hated Error Messages

A developer—call her Priya—had been writing Rust for a few weeks. She was productive, but she had a secret: she hated error messages. Every time the compiler rejected her code, she felt a wave of frustration.

She learned to make the errors go away. She added `.unwrap()` everywhere. She used `.expect()` with generic messages. Her code compiled. It ran. It worked—most of the time.

Then one day, it didn't.

A file was missing. The program panicked with `thread 'main' panicked at src/main.rs:42:10: called \`Result::unwrap()\` on an \`Err\` value`. No context. No explanation. Just a crash.

Priya had no idea what had gone wrong. The error message told her *that* something failed, but not *what* failed or *why*. She spent an hour tracing through the code, trying to figure out which file was missing.

If she had used proper error handling, she could have printed a helpful message: `Error: Configuration file 'config.toml' not found in /etc/myapp`. But she hadn't. She had used `.unwrap()` everywhere.

She learned a painful lesson: error handling is not about making the compiler happy. It is about making the program robust. It is about giving users (and yourself) the information needed to diagnose problems.

Today, you learn to handle errors properly.

:::

:::mental-model

Before we dive into error handling, internalise these three mental models. They reframe error handling from a chore into a core engineering discipline.

**Mental Model 1 — Errors are a normal part of program execution.**

Operations fail. Files are missing. Networks are down. Input is invalid. This is not exceptional—it is expected.

Good error handling treats failures as normal, expected cases. It handles them gracefully. It provides useful information. It doesn't panic.

**Mental Model 2 — The type system is your ally in error handling.**

`Result<T, E>` encodes the possibility of failure in the type system. The compiler forces you to handle both the success and failure cases.

This is not a restriction. It is a safety guarantee. It ensures that you cannot ignore the possibility of failure.

**Mental Model 3 — Different operations have different failure modes.**

- `Result` is for operations that can fail for recoverable reasons (file not found, invalid input, network error).
- `Option` is for values that may be absent (first element of an empty vector, a configuration key that may not be set).
- `panic!` is for truly unrecoverable errors (programmer bugs, invariants violated).

Choosing the right tool for the job makes your code clearer and more robust.

:::

## Theory

### Unrecoverable Errors: panic!

`panic!` is for errors that should not be handled. The program cannot continue.

```rust
fn main() {
    // This will panic if the file doesn't exist
    let contents = std::fs::read_to_string("config.toml").unwrap();
}
```

**When to use `panic!`:**
- The error is a programmer bug (e.g., out-of-bounds access that should never happen).
- The program cannot continue safely.
- The error is truly unrecoverable.

**When NOT to use `panic!`:**
- Expected failures (file not found, invalid input).
- Any error that the user could reasonably fix.
- Any error that another part of the program could handle.

### Recoverable Errors: Result

`Result<T, E>` is the standard type for operations that can fail.

```rust
enum Result<T, E> {
    Ok(T),
    Err(E),
}
```

**`Ok(T)`** means the operation succeeded and produced a value of type `T`.

**`Err(E)`** means the operation failed and produced an error of type `E`.

### Handling Result with match

The most explicit way to handle a `Result` is with `match`:

```rust
use std::fs;

fn main() {
    let result = fs::read_to_string("config.toml");

    match result {
        Ok(contents) => println!("Config: {}", contents),
        Err(e) => eprintln!("Error reading config: {}", e),
    }
}
```

### Propagating Errors with ?

The `?` operator propagates errors upward:

```rust
fn read_config() -> Result<String, std::io::Error> {
    let contents = std::fs::read_to_string("config.toml")?;
    Ok(contents)
}
```

**What `?` does:**
- If the `Result` is `Ok`, it returns the value.
- If the `Result` is `Err`, it returns the error from the enclosing function.

**Rules for `?`:**
- Can only be used in functions that return `Result` or `Option`.
- The error type must be compatible with the function's return type.

### Custom Error Types

For larger projects, create custom error enums:

```rust
#[derive(Debug)]
enum AppError {
    Io(std::io::Error),
    ConfigNotFound,
    InvalidData(String),
}

impl std::fmt::Display for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AppError::Io(e) => write!(f, "I/O error: {}", e),
            AppError::ConfigNotFound => write!(f, "Configuration file not found"),
            AppError::InvalidData(s) => write!(f, "Invalid data: {}", s),
        }
    }
}

impl std::error::Error for AppError {}

impl From<std::io::Error> for AppError {
    fn from(err: std::io::Error) -> Self {
        AppError::Io(err)
    }
}
```

### Option vs. Result

**`Option<T>`:** A value is either present (`Some(T)`) or absent (`None`).

**`Result<T, E>`:** An operation either succeeded (`Ok(T)`) or failed (`Err(E)`).

**When to use `Option`:**
- A value may not exist (e.g., first element of an empty vector).
- The absence of a value is not an error.

**When to use `Result`:**
- An operation may fail for a recoverable reason.
- You need to know *why* the operation failed.

### The ? Operator with Option

`?` also works with `Option`:

```rust
fn first_char(s: &str) -> Option<char> {
    s.chars().next()
}

fn main() {
    let s = "hello";
    let first = first_char(s)?; // Some('h')
    println!("{}", first);
}
```

But `?` cannot be mixed: you cannot use `?` on a `Result` in a function that returns `Option`, or vice versa.

---

## Worked Example

### A Robust Configuration Loader

Let's build a configuration loader that handles errors properly.

```rust
use std::fs;
use std::path::Path;
use std::collections::HashMap;

#[derive(Debug)]
enum ConfigError {
    Io(std::io::Error),
    FileNotFound(String),
    ParseError(String),
}

impl std::fmt::Display for ConfigError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ConfigError::Io(e) => write!(f, "I/O error: {}", e),
            ConfigError::FileNotFound(path) => write!(f, "File not found: {}", path),
            ConfigError::ParseError(s) => write!(f, "Parse error: {}", s),
        }
    }
}

impl std::error::Error for ConfigError {}

impl From<std::io::Error> for ConfigError {
    fn from(err: std::io::Error) -> Self {
        ConfigError::Io(err)
    }
}

fn load_config(path: &Path) -> Result<HashMap<String, String>, ConfigError> {
    if !path.exists() {
        return Err(ConfigError::FileNotFound(path.display().to_string()));
    }

    let contents = fs::read_to_string(path)?;
    let mut config = HashMap::new();

    for line in contents.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with('#') {
            continue;
        }

        let parts: Vec<&str> = line.split('=').collect();
        if parts.len() != 2 {
            return Err(ConfigError::ParseError(format!(
                "Invalid line: '{}' (expected key=value)",
                line
            )));
        }

        let key = parts[0].trim().to_string();
        let value = parts[1].trim().to_string();
        config.insert(key, value);
    }

    Ok(config)
}

fn main() -> Result<(), ConfigError> {
    let config = load_config(Path::new("config.toml"))?;

    for (key, value) in &config {
        println!("{} = {}", key, value);
    }

    Ok(())
}
```

### Converting Unwrap to Proper Error Handling

**Before:**

```rust
fn read_file() -> String {
    let contents = std::fs::read_to_string("file.txt").unwrap();
    contents
}
```

**After:**

```rust
fn read_file() -> Result<String, std::io::Error> {
    let contents = std::fs::read_to_string("file.txt")?;
    Ok(contents)
}
```

**Or with custom error:**

```rust
fn read_file() -> Result<String, AppError> {
    let contents = std::fs::read_to_string("file.txt")?;
    Ok(contents)
}
```

---

## Engineering Notes

### Engineering Note: The Cost of unwrap()

`.unwrap()` is a convenient tool, but it comes at a cost:

- **No context:** When it panics, you don't know *why* the error occurred.
- **No recovery:** The program crashes instead of handling the error.
- **Hidden assumptions:** You are asserting that the operation will never fail.

**When `.unwrap()` is acceptable:**
- In examples and prototypes.
- In tests (where a panic is a test failure).
- When you know the value is always valid (e.g., a hardcoded constant).

**When `.expect()` is better:**
- When you want to provide context for the panic.
- When the assumption might be violated.

```rust
let contents = fs::read_to_string("config.toml")
    .expect("config.toml should exist in the current directory");
```

### Engineering Note: The ? Operator in main

In a `main` function that returns `Result`, you can use `?`:

```rust
fn main() -> Result<(), Box<dyn std::error::Error>> {
    let contents = std::fs::read_to_string("file.txt")?;
    println!("{}", contents);
    Ok(())
}
```

This prints the error to stderr and exits with a non-zero code.

### Engineering Note: Error Handling Philosophy

Per Appendix A.2:

- Library code returns `Result<T, E>`.
- `panic!` is for genuinely unrecoverable errors.
- `.unwrap()` is acceptable only in `main` or CLI entry points.
- `.expect("message")` is required over bare `.unwrap()`.

---

## Compiler Thinking

**Prediction 1:**

Will this code compile?

```rust
fn read_config() -> Result<String, std::io::Error> {
    let contents = std::fs::read_to_string("config.toml")?;
    Ok(contents)
}
```

<details>
<summary>Answer</summary>

**Yes.** The `?` operator propagates the `std::io::Error` upward. The function returns `Result<String, std::io::Error>`.

</details>

---

**Prediction 2:**

Will this code compile?

```rust
fn read_config() -> Option<String> {
    let contents = std::fs::read_to_string("config.toml")?;
    Some(contents)
}
```

<details>
<summary>Answer</summary>

**No.** `fs::read_to_string` returns `Result`, but the function returns `Option`. The `?` operator on `Result` can only be used in functions that return `Result`.

</details>

---

**Prediction 3:**

Will this code compile?

```rust
fn first_char(s: &str) -> Result<char, String> {
    let c = s.chars().next()?;
    Ok(c)
}
```

<details>
<summary>Answer</summary>

**No.** `chars().next()` returns `Option`, but the function returns `Result`. The `?` operator on `Option` can only be used in functions that return `Option`.

</details>

---

**Prediction 4:**

What is the return type of this function?

```rust
fn get_value() -> Result<i32, String> {
    Ok(42)
}
```

<details>
<summary>Answer</summary>

`Result<i32, String>` — the function returns a `Result` that is either `Ok(42)` or `Err` with a `String` error message.

</details>

---

## Mini Challenge

### Challenge 1 — Convert Unwrap to Proper Error Handling

Convert this code to use proper error handling:

```rust
fn load_data() -> String {
    let contents = std::fs::read_to_string("data.txt").unwrap();
    contents
}
```

### Challenge 2 — Add Custom Error Types

Add custom error types to the code from Challenge 1:

- `DataError::Io(std::io::Error)`
- `DataError::FileNotFound(String)`

### Challenge 3 — Implement a Function with ? and Custom Errors

Write a function `parse_number(s: &str) -> Result<i64, String>` that uses `?` to propagate errors from `parse()`.

### Challenge 4 — Distinguish Between Result and Option

For each scenario, choose whether to use `Result` or `Option`:

1. Getting the first element of a vector.
2. Opening a file.
3. Parsing a number from a string.
4. Looking up a value in a hash map.
5. Converting a string to uppercase.

---

## Reflection

Write the answer to this question in a text file called `reflection-phase1-w5-d1.md` in your Phase 1 repository. Commit it.

**Question:**

"In Phase 0, you learned that programs can fail in many ways—file not found, invalid input, out-of-memory, and more. Today, you learned that Rust's error handling system (`Result`, `Option`, `?`) forces you to handle these failures explicitly. Compare this to languages with exceptions (like Java or Python). What are the tradeoffs between explicit error handling and exceptions? Why does Rust choose explicit handling?"

<details>
<summary>Reflection Guidance</summary>

**Exceptions (Java, Python, etc.):**
- **Pros:** Code is less cluttered; errors can be caught at any level.
- **Cons:** Errors are invisible in the type system; you don't know what can fail without reading the documentation or source code.

**Explicit error handling (Rust):**
- **Pros:** Errors are visible in the type system; the compiler forces you to handle them; you always know what can fail.
- **Cons:** Code is more verbose; you must handle errors where they occur (or propagate them).

Rust chooses explicit error handling because it aligns with the language's philosophy: safety through visibility. Errors should not be hidden. They should be explicit, visible, and handled deliberately.

The tradeoff is between convenience and safety. Rust prioritises safety.

</details>

---

## End of Day 1, Week 5

### What You Have Accomplished

By the end of this session, you have:

- **Learned the difference between `panic!` and `Result`.**
- **Used the `Result` type to handle recoverable errors.**
- **Propagated errors with the `?` operator.**
- **Used `Option` for values that may be absent.**
- **Created custom error types** for domain-specific failures.
- **Applied Appendix A.2's error handling philosophy.**

### What This Builds Toward

Tomorrow, you will learn about collections (`Vec`, `HashMap`) and how ownership works inside them.

**Week 5, Day 2 — Collections and Ownership**

You will learn:
- How `Vec` owns its elements.
- How `HashMap` owns its keys and values.
- Iterating over collections with borrowing.
- Using enums to store multiple types in a collection.

The Task Tracker v1 will need all of these concepts. You are building the foundation for the Major project.

### The Engineering Habit to Carry Forward

When writing code that can fail, ask yourself:

1. Is this failure expected? (Use `Result`.)
2. Is this failure unrecoverable? (Use `panic!`.)
3. Is the value simply absent? (Use `Option`.)
4. Do I need to know why the failure occurred? (Use `Result` with a meaningful error type.)

This is the discipline of robust software. Failures are not exceptional. They are expected. Handle them deliberately.

Rest well. Tomorrow, you learn about collections.
