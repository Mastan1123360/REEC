---
id: P1-W6-D1
phase: 1
week: 6
day: 1
title: 'Project Work: Task Tracker v1 — Milestone 3'
subtitle: >-
  Preparing your first Major project for persistence and the transition to Phase
  2
estimated_time: 75
difficulty: Intermediate
learning_objectives:
  - Understand the constraints of persistence-ready data modeling
  - Design a data model that can be serialized to disk
  - Add versioning to the data model for future compatibility
  - Implement serialization infrastructure without file I/O
  - Prepare the Task Tracker for Phase 2's persistence features
  - Document decisions about data format and versioning
  - Apply the Engineering Decision Journal discipline
widgets:
  - story
  - mental-model
  - worked-example
  - engineering-note
  - compiler-thinking
  - mini-challenge
  - reflection
project:
  - Task Tracker v1 (Milestone 3 — persistence-ready data model)
failure_lab: null
reading:
  - >-
    REEC-05-Phase1-RustFoundations.md §1.12 (Project 04 — Task Tracker v1
    [Major])
  - REEC-02-Templates.md §Template C (Project Specification — Future Evolution)
  - >-
    The Rust Programming Language, Chapter 15 (Smart Pointers) — optional
    preview
tags:
  - project
  - task-tracker
  - persistence
  - serialization
  - design
  - major-project
next: P1-W6-D2
previous: P1-W5-D7
published: true
---

:::story

## The Developer Who Forgot the Future

A developer—call him David—had built a beautiful task tracker. It had a clean REPL. It had error handling. It had tests. It was a model of Rust engineering.

Then a user asked: "Can I save my tasks between runs?"

David realised he had never planned for persistence. The `TaskList` was a `Vec<Task>` in memory. There was no way to save it to disk or load it back.

He tried to add persistence to his existing codebase. It was painful. The `Task` struct had no serialization support. The `TaskStatus` enum had fields with different types. The architecture wasn't designed for persistence.

He had to make significant changes to the core data model. He had to add serialization annotations. He had to add a version field. He had to add load and save methods. The code worked, but it was messy.

A senior engineer reviewed his work.

"Your code works," the senior said, "but it's fragile. You built for today, not for tomorrow. The `Task` struct is tightly coupled to the serialization format. Changing one requires changing the other. And you have no versioning—if the format changes in the future, you can't load old data."

David learned a lesson: design for persistence from the beginning. It doesn't mean you have to implement persistence right away. It means you need to plan for it.

Today, you design Task Tracker v1 for the future.

:::

:::mental-model

Before we dive into persistence-ready design, internalise these three mental models. They reframe design from a one-time activity into a deliberate engineering process.

**Mental Model 1 — Design for the future you can foresee.**

The Task Tracker v1 will become Task Tracker v2 in Phase 2. v2 will add persistence. You know this now.

Design v1's data model with v2's needs in mind. This is not over-engineering—it is intentional design. It makes the future transition easier and cleaner.

**Mental Model 2 — Serialization is a cross-cutting concern.**

Serialization affects how data is represented. It affects struct definitions, enums, and even the choice of data types.

A good design separates the in-memory representation from the serialized representation. The in-memory representation is for program logic. The serialized representation is for storage.

**Mental Model 3 — Versioning is not optional.**

If you ever change the data format, you need to handle old versions. Without versioning, you cannot load old data after changing the format.

Add a version field from the beginning. It costs almost nothing. It prevents a major headache later.

:::

## Theory

### Milestone 3: Persistence-Ready Data Model

Per REEC-05-Phase1-RustFoundations.md §1.12, Milestone 3 is:

> **Persistence-ready data model, though file persistence itself is deferred to v2.**

This means you must design `Task`, `TaskStatus`, and `TaskList` so they can be easily serialized to disk in Phase 2—without making significant changes to the core logic.

### The Challenges of Persistence

**Challenge 1: Serialization**

Rust's standard library does not include a built-in serialization system. In Phase 2, you will use the `serde` crate, which provides serialization and deserialization.

To make a type serializable, you add `#[derive(Serialize, Deserialize)]` and ensure all fields are also serializable.

**Challenge 2: Timestamps**

`SystemTime` does not implement `Serialize` by default. You can either:
- Use a type that implements `Serialize` (e.g., `String` or `u64`).
- Write a custom serialization implementation.

For this project, using `String` timestamps is the simplest approach.

**Challenge 3: Versioning**

If the data format changes in the future, you need to handle old versions. Add a `version` field to the top-level data structure.

**Challenge 4: Error Handling**

Loading and saving files can fail. The `TaskList` should have methods for `load` and `save` that return `Result`.

### The Persistence-Ready Data Model

**TaskStatus (with String timestamps):**

```rust
#[derive(Debug, Clone, PartialEq)]
enum TaskStatus {
    Pending,
    InProgress {
        started_at: String,  // String, not SystemTime
    },
    Done {
        completed_at: String, // String, not SystemTime
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

**TaskListData (the serializable format):**

```rust
#[derive(Debug, Clone, PartialEq)]
struct TaskListData {
    version: u32,
    next_id: usize,
    tasks: Vec<Task>,
}
```

**TaskList (in-memory representation):**

```rust
struct TaskList {
    data: TaskListData,
}
```

### The Save/Load Interface

**Stub methods for Phase 2:**

```rust
impl TaskList {
    pub fn load(path: &str) -> Result<Self, TaskError> {
        // Stub: will be implemented in Phase 2
        unimplemented!("Persistence will be added in Phase 2")
    }

    pub fn save(&self, path: &str) -> Result<(), TaskError> {
        // Stub: will be implemented in Phase 2
        unimplemented!("Persistence will be added in Phase 2")
    }
}
```

### The Updated TaskList API

**With the `data` field:**

```rust
impl TaskList {
    pub fn new() -> Self {
        TaskList {
            data: TaskListData {
                version: 1,
                next_id: 1,
                tasks: Vec::new(),
            },
        }
    }

    pub fn add(&mut self, title: &str) -> &Task {
        let task = Task {
            id: self.data.next_id,
            title: title.to_string(),
            status: TaskStatus::Pending,
        };
        self.data.next_id += 1;
        self.data.tasks.push(task);
        self.data.tasks.last().unwrap()
    }

    pub fn list(&self) -> &[Task] {
        &self.data.tasks
    }

    pub fn complete(&mut self, id: usize) -> Result<(), TaskError> {
        for task in &mut self.data.tasks {
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
        if let Some(pos) = self.data.tasks.iter().position(|t| t.id == id) {
            Ok(self.data.tasks.remove(pos))
        } else {
            Err(TaskError::TaskNotFound(id))
        }
    }
}
```

---

## Worked Example

### Making Task Tracker v1 Persistence-Ready

Let's update the Task Tracker v1 core logic to be persistence-ready.

#### Step 1: Update TaskStatus

Change `started_at` and `completed_at` from `SystemTime` to `String`:

```rust
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

#### Step 2: Add the Data Structure

Add `TaskListData` for the serializable format:

```rust
#[derive(Debug, Clone, PartialEq)]
struct TaskListData {
    version: u32,
    next_id: usize,
    tasks: Vec<Task>,
}
```

#### Step 3: Update TaskList

Change `TaskList` to hold `TaskListData`:

```rust
struct TaskList {
    data: TaskListData,
}
```

#### Step 4: Update All Methods

Update all methods to use `self.data`:

```rust
impl TaskList {
    pub fn new() -> Self {
        TaskList {
            data: TaskListData {
                version: 1,
                next_id: 1,
                tasks: Vec::new(),
            },
        }
    }

    pub fn add(&mut self, title: &str) -> &Task {
        let task = Task {
            id: self.data.next_id,
            title: title.to_string(),
            status: TaskStatus::Pending,
        };
        self.data.next_id += 1;
        self.data.tasks.push(task);
        self.data.tasks.last().unwrap()
    }

    pub fn list(&self) -> &[Task] {
        &self.data.tasks
    }

    pub fn complete(&mut self, id: usize) -> Result<(), TaskError> {
        for task in &mut self.data.tasks {
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
        if let Some(pos) = self.data.tasks.iter().position(|t| t.id == id) {
            Ok(self.data.tasks.remove(pos))
        } else {
            Err(TaskError::TaskNotFound(id))
        }
    }

    // Stub methods for Phase 2
    pub fn load(path: &str) -> Result<Self, TaskError> {
        unimplemented!("Persistence will be added in Phase 2")
    }

    pub fn save(&self, path: &str) -> Result<(), TaskError> {
        unimplemented!("Persistence will be added in Phase 2")
    }
}
```

#### Step 5: Update Tests

Ensure all tests still pass after the refactoring:

```bash
$ cargo test
```

#### Step 6: Commit the Changes

```bash
git add src/main.rs
git commit -m "feat: make Task Tracker v1 persistence-ready for Phase 2

- Change started_at and completed_at from SystemTime to String
- Add TaskListData struct with version field
- Update TaskList to hold TaskListData internally
- Add stub load/save methods for Phase 2
- All tests still passing
"
```

---

## Engineering Notes

### Engineering Note: Why Use String Timestamps

`SystemTime` does not implement `Serialize` by default. Using `String` avoids this problem.

In Phase 2, you will add `serde` for serialization. When you add `serde`, you can:
- Keep `String` (simple, human-readable).
- Add a custom serializer for `SystemTime`.

For now, `String` is the simplest approach.

### Engineering Note: The Version Field

The `version` field is important for future compatibility. If the data format changes in Phase 2, you can check the version and handle the migration.

**Example:** If Phase 2 adds a new field to `Task`, the version check can handle loading old files.

### Engineering Note: The Stub Pattern

```rust
fn load(path: &str) -> Result<Self, TaskError> {
    unimplemented!("Persistence will be added in Phase 2")
}
```

The `unimplemented!` macro indicates that the method is not yet implemented. This is a clear signal to anyone reading the code that persistence is planned but not yet added.

### Engineering Note: Separation of Concerns

The `TaskList` now separates the in-memory data (`data`) from the serialized format. This is a cleaner design.

In Phase 2, adding persistence will be easier because:
- `TaskListData` is already structured for serialization.
- The `load` and `save` methods are stubs that will be filled in.

---

## Compiler Thinking

**Prediction 1:**

Will the `TaskListData` struct be serializable in Phase 2?

<details>
<summary>Answer</summary>

Yes, because all fields in `TaskListData` (`version`, `next_id`, `tasks`) are types that `serde` can serialize. `Task` and `TaskStatus` use `String` for timestamps, which `serde` supports.

</details>

---

**Prediction 2:**

Why does `TaskList` store `data` instead of directly storing the fields?

<details>
<summary>Answer</summary>

`data` groups all the fields that will be serialized to disk. This makes it easy to `serialize` or `deserialize` the entire `TaskList` state.

</details>

---

**Prediction 3:**

What happens if you change the `version` field in the future?

<details>
<summary>Answer</summary>

You can check the version and handle migrations. For example, if version 1 has `id` as `usize` and version 2 has `id` as `u64`, you can convert the data when loading.

</details>

---

## Mini Challenge

### Challenge 1 — Add Serialization Attributes

Add the `#[derive(Serialize, Deserialize)]` attributes to `TaskListData`, `Task`, and `TaskStatus`. You don't need to add the `serde` crate yet—just prepare the code.

<details>
<summary>Hint</summary>

You'll need to add `#[derive(Serialize, Deserialize)]` to all structs and enums that will be serialized. For the enum, you might need `#[serde(tag = "type")]` to handle variants with different fields.

</details>

---

### Challenge 2 — Add a Migration Plan

Write a short plan for how you would handle a version migration if the `Task` struct changes in Phase 2.

### Challenge 3 — Review the Design

Review the persistence-ready design. Is there anything missing? What would make persistence even easier in Phase 2?

---

## Reflection

Write the answer to this question in a text file called `reflection-phase1-w6-d1.md` in your Phase 1 repository. Commit it.

**Question:**

"Today you designed Task Tracker v1 to be persistence-ready. You added a version field, separated the serializable data into its own struct, and prepared the architecture for Phase 2. Why is it important to design for future features even when you aren't implementing them yet? What is the difference between over-engineering and intentional design?"

<details>
<summary>Reflection Guidance</summary>

Designing for future features is not over-engineering. It is intentional engineering.

**Over-engineering:** Adding features you don't need, making the code overly complex, or designing for a future that may never come.

**Intentional design:** Understanding the likely future evolution of the code and designing the architecture to accommodate it. This is not adding complexity—it is reducing future complexity.

The Task Tracker v1 will become v2 in Phase 2. You know this. By designing v1 with v2 in mind, you make the transition easier. You avoid having to make major changes later.

The version field is a small addition that costs almost nothing. But it saves a lot of future effort. It is a good example of intentional design.

</details>

---

## End of Day 1, Week 6

### What You Have Accomplished

By the end of this session, you have:

- **Designed a persistence-ready data model** for Task Tracker v1.
- **Separated the serializable data** into its own struct.
- **Added a version field** for future compatibility.
- **Added stub load/save methods** for Phase 2.
- **Updated all methods** to use the new data structure.
- **Ensured all tests still pass** after the refactoring.

### What This Builds Toward

The Task Tracker v1 is now persistence-ready. In Phase 2, you will add:
- **Cargo workspaces:** Split into core and CLI crates.
- **File persistence:** Save and load tasks from disk.
- **Serialization:** Use `serde` and `serde_json`.

The architecture you have designed today will make this transition smooth.

### The Engineering Habit to Carry Forward

When building any system, ask yourself: "What will this need in the future?" Design for the future you can foresee. This is not over-engineering. It is intentional design.

### Tomorrow

**Week 6, Day 2 — Testing Pass (Mini Lab 1.5)**

You will:
- Write a comprehensive test suite for Task Tracker v1.
- Cover all edge cases and error paths.
- Ensure the core logic is thoroughly tested.

The tests will verify that the persistence-ready design works correctly.

Rest well. Tomorrow, you test everything.
