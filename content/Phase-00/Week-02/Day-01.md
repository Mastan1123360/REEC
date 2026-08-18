---
id: P0-W2-D1
phase: 0
week: 2
day: 1
title: 'Production Reading: How to Read Real Rust Code'
subtitle: 'Building the skill of navigating large, unfamiliar codebases'
estimated_time: 75
difficulty: Beginner
learning_objectives:
  - Navigate a real-world Rust codebase structure
  - Read and interpret a Cargo.toml manifest
  - Identify the entry point and core components of a Rust project
  - Understand the difference between library and binary crates
  - Use dependency information to infer what a project does
  - Develop the habit of reading code before writing code
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
  - 'ripgrep source code (GitHub: BurntSushi/ripgrep) — skim only'
  - >-
    The Rust Programming Language, Chapter 7 (Packages, Crates, and Modules) —
    review
tags:
  - production-reading
  - code-reading
  - ripgrep
  - codebase-navigation
  - open-source
next: P0-W2-D2
previous: P0-W1-D7
published: true
---

:::story

## The Developer Who Could Write Code but Couldn't Read It

A developer—call him Alex—had been writing Rust for about a year. He was productive on his own projects. He knew the syntax, understood ownership, and could debug his own code reasonably well.

Then he joined a team working on a large, existing Rust codebase.

He opened the repository for the first time and felt a wave of panic. There were dozens of directories. Hundreds of files. Thousands of lines of code. He had no idea where to start.

He knew how to write code. But he had never learned how to *read* code—how to navigate an unfamiliar codebase, how to find the entry point, how to trace the flow of control across multiple files and crates. He had never needed to. His own projects were small enough that he could hold the entire codebase in his head.

Now that was impossible.

For the first week, he floundered. He opened files at random, trying to piece together the system's structure. He wasted hours reading code that wasn't relevant to his task. He made changes in the wrong places and broke things. His teammates had to repeatedly guide him back to the right files.

After two weeks of this, a senior engineer sat down with him and said: "You're approaching this backwards. You're trying to understand the code by reading it line by line. That's like trying to understand a city by walking down every street. You need a map first."

The senior engineer opened the `Cargo.toml` file and started explaining:

- "This tells us what external crates this project depends on. That tells us what this project *does*—it's a CLI tool that searches files, so we need to understand file I/O, pattern matching, and command-line parsing."
- "The `src/main.rs` file is the entry point. That's where the program starts."
- "The `src/bin/` directory contains other binaries."
- "The `src/lib.rs` file is the library. That's where the core logic lives."

In ten minutes, Alex had a mental map of the codebase that would have taken him days to build on his own.

Today, you learn to build that map.

:::

:::mental-model

Before we dive into reading `ripgrep`, internalise these three mental models. They reframe code reading from a passive activity into an active, purposeful skill.

**Mental Model 1 — Code reading is a skill, not a talent.**

You were taught to write code. You were probably never taught to read it. But reading code is a separate, equally important skill. It requires different techniques, different habits, and different mental frameworks.

Writing code is about creation. Reading code is about comprehension. Good writers are not always good readers. But in software engineering, you must be both. You will spend far more time reading code than writing it—reading your own code from six months ago, reading your teammates' code, reading open-source code, reading compiler error messages.

The most productive developers are not the fastest writers. They are the fastest readers.

**Mental Model 2 — The project's shape reveals its purpose.**

Every codebase has a shape. The shape is determined by:

- **Crate structure:** Is it a single binary? A library? A workspace with multiple crates?
- **Dependencies:** What external crates does it use? These tell you what problems the code is solving.
- **File organisation:** How are modules arranged? Where is the business logic? Where is the entry point?
- **Testing infrastructure:** Where are the tests? How many are there? What do they test?

The shape of a project tells you what it is, what it does, and how it works. You can infer most of this before reading a single line of code. The shape is the map.

**Mental Model 3 — Reading code is a process of progressive refinement.**

You don't understand a codebase by reading it from top to bottom. You understand it through a process of progressive refinement:

1. **Start with the shape.** What is this project? What are its main components?
2. **Find the entry point.** Where does execution start?
3. **Trace the control flow.** What happens when the program runs?
4. **Explore the data flow.** How does data move through the system?
5. **Deep dive into specific components.** Which parts are most relevant to your task?

Each step gives you more detail. You can stop at any level when you have enough information for your purpose. You don't need to understand everything to understand the part that matters.

:::

## Theory

### Reading a Cargo.toml Manifest

The `Cargo.toml` file is the first thing you should read when encountering a new Rust codebase. It tells you what the project is, what it depends on, and how it's structured.

```
[package]
name = "ripgrep"
version = "14.1.1"
edition = "2021"
description = "Line-oriented search tool"
authors = ["Andrew Gallant <jamslam@gmail.com>"]
repository = "https://github.com/BurntSushi/ripgrep"
license = "MIT OR Unlicense"

[dependencies]
anyhow = "1.0"
bstr = "1.9"
clap = { version = "4.4", features = ["color", "wrap_help"] }
grep = { version = "0.3", path = "crates/grep" }
ignore = { version = "0.4", path = "crates/ignore" }
```

**What this tells you:**

| Field | Information |
|---|---|
| `name` | The project's name. In a single-crate project, this is the crate name. |
| `version` | The semantic version. Useful for understanding stability. |
| `edition` | The Rust edition (2015, 2018, 2021, 2024). Affects language features. |
| `description` | What the project does—read this first. |
| `authors` | Who wrote it. Useful for context and contact. |
| `repository` | The source location. If you're reading a local copy, this tells you where the original is. |
| `license` | How you can use this code. Important if you're contributing. |
| `dependencies` | External crates. This is the most important section. |

### Understanding Dependencies

Dependencies tell you what problem the project is solving. Here's how to interpret them:

| Dependency | What it suggests about the project |
|---|---|
| `clap` | Command-line argument parsing. This is a CLI tool. |
| `serde` | Serialization/deserialization. The project handles structured data. |
| `tokio` | Asynchronous runtime. The project does network I/O or other async work. |
| `grep` (custom) | Pattern matching. The project is search-oriented. |
| `ignore` (custom) | Filesystem traversal. The project walks directories. |

For `ripgrep`, the dependencies tell us:

1. **It's a CLI tool** (because of `clap`).
2. **It's search-oriented** (because of `grep`).
3. **It walks filesystems** (because of `ignore`).
4. **It doesn't use async** (no `tokio` or `async-std`).

**The actual `Cargo.toml` for `ripgrep` is more complex.** It's a workspace with multiple crates. The top-level `Cargo.toml` defines the workspace members:

```
[workspace]
members = [
    "crates/grep",
    "crates/ignore",
    "crates/printer",
    "crates/globset",
    "crates/cli",
]
```

This tells us:

- The project is split into multiple crates.
- Each crate handles a specific concern: `grep` does searching, `ignore` handles file traversal, `printer` formats output, and `cli` is the command-line interface.

**The shape tells us this is a well-structured, modular project.** The separation of concerns makes it easier to understand and maintain.

### Binary vs. Library Crates

A Rust project can contain:

- **Binary crates:** Executable programs. The entry point is `main()`.
- **Library crates:** Reusable code. The entry point is the crate root.

In a typical Rust project:

- `src/main.rs` is the binary crate root. Execution starts here.
- `src/lib.rs` is the library crate root. Logic lives here.
- `src/bin/` contains additional binary crates.

For `ripgrep`:

- The `cli` crate contains the main entry point.
- The `grep`, `ignore`, and `printer` crates are libraries.
- The top-level `src/main.rs` likely just delegates to the `cli` crate.

### Reading main.rs

The `main.rs` file is the entry point of a binary crate. It tells you:

- How command-line arguments are parsed.
- How the program is initialised.
- What the program does, at a high level.

When reading a `main.rs` file, look for:

**1. The imports.** What external crates are being used directly?

```rust
use std::fs;
use std::io;
use std::path::Path;

use clap::Parser;
use grep::searcher::Searcher;
use ignore::Walk;
```

**2. The main function.** Where does execution start?

```rust
fn main() -> anyhow::Result<()> {
    let args = Args::parse();
    let searcher = Searcher::new();
    for result in Walk::new(&args.path) {
        // ...
    }
    Ok(())
}
```

**3. The `Args` struct.** How are command-line arguments structured?

```rust
#[derive(Parser)]
struct Args {
    #[arg(short = 'r', long = "regex")]
    regex: Option<String>,
    #[arg(short = 'i', long = "ignore-case")]
    ignore_case: bool,
    path: PathBuf,
}
```

**4. The control flow.** What happens in what order?

**5. Error handling.** How does the program handle failures?

### Reading a Module's lib.rs

The `lib.rs` file is the entry point of a library crate. It re-exports the public API and often contains the core logic.

When reading a `lib.rs` file, look for:

**1. The module declarations.** What submodules exist?

```rust
pub mod searcher;
pub mod matcher;
pub mod printer;
```

**2. The re-exports.** What types are part of the public API?

```rust
pub use searcher::Searcher;
pub use matcher::Matcher;
pub use printer::Printer;
```

**3. The core logic.** What does this crate actually do?

For `ripgrep`'s `grep` crate, the `lib.rs` might expose:

```rust
pub struct Searcher {
    // ...
}

impl Searcher {
    pub fn search(&self, path: &Path, pattern: &str) -> Result<Vec<Match>> {
        // ...
    }
}
```

### Project Structure: The Shape of a Codebase

A typical Rust project structure:

```
project/
├── Cargo.toml                 # Project manifest
├── Cargo.lock                 # Locked dependency versions
├── .gitignore                 # Git ignore file
├── src/
│   ├── main.rs                # Binary crate root (if binary)
│   ├── lib.rs                 # Library crate root (if library)
│   ├── bin/                   # Additional binaries
│   │   └── another_bin.rs
│   └── modules/               # Module files
├── tests/                     # Integration tests
│   └── integration_test.rs
├── benches/                   # Benchmarks
│   └── benchmark.rs
├── examples/                  # Example programs
│   └── example.rs
└── target/                    # Compiled output (ignored by Git)
```

For a workspace project (like `ripgrep`):

```
ripgrep/
├── Cargo.toml                 # Workspace manifest
├── crates/
│   ├── cli/                   # CLI crate
│   │   ├── Cargo.toml
│   │   └── src/
│   │       └── main.rs
│   ├── grep/                  # Core search crate
│   │   ├── Cargo.toml
│   │   └── src/
│   │       └── lib.rs
│   ├── ignore/                # File traversal crate
│   │   ├── Cargo.toml
│   │   └── src/
│   │       └── lib.rs
│   └── printer/               # Output formatting crate
│       ├── Cargo.toml
│       └── src/
│           └── lib.rs
└── target/                    # Workspace-wide compiled output
```

---

## Worked Example

### Navigating ripgrep: A Guided Tour

Let's walk through navigating the `ripgrep` codebase together.

#### Step 1: Read the Shape

**Open the repository:** https://github.com/BurntSushi/ripgrep

**What we see:**

```
ripgrep/
├── Cargo.toml
├── README.md
├── crates/
│   ├── cli/
│   ├── grep/
│   ├── ignore/
│   └── printer/
├── src/
│   └── ...
└── tests/
```

**What this tells us:**

- This is a workspace.
- There are multiple crates: `cli`, `grep`, `ignore`, `printer`.
- The `cli` crate is likely the binary entry point.
- The other crates are libraries.

#### Step 2: Read Cargo.toml

**Open the top-level `Cargo.toml`:**

```toml
[workspace]
members = ["crates/*"]

[workspace.dependencies]
anyhow = "1.0.86"
bstr = "1.10.0"
clap = { version = "4.5.13", features = ["color", "wrap_help"] }
serde = { version = "1.0.204", features = ["derive"] }
```

**What this tells us:**

- The workspace includes all sub-crates in `crates/`.
- The workspace defines shared dependency versions.
- The project uses `clap` for command-line parsing and `serde` for serialisation.

#### Step 3: Find the Entry Point

**Open `crates/cli/src/main.rs`:**

```rust
fn main() -> anyhow::Result<()> {
    // Parse command-line arguments
    let args = Args::parse();
    
    // Handle subcommands
    match args.command {
        Command::Search { query, path } => {
            let searcher = Searcher::new();
            let results = searcher.search(&path, &query)?;
            Printer::new().print(&results);
        }
        // ...
    }
    
    Ok(())
}
```

**What this tells us:**

- The entry point is `main()` in the `cli` crate.
- It uses `clap` to parse arguments.
- It delegates to the `grep` crate for searching.
- It uses the `printer` crate for output.

#### Step 4: Trace the Control Flow

**What happens when you run `rg pattern path`?**

1. `cli/src/main.rs` parses arguments.
2. The `grep` crate performs the search.
3. The `ignore` crate walks the directory and provides files.
4. The `printer` crate formats and outputs results.
5. Results are printed to stdout.

**What this tells us:**

- The control flow is linear: parse → search → output.
- Each crate has a single responsibility.

#### Step 5: Explore the Data Flow

**How does data move through the system?**

1. **Input:** `path` and `pattern` from command-line arguments.
2. **Processing:** The `ignore` crate produces an iterator of files. The `grep` crate searches each file. The `printer` crate formats matches.
3. **Output:** Matches are printed to stdout.

**What this tells us:**

- Data flows from arguments → files → matches → output.
- Each step is a transformation.

---

## Engineering Notes

### Engineering Note: Why You Should Read Code Before Writing It

The most effective way to learn a new codebase is to read it before you try to change it. This seems obvious, but it's surprisingly common to see developers make changes without first understanding the structure.

**The cost of skipping this step:**

- You waste time trying to find things.
- You make changes in the wrong place.
- You break things unintentionally.
- You produce inconsistent code.
- You frustrate your teammates.

**The benefits of reading first:**

- You understand the mental model of the codebase.
- You know where to find things.
- You know where to put new things.
- You can reason about the impact of your changes.
- You produce consistent code.

### Engineering Note: The "Read First" Protocol

When encountering a new codebase:

1. **Don't open files randomly.** This is the most common mistake.
2. **Start with the `Cargo.toml` file.** Understand the shape and dependencies.
3. **Find the entry point.** Usually `src/main.rs` or `src/bin/`.
4. **Follow the control flow.** From entry point to completion.
5. **Skim the tests.** Tests tell you what the code is supposed to do.
6. **Focus on the part you need to change.** You don't need to understand everything.

This protocol should take 15–30 minutes for a moderately complex codebase. It's an investment that pays for itself many times over.

---

## Compiler Thinking

**Prediction 1:**

You open a Rust project and see this directory structure:

```
project/
├── Cargo.toml
├── src/
│   ├── main.rs
│   └── lib.rs
└── tests/
```

What kind of project is this? What does the `main.rs` file likely contain?

<details>
<summary>Answer</summary>

This is a project with both a binary and a library. The `main.rs` file is the entry point for the executable. It likely contains a thin wrapper that calls into the library.

This structure is common for projects that want to test their logic (the library is testable) while providing a runnable binary. The `lib.rs` file contains the core logic, and `main.rs` just calls it.
</details>

---

**Prediction 2:**

You see this `Cargo.toml`:

```toml
[package]
name = "my-project"
version = "0.1.0"
edition = "2024"

[dependencies]
tokio = { version = "1", features = ["full"] }
serde = { version = "1", features = ["derive"] }
```

What kind of project is this? What does the `tokio` dependency tell you?

<details>
<summary>Answer</summary>

The `tokio` dependency indicates this is an asynchronous project. It likely does network I/O or other async operations. The `serde` dependency indicates it handles structured data (JSON, etc.).

This is likely a web server, a client for a web API, or some other networked service.
</details>

---

**Prediction 3:**

You see this entry in a `Cargo.toml` `[dependencies]` section:

```toml
anyhow = "1.0"
```

What does this tell you about the project's error-handling approach?

<details>
<summary>Answer</summary>

`anyhow` is used for application-level error handling. It provides a simple way to return `Result<T, anyhow::Error>` without defining custom error types. This is typical for binaries (like CLIs) where you just want to propagate errors up to `main()` and print them.

The project likely uses `anyhow` in `main.rs` and `thiserror` for library crates.
</details>

---

**Prediction 4:**

You look at a `src/lib.rs` file and see:

```rust
pub mod parser;
pub mod ast;
pub mod compiler;
```

What does this suggest about the project's structure?

<details>
<summary>Answer</summary>

This suggests the project is a compiler or interpreter. The modules are named after the stages of compilation: `parser` (lexing/parsing), `ast` (abstract syntax tree), `compiler` (code generation or interpretation). This is a very common structure for language-related projects.
</details>

---

## Mini Challenge

### Challenge 1 — Read a Real `Cargo.toml`

Open the `Cargo.toml` file of a Rust project you have access to (it could be a project you wrote, or an open-source project). Answer these questions:

1. What is the project's name and version?
2. What is the project's description?
3. What dependencies does it have?
4. What do those dependencies suggest about what the project does?
5. Is it a single crate or a workspace?

**For this exercise, you can use the `hello_reec` project you created in Week 1.**

<details>
<summary>Sample Answer (for hello_reec)</summary>

```toml
[package]
name = "hello_reec"
version = "0.1.0"
edition = "2024"

[dependencies]
```

1. Name: `hello_reec`. Version: `0.1.0`.
2. No description—this is a minimal project.
3. No dependencies.
4. Since there are no dependencies, this is a simple "Hello, world!" project.
5. Single crate.
</details>

---

### Challenge 2 — Find the Entry Point

Open a Rust project of your choice. Find:

1. The entry point (`main.rs` or `main` function).
2. The `main` function.
3. What the `main` function does.

**For this exercise, you can use the `hello_reec` project.**

---

### Challenge 3 — Map the Modules

Open a Rust project. Identify:

1. What modules exist (`mod` declarations).
2. What the public API is (`pub` exports).
3. Where the logic lives (which module contains the core logic).

**For this exercise, you can use the `hello_reec` project.**

---

## Reflection

Write the answer to this question in a text file called `reflection-w2d1.md` in your `hello_reec` directory. Commit it.

**Question:**

"You have spent the last week learning to write code from scratch. Today you learned to read existing code. Why is reading code a different skill from writing code? What mental shift is required to move from 'author' to 'reader' when approaching a codebase?"

<details>
<summary>Reflection Guidance</summary>

Writing code is about creation. You start from nothing and build something. You are in control of every decision.

Reading code is about comprehension. You start with something that already exists and must understand it. You are not in control—you must discover the decisions that were already made.

The mental shift is from "what should I build?" to "what has been built and why?" It requires humility: you must accept that you don't understand the code yet. It requires curiosity: you must explore without judgment. It requires patience: understanding takes time.

The best code readers approach a codebase as a detective approaching a crime scene. They look for clues. They follow trails. They reconstruct the story of how the code came to be. They don't jump to conclusions.

In Phase 1, you will start writing Rust code. But you will also learn to read Rust code—your own code, your peers' code, and open-source code. The skill you built today is the foundation for all of that.
</details>

---

## End of Day 1, Week 2

### What You Have Accomplished

By the end of this session, you have:

- **Learned to read a Cargo.toml manifest** and infer what a project does.
- **Understood the difference between binary and library crates.**
- **Found the entry point** of a Rust program.
- **Explored the directory structure** of a real-world Rust project.
- **Practiced navigating `ripgrep`** as a worked example.
- **Developed the habit of reading code before writing it.**

### What This Builds Toward

Today's lesson is the bridge between Week 1's systems thinking and Week 2's Rust programming. You have now seen what a real Rust codebase looks like. You have navigated its structure, found its entry point, and traced its control flow.

**Tomorrow, Day 2, begins your first serious engagement with Rust syntax.** You will write your first Rust program—a Calculator CLI—and learn:

- Variables, mutability, and data types.
- Functions and control flow.
- Ownership and borrowing in practice.

You are ready. You have the systems thinking from Week 1. You have the code-reading skill from today. Now you will write Rust.

Take a moment to review today's learning. Then, prepare for tomorrow's hands-on programming.
