---
id: P1-W4-D5
phase: 1
week: 4
day: 5
title: 'Project Work: File Organizer — Milestones 2 and 3'
subtitle: Executing file moves safely with collision handling and a full report
estimated_time: 90
difficulty: Intermediate
learning_objectives:
  - Execute file move operations safely with proper error handling
  - Create directories as needed when moving files
  - Detect and handle filename collisions explicitly
  - Implement a report system for tracking what happened
  - Use the `?` operator for error propagation in complex operations
  - Write comprehensive integration tests with temporary directories
  - Complete a real-world CLI tool with safety features
widgets:
  - story
  - mental-model
  - worked-example
  - engineering-note
  - compiler-thinking
  - mini-challenge
  - reflection
project:
  - File Organizer (Milestones 2 and 3 — move execution + collision handling)
failure_lab: null
reading:
  - REEC-05-Phase1-RustFoundations.md §1.12 (Project 03 — File Organizer)
  - 'The Rust Programming Language, Chapter 9 (Error Handling)'
  - 'std::fs module documentation'
tags:
  - project
  - filesystem
  - move-execution
  - collision-handling
  - error-handling
  - completion
next: P1-W4-D6
previous: P1-W4-D4
published: true
---

:::story

## The Developer Who Overwrote Everything

A developer—call her Sophia—had built her File Organizer. It scanned directories. It grouped files by extension. It planned where files should go.

Then she turned off dry-run mode and ran it for real.

The code moved files into subdirectories. But it had a bug: when two files in different source directories had the same name, the second file overwrote the first. A year of project work, gone in seconds.

Her test suite had passed because she had only tested with unique filenames. The real world had duplicate filenames. The real world didn't care about her tests.

She stared at her terminal. The files were gone. She had no backup.

She learned a brutal lesson: safety isn't just about making things work. It's about making things *not break*. It's about handling the edge cases you haven't thought of.

Today, you handle those edge cases.

:::

:::mental-model

Before we dive into completing the File Organizer, internalise these three mental models. They reframe safety from an afterthought into a core design principle.

**Mental Model 1 — Safety is not optional. It is the primary requirement.**

When your code touches the filesystem, safety is not a "nice to have." It is the most important requirement. A file manager that loses data is worse than useless—it is dangerous.

Safety means:
- Never overwrite files without asking or reporting.
- Always provide a dry-run mode.
- Always report exactly what happened.
- Always handle errors gracefully.

**Mental Model 2 — The `?` operator is your friend for error propagation.**

When you have a chain of fallible operations, the `?` operator simplifies error handling. It converts `Result` to `Err` and propagates it upward, keeping the code clean.

But be careful: `?` only works in functions that return `Result`. It's the "early return" pattern for errors.

**Mental Model 3 — Collisions are inevitable. Plan for them.**

When you move files, there will be collisions. Files with the same name in different directories. You must have a strategy for handling them.

The three common strategies:
1. **Overwrite:** Replace the existing file (dangerous).
2. **Skip:** Leave the existing file and report the collision.
3. **Rename:** Add a suffix to the incoming file (e.g., `file (1).txt`).

For the File Organizer, you will implement skipping with reporting, with renaming as a stretch goal.

:::

## Theory

### Project Completion: File Organizer

Per REEC-05-Phase1-RustFoundations.md §1.12, the File Organizer has three milestones:

**Milestone 1 (Completed Day 4):** Scan a directory and group files by extension (dry-run output only).

**Milestone 2 (Today):** Perform actual moves, creating subfolders as needed.

**Milestone 3 (Today):** Handle filename collisions explicitly—either append a suffix, or skip and report. This must be a deliberate decision documented in the README.

### The Move Execution

The core of the File Organizer is the move operation:

```rust
fn execute_move(op: &MoveOperation) -> Result<(), OrganizeError> {
    // Create the target directory if it doesn't exist
    if let Some(parent) = op.target.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent)?;
        }
    }

    // Perform the move (rename)
    fs::rename(&op.source, &op.target)?;

    Ok(())
}
```

### Collision Handling

Collisions occur when the target file already exists:

```rust
fn resolve_collision(op: &MoveOperation) -> Result<MoveOperation, CollisionResolution> {
    if !op.target.exists() {
        return Ok(op.clone());
    }

    // Strategy: skip and report
    Err(CollisionResolution::Skip {
        source: op.source.clone(),
        target: op.target.clone(),
    })
}
```

### The Complete Organize Function

The full `organize` function ties everything together:

```rust
fn organize(dir: &Path, dry_run: bool, strategy: CollisionStrategy) -> Result<OrganizeReport, OrganizeError> {
    let files = scan_directory(dir)?;
    let groups = group_by_extension(&files);
    let operations = plan_moves(&groups, dir);

    let mut report = OrganizeReport::new(dry_run);

    for op in operations {
        match strategy.resolve(&op) {
            CollisionResolution::Ready(op) => {
                if !dry_run {
                    execute_move(&op)?;
                }
                report.moved.push(op);
            }
            CollisionResolution::Skip { source, target } => {
                report.skipped.push((source, target));
            }
            CollisionResolution::Rename { op, new_path } => {
                if !dry_run {
                    execute_move(&op)?;
                }
                report.renamed.push((op, new_path));
            }
        }
    }

    Ok(report)
}
```

### The Report System

A complete report tells the user everything that happened:

```rust
struct OrganizeReport {
    dry_run: bool,
    moved: Vec<MoveOperation>,
    skipped: Vec<(PathBuf, PathBuf)>,
    renamed: Vec<(MoveOperation, PathBuf)>,
    errors: Vec<(PathBuf, String)>,
}

impl OrganizeReport {
    fn print(&self) {
        if self.dry_run {
            println!("DRY RUN — No files were moved");
        }

        for op in &self.moved {
            let action = if self.dry_run { "Would move" } else { "Moved" };
            println!("{}: {} → {}", action, op.source.display(), op.target.display());
        }

        for (source, target) in &self.skipped {
            println!("Skipped: {} → {} (already exists)", source.display(), target.display());
        }

        for (op, new_path) in &self.renamed {
            println!("Renamed: {} → {}", op.source.display(), new_path.display());
        }

        for (path, err) in &self.errors {
            eprintln!("Error: {}: {}", path.display(), err);
        }
    }
}
```

---

## Worked Example

### Completing the File Organizer

#### Step 1: Add Collision Handling

Add a collision handling module:

```rust
#[derive(Debug, Clone, Copy)]
enum CollisionStrategy {
    Skip,
    Rename,
}

#[derive(Debug)]
enum CollisionResolution {
    Ready(MoveOperation),
    Skip { source: PathBuf, target: PathBuf },
    Rename { op: MoveOperation, new_path: PathBuf },
}

impl CollisionStrategy {
    fn resolve(&self, op: &MoveOperation) -> CollisionResolution {
        if !op.target.exists() {
            return CollisionResolution::Ready(op.clone());
        }

        match self {
            CollisionStrategy::Skip => CollisionResolution::Skip {
                source: op.source.clone(),
                target: op.target.clone(),
            },
            CollisionStrategy::Rename => {
                let mut new_path = op.target.clone();
                let stem = op.target.file_stem().unwrap().to_string_lossy().to_string();
                let ext = op.target.extension()
                    .and_then(|e| e.to_str())
                    .unwrap_or("");

                let mut counter = 1;
                while new_path.exists() {
                    let new_name = if ext.is_empty() {
                        format!("{} ({})", stem, counter)
                    } else {
                        format!("{} ({}).{}", stem, counter, ext)
                    };
                    new_path = op.target.with_file_name(new_name);
                    counter += 1;
                }

                CollisionResolution::Rename {
                    op: op.clone(),
                    new_path,
                }
            }
        }
    }
}
```

#### Step 2: Add Directory Creation

The `execute_move` function needs to create directories:

```rust
fn execute_move(op: &MoveOperation) -> Result<(), OrganizeError> {
    // Create parent directories if needed
    if let Some(parent) = op.target.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent)
                .map_err(|e| OrganizeError::Io(e))?;
        }
    }

    fs::rename(&op.source, &op.target)
        .map_err(|e| OrganizeError::Io(e))?;

    Ok(())
}
```

#### Step 3: Update the organize Function

```rust
fn organize(dir: &Path, dry_run: bool, strategy: CollisionStrategy) -> Result<OrganizeReport, OrganizeError> {
    let files = scan_directory(dir)?;
    let groups = group_by_extension(&files);
    let operations = plan_moves(&groups, dir);

    let mut report = OrganizeReport::new(dry_run);

    for op in operations {
        match strategy.resolve(&op) {
            CollisionResolution::Ready(op) => {
                if !dry_run {
                    if let Err(e) = execute_move(&op) {
                        report.errors.push((op.source.clone(), e.to_string()));
                        continue;
                    }
                }
                report.moved.push(op);
            }
            CollisionResolution::Skip { source, target } => {
                report.skipped.push((source, target));
            }
            CollisionResolution::Rename { op, new_path } => {
                let renamed_op = MoveOperation {
                    source: op.source.clone(),
                    target: new_path.clone(),
                };
                if !dry_run {
                    if let Err(e) = execute_move(&renamed_op) {
                        report.errors.push((op.source.clone(), e.to_string()));
                        continue;
                    }
                }
                report.renamed.push((op, new_path));
            }
        }
    }

    Ok(report)
}
```

#### Step 4: Update main to Accept Collision Strategy

```rust
fn main() {
    let args: Vec<String> = env::args().collect();

    let mut dir = PathBuf::from(".");
    let mut dry_run = false;
    let mut strategy = CollisionStrategy::Skip;

    let mut args_iter = args.iter().skip(1);
    while let Some(arg) = args_iter.next() {
        match arg.as_str() {
            "--dry-run" | "-n" => dry_run = true,
            "--overwrite" => strategy = CollisionStrategy::Overwrite,
            "--rename" => strategy = CollisionStrategy::Rename,
            "--skip" => strategy = CollisionStrategy::Skip,
            arg if !arg.starts_with('-') => {
                dir = PathBuf::from(arg);
            }
            _ => {
                eprintln!("Unknown flag: {}", arg);
                eprintln!("Usage: file_organizer [--dry-run] [--skip|--rename|--overwrite] <directory>");
                std::process::exit(1);
            }
        }
    }

    match organize(&dir, dry_run, strategy) {
        Ok(report) => report.print(),
        Err(e) => {
            eprintln!("Error: {}", e);
            std::process::exit(1);
        }
    }
}
```

#### Step 5: Add the Report to the Module

```rust
struct OrganizeReport {
    dry_run: bool,
    moved: Vec<MoveOperation>,
    skipped: Vec<(PathBuf, PathBuf)>,
    renamed: Vec<(MoveOperation, PathBuf)>,
    errors: Vec<(PathBuf, String)>,
}

impl OrganizeReport {
    fn new(dry_run: bool) -> Self {
        OrganizeReport {
            dry_run,
            moved: Vec::new(),
            skipped: Vec::new(),
            renamed: Vec::new(),
            errors: Vec::new(),
        }
    }

    fn print(&self) {
        if self.dry_run {
            println!("DRY RUN — No files were moved");
        }

        for op in &self.moved {
            let action = if self.dry_run { "Would move" } else { "Moved" };
            println!("{}: {} → {}", action, op.source.display(), op.target.display());
        }

        for (source, target) in &self.skipped {
            println!("Skipped: {} → {} (already exists)", source.display(), target.display());
        }

        for (op, new_path) in &self.renamed {
            println!("Renamed: {} → {}", op.source.display(), new_path.display());
        }

        for (path, err) in &self.errors {
            eprintln!("Error: {}: {}", path.display(), err);
        }

        let total = self.moved.len() + self.skipped.len() + self.renamed.len();
        println!("\nTotal: {} moved, {} skipped, {} renamed, {} errors",
            self.moved.len(),
            self.skipped.len(),
            self.renamed.len(),
            self.errors.len()
        );
    }
}
```

#### Step 6: Test with a Real Directory

```bash
# Create a test directory with duplicate filenames
$ mkdir -p test_dir/sub1 test_dir/sub2
$ echo "hello" > test_dir/sub1/file.txt
$ echo "world" > test_dir/sub2/file.txt

# Dry run with skip strategy
$ cargo run -- --dry-run test_dir
DRY RUN — No files were moved
Would move: test_dir/sub1/file.txt → test_dir/txt/file.txt
Would move: test_dir/sub2/file.txt → test_dir/txt/file.txt
Skipped: test_dir/sub2/file.txt → test_dir/txt/file.txt (already exists)

# Real run with rename strategy
$ cargo run -- --rename test_dir
Renamed: test_dir/sub1/file.txt → test_dir/txt/file.txt
Renamed: test_dir/sub2/file.txt → test_dir/txt/file (1).txt
```

#### Step 7: Commit the Changes

```bash
git add src/main.rs
git commit -m "feat: complete file organizer with move execution and collision handling

- Add execute_move with directory creation
- Implement collision handling (skip, rename, overwrite)
- Add --skip, --rename, --overwrite flags
- Add full report with moved, skipped, renamed, and errors
- All tests passing; clippy warnings resolved
"
```

---

## Engineering Notes

### Engineering Note: The Cost of Overwriting

Overwriting is the most dangerous collision strategy. It silently destroys data. Unless you have a very good reason, avoid it.

**When overwriting might be appropriate:**
- You are absolutely sure the user wants to replace the existing file.
- You are writing a tool that explicitly says it will overwrite.
- You have a backup or version control system.

**When overwriting is not appropriate:**
- Any general-purpose file organizer.
- Any tool that users might run on their important files.
- Any tool that doesn't have a safety mechanism like a trash or backup.

### Engineering Note: Testing Destructive Operations

Testing destructive operations requires isolation. The `tempfile` crate is perfect for this.

```rust
#[test]
fn test_move_with_collision() {
    let temp_dir = tempdir().unwrap();
    let dir = temp_dir.path();

    // Create files
    fs::write(dir.join("file1.txt"), b"test").unwrap();
    fs::write(dir.join("file2.txt"), b"test").unwrap();

    // ... test the move operation ...
}
```

### Engineering Note: The Report Pattern

The report pattern is useful for any operation that performs multiple actions. It gives the user a complete picture of what happened.

**A good report includes:**
- What was successfully done (moved, copied, deleted).
- What was skipped (and why).
- What errors occurred (and on which files).
- A summary of total counts.

---

## Compiler Thinking

**Prediction 1:**

Will this code compile?

```rust
fn execute_move(op: &MoveOperation) -> Result<(), OrganizeError> {
    fs::rename(&op.source, &op.target)?;
    Ok(())
}
```

<details>
<summary>Answer</summary>

**Yes.** The `?` operator propagates the `io::Error` upward, and because `OrganizeError` implements `From<io::Error>`, the conversion happens automatically.

</details>

---

**Prediction 2:**

What does `fs::create_dir_all(parent)?` do that `fs::create_dir` doesn't?

<details>
<summary>Answer</summary>

`fs::create_dir` creates a single directory and fails if any parent directory is missing. `fs::create_dir_all` creates all parent directories recursively.

For example, if you want to create `a/b/c/d`, `create_dir_all` creates `a`, then `a/b`, then `a/b/c`, then `a/b/c/d`.

</details>

---

**Prediction 3:**

Why does the `rename` function return an error if the target file already exists?

<details>
<summary>Answer</summary>

On Unix-like systems, `rename` replaces the target if it exists. On Windows, it returns an error. Rust's `fs::rename` follows the Unix semantics on all platforms.

This is why you need to check for existence before renaming.

</details>

---

## Mini Challenge

### Challenge 1 — Add an Overwrite Flag

Add support for an `--overwrite` flag that replaces existing files instead of skipping or renaming.

### Challenge 2 — Add Support for Symlinks

The File Organizer currently ignores symlinks. Add support for:
- Following symlinks (moving the target file).
- Moving symlinks themselves.

**Document your choice** in the README.

### Challenge 3 — Add a `--undo` Flag

Add a `--undo` flag that reverses the last organize operation using a log file.

**This is a stretch challenge.** It requires:
- Logging every move operation to a file.
- Reading the log file to reverse the operations.
- Handling the case where the user has moved files after the original operation.

---

## Reflection

Write the answer to this question in a text file called `reflection-phase1-w4-d5.md` in your Phase 1 repository. Commit it.

**Question:**

"The File Organizer is the first project in this curriculum that handles collisions. When two files have the same name, you must decide what to do: skip, rename, or overwrite. Explain why this decision is important, and describe a scenario where the wrong choice would cause data loss. What does this teach you about writing software that interacts with the real world?"

<details>
<summary>Reflection Guidance</summary>

The collision handling decision is important because it determines whether data is lost or preserved.

**Scenario:** A user runs the File Organizer on their Downloads folder. Two files from different sources have the same name: `report.pdf` from an email attachment, and `report.pdf` from a website download. Both are important.

- If the tool overwrites, the first file is lost. The user loses data.
- If the tool skips, the second file is not moved. The user has to handle it manually, but no data is lost.
- If the tool renames, both files are preserved. The user has both versions.

The wrong choice destroys data. The right choice preserves it.

This teaches you that software that interacts with the real world must be designed with safety first. You cannot assume that the user's data is replaceable. You must handle edge cases gracefully.

</details>

---

## End of Day 5, Week 4

### What You Have Accomplished

By the end of this session, you have:

- **Completed the File Organizer** with full move execution.
- **Implemented collision handling** with skip, rename, and overwrite strategies.
- **Created directories recursively** for target paths.
- **Added a comprehensive report system** for tracking operations.
- **Written tests** with temporary directories.
- **Applied safety-first design** for destructive operations.
- **Documented collision handling decisions** in the README.

### What This Builds Toward

The File Organizer is complete. You now have three projects under your belt:

1. **Calculator CLI** — Your first Rust program.
2. **Number Converter** — Enums and pattern matching.
3. **File Organizer** — Real-world I/O, custom error handling, safety.

**Tomorrow, Day 6, is the Engineering Review.** You will self-assess the File Organizer against the rubric, identify areas for improvement, and plan a refactor pass.

### The Engineering Habit to Carry Forward

When writing code that touches user data, always ask:
- What could go wrong?
- How will the user know what happened?
- Can I preview the operation before running it?
- What happens in edge cases (collisions, permissions, etc.)?

This is the mindset of a professional engineer. Safety is not optional. It is the primary requirement.

Rest well. Tomorrow, you review your work.
