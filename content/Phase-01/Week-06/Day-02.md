---
id: P1-W6-D2
phase: 1
week: 6
day: 2
title: 'Testing Pass: Task Tracker v1'
subtitle: Building a comprehensive test suite to ensure correctness and quality
estimated_time: 75
difficulty: Intermediate
learning_objectives:
  - Write comprehensive unit tests for the core logic
  - Test edge cases and error paths
  - Apply the test naming convention from Appendix A.4
  - Understand the difference between unit tests and integration tests
  - Use assertions to verify correctness
  - Ensure the core logic is thoroughly tested before Phase 2
widgets:
  - story
  - mental-model
  - worked-example
  - engineering-note
  - compiler-thinking
  - mini-challenge
  - reflection
project:
  - Task Tracker v1 (testing pass — Mini Lab 1.5)
failure_lab: null
reading:
  - REEC-05-Phase1-RustFoundations.md §1.7 (Lab 1.5 — First Real Test Suite)
  - REEC-04-EngineeringStandardsAppendix.md §A.4 (Testing Philosophy)
  - 'The Rust Programming Language, Chapter 11 (Writing Automated Tests)'
tags:
  - testing
  - unit-tests
  - integration-tests
  - quality-assurance
  - task-tracker
next: P1-W6-D3
previous: P1-W6-D1
published: true
---

:::story

## The Developer Who Trusted His Tests

A developer—call him Alex—was confident in his code. He had written the Task Tracker v1 carefully. He had followed the architecture. He had handled errors.

But he had one problem: he didn't have enough tests.

He had a few tests—enough to make sure the code compiled. But he hadn't tested the edge cases. He hadn't tested error paths. He hadn't tested what happened when the task list was empty, or when the user tried to complete a task that didn't exist.

Then a user reported a bug: "When I try to remove a task that doesn't exist, the program crashes."

Alex was shocked. He had handled the `remove` method correctly—it returned `Result<Task, TaskError>`. But the REPL loop wasn't handling the error properly. It was `unwrap`-ing the result and panicking.

His tests hadn't caught this because he hadn't tested the REPL loop. He had only tested the core logic.

The senior engineer reviewed the bug fix and said: "Your core logic is solid. Your tests are not. You need to test every edge case. You need to test both the core logic AND the REPL. Your tests should catch every bug before a user does."

Alex spent the next hour writing tests. He tested empty lists, invalid IDs, malformed commands, and every error path he could think of. By the time he was done, his test suite had 20 passing tests. The bug was fixed—and would never come back.

Today, you build a comprehensive test suite.

:::

:::mental-model

Before we dive into testing, internalise these three mental models. They reframe testing from a chore into a quality guarantee.

**Mental Model 1 — Tests prove that your code works.**

The only way to know that your code is correct is to test it. Tests are not optional. They are the evidence that your code does what it claims.

A program without tests is a program whose correctness is unproven.

**Mental Model 2 — Tests are documentation.**

Tests show how code is supposed to be used. A well-named test (`add_task_works`, `complete_nonexistent_task_returns_error`) tells a story about the expected behaviour.

When you read tests, you learn what the code does. When you change the code and break a test, you learn that you have broken something.

**Mental Model 3 — The risk surface is what matters.**

Per Appendix A.4, test coverage is not about counting lines. It is about covering the risk surface.

The risk surface includes:
- Edge cases (empty list, first element, last element).
- Error paths (invalid input, task not found).
- Boundary conditions (maximum capacity, duplicate IDs).
- Unusual combinations (completing a task that's already done).

:::

## Theory

### The Testing Strategy for Task Tracker v1

Per REEC-05-Phase1-RustFoundations.md §1.12, the testing strategy for Task Tracker v1 is:

- **Unit tests:** TaskList::add/complete/remove/list, including the invalid-id error paths.
- **Integration tests:** N/A for this version—the REPL loop is thin enough that the core logic tests cover the real risk surface.

### The Test Naming Convention

Per Appendix A.4, test names should state the scenario and expected outcome:

| Scenario | Test Name |
|---|---|
| Adding a task works | `add_task_works` |
| Empty list is empty | `empty_list_is_empty` |
| Complete a task works | `complete_task_works` |
| Complete a nonexistent task returns error | `complete_nonexistent_task_returns_error` |
| Remove a task works | `remove_task_works` |
| Remove a nonexistent task returns error | `remove_nonexistent_task_returns_error` |

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
    fn empty_list_is_empty() {
        let list = TaskList::new();
        assert!(list.list().is_empty());
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
    fn add_task_increments_id() {
        let mut list = TaskList::new();
        let t1 = list.add("Task 1");
        let t2 = list.add("Task 2");
        assert_eq!(t1.id, 1);
        assert_eq!(t2.id, 2);
    }

    #[test]
    fn add_task_returns_reference() {
        let mut list = TaskList::new();
        let task = list.add("Buy milk");
        let tasks = list.list();
        assert_eq!(tasks[0].id, task.id);
        assert_eq!(tasks[0].title, task.title);
    }

    #[test]
    fn list_returns_all_tasks() {
        let mut list = TaskList::new();
        list.add("Task 1");
        list.add("Task 2");
        list.add("Task 3");
        assert_eq!(list.list().len(), 3);
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
    fn complete_already_completed_task_is_idempotent() {
        let mut list = TaskList::new();
        let task = list.add("Buy milk");
        assert!(list.complete(task.id).is_ok());
        assert!(list.complete(task.id).is_ok());
        // Should still be done
        let tasks = list.list();
        match &tasks[0].status {
            TaskStatus::Done { completed_at } => {
                assert!(!completed_at.is_empty());
            }
            _ => panic!("Task should still be done"),
        }
    }

    #[test]
    fn remove_task_works() {
        let mut list = TaskList::new();
        let task = list.add("Buy milk");
        let removed = list.remove(task.id).unwrap();
        assert_eq!(removed.id, task.id);
        assert_eq!(removed.title, task.title);
        assert_eq!(list.list().len(), 0);
    }

    #[test]
    fn remove_nonexistent_task_returns_error() {
        let mut list = TaskList::new();
        let result = list.remove(99);
        assert_eq!(result, Err(TaskError::TaskNotFound(99)));
    }

    #[test]
    fn remove_returns_owned_task() {
        let mut list = TaskList::new();
        let task = list.add("Buy milk");
        let removed = list.remove(task.id).unwrap();
        // The removed task is owned by the caller now
        assert_eq!(removed.title, "Buy milk");
        // list no longer contains it
        assert_eq!(list.list().len(), 0);
    }

    #[test]
    fn add_after_removal_reuses_ids_correctly() {
        let mut list = TaskList::new();
        let t1 = list.add("Task 1");
        assert_eq!(t1.id, 1);
        let t2 = list.add("Task 2");
        assert_eq!(t2.id, 2);
        list.remove(1).unwrap();
        let t3 = list.add("Task 3");
        assert_eq!(t3.id, 3); // IDs continue incrementing, not reused
        assert_eq!(list.list().len(), 2);
    }

    #[test]
    fn complete_does_not_remove_task() {
        let mut list = TaskList::new();
        let task = list.add("Buy milk");
        list.complete(task.id).unwrap();
        assert_eq!(list.list().len(), 1);
    }

    #[test]
    fn multiple_tasks_can_be_completed() {
        let mut list = TaskList::new();
        let t1 = list.add("Task 1");
        let t2 = list.add("Task 2");
        let t3 = list.add("Task 3");
        list.complete(t1.id).unwrap();
        list.complete(t3.id).unwrap();
        let tasks = list.list();
        match &tasks[0].status {
            TaskStatus::Done { .. } => (),
            _ => panic!("Task 1 should be done"),
        }
        match &tasks[1].status {
            TaskStatus::Pending => (),
            _ => panic!("Task 2 should be pending"),
        }
        match &tasks[2].status {
            TaskStatus::Done { .. } => (),
            _ => panic!("Task 3 should be done"),
        }
    }

    #[test]
    fn remove_all_tasks_leaves_empty_list() {
        let mut list = TaskList::new();
        list.add("Task 1");
        list.add("Task 2");
        list.add("Task 3");
        for id in 1..=3 {
            list.remove(id).unwrap();
        }
        assert!(list.list().is_empty());
    }
}
```

---

## Worked Example

### Building the Test Suite

Let's walk through building the test suite step by step.

#### Step 1: Locate the Test Module

Find the `#[cfg(test)] mod tests` block at the bottom of `src/main.rs`.

#### Step 2: Review Existing Tests

Review the tests you already have. Do they cover all methods? Do they cover all edge cases?

#### Step 3: Add Missing Tests

Add tests for:

**Edge Cases:**
- [x] Empty list
- [x] Single task
- [x] Multiple tasks

**Error Paths:**
- [x] Complete nonexistent task
- [x] Remove nonexistent task
- [x] Complete already-completed task

**Behaviour Verification:**
- [x] Add returns a reference
- [x] List borrows, does not move
- [x] Remove returns owned task
- [x] Complete does not remove task
- [x] Multiple tasks can be completed
- [x] Remove all tasks

#### Step 4: Run the Tests

```bash
$ cargo test
```

#### Step 5: Check Test Coverage

Run the tests and check that all pass. If any fail, fix the code.

#### Step 6: Commit the Changes

```bash
git add src/main.rs
git commit -m "test: add comprehensive test suite for TaskList

- Add tests for all methods (add, list, complete, remove)
- Add edge case tests (empty list, invalid IDs)
- Add error path tests (nonexistent tasks)
- Add behaviour verification tests
- All 20 tests passing
"
```

---

## Engineering Notes

### Engineering Note: Unit Tests vs. Integration Tests

**Unit tests:** Test a single unit of code in isolation. For Task Tracker v1, the unit tests test `TaskList` methods without any I/O.

**Integration tests:** Test how multiple units work together. For Task Tracker v1, there are no integration tests because the REPL loop is thin enough that unit tests cover the risk surface.

In Phase 2, when you add persistence, integration tests will become important—you'll need to test that the file I/O works correctly with the core logic.

### Engineering Note: Test Naming

Per Appendix A.4, test names should state the scenario and expected outcome:

```rust
#[test]
fn complete_nonexistent_task_returns_error() {
    // ...
}
```

This name tells you:
- **Scenario:** Completing a nonexistent task.
- **Expected outcome:** It returns an error.

### Engineering Note: The Risk Surface

The risk surface for Task Tracker v1 includes:

| Risk | Tests |
|---|---|
| Adding tasks works | `add_task_works`, `add_task_increments_id` |
| Listing tasks works | `list_returns_all_tasks`, `list_borrows_does_not_move` |
| Completing tasks works | `complete_task_works` |
| Completing nonexistent tasks fails | `complete_nonexistent_task_returns_error` |
| Removing tasks works | `remove_task_works` |
| Removing nonexistent tasks fails | `remove_nonexistent_task_returns_error` |
| Already completed tasks don't break | `complete_already_completed_task_is_idempotent` |
| Multiple tasks interact correctly | `multiple_tasks_can_be_completed` |

### Engineering Note: The Complete Test Suite

A good test suite is comprehensive and maintainable:

**Comprehensive:** It covers the risk surface. All edge cases and error paths are tested.

**Maintainable:** Tests are clear, named well, and easy to update. They don't duplicate each other.

---

## Compiler Thinking

**Prediction 1:**

Why does `#[cfg(test)]` compile the test module only when running tests?

<details>
<summary>Answer</summary>

`#[cfg(test)]` tells the compiler to include the module only when the `test` configuration is enabled (i.e., when running `cargo test`). This saves compile time and binary size when building for production.

</details>

---

**Prediction 2:**

What happens if you run `cargo test -- --show-output`?

<details>
<summary>Answer</summary>

This shows the output from passing tests. By default, `cargo test` only shows output from failing tests. `--show-output` forces the output of all tests to be displayed.

</details>

---

**Prediction 3:**

Why do the tests run in parallel by default?

<details>
<summary>Answer</summary>

Tests are run in parallel to speed up execution. However, if tests share state, this can cause problems. For `TaskList`, the tests are independent, so parallel execution is safe.

</details>

---

## Mini Challenge

### Challenge 1 — Add a Test for Empty Title

Add a test that verifies the `add` method handles empty titles correctly.

### Challenge 2 — Add a Test for Large Number of Tasks

Add a test that verifies the `TaskList` handles a large number of tasks (e.g., 10,000 tasks).

### Challenge 3 — Run Clippy and Fix Warnings

Run `cargo clippy -D warnings` and fix any warnings in the test module.

---

## Reflection

Write the answer to this question in a text file called `reflection-phase1-w6-d2.md` in your Phase 1 repository. Commit it.

**Question:**

"Today you wrote a comprehensive test suite for Task Tracker v1. You tested edge cases, error paths, and the behaviour of every method. Why is testing important? How does a good test suite give you confidence in your code? Compare the mindset of 'the code compiles, so it works' to 'the tests pass, so it works.'"

<details>
<summary>Reflection Guidance</summary>

Testing is important because it proves that your code works. A program without tests is a program whose correctness is unproven.

"The code compiles, so it works" is a dangerous mindset. Compilation only proves that the code is syntactically correct. It does not prove that the code is logically correct. It does not prove that edge cases are handled. It does not prove that errors are handled gracefully.

"The tests pass, so it works" is more accurate. A comprehensive test suite verifies that the code behaves correctly in all expected scenarios. It catches regressions when you change the code. It gives you confidence that the code is correct.

A good test suite is the evidence that your code works. It is the difference between hoping the code works and knowing that it works.

</details>

---

## End of Day 2, Week 6

### What You Have Accomplished

By the end of this session, you have:

- **Written a comprehensive test suite** for Task Tracker v1.
- **Tested all methods** (add, list, complete, remove).
- **Tested edge cases** (empty list, invalid IDs).
- **Tested error paths** (nonexistent tasks).
- **Tested behaviour verification** (borrowing, ownership, idempotence).
- **Confirmed all tests pass** with `cargo test`.

### What This Builds Toward

The Task Tracker v1 is now tested and verified.

**Tomorrow, Day 3 — Production Reading: Vec's Growth Strategy**

You will read how `Vec<T>` allocates and grows its memory. This is a deep dive into the standard library that will prepare you for writing efficient code.

**Week 6, Day 4 — Engineering Review + Refactor Pass**

You will review the Task Tracker v1 against the Engineering Review rubric and plan a refactor pass.

### The Engineering Habit to Carry Forward

Before you consider any project "done," ensure it has a comprehensive test suite. Tests are not optional. They are the evidence that your code works.

### Tomorrow

**Week 6, Day 3 — Production Reading: Vec's Growth Strategy**

You will:
- Read the `Vec<T>` implementation.
- Understand how capacity is managed.
- Learn about allocation strategies.
- Apply these insights to your own code.

Rest well. Tomorrow, you read production code.
