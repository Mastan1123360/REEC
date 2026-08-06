---
id: P1-W5-D3
phase: 1
week: 5
day: 3
title: 'Traits and Generics: Sharing Behaviour Across Types'
subtitle: Writing code that works with multiple types through abstraction
estimated_time: 75
difficulty: Intermediate
learning_objectives:
  - Explain what traits are and why they exist
  - Define traits with method signatures
  - Implement traits on custom types
  - Use generic functions with trait bounds
  - Understand monomorphization and why generics have no runtime cost
  - Use the impl Trait syntax for parameters and return types
  - 'Apply traits to build flexible, reusable code'
widgets:
  - story
  - mental-model
  - worked-example
  - engineering-note
  - compiler-thinking
  - mini-challenge
  - reflection
project:
  - Task Tracker v1 (planning continued)
failure_lab: null
reading:
  - >-
    The Rust Programming Language, Chapter 10 (Generic Types, Traits, and
    Lifetimes) — introductory sections
  - >-
    REEC-05-Phase1-RustFoundations.md §1.3.8 (Traits and Generics — First
    Contact)
tags:
  - traits
  - generics
  - trait-bounds
  - abstraction
  - monomorphization
next: P1-W5-D4
previous: P1-W5-D2
published: true
---

:::story

## The Developer Who Wrote Too Much Code

A developer—call him David—was building a media aggregator. He needed to display summaries of different types of content: news articles, social posts, and videos.

He wrote a `summarize` function for each type:

```rust
fn summarize_article(article: &NewsArticle) -> String {
    format!("{}, by {} ({})", article.headline, article.author, article.location)
}

fn summarize_post(post: &SocialPost) -> String {
    format!("{}: {}", post.username, post.content)
}

fn summarize_video(video: &Video) -> String {
    format!("{} ({} views)", video.title, video.views)
}
```

The code worked. But it was repetitive. Every time he added a new content type, he had to write another function. Every time he changed the summary format, he had to update multiple functions.

He showed the code to a senior engineer.

"You're doing it wrong," the senior said. "You're writing the same pattern over and over. This is what traits are for."

The senior refactored:

```rust
trait Summarize {
    fn summarize(&self) -> String;
}

impl Summarize for NewsArticle {
    fn summarize(&self) -> String {
        format!("{}, by {} ({})", self.headline, self.author, self.location)
    }
}

impl Summarize for SocialPost {
    fn summarize(&self) -> String {
        format!("{}: {}", self.username, self.content)
    }
}
```

Now David could write one function that works with any type that implements `Summarize`:

```rust
fn print_summary<T: Summarize>(item: &T) {
    println!("{}", item.summarize());
}
```

Suddenly, his code was much cleaner. Adding a new content type was easy: just implement `Summarize` for it. The pattern was captured in the trait.

David learned a lesson: traits are not just about code organisation. They are about capturing patterns and making code reusable.

Today, you learn to use traits and generics.

:::

:::mental-model

Before we dive into traits and generics, internalise these three mental models. They reframe abstraction from a convenience into a fundamental engineering tool.

**Mental Model 1 — A trait is a contract that types can fulfil.**

When you define a trait, you are defining a set of behaviours that a type can implement. The trait is a contract: "If you implement this trait, you promise to provide these methods."

This is similar to interfaces in other languages, but traits are more flexible. They can be implemented for any type, including types from external crates.

**Mental Model 2 — Generics let you write code that works with many types.**

A generic function is a template. You write the code once, and the compiler generates versions for each concrete type you use.

This is not like dynamic typing. The compiler generates specialised code for each type (monomorphisation). There is no runtime overhead—generics are a zero-cost abstraction.

**Mental Model 3 — Trait bounds constrain generics.**

When you define a generic function, you need to tell the compiler what operations you need from the type. This is done with trait bounds.

`fn print_summary<T: Summarize>(item: &T)` says: "This function works with any type `T` that implements `Summarize`."

Without the trait bound, you couldn't call `item.summarize()`—the compiler wouldn't know that `summarize` exists.

:::

## Theory

### Traits: Shared Behaviour

A trait defines a set of methods that types can implement.

**Defining a trait:**

```rust
trait Summarize {
    fn summarize(&self) -> String;
}
```

**Implementing a trait:**

```rust
struct NewsArticle {
    headline: String,
    author: String,
    location: String,
    content: String,
}

impl Summarize for NewsArticle {
    fn summarize(&self) -> String {
        format!("{}, by {} ({})", self.headline, self.author, self.location)
    }
}

struct SocialPost {
    username: String,
    content: String,
}

impl Summarize for SocialPost {
    fn summarize(&self) -> String {
        format!("{}: {}", self.username, self.content)
    }
}
```

### Default Implementations

Traits can provide default implementations:

```rust
trait Summarize {
    fn summarize(&self) -> String {
        String::from("(Read more...)")
    }
}
```

Types can override the default:

```rust
impl Summarize for NewsArticle {
    fn summarize(&self) -> String {
        format!("{}, by {} ({})", self.headline, self.author, self.location)
    }
}
```

### Using Traits as Parameters

**With `impl Trait` syntax:**

```rust
fn print_summary(item: &impl Summarize) {
    println!("{}", item.summarize());
}
```

**With generic syntax:**

```rust
fn print_summary<T: Summarize>(item: &T) {
    println!("{}", item.summarize());
}
```

**With multiple trait bounds:**

```rust
fn process<T: Summarize + Display>(item: &T) {
    println!("Summary: {}", item.summarize());
    println!("Display: {}", item);
}
```

### Generic Functions

Generics let you write functions that work with multiple types:

```rust
fn largest<T: PartialOrd>(list: &[T]) -> &T {
    let mut largest = &list[0];
    for item in list {
        if item > largest {
            largest = item;
        }
    }
    largest
}
```

The `PartialOrd` trait bound ensures that the values can be compared.

### Generic Structs

```rust
struct Point<T> {
    x: T,
    y: T,
}

impl<T> Point<T> {
    fn new(x: T, y: T) -> Self {
        Point { x, y }
    }
}
```

### Multiple Generics

```rust
struct Pair<T, U> {
    first: T,
    second: U,
}
```

### Monomorphization

Generics are zero-cost abstractions. The compiler generates specialised versions for each concrete type:

```rust
let p1 = Point { x: 5, y: 10 }; // Point<i32>
let p2 = Point { x: 1.0, y: 4.0 }; // Point<f64>
```

The compiler generates two versions of `Point`: one for `i32` and one for `f64`. This is monomorphization.

There is no runtime cost. Generics in Rust are as fast as writing the code for each type manually.

### Trait Bounds and Where Clauses

For complex trait bounds, use the `where` clause:

```rust
fn process<T, U>(t: &T, u: &U) -> String
where
    T: Summarize + Display,
    U: Summarize + Clone,
{
    // ...
}
```

### Returning Types That Implement a Trait

```rust
fn returns_summarizable() -> impl Summarize {
    SocialPost {
        username: String::from("horse_ebooks"),
        content: String::from("unfortunately, ..."),
    }
}
```

**Important:** `impl Trait` in return position only works when you return a single concrete type.

---

## Worked Example

### Building a Media Aggregator

Let's build a media aggregator using traits.

```rust
trait Summarize {
    fn summarize(&self) -> String;
}

#[derive(Debug)]
struct NewsArticle {
    headline: String,
    author: String,
    location: String,
    content: String,
}

impl Summarize for NewsArticle {
    fn summarize(&self) -> String {
        format!("{}, by {} ({})", self.headline, self.author, self.location)
    }
}

#[derive(Debug)]
struct SocialPost {
    username: String,
    content: String,
    reply: bool,
}

impl Summarize for SocialPost {
    fn summarize(&self) -> String {
        format!("{}: {}", self.username, self.content)
    }
}

#[derive(Debug)]
struct Video {
    title: String,
    views: u64,
}

impl Summarize for Video {
    fn summarize(&self) -> String {
        format!("{} ({} views)", self.title, self.views)
    }
}

fn print_summary(item: &impl Summarize) {
    println!("{}", item.summarize());
}

fn main() {
    let article = NewsArticle {
        headline: "Rust 2024 Released".to_string(),
        author: "Jane Doe".to_string(),
        location: "San Francisco".to_string(),
        content: "Rust 2024 includes many improvements...".to_string(),
    };

    let post = SocialPost {
        username: "alice".to_string(),
        content: "I love Rust!".to_string(),
        reply: false,
    };

    let video = Video {
        title: "Rust Tutorial".to_string(),
        views: 1000,
    };

    print_summary(&article);
    print_summary(&post);
    print_summary(&video);
}
```

### Using Generic Structs with Traits

```rust
struct MediaItem<T: Summarize> {
    item: T,
    published_at: String,
}

impl<T: Summarize> MediaItem<T> {
    fn new(item: T, published_at: String) -> Self {
        MediaItem { item, published_at }
    }

    fn display(&self) -> String {
        format!("{} ({}): {}", self.published_at, self.item.summarize())
    }
}
```

### Using Trait Objects

Trait objects allow dynamic dispatch:

```rust
fn main() {
    let items: Vec<Box<dyn Summarize>> = vec![
        Box::new(article),
        Box::new(post),
        Box::new(video),
    ];

    for item in &items {
        println!("{}", item.summarize());
    }
}
```

---

## Engineering Notes

### Engineering Note: Traits vs. Inheritance

Traits are different from inheritance:

- **Inheritance** is about "is-a" relationships. A `Dog` is an `Animal`. This is fixed at compile time.

- **Traits** are about "can-do" relationships. A `Dog` can `Run`. A `Bird` can `Fly`. A type can implement multiple traits.

Traits are more flexible and more composable than inheritance. They avoid the problems of deep class hierarchies.

### Engineering Note: When to Use Generic Functions

Write a generic function when:

- The logic is the same for different types.
- You want the code to be reusable.
- You want to avoid duplication.

Don't use generics when:

- The types are fundamentally different.
- The logic differs significantly.

### Engineering Note: The Zero-Cost Abstraction

Generics in Rust are a zero-cost abstraction. The compiler generates specialised code for each concrete type. There is no runtime overhead.

This is different from dynamic dispatch (trait objects), which has a small runtime cost.

---

## Compiler Thinking

**Prediction 1:**

Will this code compile?

```rust
trait Summarize {
    fn summarize(&self) -> String;
}

fn print_summary(item: &impl Summarize) {
    println!("{}", item.summarize());
}
```

<details>
<summary>Answer</summary>

**Yes.** The `impl Summarize` syntax is shorthand for a generic function with a trait bound.

</details>

---

**Prediction 2:**

Will this code compile?

```rust
trait Summarize {
    fn summarize(&self) -> String;
}

fn returns_summarizable() -> impl Summarize {
    let article = NewsArticle { ... };
    let post = SocialPost { ... };
    if condition {
        article
    } else {
        post
    }
}
```

<details>
<summary>Answer</summary>

**No.** `impl Trait` in return position can only return a single concrete type. Returning two different types is not allowed.

If you need to return different types, use a trait object: `Box<dyn Summarize>`.

</details>

---

**Prediction 3:**

Will this code compile?

```rust
fn largest<T>(list: &[T]) -> &T {
    let mut largest = &list[0];
    for item in list {
        if item > largest {
            largest = item;
        }
    }
    largest
}
```

<details>
<summary>Answer</summary>

**No.** The `>` operator requires that `T` implements `PartialOrd`. The compiler will complain:

```
error[E0369]: binary operation `>` cannot be applied to type `&T`
```

The fix is to add a trait bound: `fn largest<T: PartialOrd>(list: &[T]) -> &T`.

</details>

---

**Prediction 4:**

What does monomorphization mean?

<details>
<summary>Answer</summary>

Monomorphization is the process of generating specialised versions of generic code for each concrete type that is used.

For example, if you use `Point<i32>` and `Point<f64>`, the compiler generates two versions of the `Point` struct and its methods—one for `i32` and one for `f64`.

This is why generics have no runtime cost in Rust. The compiler does the work at compile time.

</details>

---

## Mini Challenge

### Challenge 1 — Define a Trait

Define a trait called `Printable` with a method `print(&self)` that prints the value to the console.

### Challenge 2 — Implement the Trait

Implement `Printable` for `i32`, `String`, and a custom struct.

### Challenge 3 — Generic Function

Write a generic function `print_all<T: Printable>(items: &[T])` that prints all items in a slice.

### Challenge 4 — Multiple Trait Bounds

Write a function that takes a type that implements both `Printable` and `Debug`. Print the value using both traits.

---

## Reflection

Write the answer to this question in a text file called `reflection-phase1-w5-d3.md` in your Phase 1 repository. Commit it.

**Question:**

"Traits and generics are powerful tools for writing reusable code. But they are more than just convenience features—they are a form of engineering discipline. How do traits and generics help you write code that is both more reusable and more maintainable? Compare this to writing the same logic for each type manually."

<details>
<summary>Reflection Guidance</summary>

Traits and generics help you write reusable code by capturing patterns:

- **Reusability:** Write the logic once, use it with many types.
- **Maintainability:** Change the logic in one place, not many.
- **Type safety:** The compiler checks that the types you use satisfy the trait bounds.

Without traits and generics, you would write the same logic for each type. This is error-prone—you might forget to update a function when the logic changes. It is also tedious—you write the same pattern over and over.

With traits and generics, you capture the pattern once. You define the behaviour (the trait) and the types that have that behaviour (the implementations). The generic function works with any type that implements the trait.

The engineering discipline is: "Write code once. Reuse it everywhere."

</details>

---

## End of Day 3, Week 5

### What You Have Accomplished

By the end of this session, you have:

- **Learned what traits are** and how they define shared behaviour.
- **Implemented traits on custom types.**
- **Used generic functions with trait bounds.**
- **Learned about monomorphization** and zero-cost abstractions.
- **Used `impl Trait` syntax** for parameters and return types.
- **Applied traits to build reusable, flexible code.**

### What This Builds Toward

Tomorrow, you will design the Task Tracker v1—the first Major project of Phase 1.

**Week 5, Day 4 — Architecture Discussion: Task Tracker v1**

You will:
- Design the data model (`Task`, `TaskStatus`, `TaskList`).
- Define the public interface.
- Plan the REPL loop.
- Apply all the concepts you have learned so far.

The Task Tracker v1 is the culmination of Phase 1. Everything you have learned will come together in this project.

### The Engineering Habit to Carry Forward

When you see a pattern repeating across types, ask yourself:
1. Can I capture this pattern as a trait?
2. Can I write a generic function that works with any type that implements the trait?
3. Would this make my code more reusable and maintainable?

This is the discipline of abstraction. It is what separates code that works from code that scales.

Rest well. Tomorrow, you design your first Major project.
