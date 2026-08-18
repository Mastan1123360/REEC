---
id: P1-W6-D4
phase: 1
week: 6
day: 4
title: 'Engineering Review: Task Tracker v1'
subtitle: >-
  Self-assessment, refactoring, and quality assurance for your first Major
  project
estimated_time: 75
difficulty: Intermediate
learning_objectives:
  - Apply the Engineering Review rubric to Task Tracker v1
  - Score the project across all quality dimensions
  - Identify specific improvement opportunities
  - Plan and execute a refactor pass
  - Record design decisions and tradeoffs in the Engineering Decision Journal
  - Prepare the project for the Phase 1 Milestone
widgets:
  - story
  - mental-model
  - worked-example
  - engineering-note
  - compiler-thinking
  - mini-challenge
  - reflection
project:
  - Task Tracker v1 (Engineering Review + Refactor Pass)
failure_lab: null
reading:
  - REEC-02-Templates.md §Template G (Engineering Review Rubric)
  - REEC-04-EngineeringStandardsAppendix.md §A.6 (Refactoring Philosophy)
  - REEC-04-EngineeringStandardsAppendix.md §A.9 (Code Review Checklist)
tags:
  - engineering-review
  - self-assessment
  - refactoring
  - quality-assurance
  - major-project
next: P1-W6-D5
previous: P1-W6-D3
published: true
---

:::story

## The Developer Who Didn't Review His Own Work

A developer—call him Marcus—had just finished the Task Tracker v1. It was his first Major project. He was proud of it.

He ran `cargo build`. It compiled. He ran `cargo test`. It passed. He ran `cargo run`. It worked.

He was done.

But he wasn't. He had missed something important. He hadn't reviewed his own work.

A senior engineer asked to see his code. Marcus opened the repository and walked through it. The senior nodded along.

"Good work," the senior said. "But let me show you something."

The senior opened the `main.rs` file and pointed to the REPL loop. "This is good. But it's doing too much. The command parsing could be extracted into a separate function. The error handling could be more consistent."

Marcus looked at the code. The senior was right.

"Now look at your tests," the senior continued. "You have 20 tests. That's good. But some of them are testing the same thing. You could combine them."

The senior walked Marcus through a refactor. They extracted functions. They improved naming. They cleaned up tests. The code was still the same program—but it was better. It was clearer. It was more maintainable.

Marcus learned a lesson: writing code is only half the work. Reviewing and refactoring is the other half. Without review, you never learn what you could have done better. Without refactoring, you never improve.

Today, you review and refactor your Task Tracker v1.

:::

:::mental-model

Before we dive into the Engineering Review, internalise these three mental models. They reframe self-review from an optional step into a core engineering discipline.

**Mental Model 1 — Code review is not about finding mistakes. It is about improving quality.**

When you review your own code, you are not looking for "gotchas" or "you should have known this." You are looking for opportunities to improve. Every review is a chance to learn something new.

**Mental Model 2 — Refactoring is not fixing bugs. It is improving design.**

A refactor changes the structure of the code without changing its behaviour. The goal is to make the code clearer, more maintainable, and more extensible.

If you never refactor, your code will become messy and hard to maintain. If you always refactor, your code will stay clean and easy to work with.

**Mental Model 3 — Quality is not a destination. It is a direction.**

No code is perfect. There is always something to improve. The goal is not to write perfect code. The goal is to write code that is better than it was yesterday.

:::

## Theory

### The Engineering Review Rubric

Per Template G (REEC-02-Templates.md), the Engineering Review rubric has nine scored dimensions for the Task Tracker v1:

| Dimension | What it measures | Weight |
|---|---|---|
| **Correctness** | Does it do what it claims, including edge cases? | High |
| **Architecture** | Are module boundaries where complexity actually splits? | High |
| **Naming** | Do identifiers communicate intent without comments? | Medium |
| **Readability** | Is structure and control flow easy to follow? | Medium |
| **Testing** | Coverage of the actual risk surface, not just line-count | High |
| **Performance** | Measured against the project's stated Performance Goal | N/A |
| **Documentation** | Could a stranger onboard from the README alone? | Medium |
| **Maintainability** | How much would a plausible future change cost? | High |
| **Security** | For projects handling input, secrets, or untrusted data | Low |

For the Task Tracker v1, `Performance` is N/A (no Performance Goal stated). `Security` is low (no secrets or untrusted data, but input validation is important).

### Scoring Guidelines

- **0:** Absent or completely broken
- **3:** Acceptable, professional baseline
- **5:** Exceptional—you could show this to a senior engineer without caveats

### Applying the Rubric to Task Tracker v1

#### 1. Correctness — [ ]/5

**What to check:**
- Does it correctly add, list, complete, and remove tasks?
- Does it handle edge cases (empty list, invalid IDs)?
- Does it handle duplicate operations (completing an already-completed task)?
- Does the REPL parse commands correctly?
- Does it handle malformed input gracefully?

**Common issues:**
- Complete doesn't handle already-completed tasks correctly.
- Remove doesn't handle nonexistent IDs gracefully.
- The REPL crashes on malformed input.

#### 2. Architecture — [ ]/5

**What to check:**
- Are concerns separated? (Core logic vs. REPL vs. parsing)
- Is the `TaskList` pure and testable?
- Is the REPL a thin wrapper?
- Is persistence planned for the future?

**Common issues:**
- The REPL contains business logic.
- The `TaskList` is not purely separated from I/O.
- No separation between parsing and execution.

#### 3. Naming — [ ]/5

**What to check:**
- Are variable names clear and meaningful?
- Do function names explain what they do?
- Are there any abbreviations that obscure meaning?

**Common issues:**
- Vague names (e.g., `s` for string, `v` for vector).
- Inconsistent naming conventions.
- Names that don't communicate intent.

#### 4. Readability — [ ]/5

**What to check:**
- Is the control flow easy to follow?
- Are there unnecessary nested blocks?
- Is the code formatted correctly?
- Are comments used appropriately (why, not what)?

**Common issues:**
- The REPL loop is too long and dense.
- Nested `match` statements are hard to follow.
- Comments that restate the code instead of explaining intent.

#### 5. Testing — [ ]/5

**What to check:**
- Does every method have a test?
- Do tests cover all edge cases and error paths?
- Are test names clear (scenario + expected outcome)?
- Do tests use the `#[cfg(test)]` attribute correctly?

**Common issues:**
- Tests missing for edge cases.
- Tests that are too long or test multiple things.
- Tests that are not independent.

#### 6. Documentation — [ ]/5

**What to check:**
- Does the README answer: what, how to run, how to test?
- Are the commands documented?
- Is the error handling documented?

**Common issues:**
- No README.
- No documentation for commands.
- Error messages that are cryptic.

#### 7. Maintainability — [ ]/5

**What to check:**
- How much would a plausible future change cost?
- Adding a new command—how hard is it?
- Adding persistence—how hard is it?
- Is there code duplication?

**Common issues:**
- The REPL loop is too large to modify safely.
- Code duplication in command parsing.
- Tight coupling between REPL and core logic.

#### 8. Future Evolution — [ ]/5

**What to check:**
- Is the design shaped to accommodate future needs?
- Is persistence planned (version field, data struct)?
- Is the API designed for reuse?

**Common issues:**
- No version field for future data migrations.
- No separation of data from logic.
- Hard-coded assumptions about the data format.

---

## Worked Example

### Applying the Review Rubric to Task Tracker v1

#### Project: Task Tracker v1

**Correctness — 5/5**

The code correctly handles all operations: add, list, complete, remove. Edge cases are handled gracefully (empty list, invalid IDs, already-completed tasks). The REPL parses commands correctly and handles malformed input.

**Architecture — 4/5**

The `TaskList` is pure and testable. The REPL is a thin wrapper. However, the command parsing is in the REPL loop and could be extracted. There is a clear separation between core logic and I/O.

*Improvement opportunity:* Extract `parse_command` into a separate module.

**Naming — 4/5**

Most names are clear and meaningful. `TaskList`, `TaskStatus`, `add`, `list`, `complete`, `remove` all communicate intent. Some variable names could be more descriptive.

*Improvement opportunity:* Rename `data` field in `TaskList` to something more descriptive.

**Readability — 4/5**

The code is mostly readable. The REPL loop is slightly long but clear. The `match` statements are easy to follow.

*Improvement opportunity:* Break the REPL loop into smaller functions.

**Testing — 5/5**

The test suite covers all methods and edge cases. The tests are well-named and independent. All tests pass.

**Documentation — 4/5**

The README explains what the project is and how to run it. However, it could include more details about the commands and error handling.

*Improvement opportunity:* Expand the README with command documentation.

**Maintainability — 4/5**

Adding a new command would require changes to the REPL loop and the parser. The core logic is well-separated, so adding a new feature to `TaskList` is easy.

*Improvement opportunity:* Extract command parsing to make adding new commands easier.

**Future Evolution — 4/5**

The design includes a version field and a data struct for serialization. This will make persistence easier in Phase 2.

**TOTAL: 34/40**

### The Refactor Pass

After scoring, the developer makes specific improvements:

#### 1. Extract Command Parsing

**Before:**

```rust
fn main() {
    // ... REPL loop with inline parsing ...
}
```

**After:**

```rust
fn parse_command(line: &str) -> Command {
    // ... parsing logic ...
}

fn main() {
    // ... REPL loop that calls parse_command ...
}
```

#### 2. Add Command Documentation

**Before:**

```rust
/// Task Tracker v1
/// Commands: add <title>, list, complete <id>, remove <id>, quit
```

**After:**

```rust
/// Task Tracker v1
///
/// A simple command-line task tracker.
///
/// # Commands
///
/// - `add <title>`: Add a new task with the given title.
/// - `list`: List all tasks.
/// - `complete <id>`: Mark a task as complete.
/// - `remove <id>`: Remove a task.
/// - `quit`: Exit the program.
///
/// # Examples
///
/// ```
/// > add Buy milk
/// Added task #1: Buy milk
/// > list
/// #1: Buy milk [Pending]
/// ```
```

#### 3. Improve Error Messages

**Before:**

```rust
eprintln!("Invalid command.");
```

**After:**

```rust
eprintln!("Invalid command. Try: add <title>, list, complete <id>, remove <id>, quit");
```

#### 4. Commit the Refactor

```bash
git add src/main.rs README.md
git commit -m "refactor: improve architecture and documentation

- Extract parse_command function from REPL loop
- Add comprehensive command documentation
- Improve error messages for invalid commands
- All tests still passing; clippy warnings resolved
"
```

---

## Engineering Notes

### Engineering Note: Why Review Matters

The Engineering Review is important because:

1. **It catches blind spots.** You always miss something when you write code. A review catches it.

2. **It builds the habit of quality.** The more you review, the better your code becomes.

3. **It documents your decisions.** The Decision Journal records why you made certain choices.

4. **It prepares you for professional work.** Code review is a fundamental part of software engineering.

### Engineering Note: The Refactor Pass

The refactor pass is not about fixing bugs. It is about improving structure.

**When to refactor:**
- You see a better way to structure the code.
- The code is hard to read or maintain.
- You are adding a new feature and the code needs to be reorganised.

**When NOT to refactor:**
- You are under time pressure.
- The code is stable and doesn't need to be changed.
- You are adding a feature that doesn't require structural changes.

### Engineering Note: The Code Review Checklist

Per Appendix A.9, always apply the Code Review Checklist before considering a project done:

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

## Compiler Thinking

**Prediction 1:**

Why does the `TaskList` have a `data` field instead of directly storing `tasks`, `next_id`, and `version`?

<details>
<summary>Answer</summary>

The `data` field groups the data that will be serialized to disk. This makes it easy to save and load the entire state of the `TaskList` in Phase 2.

</details>

---

**Prediction 2:**

What would happen if you changed the `TaskList` to store `Arc<Mutex<Vec<Task>>>` instead of `Vec<Task>`?

<details>
<summary>Answer</summary>

`Arc<Mutex<Vec<Task>>>` would allow the `TaskList` to be shared across threads safely. But it would add unnecessary complexity for a single-threaded application. This is over-engineering.

</details>

---

**Prediction 3:**

Why does the `TaskList` return `&Task` from `add` instead of `Task` or `usize`?

<details>
<summary>Answer</summary>

`&Task` provides a reference to the task stored in the vector. The caller can read the task's fields (ID, title, status) without taking ownership. This is efficient and safe.

</details>

---

## Mini Challenge

### Challenge 1 — Apply the Rubric

Score your Task Tracker v1 against the Engineering Review rubric. Write down:

1. Your score for each dimension.
2. One specific improvement opportunity for each low score (3 or below).
3. Your total score out of 40.

### Challenge 2 — Identify a Refactor Opportunity

Look at your code. Identify one thing you would change if you had another hour.

Possible options:
- Extract a function.
- Improve naming.
- Add documentation.
- Simplify a match statement.

### Challenge 3 — Write a Decision Journal Entry

Write a Decision Journal entry for one decision you made in the Task Tracker v1:

- **Decision:** What did you choose?
- **Rationale:** Why did you choose it?
- **Alternative considered:** What did you not choose?
- **Tradeoff:** What did you gain and what did you lose?

---

## Reflection

Write the answer to this question in a text file called `reflection-phase1-w6-d4.md` in your Phase 1 repository. Commit it.

**Question:**

"Today you reviewed and refactored your Task Tracker v1—your first Major project. The code was already working, but you found opportunities to improve it. Why is review and refactoring an essential part of software engineering? What would happen if you never reviewed or refactored your code?"

<details>
<summary>Reflection Guidance</summary>

Review and refactoring are essential because code quality degrades over time. Without review, you never learn what you could have done better. Without refactoring, your code becomes messy and hard to maintain.

If you never reviewed your code, you would never improve your skills. You would keep making the same mistakes. You would never learn the better patterns.

If you never refactored your code, it would become increasingly hard to understand and modify. Adding new features would become slower and more error-prone. Eventually, the code would become unmaintainable.

Review and refactoring are investments in the future. They make your code better, your skills sharper, and your life easier.

</details>

---

## End of Day 4, Week 6

### What You Have Accomplished

By the end of this session, you have:

- **Applied the Engineering Review rubric** to Task Tracker v1.
- **Scored your project** across all quality dimensions.
- **Identified specific improvement opportunities.**
- **Planned and executed a refactor pass.**
- **Recorded a decision journal entry.**
- **Prepared the project for the Phase 1 Milestone.**

### What This Builds Toward

Tomorrow is the final day of Phase 1 assessments. You will:
- Complete the Reflection and Assessment.
- Prepare the Phase 1 Milestone.

**Week 6, Day 5 — Reflection + Assessment**

You will:
- Answer the Phase 1 Reflection prompts.
- Complete the Phase 1 Assessment.
- Verify the Phase 1 Milestone.

### The Engineering Habit to Carry Forward

Before you consider any project "done," apply the Engineering Review rubric. Every time.

Ask yourself:
- What is my score for each dimension?
- What is one thing I can improve?
- What decision did I make, and why?

This is the discipline that separates professional engineers from people who just write code.

### Tomorrow

**Week 6, Day 5 — Reflection + Assessment**

You will:
- Reflect on the Phase 1 journey.
- Complete the assessment.
- Verify the Phase 1 Milestone.

Rest well. Tomorrow, you complete Phase 1.
