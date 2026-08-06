---
id: P0-W1-D2
phase: 0
week: 1
day: 2
title: 'The Unix Toolchain, Git, and the Engineer''s Workspace'
subtitle: Building a professional development environment from the ground up
estimated_time: 85
difficulty: Beginner
learning_objectives:
  - >-
    Explain why the Unix philosophy of small, composable tools enables
    engineering at scale
  - Navigate the filesystem using absolute and relative paths
  - Understand the role of the PATH environment variable in locating executables
  - 'Distinguish between stdin, stdout, and stderr and use redirection and pipes'
  - Describe Git's mental model: 'working tree, staging area, commits, and history'
  - >-
    Write commit messages that explain why changes were made, not just what
    changed
  - Explain Cargo's role as an orchestrator of the Rust toolchain
  - 'Verify a complete, working Rust development environment'
widgets:
  - story
  - mental-model
  - worked-example
  - engineering-note
  - historical-context
  - compiler-thinking
  - mini-challenge
  - reflection
project: null
failure_lab: null
reading:
  - 'Pro Git, Chapters 1–2 (Getting Started, Git Basics)'
  - 'The Rust Programming Language, Chapter 1 (Getting Started)'
tags:
  - unix
  - shell
  - git
  - cargo
  - toolchain
  - environment-setup
next: P0-W1-D3
previous: P0-W1-D1
published: true
---

:::story

## The Two-Week Mistake

A developer—let's call her Maya—had been writing code for two years. She was competent in her language of choice, understood algorithms, and could debug reasonably well. But she had never learned the Unix toolchain properly.

She used an IDE that abstracted away the terminal. She used Git through a GUI client that turned commits into "save points." She clicked "Run" and the code executed, and she never thought about what actually happened between saving a file and seeing output.

Then came the production incident.

A configuration file needed updating across fifty servers. The operations team asked Maya to help—she was the subject matter expert on this particular service. She SSH'd into the first server, opened Vim, made the change, saved the file, and restarted the service.

Forty-nine servers remained.

Her manager asked: "Can you script this?"

"I don't really do shell scripts."

"Can you use Ansible?"

"We don't have it set up."

"Can you at least write a for loop?"

Maya's terminal stared back at her, blank and uncooperative. The two weeks of manual, error-prone work that followed could have been avoided with a single shell command:

```bash
for server in $(cat servers.txt); do
    ssh $server "sed -i 's/old_config/new_config/g' /etc/service.conf && systemctl restart service"
done
```

She hadn't learned the toolchain. The toolchain had learned her—and it had learned that she was someone who could be replaced by a script.

This is not a story about failure. It is a story about a gap in engineering education that is almost never filled by universities. You can graduate with a computer science degree and never learn to read a man page, never understand `$PATH`, never grasp what `stdin` and `stdout` actually are. And yet, every professional engineer uses these concepts every single day.

Today, you close that gap.

:::

:::mental-model

Before proceeding to the detailed theory, internalise these four sentences. Each one reframes a tool you may have used casually as an engineering discipline with a specific purpose.

**Mental Model 1 — The shell is a programming language, not a launcher.**

Most beginners treat the shell as a glorified application launcher—something that runs programs you cannot double-click. This is wrong.

The shell is a fully featured programming language with variables, conditionals, loops, functions, and—most importantly—the ability to compose programs together. Every command you run is an expression. Every pipeline is a composition. Every script is a program that writes other programs. The shell's syntax may be archaic, but its conceptual model—programs as functions, streams as data, composition as function application—is one of the most durable ideas in software engineering.

**Mental Model 2 — The Unix philosophy is about composition, not simplicity.**

"Write programs that do one thing well, and connect them together."

Beginners often read this as "keep it simple." That is not quite right.

The Unix philosophy is not about small programs being easy to write. It is about small programs being *composable*—able to be connected in arbitrary ways to solve problems their authors never anticipated. A tool that reads from standard input and writes to standard output can become part of an infinite variety of pipelines. The `grep` command's author did not anticipate that it would be used to search through process listings, compiler output, Git logs, and web server access logs. They designed it to be *general*—to work with any stream of text—and that generality is what made it composable.

**Mental Model 3 — Git is a time machine for the engineering process, not cloud storage.**

This is the single most important mental shift in learning version control.

When you save a file, you capture a state. When you commit a change in Git, you capture a *decision*—a moment in the engineering process where you chose to make a specific change for a specific reason. Git's commit history is not a backup; it is an artifact of the reasoning process itself.

A repository with a clean, well-structured history tells the story of how the code evolved. It answers questions like: "Why was this function added?" "What problem did this change solve?" "When was this bug introduced?" A repository with a history full of "fix" and "update" commits tells no story at all—it is merely a sequence of save points, indistinguishable from a directory of numbered backups.

**Mental Model 4 — Cargo orchestrates tools; it does not replace them.**

Cargo does not compile your code. `rustc` does. Cargo does not format your code. `rustfmt` does. Cargo does not analyse your code. `clippy` does.

Cargo orchestrates these tools—it runs them in the right order, with the right arguments, and manages the dependencies between them. It is a *build system* first, a *package manager* second, and a *project manager* third. Understanding this distinction matters because it clarifies why Cargo exists and what problems it solves. When you run `cargo build`, you are not telling Rust to compile your code. You are telling Cargo to invoke `rustc` with the correct flags, and Cargo is doing the work of figuring out what those flags should be.

:::

## Theory

### The Unix Philosophy in Practice

Unix was designed around a simple, radical idea: instead of building large programs that do everything, build small programs that do one thing well and let them communicate.

Here is what that means concretely:

| Principle | Meaning | Example |
|---|---|---|
| **Do one thing** | Each program has a single responsibility | `ls` lists files. It does not sort them (except as an option) or format them (except as an option). |
| **Text is the universal interface** | Programs communicate through streams of text | `grep` searches text, `sed` transforms text, `awk` analyses text. |
| **Composition over monolithic design** | Connect programs with pipes | `ps aux \| grep rust` combines process listing and filtering. |
| **Everything is a file** | Files, directories, devices, and even processes are accessed through the same interface | `/dev/null` is a file you can write to. `/proc/cpuinfo` is a file you can read. |

This is not an accident. It is a deliberate design choice from the 1970s that has proven remarkably durable because it works. Modern systems—including containers, cloud infrastructure, and CI/CD pipelines—are built on exactly these principles.

**The key insight:** Once you understand that every program reads from `stdin`, writes to `stdout`, and writes errors to `stderr`, you understand how nearly every Unix tool works, regardless of what it actually does. The interface is the same; only the behaviour differs.

### The Filesystem Hierarchy

Before you can navigate effectively, you need a mental map of where things live.

```
/
├── bin/          # Essential user binaries (ls, cp, mv, etc.)
├── sbin/         # Essential system binaries (init, mount, etc.)
├── etc/          # System configuration files
├── home/         # User home directories
│   └── username/ # Your personal workspace
│       ├── projects/
│       ├── .bashrc   # Shell configuration
│       └── .cargo/   # Cargo configuration
├── usr/          # User utilities and applications
│   ├── bin/      # Non-essential user binaries
│   ├── lib/      # Shared libraries
│   └── local/    # Locally installed software
├── tmp/          # Temporary files (cleared on reboot)
├── var/          # Variable data (logs, caches, spools)
└── dev/          # Device files (hardware interfaces)
```

Two critical concepts:

**Absolute vs. Relative Paths:**

```
Absolute:  /home/maya/projects/rust/calc/src/main.rs
Relative:  ./src/main.rs                 # from the project root
Relative:  ../config/production.toml     # one directory up
```

**The PATH Environment Variable:**

When you type `rustc`, how does the shell know where `rustc` lives?

```bash
$ echo $PATH
/usr/local/bin:/usr/bin:/bin:/home/maya/.cargo/bin
```

The shell searches these directories in order, left to right. If `rustc` is in `/home/maya/.cargo/bin`, the shell finds it. If not, you get `command not found`.

:::engineering-note

**PATH is a security boundary.** The order of directories in `PATH` matters. If an attacker can write to an earlier directory in your `PATH`, they can replace commands you run with their own versions. This is why you should never put `./` (the current directory) at the front of your `PATH`—it is a common security vulnerability.

:::

### Standard Streams: stdin, stdout, stderr

Every running program has three data streams by default:

```
┌─────────────┐
│   Program   │
│             │──stdout──▶ Terminal (or next program)
│   (process) │
│             │──stderr──▶ Terminal (error messages)
│             │
│    ◀──stdin │── From terminal (or previous program)
└─────────────┘
```

**stdin (Standard Input):** Where the program reads data from. By default, this is your keyboard. But it can be redirected from a file or another program.

**stdout (Standard Output):** Where the program writes normal output. By default, this is your terminal. But it can be redirected to a file or another program.

**stderr (Standard Error):** Where the program writes error messages. This is separate from stdout so that errors do not get mixed into normal output when you redirect stdout.

:::engineering-note

**Why stderr exists separately.** Consider a program that processes a large file and occasionally encounters errors. If errors were written to stdout, they would be mixed in with the normal output. The user would have to manually separate them. By keeping errors on a separate stream, the user can redirect normal output to a file while still seeing errors on the terminal—or redirect errors to a separate file for later analysis.

:::

### Pipes and Redirection

This is where composition happens.

**Redirection:** Send output somewhere other than the terminal.

```bash
# Write to a file (overwrite)
$ echo "Hello, world!" > greeting.txt

# Append to a file
$ echo "Another line" >> greeting.txt

# Read from a file instead of the keyboard
$ sort < unsorted.txt

# Send errors to a separate file
$ rustc main.rs 2> errors.log

# Send both stdout and stderr to the same file
$ rustc main.rs > output.log 2>&1
```

**Pipes:** Connect the stdout of one program to the stdin of another.

```bash
# List processes, search for rust, count lines
$ ps aux | grep rust | wc -l

# Find all Rust files, search for "panic", sort uniquely
$ find . -name "*.rs" | xargs grep "panic" | sort -u

# Get the 10 largest files in the current directory
$ ls -la | sort -k5 -nr | head -10
```

**The mental model:** Think of pipes as a literal pipeline. Data flows from left to right, being transformed at each stage. Each stage is a program that does one thing well. The pipeline is a composition that does something none of the individual programs could do alone.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         COMPOSITION IN ACTION                          │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  $ find . -name "*.rs" | xargs grep "panic" | sort | uniq -c   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│   find . -name "*.rs"     │   xargs grep "panic"     │   sort │  uniq -c │
│                           │                          │        │          │
│   ┌─────────────────┐     │   ┌─────────────────┐   │ ┌─────┐│ ┌────────┐│
│   │ list all .rs    │     │   │ search each for  │   │ │sort ││ │count   ││
│   │ files recursively│     │   │ "panic"         │   │ │lines││ │unique  ││
│   └─────────────────┘     │   └─────────────────┘   │ └─────┘│ └────────┘│
│           │                     │                         │         │     │
│           └─────────────────────┼─────────────────────────┼─────────┘     │
│                                 │                         │               │
│                             stdin/stdout pipes   stdout   │               │
│                                                                          │
│  Result: a sorted, counted list of all lines containing "panic" in       │
│  every .rs file in the project.                                         │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Git's Architecture

To use Git effectively, you need to understand its mental model—not just the commands.

```
             Working Tree              Staging Area              Repository
       (the files you're editing)   (what you'll commit)    (committed history)

┌─────────────────────┐   git add   ┌─────────────────┐   git commit   ┌─────────────────┐
│                     │─────────────▶│                 │───────────────▶│                 │
│  main.rs            │             │  main.rs        │               │  commit abc123  │
│  lib.rs             │             │  lib.rs         │               │  author: Maya   │
│  config.toml        │             │                 │               │  date: 10:23    │
│                     │             │                 │               │  "feat: add..." │
│  (files on disk)    │             │  (staged files) │               │  (immutable)    │
└─────────────────────┘             └─────────────────┘               └─────────────────┘
           │                                                                 ▲
           │                                                                 │
           └──────────── git checkout ───────────────────────────────────────┘
```

**Working Tree:** The files you are currently editing on disk. Git does not track changes here automatically.

**Staging Area:** A snapshot of what the next commit will contain. You must explicitly "stage" changes with `git add`.

**Commit:** An immutable snapshot of the entire repository at a point in time. Commits are identified by a hash (e.g., `abc123...`). Once created, a commit can never be changed.

**Commit History:** A directed acyclic graph of commits, each pointing to its parent(s). This is how Git tracks the evolution of your codebase.

:::engineering-note

**The staging area is one of Git's most misunderstood features.** It exists because not every change belongs in the same commit.

You might have made three bug fixes while working on a feature, but you want to commit them separately, with distinct commit messages explaining each reasoning. The staging area lets you choose *exactly* what goes into each commit, down to individual lines of code.

:::

### Cargo's Architecture

Cargo is not a compiler. It orchestrates everything.

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Cargo                                     │
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │
│  │   Build System  │  │ Package Manager │  │ Project Manager │      │
│  │                 │  │                 │  │                 │      │
│  │  • Resolves     │  │  • Downloads    │  │  • Creates      │      │
│  │    dependencies │  │    crates from  │  │    projects     │      │
│  │  • Invokes      │  │    crates.io    │  │  • Runs tests   │      │
│  │    rustc with   │  │  • Manages      │  │  • Generates    │      │
│  │    correct      │  │    version      │  │    docs         │      │
│  │    flags        │  │    resolution   │  │  • Formats code │      │
│  │  • Manages      │  │  • Handles      │  │  • Lints code   │      │
│  │    incremental  │  │    caching      │  │  • Runs bench   │      │
│  │    builds       │  │                 │  │  • Publish      │      │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘      │
│                                                                     │
│                            Orchestration Layer                      │
│                                                                     │
│  cargo build  →   ┌───────────────────────────────────────────┐     │
│  cargo test   →   │  Determine what needs to be rebuilt       │     │
│  cargo run    →   │  Resolve dependencies and versions        │     │
│  cargo check  →   │  Invoke rustc with correct flags          │     │
│  cargo fmt    →   │  Run rustfmt/clippy/doc                   │     │
│  cargo clippy →   │  Report results to the user               │     │
│  cargo doc    →   └───────────────────────────────────────────┘     │ 
└─────────────────────────────────────────────────────────────────────┘
```

**The important nuance:** Cargo's orchestrator role means you can replace or customise any part of the toolchain. You can use a different linker (`-C linker`), a different compiler (with `rustc` directly), or different formatter settings (via `rustfmt.toml`). Cargo does not hardcode the tools; it provides a consistent interface to them.

### The Rust Toolchain

The Rust toolchain is a collection of tools that work together:

```
┌─────────────────────────────────────────────────────────────┐
│                        rustup                               │
│                   (Toolchain Manager)                       │
│                                                             │
│   ┌─────────────────────────────────────────────────┐       │
│   │                  rustc                          │       │
│   │         (Compiler & Language Core)              │       │
│   └─────────────────────────────────────────────────┘       │
│                                                             │
│   ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌─────────┐  │
│   │   cargo   │  │  rustfmt  │  │  clippy   │  │ rustdoc │  │
│   │  (Build)  │  │ (Format)  │  │  (Lint)   │  │  (Docs) │  │
│   └───────────┘  └───────────┘  └───────────┘  └─────────┘  │
│                                                             │
│   ┌───────────┐  ┌───────────┐                              │
│   │ rust-     │  │   Miri    │                              │
│   │ analyzer  │  │ (UB Check)│                              │
│   │  (IDE)    │  └───────────┘                              │
│   └───────────┘                                             │
└─────────────────────────────────────────────────────────────┘
```

**rustup:** Installs and manages Rust toolchains. You can have multiple Rust versions installed and switch between them.

**rustc:** The Rust compiler. Transforms your `.rs` files into machine code.

**cargo:** Build system, package manager, and project manager.

**rustfmt:** Automatic code formatter. Enforces consistent style across projects.

**clippy:** Linter that catches common mistakes, performance issues, and anti-patterns.

**rustdoc:** Generates documentation from your code comments.

**rust-analyzer:** Provides IDE features like autocomplete, go-to-definition, and inline errors.

:::historical-context

**Where Cargo came from.**

Before Cargo, Rust used `rustc` directly, much like C uses `gcc`. Project structure was ad-hoc. Dependencies were manually downloaded and placed in `src/`. Version conflicts were common. Build systems were custom scripts.

Cargo was created to solve these problems by providing:
1. A standardised project structure.
2. A consistent build command.
3. Automated dependency management.
4. Semantic versioning for libraries.
5. A centralised registry (`crates.io`).

**The result:** Rust became significantly easier to adopt. You do not need to understand the compiler's command-line flags to build a project. You just run `cargo build`.

:::

:::worked-example

## Building a Working Rust Environment

Let's build a working Rust environment from scratch and understand each step.

### Step 1: Verify the Toolchain

**First, check what is installed:**

```bash
$ which rustc
/home/maya/.cargo/bin/rustc

$ rustc --version
rustc 1.79.0 (129f3b996 2024-06-10)

$ which cargo
/home/maya/.cargo/bin/cargo

$ cargo --version
cargo 1.79.0 (c72d1ff62 2024-06-07)

$ which rustfmt
/home/maya/.cargo/bin/rustfmt

$ rustfmt --version
rustfmt 1.7.0-nightly

$ which clippy-driver
/home/maya/.cargo/bin/clippy-driver
```

**What is happening here:**

- `which` tells you which executable will run when you type a command.
- The shell searches `$PATH` in order.
- All Rust tools are in `~/.cargo/bin`, which was added to `$PATH` during installation.
- Each tool has a `--version` flag to verify it is working.

:::engineering-note

If `rustc --version` fails, you have encountered a `PATH` problem. Common fixes:
1. Add `~/.cargo/bin` to `PATH` in your shell configuration (`.bashrc`, `.zshrc`, etc.)
2. Or re-run the rustup installation script, which handles PATH configuration.

:::

### Step 2: Create a Project and Explore Cargo's Structure

```bash
$ cargo new hello-toolchain
Created binary (application) `hello-toolchain` package

$ cd hello-toolchain

$ tree
.
├── Cargo.toml
└── src
    └── main.rs

1 directory, 2 files
```

**What just happened:**

- `cargo new` created a complete Rust project.
- The project uses Cargo's standard structure: source code goes in `src/`.
- `Cargo.toml` is the project manifest. It contains metadata and dependencies.

**Examine Cargo.toml:**

```bash
$ cat Cargo.toml
[package]
name = "hello-toolchain"
version = "0.1.0"
edition = "2024"

[dependencies]
```

This is TOML format—Rust's preferred configuration language. The `[package]` section contains project metadata. The `[dependencies]` section is where external crates would be listed.

**Examine main.rs:**

```bash
$ cat src/main.rs
fn main() {
    println!("Hello, world!");
}
```

It is the same "Hello, world!" program from Day 1, now organised into the Cargo structure.

### Step 3: Build Without Running

```bash
$ cargo check
    Checking hello-toolchain v0.1.0 (/home/maya/projects/hello-toolchain)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.33s
```

**Why `cargo check` instead of `cargo build`?**

- `cargo check` only compiles, proving the code is syntactically valid.
- It does not generate a binary, making it significantly faster.
- Used by professionals constantly during development (some run it after every save).
- It is essentially "does my code make sense to the compiler?"

:::engineering-note

`cargo check` skips the code generation and optimisation phases of compilation. This is why it is faster—it stops after type checking and borrow checking, which are the parts most likely to produce errors during development.

:::

### Step 4: Build and Run

```bash
$ cargo build
   Compiling hello-toolchain v0.1.0 (/home/maya/projects/hello-toolchain)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.85s

$ ./target/debug/hello-toolchain
Hello, world!
```

**What happened under the hood:**
1. Cargo read `Cargo.toml`.
2. Cargo invoked `rustc` with appropriate flags.
3. `rustc` compiled your source into an executable.
4. The executable was placed in `target/debug/`.
5. You manually ran the executable.

**The difference:** `cargo run` combines steps 4 and 5:

```bash
$ cargo run
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.00s
     Running `target/debug/hello-toolchain`
Hello, world!
```

`cargo run` is the most common development workflow command.

### Step 5: Format and Lint Your Code

```bash
# Format the code
$ cargo fmt

# Check for lint warnings
$ cargo clippy
    Checking hello-toolchain v0.1.0 (/home/maya/projects/hello-toolchain)
warning: unused variable: `x`
 --> src/main.rs:1:9
  |
1 | let x = 5;
  |     ^ help: if this is intentional, prefix it with an underscore: `_x`
  |
  = note: `#[warn(unused_variables)]` on by default
```

**What `cargo fmt` did:**

It rewrote `main.rs` to follow Rust's official style guidelines:
- Spaces, not tabs.
- Four-space indentation.
- Opening braces on the same line.
- Consistent spacing around operators.

**What `cargo clippy` does:**

Clippy is a linter. It catches:
- Common mistakes (like unused variables)
- Performance anti-patterns (like unnecessary allocations)
- Style issues beyond what `fmt` handles
- Security concerns
- Code that could be simplified

**Professional workflow:** Most Rustaceans run:
1. `cargo check` to verify syntax.
2. `cargo fmt` to format before committing.
3. `cargo clippy` to catch issues.
4. `cargo test` to verify behaviour (coming in later phases).

This is the "build-test-lint" cycle that professional Rust teams use.

### Step 6: View Your Project's Documentation

```bash
$ cargo doc --open
 Documenting hello-toolchain v0.1.0 (/home/maya/projects/hello-toolchain)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.45s
 Opening /home/maya/projects/hello-toolchain/target/doc/hello_toolchain/index.html
```

`cargo doc` generates HTML documentation from your code comments. The `--open` flag opens it in your browser.

**This is how you read documentation for any Rust crate.** When you are using an external library, running `cargo doc --open` will generate documentation for that library as well, making it accessible offline.

### Step 7: Initialise a Git Repository (If Not Already Done)

```bash
$ git init
Initialised empty Git repository in /home/maya/projects/hello-toolchain/.git/

$ git status
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
    Cargo.toml
    src/

nothing added to commit but untracked files present (use "git add" to track)
```

**What is happening:**

- `git init` creates a new Git repository in the current directory.
- The repository is stored in the hidden `.git/` directory.
- `git status` shows that no commits exist yet, and no files are being tracked.

**The .gitignore file:**

```bash
$ cat .gitignore
/target
```

This tells Git to ignore the `target/` directory. `target/` contains compiled binaries, which should never be committed—they are generated from the source code and take up significant space.

### Step 8: Make Your First Commit

```bash
$ git add Cargo.toml src/
$ git status
On branch main

No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
    new file:   Cargo.toml
    new file:   src/main.rs

$ git commit -m "Initial commit: hello-toolchain project"
[main (root-commit) 3b7a5d2] Initial commit: hello-toolchain project
 2 files changed, 8 insertions(+)
 create mode 100644 Cargo.toml
 create mode 100644 src/main.rs
```

**What each command does:**

| Command | What it does | Why it is important |
|---|---|---|
| `git add` | Moves changes from Working Tree to Staging Area | You decide exactly what goes into each commit |
| `git commit` | Creates a permanent snapshot of the staging area | Each commit is an immutable point in history |
| `git status` | Shows what's staged, unstaged, and untracked | Always check before committing to avoid mistakes |

**The commit message:** `"Initial commit: hello-toolchain project"`

This follows the format:
- `[type]: [subject]` (subject line, under 50 characters)
- `[blank line]`
- `[optional body with more detail]`

:::engineering-note

**Commit messages are for humans, not computers.** A commit message like `"fix"` is useless to anyone reading the history. `"fix: prevent panic on empty input in parse_line"` tells the reader exactly what problem the change solves. This is why Phase 0 establishes this discipline early—before you have written a single line of production Rust, you are already learning to write commit messages that tell the real story of your code's evolution.

:::

:::

:::compiler-thinking

**Prediction 1:**

Given this environment:

```bash
$ echo $PATH
/usr/local/bin:/usr/bin:/bin
$ which rustc
rustc not found
$ cargo build
```

Will Cargo build the project? Why or why not?

<details>
<summary>Answer</summary>

No. Cargo invokes `rustc` internally, and `rustc` must be in `$PATH` or set explicitly via configuration. The `cargo` command itself may be found, but it will fail when it tries to call `rustc`.
</details>

---

**Prediction 2:**

Given this command:

```bash
$ find . -name "*.rs" | xargs grep "fn main"
```

What does this command do? Break it down step by step.

<details>
<summary>Answer</summary>

1. `find . -name "*.rs"` finds all `.rs` files recursively in the current directory.
2. `xargs grep "fn main"` passes the filenames to `grep`, which searches each file for the literal string `"fn main"`.
3. The result is a list of all lines containing `"fn main"` across all Rust files, with filenames.
</details>

---

**Prediction 3:**

```bash
$ rustc main.rs 2> errors.log
```

What is happening to stdout and stderr?

<details>
<summary>Answer</summary>

stdout goes to the terminal (unless redirected). stderr is redirected to `errors.log`. This is a common pattern when the normal output is wanted separately from the errors.
</details>

---

**Prediction 4:**

```bash
$ git log --oneline
abc1234 (HEAD -> main) fix: prevent panic on empty input
def5678 feat: add parse_line function
789abcd Initial commit: hello-toolchain project
```

If you run `git checkout def5678`, which commit are you moving to? What happens to the `main` branch?

<details>
<summary>Answer</summary>

You are moving to the commit `def5678`, which is the second commit in the history. The `main` branch pointer stays at `abc1234`; you are in a "detached HEAD" state. This is useful for inspecting old code. To return to the latest commit, run `git checkout main`.
</details>

:::

:::mini-challenge

### Challenge 1 — Navigate and Inspect

Open a terminal and navigate to your home directory. Then:

1. Create a new directory called `rust-learning`.
2. Change into it.
3. Create a subdirectory called `projects`.
4. List all directories recursively.
5. Find the absolute path of the current directory.
6. List all `.rs` files anywhere in your home directory.

**Expected output:**

```bash
$ cd ~
$ mkdir -p rust-learning/projects
$ cd rust-learning
$ ls -R
.:
projects

./projects:
$ pwd
/home/maya/rust-learning
$ find ~ -name "*.rs"
... (output depends on what's in your home directory)
```

### Challenge 2 — Chain Commands

Without using temporary files:

1. List all Rust files in the current directory and its subdirectories.
2. Count the total number of lines in all Rust files combined.

**Hint:** Use `find`, `xargs`, `cat`, and `wc`.

<details>
<summary>Hint</summary>

The command is:

```bash
find . -name "*.rs" | xargs cat | wc -l
```

But this assumes filenames without spaces. A more robust version:

```bash
find . -name "*.rs" -print0 | xargs -0 cat | wc -l
```
</details>

### Challenge 3 — Git Workflow

1. Create a new Cargo project.
2. Make two meaningful commits:
   - First commit with the initial Cargo-generated code.
   - Second commit with a small change (e.g., print a different message).
3. Use `git log --oneline` to see the commit history.

```bash
$ cargo new git-practice
$ cd git-practice
$ git add .
$ git commit -m "Initial commit: git-practice project"
$ echo 'println!("Hello, Rust!");' > src/main.rs
$ git add src/main.rs
$ git commit -m "feat: update greeting message"
$ git log --oneline
```

:::

:::reflection

Write the answer to this question in a text file called `reflection-day2.md` in your `hello_reec` directory. Commit it.

**Question:**

"You are going to work on a large Rust project for the next six months. Two other engineers will join you in month three. Why does it matter that you use Git from the very beginning—even when you are the only person working on the code—and what would a commit history that tells the real story of development look like versus one that just says 'update' repeatedly?"

<details>
<summary>Reflection Guidance</summary>

Using Git from the beginning matters because a repository's history is the only record of why decisions were made. When new engineers join, they need to understand not just what the code does, but how it got there. A commit history with messages like "update" tells them nothing; a history with messages like "refactor: extract validation logic into separate module to simplify testing" tells them the reasoning behind the structure. It is much harder to reconstruct this reasoning after the fact—the person who made the decision may not remember, or may no longer be on the team.

A commit history that tells the real story has:
- Each commit representing one logical change (not a grab-bag of unrelated fixes).
- Commit messages that explain what was changed and why.
- A linear or mostly-linear history that is easy to follow.
- No commits that break the build or tests.

A history that merely says "update" is indistinguishable from a random sequence of snapshots—it provides no insight into the engineering process.
</details>

:::

## End of Day 2

### What You Have Accomplished

By the end of this session, you have:

- **Installed and verified the Rust toolchain** (rustc, cargo, rustfmt, clippy).
- **Understood the Unix philosophy** of small, composable tools.
- **Navigated the filesystem** and understood absolute vs. relative paths.
- **Worked with stdin, stdout, and stderr**—the fundamental Unix I/O model.
- **Used pipes to compose tools** into powerful data pipelines.
- **Learned Git's mental model**—working tree, staging area, commit, history.
- **Created your first Git commits** with meaningful commit messages.
- **Explored Cargo's architecture** as an orchestrator, not just a compiler.
- **Set up a complete professional Rust development environment.**

### What This Builds Toward

Day 2 ends with a fully configured, version-controlled Rust environment. Your toolchain is working. Your Git repository is initialised. Your `.gitignore` is configured.

**The engineering habit to carry forward:** Before you write a line of code, initialise a Git repository. Before you commit, ask yourself: "Does this commit represent one logical change? Does the message explain why I made this change?" This habit will serve you for your entire career—not because Git is special, but because disciplined history-keeping is one of the few practices that separates professional engineering from hobbyist tinkering.

**Tomorrow, Day 3, begins the journey into the binary interface—how CPUs actually execute your code.** We will look at:

- **Assembly language** as the human-readable form of machine code.
- **Registers, memory addressing, and instructions.**
- **How Rust's high-level abstractions map to CPU instructions.**
- **Why understanding the hardware matters for systems programming.**

You have learned *what* Rust is and *how* to work with it. Tomorrow, you will understand *how it actually runs*.

Take 5-10 minutes to rest your mind. Then, you are ready to dig into the binary interface—the lowest level of abstraction this curriculum will ever force you to touch, and the foundation everything else is built on.
