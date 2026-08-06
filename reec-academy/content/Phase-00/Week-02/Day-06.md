---
id: P0-W2-D6
phase: 0
week: 2
day: 6
title: Review All Committed Documents for Internal Consistency
subtitle: The final quality pass—ensuring your Phase 0 repository tells a coherent story
estimated_time: 60
difficulty: Beginner
learning_objectives:
  - Review all Phase 0 documentation for internal consistency
  - Ensure all deliverables use consistent vocabulary and mental models
  - Verify that the repository tells a coherent story of learning
  - Confirm all files are professionally formatted and free of errors
  - Prepare the repository for portfolio presentation
widgets:
  - story
  - mental-model
  - worked-example
  - engineering-note
  - mini-challenge
  - reflection
project: null
failure_lab: null
reading:
  - REEC-01-Phase0-Foundations.md §0.12 (Documentation Deliverables)
  - REEC-04-EngineeringStandardsAppendix.md §A.3 (Documentation Style)
tags:
  - review
  - consistency
  - documentation
  - phase-0-completion
  - quality-assurance
next: P0-W2-D7
previous: P0-W2-D5
published: true
---

:::story

## The Repository That Contradicted Itself

A developer—call him David—had finished his project. He had written the code, pushed it to GitHub, and added a README. He was proud of his work.

Then a teammate opened the repository and started reading. The README said the project was "a lightweight, high-performance web server." The code was a minimal HTTP server. The architecture diagram showed a complex microservice architecture.

"Wait," the teammate said, "your README says lightweight and high-performance. Your code is minimal. Your architecture diagram is complicated. Which is it?"

David had no answer. He had written each part of the documentation at a different time, in a different state of mind, without checking whether they told the same story. The repository contradicted itself.

His teammate found a dozen more inconsistencies. The commit messages said one thing; the code did another. The documented API was different from the actual API. The tests claimed to cover edge cases that were never tested. The project was a mess—not because the code was bad, but because the documentation was incoherent.

"Documentation," the teammate said, "is not a luxury. It is the public face of your work. When it contradicts itself, it tells the world that you didn't think deeply enough to get your story straight."

David spent the next day fixing the inconsistencies. When he was done, the repository told a coherent story. It was a project he could be proud of.

Today, you do the same.

:::

:::mental-model

Before we dive into the consistency review, internalise these three mental models. They reframe documentation consistency from a chore into a professional discipline.

**Mental Model 1 — Consistency is a signal of quality.**

When a repository tells a consistent story, it signals that the author has thought deeply about their work. They have considered all the angles. They have made deliberate choices and documented them. They have invested in quality.

When a repository is inconsistent, it signals the opposite. It signals carelessness. It signals that the author didn't check their own work. It signals that the project was rushed.

Consistency is not a minor detail. It is a quality signal.

**Mental Model 2 — Your repository is a single document.**

It is tempting to think of your repository as a collection of files. README, code, tests, architecture diagram—each is separate. But to a reader, the repository is a single document. They read it from start to finish. They expect it to tell a single, coherent story.

When the story contradicts itself, the reader becomes confused. They cannot trust the repository. They cannot trust the author.

**Mental Model 3 — You are the curator of your repository.**

You are not just an author. You are a curator. You are responsible for the quality and consistency of every file in your repository. You are the last line of defence before your work is seen by others.

Curating a repository is an active process. It requires reviewing, editing, and revising. It requires looking at the whole picture, not just the parts.

:::

## Theory

### What "Internal Consistency" Means

A repository is internally consistent when:

- **Vocabulary is consistent.** You use the same terms to mean the same things across all files.
- **Mental models are consistent.** The explanations in your README and documentation align with the code and architecture.
- **Claims are accurate.** What you say the repository contains is what it actually contains.
- **Commit messages tell a coherent story.** They align with the evolution of the code.
- **Documentation matches reality.** What is documented matches what the code actually does.

### The Consistency Audit

Use this checklist to audit your repository for internal consistency.

**Vocabulary Consistency:**

```
[ ] Do you use the same terms consistently across all files?
[ ] Is "stack" always the stack (not "call stack" in one file and "stack frame" in another)?
[ ] Is "heap" always the heap (not "dynamic memory" in one file and "heap" in another)?
[ ] Is "ownership" used consistently with Phase 0's definition?
[ ] Are memory regions (text, data, BSS, heap, stack) named consistently?
```

**Mental Model Consistency:**

```
[ ] Does your README's explanation of the compilation pipeline align with your memory-trace.md?
[ ] Does your toolchain-notes.md reflect the same Unix philosophy as your README?
[ ] Does your failure-lab-0.md use the same vocabulary as your engineering-review-0.md?
[ ] Does your memory-trace.md connect to Rust's ownership model in the same way as your reflections?
```

**Claim Accuracy:**

```
[ ] Does your README accurately describe what the repository contains?
[ ] Do your reflections accurately describe what you learned?
[ ] Does your memory-trace.md accurately represent the program's execution?
[ ] Does your toolchain-notes.md accurately describe the commands you used?
```

**Commit Message Consistency:**

```
[ ] Do commit messages follow the same format consistently?
[ ] Do commit messages accurately describe what changed?
[ ] Do commit messages tell a coherent story of your learning journey?
[ ] Is there any commit that contradicts what the repository actually contains?
```

**Documentation vs. Reality:**

```
[ ] Does the code compile and run as the README describes?
[ ] Are the architecture diagrams accurate (if you have them)?
[ ] Does any documentation claim something the code doesn't do?
[ ] Are there any undocumented features or decisions?
```

### Common Consistency Issues to Check

| Issue | Example | Fix |
|---|---|---|
| **Vocabulary inconsistency** | "Stack" in one file, "call stack" in another | Choose one term and use it consistently |
| **Mental model drift** | README claims one thing; reflections claim another | Align the mental model across all files |
| **Claim inaccuracy** | README says "I learned X"; reflection says "I learned Y" | Ensure all claims are accurate |
| **Commit message mismatch** | Commit says "feat: add X"; code shows X is actually a bug fix | Amend the commit message |
| **Documentation vs. code** | README says the code does X; it actually does Y | Update the README |

---

## Worked Example

### Auditing a Phase 0 Repository

Let's walk through a consistency audit of a Phase 0 repository.

#### Step 1: Read the README

**README.md:**

*"This repository contains my Phase 0 Engineering Environment Repository for the REEC curriculum. It demonstrates my understanding of the compilation pipeline, memory layout, CPU instructions, the Unix toolchain, Git, and manual memory tracing. The repository includes a complete memory trace of the global_counter program, toolchain notes, failure lab deliverables, and engineering review answers."*

**Consistency check:**

- [x] The README accurately describes the repository contents.
- [x] The README uses consistent vocabulary (compilation pipeline, memory layout, CPU instructions, Unix toolchain, Git, manual memory tracing).
- [x] The README matches the actual contents of the repository.

**Issues found:** None.

#### Step 2: Read the Memory Trace

**memory-trace.md:**

*"The global_counter program has three variables: global_counter in the Data region, a in main on the stack, and b in main on the stack. The increment function has n (parameter) and doubled (local) on the stack. The stack grows downward. global_counter starts at 0, becomes 1 after increment(a), and becomes 2 after increment(b)."*

**Consistency check:**

- [x] Vocabulary is consistent with the README (Data region, stack).
- [x] Mental model is consistent with the README (stack grows downward).
- [x] Claims are accurate (global_counter values).
- [ ] Does it connect to Rust's ownership model? Yes, in the reflection.

**Issues found:** None.

#### Step 3: Read the Toolchain Notes

**toolchain-notes.md:**

*"Navigation: pwd, cd, ls -la, tree. File ops: cp, mv, rm, mkdir -p, touch. Inspection: cat, less, head, tail, wc -l. Search: grep -rn, find . -name. Permissions: chmod, ls -l. Process: ps aux, kill, top. Piping: |, >, >>, 2>&1. Git: init, status, add, commit, log, branch, checkout, diff."*

**Consistency check:**

- [x] Vocabulary is consistent with the README (command names match).
- [x] Commands are described accurately.
- [x] The notes are useful (written in own words).
- [ ] Is this consistent with the Phase 0 §0.3.3 table? Yes.

**Issues found:** None.

#### Step 4: Read the Failure Lab

**failure-lab-0.md:**

*"Claim 1: Global variables live on the heap because they can be accessed from anywhere. Corrected: Global variables live in the Data region; accessibility is a property of scope, not memory region. Claim 2: Once main calls increment(a) and it returns, a's memory is deleted. Corrected: Nothing is deleted; the stack pointer moves, but bytes remain. Claim 3: A pointer that hasn't been freed is always safe. Corrected: A pointer to a stack variable becomes dangling after the function returns—no free() call involved."*

**Consistency check:**

- [x] Vocabulary is consistent with the README (Data region, stack, scope, memory region).
- [x] Mental model is consistent with the README (scope vs. memory region).
- [x] Claims are accurate (bytes remain, dangling pointer).

**Issues found:** None.

#### Step 5: Read the Engineering Review

**engineering-review-0.md:**

*"Rust exists because heap allocation requires bookkeeping. Garbage collectors provide bookkeeping at runtime; C/C++ trust the programmer to manually free memory. Rust provides compile-time bookkeeping via ownership. One owner per value means exactly one entity is responsible for freeing—eliminating double-free and use-after-free bugs."*

**Consistency check:**

- [x] Vocabulary is consistent with the README (heap allocation, bookkeeping, ownership).
- [x] Mental model is consistent with the README.
- [x] Answer is thoughtful and accurate.

**Issues found:** None.

#### Step 6: Check Commit Messages

```bash
git log --oneline
```

```
abc1234 (HEAD -> main) docs: finalize README with Phase 0 learning outcomes
def5678 docs: add week 2 day 5 reflection on assessment and completion
...
```

**Consistency check:**

- [x] Commit messages follow the same format consistently.
- [x] Commit messages accurately describe what changed.
- [x] Commit messages tell a coherent story of learning.

**Issues found:** None.

#### Step 7: Check Documentation vs. Code

```bash
cargo build
cargo run
```

Both succeed. The code does what the README says.

**Consistency check:**

- [x] Code compiles and runs as documented.

**Issues found:** None.

#### Audit Result

The repository is internally consistent. The story is coherent. The work is complete.

---

## Engineering Notes

### Engineering Note: Why Consistency Matters

Consistency matters because your repository is a professional artifact. It is the first thing people see when they evaluate your work.

**In a job interview:** An interviewer might open your repository. If it is inconsistent, they will wonder: "Is this person careless?" If it is consistent, they will think: "This person pays attention to detail."

**In a team:** Your teammates will read your documentation. If it is inconsistent, they will waste time figuring out what you actually meant. If it is consistent, they will understand your work quickly.

**For your future self:** Six months from now, you will return to this repository. If it is inconsistent, you will be confused. If it is consistent, you will remember exactly what you did.

### Engineering Note: The Cost of Inconsistency

Inconsistency has a real cost:

- **Time:** People spend time resolving contradictions.
- **Trust:** Inconsistency erodes trust in the author.
- **Quality:** Inconsistent repositories often contain bugs.

The cost of fixing inconsistency is small. The cost of leaving it unfixed is large.

### Engineering Note: Consistency Is a Habit

Consistency is not a one-time fix. It is a habit. The more you practise consistency, the easier it becomes.

**Habits for consistency:**

1. **Use the same vocabulary.** When you learn a new term, use it consistently.
2. **Review your work.** Read your own documentation as if you were a stranger.
3. **Fix inconsistencies immediately.** Don't wait for a "final review"—fix them as you go.
4. **Be intentional.** Think about what story your repository tells.

---

## Mini Challenge

### Challenge 1 — The Consistency Audit

Run through the consistency audit checklist for your repository:

**Vocabulary Consistency:**

```
[ ] Do you use the same terms consistently across all files?
[ ] Are memory regions (text, data, BSS, heap, stack) named consistently?
[ ] Is "scope" used consistently?
[ ] Is "ownership" used consistently?
```

**Mental Model Consistency:**

```
[ ] Does your README's explanation align with your other files?
[ ] Does your memory trace use the same mental model as your reflections?
[ ] Does your failure lab use the same vocabulary as your engineering review?
```

**Claim Accuracy:**

```
[ ] Does your README accurately describe what the repository contains?
[ ] Do your reflections accurately describe what you learned?
```

**Commit Message Consistency:**

```
[ ] Do commit messages follow the same format consistently?
[ ] Do commit messages accurately describe what changed?
[ ] Do commit messages tell a coherent story?
```

**Documentation vs. Reality:**

```
[ ] Does the code compile and run as the README describes?
[ ] Does any documentation claim something the code doesn't do?
```

### Challenge 2 — Fix Inconsistencies

If you found any inconsistencies during the audit, fix them.

**Common fixes:**

- Update vocabulary to be consistent across files.
- Update README to accurately describe the repository.
- Rewrite commit messages to follow the same format.
- Update documentation to match what the code actually does.

### Challenge 3 — The "Stranger Test"

Imagine you are a stranger opening your repository for the first time. Read through all the files in order:

1. README.md
2. memory-trace.md
3. toolchain-notes.md
4. failure-lab-0.md
5. engineering-review-0.md
6. All reflections

As you read, ask:

- Does this make sense?
- Is it consistent?
- Does it tell a coherent story?
- Would I trust this author?

If the answer to any question is "no," fix the problem.

---

## Reflection

Write the answer to this question in a text file called `reflection-w2d6.md` in your `hello_reec` directory. Commit it.

**Question:**

"Your Phase 0 repository is now complete. It contains multiple files that you wrote at different times, in different states of mind. Why is it important that these files tell a single, coherent story? What does consistency in documentation signal about your engineering discipline?"

<details>
<summary>Reflection Guidance</summary>

Consistency signals quality. It signals that you have thought deeply about your work. It signals that you care about the details.

When a repository tells a coherent story, it becomes more than a collection of files. It becomes a professional artifact. It demonstrates discipline, attention to detail, and the ability to communicate complex ideas clearly.

Inconsistency signals carelessness. It signals that you didn't review your own work. It signals that you don't care about the quality of your documentation.

The discipline of consistency is not just about making your repository look good. It is about developing the habit of quality. It is about taking pride in your work.
</details>

---

## End of Day 6, Week 2

### What You Have Accomplished

By the end of this session, you have:

- **Audited your repository** for internal consistency.
- **Identified and fixed any inconsistencies** in vocabulary, mental models, claims, and documentation.
- **Ensured your repository tells a coherent story** of your learning journey.
- **Verified that all files meet the quality bar** for professional presentation.
- **Prepared your repository** for portfolio use.

### What This Builds Toward

Tomorrow is the final day of Week 2 and the end of Phase 0. You will rest, reflect, and prepare for the transition to Phase 1.

**The week after, Phase 1 begins.** You will write your first real Rust programs. The systems thinking you have built in Phase 0 is the foundation for everything you will learn.

Your repository is now complete. It is professional. It is coherent. It is a demonstration of your engineering discipline.

Rest well. Tomorrow, you close Phase 0 and prepare for Phase 1.
