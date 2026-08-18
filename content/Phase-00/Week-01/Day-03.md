---
id: P0-W1-D3
phase: 0
week: 1
day: 3
title: 'The Binary Interface: How CPUs Execute Instructions'
subtitle: 'Understanding assembly, registers, and the machine beneath the abstraction'
estimated_time: 90
difficulty: Beginner
learning_objectives:
  - 'Explain the role of the CPU, registers, and memory in program execution'
  - >-
    Distinguish between machine code, assembly language, and high-level source
    code
  - >-
    Identify the key components of a CPU instruction (opcode, operands,
    addressing modes)
  - Read and interpret simple assembly language instructions
  - Trace the execution of a small program at the instruction level
  - Understand how Rust's abstractions map to CPU instructions
  - Explain why understanding the ISA matters for performance and debugging
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
  - 'Computer Systems: A Programmer''s Perspective, Chapter 3 (Program Encoding)'
tags:
  - assembly
  - cpu
  - registers
  - instruction-set
  - machine-code
  - isa
next: P0-W1-D4
previous: P0-W1-D2
published: true
---

:::story

## The Debug Session That Changed Everything

A developer—call him Alex—had been writing Rust for about a year. He was productive, his code compiled, and his tests passed. But he had never looked at assembly language. He had never needed to.

Then a performance bug appeared.

A function that should have been fast was taking ten times longer than expected. The profiler pointed to a single hot loop, but the Rust code looked innocent—just a few arithmetic operations and a match statement. Alex had no idea why it was slow.

A senior engineer walked over and said: "Show me the assembly."

Alex had to confess: "I don't know how."

The senior engineer opened the generated assembly, pointed to a single instruction, and said: "That's a division. The CPU can't do it in one cycle. It takes 20-30 cycles. You're dividing inside the loop. The compiler can't optimize it out."

Alex looked at the Rust code. There was no division operator. The division came from a seemingly harmless `%` (modulo) operation on a value that wasn't a power of two. The compiler had to generate a division instruction. The code was correct—but it was slow.

The fix was simple: replace the modulo with a different algorithm that avoided division. The function became fast. But the real lesson was deeper:

**Without understanding what the CPU actually does, you cannot reason about performance. You are guessing.**

This is not about becoming an assembly programmer. It is about understanding the machine enough to know when you need to care, and what questions to ask when something doesn't behave as expected.

Today, you develop that understanding.

:::

:::mental-model

Before we dive into the details, internalise these three mental models. They are the foundation for everything that follows.

**Mental Model 1 — The CPU is a simple machine that executes instructions sequentially.**

The CPU does not understand functions, objects, closures, or iterators. It understands a simple sequence of instructions: add, subtract, move data, compare, jump. Every programming language abstraction—if statements, loops, function calls, even Rust's ownership and borrowing—is compiled down to this small set of operations.

The power of computers comes not from the complexity of the CPU, but from the speed with which it executes these simple operations. A modern CPU can execute billions of instructions per second. The abstractions we build on top of them are for our benefit, not the machine's.

**Mental Model 2 — Instructions and data are both bytes.**

This is the von Neumann architecture: code and data share the same memory. The bytes at address `0x401000` might be a machine instruction. The bytes at address `0x401001` might be part of that instruction's encoding. The bytes at `0x600000` might be a variable.

The distinction between "code" and "data" exists only at the level of how the bytes are used. The hardware does not know—or care—which bytes are instructions and which are data. It only knows what it is told to do with them. This is why buffer overflows can execute arbitrary code: an attacker writes data to a buffer, and if that buffer is on the stack adjacent to a return address, the CPU can be tricked into jumping to the data and executing it as instructions.

**Mental Model 3 — Every instruction is a tradeoff between generality and speed.**

Some instructions are simple and fast: move a value from one register to another, add two registers, compare two values. Other instructions are complex and slow: division, trigonometric functions, string operations.

The compiler's job is to choose the right instructions for your code. You can influence this choice by writing code in a way that maps naturally to the CPU. When you write `x * 2`, the compiler can use a fast shift operation. When you write `x * 3`, the compiler must use a slower multiplication. The difference is tiny in isolation but can be massive in a loop that runs millions of times.

:::

## Theory

### The CPU and Its Registers

The CPU (Central Processing Unit) is the brain of the computer. It executes instructions stored in memory. Its core components are:

```
┌─────────────────────────────────────────────────────────┐
│                           CPU                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │                    Control Unit                   |  │
│  │  • Decodes instructions from memory               |  │
│  │  • Coordinates execution                          |  │
│  │  • Manages the instruction pipeline               |  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │                    Registers                      |  │
│  │                                                   |  │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  |  │
│  │  │ RAX │ │ RBX │ │ RCX │ │ RDX │ │ RSI │ │ RDI │  |  │
│  │  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘  |  │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  |  |
│  │  │ RSP │ │ RBP │ │ R8  │ │ R9  │ │ R10 │ │ ... │  |  │
│  │  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘  |  │
│  │                                                   |  │
│  │  • Fastest storage in the system                  |  │
│  │  • Used for temporary values, function arguments  |  │
│  │  • Fixed size: 64 bits on x86-64                  |  │
│  └───────────────────────────────────────────────────┘  |
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │                    ALU                            │  │
│  │  (Arithmetic Logic Unit)                          │  │
│  │                                                   │  │
│  │  • Performs arithmetic: +, -, *, /                │  │
│  │  • Performs logic: AND, OR, XOR, NOT              │  │
│  │  • Performs comparisons: <, >, ==                 │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         |
│  ┌───────────────────────────────────────────────────┐  │
│  │                    Memory Interface               │  │
│  │                                                   │  |
│  │  • Reads instructions from memory                 │  │
│  │  • Reads/writes data to/from memory               │  |
│  │  • Much slower than registers                     │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Registers** are the CPU's internal storage. They are incredibly fast—accessing a register is effectively instantaneous. But there are only a small number of them (typically 16 general-purpose registers on x86-64).

**Memory** is where all program data lives. It is larger but much slower—accessing memory can take hundreds of cycles.

**The performance gap:** The CPU can execute instructions while waiting for memory. This is why caching is so important.

### Instructions: The CPU's Language

Every CPU has an **Instruction Set Architecture (ISA)** —a set of instructions it understands. x86-64 (used by most desktops and servers) has thousands of instructions. But they all fall into a few categories:

| Category | Purpose | Examples |
|---|---|---|
| **Data Movement** | Copy data between registers and memory | `MOV`, `PUSH`, `POP`, `LEA` |
| **Arithmetic** | Add, subtract, multiply, divide | `ADD`, `SUB`, `MUL`, `DIV` |
| **Logic** | AND, OR, XOR, shift | `AND`, `OR`, `XOR`, `SHL`, `SHR` |
| **Control Flow** | Jump, call, return | `JMP`, `CALL`, `RET`, `JE`, `JNE` |
| **Comparison** | Compare values | `CMP`, `TEST` |

Each instruction has a **mnemonic** (human-readable name), and **operands** (the values it operates on):

```
ADD   RAX,  RBX     ; Add RBX to RAX, store result in RAX
MOV   [RSP+8], RAX  ; Move RAX to memory at address RSP+8
CMP   RAX, 10       ; Compare RAX with the number 10
JE    label         ; Jump to 'label' if the comparison was equal
```

### Instruction Encoding

Instructions are encoded as bytes. The CPU reads these bytes and interprets them.

```
Example: ADD RAX, RBX
The instruction ADD RAX, RBX might be encoded as:
0x48 0x01 0xD8

This is not a string. It is three bytes:
- 0x48: REX prefix (indicates 64-bit operation)
- 0x01: ADD opcode
- 0xD8: ModRM byte (encodes RAX as destination, RBX as source)
```

**The key insight:** Assembly language is not what the CPU executes. It is a human-readable representation of the machine code bytes. The CPU executes the bytes.

### Addressing Modes

Instructions refer to data in different ways:

| Mode | Example | Meaning |
|---|---|---|
| **Immediate** | `MOV RAX, 5` | Use the value 5 directly (encoded in the instruction) |
| **Register** | `MOV RAX, RBX` | Use the value in the RBX register |
| **Direct** | `MOV RAX, [0x401000]` | Use the value at memory address 0x401000 |
| **Indirect** | `MOV RAX, [RBX]` | Use RBX as a pointer to memory |
| **Indexed** | `MOV RAX, [RBX+RCX*4]` | Use RBX + RCX*4 as a pointer to memory |

The CPU's addressing modes determine how flexible the instruction set is. More addressing modes make code more expressive, but they also make the CPU more complex.

### From High-Level to Low-Level

Let's see how Rust code maps to CPU instructions.

**Rust code:**
```rust
fn square(x: i64) -> i64 {
    x * x
}

fn main() {
    let result = square(5);
    println!("{}", result);
}
```

**Compiled (simplified assembly):**
```assembly
square:
    mov     rax, rdi      ; Move first argument (x) to RAX
    imul    rax, rax      ; Multiply RAX by RAX (RAX = x * x)
    ret                   ; Return (RAX contains the result)

main:
    sub     rsp, 24       ; Allocate stack space
    mov     edi, 5        ; First argument: 5
    call    square        ; Call square function
    mov     rsi, rax      ; Move result to second argument for println
    ; ... (println call)
    add     rsp, 24       ; Deallocate stack space
    ret
```

**What happened:**
1. The `square` function takes its argument in the `RDI` register (x86-64 calling convention).
2. It multiplies `RAX` by itself (the result goes in `RAX`).
3. It returns with the result in `RAX`.
4. The `main` function moves `5` into `RDI`, calls `square`, and then passes the result (in `RAX`) to `println!`.

Notice how Rust's abstractions—functions, variables, arithmetic—map directly to assembly instructions. The compiler is doing the translation, but the underlying operations are the same.

### The Stack and Function Calls

Remember Day 1's stack diagram? Here is how it maps to CPU instructions.

```assembly
; Function prologue: setting up a stack frame
push    rbp               ; Save the old base pointer
mov     rbp, rsp          ; Set the new base pointer
sub     rsp, 32           ; Allocate 32 bytes of local variables

; Function body
mov     [rbp-8], rdi      ; Store first argument (x) on the stack
mov     [rbp-16], rax     ; Store a local variable

; Function epilogue: tearing down the stack frame
mov     rsp, rbp          ; Restore the stack pointer
pop     rbp               ; Restore the old base pointer
ret                       ; Return to the caller
```

**Pushing and popping:** Each function call pushes a return address onto the stack. When the function returns, it pops the return address and jumps to it. This is how the CPU knows where to go after a function finishes.

:::engineering-note

**The stack is not infinite.** Each stack frame uses memory, and the total stack size is limited. In Rust, `Vec<T>` and `String` are heap-allocated to avoid blowing the stack. Recursive functions without a base case can cause stack overflow (which is exactly where the term comes from).

The stack overflow warning in Rust is not a metaphor—it is literally the result of pushing too many frames onto the stack until it overflows its allocated memory region.

:::

### The Instruction Cycle

The CPU executes instructions in a loop known as the **instruction cycle**:

```
┌──────────────────────────────────────────────────────────────────┐
│                       THE INSTRUCTION CYCLE                      │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  FETCH: Read the next instruction from memory at the     │    │
│  │         instruction pointer (RIP on x86-64)              │    │
│  └──────────────────────────────────────────────────────────┘    │
│                            │                                     │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  DECODE: Interpret the instruction bytes                 │    │
│  │          • What operation is it? (ADD, SUB, MOV, etc.)   │    │
│  │          • What are the operands? (registers, memory)    │    │
│  └──────────────────────────────────────────────────────────┘    │
│                            │                                     │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  EXECUTE: Perform the operation                          │    │
│  │          • Move data between registers/memory            │    │
│  │          • Add, subtract, multiply, divide               │    │
│  │          • Compare values and set flags                  │    │
│  │          • Jump to another address                       │    │
│  └──────────────────────────────────────────────────────────┘    │
│                            │                                     │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  WRITE BACK: Store the result                            │    │
│  │          • Register ← result                             │    │
│  │          • Memory ← result                               │    │
│  └──────────────────────────────────────────────────────────┘    │
│                            │                                     │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  UPDATE PC: Move to the next instruction                 │    │
│  │          • Instruction pointer += instruction size       │    │
│  │          • Or, for jumps, set to the jump target         │    │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

Modern CPUs do not actually execute instructions one at a time. They use **pipelining** (fetching the next instruction while executing the current one), **branch prediction** (guessing which direction a conditional jump will go), and **superscalar execution** (executing multiple instructions in parallel). But the basic model remains the same.

:::historical-context

**The RISC vs. CISC debate.**

In the 1980s, two competing philosophies emerged:

- **CISC (Complex Instruction Set Computing):** The CPU should have complex, powerful instructions that do a lot of work (e.g., `ADD [RSP+8], 42`—add 42 to memory, all in one instruction). x86 is a CISC architecture.

- **RISC (Reduced Instruction Set Computing):** The CPU should have simple, fast instructions that do one thing well. Complex operations should be synthesized from simple ones. ARM and RISC-V are RISC architectures.

The debate is mostly settled: modern CPUs are actually RISC on the inside, with a CISC front-end that translates x86 instructions to internal RISC-like micro-ops. But the principles remain relevant: understanding what the CPU can and cannot do quickly helps you write better code.

:::

### Conditional Jumps and Branching

This is how `if` and `match` statements become CPU instructions:

**Rust code:**
```rust
if x > 10 {
    println!("Greater than 10");
} else {
    println!("Less than or equal to 10");
}
```

**Compiled (simplified):**
```assembly
    cmp     rax, 10       ; Compare RAX to 10
    jg      .greater     ; Jump to .greater if RAX > 10
    jmp     .else        ; Otherwise, jump to .else

.greater:
    ; Print "Greater than 10"
    jmp     .done        ; Jump to the end of the if

.else:
    ; Print "Less than or equal to 10"

.done:
    ; Continue after the if
```

The `cmp` instruction sets condition flags. The `jg` (jump if greater) checks the flags and jumps if the condition is true. The `jmp` (unconditional jump) is used to skip over the else branch.

**Loops** work similarly: they use conditional jumps to control repetition.

:::compiler-thinking

**Prediction 1:**

Consider this Rust function:

```rust
fn add(a: i64, b: i64) -> i64 {
    a + b
}
```

What does the compiled assembly roughly look like? What instructions are used?

<details>
<summary>Answer</summary>

```assembly
add:
    mov     rax, rdi      ; Move first argument (a) to RAX
    add     rax, rsi      ; Add second argument (b) to RAX
    ret                   ; Return (RAX contains the result)
```

The arguments are passed in `RDI` and `RSI` (x86-64 calling convention). The result is returned in `RAX`.
</details>

---

**Prediction 2:**

This Rust function:

```rust
fn multiply(a: i64) -> i64 {
    a * 2
}
```

Could be compiled using a multiplication instruction. But there is a faster instruction. What is it, and why is it faster?

<details>
<summary>Answer</summary>

The compiler would use a shift instruction: `SHL RAX, 1` (shift left by 1, which multiplies by 2).

**Why it is faster:** Multiplication is a complex operation that can take multiple cycles. Shift is a simple operation that completes in a single cycle. The compiler optimises `a * 2` to `a << 1` because it is faster and produces the same result.

This is why writing `x * 2` and `x << 1` are equivalent in performance—the compiler will choose the better instruction regardless. You should write for clarity and let the compiler optimise.
</details>

---

**Prediction 3:**

This Rust code:

```rust
if condition {
    // branch A
} else {
    // branch B
}
```

The CPU is a simple sequential machine. What happens when the condition is unknown until runtime? How does the CPU know which branch to take?

<details>
<summary>Answer</summary>

The CPU uses **branch prediction**. It guesses which branch is more likely and starts executing it speculatively. If the guess is correct, the instructions execute immediately. If the guess is wrong, the CPU must flush the pipeline and start over—a costly operation (10-20 cycles).

Modern CPUs have sophisticated branch predictors that are correct ~95% of the time. This is why predictable branch patterns are faster than unpredictable ones. It is also why functions like `partition` in sorting algorithms can be performance-critical: they create predictable access patterns.
</details>

:::

:::worked-example

## Tracing a Small Program at the Instruction Level

Let's trace a small Rust program at the instruction level.

**Rust code:**
```rust
fn main() {
    let mut x = 5;
    let mut y = 10;
    let z = x + y;
    println!("{}", z);
}
```

**Compiled (simplified x86-64 assembly):**
```assembly
main:
    ; Prologue: set up the stack frame
    push    rbp
    mov     rbp, rsp
    sub     rsp, 24

    ; x = 5
    mov     DWORD PTR [rbp-4], 5

    ; y = 10
    mov     DWORD PTR [rbp-8], 10

    ; z = x + y
    mov     eax, DWORD PTR [rbp-4]   ; Load x into EAX
    add     eax, DWORD PTR [rbp-8]   ; Add y to EAX
    mov     DWORD PTR [rbp-12], eax  ; Store result in z

    ; println!("{}", z)
    ; ... (call println, passing the value of z)

    ; Epilogue: tear down the stack frame
    mov     rsp, rbp
    pop     rbp
    ret
```

**Step-by-step trace:**

1. **Prologue:** The function sets up its stack frame. `RBP` becomes the base pointer for accessing local variables. `RSP` is decremented to allocate space (24 bytes).

2. **x = 5:** The value `5` is stored at `RBP-4` on the stack. This is where the local variable `x` lives.

3. **y = 10:** The value `10` is stored at `RBP-8` on the stack. This is where `y` lives.

4. **z = x + y:** 
   - The value of `x` is loaded from `RBP-4` into the `EAX` register (the lower 32 bits of `RAX`).
   - The value of `y` is loaded from `RBP-8` and added to `EAX` in one instruction: `add eax, DWORD PTR [rbp-8]`.
   - The result is stored at `RBP-12` on the stack (where `z` lives).

5. **println! call:** The compiled code will pass the value of `z` (from `RBP-12`) to `println!` as an argument. The exact instructions for this call would involve setting up arguments in registers or on the stack, then `call`ing the println function.

6. **Epilogue:** The function cleans up its stack frame. `RSP` is restored, `RBP` is popped, and `RET` returns to the caller.

**Memory layout during execution:**

```
Memory (stack):
┌─────────────────────┐
│ RBP-24: ...         │ (allocated but unused)
├─────────────────────┤
│ RBP-20: ...         │
├─────────────────────┤
│ RBP-16: ...         │
├─────────────────────┤
│ RBP-12: z (15)      │
├─────────────────────┤
│ RBP-8: y (10)       │
├─────────────────────┤
│ RBP-4: x (5)        │
├─────────────────────┤
│ RBP:  (saved RBP)   │
└─────────────────────┘
```

**What is not in this trace:**
- The compiler might have optimised this code by keeping `x`, `y`, and `z` in registers, not memory. With optimisations enabled (`cargo build --release`), the assembly would be much smaller.
- The `println!` call is a macro that expands to a complex formatting function call. For simplicity, it is represented as a placeholder here.

:::

:::mini-challenge

### Challenge 1 — Read Assembly

Consider this assembly code:

```assembly
square:
    mov     rax, rdi
    imul    rax, rax
    ret
```

What does this function do? What Rust code would compile to this assembly?

<details>
<summary>Answer</summary>

This is a square function:

```rust
fn square(x: i64) -> i64 {
    x * x
}
```

The `mov rax, rdi` moves the first argument into `RAX`, and `imul rax, rax` multiplies `RAX` by itself.
</details>

---

### Challenge 2 — Predict the Output

You have this Rust code:

```rust
fn main() {
    let a = 5;
    let b = 10;
    let c = a + b * 2;
    println!("{}", c);
}
```

What does the compiled assembly roughly look like? Trace the execution and determine the value of `c`.

<details>
<summary>Solution</summary>

```assembly
main:
    ; Prologue...
    mov     eax, 5          ; a = 5
    mov     ebx, 10         ; b = 10
    imul    ebx, 2          ; b * 2 = 20
    add     eax, ebx        ; a + (b * 2) = 5 + 20 = 25
    ; Store result for println...
    ; Epilogue...
```

`c` would be 25.
</details>

---

### Challenge 3 — Performance Prediction

This function:

```rust
fn divide_by_2(x: i64) -> i64 {
    x / 2
}
```

What is the fastest way for the CPU to implement division by 2? Why is division slow?

<details>
<summary>Answer</summary>

The fastest way is a shift right by 1: `SHR RAX, 1` (which divides by 2 for positive numbers).

Division is slow because it is a complex operation. The CPU must perform multiple subtractions or use a dedicated division unit. On modern CPUs, integer division can take 20-30 cycles—much slower than addition or multiplication.

The compiler will optimise `x / 2` to a shift where possible, but it must be careful about negative numbers (shift right is not the same as division for signed numbers).
</details>

:::

:::reflection

Write the answer to this question in a text file called `reflection-day3.md` in your `hello_reec` directory. Commit it.

**Question:**

"Now that you have seen how Rust code maps to CPU instructions, think about the `square` function from the worked example. The compiler chooses the instructions, not you. But your choice of algorithm and data structures still matters—no compiler can make `O(n^2)` code as fast as `O(n log n)` code at the instruction level. Explain the relationship between high-level code design (algorithms) and low-level code execution (instructions). Why does understanding the CPU not replace the need for good algorithm design?"

<details>
<summary>Reflection Guidance</summary>

Understanding the CPU does not replace good algorithm design because the CPU is fundamentally limited by the number of instructions it can execute per second. An `O(n^2)` algorithm might execute 1,000,000 instructions for `n=1000`; an `O(n log n)` algorithm might execute only 10,000. The CPU is fast, but not infinitely fast.

However, understanding the CPU matters because it helps you make choices between algorithms with the same asymptotic complexity. A `O(n)` algorithm that uses division in the hot loop might be slower than a `O(n)` algorithm that avoids division. A `O(n log n)` algorithm that has poor cache locality might be slower than a `O(n^2)` algorithm that fits entirely in cache for small `n`.

The relationship is complementary. Good algorithm design tells you which operations are required. Understanding the CPU tells you how those operations will be executed. Together, they enable you to write code that is both correct and fast.
</details>

:::

## End of Day 3

### What You Have Accomplished

By the end of this session, you have:

- **Understood the CPU's role** as the executor of machine instructions.
- **Learned the basics of assembly language** and how it relates to high-level code.
- **Explored registers, addressing modes, and the instruction cycle.**
- **Seen how Rust code maps to CPU instructions.**
- **Traced a small program at the instruction level.**
- **Predicted the performance implications of different instructions.**
- **Built intuition for why understanding the CPU matters for performance.**

### What This Builds Toward

Day 3 reveals the layer beneath Day 1's memory model and Day 2's toolchain. You now understand the complete path: from human-readable source code, through the toolchain, to the machine code that the CPU executes.

**The engineering habit to carry forward:** When you write code, consider the CPU. Not every instruction is equal. Know what the CPU can do quickly and what it cannot. This is not about micro-optimisation—it is about avoiding the kind of performance bug that only a profiler and a look at the assembly can reveal.

**Tomorrow, Day 4, you will put this understanding to the test in the first Failure Lab.** You will diagnose intentionally broken code that compiles cleanly but has hidden bugs related to memory and the CPU:

- **The Broken Mental Model:** code that looks correct but is fundamentally wrong.
- **Undefined behaviour:** what the CPU does when the program violates its rules.
- **Dangling pointers:** the exact bug we traced in Day 1's C example, now in Rust.

You have built the mental models. Tomorrow, you will break them—and learn why they matter.
