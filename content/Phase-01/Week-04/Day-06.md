---
id: P1-W4-D6
phase: 1
week: 4
day: 6
title: 'Engineering Review: File Organizer'
subtitle: >-
  Self-assessment, refactoring, and the discipline of safety-critical code
  review
estimated_time: 60
difficulty: Intermediate
learning_objectives:
  - Apply the Engineering Review rubric to the File Organizer
  - >-
    Score the project against correctness, architecture, naming, readability,
    testing, and documentation
  - >-
    Evaluate the safety of destructive operations (collision handling, dry-run
    mode)
  - Identify specific opportunities for refactoring
  - Record design decisions and tradeoffs in the Engineering Decision Journal
  - Practice the habit of self-review for safety-critical code
widgets:
  - story
  - mental-model
  - worked-example
  - engineering-note
  - compiler-thinking
  - mini-challenge
  - reflection
project:
  - File Organizer (Engineering Review + Refactor Pass)
failure_lab: null
reading:
  - REEC-02-Templates.md §Template G (Engineering Review Rubric)
  - REEC-04-EngineeringStandardsAppendix.md §A.6 (Refactoring Philosophy)
  - REEC-04-EngineeringStandardsAppendix.md §A.9 (Code Review Checklist)
tags:
  - engineering-review
  - self-assessment
  - refactoring
  - safety-critical
  - decision-journal
next: P1-W4-D7
previous: P1-W4-D5
published: true
---

:::story

## The Safety Review That Saved Everything

A developer—call him Marcus—had just finished his File Organizer. It worked. It moved files. It handled collisions. He was proud of it.

But he had learned from the last time. Before declaring it "done," he ran the Engineering Review.

He opened the rubric and started scoring. Correctness: 4/5. Architecture: 4/5. Naming: 4/5. Readability: 4/5. Testing: 3/5. Documentation: 3/5. Maintainability: 3/5. Future Evolution: 3/5.

Then he looked at the "Security" dimension. For most projects, Security was N/A. But for the File Organizer, it was different. This tool touched the filesystem. It moved user data.

He asked himself: "What happens if the user runs this on a directory with a symlink that points to /etc? What happens if the user runs it on a directory they don't have permission to read? What happens if the user runs it with the --overwrite flag and two files have the same name?"

He realised his code didn't handle symlinks at all. It would follow them blindly. If a symlink pointed to a critical system directory, the tool could move system files.

He added symlink detection. He added permission checks. He added warnings for dangerous operations. The review had revealed a real safety issue.

Today, you review your File Organizer—and you think about safety first.

:::

:::mental-model

Before we dive into the Engineering Review, internalise these three mental models. They reframe self-review for safety-critical code from an optional step into a core engineering discipline.

**Mental Model 1 — Safety is not a feature. It is a requirement.**

When your code touches the filesystem, safety is not optional. It is a primary requirement. A tool that loses data is worse than useless—it is dangerous.

The Engineering Review for safety-critical code must include:
- What happens in edge cases (collisions, symlinks, permissions)?
- Can the user preview what will happen (dry-run mode)?
- What happens if something goes wrong (error handling)?
- Is the user warned about dangerous operations?

**Mental Model 2 — The cost of a bug in file operations is data loss.**

A bug in a calculator gives a wrong answer. A bug in a file organizer loses data. The stakes are different.

The Engineering Review must reflect these stakes. Safety-related dimensions should be weighted more heavily. A low score on safety is not a minor issue—it is a critical problem.

**Mental Model 3 — The review is where you catch the edge cases you didn't think of.**

When you wrote the code, you thought about the happy path. You thought about the normal case. But edge cases are hard to think about when you're writing code.

The review is where you catch them. It is where you step back and ask: "What could go wrong?" It is where you find the bugs that would have lost data.

:::

## Theory

### The Engineering Review Rubric

Per Template G (REEC-02-Templates.md), the Engineering Review rubric has nine scored dimensions:

| Dimension | What it measures |
|---|---|
| **Correctness** | Does it do what it claims, including edge cases? |
| **Architecture** | Are module boundaries where complexity actually splits? |
| **Naming** | Do identifiers communicate intent without comments? |
| **Readability** | Is structure and control flow easy to follow? |
| **Testing** | Coverage of the actual risk surface, not just line-count |
| **Performance** | Measured against the project's stated Performance Goal |
| **Documentation** | Could a stranger onboard from the README alone? |
| **Maintainability** | How much would a plausible future change cost? |
| **Security** | For projects handling input, secrets, or untrusted data |

### Scoring Guidelines

- **0:** Absent or completely broken
- **3:** Acceptable, professional baseline
- **5:** Exceptional—you could show this to a senior engineer without caveats

For the File Organizer, `Performance` is N/A (no Performance Goal stated). Total possible score: 40 (8 dimensions × 5).

### Applying the Rubric to File Organizer

#### 1. Correctness — [ ]/5

**What to check:**
- Does it correctly group files by extension?
- Does it create the correct target directories?
- Does it handle collisions correctly (skip, rename, overwrite)?
- Does it handle edge cases (empty directories, no files, permissions)?
- Does the dry-run mode accurately predict what will happen?
- Does the report accurately reflect what happened?

**Common issues:**
- The tool groups files by extension but ignores the source directory structure.
- The dry-run mode and the real run produce different results.
- Collisions are not handled consistently.

#### 2. Architecture — [ ]/5

**What to check:**
- Are concerns separated? (Scanning, grouping, planning, execution, reporting)
- Is the `organize` function a thin coordinator?
- Are there clear module boundaries?
- Is error handling consistent?

**Common issues:**
- `main` does too much (parsing, validation, logic, output).
- No separation between planning and execution.
- Error handling is inconsistent.

#### 3. Naming — [ ]/5

**What to check:**
- Are variable names clear and meaningful?
- Do function names explain what they do?
- Are there any abbreviations that obscure meaning?

**Common issues:**
- Vague names (`op`, `dir`, `f`).
- Inconsistent naming conventions.
- Names that don't communicate intent.

#### 4. Readability — [ ]/5

**What to check:**
- Is the control flow easy to follow?
- Are there unnecessary nested blocks?
- Is the code formatted correctly?
- Are comments used appropriately (why, not what)?

**Common issues:**
- The `match` blocks are too complex.
- Too many nested `if` statements.
- Comments that restate the code instead of explaining intent.

#### 5. Testing — [ ]/5

**What to check:**
- Does every function have a test?
- Does it test edge cases (empty directories, duplicates, permissions)?
- Does it test the `dry-run` mode?
- Does it test collision handling?
- Does it use temporary directories for isolation?

**Common issues:**
- No tests for the core logic.
- Tests only cover the happy path.
- Tests that don't use temporary directories.

#### 6. Documentation — [ ]/5

**What to check:**
- Does the README answer: what, how to run, how to test?
- Are collision handling decisions documented?
- Are error messages clear and helpful?
- Is the dry-run mode documented?

**Common issues:**
- No README or minimal README.
- No documentation of collision handling strategy.
- Error messages that are cryptic or unhelpful.

#### 7. Maintainability — [ ]/5

**What to check:**
- How much would a plausible future change cost?
- Would adding a new collision strategy be easy?
- Would adding a new file type be easy?
- Is there code duplication?

**Common issues:**
- Adding a new collision strategy requires changing multiple places.
- The `organize` function is too large and hard to modify.
- Duplicated code in the scanning and grouping logic.

#### 8. Security — [ ]/5

**For the File Organizer, Security is NOT N/A.** This project handles user data and the filesystem.

**What to check:**
- Does the tool handle symlinks safely?
- Does the tool check permissions before moving?
- Does the tool warn before dangerous operations?
- Does the dry-run mode show what will happen?
- Does the tool protect against path traversal?

**Common issues:**
- Following symlinks blindly.
- Moving files without checking permissions.
- No warnings for dangerous operations.

### The Safety Audit

The File Organizer requires a safety audit:

```
[ ] Does the tool check file permissions before moving?
[ ] Does the tool handle symlinks explicitly?
[ ] Does the dry-run mode show exactly what will happen?
[ ] Does the tool warn about dangerous operations?
[ ] Does the tool protect against path traversal?
[ ] Are collision handling decisions documented?
[ ] Does the tool handle read-only files gracefully?
[ ] Does the tool handle disk full conditions gracefully?
```

---

## Worked Example

### Applying the Review Rubric to File Organizer

#### Project: File Organizer

**Correctness — 4/5**

The code correctly moves files and handles collisions. However, it doesn't handle symlinks explicitly (follows them blindly) and doesn't check permissions before moving.

*Improvement opportunity:* Add symlink detection and permission checks.

**Architecture — 4/5**

The `organize` function is mostly a thin coordinator. However, the CLI parsing and execution are mixed in `main`.

*Improvement opportunity:* Extract CLI parsing into a separate function.

**Naming — 4/5**

The names are mostly clear (`scan_directory`, `group_by_extension`, `organize`). Some variable names are vague (`op`, `dir`).

*Improvement opportunity:* Use more descriptive variable names.

**Readability — 4/5**

The code is mostly readable. The `match` blocks in the `organize` function are slightly complex.

*Improvement opportunity:* Extract the collision resolution logic into a separate function.

**Testing — 3/5**

The tests cover basic functionality but not edge cases: symlinks, permissions, read-only files, disk full.

*Improvement opportunity:* Add tests for edge cases.

**Documentation — 4/5**

The README explains what the tool does and how to use it. However, the collision handling strategy is not fully documented.

*Improvement opportunity:* Document collision handling strategy.

**Maintainability — 3/5**

Adding a new collision strategy requires modifying multiple places. The `organize` function is slightly too large.

*Improvement opportunity:* Make collision strategies pluggable.

**Security — 3/5**

The tool follows symlinks blindly, which could be dangerous. It doesn't check permissions before moving. It doesn't warn about dangerous operations.

*Improvement opportunity:* Add symlink detection, permission checks, and warnings.

**TOTAL: 29/40**

### The Refactor Pass

After scoring, the developer makes specific improvements:

#### 1. Add Symlink Handling

```rust
fn scan_directory(dir: &Path) -> Result<Vec<PathBuf>, OrganizeError> {
    if !dir.exists() {
        return Err(OrganizeError::DirectoryNotFound(dir.to_path_buf()));
    }

    let mut files = Vec::new();
    for entry in fs::read_dir(dir)? {
        let entry = entry?;
        let path = entry.path();

        // Skip symlinks by default
        if path.is_symlink() {
            eprintln!("Warning: Skipping symlink: {}", path.display());
            continue;
        }

        if path.is_file() {
            files.push(path);
        }
    }
    Ok(files)
}
```

#### 2. Add Permission Check

```rust
fn execute_move(op: &MoveOperation) -> Result<(), OrganizeError> {
    // Check if source is writable (can be moved)
    if !op.source.is_writable() {
        return Err(OrganizeError::PermissionDenied(op.source.clone()));
    }

    // Create parent directories if needed
    if let Some(parent) = op.target.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent)?;
        }
    }

    fs::rename(&op.source, &op.target)?;
    Ok(())
}
```

#### 3. Document Collision Strategy

Update the README:

```markdown
## Collision Handling

When two files have the same name in the target directory:

- **--skip** (default): Skip the file and report it.
- **--rename**: Add a suffix to the filename.
- **--overwrite**: Replace the existing file (dangerous).

The default is `--skip` to prevent data loss.
```

#### 4. Add Warning for Overwrite

```rust
fn main() {
    // ... argument parsing ...

    if strategy == CollisionStrategy::Overwrite && !dry_run {
        eprintln!("WARNING: --overwrite will replace existing files.");
        eprintln!("Data loss is possible. Continue? [y/N]");
        let mut input = String::new();
        std::io::stdin().read_line(&mut input).unwrap();
        if input.trim().to_lowercase() != "y" {
            std::process::exit(0);
        }
    }

    // ... rest of the code ...
}
```

#### 5. Commit the Refactor

```bash
git add src/main.rs README.md
git commit -m "refactor: improve safety with symlink handling and permission checks

- Add symlink detection: skip symlinks with a warning
- Add permission checks before moving files
- Document collision handling strategy in README
- Add confirmation prompt for --overwrite flag
- All tests still passing; no behaviour changed for existing cases
"
```

---

## Engineering Notes

### Engineering Note: Safety Reviews for File Operations

The File Organizer requires a different kind of review than the Calculator CLI. Safety is the primary concern.

**Questions to ask during a safety review:**
1. Could this operation cause data loss?
2. Can the user preview what will happen?
3. What happens in edge cases (symlinks, permissions, disk full)?
4. Is the user warned about dangerous operations?
5. Are errors handled gracefully?

### Engineering Note: The Symlink Problem

Symlinks are a special case. A symlink can point to any file on the system—including critical system files.

**Safe handling of symlinks:**
- Skip them by default.
- Warn the user if they are present.
- Only follow them with explicit permission.

### Engineering Note: The Permission Problem

Not all files can be moved. Some are read-only. Some are in directories the user doesn't have permission to write to.

**Safe handling of permissions:**
- Check before attempting the move.
- Provide a clear error message.
- Continue with other files.

---

## Compiler Thinking

**Prediction 1:**

Will this code compile?

```rust
if path.is_symlink() {
    eprintln!("Warning: Skipping symlink: {}", path.display());
    continue;
}
```

<details>
<summary>Answer</summary>

**Yes.** `path.is_symlink()` returns a `bool` and exists on `PathBuf`. The `eprintln!` macro works inside a function that returns `Result<Vec<PathBuf>, OrganizeError>`.

</details>

---

**Prediction 2:**

What does `op.source.is_writable()` check?

<details>
<summary>Answer</summary>

`is_writable()` checks if the file has write permissions for the current user. On Unix, it checks the file's permissions. On Windows, it checks the file's attributes.

</details>

---

**Prediction 3:**

Why does the `--overwrite` flag require a confirmation prompt?

<details>
<summary>Answer</summary>

Overwriting is dangerous. It destroys data. The confirmation prompt ensures the user is aware of the risk and explicitly approves the operation.

This is a safety feature that prevents accidental data loss.

</details>

---

## Mini Challenge

### Challenge 1 — Apply the Rubric

Score your File Organizer against the Engineering Review rubric. Write down:

1. Your score for each dimension.
2. One specific improvement opportunity for each low score (3 or below).
3. Your total score out of 40.

### Challenge 2 — The Safety Audit

Run the safety audit on your File Organizer:

```
[ ] Does the tool check file permissions before moving?
[ ] Does the tool handle symlinks explicitly?
[ ] Does the dry-run mode show exactly what will happen?
[ ] Does the tool warn about dangerous operations?
[ ] Does the tool protect against path traversal?
[ ] Are collision handling decisions documented?
[ ] Does the tool handle read-only files gracefully?
[ ] Does the tool handle disk full conditions gracefully?
```

### Challenge 3 — Identify a Refactor Opportunity

Look at your code. Identify one thing you would change if you had another hour.

Possible options:
- Add symlink handling.
- Add permission checks.
- Improve error messages.
- Simplify the `organize` function.

---

## Reflection

Write the answer to this question in a text file called `reflection-phase1-w4-d6.md` in your Phase 1 repository. Commit it.

**Question:**

"The File Organizer is the first project in this curriculum that requires a security review. Symlinks, permissions, and dangerous flags like `--overwrite` all present risks. How does the Engineering Review for a safety-critical project differ from the review for a calculator or a number converter? What new questions do you need to ask when reviewing code that touches the filesystem?"

<details>
<summary>Reflection Guidance</summary>

The review for a safety-critical project is different because the stakes are higher. A bug in a calculator is a wrong answer. A bug in a file organizer is lost data.

New questions for a safety-critical review:
- Could this operation cause data loss?
- Can the user preview what will happen?
- What happens in edge cases (symlinks, permissions, disk full)?
- Is the user warned about dangerous operations?
- Are errors handled gracefully?

The safety audit is a separate step in the review process. It asks: "What could go wrong?" and "How can I prevent it?"

This is the mindset of a professional engineer working with safety-critical systems. Safety is not a feature. It is a requirement.

</details>

---

## End of Day 6, Week 4

### What You Have Accomplished

By the end of this session, you have:

- **Applied the Engineering Review rubric** to the File Organizer.
- **Scored your project** against eight quality dimensions.
- **Performed a safety audit** for file operations.
- **Identified specific improvement opportunities.**
- **Refactored your code** to improve safety (symlink handling, permission checks).
- **Recorded a decision journal entry** for the File Organizer.
- **Practised safety-first design** for destructive operations.

### What This Builds Toward

Tomorrow is a rest day. You have earned it.

The File Organizer is your third real Rust project. It is more complex than the Calculator CLI and the Number Converter. It has real-world consequences. It required safety-first design.

**Week 5 begins the next phase of your Rust journey.** You will learn:

- **Error handling with `Result` and `Option`** — the `?` operator in depth.
- **Collections: `Vec`, `HashMap`** — ownership inside collections.
- **Traits and generics (first contact)** — shared behavior and abstraction.
- **Task Tracker v1 (REPL)** — the first Major project of Phase 1.

You have built tools. Now you build a system.

### The Engineering Habit to Carry Forward

For any project that touches the filesystem, always ask:

1. Could this destroy data?
2. Can the user preview what will happen?
3. What happens in edge cases (symlinks, permissions, collisions)?
4. Is the user warned about dangerous operations?
5. How can I test this safely?

This is the mindset of a professional engineer. Safety is not optional. It is the primary requirement.

Rest well. Week 5 is coming.
