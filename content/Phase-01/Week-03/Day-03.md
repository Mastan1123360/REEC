---
id: P1-W3-D3
phase: 1
week: 3
day: 3
title: 'Project Work: Calculator CLI — Milestone 1'
subtitle: Your first real Rust program — parsing input and handling commands
estimated_time: 90
difficulty: Beginner
learning_objectives:
  - Create a new Rust project with Cargo
  - Read command-line arguments and standard input
  - Parse and validate user input
  - Handle errors using Result and Option
  - Apply ownership and borrowing correctly in a real program
  - Write meaningful commit messages for a project
widgets:
  - story
  - mental-model
  - worked-example
  - engineering-note
  - compiler-thinking
  - mini-challenge
  - reflection
project:
  - Calculator CLI (Milestone 1 — parse input)
failure_lab: null
reading:
  - REEC-05-Phase1-RustFoundations.md §1.12 (Project 01 — Calculator CLI)
  - REEC-04-EngineeringStandardsAppendix.md (review)
tags:
  - project
  - cli
  - parsing
  - error-handling
  - first-program
next: P1-W3-D4
previous: P1-W3-D2
published: true
---

:::story

## The First Real Program

A developer—call her Elena—had completed Phase 0. She understood systems, memory, and the toolchain. She had learned ownership and borrowing. She was ready to write real Rust code.

She opened her editor and created a new Cargo project:

```bash
cargo new calculator_cli
```

The moment had finally come. After two weeks of theory, she was going to build something real.

She opened `src/main.rs` and stared at the blank space. The words from Phase 0 echoed in her mind: *"A program is data before it is behaviour."* She thought about the compilation pipeline. She thought about memory. She thought about ownership.

She started typing.

The Calculator CLI would accept two numbers and an operator, compute the result, and print it. Simple. But every line of code she wrote was a decision: *Where does this data live? Who owns it? When does it go away?*

She wrote a function to evaluate the expression:

```rust
fn evaluate(a: f64, op: char, b: f64) -> Result<f64, String> {
    match op {
        '+' => Ok(a + b),
        '-' => Ok(a - b),
        '*' => Ok(a * b),
        '/' => {
            if b == 0.0 {
                Err("Cannot divide by zero".to_string())
            } else {
                Ok(a / b)
            }
        }
        _ => Err(format!("Unknown operator: {}", op)),
    }
}
```

She ran `cargo check`. It compiled. She ran `cargo run -- 5 + 3`. It worked.

Elena had written her first real Rust program. It wasn't much. But it was hers. And she had written it with intention, understanding every decision she made.

Today, you do the same.

:::

:::mental-model

Before we dive into building the Calculator CLI, internalise these three mental models. They reframe project work from following instructions to making deliberate engineering decisions.

**Mental Model 1 — Every line of code is a decision about ownership.**

When you write Rust code, you are not just writing instructions for the computer. You are making decisions about data ownership.

- `String` vs. `&str`: Are you taking ownership or borrowing?
- `Vec<T>` vs. `&[T]`: Are you owning the collection or viewing it?
- `.clone()` vs. `&`: Are you copying or borrowing?

Every choice has consequences. The best Rust code makes these choices deliberately.

**Mental Model 2 — The compiler is not an enemy. It is a teacher.**

Rust's compiler is famous for its helpful error messages. They are not just telling you what is wrong. They are teaching you the rules.

When the compiler rejects your code, it is showing you a problem you didn't see. It is protecting you from a bug. Instead of fighting the compiler, learn from it.

**Mental Model 3 — A "working" program is not enough. Engineering is about correctness, maintainability, and clarity.**

Your Calculator CLI could be a quick hack that works for simple inputs. But engineering is about more than "it works." It is about:

- **Correctness:** Does it handle edge cases?
- **Maintainability:** Can you read it in six months?
- **Clarity:** Is it obvious what each part does?

The projects in REEC are not exercises to be completed. They are engineering artifacts to be built with care.

:::

## Theory

### Project Overview: Calculator CLI

Per REEC-05-Phase1-RustFoundations.md §1.12, the Calculator CLI is your first real Rust program. It has three milestones:

**Milestone 1 (Today):** Parse two valid numbers and an operator, print raw values back.

**Milestone 2 (Day 5):** Evaluate all four operators correctly, including division-by-zero returning an `Err`, not a `panic!`.

**Milestone 3 (Day 5):** Handle malformed input (non-numeric, missing operator) with a helpful error message, not a `panic!`.

### Project Architecture

The Calculator CLI is deliberately simple:

```
┌─────────────────┐
│  main()         │
│  - Read args    │
│  - Parse input  │
│  - Evaluate     │
│  - Print result │
└─────────────────┘
```

**Subsystems:**
- A single `evaluate` function (pure logic)
- A thin `main` function (I/O and parsing)
- No external crates—`std` only

**Interfaces:**

```rust
fn evaluate(a: f64, op: char, b: f64) -> Result<f64, String>
```

**Data flow:**
- Command-line arguments or `stdin` → parse → evaluate → print

### Setting Up the Project

**Step 1: Create a new Cargo project**

```bash
cargo new calculator_cli
cd calculator_cli
```

**Step 2: Understand the project structure**

```
calculator_cli/
├── Cargo.toml          # Project manifest
├── .gitignore          # Git ignore (generated)
└── src/
    └── main.rs         # The program entry point
```

**Step 3: Initialize Git**

```bash
git init
git add .
git commit -m "feat: initial commit — calculator_cli project scaffold"
```

### Reading Command-Line Arguments

Rust's standard library provides `std::env::args()` for reading command-line arguments.

```rust
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();
    println!("{:?}", args);
}
```

When you run `cargo run -- 5 + 3`, `args` will be:

```rust
["target/debug/calculator_cli", "5", "+", "3"]
```

The first argument is always the program name. The rest are the arguments you provided.

### Parsing Arguments

For Milestone 1, you need to read two numbers and an operator:

```rust
fn main() {
    let args: Vec<String> = env::args().collect();

    // For now, expect exactly four arguments: program name, a, op, b
    let a = args[1].parse::<f64>().unwrap();
    let op = args[2].chars().next().unwrap();
    let b = args[3].parse::<f64>().unwrap();

    println!("a = {}, op = {}, b = {}", a, op, b);
}
```

This is the simplest possible implementation. It will compile and run, but it will panic if the user provides invalid input.

### What's Wrong with `.unwrap()`?

In Phase 0, you learned that `panic!` is for unrecoverable errors. A user providing invalid input is *not* an unrecoverable error—it's expected failure.

`.unwrap()` is acceptable in:
- Examples and prototypes
- Tests
- Situations where you know the value is always valid

It is not acceptable in production code. For the Calculator CLI, you must handle errors gracefully.

### The `evaluate` Function

```rust
fn evaluate(a: f64, op: char, b: f64) -> Result<f64, String> {
    match op {
        '+' => Ok(a + b),
        '-' => Ok(a - b),
        '*' => Ok(a * b),
        '/' => {
            if b == 0.0 {
                Err("Cannot divide by zero".to_string())
            } else {
                Ok(a / b)
            }
        }
        _ => Err(format!("Unknown operator: {}", op)),
    }
}
```

This function does not panic. It returns a `Result` that the caller must handle.

### Handling Errors in `main`

```rust
fn main() {
    let args: Vec<String> = env::args().collect();

    // Basic validation
    if args.len() != 4 {
        eprintln!("Usage: {} <number> <operator> <number>", args[0]);
        std::process::exit(1);
    }

    let a = match args[1].parse::<f64>() {
        Ok(num) => num,
        Err(_) => {
            eprintln!("Error: '{}' is not a valid number", args[1]);
            std::process::exit(1);
        }
    };

    let op = match args[2].chars().next() {
        Some(c) => c,
        None => {
            eprintln!("Error: missing operator");
            std::process::exit(1);
        }
    };

    let b = match args[3].parse::<f64>() {
        Ok(num) => num,
        Err(_) => {
            eprintln!("Error: '{}' is not a valid number", args[3]);
            std::process::exit(1);
        }
    };

    match evaluate(a, op, b) {
        Ok(result) => println!("{}", result),
        Err(e) => {
            eprintln!("Error: {}", e);
            std::process::exit(1);
        }
    }
}
```

Notice the use of `eprintln!` for errors (standard error stream) and `println!` for output (standard output stream).

---

## Worked Example

### Building the Calculator CLI: Step by Step

#### Step 1: Create the Project

```bash
$ cargo new calculator_cli
$ cd calculator_cli
$ git add .
$ git commit -m "feat: initial commit — calculator_cli project scaffold"
```

#### Step 2: Write the `evaluate` Function

Add the `evaluate` function to `src/main.rs`:

```rust
fn evaluate(a: f64, op: char, b: f64) -> Result<f64, String> {
    match op {
        '+' => Ok(a + b),
        '-' => Ok(a - b),
        '*' => Ok(a * b),
        '/' => {
            if b == 0.0 {
                Err("Cannot divide by zero".to_string())
            } else {
                Ok(a / b)
            }
        }
        _ => Err(format!("Unknown operator: {}", op)),
    }
}
```

#### Step 3: Write the `main` Function

Add the `main` function that reads arguments and calls `evaluate`:

```rust
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();

    if args.len() != 4 {
        eprintln!("Usage: {} <number> <operator> <number>", args[0]);
        std::process::exit(1);
    }

    let a = match args[1].parse::<f64>() {
        Ok(num) => num,
        Err(_) => {
            eprintln!("Error: '{}' is not a valid number", args[1]);
            std::process::exit(1);
        }
    };

    let op = match args[2].chars().next() {
        Some(c) => c,
        None => {
            eprintln!("Error: missing operator");
            std::process::exit(1);
        }
    };

    let b = match args[3].parse::<f64>() {
        Ok(num) => num,
        Err(_) => {
            eprintln!("Error: '{}' is not a valid number", args[3]);
            std::process::exit(1);
        }
    };

    match evaluate(a, op, b) {
        Ok(result) => println!("{}", result),
        Err(e) => {
            eprintln!("Error: {}", e);
            std::process::exit(1);
        }
    }
}
```

#### Step 4: Test the Program

**Test 1: Correct input**

```bash
$ cargo run -- 5 + 3
8
```

**Test 2: Division by zero**

```bash
$ cargo run -- 5 / 0
Error: Cannot divide by zero
```

**Test 3: Invalid number**

```bash
$ cargo run -- five + 3
Error: 'five' is not a valid number
```

**Test 4: Missing arguments**

```bash
$ cargo run -- 5 +
Usage: target/debug/calculator_cli <number> <operator> <number>
```

#### Step 5: Commit the Changes

```bash
$ git add src/main.rs
$ git commit -m "feat: implement calculator CLI with basic error handling

- Parse command-line arguments
- Evaluate +, -, *, / with division-by-zero check
- Return errors for invalid input
- Use eprintln! for errors, println! for output"
```

---

## Engineering Notes

### Engineering Note: Using `eprintln!` for Errors

`println!` writes to standard output (stdout). `eprintln!` writes to standard error (stderr).

Why does this matter?

```bash
$ cargo run -- 5 + 3 > output.txt
8
```

If you use `println!` for errors, errors will be captured in `output.txt`. If you use `eprintln!` for errors, errors will still appear on the terminal while `output.txt` contains only the valid output.

Professional CLI tools use `eprintln!` for errors and `println!` for normal output.

### Engineering Note: The `Result` Type

The `evaluate` function returns `Result<f64, String>`. This is the standard pattern for fallible functions in Rust.

- `Ok(result)` means the operation succeeded.
- `Err(message)` means the operation failed.

The caller must handle both cases. This makes error handling explicit and visible.

### Engineering Note: Reading Command-Line Arguments

`std::env::args()` returns an iterator. You can collect it into a `Vec<String>` for easy access.

For more complex CLI tools, you would use `clap` or `structopt`. But for this project, `std::env::args()` is sufficient.

---

## Compiler Thinking

**Prediction 1:**

Will this code compile?

```rust
fn evaluate(a: f64, op: char, b: f64) -> Result<f64, String> {
    match op {
        '+' => a + b,
        '-' => a - b,
        '*' => a * b,
        '/' => a / b,
        _ => Err(format!("Unknown operator: {}", op)),
    }
}
```

<details>
<summary>Answer</summary>

**No.** The `+`, `-`, and `*` arms return `f64`, but the `_` arm returns `Result`. The `match` expression must return the same type in all arms.

The fix is to wrap the arithmetic results in `Ok()`:

```rust
fn evaluate(a: f64, op: char, b: f64) -> Result<f64, String> {
    match op {
        '+' => Ok(a + b),
        '-' => Ok(a - b),
        '*' => Ok(a * b),
        '/' => {
            if b == 0.0 {
                Err("Cannot divide by zero".to_string())
            } else {
                Ok(a / b)
            }
        }
        _ => Err(format!("Unknown operator: {}", op)),
    }
}
```

</details>

---

**Prediction 2:**

Will this code compile?

```rust
fn main() {
    let args: Vec<String> = env::args().collect();
    let a = args[1].parse::<f64>().unwrap();
}
```

<details>
<summary>Answer</summary>

**Yes, but with a warning.** The code will compile, but if the user provides invalid input, it will panic. The compiler will not warn you about this.

This is why `.unwrap()` is acceptable only when you know the value is always valid.

</details>

---

**Prediction 3:**

Why does the compiler allow `.unwrap()` if it can panic?

<details>
<summary>Answer</summary>

Rust does not prevent you from writing code that can panic. Panics are a legitimate way to handle unrecoverable errors.

The compiler trusts you to make the right decision. If you use `.unwrap()`, you are asserting that the value will always be valid. If you are wrong, the program panics.

The engineering discipline is to only use `.unwrap()` when you can prove the value is valid.

</details>

---

## Mini Challenge

### Challenge 1 — Add Subtraction and Multiplication Tests

Write two additional tests for the `evaluate` function:

1. `10 - 5` should return `5`
2. `6 * 7` should return `42`

### Challenge 2 — Handle Extra Whitespace

Modify the program so that it handles extra whitespace in the operator. For example, `5 + 3` and `5    +    3` should both work.

<details>
<summary>Hint</summary>

Use `.trim()` on the operator string before taking the first character.
</details>

### Challenge 3 — Add Support for `--help`

Add support for a `--help` flag that prints usage information:

```bash
$ cargo run -- --help
Usage: calculator_cli <number> <operator> <number>

Operators:
  +   Addition
  -   Subtraction
  *   Multiplication
  /   Division
```

<details>
<summary>Hint</summary>

Check `args[1]` for `"--help"` or `"-h"` before parsing numbers.
</details>

---

## Reflection

Write the answer to this question in a text file called `reflection-phase1-d3.md` in your Phase 1 repository. Commit it.

**Question:**

"Your Calculator CLI now handles invalid input gracefully—it doesn't panic, and it prints helpful error messages. Compare this to the Phase 0 Opening Story, where a C program with `gets()` would allow a buffer overflow. What is the difference in philosophy between these two approaches to handling unexpected input? Why does Rust make you handle errors explicitly?"

<details>
<summary>Reflection Guidance</summary>

The Phase 0 C program assumed the user would always provide valid input. It didn't check bounds, it didn't validate input, and it didn't handle errors. When the user provided invalid input, the program's behaviour was undefined—it could crash, corrupt memory, or execute arbitrary code.

The Calculator CLI assumes the user might provide invalid input. It validates, checks, and handles errors explicitly. When the user provides invalid input, the program prints a helpful error message and exits cleanly.

Rust makes you handle errors explicitly because undefined behaviour is unacceptable in a systems language. The compiler enforces that you either handle errors or explicitly state that you are ignoring them (with `.unwrap()` or `.expect()`). This makes error handling visible and intentional.

The philosophy is: safety is not optional. The compiler will not let you write code that has undefined behaviour.

</details>

---

## End of Day 3, Week 3

### What You Have Accomplished

By the end of this session, you have:

- **Created your first real Rust project** with Cargo.
- **Read command-line arguments** using `std::env::args()`.
- **Parsed and validated user input** with `Result` and `match`.
- **Handled errors gracefully** without panicking.
- **Written a pure `evaluate` function** that returns `Result`.
- **Applied ownership and borrowing** correctly.
- **Committing with meaningful messages** per Appendix A.8.

### What This Builds Toward

Your Calculator CLI is not finished yet. Milestones 2 and 3 (Day 5) will add:
- Full operator support with correct precedence
- More robust error handling
- Unit tests (Project 01's testing strategy requires them)

**Tomorrow, Day 4, is Failure Lab 1.** You will diagnose intentionally broken code and build the habit of reading borrow-checker errors as descriptions of real hazards.

Your first Rust program is taking shape. The foundation is solid.

Rest well. Tomorrow, you learn to read compiler errors.
