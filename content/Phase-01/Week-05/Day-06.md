---
id: P1-W5-D6
phase: 1
week: 5
day: 6
title: 'Project Work: Task Tracker v1 — Milestone 2'
subtitle: Building the REPL loop and completing your first Major project
estimated_time: 90
difficulty: Intermediate
learning_objectives:
  - Implement a REPL (Read-Eval-Print Loop) for interactive CLI applications
  - Parse user commands from stdin
  - Call core logic methods from the REPL
  - Handle errors gracefully with user-friendly messages
  - 'Use stdin, stdout, and stderr correctly'
  - Complete a Major project to the Definition of Done
  - Apply all Phase 1 concepts in a single coherent project
widgets:
  - story
  - mental-model
  - worked-example
  - engineering-note
  - compiler-thinking
  - mini-challenge
  - reflection
project:
  - Task Tracker v1 (Milestone 2 — REPL loop)
failure_lab: null
reading:
  - >-
    REEC-05-Phase1-RustFoundations.md §1.12 (Project 04 — Task Tracker v1
    [Major])
  - REEC-04-EngineeringStandardsAppendix.md (review)
tags:
  - project
  - task-tracker
  - repl
  - cli
  - completion
  - major-project
next: P1-W5-D7
previous: P1-W5-D5
published: true
---

:::story

## The Developer Who Brought It to Life

A developer—call him Marcus—had just finished the core logic for Task Tracker v1. He had `Task`, `TaskStatus`, and `TaskList`. He had tests. Everything worked.

But it was just a library. It couldn't do anything. It needed a REPL loop to become a real application.

He opened `main.rs` and started writing the REPL. He needed to read from stdin, parse commands, call the `TaskList` methods, and print results.

He wrote a simple loop:

```rust
loop {
    print!("> ");
    io::stdout().flush().unwrap();

    let mut input = String::new();
    io::stdin().read_line(&mut input).unwrap();

    match parse_command(&input) {
        Command::Add(title) => {
            let task = task_list.add(&title);
            println!("Added task #{}: {}", task.id, task.title);
        }
        Command::List => {
            for task in task_list.list() {
                println!("#{}: {} [{}]", task.id, task.title, status_str(task));
            }
        }
        Command::Complete(id) => {
            match task_list.complete(id) {
                Ok(()) => println!("Task #{} marked as done.", id),
                Err(TaskError::TaskNotFound(id)) => {
                    eprintln!("Task #{} not found.", id);
                }
            }
        }
        Command::Remove(id) => {
            match task_list.remove(id) {
                Ok(task) => println!("Removed task #{}: {}", task.id, task.title),
                Err(TaskError::TaskNotFound(id)) => {
                    eprintln!("Task #{} not found.", id);
                }
            }
        }
        Command::Quit => {
            println!("Goodbye!");
            break;
        }
        Command::Invalid => {
            eprintln!("Invalid command. Try: add, list, complete <id>, remove <id>, quit");
        }
    }
}
```

He ran `cargo run`. The prompt appeared. He typed `add Buy milk`. It worked. He typed `list`. It worked. He typed `quit`. It worked.

His Task Tracker was alive. It was interactive. It was useful.

He had built his first Major project—a complete, working, interactive application. Everything from Phase 0 to this moment had led here.

Today, you do the same.

:::

:::mental-model

Before we dive into building the REPL loop, internalise these three mental models. They reframe the REPL from a technical detail into the user interface for your application.

**Mental Model 1 — The REPL loop is the user interface.**

The REPL is not just a technical detail. It is how the user interacts with your application. Every command, every message, every error is part of the user experience.

A good REPL is:
- **Responsive:** It reacts immediately to commands.
- **Informative:** It tells the user what happened.
- **Forgiving:** It handles invalid input gracefully.
- **Consistent:** It uses a predictable command format.

**Mental Model 2 — The REPL should be thin.**

The REPL should be a thin wrapper around the core logic. It should:
- Read input.
- Parse commands.
- Call core logic methods.
- Format and print results.

The core logic should not know about the REPL. The REPL should not contain business logic.

**Mental Model 3 — The REPL is a loop.**

The REPL is an infinite loop that:
1. **Reads** input from the user.
2. **Evaluates** the input (parses it, calls core logic).
3. **Prints** the result.
4. **Loops** (repeats) until the user quits.

The loop is the heart of the REPL. It controls the program's flow.

:::

## Theory

### The REPL Structure

A REPL loop has four phases:

```
┌──────────────────────────────────────────────────────┐
│                      REPL LOOP                       │
│                                                      │
│  ┌───────────────────────────────────────────────┐   │
│  │  1. READ                                      │   │
│  │     print!("> ");                             │   │
│  │     let input = read_line();                  │   │
│  └───────────────────────────────────────────────┘   │
│                         │                            │
│                         ▼                            │
│  ┌───────────────────────────────────────────────┐   │
│  │  2. EVALUATE                                  │   │
│  │     let command = parse_command(&input);      │   │
│  │     match command { ... }                     │   │
│  └───────────────────────────────────────────────┘   │
│                         │                            │
│                         ▼                            │
│  ┌───────────────────────────────────────────────┐   │
│  │  3. PRINT                                     │   │
│  │     println!("Result");                       │   │
│  │     eprintln!("Error");                       │   │
│  └───────────────────────────────────────────────┘   │
│                         │                            │
│                         ▼                            │
│  ┌───────────────────────────────────────────────┐   │
│  │  4. LOOP                                      │   │
│  │     Continue until the user enters "quit"     │   │
│  └───────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

### The Command Parser

The command parser converts a string into a `Command` enum:

```rust
enum Command {
    Add(String),
    List,
    Complete(usize),
    Remove(usize),
    Quit,
    Invalid,
}

fn parse_command(line: &str) -> Command {
    let parts: Vec<&str> = line.trim().split_whitespace().collect();
    if parts.is_empty() {
        return Command::Invalid;
    }

    match parts[0].to_lowercase().as_str() {
        "add" => {
            if parts.len() >= 2 {
                Command::Add(parts[1..].join(" "))
            } else {
                Command::Invalid
            }
        }
        "list" | "ls" => Command::List,
        "complete" | "done" => {
            if parts.len() == 2 {
                if let Ok(id) = parts[1].parse() {
                    Command::Complete(id)
                } else {
                    Command::Invalid
                }
            } else {
                Command::Invalid
            }
        }
        "remove" | "rm" | "delete" | "del" => {
            if parts.len() == 2 {
                if let Ok(id) = parts[1].parse() {
                    Command::Remove(id)
                } else {
                    Command::Invalid
                }
            } else {
                Command::Invalid
            }
        }
        "quit" | "exit" | "q" => Command::Quit,
        _ => Command::Invalid,
    }
}
```

### The Status Formatter

Displaying task status requires a helper function:

```rust
fn status_str(status: &TaskStatus) -> &'static str {
    match status {
        TaskStatus::Pending => "Pending",
        TaskStatus::InProgress { .. } => "In Progress",
        TaskStatus::Done { .. } => "Done",
    }
}
```

### The Main Loop

```rust
use std::io::{self, Write};

fn main() {
    let mut task_list = TaskList::new();

    loop {
        print!("> ");
        io::stdout().flush().unwrap();

        let mut input = String::new();
        if io::stdin().read_line(&mut input).is_err() {
            eprintln!("Error reading input.");
            continue;
        }

        match parse_command(&input) {
            Command::Add(title) => {
                let task = task_list.add(&title);
                println!("Added task #{}: {}", task.id, task.title);
            }
            Command::List => {
                let tasks = task_list.list();
                if tasks.is_empty() {
                    println!("No tasks.");
                } else {
                    for task in tasks {
                        println!(
                            "#{}: {} [{}]",
                            task.id,
                            task.title,
                            status_str(&task.status)
                        );
                    }
                }
            }
            Command::Complete(id) => {
                match task_list.complete(id) {
                    Ok(()) => println!("Task #{} marked as done.", id),
                    Err(TaskError::TaskNotFound(id)) => {
                        eprintln!("Task #{} not found.", id);
                    }
                }
            }
            Command::Remove(id) => {
                match task_list.remove(id) {
                    Ok(task) => println!("Removed task #{}: {}", task.id, task.title),
                    Err(TaskError::TaskNotFound(id)) => {
                        eprintln!("Task #{} not found.", id);
                    }
                }
            }
            Command::Quit => {
                println!("Goodbye!");
                break;
            }
            Command::Invalid => {
                eprintln!("Invalid command. Try: add <title>, list, complete <id>, remove <id>, quit");
            }
        }
    }
}
```

### The Complete Project Structure

```
task_tracker/
├── Cargo.toml
├── .gitignore
└── src/
    └── main.rs          # Everything in one file for simplicity
```

---

## Worked Example

### Building the REPL Loop

Let's build the REPL loop step by step.

#### Step 1: Complete the Command Parser

```rust
enum Command {
    Add(String),
    List,
    Complete(usize),
    Remove(usize),
    Quit,
    Invalid,
}

fn parse_command(line: &str) -> Command {
    let parts: Vec<&str> = line.trim().split_whitespace().collect();
    if parts.is_empty() {
        return Command::Invalid;
    }

    match parts[0].to_lowercase().as_str() {
        "add" => {
            if parts.len() >= 2 {
                Command::Add(parts[1..].join(" "))
            } else {
                Command::Invalid
            }
        }
        "list" | "ls" => Command::List,
        "complete" | "done" => {
            if parts.len() == 2 {
                if let Ok(id) = parts[1].parse() {
                    Command::Complete(id)
                } else {
                    Command::Invalid
                }
            } else {
                Command::Invalid
            }
        }
        "remove" | "rm" | "delete" | "del" => {
            if parts.len() == 2 {
                if let Ok(id) = parts[1].parse() {
                    Command::Remove(id)
                } else {
                    Command::Invalid
                }
            } else {
                Command::Invalid
            }
        }
        "quit" | "exit" | "q" => Command::Quit,
        _ => Command::Invalid,
    }
}
```

#### Step 2: Add the Status Formatter

```rust
fn status_str(status: &TaskStatus) -> &'static str {
    match status {
        TaskStatus::Pending => "Pending",
        TaskStatus::InProgress { .. } => "In Progress",
        TaskStatus::Done { .. } => "Done",
    }
}
```

#### Step 3: Write the Main Function

```rust
use std::io::{self, Write};

fn main() {
    let mut task_list = TaskList::new();

    println!("Task Tracker v1");
    println!("Commands: add <title>, list, complete <id>, remove <id>, quit");
    println!();

    loop {
        print!("> ");
        io::stdout().flush().unwrap();

        let mut input = String::new();
        if io::stdin().read_line(&mut input).is_err() {
            eprintln!("Error reading input.");
            continue;
        }

        let input = input.trim();
        if input.is_empty() {
            continue;
        }

        match parse_command(input) {
            Command::Add(title) => {
                if title.is_empty() {
                    eprintln!("Error: Task title cannot be empty.");
                    continue;
                }
                let task = task_list.add(&title);
                println!("Added task #{}: {}", task.id, task.title);
            }
            Command::List => {
                let tasks = task_list.list();
                if tasks.is_empty() {
                    println!("No tasks.");
                } else {
                    for task in tasks {
                        println!(
                            "#{}: {} [{}]",
                            task.id,
                            task.title,
                            status_str(&task.status)
                        );
                    }
                    println!("Total: {} tasks", tasks.len());
                }
            }
            Command::Complete(id) => {
                match task_list.complete(id) {
                    Ok(()) => println!("Task #{} marked as done.", id),
                    Err(TaskError::TaskNotFound(id)) => {
                        eprintln!("Task #{} not found.", id);
                    }
                }
            }
            Command::Remove(id) => {
                match task_list.remove(id) {
                    Ok(task) => println!("Removed task #{}: {}", task.id, task.title),
                    Err(TaskError::TaskNotFound(id)) => {
                        eprintln!("Task #{} not found.", id);
                    }
                }
            }
            Command::Quit => {
                println!("Goodbye!");
                break;
            }
            Command::Invalid => {
                eprintln!("Invalid command. Try: add <title>, list, complete <id>, remove <id>, quit");
            }
        }
    }
}
```

#### Step 4: Run the Program

```bash
$ cargo run
Task Tracker v1
Commands: add <title>, list, complete <id>, remove <id>, quit

> add Buy milk
Added task #1: Buy milk
> add Write report
Added task #2: Write report
> list
#1: Buy milk [Pending]
#2: Write report [Pending]
Total: 2 tasks
> complete 1
Task #1 marked as done.
> list
#1: Buy milk [Done]
#2: Write report [Pending]
Total: 2 tasks
> remove 1
Removed task #1: Buy milk
> list
#2: Write report [Pending]
Total: 1 tasks
> quit
Goodbye!
```

#### Step 5: Run the Checks

```bash
$ cargo build
$ cargo fmt
$ cargo clippy -D warnings
$ cargo test
```

#### Step 6: Commit the Changes

```bash
git add src/main.rs
git commit -m "feat: add REPL loop to Task Tracker v1

- Implement parse_command for all commands
- Add status_str helper for formatting task status
- Implement interactive REPL loop
- Handle stdin errors gracefully
- Use println! for output and eprintln! for errors
- Complete Task Tracker v1 Major project
"
```

---

## Engineering Notes

### Engineering Note: Flushing stdout

```rust
print!("> ");
io::stdout().flush().unwrap();
```

`print!` writes to stdout but doesn't flush immediately. The `flush()` call ensures the prompt appears before the program waits for input.

### Engineering Note: Error Handling in the REPL

The REPL handles errors gracefully:

```rust
if io::stdin().read_line(&mut input).is_err() {
    eprintln!("Error reading input.");
    continue;
}
```

If reading from stdin fails, the REPL prints an error and continues the loop. It doesn't crash.

### Engineering Note: Empty Input

```rust
let input = input.trim();
if input.is_empty() {
    continue;
}
```

Empty input is ignored. The REPL prompts again without printing an error.

### Engineering Note: The Thin REPL Principle

The REPL loop is thin. It doesn't contain business logic. It parses commands, calls `TaskList` methods, and formats output. All the logic is in `TaskList`.

---

## Compiler Thinking

**Prediction 1:**

Why does `parse_command` use `to_lowercase()` on the command?

<details>
<summary>Answer</summary>

`to_lowercase()` makes the command case-insensitive. `Add`, `add`, `ADD` all work. This improves the user experience.

</details>

---

**Prediction 2:**

Why does `parse_command` use `parts[1..].join(" ")` for the title?

<details>
<summary>Answer</summary>

This allows multi-word titles. `add Buy milk` creates a title of "Buy milk" instead of just "Buy" with "milk" ignored.

</details>

---

**Prediction 3:**

Why does the `Command::Add` arm check `title.is_empty()` after parsing?

<details>
<summary>Answer</summary>

`add` with no title (e.g., just "add") would create an empty task. The check prevents that and prints a helpful error instead.

</details>

---

**Prediction 4:**

Why does the REPL use `eprintln!` for errors and `println!` for normal output?

<details>
<summary>Answer</summary>

This is the standard Unix convention. Errors go to stderr so they can be separated from normal output. This is the same pattern used in the Calculator CLI and File Organizer.

</details>

---

## Mini Challenge

### Challenge 1 — Add an `InProgress` Command

Add a command `start <id>` that changes a task's status from `Pending` to `InProgress`. Add the necessary method to `TaskList`.

### Challenge 2 — Add Help

Add a `help` command that prints all available commands with descriptions.

### Challenge 3 — Show Task Count

Modify the `list` command to show the total number of tasks and how many are pending, in progress, and done.

### Challenge 4 — Add Coloured Output

Add coloured output to the REPL (e.g., green for Done, yellow for InProgress, red for Pending). Use terminal escape codes or the `colored` crate.

---

## Reflection

Write the answer to this question in a text file called `reflection-phase1-w5-d6.md` in your Phase 1 repository. Commit it.

**Question:**

"Task Tracker v1 is your first Major project in REEC. It combines everything you have learned: ownership, borrowing, structs, enums, pattern matching, error handling, collections, and the REPL loop. What is the most important lesson you have learned from building this project? How has your understanding of Rust—and of software engineering—changed since Phase 0?"

<details>
<summary>Reflection Guidance</summary>

The most important lesson is that building a complete project requires integration. You can know each concept individually, but combining them is a different skill.

The Task Tracker v1 is a complete application. It has a data model, business logic, error handling, and a user interface (the REPL). Each part works together. The separation of concerns (core logic vs. REPL) makes the code testable and maintainable.

Since Phase 0, you have learned to think systematically. You understand that Rust's rules are not arbitrary—they are compile-time enforcement of the exact discipline you traced by hand in Phase 0. Ownership, borrowing, and lifetimes are not just language features. They are the rules of the machine, encoded in the type system.

You have grown from a person who writes code to a person who understands systems.

</details>

---

## End of Day 6, Week 5

### What You Have Accomplished

By the end of this session, you have:

- **Built the REPL loop** for Task Tracker v1.
- **Parsed user commands** from stdin.
- **Called core logic methods** from the REPL.
- **Handled errors gracefully** with user-friendly messages.
- **Used stdin, stdout, and stderr** correctly.
- **Completed your first Major project**—Task Tracker v1.
- **Applied all Phase 1 concepts** in a single coherent project.

### The Task Tracker v1 Milestone

```
You can now:
✓ Model a domain with structs and enums
✓ Implement a testable core library with no I/O
✓ Handle errors with custom error types
✓ Build an interactive REPL loop
✓ Separate concerns between core logic and I/O
✓ Write comprehensive tests for the core logic
✓ Build a complete, working, interactive CLI application
```

### What This Builds Toward

Tomorrow is a rest day. You have earned it.

**Week 6 begins the final week of Phase 1.** You will:

- **Complete persistence** for Task Tracker v1 (deferred to v2 in Phase 2)
- **Refactor and review** the project.
- **Complete the Phase 1 Milestone.**

### The Engineering Habit to Carry Forward

When building any application, always separate the core logic from the I/O. This makes your code testable, reusable, and maintainable.

This is the discipline of separation of concerns. It is what separates professional code from hobbyist code.

Rest well. You have built your first Major project. You are a Rust engineer.
