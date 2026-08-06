---
id: P1-W4-D4
phase: 1
week: 4
day: 4
title: 'Project Work: File Organizer — Milestone 1'
subtitle: >-
  Building a real-world CLI tool with file I/O, custom error handling, and
  safety
estimated_time: 90
difficulty: Intermediate
learning_objectives:
  - 'Use std::fs to interact with the filesystem safely'
  - Scan directories and group files by extension
  - Define custom error enums for domain-specific failures
  - Use Result propagation with the ? operator
  - Implement a dry-run mode for destructive operations
  - Handle collision cases explicitly (not silently overwriting)
  - Write tests using temporary directories
widgets:
  - story
  - mental-model
  - worked-example
  - engineering-note
  - compiler-thinking
  - mini-challenge
  - reflection
project:
  - File Organizer (Milestone 1 — scan and group)
failure_lab: null
reading:
  - REEC-05-Phase1-RustFoundations.md §1.12 (Project 03 — File Organizer)
  - >-
    The Rust Programming Language, Chapter 8 (Common Collections) — Vec and
    HashMap review
  - REEC-04-EngineeringStandardsAppendix.md §A.2 (Error Handling Philosophy)
tags:
  - project
  - cli
  - filesystem
  - error-handling
  - custom-enums
  - testing
next: P1-W4-D5
previous: P1-W4-D3
published: true
---

:::story

## The Developer Who Deleted Everything

A developer—call him Marcus—was building a file organizer. It was a simple tool: given a directory, it would scan all files, group them by extension, and move them into subfolders like `pdf/`, `jpg/`, and `txt/`.

He wrote the code quickly. It worked on his test directory. He was proud of it.

Then he ran it on his real Downloads folder.

The code moved files correctly—except for one edge case. Two files had the same name in different subdirectories. The code overwrote the second file without checking. A year of family photos, gone in milliseconds.

Marcus stared at the terminal in horror. The code had compiled. It had passed his tests. But it had destroyed data because he hadn't handled filename collisions.

He spent the next three hours recovering files from backups. He was lucky—he had backups. The lesson was brutal: file operations have real consequences. A bug in a calculator is a wrong answer. A bug in a file organizer is lost data.

Today, you build the File Organizer with safety first. You will handle collisions explicitly. You will implement a dry-run mode. You will test against temporary directories, not your real files.

:::

:::mental-model

Before we dive into building the File Organizer, internalise these three mental models. They reframe file operations from simple I/O into operations with real-world consequences.

**Mental Model 1 — File operations are destructive. Treat them with respect.**

When you move or delete a file, you are changing the user's data. If something goes wrong, data can be lost. This is not like a calculator—the stakes are higher.

Destructive operations should be:
- **Explicit:** The user should know what will happen.
- **Reversible:** Where possible, provide a dry-run mode.
- **Safe:** Handle edge cases (collisions, permissions, read-only files).

**Mental Model 2 — The filesystem is unreliable.**

When you call `std::fs::read_dir`, you are asking the operating system for a list of files. The filesystem might be busy, permission-denied, or corrupted. The file might be deleted between the time you list it and the time you move it.

Every filesystem operation can fail. You must handle these failures gracefully.

**Mental Model 3 — Testing file operations requires isolation.**

Never test file operations on your real files. Always use temporary directories. Rust's `tempfile` crate provides a clean, isolated sandbox for testing.

If you test on real files, you risk data loss. If you test on temporary files, you can experiment safely.

:::

## Theory

### Project Overview: File Organizer

Per REEC-05-Phase1-RustFoundations.md §1.12, the File Organizer has three milestones:

**Milestone 1 (Today):** Scan a directory and correctly group files by extension (dry-run output only, no actual moves yet).

**Milestone 2 (Day 5):** Perform actual moves, creating subfolders as needed.

**Milestone 3 (Day 5):** Handle filename collisions explicitly (append a suffix, or skip and report — either is acceptable, but it must be a deliberate decision documented in the README).

### Project Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         File Organizer                             │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │   CLI Layer (main.rs)                                        │  │
│  │   - Parse command-line arguments (directory, dry-run flag)   │  │
│  │   - Call organize()                                          │  │
│  │   - Print the report or errors                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                           │                                         │
│                           ▼                                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │   Core Logic (organize module or separate file)              │  │
│  │   - scan_directory: list files in a directory                │  │
│  │   - group_by_extension: group files by extension             │  │
│  │   - plan_moves: decide where each file should go             │  │
│  │   - execute_moves: perform the moves (if not dry-run)        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                           │                                         │
│                           ▼                                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │   Error Handling                                             │  │
│  │   - OrganizeError enum: custom errors for domain failures    │  │
│  │   - Result<T, OrganizeError> for all operations              │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### The OrganizeError Enum

Per Appendix A.2, library code should use a custom error enum:

```rust
#[derive(Debug)]
enum OrganizeError {
    Io(std::io::Error),
    DirectoryNotFound(String),
    PermissionDenied(String),
    Collision(String),
    // ... other domain-specific errors
}
```

But for a custom error type to be useful, you need to implement `std::fmt::Display` and `std::error::Error`.

### The Grouping Logic

The core logic is simple:

```rust
fn group_by_extension(files: &[PathBuf]) -> HashMap<String, Vec<PathBuf>> {
    let mut groups: HashMap<String, Vec<PathBuf>> = HashMap::new();

    for path in files {
        let extension = path.extension()
            .and_then(|ext| ext.to_str())
            .map(|s| s.to_lowercase())
            .unwrap_or_else(|| "no_extension".to_string());

        groups.entry(extension).or_insert_with(Vec::new).push(path.clone());
    }

    groups
}
```

### The Plan Phase

For each extension group, decide where the files should go:

```rust
fn plan_moves(groups: &HashMap<String, Vec<PathBuf>>, base_dir: &Path) -> Vec<MoveOperation> {
    let mut operations = Vec::new();

    for (extension, files) in groups {
        let target_dir = base_dir.join(extension);
        for file in files {
            let target_path = target_dir.join(file.file_name().unwrap());
            operations.push(MoveOperation {
                source: file.clone(),
                target: target_path,
            });
        }
    }

    operations
}
```

### The Organize Report

The report tells the user what happened (or would happen):

```rust
struct OrganizeReport {
    moved: usize,
    skipped: usize,
    collisions: Vec<String>,
    errors: Vec<String>,
}

impl OrganizeReport {
    fn print(&self) {
        if self.moved > 0 {
            println!("Moved {} files", self.moved);
        }
        if self.skipped > 0 {
            println!("Skipped {} files", self.skipped);
        }
        for collision in &self.collisions {
            println!("Collision: {}", collision);
        }
        for error in &self.errors {
            eprintln!("Error: {}", error);
        }
    }
}
```

---

## Worked Example

### Building the File Organizer — Milestone 1

#### Step 1: Create the Project

```bash
$ cargo new file_organizer
$ cd file_organizer
$ cargo add tempfile --dev  # for testing
$ git init
$ git add .
$ git commit -m "feat: initial commit — file_organizer project scaffold"
```

#### Step 2: Define the Error Type

```rust
// src/main.rs
use std::io;
use std::path::PathBuf;

#[derive(Debug)]
enum OrganizeError {
    Io(io::Error),
    DirectoryNotFound(PathBuf),
    PermissionDenied(PathBuf),
    Collision(PathBuf, PathBuf),
    Other(String),
}

impl std::fmt::Display for OrganizeError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            OrganizeError::Io(e) => write!(f, "I/O error: {}", e),
            OrganizeError::DirectoryNotFound(p) => write!(f, "Directory not found: {}", p.display()),
            OrganizeError::PermissionDenied(p) => write!(f, "Permission denied: {}", p.display()),
            OrganizeError::Collision(a, b) => write!(f, "Collision: {} and {}", a.display(), b.display()),
            OrganizeError::Other(s) => write!(f, "{}", s),
        }
    }
}

impl std::error::Error for OrganizeError {}

impl From<io::Error> for OrganizeError {
    fn from(err: io::Error) -> Self {
        OrganizeError::Io(err)
    }
}
```

#### Step 3: Implement the Scanning Logic

```rust
use std::fs;
use std::path::{Path, PathBuf};
use std::collections::HashMap;

fn scan_directory(dir: &Path) -> Result<Vec<PathBuf>, OrganizeError> {
    if !dir.exists() {
        return Err(OrganizeError::DirectoryNotFound(dir.to_path_buf()));
    }

    let mut files = Vec::new();
    for entry in fs::read_dir(dir)? {
        let entry = entry?;
        let path = entry.path();
        if path.is_file() {
            files.push(path);
        }
    }
    Ok(files)
}

fn group_by_extension(files: &[PathBuf]) -> HashMap<String, Vec<PathBuf>> {
    let mut groups: HashMap<String, Vec<PathBuf>> = HashMap::new();

    for path in files {
        let extension = path
            .extension()
            .and_then(|ext| ext.to_str())
            .map(|s| s.to_lowercase())
            .unwrap_or_else(|| "no_extension".to_string());

        groups.entry(extension).or_insert_with(Vec::new).push(path.clone());
    }

    groups
}
```

#### Step 4: Implement the Planning Phase

```rust
struct MoveOperation {
    source: PathBuf,
    target: PathBuf,
}

fn plan_moves(
    groups: &HashMap<String, Vec<PathBuf>>,
    base_dir: &Path,
) -> Vec<MoveOperation> {
    let mut operations = Vec::new();

    for (extension, files) in groups {
        let target_dir = base_dir.join(extension);
        for file in files {
            let file_name = file.file_name().unwrap();
            let target_path = target_dir.join(file_name);
            operations.push(MoveOperation {
                source: file.clone(),
                target: target_path,
            });
        }
    }

    operations
}
```

#### Step 5: Implement the Report

```rust
struct OrganizeReport {
    operations: Vec<MoveOperation>,
    errors: Vec<String>,
    dry_run: bool,
}

impl OrganizeReport {
    fn print(&self) {
        if self.dry_run {
            println!("DRY RUN — No files will be moved");
        }

        println!("Found {} files to move", self.operations.len());

        for op in &self.operations {
            if self.dry_run {
                println!("  Would move: {} → {}", op.source.display(), op.target.display());
            } else {
                println!("  Moving: {} → {}", op.source.display(), op.target.display());
            }
        }

        if !self.errors.is_empty() {
            println!("\nErrors:");
            for err in &self.errors {
                eprintln!("  {}", err);
            }
        }
    }
}
```

#### Step 6: Integrate in main

```rust
use std::env;

fn organize(dir: &Path, dry_run: bool) -> Result<OrganizeReport, OrganizeError> {
    let files = scan_directory(dir)?;
    let groups = group_by_extension(&files);
    let operations = plan_moves(&groups, dir);

    // Milestone 1: no actual moves yet, just planning
    let mut errors = Vec::new();

    // Check for collisions (placeholder for Milestone 3)
    // For now, just report them

    Ok(OrganizeReport {
        operations,
        errors,
        dry_run,
    })
}

fn main() {
    let args: Vec<String> = env::args().collect();

    // Basic CLI parsing
    let mut dir = PathBuf::from(".");
    let mut dry_run = false;

    for arg in &args[1..] {
        if arg == "--dry-run" || arg == "-n" {
            dry_run = true;
        } else if !arg.starts_with('-') {
            dir = PathBuf::from(arg);
        } else {
            eprintln!("Unknown flag: {}", arg);
            std::process::exit(1);
        }
    }

    match organize(&dir, dry_run) {
        Ok(report) => report.print(),
        Err(e) => {
            eprintln!("Error: {}", e);
            std::process::exit(1);
        }
    }
}
```

#### Step 7: Add Tests

```rust
// tests/integration_test.rs
use std::fs;
use std::path::Path;
use tempfile::tempdir;

#[test]
fn test_scan_directory() {
    let temp_dir = tempdir().unwrap();
    let dir_path = temp_dir.path();

    // Create some test files
    fs::create_dir(dir_path.join("subdir")).unwrap();
    fs::write(dir_path.join("file1.txt"), b"test").unwrap();
    fs::write(dir_path.join("file2.txt"), b"test").unwrap();
    fs::write(dir_path.join("file3.jpg"), b"test").unwrap();

    let files = file_organizer::scan_directory(dir_path).unwrap();
    assert_eq!(files.len(), 3);
}
```

#### Step 8: Run the Checks

```bash
$ cargo build
$ cargo fmt
$ cargo clippy -D warnings
$ cargo test
```

#### Step 9: Test the Program

```bash
$ cargo run -- ~/Downloads --dry-run
DRY RUN — No files will be moved
Found 42 files to move
  Would move: /home/maya/Downloads/report.pdf → /home/maya/Downloads/pdf/report.pdf
  Would move: /home/maya/Downloads/image.jpg → /home/maya/Downloads/jpg/image.jpg
  ...
```

---

## Engineering Notes

### Engineering Note: The Dry-Run Pattern

The dry-run pattern is essential for destructive operations:

```rust
if dry_run {
    println!("Would move: {} → {}", source, target);
} else {
    fs::rename(source, target)?;
}
```

This allows users to preview what will happen before committing to the operation. It is a safety feature that prevents accidental data loss.

### Engineering Note: Custom Error Types

Using a custom error enum makes error handling more expressive:

```rust
impl From<io::Error> for OrganizeError {
    fn from(err: io::Error) -> Self {
        OrganizeError::Io(err)
    }
}
```

This allows the `?` operator to convert `io::Error` to `OrganizeError` automatically.

### Engineering Note: Testing with Temp Files

The `tempfile` crate provides temporary directories that are automatically cleaned up:

```rust
let temp_dir = tempdir().unwrap();
let dir_path = temp_dir.path();
// ... test code ...
// temp_dir is deleted when it goes out of scope
```

This is safer than testing on real files.

---

## Compiler Thinking

**Prediction 1:**

Will this code compile?

```rust
fn scan_directory(dir: &Path) -> Result<Vec<PathBuf>, OrganizeError> {
    if !dir.exists() {
        return Err(OrganizeError::DirectoryNotFound(dir.to_path_buf()));
    }
    let entries = fs::read_dir(dir)?;
    // ... rest of the code
}
```

<details>
<summary>Answer</summary>

**Yes.** The `?` operator works because `fs::read_dir` returns `Result<ReadDir, io::Error>` and `OrganizeError` implements `From<io::Error>`.

</details>

---

**Prediction 2:**

What does `fs::write(dir_path.join("file1.txt"), b"test").unwrap()` do?

<details>
<summary>Answer</summary>

It writes the bytes `b"test"` to the file at `dir_path/file1.txt`. If the file already exists, it is overwritten.

The `.unwrap()` will panic if the write fails (e.g., permission denied, disk full).

</details>

---

**Prediction 3:**

Will this code compile?

```rust
let extension = path
    .extension()
    .and_then(|ext| ext.to_str())
    .unwrap_or("no_extension");
```

<details>
<summary>Answer</summary>

**No.** `unwrap_or` takes a `&str`, but the `extension()` method returns an `Option<&OsStr>`. The `and_then` chain returns `Option<&str>`. The `unwrap_or` works, but the type mismatch will cause an error if you try to assign to `String` without converting.

The correct code:

```rust
let extension = path
    .extension()
    .and_then(|ext| ext.to_str())
    .map(|s| s.to_lowercase())
    .unwrap_or_else(|| "no_extension".to_string());
```

</details>

---

## Mini Challenge

### Challenge 1 — Add Dry-Run Support

Add support for a `--dry-run` flag (you already have it in the worked example). Test it with a small directory.

### Challenge 2 — Group by Multiple Extensions

Modify the grouping logic to handle files with multiple extensions (e.g., `.tar.gz`). How would you treat these files?

### Challenge 3 — Add a Verbose Flag

Add a `--verbose` flag that prints more detailed information about each file and its extension.

---

## Reflection

Write the answer to this question in a text file called `reflection-phase1-w4-d4.md` in your Phase 1 repository. Commit it.

**Question:**

"File Organizer is the first project in this curriculum that has real-world consequences. A bug could delete or overwrite user data. How does this change your approach to writing code? Compare the mindset required for a calculator (where a bug just gives a wrong answer) to the mindset required for a file organiser (where a bug can cause data loss). What practices help you write safer code for destructive operations?"

<details>
<summary>Reflection Guidance</summary>

The File Organizer requires a safety-first mindset. Unlike a calculator, where the stakes are low, file operations have real consequences.

Safety practices include:
1. **Dry-run mode:** Allow users to preview what will happen.
2. **Explicit error handling:** Don't ignore errors; handle them gracefully.
3. **Collision handling:** Decide what to do when two files have the same name.
4. **Testing in isolation:** Use temporary directories, not real files.
5. **Documentation:** Explain exactly what the tool does and what it doesn't do.

The mindset shift is from "make it work" to "don't break anything." Correctness and safety are more important than speed or features.

</details>

---

## End of Day 4, Week 4

### What You Have Accomplished

By the end of this session, you have:

- **Built the core scanning and grouping logic** for the File Organizer.
- **Defined a custom error enum** for domain-specific failures.
- **Implemented a dry-run mode** for previewing operations.
- **Wrote tests using temporary directories** (with `tempfile`).
- **Used the `?` operator** for error propagation.
- **Applied safety-first design** for destructive operations.

### What This Builds Toward

The File Organizer is halfway complete. Tomorrow, you will complete Milestones 2 and 3:
- **Milestone 2:** Perform actual moves, creating subfolders as needed.
- **Milestone 3:** Handle filename collisions explicitly (append a suffix, or skip and report).

You have the foundation. Tomorrow, you add the execution.

### The Engineering Habit to Carry Forward

When writing code that interacts with the filesystem, always ask:
1. Could this destroy data?
2. Can the user preview what will happen?
3. What happens if something goes wrong?
4. How can I test this safely?

This is the mindset of a professional engineer. Safety first. Always.
