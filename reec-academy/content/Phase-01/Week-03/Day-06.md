---
id: P1-W3-D6
phase: 1
week: 3
day: 6
title: 'Engineering Review: Calculator CLI'
subtitle: 'Self-assessment, refactoring, and the discipline of professional code review'
estimated_time: 60
difficulty: Beginner
learning_objectives:
  - Apply the Engineering Review rubric to the Calculator CLI
  - >-
    Score the project against correctness, architecture, naming, readability,
    testing, and documentation
  - Identify specific opportunities for refactoring
  - Record design decisions and tradeoffs in the Engineering Decision Journal
  - Practice the habit of self-review before considering a project done
widgets:
  - story
  - mental-model
  - worked-example
  - engineering-note
  - compiler-thinking
  - mini-challenge
  - reflection
project:
  - Calculator CLI (Engineering Review + Refactor Pass)
failure_lab: null
reading:
  - REEC-02-Templates.md §Template G (Engineering Review Rubric)
  - REEC-04-EngineeringStandardsAppendix.md §A.6 (Refactoring Philosophy)
tags:
  - engineering-review
  - self-assessment
  - refactoring
  - decision-journal
  - quality-assurance
next: P1-W3-D7
previous: P1-W3-D5
published: true
---

:::story

## The Code That Worked, But Wasn't Right

A developer—call her Priya—had finished the Calculator CLI. It compiled. It passed tests. It handled errors. She was proud of it.

She showed it to a senior engineer for feedback.

"Good start," the senior said. "But let's look closer."

They opened the code together.

"The `main` function is doing too much," the senior said. "It's parsing arguments, validating input, calling the evaluate function, and printing output. Each of these is a separate concern."

Priya nodded. She hadn't thought about it that way.

"The `evaluate` function is pure and testable—good. But the `main` function is hard to test and hard to read. If you need to change how arguments are parsed, you have to touch the same function that handles output. That's a code smell."

The senior engineer pulled up the Engineering Review rubric.

"Let's score this," they said. "Correctness: 5/5. It does what it says it does. Architecture: 3/5. It's functional, but the concerns aren't separated. Naming: 4/5. Clear enough. Readability: 4/5. Mostly readable, but `main` is dense. Testing: 4/5. Covers the core logic, but the `main` function isn't tested. Documentation: 3/5. There's a README, but no documentation for the public function. Maintainability: 3/5. It works, but changing it would be more work than necessary."

Priya looked at the scores. She had thought her code was finished. But the review showed her it was just functional—not yet professional.

"The best part," the senior said, "is that you don't need to fix it for this project. But you need to know what to fix. The awareness is the skill."

Priya spent the next hour refactoring. She extracted a `parse_args` function. She added documentation to `evaluate`. She cleaned up the `main` function. The code was still the same program, but it was better. It was clearer. It was more maintainable.

She had learned something important: "done" is not when the code works. "Done" is when the code is correct, clear, and maintainable. And you only know what "done" means by reviewing your own work.

Today, you review your Calculator CLI.

:::

:::mental-model

Before we dive into the Engineering Review, internalise these three mental models. They reframe self-review from an optional step into a core engineering discipline.

**Mental Model 1 — Self-review is not about being perfect. It is about being honest.**

When you review your own code, you are not looking for perfection. You are looking for truth. What works? What is unclear? What could be better?

Self-review is a reality check. It is the moment when you stop being the author and start being the critic. The goal is not to feel good about your code. The goal is to understand your code.

**Mental Model 2 — Every project teaches you something. The review is where you learn it.**

The act of writing code teaches you how to write code. The act of reviewing code teaches you how to write better code.

When you review your work, you are not just checking for errors. You are building a mental model of what "good" looks like. You are learning the patterns that work and the patterns that don't.

**Mental Model 3 — A low score is not a failure. It is a direction.**

When you score a 3/5 on Architecture, it is not a judgment of your worth. It is a pointer: "Improve here."

The Engineering Review rubric is not a report card. It is a roadmap. It tells you where to focus your attention. It tells you what to work on next.

:::

## Theory

### The Engineering Review Rubric

Per Template G (REEC-02-Templates.md), the Engineering Review rubric has ten scored dimensions:

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
| **Future Evolution** | Is the design shaped to accommodate future needs? |

### Scoring Guidelines

- **0:** Absent or completely broken
- **3:** Acceptable, professional baseline
- **5:** Exceptional—you could show this to a senior engineer without caveats

For the Calculator CLI, `Security` is N/A (no secrets or untrusted data). Performance is N/A (no Performance Goal stated). Total possible score: 40 (8 dimensions × 5).

### Applying the Rubric to Calculator CLI

#### 1. Correctness — [ ]/5

**What to check:**
- Does it compute the correct result for all four operators?
- Does division by zero return an error (not a panic)?
- Does it handle invalid input (non-numeric, missing operator)?
- Does it handle edge cases (negative numbers, decimals, large numbers)?

**Common issues:**
- Division by zero panics instead of returning a `Result`.
- Invalid input causes a panic instead of a helpful error.
- Floating-point precision issues (acceptable for this project).

#### 2. Architecture — [ ]/5

**What to check:**
- Are concerns separated? (Parsing, evaluation, output)
- Is the `evaluate` function pure and testable?
- Is `main` just a thin coordinator?
- Are there clear module boundaries?

**Common issues:**
- `main` does everything (parsing, validation, evaluation, output).
- No separation of concerns.
- The `evaluate` function contains too much logic.

#### 3. Naming — [ ]/5

**What to check:**
- Are variable names clear and meaningful?
- Does the function name `evaluate` clearly describe what it does?
- Are there any abbreviations that obscure meaning?

**Common issues:**
- Vague names (`a`, `b`, `op`—acceptable in this context, but could be more explicit).
- Inconsistent naming conventions.
- Names that don't communicate intent.

#### 4. Readability — [ ]/5

**What to check:**
- Is the control flow easy to follow?
- Are there unnecessary nested blocks?
- Is the code formatted correctly?
- Are comments used appropriately (why, not what)?

**Common issues:**
- `main` is too long and dense.
- Nested `match` statements make the logic hard to follow.
- Comments that restate the code instead of explaining intent.

#### 5. Testing — [ ]/5

**What to check:**
- Does every operator have a test?
- Does division by zero have a test?
- Does invalid input have a test?
- Are test names clear (scenario + expected outcome)?

**Common issues:**
- No tests for the `evaluate` function.
- Tests only cover the happy path.
- Tests that use `.unwrap()` unnecessarily.

#### 6. Documentation — [ ]/5

**What to check:**
- Does the README answer: what, how to run, how to test?
- Does `evaluate` have a doc comment explaining what it does and why it exists?
- Are error messages clear and helpful?

**Common issues:**
- No README or minimal README.
- No doc comments on public functions.
- Error messages that are cryptic or unhelpful.

#### 7. Maintainability — [ ]/5

**What to check:**
- How much would a plausible future change cost?
- Would adding a new operator be easy?
- Would changing the input format be easy?
- Is there code duplication?

**Common issues:**
- Adding a new operator requires changing multiple places.
- The `main` function is hard to modify without breaking things.
- Duplicated code in the parsing logic.

#### 8. Future Evolution — [ ]/5

**What to check:**
- Is the design shaped to accommodate future needs?
- Does the `evaluate` function accept any operator, or is it limited to four?
- Is the parsing logic flexible enough for future changes?

**Common issues:**
- Hard-coded assumptions about input format.
- No extensibility for new operators.
- No extensibility for new input sources.

### The Refactor Pass

After scoring the project, the next step is the Refactor Pass. Per Appendix A.6:

- Refactor with tests in place first.
- A refactor changes structure, not behaviour.
- If behaviour needs to change, that's a feature commit, kept separate from the refactor commit.

**Common refactors for Calculator CLI:**

1. **Extract `parse_args` function:** Move argument parsing out of `main`.
2. **Extract `print_result` function:** Move output logic out of `main`.
3. **Add doc comments:** Document `evaluate` and any other public functions.
4. **Improve error messages:** Make them more helpful and consistent.
5. **Extract operator constants:** Make adding new operators easier.

---

## Worked Example

### Applying the Review Rubric to Calculator CLI

Let's walk through a sample review of the Calculator CLI.

#### Project: Calculator CLI

**Correctness — 5/5**

The code correctly computes all four operators. Division by zero returns an `Err`. Invalid input is handled with helpful error messages. No panics occur on expected failure paths.

**Architecture — 3/5**

The `evaluate` function is pure and testable. However, the `main` function handles parsing, validation, and output all in one place. This makes the code harder to test and modify.

*Improvement opportunity:* Extract `parse_args` and `print_result` functions.

**Naming — 4/5**

The function names are clear (`evaluate`). Variable names are acceptable (`a`, `b`, `op` are standard for arithmetic operations). No confusing abbreviations.

**Readability — 4/5**

The code is mostly readable. The `main` function is dense, which makes it harder to follow. The `match` statements are clear and concise.

*Improvement opportunity:* Break `main` into smaller functions.

**Testing — 4/5**

The tests cover all operators and division by zero. However, the `main` function is not tested. The test names follow the convention.

*Improvement opportunity:* Integration tests for the full program flow.

**Documentation — 4/5**

The `--help` flag provides usage information. There is a README. However, `evaluate` lacks a doc comment explaining what it does and why it exists.

*Improvement opportunity:* Add a doc comment to `evaluate`.

**Maintainability — 3/5**

Adding a new operator requires modifying the `evaluate` function and the `--help` text. The `main` function is somewhat brittle to changes.

*Improvement opportunity:* Make adding operators easier (e.g., an operator map).

**Future Evolution — 3/5**

The design is not particularly extensible. Adding new input sources or operators would require modifying multiple files.

**TOTAL: 30/40**

### The Refactor Pass

After scoring, the developer makes specific improvements:

#### 1. Add Doc Comment to `evaluate`

```rust
/// Evaluates a binary arithmetic expression.
///
/// # Arguments
/// * `a` - The left-hand operand
/// * `op` - The operator (+, -, *, /)
/// * `b` - The right-hand operand
///
/// # Returns
/// * `Ok(result)` if the operation succeeds
/// * `Err(message)` if the operation fails (division by zero, unknown operator)
///
/// # Examples
/// ```
/// use calculator_cli::evaluate;
/// assert_eq!(evaluate(5.0, '+', 3.0), Ok(8.0));
/// ```
```

#### 2. Extract `parse_args` Function

```rust
struct ParsedArgs {
    a: f64,
    op: char,
    b: f64,
}

fn parse_args(args: &[String]) -> Result<ParsedArgs, String> {
    if args.len() != 4 {
        return Err("Usage: calculator_cli <number> <operator> <number>".to_string());
    }

    let a = args[1].parse::<f64>()
        .map_err(|_| format!("'{}' is not a valid number", args[1]))?;

    let op = args[2].chars().next()
        .ok_or("Missing operator".to_string())?;

    let b = args[3].parse::<f64>()
        .map_err(|_| format!("'{}' is not a valid number", args[3]))?;

    Ok(ParsedArgs { a, op, b })
}
```

#### 3. Simplify `main`

```rust
fn main() {
    let args: Vec<String> = env::args().collect();

    // Handle help flag
    if args.len() == 2 && (args[1] == "--help" || args[1] == "-h") {
        print_help(&args[0]);
        return;
    }

    match parse_args(&args) {
        Ok(parsed) => match evaluate(parsed.a, parsed.op, parsed.b) {
            Ok(result) => println!("{}", result),
            Err(e) => {
                eprintln!("Error: {}", e);
                std::process::exit(1);
            }
        },
        Err(e) => {
            eprintln!("{}", e);
            std::process::exit(1);
        }
    }
}
```

#### 4. Commit the Refactor

```bash
git add src/main.rs
git commit -m "refactor: extract parse_args and improve documentation

- Add doc comment to evaluate function
- Extract parse_args for better separation of concerns
- Simplify main to a thin coordinator
- All tests still passing; no behaviour changed
"
```

---

## Engineering Notes

### Engineering Note: Why the Engineering Review Exists

The Engineering Review is not about judging your work. It is about building the discipline of self-assessment.

When you review your code, you are practising the skill of:
- **Seeing your own work objectively.** This is hard, but essential.
- **Identifying areas for improvement.** No code is perfect. The question is: what could be better?
- **Prioritising improvements.** Not everything needs to be fixed. What matters most?
- **Recording decisions.** Why did you make the choices you made? What tradeoffs did you consider?

The Engineering Review is a habit. The more you practise it, the better you get at it.

### Engineering Note: The Relationship Between Review and Refactor

Review and Refactor are two sides of the same coin. The review tells you what to improve. The refactor is the improvement.

**The process:**
1. Write the code (get it working).
2. Review the code (score it against the rubric).
3. Refactor the code (improve structure without changing behaviour).
4. Review again (does it score higher now?).

This cycle is the core of professional software engineering. You never write perfect code the first time. You write good code, review it, improve it, and review it again.

### Engineering Note: The Decision Journal

Per Track H (Engineering Decision Journal), you should record tradeoffs and decisions as you make them.

For the Calculator CLI:

```
📓 Decision Journal — Calculator CLI

**Decision:** Use `Result<f64, String>` instead of `Result<f64, Box<dyn Error>>`.

**Rationale:** The project has only two error cases (division by zero and unknown operator). Returning `String` errors is simple and sufficient for this scale. Using `Box<dyn Error>` would be over-engineering.

**Alternative considered:** Using a custom error enum (would be more extensible but unnecessary for a project this small).

**Tradeoff:** Simplicity vs. extensibility. Simplicity wins for a learning project.

**Date:** Week 3, Day 5
```

---

## Compiler Thinking

**Prediction 1:**

After refactoring `parse_args` to return `Result<ParsedArgs, String>`, does the code compile?

<details>
<summary>Answer</summary>

**Yes.** The refactor preserves all existing functionality. The `?` operator in `parse_args` propagates errors, and `main` handles the `Result` appropriately.

</details>

---

**Prediction 2:**

If you add a doc comment to `evaluate`, does the code still compile?

<details>
<summary>Answer</summary>

**Yes.** Doc comments are ignored by the compiler. They only affect `cargo doc` output.

</details>

---

**Prediction 3:**

If you modify the `parse_args` function but don't update `main` to use the new `ParsedArgs` struct, will the code compile?

<details>
<summary>Answer</summary>

**No.** The compiler will complain about a type mismatch between `ParsedArgs` and `(f64, char, f64)` (or whatever `main` expects). The type system enforces consistency.

</details>

---

## Mini Challenge

### Challenge 1 — Apply the Rubric

Score your Calculator CLI against the Engineering Review rubric. Write down:

1. Your score for each dimension.
2. One specific improvement opportunity for each low score (3 or below).
3. Your total score out of 40.

---

### Challenge 2 — Identify a Refactor Opportunity

Look at your code. Identify one thing you would change if you had another hour.

Possible options:
- Extract a function
- Add a doc comment
- Improve an error message
- Simplify a control flow

---

### Challenge 3 — Write a Decision Journal Entry

Write a Decision Journal entry for one decision you made in the Calculator CLI:

- **Decision:** What did you choose?
- **Rationale:** Why did you choose it?
- **Alternative considered:** What did you not choose?
- **Tradeoff:** What did you gain and what did you lose?

---

## Reflection

Write the answer to this question in a text file called `reflection-phase1-d6.md` in your Phase 1 repository. Commit it.

**Question:**

"Today you reviewed and refactored your Calculator CLI. What was the most important insight you gained from the self-review process? How did seeing your code through the lens of the Engineering Review rubric change your understanding of what 'quality' means in software?"

<details>
<summary>Reflection Guidance</summary>

The most important insight is that quality is not about "it works." It is about clarity, maintainability, and deliberate design.

The Engineering Review rubric makes quality measurable. It breaks it down into specific dimensions that you can assess and improve. This turns "quality" from a vague feeling into something concrete.

Seeing your code through the rubric reveals gaps you didn't notice. The code works, but the `main` function is too long. The `evaluate` function is correct, but it's not documented. The tests pass, but they don't cover all edge cases.

The review process teaches you that quality is not a destination. It is a direction. There is always something to improve. The goal is not to be perfect. It is to be better than yesterday.

</details>

---

## End of Day 6, Week 3

### What You Have Accomplished

By the end of this session, you have:

- **Applied the Engineering Review rubric** to your Calculator CLI.
- **Scored your project** against eight quality dimensions.
- **Identified specific improvement opportunities.**
- **Refactored your code** to improve structure, readability, and maintainability.
- **Recorded a decision journal entry** for your first project.
- **Learned the discipline of self-review.**

### What This Builds Toward

Tomorrow is a rest day. You have earned it.

The Calculator CLI is your first real Rust program. You wrote it, reviewed it, and refactored it. It meets the Definition of Done. It is a professional artifact.

**Week 4 begins the next phase of your Rust journey.** You will learn:

- **Structs and enums** — custom types to model your domain.
- **Pattern matching** — exhaustive, expressive control flow.
- **Project Work** — Number Converter and File Organizer.

The Calculator CLI was the warm-up. Now you build real things.

### The Engineering Habit to Carry Forward

Before you consider any project "done," apply the Engineering Review rubric. Every time.

Ask yourself:
- What is my score for each dimension?
- What is one thing I can improve?
- What decision did I make, and why?

This is the discipline that separates professional engineers from people who just write code.

Rest well. You have earned it. Week 4 is coming.
