---
id: P1-W3-D5
phase: 1
week: 3
day: 5
title: 'Project Work: Calculator CLI — Milestones 2 and 3'
subtitle: Completing your first real Rust program with full error handling and tests
estimated_time: 90
difficulty: Beginner
learning_objectives:
  - Complete the Calculator CLI with full operator support
  - 'Handle division-by-zero as a Result error, not a panic'
  - 'Handle malformed input with clear, helpful error messages'
  - Write unit tests for the evaluate function
  - Apply the Universal Definition of Done to a real project
  - Reflect on the journey from Phase 0 to first working Rust program
widgets:
  - story
  - mental-model
  - worked-example
  - engineering-note
  - compiler-thinking
  - mini-challenge
  - reflection
project:
  - Calculator CLI (Milestones 2 and 3 — evaluation + error handling)
failure_lab: null
reading:
  - REEC-05-Phase1-RustFoundations.md §1.12 (Project 01 — Calculator CLI)
  - REEC-04-EngineeringStandardsAppendix.md §A.4 (Testing Philosophy)
  - REEC-04-EngineeringStandardsAppendix.md §A.2 (Error Handling Philosophy)
tags:
  - project
  - cli
  - error-handling
  - testing
  - completion
next: P1-W3-D6
previous: P1-W3-D4
published: true
---

:::story

## The Moment It All Clicked

A developer—call her Sarah—had been working on the Calculator CLI for two days. She had completed Milestone 1. The program parsed command-line arguments and printed them back. But it still panicked on invalid input.

She opened the code and looked at the `evaluate` function:

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

She was proud of this function. It handled division by zero without panicking. It returned a `Result` so the caller had to handle the error.

But she still had to complete Milestones 2 and 3. She needed to handle malformed input and write tests.

She started writing tests:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_addition() {
        let result = evaluate(5.0, '+', 3.0);
        assert_eq!(result, Ok(8.0));
    }

    #[test]
    fn test_division_by_zero() {
        let result = evaluate(5.0, '/', 0.0);
        assert_eq!(result, Err("Cannot divide by zero".to_string()));
    }
}
```

She ran `cargo test`. Two tests passed. She felt a thrill of satisfaction.

Then she ran `cargo run -- five + 3`. It panicked. She hadn't implemented validation for malformed input yet.

She added the validation:

```rust
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
    // ... similar for op and b
}
```

Now `cargo run -- five + 3` printed a helpful error message instead of panicking.

Sarah ran `cargo fmt`, `cargo clippy -D warnings`, and `cargo test`. Everything passed. She looked at her code. It was complete. It was correct. It was her first real Rust program.

She smiled. The systems thinking from Phase 0 had paid off. Every decision she made was deliberate. She understood every line of code.

Today, you complete your first real Rust program.

:::

:::mental-model

Before we dive into completing the Calculator CLI, internalise these three mental models. They reframe testing and error handling from an afterthought into a core engineering discipline.

**Mental Model 1 — A program is not complete until it handles errors gracefully.**

A calculator that panics when the user types `five` instead of `5` is not a professional tool. It is a prototype. Professional software expects users to make mistakes and handles them gracefully.

Error handling is not optional. It is part of the program's functionality. If your program cannot handle malformed input, it is not complete.

**Mental Model 2 — Tests are not a luxury. They are a requirement.**

The Universal Definition of Done requires tests. But tests are not just a checkbox. They are:

- **Documentation:** They show how the code is supposed to behave.
- **Safety net:** They catch regressions when you change the code.
- **Confidence:** They prove the code works as expected.

A program without tests is a program whose correctness is unproven.

**Mental Model 3 — The Definition of Done is not the end. It is the standard.**

The Universal Definition of Done is not a checklist to be completed once. It is a standard to be maintained throughout the project. Every commit, every change, every new feature—all must meet the standard.

The Calculator CLI is your first project. It sets the standard for every project to come. Make it count.

:::

## Theory

### Project Completion: Calculator CLI

Per REEC-05-Phase1-RustFoundations.md §1.12, the Calculator CLI has three milestones:

**Milestone 1 (Completed Day 3):** Parse two valid numbers and an operator, print raw values back.

**Milestone 2 (Today):** Evaluate all four operators correctly, including division-by-zero returning an `Err`, not a `panic!`.

**Milestone 3 (Today):** Handle malformed input (non-numeric, missing operator) with a helpful error message, not a `panic!`.

### The Universal Definition of Done

The Calculator CLI is the first project to which the Universal Definition of Done applies in full:

```
✓ cargo build            — compiles clean
✓ cargo fmt               — formatted
✓ cargo clippy -D warnings — zero lint warnings
✓ cargo test               — passing test suite
✓ Documentation            — README + API docs
✓ Code Review checklist     — self-reviewed against a rubric
```

(Benchmarks, Architecture Diagram, and Engineering Decision Journal are not required for a project of this size. They scale in as projects grow.)

### Error Handling Strategy

Per Appendix A.2:

- Library code (`evaluate`) returns `Result<T, E>` with meaningful error types.
- Application code (`main`) uses `.expect()` only for truly unrecoverable errors.
- `panic!` is reserved for genuinely unrecoverable programmer errors.
- Expected failures (invalid input, division by zero) are `Result` cases.

For the Calculator CLI:

- `evaluate` returns `Result<f64, String>`.
- `main` handles `Result` by printing error messages and exiting.
- `panic!` is not used for error handling.

### Testing Strategy

Per Appendix A.4:

- Unit tests live inline (`#[cfg(test)] mod tests`).
- Tests target pure logic (`evaluate`).
- Test names state the scenario and expected outcome.

For the Calculator CLI:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn addition_works() {
        assert_eq!(evaluate(5.0, '+', 3.0), Ok(8.0));
    }

    #[test]
    fn division_by_zero_returns_error() {
        assert_eq!(evaluate(5.0, '/', 0.0), Err("Cannot divide by zero".to_string()));
    }

    #[test]
    fn unknown_operator_returns_error() {
        assert_eq!(evaluate(5.0, 'x', 3.0), Err("Unknown operator: x".to_string()));
    }
}
```

### The Completed Code

**src/main.rs:**

```rust
use std::env;

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

fn main() {
    let args: Vec<String> = env::args().collect();

    // Check for help flag
    if args.len() == 2 && (args[1] == "--help" || args[1] == "-h") {
        println!("Calculator CLI");
        println!("Usage: {} <number> <operator> <number>", args[0]);
        println!("\nOperators:");
        println!("  +   Addition");
        println!("  -   Subtraction");
        println!("  *   Multiplication");
        println!("  /   Division");
        println!("\nExample:");
        println!("  {} 5 + 3", args[0]);
        return;
    }

    if args.len() != 4 {
        eprintln!("Usage: {} <number> <operator> <number>", args[0]);
        eprintln!("Use --help for more information");
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

---

## Worked Example

### Completing the Calculator CLI: Step by Step

#### Step 1: Add the `--help` Flag

Add support for `--help` at the beginning of `main`:

```rust
if args.len() == 2 && (args[1] == "--help" || args[1] == "-h") {
    println!("Calculator CLI");
    println!("Usage: {} <number> <operator> <number>", args[0]);
    println!("\nOperators:");
    println!("  +   Addition");
    println!("  -   Subtraction");
    println!("  *   Multiplication");
    println!("  /   Division");
    println!("\nExample:");
    println!("  {} 5 + 3", args[0]);
    return;
}
```

#### Step 2: Add Unit Tests

Add a test module at the bottom of the file:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn addition_works() {
        assert_eq!(evaluate(5.0, '+', 3.0), Ok(8.0));
    }

    #[test]
    fn subtraction_works() {
        assert_eq!(evaluate(10.0, '-', 4.0), Ok(6.0));
    }

    #[test]
    fn multiplication_works() {
        assert_eq!(evaluate(6.0, '*', 7.0), Ok(42.0));
    }

    #[test]
    fn division_works() {
        assert_eq!(evaluate(15.0, '/', 3.0), Ok(5.0));
    }

    #[test]
    fn division_by_zero_returns_error() {
        let result = evaluate(5.0, '/', 0.0);
        assert_eq!(result, Err("Cannot divide by zero".to_string()));
    }

    #[test]
    fn unknown_operator_returns_error() {
        let result = evaluate(5.0, 'x', 3.0);
        assert_eq!(result, Err("Unknown operator: x".to_string()));
    }
}
```

#### Step 3: Run the Checks

```bash
# Check the code compiles
cargo build

# Format the code
cargo fmt

# Lint the code
cargo clippy -D warnings

# Run the tests
cargo test
```

#### Step 4: Test the Program

**Test 1: Addition**

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

**Test 4: Help flag**

```bash
$ cargo run -- --help
Calculator CLI
Usage: target/debug/calculator_cli <number> <operator> <number>

Operators:
  +   Addition
  -   Subtraction
  *   Multiplication
  /   Division

Example:
  target/debug/calculator_cli 5 + 3
```

#### Step 5: Commit the Changes

```bash
git add src/main.rs
git commit -m "feat: complete calculator CLI with full error handling and tests

- Add --help flag with usage information
- Handle all four operators with division-by-zero check
- Validate all inputs with helpful error messages
- Add unit tests for evaluate function
- All tests passing; clippy warnings resolved
"
```

---

## Engineering Notes

### Engineering Note: The `#[cfg(test)]` Attribute

The `#[cfg(test)]` attribute tells the compiler to include the test module only when running tests (`cargo test`). This saves compile time and binary size when building for production.

The tests module is a regular module. It can access private functions from the parent module via `use super::*`.

### Engineering Note: Test Naming Conventions

Per Appendix A.4, test names should state the scenario and expected outcome:

- `addition_works` — describes the scenario and expected result.
- `division_by_zero_returns_error` — describes the scenario and expected result.
- `unknown_operator_returns_error` — describes the scenario and expected result.

Good test names serve as documentation. They tell you what the code is supposed to do.

### Engineering Note: Error Messages Are for Humans

When a user sees `Error: 'five' is not a valid number`, they know exactly what went wrong and how to fix it. When they see `thread 'main' panicked at src/main.rs:17:39`, they don't.

Good error messages are:
- **Clear:** Explain the problem in plain English.
- **Actionable:** Tell the user what to do.
- **Helpful:** Point to the specific input that caused the problem.

---

## Compiler Thinking

**Prediction 1:**

Will this code compile?

```rust
fn evaluate(a: f64, op: char, b: f64) -> f64 {
    // no error handling
    a + b
}
```

<details>
<summary>Answer</summary>

**Yes.** But the function signature doesn't match the project specification. The specification says `evaluate` must return `Result<f64, String>` to handle errors.

</details>

---

**Prediction 2:**

Why does `cargo clippy -D warnings` fail if there are warnings?

<details>
<summary>Answer</summary>

`-D warnings` tells Clippy to treat warnings as errors. The compiler will not produce a binary if there are any warnings.

This is a good practice for production code. It ensures that all lints are fixed before code is shipped.

</details>

---

**Prediction 3:**

Why do we use `#[cfg(test)]` instead of just putting tests in a separate file?

<details>
<summary>Answer</summary>

Rust supports both approaches. `#[cfg(test)]` is idiomatic for unit tests that live in the same file as the code they test. This gives them access to private functions.

Integration tests live in the `tests/` directory and only have access to public functions.

</details>

---

## Mini Challenge

### Challenge 1 — Add a Test for Very Large Numbers

Write a test that verifies the calculator handles very large numbers correctly. Use `f64::MAX`.

<details>
<summary>Solution</summary>

```rust
#[test]
fn large_numbers_work() {
    let result = evaluate(f64::MAX, '/', 2.0);
    assert!(result.is_ok());
    // f64::MAX / 2.0 is about half of f64::MAX
}
```

</details>

---

### Challenge 2 — Add Support for `%` (Modulo)

Extend the calculator to support the `%` operator for modulo. Use the `%` operator on `f64` (note: Rust's `%` on floats is valid but not the same as integer modulo).

<details>
<summary>Solution</summary>

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
        '%' => Ok(a % b),
        _ => Err(format!("Unknown operator: {}", op)),
    }
}
```

</details>

---

### Challenge 3 — The Code Review Checklist

Apply Appendix A.9's Code Review Checklist to your Calculator CLI:

```
[ ] Does this match the Project Specification's stated Requirements?
[ ] Does every public function have a doc comment explaining WHY?
[ ] Are names legible without needing to open the function body?
[ ] Is error handling consistent with A.2 — no bare unwrap() outside main?
[ ] Do tests cover the risk surface named in the spec's Failure Modes?
[ ] Does cargo clippy -D warnings pass clean?
[ ] Would a stranger understand how to run and test this from the README?
[ ] Is there anything I'd be embarrassed to explain the reasoning for?
```

---

## Reflection

Write the answer to this question in a text file called `reflection-phase1-d5.md` in your Phase 1 repository. Commit it.

**Question:**

"You have now completed your first real Rust program—the Calculator CLI. You started Phase 0 knowing almost nothing about systems. Now you have written a program that compiles cleanly, passes all tests, handles errors gracefully, and meets the Definition of Done. What is the most important thing you learned during this journey from Phase 0 to your first working Rust program?"

<details>
<summary>Reflection Guidance</summary>

The most important thing you learned is that programming is not just about writing code. It is about understanding the system, making deliberate decisions, and building with discipline.

In Phase 0, you learned that a program is data before it is behaviour. You learned that memory is organised address space. You learned about the compilation pipeline, the toolchain, and the CPU.

In Phase 1, you learned Rust's ownership and borrowing rules. You learned that they are not arbitrary restrictions—they are compile-time enforcement of the exact discipline you traced by hand.

The Calculator CLI is the first proof that the system works. It is not a large program, but it is a correct one. You wrote it with intention, with understanding, with discipline.

That is what makes you an engineer, not just a programmer.

</details>

---

## End of Day 5, Week 3

### What You Have Accomplished

By the end of this session, you have:

- **Completed the Calculator CLI** with full operator support.
- **Handled all errors gracefully** — no panics for expected failures.
- **Written unit tests** covering all operators and edge cases.
- **Applied the Universal Definition of Done** to your first project.
- **Confirmed the code compiles, formats, lints, and passes tests.**
- **Committed with meaningful messages** per Appendix A.8.

### What This Builds Toward

The Calculator CLI is complete. But it is only the first project.

**Tomorrow, Day 6, is the Engineering Review.** You will self-assess against the rubric, identify areas for improvement, and plan a refactor pass.

**Week 4 begins after the rest day.** You will learn about structs, enums, and pattern matching, and build the Number Converter and File Organizer.

You have proven that you can write Rust code. Now you will learn to write better Rust code.

### The Engineering Habit to Carry Forward

Before you mark a project as "done," apply the Definition of Done. Every time.

Ask yourself:

1. Does it compile?
2. Is it formatted?
3. Does it pass Clippy?
4. Does it pass tests?
5. Is it documented?
6. Is it reviewed?
7. Are tradeoffs recorded?

This is the discipline that makes you a professional engineer.

Rest well. Tomorrow, you review your work.
