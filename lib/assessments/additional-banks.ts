import type { MCQ, CodingChallenge } from "./content";

const CSHARP_LANGS = [
  { id: "csharp", name: "C# (.NET 8)", monacoLang: "csharp", template: `public class Solution { public static Dictionary<string, double> ProcessTransactions(string csvString) { return new Dictionary<string, double>(); } }` },
  { id: "python", name: "Python 3", monacoLang: "python", template: `def process_transactions(csv_string: str) -> dict:\n    return {}\n` },
  { id: "javascript", name: "JavaScript (ES6)", monacoLang: "javascript", template: `export function processTransactions(csvString) { return {}; }` }
];

const PYTHON_LANGS = [
  { id: "python", name: "Python 3", monacoLang: "python", template: `def normalize_matrix(data: list) -> list:\n    return []\n` },
  { id: "javascript", name: "JavaScript (ES6)", monacoLang: "javascript", template: `export function normalizeMatrix(data) { return []; }` }
];

export interface SkillQuestionBank {
  mcqPool: MCQ[];
  codingPool: CodingChallenge[];
}

export const ADDITIONAL_QUESTION_BANKS: Record<string, SkillQuestionBank> = {
  // ─────────────────────────────────────────────────────────────────────────
  // 1. C# (.NET) — Coding Capable
  // ─────────────────────────────────────────────────────────────────────────
  csharp: {
    codingPool: [
      {
        id: "csharp_task_1",
        title: "Transaction Reconciliation Engine",
        instructions: "Implement `ProcessTransactions(string csvString)` to parse comma-separated transactions with columns: `id,user_id,amount,status`. Filter only records where status is strictly 'COMPLETED'. Sum the total amount per user and return a `Dictionary<string, double>` mapping `user_id` to total spent. Skip malformed or empty rows.",
        initialCode: `using System;
using System.Collections.Generic;

public class Solution {
    public static Dictionary<string, double> ProcessTransactions(string csvString) {
        var totals = new Dictionary<string, double>();
        if (string.IsNullOrWhiteSpace(csvString)) return totals;
        
        var lines = csvString.Split(new[] { "\\r\\n", "\\r", "\\n" }, StringSplitOptions.RemoveEmptyEntries);
        foreach (var line in lines) {
            var parts = line.Split(',');
            if (parts.Length < 4) continue;
            var userId = parts[1].Trim();
            if (double.TryParse(parts[2].Trim(), out double amount) && parts[3].Trim() == "COMPLETED") {
                if (!totals.ContainsKey(userId)) totals[userId] = 0;
                totals[userId] += amount;
            }
        }
        return totals;
    }
}`,
        language: "csharp",
        supportedLanguages: CSHARP_LANGS
      }
    ],
    mcqPool: [
      // Easy (5)
      {
        question: "In C#, what is the primary difference between a 'class' and a 'struct'?",
        options: [
          "Classes are reference types allocated on the managed heap; structs are value types typically allocated on the stack",
          "Structs can inherit from classes, but classes cannot inherit from structs",
          "Classes cannot implement interfaces, whereas structs can",
          "Structs support protected access modifiers, whereas classes do not"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Type System"
      },
      {
        question: "What does the 'using' statement (or using declaration) in C# ensure for objects implementing IDisposable?",
        options: [
          "It forces immediate garbage collection of all generation 2 objects",
          "It guarantees that Dispose() is invoked even if an unhandled exception occurs inside the block",
          "It encrypts the variable in process memory",
          "It converts the class instance into a thread-safe singleton"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Resource Management"
      },
      {
        question: "Which collection in System.Collections.Generic provides O(1) average-time lookups by key?",
        options: ["List<T>", "LinkedList<T>", "Dictionary<TKey, TValue>", "Queue<T>"],
        answerIndex: 2,
        difficulty: "easy",
        topic: "Collections"
      },
      {
        question: "What does the 'async' and 'await' pattern in C# do when awaiting an unfinished Task?",
        options: [
          "It blocks the calling thread synchronously until the Task completes",
          "It yields execution back to the caller/synchronization context and registers a continuation without blocking the thread",
          "It starts a new foreground process via the OS kernel",
          "It converts the operation into a synchronous fiber"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Asynchronous Programming"
      },
      {
        question: "In C# 9+, what is the main feature of a 'record' type?",
        options: [
          "It is strictly allocated in GPU VRAM",
          "It provides built-in value-based equality semantics and non-destructive mutation via 'with' expressions",
          "It cannot have properties or methods",
          "It is automatically serialized to XML upon creation"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Records"
      },
      // Medium (5)
      {
        question: "Find the Error: What bug occurs in this LINQ snippet?\n`var query = dbContext.Users.Where(u => u.IsActive);\nvar count = query.Count();\nvar list = query.ToList();`",
        options: [
          "It causes compile-time syntax error because query cannot be re-used",
          "It results in multiple roundtrips / deferred execution running the SQL query twice against the database",
          "It causes a deadlock because LINQ queries require explicit transaction commits",
          "It drops the active filter during the second invocation"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Error Finding (LINQ)"
      },
      {
        question: "In modern .NET, what is the key performance benefit of 'Span<T>' and 'ReadOnlySpan<T>'?",
        options: [
          "They enable contiguous memory representation and slicing of arrays or native memory without heap allocations",
          "They automatically compress strings in memory by 50%",
          "They make asynchronous calls run 10x faster by bypassing thread pools",
          "They replace the need for the garbage collector entirely"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Memory & Performance"
      },
      {
        question: "What is the consequence of capturing a loop variable in an anonymous lambda inside a C# 4 (or earlier) foreach loop versus modern C# 5+?",
        options: [
          "In older versions, all delegates captured the same mutated variable instance, whereas C# 5+ creates a fresh iteration variable per loop",
          "Modern C# throws a runtime InvalidOperationException",
          "Older versions ran iterations concurrently in parallel threads",
          "There is no difference across any C# version"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Closures"
      },
      {
        question: "In C# dependency injection, what is the lifecycle of a service registered with 'AddScoped'?",
        options: [
          "A single instance shared across the lifetime of the entire application process",
          "A new instance created every time it is requested from the service provider",
          "A single instance created per client HTTP request or scope boundary",
          "An ephemeral instance pooled across background workers"
        ],
        answerIndex: 2,
        difficulty: "medium",
        topic: "Architecture & DI"
      },
      {
        question: "Find the Error: What happens if you execute `Task.Run(() => DoWork()).Wait()` on the UI or ASP.NET SynchronizationContext?",
        options: [
          "It runs asynchronously with zero thread usage",
          "It risks a fatal synchronization deadlock if DoWork awaits code that attempts to marshal back to the captured context",
          "It throws a NullReferenceException on the task worker",
          "It forces .NET runtime to abort the application"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Error Finding (Threading)"
      },
      // Hard (5)
      {
        question: "In the .NET Garbage Collector, how are Generation 0, Generation 1, and Generation 2 managed?",
        options: [
          "Gen 0 holds short-lived objects; objects surviving collections are promoted to Gen 1 and then Gen 2 (long-lived / full collections)",
          "Gen 2 is collected on every allocation, whereas Gen 0 is only collected on application exit",
          "Generations are determined by whether an object is a struct (Gen 0) or a class (Gen 2)",
          "All objects larger than 85 bytes are immediately allocated in Gen 0"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "CLR Internals"
      },
      {
        question: "Why does allocating objects larger than 85,000 bytes into the Large Object Heap (LOH) require special architectural consideration in .NET?",
        options: [
          "The LOH is never collected by the garbage collector",
          "LOH memory is not compacted by default during Gen 2 GC collections, which can cause address space fragmentation",
          "LOH objects are written directly to secondary storage disk paging files",
          "LOH access requires acquiring an exclusive kernel lock on the CPU"
        ],
        answerIndex: 1,
        difficulty: "hard",
        topic: "LOH & Memory Fragmentation"
      },
      {
        question: "What restriction is strictly enforced by the C# compiler on a `ref struct` type (such as `Span<T>`)?",
        options: [
          "It cannot be boxed, cannot be used as a generic type argument, and cannot be a field in a normal class on the heap",
          "It cannot contain public properties or constructors",
          "It cannot be passed as a method argument",
          "It can only be executed in 32-bit compatibility mode"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Type Safety"
      },
      {
        question: "How does the C# compiler transform an `async Task<int>` method behind the scenes?",
        options: [
          "It creates an OS-level thread for every await expression",
          "It synthesizes a compiler-generated state machine struct implementing IAsyncStateMachine",
          "It wraps the method in an interpreted Python script",
          "It rewrites the instructions into C++ inline assembly"
        ],
        answerIndex: 1,
        difficulty: "hard",
        topic: "Async State Machine"
      },
      {
        question: "What does the `[MethodImpl(MethodImplOptions.AggressiveInlining)]` attribute instruct the .NET JIT compiler to do?",
        options: [
          "It forces the JIT compiler to inline the target method body at calling sites whenever feasible to eliminate call overhead",
          "It compiles the method ahead-of-time to WebAssembly",
          "It disables JIT optimizations to preserve exact stack frames for debugging",
          "It ensures the method is executed exclusively on Core 0"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "JIT Optimization"
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2. C (Systems Programming) — Coding Capable
  // ─────────────────────────────────────────────────────────────────────────
  c: {
    codingPool: [
      {
        id: "c_task_1",
        title: "In-Place Vector Buffer Deduplication",
        instructions: "Implement `removeDuplicates(int* nums, int numsSize)` which takes a sorted integer array and modifies it in-place such that each unique element appears once. Return the new length `k` containing the unique elements in the first `k` positions.",
        initialCode: `#include <stdio.h>
#include <stdlib.h>

int removeDuplicates(int* nums, int numsSize) {
    if (numsSize <= 0) return 0;
    int k = 1;
    for (int i = 1; i < numsSize; i++) {
        if (nums[i] != nums[k - 1]) {
            nums[k] = nums[i];
            k++;
        }
    }
    return k;
}`,
        language: "c",
        supportedLanguages: [
          { id: "c", name: "C (GCC)", monacoLang: "cpp", template: `int removeDuplicates(int* nums, int numsSize) {\n    return 0;\n}` },
          { id: "cpp", name: "C++ (GCC 14)", monacoLang: "cpp", template: `int removeDuplicates(int* nums, int numsSize) {\n    return 0;\n}` }
        ]
      }
    ],
    mcqPool: [
      // Easy (5)
      {
        question: "In C, what is the output of `sizeof(char)` according to the ANSI/ISO C standard?",
        options: ["Always 1 byte", "Depends on the CPU architecture (4 or 8 bytes)", "2 bytes for UTF-16", "0 bytes"],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Memory & Data Types"
      },
      {
        question: "What must you do after dynamically allocating memory with `malloc()` or `calloc()` when it is no longer needed?",
        options: [
          "Call `free()` to release the memory back to the heap and prevent memory leaks",
          "Set the pointer to NULL without freeing",
          "Call `delete[]` like in C++",
          "Wait for the C runtime automatic garbage collector"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Memory Management"
      },
      {
        question: "What does the dereference operator `*` do when applied to a pointer variable in C?",
        options: [
          "Accesses the value stored at the memory address pointed to by the pointer",
          "Multiplies the address by 2",
          "Allocates new heap memory for the pointer",
          "Deletes the pointer variable from the stack"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Pointers"
      },
      {
        question: "In C, how are strings conventionally represented in memory?",
        options: [
          "As contiguous character arrays terminated by a null character ('\\0')",
          "As length-prefixed Pascal strings with a 16-bit header",
          "As immutable objects stored in the string interning table",
          "As linked lists of 32-bit Unicode code points"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Strings"
      },
      {
        question: "What is the purpose of header guards (`#ifndef HEADER_H ... #endif`) in C header files?",
        options: [
          "To prevent duplicate definition errors caused by including the same header multiple times",
          "To encrypt proprietary C source code during compilation",
          "To speed up runtime CPU execution",
          "To force the compiler to link shared libraries statically"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Preprocessor"
      },
      // Medium (5)
      {
        question: "Find the Error: What bug exists in this C function?\n`char* getMessage() { char buffer[64] = \"Welcome\"; return buffer; }`",
        options: [
          "Returning the address of a local stack variable causes undefined behavior once the stack frame is popped",
          "Buffer must be initialized with malloc to avoid a compile-time syntax error",
          "Character strings cannot exceed 32 bytes in C",
          "The string literal lacks an explicit '\\0' character"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Error Finding (Stack Lifetime)"
      },
      {
        question: "What is the purpose of the `volatile` type qualifier in C?",
        options: [
          "It tells the compiler that the variable's value may change asynchronously (e.g. by hardware or interrupt), preventing unwanted compiler caching/optimizations",
          "It guarantees atomic read-modify-write operations across CPU cores",
          "It allocates the variable into persistent NVRAM storage",
          "It marks the variable as thread-local"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Qualifiers"
      },
      {
        question: "What happens when you increment a pointer `int* ptr` pointing to an integer array on a 64-bit system where `sizeof(int) == 4`?",
        options: [
          "The memory address stored in `ptr` increases by 4 bytes",
          "The memory address stored in `ptr` increases by 1 byte",
          "The memory address stored in `ptr` increases by 8 bytes",
          "The value pointed to by `ptr` is incremented by 1"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Pointer Arithmetic"
      },
      {
        question: "Find the Error: What vulnerability is present in this snippet?\n`char dest[16]; gets(dest);`",
        options: [
          "`gets()` does not check bounds and can overflow `dest`, leading to stack corruption or arbitrary code execution",
          "`gets()` can only read binary data, not strings",
          "Array `dest` cannot be passed without an explicit cast to `void*`",
          "`dest` is placed in read-only memory segment"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Error Finding (Buffer Overflow)"
      },
      {
        question: "Why does structure padding occur in C structs (e.g. `struct { char a; int b; }`)?",
        options: [
          "To align data fields on natural memory word boundaries required by the CPU architecture for optimal bus access",
          "To prevent the compiler from optimizing struct layouts",
          "To provide space for virtual method table pointers",
          "To ensure all structs have a prime number of bytes"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Memory Alignment"
      },
      // Hard (5)
      {
        question: "What does strict aliasing rule in the C standard (C99/C11) dictate?",
        options: [
          "Two pointers of different types (with few exceptions like `char*`) cannot point to the same memory location, allowing the compiler to reorder loads/stores",
          "Variables cannot have more than one pointer pointing to them simultaneously",
          "Pointers must always point to statically allocated memory",
          "Pointers cannot be cast to `void*` without explicit compiler flags"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Compiler Optimization & Aliasing"
      },
      {
        question: "What is undefined behavior in C regarding signed integer overflow (`INT_MAX + 1`)?",
        options: [
          "The C standard does not define the result; the compiler may assume signed overflow never happens and optimize away overflow checks",
          "It is guaranteed to wrap around using two's complement arithmetic",
          "It throws an uncatchable SIGFPE hardware trap on all architectures",
          "It automatically promotes the integer to a 64-bit `long long`"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Undefined Behavior"
      },
      {
        question: "What is the difference between a mutex and a spinlock in low-level C concurrent systems programming?",
        options: [
          "A spinlock actively polls in a tight loop burning CPU until acquired; a mutex puts the waiting thread to sleep via OS scheduler",
          "A mutex cannot be unlocked by another thread, while a spinlock can never be locked",
          "Spinlocks only work on single-core processors",
          "Mutexes require hardware memory fences while spinlocks do not"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Concurrency"
      },
      {
        question: "In C, what is the role of `__attribute__((packed))` in GCC / Clang struct definitions?",
        options: [
          "It instructs the compiler to omit all alignment padding bytes, resulting in the smallest possible memory footprint",
          "It compresses the struct with zlib in memory",
          "It ensures the struct is stored in CPU L1 cache",
          "It protects the struct from concurrent thread mutation"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "ABI & Compilers"
      },
      {
        question: "What is the exact semantic difference between `char *p = \"hello\";` and `char p[] = \"hello\";` in C?",
        options: [
          "`char *p` points to a string literal in read-only data segment (modifying it causes a crash); `char p[]` allocates an array on the stack initialized with a copy",
          "`char *p` allocates on the heap; `char p[]` allocates on the stack",
          "`char p[]` is read-only; `char *p` is writable",
          "There is no difference in memory segment or mutability"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Memory Segments"
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3. HTML5 (Markup & Web APIs) — Non-Coding (22 MCQs: Error Finding & Queries)
  // ─────────────────────────────────────────────────────────────────────────
  html5: {
    codingPool: [],
    mcqPool: [
      // Easy (7)
      {
        question: "What is the purpose of the `<!DOCTYPE html>` declaration at the top of an HTML document?",
        options: [
          "It forces modern web browsers to render the document in standards mode rather than quirks mode",
          "It links the document to the W3C XML schema validator",
          "It loads the HTML5 JavaScript engine into browser memory",
          "It specifies the server HTTP response header charset"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Doctype & Standards"
      },
      {
        question: "Which semantic HTML5 element should be used to enclose self-contained content that could be independently distributed or syndicated (e.g. a blog post or news story)?",
        options: ["<article>", "<section>", "<div>", "<aside>"],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Semantic Markup"
      },
      {
        question: "What attribute is required on an `<img>` tag to provide accessible text for screen readers when an image fails to load?",
        options: ["alt", "title", "aria-hidden", "caption"],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Accessibility"
      },
      {
        question: "Find the Error: What is invalid in this HTML snippet?\n`<p>Please enter your data: <div>Input here</div></p>`",
        options: [
          "A block-level `<div>` cannot be legally nested inside a paragraph `<p>` element; browsers will prematurely close the `<p>` tag",
          "Paragraph tags cannot contain plain text before children",
          "`<div>` tags require an explicit `role` attribute",
          "`<p>` tags must always have a closing `</paragraph>` tag"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Error Finding (DOM Hierarchy)"
      },
      {
        question: "Which HTML5 input type provides built-in mobile virtual keyboard optimization and email format validation?",
        options: ["<input type=\"email\">", "<input type=\"text\">", "<input type=\"mail\">", "<input type=\"search\">"],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Forms"
      },
      {
        question: "What is the semantic difference between `<section>` and `<article>` in HTML5?",
        options: [
          "`<article>` represents an independent, self-contained unit of content; `<section>` represents a thematic grouping of content typically with a heading",
          "`<section>` is only used inside `<header>`; `<article>` is only used inside `<footer>`",
          "`<article>` cannot contain headings; `<section>` must contain forms",
          "`<section>` is deprecated in HTML5"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Semantic Structure"
      },
      {
        question: "Which HTML5 element represents content that is tangentially related to the content around it, often placed as a sidebar?",
        options: ["<aside>", "<nav>", "<details>", "<figure>"],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Semantic Elements"
      },
      // Medium (8)
      {
        question: "Find the Error: Why does this form not submit file uploads properly?\n`<form action=\"/api/upload\" method=\"POST\">\n  <input type=\"file\" name=\"resume\">\n  <button type=\"submit\">Upload</button>\n</form>`",
        options: [
          "It is missing `enctype=\"multipart/form-data\"`, which is required for binary file uploads over POST",
          "`<button>` cannot have `type=\"submit\"` inside a form",
          "`<input type=\"file\">` requires a JavaScript event listener to upload",
          "`method=\"POST\"` is not supported for files; only `PUT` is permitted"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Error Finding (Forms & Enctype)"
      },
      {
        question: "What is the difference between `<script async>` and `<script defer>` when loading external scripts in HTML5?",
        options: [
          "`async` executes as soon as downloaded without blocking parsing but in arbitrary order; `defer` executes only after DOM parsing finishes, preserving document order",
          "`async` delays execution until page unloads; `defer` runs immediately",
          "`defer` only works for inline scripts; `async` only works for CSS stylesheets",
          "`async` runs on web worker background threads"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Script Loading & Performance"
      },
      {
        question: "Query Selection: Which HTML5 attribute combination correctly opens a modal `<dialog>` natively with keyboard accessibility and background inertness?",
        options: [
          "Calling `dialogElement.showModal()` in JavaScript",
          "Adding `open=\"true\"` attribute in static HTML",
          "Calling `dialogElement.show()` with CSS `z-index: 9999`",
          "Wrapping the `<dialog>` in an `<iframe>` tag"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Query / API Usage (<dialog>)"
      },
      {
        question: "Find the Error: What is accessibility issue in this interactive button snippet?\n`<div class=\"btn\" onclick=\"handleClick()\">Submit Application</div>`",
        options: [
          "It lacks keyboard accessibility (no `tabindex=\"0\"`), lacks semantic role (`role=\"button\"`), and cannot be triggered via Enter/Space without explicit keydown handlers",
          "Click handlers cannot be attached to `<div>` elements in modern browsers",
          "`class=\"btn\"` violates HTML5 naming standards",
          "Text inside `<div>` must be wrapped in `<span>`"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Error Finding (A11y)"
      },
      {
        question: "What is the function of the `<template>` element in HTML5?",
        options: [
          "It holds client-side HTML markup that is parsed by the browser but NOT rendered or executed until instantiated via JavaScript",
          "It automatically clones server-side components into the DOM on load",
          "It compiles Mustache or Handlebars templates into WebAssembly",
          "It acts as a placeholder for deprecated `<frameset>` elements"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Web Components & Templates"
      },
      {
        question: "In HTML5 Canvas, how do you handle high-DPI (Retina) displays to prevent blurry vector rendering?",
        options: [
          "Scale the canvas buffer dimensions (`canvas.width`, `canvas.height`) by `window.devicePixelRatio` and scale back the CSS display style (`canvas.style.width`)",
          "Set the canvas attribute `dpi=\"retina\"` in HTML",
          "Wrap the canvas inside an `<svg>` tag",
          "Canvas rendering automatically scales without any resolution adjustments"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Canvas & Rendering"
      },
      {
        question: "Which attribute should be added to an external link (`<a target=\"_blank\">`) to protect users from reverse tab-nabbing vulnerabilities?",
        options: [
          "`rel=\"noopener noreferrer\"`",
          "`sandbox=\"allow-scripts\"`",
          "`security=\"isolated\"`",
          "`crossorigin=\"anonymous\"`"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Security"
      },
      {
        question: "Find the Error: Why does this HTML5 audio element fail to autoplay in modern web browsers?\n`<audio src=\"ambient.mp3\" autoplay></audio>`",
        options: [
          "Modern browser autoplay policies block unmuted audio playback that is not triggered by a direct user gesture",
          "`<audio>` requires a `<canvas>` element to be rendered",
          "Audio files must be encoded in raw WAV format to autoplay",
          "`autoplay` was removed from the HTML5 specification"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Error Finding (Media Policy)"
      },
      // Hard (7)
      {
        question: "What is the difference between Shadow DOM `mode: 'open'` versus `mode: 'closed'` in HTML5 Web Components?",
        options: [
          "`open` exposes the shadow root via `element.shadowRoot` from external JavaScript; `closed` denies external JavaScript access to `element.shadowRoot` (returns null)",
          "`open` renders CSS globally; `closed` renders only inline styles",
          "`closed` shadow DOM does not render to the screen",
          "`open` allows indexing by web crawlers; `closed` disables search indexing"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Shadow DOM & Web Components"
      },
      {
        question: "How does the HTML Content Security Policy (CSP) directive `script-src 'strict-dynamic'` enhance script injection defense?",
        options: [
          "It trusts scripts loaded dynamically by an already-trusted root script (via cryptographic nonce), while ignoring host allowlists",
          "It blocks all JavaScript execution entirely on the web page",
          "It prevents any network requests from executing inside scripts",
          "It forces scripts to execute in isolated web workers only"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Security & CSP"
      },
      {
        question: "In HTML5 Custom Elements, which lifecycle callback is executed whenever an element is adopted into a new document (e.g. from an iframe)?",
        options: ["adoptedCallback()", "connectedCallback()", "attributeChangedCallback()", "disconnectedCallback()"],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Custom Elements Lifecycle"
      },
      {
        question: "What is the primary architectural purpose of the HTML5 Intersection Observer API over traditional scroll event listeners?",
        options: [
          "It asynchronously observes changes in the intersection of a target element with an ancestor viewport without forcing synchronous layout thrashing / reflows",
          "It compresses images before they intersect the viewport",
          "It calculates 3D physics collisions between DOM nodes on the GPU",
          "It intercepts HTTP requests made by DOM elements"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "DOM Performance APIs"
      },
      {
        question: "Find the Error: What bug exists in this HTML5 Web Worker creation code?\n`const worker = new Worker('https://cdn.external-domain.com/worker.js');`",
        options: [
          "Browsers enforce Same-Origin Policy on the Worker script URL; instantiating directly from a different origin throws a SecurityError",
          "Workers can only be instantiated with inline string functions",
          "`new Worker()` requires a port number argument",
          "Worker files cannot use the `.js` extension"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Error Finding (Web Workers)"
      },
      {
        question: "What does the `loading=\"lazy\"` attribute on `<img>` and `<iframe>` elements instruct the browser rendering engine to do?",
        options: [
          "Defers fetching the resource until it reaches a calculated threshold distance from the user's viewport",
          "Fetches the image in low resolution, then upgrades to high resolution",
          "Loads the image only after the window `load` event fires",
          "Compresses the image file client-side"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Performance"
      },
      {
        question: "What is the purpose of the `<picture>` element with `<source media=\"...\" srcset=\"...\">` children in HTML5?",
        options: [
          "Art direction and responsive image selection based on viewport media queries and pixel density descriptors",
          "Rendering 3D stereoscopic images for VR devices",
          "Loading video streams when images fail to render",
          "Validating image file hashes for integrity checking"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Responsive Images"
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4. CSS (Styles, Layouts & Animations) — Non-Coding (22 MCQs: Error Finding)
  // ─────────────────────────────────────────────────────────────────────────
  css: {
    codingPool: [],
    mcqPool: [
      // Easy (7)
      {
        question: "What is the default value of the `box-sizing` property in standard CSS, and what does it measure?",
        options: [
          "`content-box`; width and height apply only to the content box, excluding padding and borders",
          "`border-box`; width and height include content, padding, and borders",
          "`margin-box`; width and height include all outer margins",
          "`padding-box`; width includes padding but excludes borders"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Box Model"
      },
      {
        question: "In CSS, which selector has the highest specificity?",
        options: [
          "An ID selector (`#header`)",
          "A class selector (`.container`)",
          "An element selector (`div`)",
          "A pseudo-element selector (`::before`)"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Specificity"
      },
      {
        question: "What is the difference between `display: none` and `visibility: hidden` in CSS?",
        options: [
          "`display: none` removes the element entirely from the document layout flow; `visibility: hidden` hides the element while preserving its physical space in the layout",
          "`display: none` makes the element translucent; `visibility: hidden` removes it from memory",
          "`visibility: hidden` prevents JavaScript event listeners from running; `display: none` does not",
          "There is no difference"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Display vs Visibility"
      },
      {
        question: "Find the Error: Why does this centered container fail to center horizontally?\n`.box { width: 300px; margin: 0 auto; display: inline; }`",
        options: [
          "`margin: 0 auto` does not calculate auto margins on `display: inline` elements; it requires a block-level or flex context",
          "`width: 300px` is invalid on inline elements and causes a fatal CSS syntax parse error",
          "`auto` can only be applied to vertical margins (`margin: auto 0`)",
          "Container elements cannot have static pixel widths"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Error Finding (Centering)"
      },
      {
        question: "In CSS Flexbox, which property aligns items along the cross axis inside a flex container?",
        options: ["align-items", "justify-content", "flex-direction", "align-content"],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Flexbox"
      },
      {
        question: "What unit in CSS represents 1% of the height of the current browser viewport?",
        options: ["vh", "vw", "rem", "em"],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Units"
      },
      {
        question: "What is the effect of setting `position: absolute` on an HTML element in CSS?",
        options: [
          "It removes the element from normal flow and positions it relative to its closest positioned ancestor (or initial containing block)",
          "It locks the element relative to the physical display screen viewport permanently",
          "It places the element strictly at coordinates (0, 0) of the parent element regardless of parent positioning",
          "It forces the element to adopt flex layout"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Positioning"
      },
      // Medium (8)
      {
        question: "Find the Error: Why does `z-index: 9999` fail to elevate this element above its sibling in the DOM?\n`.card { z-index: 9999; background: white; }`",
        options: [
          "`z-index` only applies to positioned elements (`position` other than `static`, or flex/grid items); without positioning, it is ignored",
          "`z-index` must be negative to appear on top",
          "Values above 1000 are clamped to 0 by the CSS engine",
          "Elements must have `display: table` to support z-indexing"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Error Finding (Stacking Context)"
      },
      {
        question: "What creates a new stacking context in CSS? (Choose the correct trigger)",
        options: [
          "An element with `opacity` less than 1, or `transform` other than none, or `filter` other than none",
          "Any element with `margin: 0 auto`",
          "Setting `font-weight: bold` on a heading",
          "Any element with more than 3 children"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Stacking Context Triggers"
      },
      {
        question: "Find the Error: Why does `position: fixed` element inside this parent scroll with the page instead of staying fixed on the viewport?\n`.parent { transform: translate(0, 0); } .child { position: fixed; top: 10px; }`",
        options: [
          "A non-none `transform` property on an ancestor turns that ancestor into the containing block for all `position: fixed` descendants",
          "`position: fixed` is deprecated in modern CSS",
          "`top: 10px` conflicts with `translate(0, 0)` causing a browser render abort",
          "Fixed elements can never be nested inside a parent element"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Error Finding (Containing Blocks)"
      },
      {
        question: "What is the specificity calculation for the selector: `div.sidebar ul > li:first-child a:hover`?",
        options: [
          "0 IDs, 3 Classes/Pseudos (`.sidebar`, `:first-child`, `:hover`), 4 Elements (`div`, `ul`, `li`, `a`) -> Specificity (0, 3, 4)",
          "1 ID, 2 Classes, 3 Elements -> Specificity (1, 2, 3)",
          "0 IDs, 1 Class, 6 Elements -> Specificity (0, 1, 6)",
          "0 IDs, 4 Classes, 3 Elements -> Specificity (0, 4, 3)"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Specificity Calculation"
      },
      {
        question: "Find the Error: Why does a flex item overflow its container despite having `flex: 1 1 0%` when containing long text?\n`.item { flex: 1 1 0%; }`",
        options: [
          "Flex items have a default `min-width: auto`, which prevents them from shrinking smaller than their minimum content width; setting `min-width: 0` fixes it",
          "`flex-basis: 0%` forces items to take infinite width",
          "Text inside flex items must always be converted to SVG",
          "Flexbox cannot contain strings longer than 255 characters"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Error Finding (Flex Shrink Bug)"
      },
      {
        question: "What is the difference between `:nth-child()` and `:nth-of-type()` in CSS?",
        options: [
          "`:nth-child()` counts siblings regardless of tag type; `:nth-of-type()` counts only siblings sharing the exact same HTML element tag name",
          "`:nth-child()` counts backwards from the end; `:nth-of-type()` counts from the beginning",
          "`:nth-of-type()` only works with class names",
          "There is no difference"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Pseudo-Classes"
      },
      {
        question: "What is margin collapse in CSS, and when does it NOT occur?",
        options: [
          "Vertical margins of adjacent block boxes combine into a single margin; it does NOT occur between flex/grid items or elements with a BFC",
          "Horizontal margins always combine into one; vertical margins never collapse",
          "Margins collapse when padding is greater than 100px",
          "Margin collapse only happens on internet explorer"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Margin Collapsing"
      },
      {
        question: "How does the CSS Grid `grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))` pattern work?",
        options: [
          "It creates an intrinsically responsive multi-column grid that wraps columns when viewport width shrinks below 250px without needing media queries",
          "It generates exactly 4 fixed columns across all screen sizes",
          "It clamps maximum grid height to 250px",
          "It disables grid layout on mobile screens"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "CSS Grid"
      },
      // Hard (7)
      {
        question: "What is the difference between `:is()` and `:where()` pseudo-classes in CSS Selector Level 4?",
        options: [
          "`:is()` adopts the specificity of its most specific argument in the list; `:where()` always has a specificity of (0, 0, 0)",
          "`:is()` only matches tags; `:where()` only matches attributes",
          "`:where()` is evaluated synchronously on the main thread; `:is()` is deferred",
          "`:where()` is invalid in stylesheets"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Selectors Level 4"
      },
      {
        question: "How does the `:has()` relational selector in modern CSS alter selector capability?",
        options: [
          "It acts as a parent/previous sibling selector by matching elements that contain or precede elements matching the parameter selector",
          "It provides string pattern matching on HTML element text nodes",
          "It allows CSS to query remote REST APIs directly",
          "It detects browser hardware capabilities like battery level"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Parent Selectors (:has)"
      },
      {
        question: "What is the performance advantage of animating `transform` and `opacity` over properties like `top`, `left`, `width`, or `height`?",
        options: [
          "`transform` and `opacity` do not trigger layout (reflow) or paint; they are handled directly by the GPU compositor thread",
          "`top` and `left` are calculated on a background web worker thread",
          "GPU compositor threads cannot render opacity changes",
          "There is no difference in rendering pipeline stages"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Rendering Pipeline & Compositing"
      },
      {
        question: "What is a CSS Container Query (`@container`), and how does it differ from a Media Query (`@media`)?",
        options: [
          "Container queries evaluate styles based on the dimensions of a designated parent container rather than the global browser viewport",
          "Container queries only apply to Docker containerized web applications",
          "Media queries apply only to audio and video elements",
          "Container queries require a Node.js server to evaluate"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Container Queries"
      },
      {
        question: "Find the Error: What bug occurs when animating `height` from `0` to `auto` with CSS transitions?\n`.accordion-content { height: 0; transition: height 0.3s ease; } .accordion-content.open { height: auto; }`",
        options: [
          "CSS cannot interpolate or transition between numeric values and `auto` keywords; the transition will not animate smoothly and snaps immediately",
          "Transitions cannot be defined on classes ending in `.open`",
          "`height: 0` causes the browser to remove the element from the DOM",
          "`transition: height` requires an explicit keyframe animation"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Error Finding (Transitions)"
      },
      {
        question: "What does the `contain: content` CSS property optimize for browser rendering engines?",
        options: [
          "It tells the browser that the element's layout, style, and paint are completely isolated from the rest of the document tree, enabling subtree rendering optimizations",
          "It forces the element to adopt flexbox layout automatically",
          "It ensures content cannot be copied by users to the clipboard",
          "It restricts the element from making HTTP requests"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "CSS Containment"
      },
      {
        question: "How do CSS Cascade Layers (`@layer`) determine style precedence in modern CSS?",
        options: [
          "Layers declared later take precedence over layers declared earlier, but unlayered styles always override layered styles (unless `!important` is used)",
          "Layers are evaluated in alphabetical order by layer name",
          "Inline styles have lower precedence than any `@layer`",
          "Layers with more CSS variables always win the cascade"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Cascade Layers (@layer)"
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 5. REST & REST APIs — Non-Coding (22 MCQs: API Design, Status Codes, Errors)
  // ─────────────────────────────────────────────────────────────────────────
  rest: {
    codingPool: [],
    mcqPool: [
      // Easy (7)
      {
        question: "According to RFC 9110, which HTTP methods are defined as idempotent (making the request multiple times produces the exact same server side-effect)?",
        options: [
          "GET, HEAD, PUT, DELETE, and OPTIONS",
          "POST, PATCH, and CONNECT",
          "Only GET and POST",
          "No HTTP method is guaranteed to be idempotent"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "HTTP Methods & Idempotency"
      },
      {
        question: "What is the key architectural difference between `PUT` and `PATCH` in RESTful API design?",
        options: [
          "`PUT` is intended to replace the entire target resource representation; `PATCH` applies a partial set of modifications to the resource",
          "`PUT` is safe and read-only; `PATCH` deletes the resource",
          "`PATCH` is idempotent; `PUT` is never idempotent",
          "`PUT` cannot accept JSON payloads"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "PUT vs PATCH"
      },
      {
        question: "Which HTTP status code should be returned when a client makes a valid request to create a new resource, and the resource is successfully created?",
        options: ["201 Created", "200 OK", "204 No Content", "202 Accepted"],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Status Codes"
      },
      {
        question: "Find the Error: What violates RESTful design in this endpoint?\n`POST /api/v1/deleteUser?userId=123`",
        options: [
          "It uses RPC action verbs in the URI and POST for deletion; it should use `DELETE /api/v1/users/123` where the HTTP verb expresses the action on a noun resource",
          "Query parameters cannot be named `userId` in REST",
          "`/api/v1/` violates REST versioning rules",
          "User IDs must always be 128-bit GUIDs"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Error Finding (RESTful URI Design)"
      },
      {
        question: "Which HTTP status code signifies that the client request lacks valid authentication credentials?",
        options: ["401 Unauthorized", "403 Forbidden", "404 Not Found", "400 Bad Request"],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Status Codes"
      },
      {
        question: "What is the semantic difference between `401 Unauthorized` and `403 Forbidden` in REST APIs?",
        options: [
          "`401` means authentication credentials are missing or invalid; `403` means the server understood who the client is, but refuses authorization / permission",
          "`401` is a client error; `403` is a server infrastructure error",
          "`403` implies the server has crashed",
          "There is no difference; they are interchangeable"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Authentication vs Authorization"
      },
      {
        question: "What HTTP header does a client send to indicate the MIME format of the request body being sent to the server?",
        options: ["Content-Type", "Accept", "Authorization", "User-Agent"],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Headers"
      },
      // Medium (8)
      {
        question: "Find the Error: What anti-pattern is present in this API response?\n`HTTP/1.1 200 OK\nContent-Type: application/json\n\n{ \"status\": \"error\", \"code\": 404, \"message\": \"User not found\" }`",
        options: [
          "Returning a 200 OK status code with an error payload in the body breaks HTTP semantics, caching layers, and client error-handling libraries",
          "JSON keys must be prefixed with an underscore",
          "HTTP responses must have an XML fallback header",
          "Status codes inside the body cannot be numbers"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Error Finding (Status Code Anti-patterns)"
      },
      {
        question: "What is the purpose of the `ETag` and `If-None-Match` HTTP headers in REST APIs?",
        options: [
          "Optimistic concurrency control and conditional HTTP caching (returning 304 Not Modified if the resource representation hasn't changed)",
          "Encrypting user passwords before transmission over TLS",
          "Compressing API payloads with GZIP",
          "Authenticating OAuth2 bearer tokens"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Caching & ETags"
      },
      {
        question: "What is the purpose of an Idempotency Key header (e.g. `Idempotency-Key: uuid`) on `POST /payments` transactions?",
        options: [
          "It allows clients to safely retry a failed or timed-out network request without accidentally executing duplicate transactions on the server",
          "It acts as an SSL certificate for the payload",
          "It forces the database to run in read-only mode",
          "It compresses the payment payload by 50%"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Idempotency in Distributed Systems"
      },
      {
        question: "Which pagination strategy is most resilient against duplicate or skipped items when users create records while browsing large datasets?",
        options: [
          "Cursor-based (keyset) pagination using an indexed timestamp or primary key cursor",
          "Offset-based pagination (`offset=100&limit=20`)",
          "Page-number pagination (`page=5`)",
          "Loading all rows into client memory in a single array"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Pagination Patterns"
      },
      {
        question: "What does the `Cache-Control: no-cache` directive instruct client browsers and CDN proxies to do?",
        options: [
          "The cache can store the response, but must revalidate it with the origin server (using ETag or Last-Modified) before serving it",
          "The response must never be written to any cache storage under any condition",
          "The cache should hold the response permanently without revalidating",
          "The browser must purge its entire disk cache"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Cache Headers"
      },
      {
        question: "Which HTTP status code should be returned when a client submits valid JSON, but the data fails business domain validation rules (e.g. invalid date range)?",
        options: ["422 Unprocessable Content (or 400 Bad Request)", "500 Internal Server Error", "404 Not Found", "204 No Content"],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Validation & Errors"
      },
      {
        question: "What is the role of an HTTP Preflight `OPTIONS` request in CORS (Cross-Origin Resource Sharing)?",
        options: [
          "The browser automatically sends an OPTIONS request before non-simple cross-origin requests to verify if the server permits the method and headers",
          "The server sends OPTIONS to the client to verify browser version",
          "It measures the network ping latency between client and server",
          "It generates an SSL handshake token"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "CORS & Preflight"
      },
      {
        question: "Find the Error: What bug occurs if a server implements rate limiting and returns `429 Too Many Requests` without a `Retry-After` header?",
        options: [
          "Clients have no deterministic indicator of when they can safely resume requests, leading to aggressive polling or backoff failures",
          "Browsers automatically crash when receiving 429 status codes",
          "Rate limiters cannot block IP addresses without a Retry-After header",
          "RFC 9110 marks the server implementation as insecure"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Error Finding (Rate Limiting)"
      },
      // Hard (7)
      {
        question: "What is the HATEOAS (Hypermedia As The Engine Of Application State) constraint in Richardson Maturity Model Level 3 REST APIs?",
        options: [
          "API responses include dynamic hypermedia links informing clients of allowable next state transitions and related resource operations",
          "All API requests must use GraphQL schema queries",
          "The server must not return JSON payloads",
          "Every endpoint must be implemented in Python"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "HATEOAS & Richardson Model"
      },
      {
        question: "How does the `If-Match` header prevent the 'Lost Update' concurrency problem in REST APIs during concurrent updates?",
        options: [
          "The client provides the current ETag; the server only executes the PUT/PATCH if the resource's current ETag matches, otherwise returning 412 Precondition Failed",
          "It acquires an exclusive row-level lock on the database for 60 seconds",
          "It forces concurrent requests into a FIFO Kafka queue",
          "It rolls back all git commits on the server"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Concurrency & 412 Precondition"
      },
      {
        question: "What is RFC 7807 (Problem Details for HTTP APIs), and why is it standard practice in modern enterprise REST services?",
        options: [
          "It defines a standardized JSON format (`application/problem+json`) for HTTP error payloads with fields like `type`, `title`, `status`, `detail`, and `instance`",
          "It specifies how to encrypt REST URLs in transit",
          "It requires all REST services to convert to gRPC",
          "It eliminates the need for HTTP status codes"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "RFC 7807 Error Standards"
      },
      {
        question: "In RESTful API security, what is the risk of accepting wildcards (`Access-Control-Allow-Origin: *`) paired with `Access-Control-Allow-Credentials: true`?",
        options: [
          "Browsers strictly disallow this combination and reject the response because it would allow any arbitrary site to read authenticated credentialed data",
          "The server automatically crashes on invalid headers",
          "It causes SSL certificates to be revoked",
          "Wildcards double network transfer bandwidth"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Security & CORS"
      },
      {
        question: "What is the semantic difference between `Cache-Control: private` versus `Cache-Control: public`?",
        options: [
          "`private` allows only the end-user's browser to cache the response (prohibiting shared/intermediate CDN proxies); `public` permits shared caches to store it",
          "`private` requires VPN authentication to view",
          "`public` encrypts the payload for all users",
          "There is no difference in caching behavior"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Cache Architectures"
      },
      {
        question: "When should a REST service return `202 Accepted` instead of `200 OK` or `201 Created`?",
        options: [
          "When the request has been accepted for asynchronous processing (e.g. queued in a worker), but processing has not yet completed",
          "When the request was accepted but had syntax errors",
          "When the client is using a beta version of the API",
          "When the database is running in test mode"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Asynchronous REST Patterns"
      },
      {
        question: "What is the recommended approach to versioning REST APIs when breaking changes must be introduced?",
        options: [
          "URI path versioning (`/v1/`, `/v2/`) or Content Negotiation header versioning (`Accept: application/vnd.company.v2+json`), while avoiding breaking field deletions",
          "Changing parameter names in production without notifying clients",
          "Shutting down the server on weekends to deploy breaking changes",
          "Deploying changes under random query parameter flags"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "API Evolution & Versioning"
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 6. REDIS (In-Memory Data Store) — Non-Coding (22 MCQs: Queries & Commands)
  // ─────────────────────────────────────────────────────────────────────────
  redis: {
    codingPool: [],
    mcqPool: [
      // Easy (7)
      {
        question: "Query Selection: Which Redis command atomically sets a key with a value ONLY if the key does not already exist, and sets an expiration of 60 seconds?",
        options: [
          "`SET key value NX EX 60`",
          "`SETNX key value; EXPIRE key 60`",
          "`ADD key value 60`",
          "`MSET key value TTL 60`"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Command Selection (Atomic Locks)"
      },
      {
        question: "What is the fundamental architectural property of the Redis core execution engine for client commands?",
        options: [
          "It processes commands in a single-threaded event loop (using I/O multiplexing), ensuring individual command atomicity without lock contention",
          "It spawns an OS thread per incoming connection",
          "It executes all queries in parallel across GPU shaders",
          "It requires distributed two-phase commit locks for every key write"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Architecture & Concurrency"
      },
      {
        question: "Which Redis data structure is optimal for maintaining a leaderboard where users have scores and can be queried by rank in O(log N) time?",
        options: ["Sorted Set (ZSET)", "Hash (HASH)", "List (LIST)", "Set (SET)"],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Data Structure Selection"
      },
      {
        question: "Find the Error: Why is running `KEYS *` in a production Redis cluster with 10 million keys dangerous?",
        options: [
          "`KEYS *` is an O(N) blocking operation that stalls the single-threaded event loop, freezing all other incoming requests until completion; use `SCAN` instead",
          "`KEYS *` deletes all keys in memory",
          "`KEYS *` causes the Redis node to run out of disk space",
          "`KEYS *` is not supported in Redis"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Error Finding (Production Anti-patterns)"
      },
      {
        question: "What command is used in Redis to retrieve multiple fields from a hash in a single roundtrip?",
        options: ["HMGET", "HGETALL", "MGET", "HKEYS"],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Command Selection (Hashes)"
      },
      {
        question: "What happens when the TTL (Time-To-Live) of a key expires in Redis?",
        options: [
          "The key becomes inaccessible and is reclaimed either passively when read or actively by an eviction cycle",
          "The key's value is automatically archived to an SQL database",
          "The key is moved to a backup Redis instance",
          "Redis reboots the server node"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Key Expiration"
      },
      {
        question: "Which Redis command adds one or more members to an unordered set of unique strings?",
        options: ["SADD", "LPUSH", "ZADD", "HSET"],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Sets"
      },
      // Medium (8)
      {
        question: "Query Selection: How do you implement a sliding-window rate limiter in Redis using a Sorted Set (ZSET)?",
        options: [
          "Add current timestamp with `ZADD key now now`, purge old entries with `ZREMRANGEBYSCORE key 0 (now - window)`, and check count with `ZCARD key`",
          "Use `INCR key` followed by `EXPIRE key 1`",
          "Store request IPs in a Redis List with `LPUSH` and read with `LINDEX`",
          "Run a Lua script that calls `KEYS *`"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Query Writing (Rate Limiting)"
      },
      {
        question: "What are the two primary persistence mechanisms available in Redis, and how do they differ?",
        options: [
          "RDB (point-in-time snapshot snapshots at specified intervals) and AOF (append-only log recording every write operation executed by the server)",
          "WAL and SQLite",
          "RAM-only and SSD-caching",
          "RAID 0 and Tape Backup"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Persistence (RDB vs AOF)"
      },
      {
        question: "Find the Error: What happens in a high-traffic system when a cache entry expires and 10,000 concurrent requests immediately query the database simultaneously?",
        options: [
          "Cache stampede (thundering herd problem); can be prevented by mutual exclusion locks, probabilistic early expiration (XFetch), or stale-while-revalidate",
          "Redis immediately terminates connections to protect memory",
          "Database connection pools automatically scale infinitely without latency impact",
          "The CPU executes instructions out of order"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Error Finding (Cache Stampede)"
      },
      {
        question: "How do Redis Transactions (`MULTI` / `EXEC`) differ from traditional ACID relational database transactions?",
        options: [
          "Commands inside `MULTI`/`EXEC` are serialized and execute without interleaving, but there is NO automatic rollback if an individual command fails at runtime",
          "Redis transactions support full multi-version concurrency control (MVCC) with savepoints",
          "Redis transactions write directly to secondary disk before returning",
          "Redis transactions can be paused and resumed across client connections"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Transactions & MULTI/EXEC"
      },
      {
        question: "What is the memory eviction policy `volatile-lru` in Redis configuration?",
        options: [
          "Evicts the least recently used keys out of the keys that have an expiration set (`expire`) when memory limit is reached",
          "Evicts all keys regardless of whether they have an expiration set",
          "Deletes keys with the largest memory footprint first",
          "Rejects all write commands with an Out Of Memory (OOM) error"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Eviction Policies"
      },
      {
        question: "Query Selection: Which command atomically pushes an item to the tail of a list and pops an item from the head of another list, blocking if empty?",
        options: ["BRPOPLPUSH (or BLMOVE)", "LPOP", "RPOP", "RPOPLPUSH"],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Command Selection (Reliable Queues)"
      },
      {
        question: "What is the primary benefit of executing Lua scripts via `EVAL` or `EVALSHA` in Redis?",
        options: [
          "Complex multi-step logic runs atomically on the Redis server without network roundtrips between steps",
          "It compiles Lua to C++ assembly for multi-threaded CPU execution",
          "It bypasses the Redis memory limit",
          "It automatically replicates scripts to relational databases"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Lua Scripting & Atomicity"
      },
      {
        question: "Find the Error: Why is Redis Pub/Sub NOT suitable as a persistent message queue in mission-critical payment workflows?",
        options: [
          "Redis Pub/Sub is fire-and-forget; messages are NOT persisted and if a subscriber is disconnected or crashes, the message is permanently lost; use Redis Streams instead",
          "Pub/Sub only supports messages up to 10 bytes",
          "Subscribers can only be written in Python",
          "Pub/Sub commands block the entire database permanently"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Error Finding (Pub/Sub vs Streams)"
      },
      // Hard (7)
      {
        question: "In Redis Streams, what is the role of Consumer Groups (`XGROUP`, `XREADGROUP`, and `XACK`)?",
        options: [
          "They enable distributed message distribution among multiple workers with delivery guarantees, pending message tracking (PEL), and acknowledgment",
          "They group users by geographical region",
          "They automatically compress JSON payloads using brotli",
          "They shard keys across Redis Cluster nodes"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Redis Streams"
      },
      {
        question: "How does Redis Cluster distribute keys across multiple master nodes?",
        options: [
          "It divides the key space into 16,384 logical hash slots, hashing key names with `CRC16(key) mod 16384`",
          "It uses consistent hashing ring with virtual nodes",
          "It routes based on client IP addresses",
          "It distributes keys in round-robin sequence"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Clustering & Hash Slots"
      },
      {
        question: "What is a Hash Tag in Redis Cluster (e.g. `{user100}:profile` and `{user100}:orders`), and why is it used?",
        options: [
          "Only the text inside `{}` is hashed, guaranteeing that both keys map to the exact same hash slot on the same master node, enabling multi-key operations",
          "It tags keys for automatic deletion after 24 hours",
          "It encrypts the key name in the cluster metadata table",
          "It marks the key as high-priority in memory"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Hash Tags & Multi-Key Routing"
      },
      {
        question: "What is the HyperLogLog data structure (`PFADD`, `PFCOUNT`) in Redis used for?",
        options: [
          "Probabilistic approximation of cardinalities (unique count of elements) with a constant 12 KB memory footprint and ~0.81% standard error",
          "Storing sorted high-frequency time-series data",
          "Calculating geometric geographic coordinates",
          "Managing user authentication sessions"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Probabilistic Structures"
      },
      {
        question: "What is the Redlock algorithm proposed by Redis creator Salvatore Sanfilippo?",
        options: [
          "A distributed lock algorithm designed for multi-master independent Redis instances that acquires locks across N/2+1 instances to avoid single-point failure",
          "A security encryption protocol for Redis client-server traffic",
          "A deadlock detection tool for relational SQL databases",
          "A compression algorithm for large AOF logs"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Distributed Systems & Redlock"
      },
      {
        question: "What does the Redis `CLIENT PAUSE` command do, and when is it typically used in production infrastructure?",
        options: [
          "Suspends all incoming client requests for a specified duration, useful during controlled cluster failover or migration to prevent write divergence",
          "Pauses CPU cooling fans to save energy",
          "Locks out a specific abusive client IP address",
          "Terminates all idle client connections"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Operations & Failover"
      },
      {
        question: "Why should `WATCH` (optimistic locking) be used before a `MULTI`/`EXEC` block in Redis?",
        options: [
          "It monitors one or more keys; if any monitored key is modified by another client before `EXEC` runs, the entire transaction aborts safely",
          "It writes transaction logs to external syslog servers",
          "It measures the execution runtime of the commands",
          "It prevents the client from disconnecting during execution"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Optimistic Locking (WATCH)"
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 7. FIREBASE & FIRESTORE — Non-Coding (22 MCQs: Rules, Queries & NoSQL)
  // ─────────────────────────────────────────────────────────────────────────
  firebase: {
    codingPool: [],
    mcqPool: [
      // Easy (7)
      {
        question: "In Cloud Firestore, what is the fundamental data model structure?",
        options: [
          "Documents stored inside collections, where documents can also contain subcollections",
          "Relational tables with foreign key constraints",
          "Key-value pairs stored in contiguous binary blocks",
          "Graph nodes connected by weighted vertices"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Data Model"
      },
      {
        question: "Find the Error: Why is this Firebase Security Rule dangerous in production?\n`rules_version = '2'; service cloud.firestore { match /databases/{database}/documents { match /{document=**} { allow read, write: if true; } } }`",
        options: [
          "It allows anyone on the internet to read, modify, and delete the entire database without authentication or validation",
          "It causes syntax errors on Firestore compilation",
          "It restricts reads to only admin users",
          "Rules must specify a port number"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Error Finding (Security Rules)"
      },
      {
        question: "Which Firebase service provides seamless user authentication via email/password, phone, and OAuth providers (Google, GitHub, Apple)?",
        options: ["Firebase Authentication", "Cloud Functions", "Firebase Hosting", "Cloud Firestore"],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Authentication"
      },
      {
        question: "How do Firestore real-time listeners (`onSnapshot`) notify clients of database changes?",
        options: [
          "Via persistent WebSocket / streaming gRPC connection pushing document delta changes immediately to the client SDK",
          "By polling the server every 5 seconds over HTTP GET",
          "By sending SMS notifications to the client device",
          "Clients must manually refresh the page"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Realtime Listeners"
      },
      {
        question: "What is the maximum size allowed for a single document in Cloud Firestore?",
        options: ["1 MiB (1,048,576 bytes)", "10 MiB", "100 KiB", "16 MiB (like MongoDB)"],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Document Limits"
      },
      {
        question: "Query Selection: Which Firestore client method is used to listen to real-time updates on a query or document?",
        options: ["onSnapshot()", "get()", "fetch()", "subscribe()"],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Client API"
      },
      {
        question: "What is the difference between Cloud Firestore and the legacy Firebase Realtime Database?",
        options: [
          "Firestore scales automatically across multi-regions, uses document/collection structure, and supports complex queries; Realtime Database is a single large JSON tree",
          "Realtime Database only works offline; Firestore requires constant 5G connection",
          "Firestore is relational and supports SQL queries",
          "There is no difference"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Firestore vs Realtime DB"
      },
      // Medium (8)
      {
        question: "Find the Error: What error will Firestore throw when executing this query without a composite index?\n`query(collection(db, 'orders'), where('status', '==', 'COMPLETED'), orderBy('createdAt', 'desc'))`",
        options: [
          "Firestore requires a composite index for compound queries combining equality filters on one field with range/order filters on another field",
          "Firestore does not support `where` and `orderBy` in the same query",
          "`orderBy` must always come before `where` in the query chain",
          "Dates cannot be sorted in Firestore"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Error Finding (Composite Indexes)"
      },
      {
        question: "In Cloud Firestore, are queries 'shallow' or 'deep' by default?",
        options: [
          "Queries are strictly shallow; querying a collection retrieves documents in that collection only, never returning documents from nested subcollections",
          "Queries are deep; querying a collection automatically downloads all subcollections and their children",
          "Queries only download document IDs, never field data",
          "Queries download the entire database into local storage"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Query Mechanics"
      },
      {
        question: "Query Selection: How do you query across ALL subcollections named 'reviews' regardless of their parent document hierarchy in Firestore?",
        options: [
          "Use a Collection Group query: `collectionGroup(db, 'reviews')` with appropriate security rules and composite index",
          "Query the root collection and map over subcollections in memory",
          "Use a wild card root query: `collection(db, '*/reviews')`",
          "Firestore does not support querying across subcollections"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Query Writing (Collection Group)"
      },
      {
        question: "What is the limitation regarding inequality operators (`<`, `<=`, `>`, `>=`) across multiple distinct fields in a single Firestore query?",
        options: [
          "Inequality and range filters are restricted to a single field across the entire query; you cannot filter on `age > 18` AND `score < 50` in one query",
          "Inequality operators can be used across up to 10 distinct fields",
          "Inequality operators are only supported for string types",
          "Inequalities require raw SQL parsing"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Query Limitations"
      },
      {
        question: "How do Firestore Atomic Batches (`writeBatch()`) and Transactions (`runTransaction()`) differ?",
        options: [
          "Batches execute multiple writes atomically without reading; Transactions allow reading existing documents and executing conditional writes with automatic retry on conflict",
          "Batches are not atomic; Transactions are atomic",
          "Transactions can only modify a single document",
          "Batches can only be used on the server"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Batches vs Transactions"
      },
      {
        question: "Find the Error: What bug occurs in this Firebase Security Rule?\n`match /users/{userId} { allow write: if request.auth.uid == userId; }`",
        options: [
          "It crashes with a null evaluation error if an unauthenticated user sends a write because `request.auth` is null; it must check `request.auth != null && ...`",
          "Variables cannot be named `{userId}` in rules",
          "`request.auth.uid` does not exist in Firebase rules",
          "Rules must specify an HTTP verb like POST"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Error Finding (Rules Null Safety)"
      },
      {
        question: "What is the maximum write throughput limit to a single document in Cloud Firestore before performance degrades due to contention?",
        options: [
          "Approximately 1 write per second to a single document",
          "1,000 writes per second to a single document",
          "Unlimited writes per second",
          "50 writes per minute"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Write Throughput & Hotspots"
      },
      {
        question: "How does Cloud Firestore handle offline persistence in Web and Mobile SDKs?",
        options: [
          "It caches written documents locally (IndexedDB / SQLite), executes local writes immediately (optimistic UI), and syncs with the cloud when network is restored",
          "It rejects all operations immediately when offline",
          "It queues requests in a local Redis instance",
          "It uses browser cookies to store database writes"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Offline Persistence"
      },
      // Hard (7)
      {
        question: "How do Distributed Counters solve the Firestore 1-write-per-second document hotspot limit?",
        options: [
          "By sharding the counter across N subcollection documents (shards), writing increments randomly to a shard, and summing the shards for reads",
          "By converting Firestore documents to Redis strings",
          "By using Cloud Storage text files instead of Firestore",
          "By disabling transaction verification on the server"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Distributed Counters"
      },
      {
        question: "What is the security risk of checking user roles in Firestore Security Rules by reading a user profile document via `get(/databases/$(database)/documents/users/$(request.auth.uid))`?",
        options: [
          "Each `get()` call inside rules counts as an additional billable document read and incurs network latency on every evaluation; custom claims in JWT tokens are preferred",
          "Security rules cannot call `get()`",
          "`get()` exposes the database to SQL injection",
          "`get()` caches results permanently across all users"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Security Rules & Custom Claims"
      },
      {
        question: "In Cloud Functions for Firebase (2nd Gen), what underlying Google Cloud technology powers function execution and concurrency?",
        options: [
          "Google Cloud Run (built on Knative and container images), allowing multiple concurrent requests per instance",
          "Google Kubernetes Engine (bare-metal VMs)",
          "App Engine Standard with Python 2.7",
          "Compute Engine raw virtual machines"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Cloud Functions 2nd Gen"
      },
      {
        question: "How does Firestore handle transactional contention when two clients attempt to write to the same document in `runTransaction()` simultaneously?",
        options: [
          "The transaction that finishes second is aborted, its entire update function is re-executed from scratch with the latest document snapshot, up to 5 times",
          "The second transaction throws an uncatchable exception",
          "The first transaction's data is overwritten without notice",
          "The server locks both clients out for 10 minutes"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Transaction Retries & Contention"
      },
      {
        question: "What does the Firebase Admin SDK bypass when accessing Firestore from a secure backend server?",
        options: [
          "It uses privileged service account credentials and completely bypasses all Firestore Security Rules",
          "It bypasses all network firewalls and TLS encryption",
          "It bypasses document size limits, allowing 100MB documents",
          "It bypasses billing quotas"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Admin SDK Privileges"
      },
      {
        question: "What is the purpose of Firebase App Check in modern production architectures?",
        options: [
          "It verifies that incoming API traffic originates from your legitimate app binary / authorized domain (using DeviceCheck, Play Integrity, or reCAPTCHA Enterprise)",
          "It checks whether the user has installed ad blockers",
          "It tests app UI responsiveness on mobile devices",
          "It audits code for syntax errors before deployment"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Firebase App Check"
      },
      {
        question: "How should you design schema models in Firestore to prevent unbounded array growth inside a single document?",
        options: [
          "Move growing relationship items (e.g. comments, chat messages) into a subcollection rather than appending into an array field that could exceed 1MB",
          "Store arrays as base64-encoded strings",
          "Compress arrays with gzip inside the document",
          "Create a new Firebase project per user"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Data Modeling Anti-patterns"
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 8. GCP (Google Cloud Platform) — Non-Coding (22 MCQs: Cloud Architecture)
  // ─────────────────────────────────────────────────────────────────────────
  gcp: {
    codingPool: [],
    mcqPool: [
      // Easy (7)
      {
        question: "What is Google Cloud's fully managed serverless compute platform for deploying containerized applications over HTTPS?",
        options: ["Cloud Run", "Compute Engine", "Cloud Bigtable", "Cloud Spanner"],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Compute"
      },
      {
        question: "In GCP IAM (Identity and Access Management), what is the principle of least privilege?",
        options: [
          "Granting identities only the minimum necessary permissions required to perform their specific job tasks",
          "Assigning the Owner role to all developers for convenience",
          "Deleting all service accounts once a month",
          "Disabling two-factor authentication for automated pipelines"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "IAM"
      },
      {
        question: "Which Cloud Storage class is optimized for data accessed less than once a year with lowest storage costs (e.g. regulatory compliance backups)?",
        options: ["Archive Storage", "Standard Storage", "Nearline Storage", "Coldline Storage"],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Cloud Storage Classes"
      },
      {
        question: "What is BigQuery in Google Cloud Platform?",
        options: [
          "A serverless, highly scalable multi-cloud data warehouse designed for business agility with built-in machine learning",
          "A NoSQL key-value cache replacing Redis",
          "An operating system for bare-metal servers",
          "A client-side UI library"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "BigQuery"
      },
      {
        question: "Find the Error: Why is committing a GCP service account JSON private key file (`service-account.json`) to a public GitHub repository a critical security incident?",
        options: [
          "Anyone who obtains the private key can impersonate the service account and exercise all its IAM permissions across your Google Cloud project",
          "Google Cloud charges $1,000 for public git commits",
          "Service accounts cannot execute from external IPs",
          "GitHub blocks all repositories that contain JSON files"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Error Finding (Credential Leakage)"
      },
      {
        question: "Which GCP networking service provides global anycast IP routing and distributes HTTP/S traffic across multiple backend regions?",
        options: ["Cloud Load Balancing (External Application Load Balancer)", "Cloud NAT", "VPC Peering", "Cloud Router"],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Networking"
      },
      {
        question: "What service in GCP provides a global asynchronous messaging backbone decoupling services that produce events from services that process events?",
        options: ["Cloud Pub/Sub", "Cloud Tasks", "Cloud Endpoints", "Cloud Datastore"],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Pub/Sub"
      },
      // Medium (8)
      {
        question: "Find the Error: Why is a BigQuery query scanning 10 TB of data on a table partitioned by date when the query includes `WHERE date = '2024-01-01'`?",
        options: [
          "The query wrapped the partition column in a function (e.g. `WHERE DATE(timestamp_col) = ...`), preventing partition pruning; use direct column comparisons to prune partitions",
          "BigQuery always scans 100% of the entire dataset regardless of filters",
          "BigQuery tables cannot be queried using SQL",
          "Partitioning is only supported on string columns"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Error Finding (BigQuery Partition Pruning)"
      },
      {
        question: "What is the key difference between Google Cloud Spanner and Cloud SQL?",
        options: [
          "Cloud Spanner provides globally distributed ACID transactions with 99.999% availability and horizontal scaling; Cloud SQL is regional (MySQL/Postgres/SQL Server)",
          "Cloud Spanner is an in-memory Redis cache; Cloud SQL is a data warehouse",
          "Cloud SQL does not support SQL transactions",
          "Cloud Spanner is an unmanaged VM running MongoDB"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Databases (Spanner vs SQL)"
      },
      {
        question: "In GCP VPC networking, what is Private Google Access?",
        options: [
          "It allows Compute Engine VM instances that have ONLY internal IP addresses (no external public IPs) to reach Google APIs and services securely",
          "It connects GCP projects to on-premises datacenters via dedicated dark fiber",
          "It encrypts user passwords in browser local storage",
          "It restricts GCP access to Google employees only"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "VPC & Networking"
      },
      {
        question: "What is Workload Identity Federation in Google Cloud, and why is it recommended over downloading Service Account keys?",
        options: [
          "It allows workloads outside GCP (e.g. AWS, GitHub Actions) to impersonate GCP service accounts using short-lived OIDC tokens without storing long-lived keys",
          "It automatically migrates AWS EC2 instances to Google Cloud Run",
          "It stores all user passwords in a centralized relational database",
          "It forces developers to log in with hardware USB keys"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Workload Identity Federation"
      },
      {
        question: "Find the Error: Why does a Cloud Run service fail with HTTP 504 Gateway Timeout during sudden traffic spikes from 0 to 1,000 requests?",
        options: [
          "Cold-start latency during container initialization combined with low maximum instance concurrency settings caused queue exhaustion",
          "Cloud Run does not support traffic greater than 10 requests per minute",
          "Cloud Run cannot scale from zero instances",
          "Containers must always be running on 10 dedicated VMs"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Error Finding (Cloud Run Cold Starts)"
      },
      {
        question: "What is the difference between Cloud Pub/Sub Push and Pull subscriptions?",
        options: [
          "Push sends messages via HTTP POST to an HTTPS endpoint; Pull requires subscriber workers to initiate gRPC/REST requests to retrieve and acknowledge messages",
          "Pull is real-time while Push is batch-processed once a week",
          "Push can only deliver to mobile phones via SMS",
          "There is no difference in architecture"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Pub/Sub Subscriptions"
      },
      {
        question: "How does Cloud Armor protect Google Cloud workloads against DDoS and web application attacks?",
        options: [
          "It integrates with Cloud Load Balancing to provide layer 3, 4, and 7 DDoS protection, rate limiting, and WAF rules (OWASP Top 10 mitigation) at Google's network edge",
          "It scans source code for bugs before deployment",
          "It encrypts hard drives on Compute Engine instances",
          "It requires all users to solve CAPTCHAs before accessing DNS"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Security & Cloud Armor"
      },
      {
        question: "What is the purpose of BigQuery Table Clustering alongside Table Partitioning?",
        options: [
          "Clustering sorts table data based on the contents of one or more specified columns, improving query performance and reducing scanned bytes on selective filters",
          "Clustering duplicates tables across 50 data centers",
          "Clustering compresses data using ZIP compression",
          "Clustering converts relational tables into NoSQL graphs"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "BigQuery Optimization"
      },
      // Hard (7)
      {
        question: "How does Cloud Spanner achieve external consistency (serializability) across globally distributed nodes without lock manager bottlenecks?",
        options: [
          "Using the TrueTime API, which leverages GPS receivers and atomic clocks in Google data centers to bound clock uncertainty",
          "By routing all global writes through a single master node located in Iowa",
          "By disabling concurrent read queries during write commits",
          "By executing writes using blockchain consensus algorithms"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Spanner Internals & TrueTime"
      },
      {
        question: "In Google Kubernetes Engine (GKE), what is the architectural difference between GKE Standard and GKE Autopilot?",
        options: [
          "Autopilot manages the entire underlying cluster infrastructure including node provisioning, scaling, security hardening, and OS patches per pod consumption",
          "Standard mode is completely free of charge",
          "Autopilot does not run Kubernetes pods",
          "Standard mode runs only Windows containers"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "GKE Standard vs Autopilot"
      },
      {
        question: "What does GCP VPC Service Controls (VPC SC) enforce to prevent data exfiltration?",
        options: [
          "It creates a security perimeter around multi-tenant Google Cloud services (like GCS, BigQuery), blocking access and data transfers from unauthorized networks or identities",
          "It blocks all outgoing email traffic from VMs",
          "It prevents employees from accessing social media websites",
          "It acts as an antivirus on Linux operating systems"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Data Exfiltration & VPC SC"
      },
      {
        question: "How does Google Cloud Secret Manager handle automatic secret rotation and application retrieval?",
        options: [
          "It manages versioned secrets, supports Cloud Pub/Sub rotation topic notifications to Cloud Functions, and grants access via granular IAM roles",
          "It writes secrets to a plain text file in the root directory",
          "It sends passwords via Slack webhook to engineers",
          "It changes the database password without informing the database"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Secrets Management"
      },
      {
        question: "In Cloud Spanner, what causes a 'hotspotting' anti-pattern on sequential primary keys (such as auto-incrementing IDs or current timestamps)?",
        options: [
          "All incoming writes target the exact same split/tablet at the end of the sorted keyspace, overwhelming a single server instead of spreading across the cluster",
          "The database runs out of ID numbers",
          "Spanner does not support integer data types",
          "Sequential keys cause index corruption"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Database Hotspotting"
      },
      {
        question: "What is Cloud Interconnect Dedicated vs Partner Interconnect in hybrid cloud enterprise architectures?",
        options: [
          "Dedicated provides direct physical fiber cross-connect (10G/100G) to Google networks; Partner connects through a supported service provider router",
          "Dedicated is public internet VPN; Partner is satellite link",
          "Partner interconnect does not support SLA guarantees",
          "Dedicated interconnect can only transfer 100MB per day"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Hybrid Cloud & Networking"
      },
      {
        question: "What is the purpose of BigQuery BI Engine in analytical reporting pipelines?",
        options: [
          "An in-memory analysis service that accelerates SQL queries by caching tables in memory and generating vectorized SQL execution plans for sub-second dashboards",
          "A business intelligence visual chart designer",
          "An automated billing calculator for BigQuery",
          "A data migration tool for Excel spreadsheets"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "BI Engine & In-Memory Acceleration"
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 9. NUMPY (Scientific Computing) — Coding & Query/Error Finding
  // ─────────────────────────────────────────────────────────────────────────
  numpy: {
    codingPool: [
      {
        id: "numpy_task_1",
        title: "Vectorized Normalization & Z-Score",
        instructions: "Implement `normalize_matrix(data)` using Python. Given a 2D matrix (list of lists of floats), compute the mean and standard deviation of each column. Return a new 2D matrix where each element is normalized by subtracting the column mean and dividing by the column standard deviation (or 0.0 if standard deviation is zero).",
        initialCode: `def normalize_matrix(data: list) -> list:
    if not data or not data[0]:
        return []
    rows = len(data)
    cols = len(data[0])
    # Compute column means
    means = [sum(data[r][c] for r in range(rows)) / rows for c in range(cols)]
    # Compute column stds
    stds = []
    for c in range(cols):
        variance = sum((data[r][c] - means[c]) ** 2 for r in range(rows)) / rows
        stds.append(variance ** 0.5)
    # Normalize
    result = []
    for r in range(rows):
        row = []
        for c in range(cols):
            val = (data[r][c] - means[c]) / stds[c] if stds[c] > 1e-9 else 0.0
            row.append(round(val, 4))
        result.append(row)
    return result
`,
        language: "python",
        supportedLanguages: PYTHON_LANGS
      }
    ],
    mcqPool: [
      // Easy (5)
      {
        question: "In NumPy, what is the primary memory and performance advantage of an `ndarray` over a standard Python `list`?",
        options: [
          "An `ndarray` stores elements in a contiguous block of homogeneous memory, allowing cache-friendly vectorized C-level operations without Python object pointer overhead",
          "NumPy arrays automatically compress data with gzip",
          "Python lists cannot store floating point numbers",
          "NumPy arrays run exclusively on the GPU"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Memory & Data Structures"
      },
      {
        question: "What is the output of `np.zeros((3, 4)).shape`?",
        options: ["(3, 4)", "(12,)", "(4, 3)", "12"],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Shape & Dimensions"
      },
      {
        question: "Which NumPy function is used to create an array of evenly spaced numbers over a specified interval (e.g. 50 points between 0 and 1)?",
        options: ["np.linspace(0, 1, 50)", "np.arange(0, 1, 50)", "np.interval(0, 1, 50)", "np.range(0, 1, 50)"],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Array Creation"
      },
      {
        question: "Find the Error: What happens in this NumPy code snippet?\n`import numpy as np\na = np.array([1, 2, 3])\nb = np.array([4, 5])\nc = a + b`",
        options: [
          "It raises a `ValueError: operands could not be broadcast together with shapes (3,) (2,)`",
          "It concatenates the arrays into `[1, 2, 3, 4, 5]`",
          "It pads `b` with zero and returns `[5, 7, 3]`",
          "It truncates `a` and returns `[5, 7]`"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Error Finding (Broadcasting Mismatch)"
      },
      {
        question: "How do you calculate the element-wise square root of every element in a NumPy array `arr`?",
        options: ["np.sqrt(arr)", "arr.sqrt()", "math.sqrt(arr)", "np.power(arr, 0.25)"],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Universal Functions"
      },
      // Medium (5)
      {
        question: "Find the Error: What bug occurs in this NumPy slice mutation?\n`a = np.array([10, 20, 30, 40])\nb = a[:2]\nb[0] = 999`",
        options: [
          "Basic slicing in NumPy returns a *view* of the original array, NOT a copy; modifying `b[0]` mutates `a[0]` to 999 as well",
          "Slicing in NumPy throws a ReadOnlyError",
          "`b` is an immutable tuple that cannot be assigned to",
          "`a` is unaffected because slices always create deep copies"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Error Finding (Views vs Copies)"
      },
      {
        question: "According to NumPy broadcasting rules, when are two dimensions considered compatible?",
        options: [
          "When they are equal, or when one of the dimensions is 1",
          "When both dimensions are even numbers",
          "When the sum of the dimensions is divisible by 4",
          "Only when both shapes are identical in every dimension"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Broadcasting Rules"
      },
      {
        question: "Query Selection: Which NumPy operation efficiently replaces all negative numbers in array `arr` with zero without creating Python loops?",
        options: [
          "`np.where(arr < 0, 0, arr)` (or `np.maximum(arr, 0)`)",
          "`[0 if x < 0 else x for x in arr]`",
          "`arr.filter(lambda x: x >= 0)`",
          "`np.clip_negative(arr)`"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Query / Masking"
      },
      {
        question: "What is the difference between `np.dot(A, B)` and `A * B` for two 2D square matrices?",
        options: [
          "`A * B` performs element-wise multiplication; `np.dot(A, B)` (or `A @ B`) performs matrix multiplication (dot product of rows and columns)",
          "`A * B` performs matrix multiplication; `np.dot` is only for vectors",
          "They produce the exact same mathematical result",
          "`np.dot` transposes both matrices before multiplying"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Linear Algebra"
      },
      {
        question: "Find the Error: What happens in this integer overflow snippet on a 32-bit integer array?\n`a = np.array([2000000000], dtype=np.int32)\nb = a * 2`",
        options: [
          "It silently overflows in C without raising an exception, returning a negative integer wrap-around value",
          "Python automatically promotes it to an arbitrary precision `int`",
          "NumPy raises a fatal `OverflowError`",
          "The array value is clamped to `INT_MAX`"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Error Finding (Data Type Overflow)"
      },
      // Hard (5)
      {
        question: "What is the architectural difference between C-order (row-major) and Fortran-order (column-major) memory layouts in NumPy `strides`?",
        options: [
          "In C-order, consecutive elements of a row are contiguous in memory (last axis has stride equal to itemsize); in F-order, consecutive elements of a column are contiguous (first axis has stride equal to itemsize)",
          "C-order is stored on the CPU; F-order is stored on the GPU",
          "C-order only supports 32-bit floats; F-order supports 64-bit doubles",
          "There is no difference in memory addressing or cache locality"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Memory Strides & Layout"
      },
      {
        question: "What does `np.einsum('ij,jk->ik', A, B)` compute using Einstein summation convention?",
        options: [
          "Matrix multiplication of 2D arrays A and B",
          "Sum of all elements in matrices A and B",
          "Element-wise outer product",
          "Matrix inversion of A with respect to B"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Einstein Summation (np.einsum)"
      },
      {
        question: "Why does boolean indexing (e.g. `arr[arr > 5]`) always return a 1D array, and does it return a view or a copy?",
        options: [
          "It returns a 1D array because the number of matching elements per dimension is non-rectangular, and it ALWAYS returns a copy (not a view)",
          "It returns a 2D view sharing memory with `arr`",
          "It modifies `arr` in-place and returns None",
          "It returns a generator object"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Fancy Indexing & Memory"
      },
      {
        question: "What is the purpose of `np.lib.stride_tricks.as_strided` and why is it considered dangerous if misconfigured?",
        options: [
          "It creates an ndarray view with custom strides without copying data; if bounds/strides are incorrect, it will read/write out-of-bounds process memory causing segfaults",
          "It converts Python bytecode into C extensions",
          "It encrypts array memory",
          "It deletes unused memory pages"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Stride Tricks & Safety"
      },
      {
        question: "How does NumPy utilize BLAS and LAPACK libraries (such as OpenBLAS or Intel MKL) under the hood?",
        options: [
          "NumPy links to optimized vendor BLAS/LAPACK routines compiled with multi-threaded SIMD instructions (AVX-512) for high-performance matrix and linear algebra computations",
          "BLAS is an HTTP proxy for cloud calculations",
          "LAPACK is a Python wrapper around SQLite",
          "They are only used when running Python scripts in Jupyter notebooks"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "BLAS & Hardware Acceleration"
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 10. GIT & GITHUB — Non-Coding (22 MCQs: Commands, Merge Conflicts & Workflows)
  // ─────────────────────────────────────────────────────────────────────────
  git: {
    codingPool: [],
    mcqPool: [
      // Easy (7)
      {
        question: "Query Selection: Which Git command creates a new branch named 'feature-auth' and switches your working directory to it in one step?",
        options: [
          "`git checkout -b feature-auth` (or `git switch -c feature-auth`)",
          "`git branch feature-auth`",
          "`git create branch feature-auth`",
          "`git commit -m 'feature-auth'`"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Command Selection (Branching)"
      },
      {
        question: "What is the function of the Git staging area (index)?",
        options: [
          "An intermediate holding area where changes are prepared and formatted before being recorded into a commit",
          "A remote backup server hosted by GitHub",
          "A trash directory for permanently deleted files",
          "A cache for storing compiled binaries"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Core Concepts"
      },
      {
        question: "Find the Error: What happens if you run `git add .` in a project directory that does NOT contain a `.gitignore` file?",
        options: [
          "All files including sensitive `.env` credential files, `node_modules`, build binaries, and IDE caches will be staged for commit",
          "Git will abort with an error stating .gitignore is required",
          "Git automatically encrypts all untracked files",
          "Git deletes untracked files from disk"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Error Finding (.gitignore Hygiene)"
      },
      {
        question: "Which command shows the chronological history of commits in the current Git branch?",
        options: ["git log", "git status", "git diff", "git show"],
        answerIndex: 0,
        difficulty: "easy",
        topic: "History & Inspection"
      },
      {
        question: "What is the difference between `git pull` and `git fetch`?",
        options: [
          "`git fetch` downloads remote objects and updates remote-tracking branches without modifying local working files; `git pull` runs `git fetch` followed by `git merge`",
          "`git pull` only downloads tags; `git fetch` downloads commits",
          "`git fetch` deletes untracked files; `git pull` does not",
          "There is no difference"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Fetch vs Pull"
      },
      {
        question: "What is the role of `.git` directory located at the root of a repository?",
        options: [
          "It contains the entire Git object database, commit history, refs, configuration, and index for the repository",
          "It is a temporary cache that can be safely deleted at any time without losing history",
          "It stores GitHub website stylesheets",
          "It holds the uncompressed source code for the git compiler"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Repository Internals"
      },
      {
        question: "Query Selection: Which command discards all unstaged local modifications in a specific file `app.js` and restores it to the HEAD state?",
        options: ["`git restore app.js` (or `git checkout -- app.js`)", "`git rm app.js`", "`git commit app.js`", "`git stash drop app.js`"],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Command Selection (Restoring Files)"
      },
      // Medium (8)
      {
        question: "Find the Error: What does the warning 'You are in 'detached HEAD' state' mean in Git, and what is the danger of committing in this state?",
        options: [
          "HEAD points directly to a commit SHA rather than a branch name; any new commits made here are not reachable by any branch and will be orphaned / garbage collected unless a branch is created",
          "The repository database has become corrupted and must be re-cloned",
          "The remote GitHub origin has deleted your account",
          "You are forbidden from making edits until a merge occurs"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Error Finding (Detached HEAD)"
      },
      {
        question: "What is the architectural difference between `git merge` and `git rebase` when integrating feature branch changes into main?",
        options: [
          "`git merge` preserves complete history and creates a 3-way merge commit joining the branches; `git rebase` rewrites history by replaying feature commits on top of main, creating a linear history",
          "`git rebase` is read-only; `git merge` deletes commits",
          "`git merge` can only be used on GitHub",
          "`git rebase` creates a merge commit for every single file"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Merge vs Rebase"
      },
      {
        question: "Query Selection: You accidentally deleted a local branch with `git branch -D my-feature` containing 5 commits. Which command allows you to locate the lost commit SHA and recover the branch?",
        options: [
          "`git reflog` to find the lost commit SHA, then `git checkout -b my-feature <SHA>`",
          "`git pull --all`",
          "`git fsck --lost`",
          "`git reset --hard origin/main`"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Query / Recovery (git reflog)"
      },
      {
        question: "What is the difference between `git reset --soft HEAD~1` and `git reset --hard HEAD~1`?",
        options: [
          "`--soft` undoes the commit but leaves changes staged in the index; `--hard` undoes the commit and completely discards all working directory and index changes",
          "`--soft` deletes files permanently; `--hard` preserves files",
          "`--soft` pushes changes to GitHub automatically",
          "There is no difference in working directory state"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Reset Modes"
      },
      {
        question: "Query Selection: Which command applies the exact changes from a specific commit on another branch onto your current branch without merging the whole branch?",
        options: ["`git cherry-pick <commit-hash>`", "`git merge <commit-hash>`", "`git rebase <commit-hash>`", "`git clone <commit-hash>`"],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Command Selection (Cherry-pick)"
      },
      {
        question: "Find the Error: Why should you NEVER run `git push --force` on a shared public branch (like `main` or `develop`) with multiple collaborating engineers?",
        options: [
          "It overwrites the remote branch history with your local history, destroying upstream commits pushed by other teammates and breaking their local repositories",
          "GitHub terminates the repository owner's account immediately",
          "It converts all git commits into SVN format",
          "Git push cannot be forced on branches named main"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Error Finding (Force Pushes)"
      },
      {
        question: "What are conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) left in a source file by Git during a merge or rebase?",
        options: [
          "Markers delineating overlapping conflicting edits between current branch (HEAD) and the incoming branch that require manual developer resolution before staging",
          "Syntax errors in the programming language",
          "Git compiler binary directives",
          "HTML tags generated by GitHub webhooks"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Merge Conflicts"
      },
      {
        question: "How does `git stash pop` differ from `git stash apply`?",
        options: [
          "`git stash pop` restores the stashed changes and immediately drops the stash entry from the list; `git stash apply` restores changes while keeping the stash entry stored",
          "`git stash pop` discards changes without applying them",
          "`git stash apply` commits changes directly to main",
          "There is no difference"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Stashing"
      },
      // Hard (7)
      {
        question: "How does `git bisect` assist in tracking down regressions in a large codebase?",
        options: [
          "It performs a binary search through the commit history between a known good commit and bad commit, checking out commits for automated or manual testing to pinpoint the exact breaking commit in O(log N) steps",
          "It decompiles binary executables to find buffer overflows",
          "It splits a monolithic git repository into microservices",
          "It formats code according to Prettier standards"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Debugging (git bisect)"
      },
      {
        question: "What are the four fundamental object types stored in the Git content-addressable object database (`.git/objects/`)?",
        options: [
          "blob (file contents), tree (directory structure & filenames), commit (metadata, tree pointer, parent pointers), and tag (annotated references)",
          "file, folder, branch, remote",
          "json, yaml, xml, text",
          "header, payload, signature, digest"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Git Internals & Object Types"
      },
      {
        question: "What is an interactive rebase (`git rebase -i HEAD~4`), and what does the `squash` (or `fixup`) command do inside it?",
        options: [
          "Combines the marked commit into the previous commit, consolidating multiple small commits into a single clean commit with unified message",
          "Deletes the commit without changing working files",
          "Converts the commit into an SVN patch",
          "Splits the commit into two separate files"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Interactive Rebase (Squashing)"
      },
      {
        question: "Why is `git push --force-with-lease` safer than `git push --force` in collaborative workflows?",
        options: [
          "It will only force-push if no one has updated the remote branch since your last fetch; if remote has unseen commits, the push is rejected to protect teammate work",
          "It requests permission from the repository admin via email",
          "It creates an automatic git tag before pushing",
          "It encrypts the commit messages with GPG"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Safe Force Pushing"
      },
      {
        question: "In GitHub Actions workflows, what is the security difference between the `pull_request` event and `pull_request_target` event?",
        options: [
          "`pull_request_target` runs in the context of the base repository and has access to repository secrets even for fork PRs; executing untrusted fork code in it exposes secrets to malicious injection",
          "`pull_request` has root SSH access to GitHub servers",
          "`pull_request_target` is deprecated in GitHub Actions",
          "There is no difference in security contexts"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "GitHub Actions Security"
      },
      {
        question: "What does `git clean -fd` do, and why should it be used with caution?",
        options: [
          "Recursively and irreversibly deletes all untracked files and untracked directories from the working tree; deleted files are NOT in git history and cannot be recovered via reflog",
          "Deletes all git branches",
          "Cleans up remote git repositories",
          "Formats source code indentation"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Working Tree Hygiene (git clean)"
      },
      {
        question: "What is the purpose of Git Submodules vs Git Subtrees when incorporating external repositories into a project?",
        options: [
          "Submodules maintain an external link to a specific commit SHA of a separate repository; Subtrees embed the external repository's code and history directly into the host repository",
          "Submodules can only be used on private repositories",
          "Subtrees require Docker to be installed",
          "There is no architectural difference"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Submodules vs Subtrees"
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 11. R (Statistical Computing & Data Analysis) — Non-Coding (22 MCQs: Query & Errors)
  // ─────────────────────────────────────────────────────────────────────────
  r: {
    codingPool: [],
    mcqPool: [
      // Easy (7)
      {
        question: "In R, what is the default behavior when performing arithmetic operations between two vectors of unequal length (e.g. `c(1, 2, 3, 4) + c(10, 20)`)?",
        options: [
          "Vector recycling rule: the shorter vector is repeated/recycled to match the length of the longer vector (yielding `c(11, 22, 13, 24)`)",
          "R throws an uncatchable syntax error and halts execution",
          "The longer vector is truncated to match the shorter vector",
          "The shorter vector is padded with NAs"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Vector Recycling"
      },
      {
        question: "What is the difference between `NA` and `NULL` in R?",
        options: [
          "`NA` represents a missing or unknown value of a specific data type; `NULL` represents the empty object / absence of a value or vector",
          "`NULL` represents zero; `NA` represents infinity",
          "`NA` is only used in strings; `NULL` is only used in integers",
          "There is no difference"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Missing Values & NULL"
      },
      {
        question: "Which tidyverse package in R is primarily designed for data manipulation (filtering rows, selecting columns, grouping, and mutating)?",
        options: ["dplyr", "ggplot2", "tidyr", "stringr"],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Tidyverse & dplyr"
      },
      {
        question: "Find the Error: What happens in this R boolean comparison?\n`x <- c(10, NA, 30)\nx == NA`",
        options: [
          "Comparing with `== NA` yields `c(NA, NA, NA)` because comparison with unknown is unknown; use `is.na(x)` instead",
          "It throws a compile-time syntax error",
          "It returns `c(FALSE, TRUE, FALSE)`",
          "It converts `x` to a character vector"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Error Finding (is.na)"
      },
      {
        question: "What indexing operator in R extracts the actual content of an element from a list rather than returning a sublist?",
        options: ["`[[ ]]` (or `$`)", "`[ ]`", "`{ }`", "`< >`"],
        answerIndex: 0,
        difficulty: "easy",
        topic: "List Indexing"
      },
      {
        question: "What is a 'factor' in R, and what is its primary use?",
        options: [
          "A statistical data structure used to store categorical variables with fixed predefined levels",
          "A function that computes mathematical prime factors",
          "A database connection object",
          "A floating point precision setting"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Factors"
      },
      {
        question: "In ggplot2, what function specifies which variables in the data frame map to visual properties of the plot (x, y, color, size)?",
        options: ["aes()", "geom()", "theme()", "scale()"],
        answerIndex: 0,
        difficulty: "easy",
        topic: "ggplot2 Aesthetics"
      },
      // Medium (8)
      {
        question: "Query Selection: Which dplyr pipeline correctly groups a dataframe `df` by `department` and calculates the average `salary` per department?",
        options: [
          "`df %>% group_by(department) %>% summarize(avg_salary = mean(salary, na.rm = TRUE))`",
          "`df %>% aggregate(salary ~ department, mean)`",
          "`df %>% select(department, salary) %>% filter(mean)`",
          "`df %>% mutate(department = mean(salary))`"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Query Writing (dplyr)"
      },
      {
        question: "Find the Error: Why does this R script crash or produce unexpected results when subsetting a single column?\n`col <- my_data[, 'age']`",
        options: [
          "By default, standard data frame subsetting with single bracket drops dimensions to a vector (`drop = TRUE`); using `my_data[, 'age', drop = FALSE]` preserves data frame structure",
          "Column names must be passed as integers",
          "R does not allow indexing by column names",
          "`drop` defaults to FALSE in R data frames"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Error Finding (Dimension Dropping)"
      },
      {
        question: "What is the difference between `lapply()` and `sapply()` in base R?",
        options: [
          "`lapply()` always returns a list of results; `sapply()` attempts to simplify the result into a vector, matrix, or array where possible",
          "`sapply()` is multi-threaded; `lapply()` is single-threaded",
          "`lapply()` only operates on data frames",
          "There is no difference"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Apply Family"
      },
      {
        question: "Find the Error: What bug occurs when reading a CSV in R with `read.csv()` in R versions prior to 4.0?\n`df <- read.csv('survey.csv')`",
        options: [
          "String character columns were automatically converted into categorical `factor` objects by default (`stringsAsFactors = TRUE`), breaking string manipulation",
          "Missing values were converted to zeros",
          "File headers were stripped by default",
          "CSV files were limited to 100 rows"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Error Finding (stringsAsFactors)"
      },
      {
        question: "What is the performance advantage of the `data.table` package over standard base R `data.frame` for large datasets?",
        options: [
          "`data.table` provides in-place updates by reference (`:=`), fast binary search joins, and secondary indices with zero-copy semantics written in C",
          "`data.table` stores data in SQLite",
          "`data.table` runs on Apache Spark",
          "`data.table` disables garbage collection"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "data.table Performance"
      },
      {
        question: "In R, what is the difference between the pipe operators `|>` (native base R pipe in R 4.1+) and `%>%` (magrittr pipe)?",
        options: [
          "`|>` is built directly into the R syntax parser and evaluates without package dependencies; `%>%` is from the magrittr package and supports placeholder `.` in any position",
          "`|>` only works with ggplot2",
          "`%>%` is multi-threaded while `|>` is not",
          "There is no difference"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Pipe Operators"
      },
      {
        question: "What does the `tidyr::pivot_longer()` function do to a data frame in R?",
        options: [
          "It transforms 'wide' data with columns into 'long' data by collapsing multiple columns into key-value pairs (names_to, values_to)",
          "It adds empty rows to make the data longer",
          "It sorts data in descending order",
          "It joins two tables together"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Tidying Data (pivot_longer)"
      },
      {
        question: "How do environments and lexical scoping work in R function evaluation?",
        options: [
          "When a variable is not found in the local function environment, R searches enclosing lexical parent environments where the function was defined",
          "R always searches the global environment first before local scope",
          "Variables are looked up in alphabetical order",
          "R uses dynamic scoping exclusively"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Environments & Scoping"
      },
      // Hard (7)
      {
        question: "In R's internal memory model, what is Copy-on-Modify (Copy-on-Write) semantics, and how can it impact performance inside loops?",
        options: [
          "Modifying an object creates a shallow or deep duplicate copy in memory unless modified by reference; modifying a vector inside a loop can lead to quadratic O(N^2) memory allocation",
          "R never copies objects; all objects are global pointers",
          "Copy-on-modify only happens with character strings",
          "R uses reference counting to guarantee zero memory allocations"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Copy-on-Modify & Performance"
      },
      {
        question: "What is Non-Standard Evaluation (NSE) in R and rlang (tidy evaluation)?",
        options: [
          "Expressions are captured as symbols/quosures and evaluated in data context rather than immediately in the execution environment (enabling `df %>% filter(x > 5)`)",
          "Evaluation that ignores syntax errors",
          "Execution of Python code inside R",
          "Asynchronous callback evaluation"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Non-Standard Evaluation (NSE)"
      },
      {
        question: "What are S3 and S4 object systems in R, and how do they differ?",
        options: [
          "S3 is an informal, single-dispatch system based on class attributes and generic functions; S4 is a formal system with explicit class definitions, slot types, and multiple dispatch",
          "S3 runs on AWS S3; S4 runs on AWS S4",
          "S3 is deprecated; S4 is the only supported system",
          "S3 is for data frames; S4 is for integers"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "OOP Systems (S3 vs S4)"
      },
      {
        question: "How does the `Rcpp` package achieve high-performance acceleration in R computational pipelines?",
        options: [
          "It provides seamless bi-directional integration and data type mapping between R and C++, eliminating data copying overhead and compiling to native machine code",
          "It converts R scripts to JavaScript",
          "It executes R on Java Virtual Machines",
          "It replaces the R interpreter with Python"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Rcpp & Native Acceleration"
      },
      {
        question: "Find the Error: What bug occurs in this function closure in R?\n`make_adder <- function(x) { function(y) x + y }; add5 <- make_adder(x_val)` if `x_val` is modified later in caller scope before evaluation?",
        options: [
          "Because of lazy evaluation in R, `x` is not evaluated until the returned closure is called; if `x_val` changes or goes out of scope, unexpected values are computed unless `force(x)` is called",
          "Closures cannot return inner functions in R",
          "R functions cannot take parameters named `y`",
          "`x + y` fails if `x` and `y` are numbers"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Error Finding (Lazy Evaluation & force)"
      },
      {
        question: "What is the purpose of the `purrr` package in functional R programming?",
        options: [
          "Provides a consistent, type-safe suite of functional tools (`map()`, `map_dbl()`, `walk()`) with predictable return types and enhanced error handling",
          "Generates random cat sounds for notifications",
          "Compresses data frames using gzip",
          "Connects R to PostgreSQL databases"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Functional Programming (purrr)"
      },
      {
        question: "What is the difference between `vapply()` and `sapply()` in base R, and why is `vapply()` considered best practice in production packages?",
        options: [
          "`vapply()` requires an explicit expected return type template (e.g. `FUN.VALUE = numeric(1)`), guaranteeing type safety and failing immediately on unexpected output",
          "`vapply()` runs on GPU cores while `sapply()` runs on CPU",
          "`vapply()` returns data frames exclusively",
          "`vapply()` is slower than `sapply()`"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Type Safety (vapply)"
      }
    ]
  }
};
