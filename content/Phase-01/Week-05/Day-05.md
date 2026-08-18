---
id: P1-W5-D5
phase: 1
week: 5
day: 5
title: 'Project Work: Task Tracker v1 — Milestone 1'
subtitle: Building the core data model of your first Major project
estimated_time: 90
difficulty: Intermediate
learning_objectives:
  - Implement the core data model for Task Tracker v1
  - Define structs and enums that capture the domain
  - Implement methods with proper error handling
  - Use Result and custom error types
  - Write unit tests for the core logic
  - Apply the engineering standards from Appendix A
  - 'Build a testable, reusable core library'
widgets:
  - story
  - mental-model
  - worked-example
  - engineering-note
  - compiler-thinking
  - mini-challenge
  - reflection
project:
  - Task Tracker v1 (Milestone 1 — core data model)
failure_lab: null
reading:
  - >-
    REEC-05-Phase1-RustFoundations.md §1.12 (Project 04 — Task Tracker v1
    [Major])
  - REEC-04-EngineeringStandardsAppendix.md (review)
tags:
  - project
  - task-tracker
  - data-model
  - error-handling
  - testing
  - major-project
next: P1-W5-D6
previous: P1-W5-D4
published: true
---

:::story

## The Developer Who Built a Solid Foundation

A developer—call her Elena—had just finished the architecture discussion. She knew exactly what she needed to build:

- A `Task` struct with an ID, title, and status
- A `TaskStatus` enum with Pending, InProgress, and Done variants
- A `TaskList` struct that owns a `Vec<Task>` and a counter
- Methods for `add`, `list`, `complete`, and `remove`
- A `TaskError` enum for error handling

She opened her editor and started coding. She was deliberate. She thought about every decision:

- `TaskStatus::InProgress` would carry a `started_at` timestamp.
- `TaskStatus::Done` would carry a `completed_at` timestamp.
- The `id` would be a `usize` that auto-increments.
- `complete` would return `Result<(), TaskError>` to handle the "task not found" case.
- `remove` would return `Result<Task, TaskError>` so the caller could use the removed task.

She wrote the code. She added tests. She ran `cargo test` and everything passed.

Then she ran `cargo clippy` and fixed all the warnings.

Then she ran `cargo fmt` to format the code.

Then she committed with a meaningful message:

```
feat: implement TaskList core data model with error handling

- Define Task struct with id, title, and status
- Define TaskStatus enum with Pending, InProgress, Done
- Implement TaskList methods: add, list, complete, remove
- Define TaskError enum for error handling
- Add unit tests for all methods
- All tests passing; clippy warnings resolved
```

She had built the foundation. It was solid. It was testable. It was ready for the REPL loop tomorrow.

Today, you build that same foundation.

:::

:::mental-model

Before we dive into building the Task Tracker, internalise these three mental models. They reframe project work from following instructions into building with intention.

**Mental Model 1 — The core logic should be pure and testable.**

The core logic (`TaskList`) should have no I/O. It should not know about stdin, stdout, files, or the network. This makes it pure, testable, and reusable.

When you write `TaskList`, you are writing a library. The REPL loop (tomorrow) will be the application that uses the library.

**Mental Model 2 — Error handling is part of the API.**

The methods on `TaskList` should use `Result` to communicate failures. The caller (the REPL loop) should handle these errors and present them to the user.

The error type (`TaskError`) should be specific and informative. It should tell the caller exactly what went wrong.

**Mental Model 3 — Tests are not optional.**

The Universal Definition of Done requires `cargo test` to pass. For the Task Tracker, you must have tests for:

- Adding tasks
- Listing tasks
- Completing tasks (including invalid IDs)
- Removing tasks (including invalid IDs)

Tests are your safety net. They prove that the core logic works correctly.

:::

## Theory

### Milestone 1: Core Data Model

Per REEC-05-Phase1-RustFoundations.md §1.12, Milestone 1 is:

> **Task and TaskList types compile, with TaskList::add and ::list working and covered by the test suite.**

### The Domain Models

**TaskStatus:**

```rust
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone, PartialEq)]
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

**Task:**

```rust
#[derive(Debug, Clone, PartialEq)]
struct Task {
    id: usize,
    title: String,
    status: TaskStatus,
}
```

**TaskError:**

```rust
#[derive(Debug, PartialEq)]
enum TaskError {
    TaskNotFound(usize),
}
```

**TaskList:**

```rust
struct TaskList {
    tasks: Vec<Task>,
    next_id: usize,
}
```

### The Implementation

**TaskList::new:**

```rust
impl TaskList {
    pub fn new() -> Self {
        TaskList {
            tasks: Vec::new(),
            next_id: 1,
        }
    }
}
```

**TaskList::add:**

```rust
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
```

**TaskList::list:**

```rust
pub fn list(&self) -> &[Task] {
    &self.tasks
}
```

**TaskList::complete:**

```rust
pub fn complete(&mut self, id: usize) -> Result<(), TaskError> {
    for task in &mut self.tasks {
        if task.id == id {
            let timestamp = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_secs()
                .to_string();
            task.status = TaskStatus::Done {
                completed_at: timestamp,
            };
            return Ok(());
        }
    }
    Err(TaskError::TaskNotFound(id))
}
```

**TaskList::remove:**

```rust
pub fn remove(&mut self, id: usize) -> Result<Task, TaskError> {
    if let Some(pos) = self.tasks.iter().position(|t| t.id == id) {
        Ok(self.tasks.remove(pos))
    } else {
        Err(TaskError::TaskNotFound(id))
    }
}
```

### The Test Suite

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn new_tasklist_is_empty() {
        let list = TaskList::new();
        assert_eq!(list.list().len(), 0);
    }

    #[test]
    fn add_task_works() {
        let mut list = TaskList::new();
        let task = list.add("Buy milk");
        assert_eq!(task.title, "Buy milk");
        assert_eq!(task.status, TaskStatus::Pending);
        assert_eq!(list.list().len(), 1);
    }

    #[test]
    fn list_returns_all_tasks() {
        let mut list = TaskList::new();
        list.add("Task 1");
        list.add("Task 2");
        assert_eq!(list.list().len(), 2);
    }

    #[test]
    fn complete_task_works() {
        let mut list = TaskList::new();
        let task = list.add("Buy milk");
        assert!(list.complete(task.id).is_ok());
        let tasks = list.list();
        match &tasks[0].status {
            TaskStatus::Done { completed_at } => {
                assert!(!completed_at.is_empty());
            }
            _ => panic!("Task should be done"),
        }
    }

    #[test]
    fn complete_nonexistent_task_returns_error() {
        let mut list = TaskList::new();
        let result = list.complete(99);
        assert_eq!(result, Err(TaskError::TaskNotFound(99)));
    }

    #[test]
    fn remove_task_works() {
        let mut list = TaskList::new();
        let task = list.add("Buy milk");
        let removed = list.remove(task.id).unwrap();
        assert_eq!(removed.id, task.id);
        assert_eq!(list.list().len(), 0);
    }

    #[test]
    fn remove_nonexistent_task_returns_error() {
        let mut list = TaskList::new();
        let result = list.remove(99);
        assert_eq!(result, Err(TaskError::TaskNotFound(99)));
    }
}
```

---

## Worked Example

### Building the Core Data Model

Let's build the Task Tracker core data model step by step.

#### Step 1: Create the Project

```bash
$ cargo new task_tracker
$ cd task_tracker
$ git init
$ git add .
$ git commit -m "feat: initial commit — task_tracker project scaffold"
```

#### Step 2: Define the Domain Models

```rust
// src/main.rs — we'll keep everything in one file for simplicity

use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone, PartialEq)]
enum TaskStatus {
    Pending,
    InProgress {
        started_at: String,
    },
    Done {
        completed_at: String,
    },
}

#[derive(Debug, Clone, PartialEq)]
struct Task {
    id: usize,
    title: String,
    status: TaskStatus,
}

#[derive(Debug, PartialEq)]
enum TaskError {
    TaskNotFound(usize),
}
```

#### Step 3: Implement TaskList

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
                let timestamp = SystemTime::now()
                    .duration_since(UNIX_EPOCH)
                    .unwrap()
                    .as_secs()
                    .to_string();
                task.status = TaskStatus::Done {
                    completed_at: timestamp,
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

#### Step 4: Write Tests

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn new_tasklist_is_empty() {
        let list = TaskList::new();
        assert_eq!(list.list().len(), 0);
    }

    #[test]
    fn add_task_works() {
        let mut list = TaskList::new();
        let task = list.add("Buy milk");
        assert_eq!(task.title, "Buy milk");
        assert_eq!(task.status, TaskStatus::Pending);
        assert_eq!(list.list().len(), 1);
    }

    #[test]
    fn list_returns_all_tasks() {
        let mut list = TaskList::new();
        list.add("Task 1");
        list.add("Task 2");
        assert_eq!(list.list().len(), 2);
    }

    #[test]
    fn complete_task_works() {
        let mut list = TaskList::new();
        let task = list.add("Buy milk");
        assert!(list.complete(task.id).is_ok());
        let tasks = list.list();
        match &tasks[0].status {
            TaskStatus::Done { completed_at } => {
                assert!(!completed_at.is_empty());
            }
            _ => panic!("Task should be done"),
        }
    }

    #[test]
    fn complete_nonexistent_task_returns_error() {
        let mut list = TaskList::new();
        let result = list.complete(99);
        assert_eq!(result, Err(TaskError::TaskNotFound(99)));
    }

    #[test]
    fn remove_task_works() {
        let mut list = TaskList::new();
        let task = list.add("Buy milk");
        let removed = list.remove(task.id).unwrap();
        assert_eq!(removed.id, task.id);
        assert_eq!(list.list().len(), 0);
    }

    #[test]
    fn remove_nonexistent_task_returns_error() {
        let mut list = TaskList::new();
        let result = list.remove(99);
        assert_eq!(result, Err(TaskError::TaskNotFound(99)));
    }

    #[test]
    fn add_tasks_get_incrementing_ids() {
        let mut list = TaskList::new();
        let t1 = list.add("Task 1");
        let t2 = list.add("Task 2");
        let t3 = list.add("Task 3");
        assert_eq!(t1.id, 1);
        assert_eq!(t2.id, 2);
        assert_eq!(t3.id, 3);
    }

    #[test]
    fn list_borrows_does_not_move() {
        let mut list = TaskList::new();
        list.add("Task 1");
        let tasks = list.list(); // borrow
        assert_eq!(tasks.len(), 1);
        // list is still valid here
        assert_eq!(list.list().len(), 1);
    }
}
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
git commit -m "feat: implement TaskList core data model with error handling

- Define Task struct with id, title, and status
- Define TaskStatus enum with Pending, InProgress, Done
- Implement TaskList methods: add, list, complete, remove
- Define TaskError enum for error handling
- Add comprehensive unit tests for all methods
- All tests passing; clippy warnings resolved
"
```

---

## Engineering Notes

### Engineering Note: The `&Task` Return Type

`TaskList::add` returns `&Task`. This is a reference to the task stored in the vector.

**Why this is safe:** The vector owns the task. The reference is valid as long as the vector is not mutated. Since `add` returns immediately, the reference is valid for the caller.

**Why this is useful:** The caller can use the task ID and title without having to borrow from the vector manually.

### Engineering Note: The `Result` Return Type

`complete` and `remove` return `Result`. This forces the caller to handle the error case.

- `Result<(), TaskError>` for `complete` — the operation either succeeds or fails.
- `Result<Task, TaskError>` for `remove` — the operation either returns the removed task or an error.

This is per Appendix A.2: library code returns `Result` for recoverable errors.

### Engineering Note: Timestamps

The `completed_at` and `started_at` fields are `String`. In a real application, you would use a proper timestamp type (e.g., `chrono::DateTime`). But for this project, `String` is fine.

The timestamp is generated with `SystemTime::now().duration_since(UNIX_EPOCH)`. This returns the number of seconds since 1970-01-01 UTC.

---

## Compiler Thinking

**Prediction 1:**

Will this code compile?

```rust
fn main() {
    let mut list = TaskList::new();
    let task = list.add("Buy milk");
    let tasks = list.list();
    println!("{}", tasks[0].title);
}
```

<details>
<summary>Answer</summary>

**Yes.** `list.list()` borrows immutably. The reference `task` is still valid because the vector has not been mutated.

</details>

---

**Prediction 2:**

Will this code compile?

```rust
fn main() {
    let mut list = TaskList::new();
    let task = list.add("Buy milk");
    list.complete(task.id).unwrap();
    let tasks = list.list();
    println!("{}", tasks[0].title);
}
```

<details>
<summary>Answer</summary>

**Yes.** `complete` mutates the task, but the reference `task` is still valid because the vector has not been reallocated.

</details>

---

**Prediction 3:**

Why does `TaskList::list` return `&[Task]` and not `&Vec<Task>`?

<details>
<summary>Answer</summary>

`&[Task]` is a slice—a view into a portion of the vector. It's more flexible than `&Vec<Task>` and is the idiomatic way to expose a read-only view of a collection.

</details>

---

**Prediction 4:**

Why does `TaskList::complete` iterate over `&mut self.tasks` instead of consuming the vector?

<details>
<summary>Answer</summary>

`&mut self.tasks` is a mutable reference to the vector. It allows the method to modify the tasks without taking ownership of the vector. The caller retains ownership.

</details>

---

## Mini Challenge

### Challenge 1 — Add a Test for Empty List

Write a test that verifies `list()` returns an empty slice for a new `TaskList`.

### Challenge 2 — Add an `InProgress` Method

Add a method `start_progress(&mut self, id: usize) -> Result<(), TaskError>` that changes a task's status from `Pending` to `InProgress`. Include a test.

### Challenge 3 — Display Task Status

Write a function `format_status(status: &TaskStatus) -> &'static str` that returns a human-readable string for each status variant.

### Challenge 4 — Add a `find` Method

Add a method `find(&self, id: usize) -> Option<&Task>` that returns a reference to a task by ID. Include a test.

---

## Reflection

Write the answer to this question in a text file called `reflection-phase1-w5-d5.md` in your Phase 1 repository. Commit it.

**Question:**

"You have just implemented the core data model for Task Tracker v1. The core logic has no I/O—it's pure Rust code that manipulates data structures. Why is this important? How does this make the code more testable, reusable, and maintainable? Compare this approach to building the REPL loop and the core logic all in one function."

<details>
<summary>Reflection Guidance</summary>

Separating the core logic from I/O is important because:

1. **Testability:** The core logic has no I/O, so it can be tested with unit tests. No filesystem, no stdin/stdout. This makes tests fast and reliable.

2. **Reusability:** The same `TaskList` could be used in a GUI, a web service, or a batch script. The REPL is just one way to interact with it.

3. **Maintainability:** Changes to the I/O (e.g., adding persistence) don't affect the core logic. Changes to the core logic don't affect the I/O.

4. **Clarity:** The architecture is obvious from the code. You can see the separation of concerns at a glance.

Building everything in one function would be faster initially, but it would be harder to test, harder to reuse, and harder to maintain. The separation of concerns is an investment that pays off.

</details>

---

## End of Day 5, Week 5

### What You Have Accomplished

By the end of this session, you have:

- **Implemented the core data model** for Task Tracker v1.
- **Defined structs and enums** for the domain.
- **Implemented methods** with proper error handling.
- **Used `Result` and custom error types.**
- **Written comprehensive unit tests** for all methods.
- **Applied the engineering standards** from Appendix A.
- **Built a testable, reusable core library.**

### What This Builds Toward

Your Task Tracker v1 core logic is complete. The foundation is solid.

**Tomorrow, Day 6, you will add the REPL loop.**
- Reading from stdin.
- Parsing commands.
- Calling `TaskList` methods.
- Printing results.
- Handling errors.

The REPL loop is the thin I/O layer that makes the Task Tracker interactive.

### The Engineering Habit to Carry Forward

When building any project, start with the core logic. Make it pure, testable, and reusable. Then build the I/O layer around it.

This is the discipline of separation of concerns. It makes your code more maintainable, more testable, and more reusable.

Rest well. Tomorrow, you make it interactive.
