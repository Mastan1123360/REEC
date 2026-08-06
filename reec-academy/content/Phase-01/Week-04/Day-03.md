---
id: P1-W4-D3
phase: 1
week: 4
day: 3
title: 'Project Work: Number Converter'
subtitle: Building a CLI tool with enums and exhaustive pattern matching
estimated_time: 90
difficulty: Beginner
learning_objectives:
  - Define and use an enum to model possible number bases
  - Parse command-line arguments for base and value
  - Use exhaustive pattern matching to handle different bases
  - 'Perform conversions between binary, decimal, hex, and octal'
  - Handle invalid input gracefully with Result and Option
  - Write tests for conversion logic
  - Apply ownership and borrowing correctly in a larger program
widgets:
  - story
  - mental-model
  - worked-example
  - engineering-note
  - compiler-thinking
  - mini-challenge
  - reflection
project:
  - Number Converter (full build)
failure_lab: null
reading:
  - REEC-05-Phase1-RustFoundations.md §1.12 (Project 02 — Number Converter)
  - REEC-04-EngineeringStandardsAppendix.md §A.2 (Error Handling Philosophy)
tags:
  - project
  - cli
  - enums
  - pattern-matching
  - number-conversion
next: P1-W4-D4
previous: P1-W4-D2
published: true
---

:::story

## The Developer Who Needed to Convert

A developer—call her Priya—was working on a firmware project. The firmware logs contained numbers in different formats: binary for register values, hex for memory addresses, and decimal for sensor readings. She was constantly converting between bases, and she was tired of doing it by hand.

She wrote a quick Python script to do the conversions. It worked, but it was slow and required her to copy-paste values. She wanted a command-line tool that could convert any number from any base to any base.

She started writing it in Rust. She knew she needed an enum for the bases:

```rust
enum NumberBase {
    Binary,
    Decimal,
    Hex,
    Octal,
}
```

She parsed the command-line arguments, matched on the base, and converted the value. It was the perfect project to practice enums and pattern matching.

Today, you build the Number Converter.

:::

:::mental-model

Before we dive into building the Number Converter, internalise these three mental models. They reframe the project from a syntax exercise into a genuine domain-modeling challenge.

**Mental Model 1 — An enum is a complete list of possibilities.**

When you define `NumberBase`, you are saying: "A number can be represented in exactly these four bases." This is the complete set. There are no other bases (for this project).

The compiler will enforce that you handle all four bases in every `match`. This is the guarantee of exhaustiveness.

**Mental Model 2 — Conversion is a pure function.**

Converting a number from one base to another is a pure transformation. It takes a value and a base and returns a new representation. It has no side effects.

Pure functions are easy to test, easy to reason about, and easy to reuse.

**Mental Model 3 — The CLI is the interface; the logic is the core.**

The command-line interface is just a wrapper around the core logic. The core logic should be testable without any I/O. The CLI should be a thin shell that parses arguments, calls the core logic, and prints the result.

This separation of concerns makes testing easier and the code more maintainable.

:::

## Theory

### Project Overview: Number Converter

Per REEC-05-Phase1-RustFoundations.md §1.12, the Number Converter has one milestone:

**Milestone 1 (Today):** Convert a number between binary, decimal, hex, and octal, given the source and target base.

**Project Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│                      Number Converter                      │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │   CLI Layer (main.rs)                                │ │
│  │   - Parse command-line arguments                     │ │
│  │   - Parse source and target bases                    │ │
│  │   - Parse the value to convert                       │ │
│  │   - Print the result or an error                     │ │
│  └───────────────────────────────────────────────────────┘ │
│                           │                                 │
│                           ▼                                 │
│  ┌───────────────────────────────────────────────────────┐ │
│  │   Conversion Logic (evaluate or separate module)     │ │
│  │   - convert(value: &str, from: NumberBase,           │ │
│  │     to: NumberBase) -> Result<String, String>        │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### The NumberBase Enum

```rust
enum NumberBase {
    Binary,
    Decimal,
    Hex,
    Octal,
}
```

**Parsing from a string:**

```rust
fn parse_base(s: &str) -> Result<NumberBase, String> {
    match s {
        "binary" | "bin" | "2" => Ok(NumberBase::Binary),
        "decimal" | "dec" | "10" => Ok(NumberBase::Decimal),
        "hex" | "hexadecimal" | "16" => Ok(NumberBase::Hex),
        "octal" | "oct" | "8" => Ok(NumberBase::Octal),
        _ => Err(format!("Unknown base: '{}'", s)),
    }
}
```

### The Convert Function

```rust
fn convert(value: &str, from: NumberBase, to: NumberBase) -> Result<String, String> {
    // Step 1: Parse the value from the source base
    let parsed = match from {
        NumberBase::Binary => i64::from_str_radix(value, 2),
        NumberBase::Decimal => value.parse::<i64>(),
        NumberBase::Hex => i64::from_str_radix(value.trim_start_matches("0x"), 16),
        NumberBase::Octal => i64::from_str_radix(value.trim_start_matches("0o"), 8),
    }
    .map_err(|_| format!("Invalid number for base {:?}: '{}'", from, value))?;

    // Step 2: Format the number in the target base
    let result = match to {
        NumberBase::Binary => format!("{:b}", parsed),
        NumberBase::Decimal => format!("{}", parsed),
        NumberBase::Hex => format!("{:x}", parsed),
        NumberBase::Octal => format!("{:o}", parsed),
    };

    Ok(result)
}
```

### The CLI Interface

The program accepts command-line arguments:

```bash
$ cargo run -- <source_base> <value> <target_base>
$ cargo run -- decimal 42 hex
# Output: 2a
```

Or with flags:

```bash
$ cargo run -- --from decimal --to hex 42
# Output: 2a
```

### Testing Strategy

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn decimal_to_hex_works() {
        assert_eq!(convert("42", NumberBase::Decimal, NumberBase::Hex), Ok("2a".to_string()));
    }

    #[test]
    fn hex_to_decimal_works() {
        assert_eq!(convert("2a", NumberBase::Hex, NumberBase::Decimal), Ok("42".to_string()));
    }

    #[test]
    fn invalid_digit_returns_error() {
        let result = convert("ff", NumberBase::Binary, NumberBase::Decimal);
        assert!(result.is_err());
    }
}
```

---

## Worked Example

### Building the Number Converter: Step by Step

#### Step 1: Create the Project

```bash
$ cargo new number_converter
$ cd number_converter
$ git init
$ git add .
$ git commit -m "feat: initial commit — number_converter project scaffold"
```

#### Step 2: Define the NumberBase Enum

Add the enum to `src/main.rs`:

```rust
#[derive(Debug, Clone, Copy, PartialEq)]
enum NumberBase {
    Binary,
    Decimal,
    Hex,
    Octal,
}
```

`#[derive(Debug)]` allows printing. `#[derive(Clone, Copy)]` makes the enum copyable (it's small enough). `#[derive(PartialEq)]` allows comparison.

#### Step 3: Implement `parse_base`

```rust
fn parse_base(s: &str) -> Result<NumberBase, String> {
    match s.to_lowercase().as_str() {
        "binary" | "bin" | "2" => Ok(NumberBase::Binary),
        "decimal" | "dec" | "10" => Ok(NumberBase::Decimal),
        "hex" | "hexadecimal" | "16" => Ok(NumberBase::Hex),
        "octal" | "oct" | "8" => Ok(NumberBase::Octal),
        _ => Err(format!("Unknown base: '{}'. Expected binary, decimal, hex, or octal.", s)),
    }
}
```

#### Step 4: Implement `convert`

```rust
fn convert(value: &str, from: NumberBase, to: NumberBase) -> Result<String, String> {
    // Remove common prefixes
    let cleaned = match from {
        NumberBase::Hex => value.trim_start_matches("0x").trim_start_matches("0X"),
        NumberBase::Octal => value.trim_start_matches("0o").trim_start_matches("0O"),
        _ => value,
    };

    // Parse the value
    let parsed = match from {
        NumberBase::Binary => i64::from_str_radix(cleaned, 2),
        NumberBase::Decimal => cleaned.parse::<i64>(),
        NumberBase::Hex => i64::from_str_radix(cleaned, 16),
        NumberBase::Octal => i64::from_str_radix(cleaned, 8),
    }
    .map_err(|_| format!("Invalid number for base {:?}: '{}'", from, value))?;

    // Format in the target base
    let result = match to {
        NumberBase::Binary => format!("0b{:b}", parsed),
        NumberBase::Decimal => format!("{}", parsed),
        NumberBase::Hex => format!("0x{:x}", parsed),
        NumberBase::Octal => format!("0o{:o}", parsed),
    };

    Ok(result)
}
```

#### Step 5: Implement the CLI

```rust
use std::env;

fn print_help() {
    println!("Number Converter");
    println!("Convert a number from one base to another.");
    println!();
    println!("Usage: number_converter <from_base> <value> <to_base>");
    println!();
    println!("Bases:");
    println!("  binary, bin, 2");
    println!("  decimal, dec, 10");
    println!("  hex, hexadecimal, 16");
    println!("  octal, oct, 8");
    println!();
    println!("Example:");
    println!("  number_converter decimal 42 hex");
    println!("  Output: 0x2a");
}

fn main() {
    let args: Vec<String> = env::args().collect();

    // Handle help flag
    if args.len() == 2 && (args[1] == "--help" || args[1] == "-h") {
        print_help();
        return;
    }

    if args.len() != 4 {
        eprintln!("Error: expected 3 arguments (from_base, value, to_base)");
        eprintln!("Use --help for usage information.");
        std::process::exit(1);
    }

    let from = match parse_base(&args[1]) {
        Ok(b) => b,
        Err(e) => {
            eprintln!("Error: {}", e);
            std::process::exit(1);
        }
    };

    let value = &args[2];
    let to = match parse_base(&args[3]) {
        Ok(b) => b,
        Err(e) => {
            eprintln!("Error: {}", e);
            std::process::exit(1);
        }
    };

    match convert(value, from, to) {
        Ok(result) => println!("{}", result),
        Err(e) => {
            eprintln!("Error: {}", e);
            std::process::exit(1);
        }
    }
}
```

#### Step 6: Add Tests

Add a test module:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn decimal_to_binary_works() {
        assert_eq!(
            convert("42", NumberBase::Decimal, NumberBase::Binary),
            Ok("0b101010".to_string())
        );
    }

    #[test]
    fn binary_to_decimal_works() {
        assert_eq!(
            convert("101010", NumberBase::Binary, NumberBase::Decimal),
            Ok("42".to_string())
        );
    }

    #[test]
    fn decimal_to_hex_works() {
        assert_eq!(
            convert("42", NumberBase::Decimal, NumberBase::Hex),
            Ok("0x2a".to_string())
        );
    }

    #[test]
    fn hex_to_decimal_works() {
        assert_eq!(
            convert("0x2a", NumberBase::Hex, NumberBase::Decimal),
            Ok("42".to_string())
        );
    }

    #[test]
    fn invalid_digit_returns_error() {
        let result = convert("ff", NumberBase::Binary, NumberBase::Decimal);
        assert!(result.is_err());
    }

    #[test]
    fn invalid_hex_returns_error() {
        let result = convert("0xg", NumberBase::Hex, NumberBase::Decimal);
        assert!(result.is_err());
    }
}
```

#### Step 7: Run the Checks

```bash
$ cargo build
$ cargo fmt
$ cargo clippy -D warnings
$ cargo test
```

#### Step 8: Test the Program

```bash
$ cargo run -- decimal 42 hex
0x2a

$ cargo run -- hex 0x2a decimal
42

$ cargo run -- binary 101010 decimal
42

$ cargo run -- invalid 42 hex
Error: Unknown base: 'invalid'. Expected binary, decimal, hex, or octal.

$ cargo run -- decimal ff hex
Error: Invalid number for base Decimal: 'ff'
```

#### Step 9: Commit the Changes

```bash
git add src/main.rs
git commit -m "feat: implement number converter with full error handling

- Define NumberBase enum with four variants
- Implement parse_base with exhaustive matching
- Implement convert with source and target base conversion
- Handle invalid input with helpful error messages
- Add comprehensive tests for all conversions
- Add --help flag with usage information
"
```

---

## Engineering Notes

### Engineering Note: Exhaustiveness in Practice

The Number Converter is a perfect example of why exhaustiveness matters.

```rust
match from {
    NumberBase::Binary => i64::from_str_radix(cleaned, 2),
    NumberBase::Decimal => cleaned.parse::<i64>(),
    NumberBase::Hex => i64::from_str_radix(cleaned, 16),
    NumberBase::Octal => i64::from_str_radix(cleaned, 8),
}
```

If you add a new variant to `NumberBase`, the compiler will tell you every `match` that needs to be updated. This is a safety guarantee.

### Engineering Note: The `i64` Type

`i64` is a 64-bit signed integer. It can represent values from -9,223,372,036,854,775,808 to 9,223,372,036,854,775,807.

For most number conversions, this is sufficient. If you need larger numbers, you could use `i128` or `BigInt` (from external crates).

### Engineering Note: Error Handling Consistency

Per Appendix A.2, library code returns `Result` and application code (`main`) handles it.

- `parse_base` returns `Result<NumberBase, String>`.
- `convert` returns `Result<String, String>`.
- `main` handles errors by printing them and exiting.

---

## Compiler Thinking

**Prediction 1:**

Will this code compile?

```rust
enum NumberBase {
    Binary,
    Decimal,
    Hex,
    Octal,
}

fn example(b: NumberBase) -> String {
    match b {
        NumberBase::Binary => "binary".to_string(),
        NumberBase::Decimal => "decimal".to_string(),
        NumberBase::Hex => "hex".to_string(),
    }
}
```

<details>
<summary>Answer</summary>

**No.** The `Octal` variant is not handled. The compiler will report a non-exhaustive pattern error.

</details>

---

**Prediction 2:**

Will this code compile?

```rust
fn parse_base(s: &str) -> Result<NumberBase, String> {
    match s {
        "binary" => Ok(NumberBase::Binary),
        "decimal" => Ok(NumberBase::Decimal),
        "hex" => Ok(NumberBase::Hex),
        "octal" => Ok(NumberBase::Octal),
        _ => Err("Unknown base".to_string()),
    }
}
```

<details>
<summary>Answer</summary>

**Yes.** The match is exhaustive for `&str` because of the catch-all `_`. The compiler is satisfied because every possible string value is handled.

</details>

---

**Prediction 3:**

Why does `i64::from_str_radix` return a `Result`?

<details>
<summary>Answer</summary>

`from_str_radix` can fail. The string might contain invalid digits for the given radix (e.g., "ff" in binary). Or the number might be too large for `i64`.

Returning `Result` allows the caller to handle these failure cases gracefully.

</details>

---

## Mini Challenge

### Challenge 1 — Add Support for Octal Prefix

Modify the `convert` function to handle the `0o` prefix for octal numbers (e.g., `0o777`). The current code handles hex (`0x`) but not octal.

<details>
<summary>Hint</summary>

Add a line to the `cleaned` logic for `NumberBase::Octal`: `value.trim_start_matches("0o").trim_start_matches("0O")`
</details>

---

### Challenge 2 — Add Support for Binary Prefix

Modify the `convert` function to handle the `0b` prefix for binary numbers.

---

### Challenge 3 — Add a New Base

Add support for base-3 (ternary) numbers. This is a stretch challenge to test your understanding of enums and conversion.

**Steps:**
1. Add a `Ternary` variant to `NumberBase`.
2. Update `parse_base` to handle "ternary" and "3".
3. Update the `match` in `convert` to use `from_str_radix` with radix 3.
4. Update the output formatting to include "0t" as a prefix.

---

## Reflection

Write the answer to this question in a text file called `reflection-phase1-w4-d3.md` in your Phase 1 repository. Commit it.

**Question:**

"Your Number Converter uses an enum to represent the possible bases. The `match` expressions for parsing and converting are exhaustive—they handle every variant explicitly. How does this compare to a language without enums or exhaustiveness, where you might use a `String` for the base and a `switch` statement? What safety guarantees do enums and exhaustiveness provide that a string-based approach does not?"

<details>
<summary>Reflection Guidance</summary>

In a language without enums, you might represent the base as a `String` or an integer. But this has problems:
- Typos: "hex" vs "hexadecimal" vs "hexx".
- Invalid values: "abc123" is not a valid base.
- Missing cases: You might forget to handle a specific base in a switch statement.

With enums:
- Invalid values are impossible. You cannot create a `NumberBase` that doesn't exist.
- The compiler checks that every match is exhaustive. You cannot forget to handle a base.
- Adding a new base requires updating every match. The compiler ensures you don't miss any.

Exhaustiveness is the guarantee that your code is complete. It is not a restriction—it is a safety feature.

</details>

---

## End of Day 3, Week 4

### What You Have Accomplished

By the end of this session, you have:

- **Built the Number Converter** with full functionality.
- **Defined and used an enum** `NumberBase` with four variants.
- **Used exhaustive pattern matching** to handle every variant.
- **Parsed command-line arguments** and handled errors.
- **Performed conversions** between binary, decimal, hex, and octal.
- **Written tests** for the conversion logic.
- **Applied the Definition of Done** to the project.

### What This Builds Toward

The Number Converter is complete. Tomorrow, you start the File Organizer—a more complex project with file I/O, custom error enums, and real-world consequences.

**Week 4, Day 4 — Project Work: File Organizer (Milestone 1)**

You will:
- Scan a directory and group files by extension.
- Handle file system operations safely.
- Use custom error types for different failure modes.

You have the skills. Now you build a tool that interacts with the real world.

### The Engineering Habit to Carry Forward

When you model a domain with enums, be complete. List every possible variant. Use exhaustive matching to handle all of them.

This is the discipline of correctness. It prevents bugs before they happen.

Rest well. Tomorrow, you build the File Organizer.
