---
id: P1-W5-D4
phase: 1
week: 5
day: 4
title: 'Architecture Discussion: Designing Task Tracker v1'
subtitle: >-
  Planning the first Major project — data modeling, interfaces, and REPL
  architecture
estimated_time: 60
difficulty: Intermediate
learning_objectives:
  - Design a data model for a task management application
  - Define structs and enums that capture the domain
  - Plan the public API using methods and associated functions
  - Design a thin REPL loop that delegates to core logic
  - Apply separation of concerns to make the core testable
  - Document architecture decisions before writing code
widgets:
  - story
  - mental-model
  - worked-example
  - engineering-note
  - compiler-thinking
  - mini-challenge
  - reflection
project:
  - Task Tracker v1 (architecture design)
failure_lab: null
reading:
  - >-
    REEC-05-Phase1-RustFoundations.md §1.11 (Architecture Discussion: Task
    Tracker v1)
  - >-
    REEC-05-Phase1-RustFoundations.md §1.12 (Project 04 — Task Tracker v1
    [Major])
  - REEC-04-EngineeringStandardsAppendix.md §A.3 (Documentation Style)
tags:
  - architecture
  - design
  - task-tracker
  - repl
  - planning
  - major-project
next: P1-W5-D5
previous: P1-W5-D3
published: true
---

:::story

## The Developer Who Built It Wrong the First Time

A developer—call her Priya—was building a task tracker. She was excited. This was her first Major project.

She opened her editor and started coding. She defined a `Task` struct. She defined a `TaskList` struct. She wrote a `main` function that read from stdin and called methods on `TaskList`.

It worked—kind of. But something was wrong.

The `main` function was doing too much. It was parsing commands, calling the task list, and handling errors all in one place. The code was hard to test. She couldn't write unit tests for the core logic because it was tangled up with I/O.

She tried to add a new feature—persisting tasks to a file—and everything broke. The code was too tightly coupled to the REPL loop.

A senior engineer reviewed her code.

"You built it backwards," the senior said. "You started with the I/O and built the core logic around it. You should have designed the core logic first, then wrapped it with a thin I/O layer."

The senior drew a diagram:

```
┌─────────────────────────────────────────────────────────────┐
│                         REPL Loop                          │
│                     (thin I/O layer)                       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    TaskList                         │   │
│  │                (pure logic, no I/O)                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

"The core logic should have no idea that it's running in a REPL. It should just expose methods. The REPL loop is a thin wrapper that calls those methods and prints the results."

Priya refactored. She extracted the core logic into `TaskList`, with no I/O. She wrote a thin REPL loop around it. Now she could test `TaskList` without any I/O. Adding persistence was easy—it just became another thin layer.

Today, you design the architecture first, before you write any code.

:::

:::mental-model

Before we dive into the architecture design, internalise these three mental models. They reframe design from a one-time activity into a deliberate engineering process.

**Mental Model 1 — Architecture is design, not implementation.**

Architecture is the high-level structure of your code. It answers: "What are the components, and how do they communicate?"

You should design the architecture before you start coding. This prevents you from building yourself into a corner.

**Mental Model 2 — Separate the core logic from the I/O.**

The core logic should have no I/O. It should not know about stdin, stdout, files, or the network. This makes it pure, testable, and reusable.

The I/O layer is a thin wrapper around the core logic. It handles the messy outside world and delegates the real work to the core.

**Mental Model 3 — A good API makes the correct usage easy and the incorrect usage hard.**

Per §2.3.5, a well-designed API uses the type system to enforce correctness. If you can misuse the API easily, it is not well-designed.

The `TaskList` API should be safe, intuitive, and hard to misuse.

:::

## Theory

### Task Tracker v1 Overview

Per REEC-05-Phase1-RustFoundations.md §1.12, the Task Tracker v1 is an interactive command-line loop supporting:

- **Add a task:** `add <title>`
- **List tasks:** `list`
- **Mark a task complete:** `complete <id>`
- **Remove a task:** `remove <id>`
- **Quit:** `quit`

**Key constraints:**
- `std` only — no external crates.
- The REPL loop in `main.rs` must stay thin.
- All logic lives in a testable `TaskList` type.
- No persistence yet—deferred to v2 in Phase 2.

### The Data Model

**TaskStatus enum:**

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

**Task struct:**

```rust
struct Task {
    id: usize,
    title: String,
    status: TaskStatus,
}
```

**TaskList struct:**

```rust
struct TaskList {
    tasks: Vec<Task>,
    next_id: usize,
}
```

### The Public API

```rust
impl TaskList {
    fn new() -> Self;
    fn add(&mut self, title: &str) -> &Task;
    fn list(&self) -> &[Task];
    fn complete(&mut self, id: usize) -> Result<(), TaskError>;
    fn remove(&mut self, id: usize) -> Result<Task, TaskError>;
}
```

### The Error Type

```rust
enum TaskError {
    TaskNotFound(usize),
}
```

### The REPL Loop

The REPL loop is a thin wrapper that:

1. Reads a line from stdin.
2. Parses the command.
3. Calls the appropriate `TaskList` method.
4. Prints the result (or error).
5. Repeats until `quit`.

```rust
fn main() {
    let mut task_list = TaskList::new();
    loop {
        print!("> ");
        // Read input, parse command, call methods, print results
        // Break on "quit"
    }
}
```

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          main.rs                                   │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                    REPL Loop                              │   │
│  │                                                           │   │
│  │  while let Some(line) = read_line() {                    │   │
│  │      match parse_command(line) {                         │   │
│  │          Command::Add(title) => task_list.add(&title),   │   │
│  │          Command::List => task_list.list(),              │   │
│  │          Command::Complete(id) => task_list.complete(id),│   │
│  │          Command::Remove(id) => task_list.remove(id),    │   │
│  │          Command::Quit => break,                         │   │
│  │          Command::Invalid => print_error(),              │   │
│  │      }                                                   │   │
│  │  }                                                       │   │
│  └────────────────────────────────────────────────────────────┘   │
│                           │                                      │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                       TaskList                             │ │
│  │                                                           │ │
│  │  - tasks: Vec<Task>                                       │ │
│  │  - next_id: usize                                         │ │
│  │                                                           │ │
│  │  + new() -> Self                                          │ │
│  │  + add(title: &str) -> &Task                              │ │
│  │  + list() -> &[Task]                                      │ │
│  │  + complete(id: usize) -> Result<(), TaskError>           │ │
│  │  + remove(id: usize) -> Result<Task, TaskError>           │ │
│  └────────────────────────────────────────────────────────────┘   │
│                           │                                      │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                       Domain Models                        │ │
│  │                                                           │ │
│  │  - Task { id, title, status }                             │ │
│  │  - TaskStatus { Pending, InProgress, Done }              │ │
│  │  - TaskError { TaskNotFound }                             │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Why This Architecture Works

1. **Separation of concerns:** The REPL loop handles I/O. `TaskList` handles business logic. The domain models define the data.

2. **Testability:** `TaskList` has no I/O. It can be tested with unit tests. No filesystem, no stdin/stdout.

3. **Reusability:** The `TaskList` could be used in a different context—a GUI, a web service, or a batch script.

4. **Extensibility:** Adding persistence is easy—just add a `save` and `load` method to `TaskList` that the REPL calls on start and exit.

5. **Clarity:** The architecture is obvious from the code. You can see the separation of concerns at a glance.

---

## Worked Example

### Designing the Task Tracker v1 Architecture

Let's walk through the architecture design step by step.

#### Step 1: Define the Domain Models

```rust
// src/lib.rs or directly in main.rs for this project

enum TaskStatus {
    Pending,
    InProgress {
        started_at: String,
    },
    Done {
        completed_at: String,
    },
}

struct Task {
    id: usize,
    title: String,
    status: TaskStatus,
}

enum TaskError {
    TaskNotFound(usize),
}
```

#### Step 2: Define the TaskList API

```rust
struct TaskList {
    tasks: Vec<Task>,
    next_id: usize,
}

impl TaskList {
    pub fn new() -> Self {
        TaskList {
            tasks: Vec::new(),
            next_id: 1,
        }
    }

    pub fn add(&mut self, title: &str) -> &Task {
        let task = Task {
            id: self.next_id,
            title: title.to_string(),
            status: TaskStatus::Pending,
        };
        self.next_id += 1;
        self.tasks.push(task);
        self.tasks.last().unwrap()
    }

    pub fn list(&self) -> &[Task] {
        &self.tasks
    }

    pub fn complete(&mut self, id: usize) -> Result<(), TaskError> {
        for task in &mut self.tasks {
            if task.id == id {
                task.status = TaskStatus::Done {
                    completed_at: std::time::SystemTime::now()
                        .duration_since(std::time::UNIX_EPOCH)
                        .unwrap()
                        .as_secs()
                        .to_string(),
                };
                return Ok(());
            }
        }
        Err(TaskError::TaskNotFound(id))
    }

    pub fn remove(&mut self, id: usize) -> Result<Task, TaskError> {
        if let Some(pos) = self.tasks.iter().position(|t| t.id == id) {
            Ok(self.tasks.remove(pos))
        } else {
            Err(TaskError::TaskNotFound(id))
        }
    }
}
```

#### Step 3: Design the REPL Command Parser

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

#### Step 4: Sketch the Main Loop

```rust
use std::io::{self, Write};

fn main() {
    let mut task_list = TaskList::new();

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
                let tasks = task_list.list();
                if tasks.is_empty() {
                    println!("No tasks.");
                } else {
                    for task in tasks {
                        let status_str = match task.status {
                            TaskStatus::Pending => "Pending",
                            TaskStatus::InProgress { .. } => "In Progress",
                            TaskStatus::Done { .. } => "Done",
                        };
                        println!("#{}: {} [{}]", task.id, task.title, status_str);
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
                eprintln!("Invalid command. Try: add, list, complete <id>, remove <id>, quit");
            }
        }
    }
}
```

#### Step 5: Write a Decision Journal Entry

```
📓 Decision Journal — Task Tracker v1 Architecture

**Decision:** Separate TaskList (pure logic) from REPL loop (I/O).

**Rationale:** This makes the core logic testable, reusable, and easier to extend. The REPL loop is just a thin wrapper.

**Alternatives considered:** Writing everything in main (would be quick but hard to test and maintain).

**Tradeoff:** Slightly more code upfront vs. much easier to maintain and extend.

**Date:** Week 5, Day 4
```

---

## Engineering Notes

### Engineering Note: The Thin REPL Pattern

The REPL loop should be as thin as possible. Its only job is to:

1. Read input.
2. Parse commands.
3. Call `TaskList` methods.
4. Print results.

No business logic should be in the REPL. No parsing of task data. No complex formatting. All of that goes in `TaskList` or separate helper functions.

### Engineering Note: The Return Type Rule

Per §2.3.5, a good API makes correct usage easy and incorrect usage hard:

| Method | Return Type | Why |
|---|---|---|
| `add` | `&Task` | The task exists; returning a reference is safe. |
| `complete` | `Result<(), TaskError>` | The operation might fail (task not found). |
| `remove` | `Result<Task, TaskError>` | The operation might fail, and you might want the removed task. |

### Engineering Note: Planning Before Code

The architecture discussion is essential because it:

- Identifies the components and their responsibilities.
- Defines the public API before implementation.
- Prevents you from painting yourself into a corner.
- Documents your design decisions.

---

## Compiler Thinking

**Prediction 1:**

Why does `TaskList::add` return `&Task` instead of `Task`?

<details>
<summary>Answer</summary>

`&Task` is a reference to the task stored in the vector. Returning `Task` would move ownership out of the vector, leaving a hole. The reference is safe because the vector owns the task and the reference is valid as long as the vector is not mutated.

</details>

---

**Prediction 2:**

Why does `TaskList::remove` return `Result<Task, TaskError>` and not `Option<Task>`?

<details>
<summary>Answer</summary>

`Result` provides a specific error type (`TaskError::TaskNotFound`) that explains *why* the operation failed. `Option` would just be `None`. The `Result` gives more information to the user.

</details>

---

**Prediction 3:**

Why does the REPL loop use `eprintln!` for errors and `println!` for normal output?

<details>
<summary>Answer</summary>

`println!` writes to stdout (standard output). `eprintln!` writes to stderr (standard error). Errors should go to stderr so they can be separated from normal output. This is the same pattern you used in the Calculator CLI.

</details>

---

## Mini Challenge

### Challenge 1 — Design the Command Parser

Design a command parser that handles all commands: `add`, `list`, `complete`, `remove`, and `quit`.

### Challenge 2 — Design the Error Type

Design a `TaskError` enum that includes at least `TaskNotFound` and `EmptyTitle`.

### Challenge 3 — Architecture Diagram

Draw an architecture diagram for the Task Tracker v1 showing:
- The REPL loop
- The TaskList
- The domain models (Task, TaskStatus, TaskError)

---

## Reflection

Write the answer to this question in a text file called `reflection-phase1-w5-d4.md` in your Phase 1 repository. Commit it.

**Question:**

"You have just designed the architecture for the Task Tracker v1—the first Major project in Phase 1. You separated the core logic (`TaskList`) from the I/O (the REPL loop). Why is this separation important? What are the benefits of designing the architecture before writing any code?"

<details>
<summary>Reflection Guidance</summary>

The separation of core logic from I/O is important for several reasons:

1. **Testability:** The core logic has no I/O, so it can be tested with unit tests. No filesystem, no stdin/stdout. This makes tests fast and reliable.

2. **Reusability:** The same `TaskList` could be used in a GUI, a web service, or a batch script. The REPL is just one way to interact with it.

3. **Maintainability:** Changes to the I/O (e.g., adding persistence) don't affect the core logic. Changes to the core logic don't affect the I/O.

4. **Clarity:** The architecture is obvious from the code. You can see the separation of concerns at a glance.

Designing the architecture before writing code prevents you from painting yourself into a corner. It forces you to think about the big picture before you get lost in the details.

</details>

---

## End of Day 4, Week 5

### What You Have Accomplished

By the end of this session, you have:

- **Designed the data model** for Task Tracker v1 (`Task`, `TaskStatus`, `TaskList`).
- **Planned the public API** with methods and error types.
- **Designed the REPL loop** as a thin I/O layer.
- **Documented architecture decisions** in a Decision Journal entry.
- **Applied separation of concerns** to make the core testable.
- **Planned the architecture** before writing any code.

### What This Builds Toward

Tomorrow, you will build the Task Tracker v1—the first Major project of Phase 1.

**Week 5, Day 5 — Project Work: Task Tracker v1 (Milestone 1)**

You will implement:
- The `Task` and `TaskStatus` types.
- The `TaskList` type with `add`, `list`, `complete`, and `remove` methods.
- The error handling.

Everything you have learned this week—error handling, collections, traits—will come together in this project.

### The Engineering Habit to Carry Forward

Before you write any code for a project, design the architecture. Ask yourself:

1. What are the components?
2. What are their responsibilities?
3. How do they communicate?
4. What is the public API?
5. What is the separation of concerns?

This is the discipline of engineering. It prevents you from building yourself into a corner.

Rest well. Tomorrow, you build your first Major project.
