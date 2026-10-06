import type { MCQ } from "./content";

/**
 * High-Calibre Expanded Question Bank (~210 Verified Questions)
 * Sourced from official language specifications, RFCs, engine documentation,
 * and standard industry tech interview benchmarks.
 * 
 * Provides deep pools of Easy, Medium, and Hard questions across all skills
 * ensuring assessments can reliably deliver:
 * 5 Easy (1-5) + 5 Medium (6-10) + 5 Hard (11-15) in strict order.
 */

export const EXPANDED_MCQS: Record<string, MCQ[]> = {
  // ─── 1. REACT ─────────────────────────────────────────────────────────────
  react: [
    // Easy (4)
    {
      question: "In React, what is the primary purpose of the 'key' prop when rendering dynamic lists?",
      options: [
        "To uniquely identify DOM nodes for CSS styling",
        "To help React identify which items have changed, been added, or been removed during reconciliation",
        "To bind keyboard event shortcuts to the elements",
        "To sort array elements alphabetically"
      ],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Core React"
    },
    {
      question: "Which hook should be used to run side-effects (such as subscribing to an external API or setting a timer) after rendering?",
      options: ["useState", "useEffect", "useMemo", "useRef"],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Hooks"
    },
    {
      question: "What is the recommended way to handle a form input whose value is controlled by React state?",
      options: [
        "Directly mutating document.getElementById('input').value",
        "Providing a value prop paired with an onChange handler that updates state",
        "Using defaultValue with a setInterval poll",
        "Binding the input to a global window variable"
      ],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Forms"
    },
    {
      question: "What does the useRef hook return?",
      options: [
        "A tuple containing the current state and an updater function",
        "A mutable object with a .current property whose value persists across renders without causing re-renders",
        "A read-only snapshot of the virtual DOM",
        "A function that triggers a synchronous force-update"
      ],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Hooks"
    },
    // Medium (5)
    {
      question: "When should you use the useTransition hook introduced in React 18?",
      options: [
        "To create CSS slide-in and fade-out animations",
        "To mark state updates as non-urgent transitions, keeping the user interface responsive during heavy re-renders",
        "To navigate between Next.js pages synchronously",
        "To cancel pending HTTP fetch requests"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Concurrent React"
    },
    {
      question: "Why should cleanup functions returned from useEffect be idempotent?",
      options: [
        "Because React in StrictMode (and concurrent rendering) mounts, unmounts, and re-mounts components to detect memory leaks and race conditions",
        "Because JavaScript garbage collection deletes them automatically",
        "Because browsers execute cleanups twice on page reload",
        "Because async functions cannot return functions"
      ],
      answerIndex: 0,
      difficulty: "medium",
      topic: "Lifecycle"
    },
    {
      question: "What is the main operational difference between useMemo and useCallback?",
      options: [
        "useMemo memoizes the returned result of an evaluated function; useCallback memoizes the function definition itself between renders",
        "useCallback works on the server; useMemo runs only in the browser",
        "useMemo can only store primitive numbers and strings",
        "useCallback runs before render; useMemo runs after render"
      ],
      answerIndex: 0,
      difficulty: "medium",
      topic: "Optimization"
    },
    {
      question: "How does React 18's automatic batching differ from earlier React versions?",
      options: [
        "React 18 batches state updates inside promises, setTimeout, and native event handlers, whereas React 17 only batched inside React event handlers",
        "React 18 only batches state updates on desktop browsers",
        "React 18 batches all network requests into a single HTTP/2 frame",
        "React 18 eliminates the need for useState"
      ],
      answerIndex: 0,
      difficulty: "medium",
      topic: "Batching"
    },
    {
      question: "What problem does the useId hook solve in React 18+?",
      options: [
        "Generating unique UUIDs for database rows",
        "Generating unique, deterministic accessibility IDs that match between server-side rendering (SSR) and client hydration",
        "Encrypting sensitive user tokens in sessionStorage",
        "Tracking user session analytics across browser tabs"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Accessibility"
    },
    // Hard (6)
    {
      question: "In React's Fiber architecture, what is a Fiber node?",
      options: [
        "A physical thread spawned in a Web Worker to compile JSX",
        "A unit of work represented as a JavaScript object containing component state, props, and pointers (child, sibling, return) for cooperative scheduling",
        "A hardware-accelerated WebGL canvas element",
        "A direct reference to a shadow DOM boundary"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Architecture"
    },
    {
      question: "What happens if a component renders conditionally with fewer hooks than in a previous render?",
      options: [
        "React ignores the missing hooks and fills them with undefined",
        "React throws a runtime error because hooks rely on a stable, index-based linked list order per fiber node",
        "React prompts the user to reload the tab",
        "React re-compiles the component in legacy mode"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Rules of Hooks"
    },
    {
      question: "How does React's useDeferredValue hook optimize high-frequency input responsiveness?",
      options: [
        "By setting a fixed setTimeout of 300ms like traditional lodash debounce",
        "By allowing React to first render the urgent input update immediately, and then defer re-rendering the heavy dependent child tree until main-thread idle",
        "By caching the DOM nodes in IndexedDB",
        "By moving the dependent computation to a remote cloud worker"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Concurrent Features"
    },
    {
      question: "In React Server Components (RSC), what is the boundary constraint when passing props from a Server Component to a Client Component?",
      options: [
        "Props must be JSON-serializable (primitives, plain objects, arrays, or React elements), excluding functions, class instances, and symbols",
        "Props cannot exceed 256 bytes in total payload size",
        "Only strings and numbers can be passed; arrays are prohibited",
        "All props must be encrypted using AES-256 before transmission"
      ],
      answerIndex: 0,
      difficulty: "hard",
      topic: "Server Components"
    },
    {
      question: "What is the consequence of updating a ref (.current) during the render phase rather than in an effect or event handler?",
      options: [
        "It breaks concurrent rendering because renders can be aborted, restarted, or run multiple times, leading to inconsistent, unpredictable state",
        "It automatically throws a SyntaxError in Babel",
        "It forces the browser to discard its GPU render pipeline",
        "It converts the ref into a state variable automatically"
      ],
      answerIndex: 0,
      difficulty: "hard",
      topic: "Concurrent Safety"
    },
    {
      question: "In React reconciliation, why is using array index as a 'key' detrimental when items are reordered or filtered?",
      options: [
        "Indices cause React to associate component state and DOM inputs with the slot position rather than the conceptual item, leading to corrupted input state and missed animations",
        "Indices cause memory leaks in the browser V8 engine",
        "React throws an Uncaught TypeError if keys are integers",
        "Indices prevent components from receiving props"
      ],
      answerIndex: 0,
      difficulty: "hard",
      topic: "Reconciliation"
    }
  ],

  // ─── 2. PYTHON ─────────────────────────────────────────────────────────────
  python: [
    // Easy (4)
    {
      question: "What is the time complexity of looking up a key in a standard Python dictionary on average?",
      options: ["O(n)", "O(1)", "O(log n)", "O(n^2)"],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Data Structures"
    },
    {
      question: "What does the 'is' operator test for in Python?",
      options: [
        "Equality of values between two objects (like ==)",
        "Identity — whether two variables reference the exact same object in memory",
        "Whether an object is an instance of a given class",
        "Whether a key exists inside a container"
      ],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Language Core"
    },
    {
      question: "Which built-in Python function returns an iterator of tuples containing the index and item from a sequence?",
      options: ["zip()", "enumerate()", "range()", "map()"],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Built-ins"
    },
    {
      question: "What is the output of bool([]) and bool([0]) in Python?",
      options: ["True, True", "False, False", "False, True", "True, False"],
      answerIndex: 2,
      difficulty: "easy",
      topic: "Booleans"
    },
    // Medium (5)
    {
      question: "What is the purpose of the 'yield from' expression introduced in Python 3.3 (PEP 380)?",
      options: [
        "To terminate a generator immediately with an exit code",
        "To transparently delegate iteration and bidirectional communication (send/throw/return) to a subgenerator",
        "To run two generator functions on parallel CPU cores simultaneously",
        "To convert a generator directly into a NumPy ndarray"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Generators"
    },
    {
      question: "How does Python's GIL (Global Interpreter Lock) in CPython affect multi-threaded programs?",
      options: [
        "It prevents all I/O operations from being executed concurrently",
        "It prevents multiple native OS threads from executing CPython bytecode simultaneously on multiple CPU cores",
        "It disables garbage collection during multi-threaded execution",
        "It automatically parallelizes CPU-bound mathematical loops"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Concurrency"
    },
    {
      question: "What is the main benefit of defining __slots__ in a Python class?",
      options: [
        "It allows dynamic addition of arbitrary attributes at runtime",
        "It prevents the creation of __dict__ and __weakref__ for instances, saving significant memory when creating millions of objects",
        "It makes class instances immutable by default",
        "It automatically implements thread-safe locking on method calls"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "OOP"
    },
    {
      question: "In Python context managers, what must the __exit__ method return to suppress an active exception?",
      options: ["None", "A truthy value (e.g., True)", "False", "raise Exception"],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Context Managers"
    },
    {
      question: "What does functools.partial() do in Python?",
      options: [
        "It compiles a function into C code",
        "It returns a new callable with some positional or keyword arguments pre-filled",
        "It executes only the first half of a loop",
        "It mocks a function for unit testing"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Functional Programming"
    },
    // Hard (6)
    {
      question: "In Python's descriptor protocol, what is the key distinction between a 'data descriptor' and a 'non-data descriptor'?",
      options: [
        "Data descriptors store bytes; non-data descriptors store text strings",
        "A data descriptor defines __set__ and/or __delete__ in addition to __get__, and takes precedence over instance dictionary lookup; a non-data descriptor defines only __get__",
        "Non-data descriptors can only be used with built-in C types",
        "Data descriptors cannot be inherited across class subclasses"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Descriptors"
    },
    {
      question: "How does CPython's cyclic garbage collector detect and collect circular reference cycles?",
      options: [
        "By immediately terminating the process when a circular pointer is formed",
        "By maintaining isolated generation lists (Gen 0, 1, 2) and using a trial-deletion algorithm to subtract internal reference counts from objects containing pointers (PyGC_Head)",
        "By relying strictly on OS virtual memory paging to discard cycles",
        "By replacing all circular pointers with weak references automatically"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Memory Management"
    },
    {
      question: "What is the exact execution order and role of __new__ versus __init__ when creating a Python class instance?",
      options: [
        "__init__ allocates memory; __new__ initializes instance attributes",
        "__new__ is a static method that allocates and returns the new instance; __init__ is an instance method that initializes the returned instance",
        "__new__ is called only if __init__ fails with an exception",
        "Both are identical aliases for the class constructor"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Metaclasses"
    },
    {
      question: "In Python 3.7+ async/await, why should you use 'contextvars' instead of threading.local() for request-scoped context?",
      options: [
        "threading.local() is deprecated in Python 3",
        "threading.local() leaks across tasks because multiple concurrent coroutines share the same underlying OS thread in the event loop; contextvars natively follow async task boundaries",
        "contextvars automatically encrypts stored variables",
        "threading.local() cannot store dictionaries"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Asyncio"
    },
    {
      question: "What does the C3 Superclass Linearization algorithm guarantee in Python multiple inheritance (MRO)?",
      options: [
        "Classes can inherit from an infinite number of subclasses without stack overflow",
        "Monotonicity (order of parents is preserved in subclasses) and local precedence order, preventing ambiguous method resolution orders",
        "All methods are inlined by the JIT compiler",
        "Diamond inheritance trees are automatically flattened into a single base class"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "MRO"
    },
    {
      question: "What happens when you pass a mutable object (e.g., list or dict) as a default argument in a Python function definition?",
      options: [
        "A fresh copy of the object is created on every function invocation",
        "The default object is evaluated once at module load/definition time and shared across all invocations that omit that parameter",
        "Python raises a DefaultArgMutationWarning during compilation",
        "The argument becomes read-only and immutable inside the function"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Language Semantics"
    }
  ],

  // ─── 3. TYPESCRIPT ────────────────────────────────────────────────────────
  typescript: [
    // Easy (4)
    {
      question: "What is the difference between the 'any' and 'unknown' types in TypeScript?",
      options: [
        "'unknown' disables all type checking; 'any' is type-safe",
        "'any' turns off type checking completely, whereas 'unknown' requires type narrowing or assertion before performing operations on the value",
        "'unknown' can only represent null and undefined",
        "There is no difference; they are aliases"
      ],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Type Basics"
    },
    {
      question: "Which utility type constructs a type with all properties of Type set to optional?",
      options: ["Required<Type>", "Partial<Type>", "Readonly<Type>", "Record<Type, any>"],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Utility Types"
    },
    {
      question: "What does the 'readonly' modifier do when applied to an interface property in TypeScript?",
      options: [
        "Encrypts the property value at runtime",
        "Prevents assignment to the property after initialization during static type checking",
        "Hides the property from Object.keys()",
        "Makes the property available only inside private methods"
      ],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Interfaces"
    },
    {
      question: "How do you define a tuple type representing a coordinate of two numbers [x, y] in TypeScript?",
      options: ["number[]", "[number, number]", "Array<number, 2>", "(number, number)"],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Tuples"
    },
    // Medium (5)
    {
      question: "What is the purpose of the 'satisfies' operator introduced in TypeScript 4.9?",
      options: [
        "It casts a value to 'any' without emitting warnings",
        "It validates that an expression matches a given type without changing or widening the inferred literal type of that expression",
        "It satisfies unit tests automatically in Jest",
        "It checks if an interface implements all abstract methods at runtime"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Type Inference"
    },
    {
      question: "What is a 'discriminated union' (or tagged union) in TypeScript?",
      options: [
        "A union of primitive strings and numbers",
        "A union of object types that share a common literal property (the discriminant) used for exhaustive type narrowing",
        "A TypeScript enum that allows duplicate keys",
        "A type union that excludes undefined and null"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Unions"
    },
    {
      question: "What does the 'as const' assertion do when applied to an object or array literal?",
      options: [
        "It marks the variable as an immutable constant in JavaScript runtime",
        "It infers the narrowest possible literal types, marks all properties as readonly, and converts array literals into readonly tuples",
        "It prevents garbage collection of the object",
        "It compiles the object into a JSON string"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Const Assertions"
    },
    {
      question: "What is the purpose of the 'never' type in TypeScript functions?",
      options: [
        "It indicates that a function returns null",
        "It represents the return type of functions that never return (e.g. throw an error or contain an infinite loop) or unreachable code paths",
        "It indicates an asynchronous promise that never resolves",
        "It marks a function as deprecated"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Special Types"
    },
    {
      question: "How does the 'Pick<T, K>' utility type differ from 'Omit<T, K>'?",
      options: [
        "Pick selects a set of properties K from T; Omit constructs a type by removing properties K from T",
        "Pick works only on classes; Omit works only on interfaces",
        "Pick modifies runtime prototypes; Omit only affects compile-time",
        "There is no difference"
      ],
      answerIndex: 0,
      difficulty: "medium",
      topic: "Utility Types"
    },
    // Hard (6)
    {
      question: "What does the 'infer' keyword do inside a conditional type in TypeScript?",
      options: [
        "Forces TypeScript to automatically cast runtime values",
        "Introduces a type variable within the true branch of a conditional type that is deduced from the checked type",
        "Infers the return type of any async function at runtime",
        "Disables strict null checks for the generic parameter"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Conditional Types"
    },
    {
      question: "Why are naked type parameters in conditional types called 'distributive conditional types'?",
      options: [
        "Because they distribute compiler workload across CPU threads",
        "Because when given a union type (e.g. T extends U ? X : Y where T is A | B), the conditional type is distributed over each union member: (A extends U ? X : Y) | (B extends U ? X : Y)",
        "Because they can only be used in distributed microservices",
        "Because they distribute properties across inherited interfaces"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Advanced Generics"
    },
    {
      question: "Under TypeScript's 'strictFunctionTypes' compiler flag, how are function parameters checked compared to function return types?",
      options: [
        "Both parameters and returns are checked invariantly",
        "Function parameters are checked contravariantly, while function return types are checked covariantly",
        "Function parameters are checked covariantly, while return types are contravariant",
        "Both are bivariant for backwards compatibility"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Variance"
    },
    {
      question: "How can you create a 'branded type' (nominal typing simulation) in TypeScript?",
      options: [
        "By using the '@brand' JSDoc tag exclusively",
        "By intersecting a primitive type with an object containing a unique unique symbol or string brand property (e.g. type UserId = string & { readonly __brand: unique symbol })",
        "By declaring a class that inherits from Object.freeze",
        "TypeScript natively enforces nominal typing for all interface names"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Nominal Typing"
    },
    {
      question: "How do template literal types handle union types in TypeScript (e.g. `on${'Click' | 'Hover'}`)?",
      options: [
        "They evaluate to 'string'",
        "They generate a cross-product union of all possible literal combinations: 'onClick' | 'onHover'",
        "They produce a compilation error unless cast to any",
        "They only select the first union member"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Template Literals"
    },
    {
      question: "What is the effect of key remapping via 'as' in mapped types (e.g. [K in keyof T as NewKeyType]: T[K])?",
      options: [
        "It renames keys in memory at runtime",
        "It filters or transforms property keys during compile-time type mapping (e.g., prefixing keys or returning 'never' to filter keys out)",
        "It binds getters and setters to the prototype",
        "It causes the object to become non-iterable"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Mapped Types"
    }
  ],

  // ─── 4. JAVASCRIPT ────────────────────────────────────────────────────────
  javascript: [
    // Easy (4)
    {
      question: "What does 'typeof null' evaluate to in JavaScript?",
      options: ["'null'", "'undefined'", "'object'", "'boolean'"],
      answerIndex: 2,
      difficulty: "easy",
      topic: "Types"
    },
    {
      question: "Which array method creates a new array with all elements that pass the test implemented by the provided function?",
      options: ["map()", "filter()", "forEach()", "reduce()"],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Array Methods"
    },
    {
      question: "What is the difference between 'let' and 'var' regarding variable scope?",
      options: [
        "'let' is block-scoped; 'var' is function-scoped (or globally scoped)",
        "'var' cannot be reassigned; 'let' can",
        "'let' variables are hoisted and initialized to null",
        "'var' is only available in strict mode"
      ],
      answerIndex: 0,
      difficulty: "easy",
      topic: "Scoping"
    },
    {
      question: "What does Array.isArray([1, 2, 3]) return?",
      options: ["true", "false", "undefined", "TypeError"],
      answerIndex: 0,
      difficulty: "easy",
      topic: "Arrays"
    },
    // Medium (5)
    {
      question: "In the JavaScript Event Loop, which queue takes priority: the Microtask queue or the Macrotask (Task) queue?",
      options: [
        "The Macrotask queue is always drained before any Microtask is executed",
        "The Microtask queue (e.g., Promise callbacks, queueMicrotask) is completely drained immediately after the current synchronous script and before the next Macrotask",
        "They execute alternatively in strict 1-to-1 round-robin order",
        "The browser prioritizes setTimeout callbacks over Promise.resolve()"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Event Loop"
    },
    {
      question: "What is the key functional difference between WeakMap and Map in JavaScript?",
      options: [
        "WeakMap keys must be objects or non-registered symbols, and entries are held weakly without preventing garbage collection if there are no other references to the key",
        "WeakMap allows iteration with for..of, while Map does not",
        "Map cannot store string values as keys",
        "WeakMap has an asynchronous .get() method"
      ],
      answerIndex: 0,
      difficulty: "medium",
      topic: "Collections"
    },
    {
      question: "What is the Temporal Dead Zone (TDZ) in JavaScript?",
      options: [
        "The time between an HTTP request and response",
        "The period between entering a scope and the point where a 'let' or 'const' variable is declared, during which accessing it throws a ReferenceError",
        "The timeout period before setTimeout triggers",
        "The duration when Web Workers are paused"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Hoisting"
    },
    {
      question: "What is the purpose of the 'structuredClone()' global method in modern JavaScript?",
      options: [
        "To perform a shallow copy of an object like Object.assign()",
        "To create a deep clone of a JavaScript value using the structured clone algorithm, correctly handling circular references, Dates, RegExps, and TypedArrays",
        "To serialize an object to JSON",
        "To compile code into WebAssembly"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Cloning"
    },
    {
      question: "What does the 'bind' method on a function do?",
      options: [
        "Calls the function immediately with provided arguments",
        "Returns a new function whose 'this' context and initial arguments are permanently bound to the provided values",
        "Binds a function to a DOM element click event",
        "Compiles the function into a generator"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Functions"
    },
    // Hard (6)
    {
      question: "In the ECMAScript specification, what happens during the 'instantiation' phase of ES modules before 'evaluation'?",
      options: [
        "Module code is executed line by line",
        "The module record is parsed, dependencies are fetched, and exported/imported bindings are linked in memory (live bindings) without executing module body code",
        "All variables are assigned their final values",
        "Circular module references are rejected with a SyntaxError"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Modules"
    },
    {
      question: "What is the role of the 'Reflect' object when used inside JavaScript Proxy handler traps?",
      options: [
        "To inspect TypeScript type annotations at runtime",
        "To forward operations to the target object with default internal behavior while maintaining the proper 'this' binding (receiver)",
        "To automatically serialize proxied objects to disk",
        "To convert synchronous proxies into asynchronous WebSockets"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Proxy & Reflect"
    },
    {
      question: "What happens when a non-configurable, non-writable property of a Proxy target is intercepted by a 'get' trap?",
      options: [
        "The trap can return any value without restriction",
        "The trap invariant check requires that the trap must return the exact same value as the target's property, otherwise a TypeError is thrown",
        "The proxy automatically deletes the property",
        "The JavaScript engine crashes"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Proxy Invariants"
    },
    {
      question: "How does JavaScript determine execution order when multiple promises resolve concurrently in Promise.all() versus Promise.allSettled()?",
      options: [
        "Promise.all() rejects immediately on the first rejection; Promise.allSettled() waits for all promises to settle regardless of rejections",
        "Promise.allSettled() cancels pending promises using AbortController",
        "Promise.all() preserves resolution order in the array; Promise.allSettled() sorts results by completion timestamp",
        "Promise.all() runs in a separate Web Worker thread"
      ],
      answerIndex: 0,
      difficulty: "hard",
      topic: "Promises"
    },
    {
      question: "In JavaScript prototypes, what does Object.create(null) produce?",
      options: [
        "A standard empty object inheriting from Object.prototype",
        "A dictionary object with absolutely no prototype chain (__proto__ is undefined), free from inherited properties like toString or hasOwnProperty",
        "A frozen immutable singleton",
        "A null pointer exception"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Prototypes"
    },
    {
      question: "What is the purpose of 'Symbol.toPrimitive' in JavaScript object coercion?",
      options: [
        "To convert JSON strings into binary buffers",
        "A well-known symbol method that allows an object to define custom coercion behavior when converted to a primitive value under 'number', 'string', or 'default' hints",
        "To force an object to be stored in the CPU stack",
        "To validate schema types before database insertion"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Symbols & Coercion"
    }
  ],

  // ─── 5. SQL ───────────────────────────────────────────────────────────────
  sql: [
    // Easy (4)
    {
      question: "Which SQL clause is used to filter records returned by an aggregate GROUP BY query?",
      options: ["WHERE", "HAVING", "ORDER BY", "DISTINCT"],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Aggregation"
    },
    {
      question: "What is the difference between UNION and UNION ALL in SQL?",
      options: [
        "UNION eliminates duplicate rows by sorting; UNION ALL combines all rows including duplicates without deduping",
        "UNION ALL only works on numerical columns",
        "UNION is faster than UNION ALL",
        "UNION ALL only returns unique rows"
      ],
      answerIndex: 0,
      difficulty: "easy",
      topic: "Set Operations"
    },
    {
      question: "Which SQL constraint ensures that all values in a column are different and do not contain NULLs?",
      options: ["FOREIGN KEY", "PRIMARY KEY", "CHECK", "DEFAULT"],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Constraints"
    },
    {
      question: "What does the SQL command TRUNCATE TABLE do compared to DELETE FROM?",
      options: [
        "TRUNCATE is a DDL operation that deallocates data pages quickly without row-by-row logging, whereas DELETE is DML that logs individual row deletions",
        "TRUNCATE only deletes the table schema",
        "DELETE cannot be rolled back inside a transaction",
        "TRUNCATE allows WHERE filtering"
      ],
      answerIndex: 0,
      difficulty: "easy",
      topic: "DDL vs DML"
    },
    // Medium (5)
    {
      question: "What is the difference between the window functions RANK() and DENSE_RANK() in SQL?",
      options: [
        "RANK() skips rank values after ties (e.g. 1, 2, 2, 4); DENSE_RANK() leaves no gaps (e.g. 1, 2, 2, 3)",
        "DENSE_RANK() requires an ORDER BY DESC clause; RANK() does not",
        "RANK() works on text columns; DENSE_RANK() only works on floats",
        "There is no difference"
      ],
      answerIndex: 0,
      difficulty: "medium",
      topic: "Window Functions"
    },
    {
      question: "In relational database indexing, what is a 'Covering Index'?",
      options: [
        "An index that encrypts all columns in the table",
        "An index that contains all columns referenced by a query (both in WHERE, JOIN, and SELECT), allowing the database to satisfy the query entirely from the index without reading the table pages (Index-Only Scan)",
        "An index created automatically on every foreign key",
        "An index spanning multiple physical database servers"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Indexing"
    },
    {
      question: "What is the difference between a LEFT JOIN and an INNER JOIN?",
      options: [
        "INNER JOIN returns only rows that match in both tables; LEFT JOIN returns all rows from the left table and matched rows from the right table (with NULLs for unmatched right rows)",
        "LEFT JOIN drops all rows from the left table",
        "INNER JOIN cannot join on non-primary keys",
        "LEFT JOIN is faster than INNER JOIN in all query engines"
      ],
      answerIndex: 0,
      difficulty: "medium",
      topic: "Joins"
    },
    {
      question: "What is the purpose of a Common Table Expression (CTE) defined with 'WITH' in SQL?",
      options: [
        "To permanently store temporary tables on disk",
        "To define a temporary, named result set within the execution scope of a single SELECT, INSERT, UPDATE, or DELETE statement, enhancing query modularity and supporting recursion",
        "To enforce database user permissions",
        "To bypass database query optimizer caching"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "CTEs"
    },
    {
      question: "What does the SQL COALESCE() function return?",
      options: [
        "The sum of all arguments",
        "The first non-NULL expression among its arguments",
        "A boolean indicating if any argument is NULL",
        "The string concatenation of all inputs"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Scalar Functions"
    },
    // Hard (6)
    {
      question: "In ANSI SQL isolation levels, what is the 'Phantom Read' phenomenon and at what level is it prevented?",
      options: [
        "A transaction reads uncommitted changes from another transaction; prevented at Read Committed",
        "A transaction executes a range query twice, but finds new rows inserted and committed by another transaction in the second read; prevented at Serializable (and in engines like Postgres/InnoDB, via snapshot isolation/next-key locks at Repeatable Read)",
        "A transaction reads corrupted memory pages from disk; prevented at Read Uncommitted",
        "Two transactions modify the same row simultaneously without locks"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Transactions & Isolation"
    },
    {
      question: "How does Multi-Version Concurrency Control (MVCC) eliminate read-write blocking in modern SQL databases (e.g., PostgreSQL)?",
      options: [
        "By enforcing strict table-level read locks on all queries",
        "By storing multiple physical row versions (tuples with xmin/xmax transaction visibility), allowing readers to see a consistent point-in-time snapshot without blocking writers",
        "By running all SQL queries in memory without persistence",
        "By serializing all queries into a single single-threaded queue"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "MVCC Architecture"
    },
    {
      question: "In database Write-Ahead Logging (WAL), what is the fundamental principle that guarantees durability (ACID)?",
      options: [
        "Data pages must be written to disk before log records",
        "Log records describing changes must be flushed to non-volatile storage (disk) before the modified data pages are written to the database files",
        "Logs are written only once every 24 hours during backup",
        "WAL bypasses OS filesystem cache completely using UDP packets"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "WAL & Durability"
    },
    {
      question: "What is the 'Index Skip Scan' (or loose index scan) optimization in SQL query planners?",
      options: [
        "Skipping index lookups when a table has fewer than 100 rows",
        "Using a composite index (A, B) even when column A is omitted from the WHERE clause, by jumping through distinct values of A and searching the B tree",
        "Skipping corrupted index pages automatically during recovery",
        "Executing full table scans on SSDs"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Query Optimization"
    },
    {
      question: "What occurs during a PostgreSQL 'table bloat' and how does VACUUM FULL address it?",
      options: [
        "Indexes become out of date; VACUUM FULL drops and recreates them",
        "Dead tuples from UPDATE and DELETE statements accumulate on disk pages; standard VACUUM marks space reusable by Postgres, while VACUUM FULL rewrites the entire table into a new file, reclaiming disk space to the OS while holding an exclusive lock",
        "Postgres runs out of memory and crashes",
        "Table bloat only affects partitioned tables"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Database Maintenance"
    },
    {
      question: "In recursive Common Table Expressions (WITH RECURSIVE), what separates the anchor member from the recursive member?",
      options: [
        "INTERSECT",
        "UNION ALL (or UNION)",
        "JOIN ON",
        "EXCEPT"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Recursive Queries"
    }
  ],

  // ─── 6. JAVA ──────────────────────────────────────────────────────────────
  java: [
    // Easy (4)
    {
      question: "What is the root superclass of all classes in Java?",
      options: ["java.lang.Class", "java.lang.Object", "java.lang.System", "java.lang.Base"],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Core Java"
    },
    {
      question: "What does the 'final' keyword signify when applied to a class in Java?",
      options: [
        "The class cannot be instantiated",
        "The class cannot be subclassed (inherited from)",
        "All methods in the class are private",
        "The class is marked for immediate garbage collection"
      ],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Modifiers"
    },
    {
      question: "Which collection class in Java allows key-value storage and does NOT synchronize its methods?",
      options: ["Hashtable", "HashMap", "Vector", "ConcurrentHashMap"],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Collections"
    },
    {
      question: "What is the difference between String, StringBuilder, and StringBuffer in Java?",
      options: [
        "String is immutable; StringBuilder is mutable and not thread-safe; StringBuffer is mutable and thread-safe (synchronized)",
        "StringBuilder is immutable; String is mutable",
        "StringBuffer was removed in Java 8",
        "All three are identical"
      ],
      answerIndex: 0,
      difficulty: "easy",
      topic: "Strings"
    },
    // Medium (5)
    {
      question: "In the Java Memory Model, what guarantee does the 'volatile' keyword provide for a variable?",
      options: [
        "It provides mutual exclusion locks identical to synchronized blocks",
        "It guarantees visibility (writes by one thread are immediately visible to all other threads) and establishes a happens-before relationship, preventing instruction reordering across reads/writes",
        "It caches the variable in CPU L1 register permanently",
        "It makes the referenced object immutable"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Concurrency"
    },
    {
      question: "What is the purpose of Virtual Threads introduced in Java 21 (Project Loom)?",
      options: [
        "To emulate GPU shaders in software",
        "To provide lightweight threads managed by the JVM runtime rather than 1:1 OS threads, enabling high-throughput concurrent I/O applications with minimal memory overhead",
        "To replace Java bytecode with WebAssembly",
        "To run Java code inside a browser canvas"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Concurrency"
    },
    {
      question: "What is type erasure in Java Generics?",
      options: [
        "A mechanism that converts all generic classes to C++ templates",
        "The compiler's process of removing generic type parameters at compile time and replacing them with their raw bounds (usually Object) and inserting casts, maintaining backward compatibility with pre-Java 5 bytecode",
        "Deleting unused variables to free heap space",
        "Disabling runtime reflection"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Generics"
    },
    {
      question: "How does the 'try-with-resources' statement ensure safe resource management in Java?",
      options: [
        "It catches all Throwable exceptions without logging",
        "It automatically invokes the .close() method on any resource implementing AutoCloseable at the end of the block, even if an exception occurs",
        "It re-allocates memory from the OS heap",
        "It moves file operations to a background thread"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Exceptions"
    },
    {
      question: "In Java 8+, what is the difference between intermediate and terminal operations on a Stream?",
      options: [
        "Intermediate operations return a new Stream and are lazily evaluated; terminal operations traverse the stream and produce a result or side effect",
        "Terminal operations can be chained indefinitely; intermediate operations close the stream",
        "Intermediate operations mutate the underlying collection directly",
        "Terminal operations run in parallel by default"
      ],
      answerIndex: 0,
      difficulty: "medium",
      topic: "Streams"
    },
    // Hard (6)
    {
      question: "What is 'carrier thread pinning' in Java 21 Virtual Threads and how does it happen?",
      options: [
        "Binding a thread permanently to a single CPU socket",
        "When a virtual thread executes inside a synchronized block/method or native call (JNI), preventing the JVM from unmounting it from its carrier OS thread during blocking operations",
        "When garbage collection freezes all threads for longer than 10 seconds",
        "When thread pools run out of memory"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Virtual Threads"
    },
    {
      question: "In Java ClassLoaders, what is the 'Parent-First' delegation model?",
      options: [
        "Subclasses must be loaded before base classes",
        "When a ClassLoader receives a class loading request, it first delegates to its parent ClassLoader before attempting to find and load the bytecode itself",
        "The JVM terminates if a child ClassLoader is spawned",
        "All classes are loaded by the Application ClassLoader exclusively"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "JVM Internals"
    },
    {
      question: "What is the difference between ZGC (Z Garbage Collector) and G1GC in modern Java?",
      options: [
        "ZGC is a stop-the-world single-threaded collector; G1GC is concurrent",
        "ZGC performs all phase workloads (marking, relocation, and reference processing) concurrently with application threads, achieving sub-millisecond max pause times even on multi-terabyte heaps",
        "G1GC is only supported on 32-bit architectures",
        "ZGC cannot collect objects in the Young generation"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Garbage Collection"
    },
    {
      question: "In Java generics, what is the PECS mnemonic (Producer Extends, Consumer Super)?",
      options: [
        "Use 'super' when reading data from a collection; use 'extends' when adding items",
        "Use '<? extends T>' when you only get/produce items from the parameterized collection; use '<? super T>' when you only put/consume items into the collection",
        "It governs network socket serialization protocols",
        "It controls Spring Boot dependency injection order"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Generics"
    },
    {
      question: "How does the JVM Just-In-Time (JIT) Tiered Compilation (C1 / C2) optimize hot code paths?",
      options: [
        "By interpreting code without ever generating machine code",
        "By first executing via Interpreter, profiling method invocations, compiling with C1 (client compiler with basic optimizations), and then re-compiling frequently invoked hot loops with C2 (server compiler with aggressive inlining and escape analysis)",
        "By compiling all Java classes directly into native binaries ahead of time",
        "By dispatching bytecode to the browser V8 engine"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "JIT Compilation"
    },
    {
      question: "What does 'Escape Analysis' enable the JVM C2 compiler to do regarding heap allocations?",
      options: [
        "Prevent memory leaks by deleting objects after 5 minutes",
        "Determine if an object's scope never escapes the allocating method, allowing scalar replacement (allocating fields on registers/stack instead of heap) and lock elision",
        "Force all objects into the Metaspace",
        "Bypass security checks during serialization"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "JVM Optimizations"
    }
  ],

  // ─── 7. GO (GOLANG) ────────────────────────────────────────────────────────
  go: [
    // Easy (4)
    {
      question: "How are errors typically handled in idiomatic Go functions?",
      options: [
        "By throwing and catching exceptions using try/catch blocks",
        "By returning error as the last return value and checking 'if err != nil'",
        "By setting a global errno variable",
        "By terminating the process immediately with os.Exit(1)"
      ],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Error Handling"
    },
    {
      question: "What is the zero value of a slice in Go?",
      options: ["[]", "nil", "make([]int, 0)", "undefined"],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Types"
    },
    {
      question: "How do you start a new concurrent execution thread (goroutine) in Go?",
      options: ["async myFunc()", "go myFunc()", "spawn myFunc()", "thread.Start(myFunc)"],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Goroutines"
    },
    {
      question: "Which keyword is used to register a function call to be executed immediately before the surrounding function returns?",
      options: ["defer", "finally", "cleanup", "exit"],
      answerIndex: 0,
      difficulty: "easy",
      topic: "Control Flow"
    },
    // Medium (5)
    {
      question: "What happens when you read from an unbuffered closed channel in Go?",
      options: [
        "The operation blocks indefinitely",
        "The read immediately yields the zero value of the channel's element type and ok == false",
        "Go raises a runtime panic",
        "The channel re-opens automatically"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Channels"
    },
    {
      question: "What is the internal memory representation of a slice header in Go?",
      options: [
        "A linked list of node pointers",
        "A 3-word struct containing a pointer to the backing array, length (len), and capacity (cap)",
        "A single uint64 memory address",
        "A hash map mapping indices to interface values"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Data Structures"
    },
    {
      question: "How does the 'select' statement behave in Go when multiple cases are simultaneously ready for communication?",
      options: [
        "It always executes the top-most case in source code order",
        "It chooses one case at random through pseudo-random uniform selection",
        "It executes all ready cases sequentially in parallel",
        "It throws a deadlock error"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Channels"
    },
    {
      question: "What happens when a panic is not caught by recover() in a spawned goroutine?",
      options: [
        "Only that specific goroutine terminates quietly",
        "The entire Go process crashes and prints a stack trace to stderr",
        "The goroutine restarts automatically",
        "The panic is routed to the main thread's try/catch"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Panics"
    },
    {
      question: "What is the primary function of sync.RWMutex over sync.Mutex in Go?",
      options: [
        "sync.RWMutex allows multiple concurrent readers but only a single exclusive writer",
        "sync.RWMutex is faster for write-heavy workloads",
        "sync.RWMutex automatically prevents deadlocks",
        "sync.RWMutex can be sent across channels safely"
      ],
      answerIndex: 0,
      difficulty: "medium",
      topic: "Synchronization"
    },
    // Hard (6)
    {
      question: "In the Go runtime scheduler (GMP Model), what do G, M, and P represent?",
      options: [
        "Garbage Collector, Memory Allocator, Profiler",
        "Goroutine (execution state), Machine (OS thread), Processor (logical resource context required to execute Go code)",
        "Global variables, Module path, Package name",
        "Generic type, Mutex lock, Pointer offset"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Scheduler"
    },
    {
      question: "In Go, what does an interface value consist of internally at the runtime level?",
      options: [
        "A single pointer to the struct data",
        "A two-word pair: an itab pointer (containing the concrete type metadata and method table) and a data pointer to the value",
        "A vtable allocated in C++ heap",
        "A string representation of the interface name"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Interfaces"
    },
    {
      question: "Why can 'nil' not be checked simply with 'val == nil' when returning a concrete pointer wrapped in an interface in Go?",
      options: [
        "Because interface comparison is unsupported in Go",
        "Because an interface is non-nil if its dynamic type component is set, even if the underlying concrete pointer value is nil (typed nil problem)",
        "Because nil is a reserved keyword in CGO only",
        "Because interfaces always copy memory by value"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Type System"
    },
    {
      question: "How does work-stealing work in the Go scheduler when a logical processor P exhausts its local run queue?",
      options: [
        "It terminates the operating system thread immediately",
        "It checks the global run queue, and if empty, attempts to steal half the executable goroutines from another processor P's local run queue",
        "It polls network sockets synchronously",
        "It triggers a full stop-the-world garbage collection cycle"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Scheduler"
    },
    {
      question: "How does Go's Garbage Collector achieve sub-millisecond STW pause times?",
      options: [
        "By never freeing memory allocated on the heap",
        "By utilizing a concurrent tri-color mark-and-sweep algorithm with write barriers, running alongside mutator threads and requiring STW only for brief mark start and termination",
        "By relying strictly on reference counting",
        "By delegating heap cleanup to the OS kernel"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Garbage Collection"
    },
    {
      question: "What happens to objects stored in a sync.Pool during garbage collection in Go?",
      options: [
        "They are permanently pinned and immune to collection",
        "Items in sync.Pool may be automatically deallocated without notice across GC cycles, meaning sync.Pool cannot be used as a durable cache",
        "They are serialized to disk",
        "They trigger memory leak alerts in pprof"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Memory Management"
    }
  ],

  // ─── 8. C++ ───────────────────────────────────────────────────────────────
  "c++": [
    // Easy (4)
    {
      question: "What is RAII (Resource Acquisition Is Initialization) in C++?",
      options: [
        "Initializing all global variables inside main()",
        "An idiom where resources (memory, file handles, sockets) are tied to object lifetime, acquired in constructors and automatically released in destructors",
        "A compiler flag for fast math optimizations",
        "A tool for formatting C++ code according to style guides"
      ],
      answerIndex: 1,
      difficulty: "easy",
      topic: "RAII"
    },
    {
      question: "Which smart pointer in modern C++ (C++11+) expresses exclusive, non-copyable ownership of a dynamic resource?",
      options: ["std::shared_ptr", "std::unique_ptr", "std::weak_ptr", "std::auto_ptr"],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Smart Pointers"
    },
    {
      question: "What is the difference between passing an argument by value vs by reference (const T&) in C++?",
      options: [
        "Pass by value creates a full copy of the object; pass by const reference passes an alias to the original object without copying, avoiding allocation overhead",
        "Pass by reference is only supported for primitive integers",
        "Pass by value is always faster than pass by reference",
        "Const reference allows the function to mutate the original caller variable"
      ],
      answerIndex: 0,
      difficulty: "easy",
      topic: "Functions"
    },
    {
      question: "Which standard header provides std::vector and std::sort in C++?",
      options: ["<vector> and <algorithm>", "<list> and <math>", "<array> and <utility>", "<stdlib.h>"],
      answerIndex: 0,
      difficulty: "easy",
      topic: "STL"
    },
    // Medium (5)
    {
      question: "What is the 'Rule of Five' in modern C++?",
      options: [
        "A rule stating a function should take at most five arguments",
        "If a class defines or deletes a destructor, copy constructor, or copy assignment operator, it should almost certainly define or delete all five: Destructor, Copy Constructor, Copy Assignment, Move Constructor, and Move Assignment",
        "A design pattern requiring five classes per namespace",
        "A guideline for allocating at most five shared_ptrs per thread"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Class Design"
    },
    {
      question: "What is the purpose of std::move in C++11?",
      options: [
        "It physically moves memory from RAM to CPU cache",
        "It unconditionally casts its argument to an rvalue reference (T&&), enabling move semantics and ownership transfer without deep copying",
        "It frees the source object immediately",
        "It re-allocates memory on another thread"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Move Semantics"
    },
    {
      question: "Why should base class destructors almost always be declared 'virtual' when polymorphic deletion is expected?",
      options: [
        "To make the class run faster in release builds",
        "To ensure that deleting a derived class through a pointer to the base class correctly calls the derived class destructor, preventing undefined behavior and resource leaks",
        "Because non-virtual destructors cannot be private",
        "To allow the class to be serialized"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Polymorphism"
    },
    {
      question: "What is the difference between std::shared_ptr and std::weak_ptr?",
      options: [
        "std::weak_ptr references an object managed by std::shared_ptr without incrementing its reference count, breaking cyclic dependencies",
        "std::shared_ptr can only be used on single-threaded systems",
        "std::weak_ptr deletes the resource immediately when out of scope",
        "std::shared_ptr cannot be placed in standard containers"
      ],
      answerIndex: 0,
      difficulty: "medium",
      topic: "Smart Pointers"
    },
    {
      question: "What does the 'constexpr' keyword signify on a function in C++11/14/20?",
      options: [
        "The function is guaranteed to run in a background thread",
        "The function can be evaluated at compile time if its arguments are constant expressions, while still remaining callable at runtime",
        "The function cannot throw exceptions",
        "The function is inlined by assembly directly"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Compile-Time"
    },
    // Hard (6)
    {
      question: "What is SFINAE (Substitution Failure Is Not An Error) in C++ template metaprogramming?",
      options: [
        "A compiler bug that causes templates to fail quietly",
        "A rule where a substitution failure during overload resolution simply discards that candidate from the overload set rather than causing a compilation error",
        "A mechanism for catching hardware exceptions at runtime",
        "A build flag that ignores linker errors"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Templates"
    },
    {
      question: "In C++20, what do Concepts provide over traditional SFINAE / std::enable_if?",
      options: [
        "They convert C++ templates into dynamic Java interfaces",
        "They provide named, readable compile-time predicates that constrain template parameters, producing concise compiler error messages and faster compilation times",
        "They eliminate the need for header files",
        "They enforce garbage collection for constrained types"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Concepts"
    },
    {
      question: "What is 'Perfect Forwarding' in C++ and how is it implemented?",
      options: [
        "Forwarding network packets using zero-copy sockets",
        "Preserving the value category (lvalue vs rvalue) and constness of an argument when passing it to another function, implemented using universal/forwarding references (T&&) and std::forward<T>()",
        "Inlining recursive template instantiations up to 1000 levels",
        "Automatically converting pointers to references"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Move Semantics"
    },
    {
      question: "How does the virtual table (vtable) and virtual pointer (vptr) mechanism implement dynamic dispatch in C++?",
      options: [
        "By parsing function names as strings in a hash map at runtime",
        "By inserting a hidden pointer (vptr) into the object layout that points to a table of function pointers (vtable) generated per polymorphic class, resolved via indexed indirect call",
        "By compiling every virtual function directly into OS interrupt handlers",
        "By creating a thread per virtual method invocation"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Object Model"
    },
    {
      question: "What is Undefined Behavior (UB) in C++, and how does the compiler treat code paths that invoke it?",
      options: [
        "The compiler halts compilation immediately with code 1",
        "The C++ standard imposes no requirements; compilers are legally allowed to assume UB never occurs, aggressive optimizing away checks or dead-code branches entirely",
        "The program prompts the operating system to allocate more RAM",
        "UB is safely translated to a standard null pointer exception"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Language Semantics"
    },
    {
      question: "In std::shared_ptr, what overhead is introduced by std::make_shared versus direct construction `std::shared_ptr<T>(new T)`?",
      options: [
        "make_shared is slower because it allocates two separate memory blocks",
        "make_shared allocates the object T and the control block (reference counts) contiguously in a single heap allocation, improving cache locality, but delaying memory deallocation of T until all weak_ptrs are destroyed",
        "make_shared cannot be used with custom deleters or multi-threading",
        "Direct construction does not support reference counting"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Memory Internals"
    }
  ],

  // ─── 9. NEXT.JS ───────────────────────────────────────────────────────────
  "next.js": [
    // Easy (4)
    {
      question: "In the Next.js App Router, where do components render by default unless specified otherwise?",
      options: [
        "On the client browser exclusively",
        "On the server as React Server Components (RSC)",
        "Inside an isolated Service Worker",
        "On the client using WebAssembly"
      ],
      answerIndex: 1,
      difficulty: "easy",
      topic: "App Router"
    },
    {
      question: "Which directive must be added at the very top of a file to make it a Client Component in Next.js?",
      options: ["'use client'", "'client side'", "'use browser'", "'use state'"],
      answerIndex: 0,
      difficulty: "easy",
      topic: "Directives"
    },
    {
      question: "Which special file in an App Router route directory defines the primary UI rendered for that route segment?",
      options: ["index.ts", "page.tsx", "route.ts", "view.tsx"],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Routing"
    },
    {
      question: "What component is used in Next.js to optimize images with automatic resizing, WebP conversion, and lazy loading?",
      options: ["<img>", "<NextImage>", "<Image>", "<Picture>"],
      answerIndex: 2,
      difficulty: "easy",
      topic: "Optimization"
    },
    // Medium (5)
    {
      question: "How do Server Actions work in Next.js 14+?",
      options: [
        "They compile client-side React components into REST endpoints automatically",
        "They are asynchronous functions defined with 'use server' that execute securely on the server and can be invoked directly from Client or Server components via POST requests",
        "They execute code inside the user's browser using node:fs",
        "They are background cron jobs that run every minute"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Server Actions"
    },
    {
      question: "What is the difference between revalidatePath() and revalidateTag() in Next.js cache purging?",
      options: [
        "revalidatePath purges cached data for a specific route URI; revalidateTag purges all fetch requests tagged with a specific cache tag across any route",
        "revalidatePath works on the client; revalidateTag runs on the database",
        "revalidateTag is only available in Pages Router",
        "There is no difference"
      ],
      answerIndex: 0,
      difficulty: "medium",
      topic: "Caching"
    },
    {
      question: "In Next.js Middleware, which JavaScript runtime environment is used to execute requests?",
      options: [
        "Full standard Node.js with all native C++ bindings",
        "The lightweight Next.js Edge Runtime (V8-based, standard Web APIs without Node child_process or filesystem access)",
        "Python runtime via WebAssembly",
        "Client browser web worker"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Middleware"
    },
    {
      question: "What is the purpose of the 'generateStaticParams' function in dynamic App Router routes?",
      options: [
        "To validate query parameters on the client",
        "To define the list of route segment parameters that will be statically generated at build time rather than on-demand at request time",
        "To generate database schemas",
        "To create SSL certificates"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Static Generation"
    },
    {
      question: "What does the 'loading.tsx' file in an App Router directory segment do automatically?",
      options: [
        "Renders a spinner while CSS downloads",
        "Wraps the segment's page.tsx and nested children in a React Suspense boundary with the loading component as the fallback",
        "Disables server-side rendering for that segment",
        "Sets the HTTP response header Cache-Control: max-age=0"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Streaming"
    },
    // Hard (6)
    {
      question: "In Next.js Partial Prerendering (PPR), how does the response lifecycle function?",
      options: [
        "The entire page is rendered dynamically on every user request",
        "A static HTML shell is served immediately from the edge/CDN, leaving holes (Suspense boundaries) that stream in dynamic server-rendered content over the same HTTP connection",
        "Pages are converted to static PDF files",
        "Client browsers render the page from local IndexedDB storage"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "PPR"
    },
    {
      question: "What happens when you import a Server Component directly into a Client Component in Next.js?",
      options: [
        "The Server Component continues to run on the server independently",
        "The imported Server Component becomes part of the client bundle and is treated as a Client Component (which fails if it uses server-only modules like fs or db)",
        "Next.js creates a WebSocket RPC bridge automatically",
        "The build succeeds but hides the component from the DOM"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Composition"
    },
    {
      question: "How can you pass a Server Component as a child into a Client Component without converting it to client code?",
      options: [
        "Pass it via React 'children' or as a JSX prop from an outer Server Component",
        "Use dynamic import with { ssr: true }",
        "Serialize the Server Component into a base64 string",
        "It is fundamentally impossible in Next.js"
      ],
      answerIndex: 0,
      difficulty: "hard",
      topic: "Composition"
    },
    {
      question: "What causes a route in Next.js App Router to automatically opt out of static rendering and switch to dynamic rendering?",
      options: [
        "Using useState inside a Client Component",
        "Using Dynamic Functions like cookies(), headers(), or reading searchParams in page props",
        "Importing an SVG file",
        "Adding an onClick handler to a button"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Rendering Strategy"
    },
    {
      question: "How does Next.js protect Server Actions from Cross-Site Request Forgery (CSRF)?",
      options: [
        "By disabling POST requests across all domains",
        "By comparing the Origin request header against the Host header (or allowedOrigins configuration) on incoming action requests",
        "By requiring an RSA private key with every fetch",
        "By restricting actions to GET requests only"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Security"
    },
    {
      question: "In Next.js Route Handlers (app/api/.../route.ts), when is a GET request cached by default?",
      options: [
        "Never; API routes are always dynamic",
        "When it does not use the Request object, does not use dynamic functions (cookies/headers), and does not opt into dynamic mode",
        "Only when deployed to Vercel edge networks",
        "Only when the client sends an ETag header"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Route Handlers"
    }
  ],

  // ─── 10. DOCKER ───────────────────────────────────────────────────────────
  docker: [
    // Easy (4)
    {
      question: "What is the primary difference between a Docker image and a Docker container?",
      options: [
        "An image is an immutable, read-only template with instructions; a container is a runnable, isolated instance of that image with a writable top layer",
        "A container contains the source code; an image is the compiled binary",
        "An image is executed in the browser; a container runs in the terminal",
        "There is no difference"
      ],
      answerIndex: 0,
      difficulty: "easy",
      topic: "Core Concepts"
    },
    {
      question: "Which Dockerfile instruction specifies the base image from which your container image is built?",
      options: ["RUN", "FROM", "BASE", "IMAGE"],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Dockerfile"
    },
    {
      question: "What does the command 'docker-compose down' do?",
      options: [
        "Pauses all running containers",
        "Stops and removes containers, networks, volumes, and images created by docker-compose up",
        "Deletes the docker-compose.yml file from disk",
        "Restarts the Docker daemon"
      ],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Docker Compose"
    },
    {
      question: "Which Docker command shows all running and stopped containers?",
      options: ["docker ps -a", "docker list --all", "docker images", "docker inspect"],
      answerIndex: 0,
      difficulty: "easy",
      topic: "CLI"
    },
    // Medium (5)
    {
      question: "What is the main advantage of using Multi-Stage Builds in a Dockerfile?",
      options: [
        "Containers run twice as fast on multi-core processors",
        "You can use heavy build tools (compilers, SDKs) in an early stage and copy only the final compiled artifact into a minimal runtime base image, dramatically reducing image size and attack surface",
        "It bypasses Docker layer caching",
        "It automatically deploys containers to Kubernetes"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Multi-Stage"
    },
    {
      question: "What is the operational difference between the CMD and ENTRYPOINT instructions in a Dockerfile?",
      options: [
        "ENTRYPOINT sets the default executable of the container; CMD provides default arguments that can be easily overridden from the command line",
        "CMD runs at build time; ENTRYPOINT runs at runtime",
        "ENTRYPOINT can only be used once per host machine",
        "CMD cannot be overridden"
      ],
      answerIndex: 0,
      difficulty: "medium",
      topic: "Dockerfile"
    },
    {
      question: "Why should you order Dockerfile instructions from least-frequently changing to most-frequently changing?",
      options: [
        "To make the Dockerfile easier to read alphabetically",
        "To maximize Docker layer cache hits; changing a line invalidates all subsequent layer caches in the build pipeline",
        "Because Docker reads files from bottom to top",
        "To reduce CPU clock speeds during compilation"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Caching"
    },
    {
      question: "What is the difference between a bind mount and a named volume in Docker?",
      options: [
        "A bind mount maps an exact host directory path into the container; a named volume is managed entirely by Docker within Docker's storage directory (/var/lib/docker/volumes)",
        "Bind mounts are faster on Windows and Mac than named volumes",
        "Named volumes cannot persist data when containers stop",
        "Bind mounts cannot be shared between containers"
      ],
      answerIndex: 0,
      difficulty: "medium",
      topic: "Storage"
    },
    {
      question: "What is the function of the default 'bridge' network in Docker?",
      options: [
        "It connects containers directly to the public internet without NAT",
        "It provides a private internal software bridge network on the host, allowing containers on the same bridge to communicate via IP, with port forwarding required for external traffic",
        "It disables container networking entirely",
        "It connects multiple physical host servers in a cluster"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Networking"
    },
    // Hard (6)
    {
      question: "What issue arises when a process runs as PID 1 inside a Docker container without an init system (like tini or dumb-init)?",
      options: [
        "The process cannot open network sockets",
        "Standard processes do not adopt the default Linux PID 1 behavior: they do not reap zombie child processes and ignore SIGTERM signals unless explicitly registered, causing hung container shutdowns",
        "The container cannot mount volumes",
        "Memory allocation is restricted to 64MB"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Container Internals"
    },
    {
      question: "How do Linux namespaces and cgroups differ in their roles in container isolation?",
      options: [
        "Namespaces restrict resource consumption (CPU/RAM); cgroups isolate what a process can see (processes, mounts, network)",
        "Namespaces isolate what a process can see (PID, NET, MNT, IPC, UTS, USER); cgroups (control groups) limit and meter what resources a process can consume (CPU, memory, disk I/O)",
        "Namespaces only work on AMD processors; cgroups work on Intel",
        "They are interchangeable terms for the same kernel module"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Kernel Internals"
    },
    {
      question: "What is the security risk of mounting /var/run/docker.sock inside a container?",
      options: [
        "It causes high network latency",
        "It grants the container root-equivalent control over the host Docker daemon, allowing full privilege escalation and host filesystem compromise",
        "It breaks container DNS resolution",
        "It deletes all Docker images on host reboot"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Security"
    },
    {
      question: "In Docker storage drivers, how does the Overlay2 storage driver handle file modifications on image layers?",
      options: [
        "It overwrites the read-only layer directly on disk",
        "It uses Copy-on-Write (CoW): when a file from a lower read-only layer is modified, it copies the entire file up to the top writable layer before applying changes",
        "It locks the file until the container stops",
        "It compresses all modified files into a zip archive"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Storage Architecture"
    },
    {
      question: "What happens when a container exceeds its configured memory limit (--memory=512m) under Linux cgroups v2?",
      options: [
        "The CPU frequency is throttled by 50%",
        "The Linux kernel Out-Of-Memory (OOM) killer terminates processes in the container (Exit Code 137)",
        "Memory automatically overflows to the host swap without limit",
        "Docker pauses the container until memory drops"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Resource Limits"
    },
    {
      question: "What does the Docker daemon architecture look like under modern container runtimes (OCI)?",
      options: [
        "The Docker daemon executes all container binaries directly in its own thread pool",
        "Docker CLI communicates with dockerd, which delegates high-level lifecycle to containerd, which in turn invokes runc (an OCI reference runtime) to configure kernel namespaces and launch the container",
        "Docker communicates directly with the BIOS firmware",
        "Containerd was deprecated in favor of systemd-nspawn"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Runtime Architecture"
    }
  ],

  // ─── 11. AWS ──────────────────────────────────────────────────────────────
  aws: [
    // Easy (4)
    {
      question: "Which AWS service provides resizable virtual compute instances in the cloud?",
      options: ["Amazon S3", "Amazon EC2", "Amazon RDS", "AWS Lambda"],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Compute"
    },
    {
      question: "What is the primary function of Amazon S3 (Simple Storage Service)?",
      options: [
        "A relational SQL database engine",
        "Scalable object storage for files, backups, images, and data lakes",
        "A virtual private network gateway",
        "A DNS domain registrar"
      ],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Storage"
    },
    {
      question: "What does AWS IAM stand for?",
      options: [
        "Identity and Access Management",
        "Internal Application Monitoring",
        "Internet Access Machine",
        "Integrated AWS Maintenance"
      ],
      answerIndex: 0,
      difficulty: "easy",
      topic: "Security"
    },
    {
      question: "Which AWS service is a managed relational database service supporting PostgreSQL, MySQL, and MariaDB?",
      options: ["Amazon DynamoDB", "Amazon RDS", "Amazon Redshift", "Amazon ElastiCache"],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Databases"
    },
    // Medium (5)
    {
      question: "In AWS IAM policy evaluation logic, what takes the highest precedence?",
      options: [
        "An explicit Allow",
        "An explicit Deny (any explicit deny overrides all allows)",
        "The root account default",
        "An IAM Permission Boundary"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "IAM"
    },
    {
      question: "What is the key difference between Security Groups and Network ACLs (NACLs) in an AWS VPC?",
      options: [
        "Security Groups are stateful (inbound return traffic is allowed automatically) and operate at instance ENI level; NACLs are stateless and operate at subnet boundary",
        "NACLs are stateful; Security Groups are stateless",
        "Security Groups can only block IP addresses; NACLs can only allow",
        "NACLs operate on EC2 instances directly"
      ],
      answerIndex: 0,
      difficulty: "medium",
      topic: "VPC Networking"
    },
    {
      question: "What is a NAT Gateway used for in an AWS VPC architecture?",
      options: [
        "To route public traffic into private database subnets",
        "To allow instances in a private subnet to connect outbound to the internet or external AWS services while preventing inbound internet connections",
        "To balance HTTP load across multiple EC2 targets",
        "To encrypt EBS volumes"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "VPC"
    },
    {
      question: "What is the difference between AWS S3 Standard and S3 Glacier Flexible Retrieval?",
      options: [
        "Glacier is designed for low-cost archival storage where data is rarely accessed and retrieval takes minutes to hours; S3 Standard provides millisecond access for active data",
        "S3 Glacier has lower durability than S3 Standard",
        "S3 Standard can only store text files",
        "Glacier deletes files after 30 days automatically"
      ],
      answerIndex: 0,
      difficulty: "medium",
      topic: "S3 Storage Classes"
    },
    {
      question: "How does Amazon CloudFront improve web application performance globally?",
      options: [
        "By overclocking CPU instances in us-east-1",
        "By caching static and dynamic content at a global network of Edge Locations close to end users, reducing latency and backend origin load",
        "By compressing SQL queries",
        "By eliminating all DNS lookups"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "CDN"
    },
    // Hard (6)
    {
      question: "In Amazon DynamoDB, what causes a 'hot partition' and how can it be avoided?",
      options: [
        "Overheating physical servers in an AWS availability zone",
        "Choosing a partition key with low cardinality (e.g. status or date) where high-volume writes concentrate on a single storage node; avoided by high-cardinality keys or write-sharding (salting keys with random suffixes)",
        "Setting read capacity units too high",
        "Using DynamoDB Streams"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "DynamoDB"
    },
    {
      question: "How does Amazon Aurora achieve significantly higher write throughput and faster replication than standard MySQL/PostgreSQL RDS?",
      options: [
        "By running exclusively in RAM without writing to disk",
        "By decoupling compute from storage, writing only Redo Log records directly to a shared, self-healing, multi-AZ storage fleet (6 copies across 3 AZs) without flushing dirty data pages over the network",
        "By disabling ACID transactions",
        "By using single-threaded CPU cores"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Database Architecture"
    },
    {
      question: "In AWS Lambda, what is Provisioned Concurrency designed to eliminate?",
      options: [
        "Billing charges for idle functions",
        "Cold starts — initialization latency caused by downloading container images, starting execution environments, and initializing runtime runtimes during traffic spikes",
        "Memory leaks inside Node.js scripts",
        "VPC ENI attachment limitations"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Serverless"
    },
    {
      question: "What is the purpose of an IAM Permission Boundary?",
      options: [
        "To grant permissions directly to IAM users without groups",
        "An advanced feature that sets the maximum possible permissions an identity-based policy can grant, preventing delegated admins from escalating their own privileges",
        "To restrict AWS Console login by IP address",
        "To limit the number of S3 buckets an account can create"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "IAM Governance"
    },
    {
      question: "In AWS Route 53, how does Latency-Based Routing differ from Geolocation Routing?",
      options: [
        "Latency routing directs users to the AWS region that provides the lowest network round-trip time based on network measurements; Geolocation routing directs users strictly based on the physical geographic origin of the DNS query",
        "Latency routing only works inside a private VPC",
        "Geolocation routing measures ping times between servers",
        "There is no difference"
      ],
      answerIndex: 0,
      difficulty: "hard",
      topic: "DNS & Traffic Management"
    },
    {
      question: "In AWS KMS (Key Management Service), what is 'Envelope Encryption'?",
      options: [
        "Sending encryption keys in physical postal envelopes to AWS headquarters",
        "Encrypting plaintext data with a unique Data Encryption Key (DEK), and then encrypting the DEK with a root KMS Key Encryption Key (KKE), storing only the encrypted DEK alongside the data",
        "Compressing data before SSL transmission",
        "Encrypting network packets at OSI Layer 2"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "KMS Cryptography"
    }
  ],

  // ─── 12. MACHINE LEARNING ─────────────────────────────────────────────────
  "machine learning": [
    // Easy (4)
    {
      question: "What is the difference between Supervised and Unsupervised Learning?",
      options: [
        "Supervised learning trains on labeled input-output data; unsupervised learning discovers patterns and structures from unlabeled data",
        "Supervised learning requires human coders to write if-else statements",
        "Unsupervised learning can only be used for numerical regression",
        "There is no difference"
      ],
      answerIndex: 0,
      difficulty: "easy",
      topic: "Core ML"
    },
    {
      question: "Which metric is most appropriate for evaluating a binary classification model on a heavily imbalanced dataset (e.g., 99% negative, 1% positive)?",
      options: ["Raw Accuracy", "Precision-Recall AUC (or F1-Score)", "Mean Squared Error", "R-squared"],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Evaluation"
    },
    {
      question: "What is 'overfitting' in machine learning?",
      options: [
        "When a model performs exceptionally on training data but fails to generalize to unseen test data because it learned noise",
        "When a model training loop takes longer than 24 hours",
        "When the dataset has too few features",
        "When gradient descent converges too quickly"
      ],
      answerIndex: 0,
      difficulty: "easy",
      topic: "Model Generalization"
    },
    {
      question: "Which activation function outputs values in the range (0, 1) and is traditionally used for binary classification probabilities?",
      options: ["ReLU", "Sigmoid", "Linear", "LeakyReLU"],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Neural Networks"
    },
    // Medium (5)
    {
      question: "How does L1 regularization (Lasso) differ from L2 regularization (Ridge) regarding model weights?",
      options: [
        "L1 adds the sum of absolute weights (|w|), driving irrelevant feature weights to exactly zero (producing sparse models); L2 adds squared weights (w^2), penalizing large weights smoothly without forcing zero",
        "L2 eliminates features completely; L1 does not",
        "L1 is only used in unsupervised clustering",
        "L2 cannot be used with gradient descent"
      ],
      answerIndex: 0,
      difficulty: "medium",
      topic: "Regularization"
    },
    {
      question: "What is the primary problem that Batch Normalization addresses during deep neural network training?",
      options: [
        "It prevents all GPU out-of-memory errors",
        "It mitigates internal covariate shift by normalizing layer inputs across the mini-batch, stabilizing gradients and allowing higher learning rates",
        "It replaces the need for activation functions",
        "It automatically labels unannotated training samples"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Deep Learning"
    },
    {
      question: "In gradient descent optimization, what advantage does the Adam optimizer offer over vanilla Stochastic Gradient Descent (SGD)?",
      options: [
        "Adam computes second-order Hessians on every step",
        "Adam maintains adaptive per-parameter learning rates using exponential moving averages of both first moments (mean gradients) and second moments (uncentered variance)",
        "Adam guarantees finding the global minimum in non-convex loss surfaces",
        "Adam does not require backpropagation"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Optimization"
    },
    {
      question: "What does the ROC-AUC curve plot?",
      options: [
        "Training Loss vs Validation Loss across epochs",
        "True Positive Rate (Sensitivity) vs False Positive Rate (1 - Specificity) across different classification decision thresholds",
        "Precision vs Recall at fixed threshold 0.5",
        "Learning rate vs batch size"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Metrics"
    },
    {
      question: "Why are Dropout layers deactivated during model inference/evaluation?",
      options: [
        "Because inference requires stochastic randomness",
        "Dropout is a regularization technique during training; at inference, all neurons must be active (scaled by the keep probability) to produce deterministic predictions",
        "Because GPU drivers disable dropout automatically",
        "Dropout is active in all phases"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Regularization"
    },
    // Hard (6)
    {
      question: "In the Transformer architecture, what is the computational and memory complexity of standard Multi-Head Self-Attention with respect to sequence length N?",
      options: ["O(N)", "O(N log N)", "O(N^2)", "O(N^3)"],
      answerIndex: 2,
      difficulty: "hard",
      topic: "Transformers"
    },
    {
      question: "How does FlashAttention (Dao et al.) speed up self-attention while drastically reducing GPU memory footprint?",
      options: [
        "By quantizing attention weights to 1-bit integers",
        "By tiling Query, Key, and Value blocks to compute attention softmax incrementally in fast GPU SRAM, avoiding materializing the full N x N attention matrix in slow HBM (High Bandwidth Memory)",
        "By pruning 90% of tokens before computing attention",
        "By executing attention on CPU cores"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Attention Optimization"
    },
    {
      question: "Why do Deep Residual Networks (ResNets) solve the vanishing gradient problem in very deep architectures?",
      options: [
        "By eliminating all non-linear activation functions",
        "By adding identity shortcut connections (F(x) + x), allowing gradients to backpropagate directly through the skip connections without attenuation: dLoss/dx = dLoss/dF * dF/dx + dLoss/dx",
        "By using 16-bit floating point precision",
        "By training each layer one at a time"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Architecture"
    },
    {
      question: "In self-supervised pre-training, what is the core difference between Masked Language Modeling (BERT) and Causal/Autoregressive Language Modeling (GPT)?",
      options: [
        "BERT predicts masked tokens bidirectionally seeing both past and future context; GPT uses a causal triangular attention mask to predict the next token using only preceding tokens",
        "GPT can only process English; BERT processes all languages",
        "BERT uses recurrent LSTM cells; GPT uses Transformers",
        "BERT cannot be fine-tuned"
      ],
      answerIndex: 0,
      difficulty: "hard",
      topic: "LLMs"
    },
    {
      question: "What is the Bias-Variance Decomposition formula for Expected Prediction Error under Mean Squared Error?",
      options: [
        "Error = Bias + Variance",
        "Error = Bias^2 + Variance + Irreducible Error (Noise)",
        "Error = (Bias * Variance) / Noise",
        "Error = Precision + Recall"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Learning Theory"
    },
    {
      question: "Why is Layer Normalization preferred over Batch Normalization in natural language processing and Transformer models?",
      options: [
        "LayerNorm normalizes across the feature dimension for each token independently, making it invariant to variable sequence lengths and batch sizes (including batch size = 1 during inference)",
        "Batch Normalization requires double precision floats",
        "LayerNorm eliminates all weight decay requirements",
        "LayerNorm is computationally free"
      ],
      answerIndex: 0,
      difficulty: "hard",
      topic: "Normalization"
    }
  ],

  // ─── 13. RUST ─────────────────────────────────────────────────────────────
  rust: [
    // Easy (4)
    {
      question: "What is the default mutability of variables declared with 'let' in Rust?",
      options: ["Mutable", "Immutable", "Static", "Volatile"],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Language Core"
    },
    {
      question: "Which keyword is used to make a variable mutable in Rust?",
      options: ["var", "mut", "mutable", "ref"],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Variables"
    },
    {
      question: "What are the two variants of the standard 'Option' enum in Rust?",
      options: ["True and False", "Some(T) and None", "Ok(T) and Err(E)", "Valid and Invalid"],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Standard Types"
    },
    {
      question: "What is Cargo in the Rust ecosystem?",
      options: [
        "A container runtime like Docker",
        "Rust's official build system and package manager",
        "A memory profiling tool",
        "A Rust-to-C++ transpiler"
      ],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Tooling"
    },
    // Medium (5)
    {
      question: "What are the core rules of references enforced by the Rust Borrow Checker?",
      options: [
        "You can have any number of mutable references at any time",
        "At any given time, you can have either one mutable reference (&mut T) OR any number of immutable references (&T), and references must always be valid",
        "References can outlive the data they point to as long as unsafe is used",
        "Immutable references cannot be passed to functions"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Borrow Checker"
    },
    {
      question: "What does the '?' operator do when used on a Result<T, E> expression in Rust?",
      options: [
        "It prints the error to stdout and continues",
        "If the Result is Ok(v), it unwraps and evaluates to v; if Err(e), it immediately returns from the enclosing function with From::from(e)",
        "It suppresses all panics",
        "It converts Result into an Option"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Error Handling"
    },
    {
      question: "What is the difference between String and &str in Rust?",
      options: [
        "String is an owned, heap-allocated, growable UTF-8 buffer; &str is an immutable string slice (a pointer and length) borrowing a view of a string",
        "&str is allocated on the heap; String is on the stack",
        "String is only supported on 64-bit systems",
        "There is no difference"
      ],
      answerIndex: 0,
      difficulty: "medium",
      topic: "Strings"
    },
    {
      question: "What is the purpose of the 'Deref' trait in Rust?",
      options: [
        "To delete objects from memory",
        "To customize the behavior of the dereference operator (*), enabling deref coercion (e.g. automatically coercing &String to &str)",
        "To allow multithreaded data races",
        "To serialize structs to binary"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Traits"
    },
    {
      question: "What is the difference between Rc<T> and Arc<T> in Rust?",
      options: [
        "Rc<T> is a single-threaded reference-counting pointer; Arc<T> is an Atomic Reference Counting pointer safe to share across threads (implements Send and Sync)",
        "Arc<T> cannot be cloned",
        "Rc<T> uses hardware atomic instructions",
        "Arc<T> can only hold primitive numbers"
      ],
      answerIndex: 0,
      difficulty: "medium",
      topic: "Smart Pointers"
    },
    // Hard (6)
    {
      question: "What do the 'Send' and 'Sync' marker traits signify in Rust's concurrency model?",
      options: [
        "Send means a type can be serialized; Sync means it can be encrypted",
        "Send indicates ownership of the type can be transferred across thread boundaries; Sync indicates it is safe to share references to the type (&T) across multiple threads simultaneously (T is Sync if and only if &T is Send)",
        "Send is for UDP sockets; Sync is for TCP sockets",
        "They are required for all async/await futures"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Concurrency Traits"
    },
    {
      question: "In Rust, why is RefCell<T> referred to as offering 'interior mutability'?",
      options: [
        "It mutates variables inside the CPU cache directly",
        "It allows mutating data even behind an immutable reference (&T) by moving borrow check enforcement from compile-time to runtime (panicking on violation)",
        "It makes all fields public",
        "It bypasses the operating system memory allocator"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Interior Mutability"
    },
    {
      question: "What are Lifetime Elision rules in Rust function signatures?",
      options: [
        "Rules that allow the compiler to infer explicit lifetime annotations for common function signature patterns without programmer intervention",
        "Rules that force all references to have the 'static lifetime",
        "Rules that delete variables before the end of their scope",
        "Rules for compiling Rust into WebAssembly"
      ],
      answerIndex: 0,
      difficulty: "hard",
      topic: "Lifetimes"
    },
    {
      question: "What is the operational difference between static dispatch and dynamic dispatch in Rust trait usage?",
      options: [
        "Static dispatch (impl Trait or generics) uses monomorphization at compile-time to generate dedicated code with zero runtime overhead; dynamic dispatch (dyn Trait) uses fat pointers containing a vtable pointer evaluated at runtime",
        "Static dispatch is slower than dynamic dispatch",
        "dyn Trait cannot call methods",
        "Static dispatch is only available in debug builds"
      ],
      answerIndex: 0,
      difficulty: "hard",
      topic: "Dispatch"
    },
    {
      question: "What invariants must code inside an 'unsafe' block uphold in Rust?",
      options: [
        "Unsafe code disables the borrow checker across the entire project",
        "The developer must manually guarantee that the operations (e.g. dereferencing raw pointers, calling FFI, mutating statics) never produce Undefined Behavior, upholding Rust's safety guarantees for callers",
        "Unsafe code cannot be compiled by release builds",
        "Unsafe blocks can only contain assembly instructions"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Unsafe Rust"
    },
    {
      question: "What is 'monomorphization' in the Rust compiler?",
      options: [
        "Converting multi-threaded code into single-threaded code",
        "The process of turning generic code into specific code by generating a copy of the function/struct for each concrete type used, enabling aggressive inlining and optimization at the cost of binary size",
        "Converting Rust code to C headers",
        "Packaging crates into a single static library"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Compiler Architecture"
    }
  ],

  // ─── 14. REACT NATIVE ─────────────────────────────────────────────────────
  "react native": [
    // Easy (4)
    {
      question: "Which core component in React Native is the fundamental building block for UI layouts, equivalent to a <div> on the web?",
      options: ["<Text>", "<View>", "<Container>", "<Box>"],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Components"
    },
    {
      question: "What must all text strings be wrapped in when rendering UI in React Native?",
      options: ["<div>", "<Text>", "<Span>", "<Label>"],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Components"
    },
    {
      question: "Which stylesheet method is recommended for creating cached and optimized style definitions in React Native?",
      options: ["CSS.create()", "StyleSheet.create()", "Styles.make()", "Theme.build()"],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Styling"
    },
    {
      question: "What unit are dimensions (width, height, margin, padding) defined in by default in React Native styles?",
      options: ["px (physical pixels)", "pt or dp (density-independent points/pixels)", "em", "% (percent by default)"],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Dimensions"
    },
    // Medium (5)
    {
      question: "What is the primary architectural purpose of the 'Hermes' engine in React Native?",
      options: [
        "To manage push notifications in the background",
        "An open-source JavaScript engine optimized by Meta specifically for Android/iOS mobile apps, delivering faster TTI (Time to Interactive), ahead-of-time (AOT) bytecode compilation, and lower memory footprint",
        "A layout engine replacing Flexbox",
        "An image compression library"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Hermes"
    },
    {
      question: "Why does FlatList offer superior performance over ScrollView when rendering 5,000 items in React Native?",
      options: [
        "FlatList compresses images automatically",
        "FlatList virtualizes rows, mounting only the visible items currently in the viewport (and recycling off-screen views), whereas ScrollView renders all 5,000 components simultaneously in native memory",
        "ScrollView cannot display text",
        "FlatList runs on the GPU directly"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Performance"
    },
    {
      question: "In React Native animations, what does setting 'useNativeDriver: true' accomplish?",
      options: [
        "It forces the animation to run on native thread drivers without crossing the asynchronous bridge on every single frame, ensuring smooth 60 FPS even if the JS thread is blocked",
        "It connects the animation to the device accelerometer",
        "It enables 3D gaming physics",
        "It allows animating width and height layout properties"
      ],
      answerIndex: 0,
      difficulty: "medium",
      topic: "Animations"
    },
    {
      question: "How does React Native enable platform-specific component code for iOS and Android?",
      options: [
        "By setting window.navigator.platform checks inside every render",
        "Using Platform.select({ ios: ..., android: ... }) or dedicated file extensions (.ios.tsx and .android.tsx) automatically resolved by Metro bundler",
        "By compiling two separate Git branches",
        "Platform-specific code is not supported"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Platform API"
    },
    {
      question: "Which component should be used to protect content from overlapping with device hardware notches, home bars, and status bars?",
      options: ["<View>", "<SafeAreaView>", "<StatusBar>", "<KeyboardAvoidingView>"],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Layout"
    },
    // Hard (6)
    {
      question: "In React Native's New Architecture, what is the role of JSI (JavaScript Interface)?",
      options: [
        "A JSON messaging protocol over WebSockets",
        "A lightweight, general-purpose C++ interface layer that allows JavaScript code to hold direct C++ object references and invoke native functions synchronously without serializing JSON payloads across a bridge",
        "A compiler for Kotlin bytecode",
        "A tool for debugging React Native apps in Chrome"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "New Architecture"
    },
    {
      question: "What is 'Fabric' in the context of React Native's New Architecture?",
      options: [
        "A CSS framework for mobile screens",
        "The new concurrent native rendering system that directly coordinates with React 18 concurrent features, enabling synchronous native layout calculation and high-priority UI updates without tearing",
        "An iOS packaging pipeline",
        "A cloud device farm for automated testing"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Fabric"
    },
    {
      question: "How do 'TurboModules' improve app startup performance over legacy Native Modules in React Native?",
      options: [
        "By compiling all native libraries into WebAssembly",
        "By lazily loading and initializing native modules on demand when first accessed from JavaScript via JSI, rather than instantiating every registered native module upfront at app launch",
        "By executing native modules inside background web workers",
        "By running native modules in a separate OS process"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "TurboModules"
    },
    {
      question: "What is the function of the C++ Yoga engine in React Native?",
      options: [
        "Audio playback processing",
        "A cross-platform C++ implementation of the W3C Flexbox layout specification, calculating exact coordinates and dimensions for React Native views on iOS and Android",
        "Cryptographic key generation",
        "OpenGL shader compilation"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Yoga Layout"
    },
    {
      question: "Why should react-native-reanimated be used instead of React Native's built-in Animated API for gesture-driven interactions?",
      options: [
        "Reanimated allows animation worklets to execute directly on the UI thread in response to touch events, completely avoiding JS-thread latency during complex drag and swipe gestures",
        "Built-in Animated was deprecated in React Native 0.60",
        "Reanimated uses WebGL shaders exclusively",
        "Reanimated works without installing native pods"
      ],
      answerIndex: 0,
      difficulty: "hard",
      topic: "Reanimated"
    },
    {
      question: "Why is storing sensitive auth tokens in AsyncStorage a critical security vulnerability in React Native?",
      options: [
        "AsyncStorage is deleted every time the app closes",
        "AsyncStorage stores data unencrypted in plain text files (or SQLite) on device storage, making it accessible on rooted/jailbroken devices or backup extracts; secure storage (Keychain / KeyStore) must be used instead",
        "AsyncStorage can only store 50 characters",
        "AsyncStorage sends all data unencrypted over HTTP"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Security"
    }
  ],

  // ─── 15. TECHNICAL MANAGEMENT ─────────────────────────────────────────────
  "technical management": [
    // Easy (4)
    {
      question: "What is the primary purpose of a daily standup meeting in Agile software development?",
      options: [
        "A status report directly to company executives",
        "A quick synchronization for the team to align on progress, coordinate today's commitments, and surface blockers",
        "A performance review meeting to assign fault for delayed tickets",
        "A 60-minute technical design review"
      ],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Agile Ceremonies"
    },
    {
      question: "What does the term 'Bus Factor' represent in software engineering teams?",
      options: [
        "The budget allocated for employee public transit passes",
        "The minimum number of team members that can be incapacitated (e.g. hit by a bus) before the project halts due to lack of shared knowledge",
        "The total number of microservices deployed on a message bus",
        "The bandwidth of the internal office network"
      ],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Team Health"
    },
    {
      question: "What is an Architecture Decision Record (ADR)?",
      options: [
        "A contract signed by cloud vendors",
        "A short text document capturing an important architectural decision, the context in which it was made, the consequences, and trade-offs considered",
        "A list of software patents owned by the organization",
        "A bug report generated by continuous integration"
      ],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Governance"
    },
    {
      question: "What is the main objective of a Sprint Retrospective meeting?",
      options: [
        "To demo features to external customers",
        "For the engineering team to inspect their processes, relationships, and tools, and identify concrete actionable improvements for future iterations",
        "To negotiate salaries with human resources",
        "To re-estimate all closed Jira tickets"
      ],
      answerIndex: 1,
      difficulty: "easy",
      topic: "Agile Retrospectives"
    },
    // Medium (5)
    {
      question: "What are the four core DORA metrics used to evaluate software delivery performance?",
      options: [
        "Lines of code, hours worked, bugs logged, test count",
        "Deployment Frequency, Lead Time for Changes, Change Failure Rate, and Time to Restore Service (MTTR)",
        "Velocity points, story count, sprint count, burndown slope",
        "Cloud spend, server count, CPU utilization, uptime percentage"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "DORA Metrics"
    },
    {
      question: "In Site Reliability Engineering (SRE), what is an 'Error Budget'?",
      options: [
        "The financial budget allocated to pay for software bug bounties",
        "The allowable threshold of unreliability (100% minus the Service Level Objective, e.g. 0.1% downtime) that can be spent on high-velocity innovation and risky deployments before freezing releases to fix reliability",
        "The maximum number of bugs allowed in a sprint",
        "A penalty deducted from engineering bonuses"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "SRE"
    },
    {
      question: "What does Conway's Law observe regarding organizational structure and software architecture?",
      options: [
        "Organizations that design software systems are constrained to produce designs that are copies of the communication structures of those organizations",
        "Software size doubles every 18 months",
        "Adding manpower to a late software project makes it later",
        "Premature optimization is the root of all evil"
      ],
      answerIndex: 0,
      difficulty: "medium",
      topic: "System Design"
    },
    {
      question: "What is the primary benefit of Feature Flagging (Feature Toggles) in continuous delivery?",
      options: [
        "It eliminates the need for unit tests",
        "It decouples code deployment from feature release, allowing code to be pushed to production dark and enabled gradually for targeted user cohorts without redeploying",
        "It compresses production Docker images",
        "It prevents merge conflicts in Git"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Release Engineering"
    },
    {
      question: "In a Blameless Postmortem following a major production outage, what is the primary focus?",
      options: [
        "Assigning disciplinary action to the individual who triggered the deployment",
        "Understanding systemic vulnerabilities, latent design flaws, and missing guardrails that enabled the failure to occur, without pointing fingers at human error",
        "Deleting log files to reduce cloud storage costs",
        "Replacing all junior engineers on call"
      ],
      answerIndex: 1,
      difficulty: "medium",
      topic: "Incident Management"
    },
    // Hard (6)
    {
      question: "When refactoring a legacy monolithic application into microservices, what is the 'Strangler Fig' pattern?",
      options: [
        "Completely shutting down the monolith and rewriting the entire platform from scratch over two years",
        "Incrementally intercepting and replacing specific domain workflows with new microservices behind an API gateway until the monolith has been entirely replaced, reducing migration risk",
        "Deprecating all database foreign keys",
        "Splitting the database schema into random shards without changing code"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "System Modernization"
    },
    {
      question: "What does the 'Two-Pizza Team' rule coined by Jeff Bezos prescribe for engineering organizations?",
      options: [
        "Providing pizza during late-night deployments",
        "Teams should be small enough (typically 6-10 people) to be fed by two pizzas, minimizing communication overhead (n*(n-1)/2 channels) and maximizing autonomy and ownership",
        "Pair-programming must always involve two people",
        "Engineering budgets must be audited twice per quarter"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Organizational Design"
    },
    {
      question: "In technical debt management, how should engineering leadership quantify and prioritize tech debt against product features?",
      options: [
        "Tech debt should be permanently ignored until an outage occurs",
        "Classify debt by business risk and developer velocity impact (e.g., using Martin Fowler's Tech Debt Quadrant), dedicating an agreed, continuous capacity (e.g. 15-20%) each sprint",
        "Dedicate 100% of the entire department's capacity to debt every six months",
        "Assign all tech debt tickets exclusively to new hires"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Tech Debt Strategy"
    },
    {
      question: "What is psychological safety in engineering teams according to Google's Project Aristotle research?",
      options: [
        "Guaranteeing that no engineer is ever assigned on-call shifts",
        "A shared belief held by team members that the team is safe for interpersonal risk-taking, where developers feel confident speaking up, proposing ideas, and admitting mistakes without fear of humiliation",
        "Installing physical security access cards on server rooms",
        "Restricting code reviews to anonymous reviewers"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Team Culture"
    },
    {
      question: "In high-stakes Incident Command systems (ICS for Tech), what is the sole primary role of the Incident Commander (IC)?",
      options: [
        "To write the code fix directly while on the bridge",
        "To coordinate the response, establish clear roles (Scribe, Communications Lead, Investigators), maintain order, and drive decision-making without directly troubleshooting themselves",
        "To manage external public relations and media press releases",
        "To reboot all production database servers immediately"
      ],
      answerIndex: 1,
      difficulty: "hard",
      topic: "Incident Response"
    },
    {
      question: "What is the key difference between SLI (Indicator), SLO (Objective), and SLA (Agreement)?",
      options: [
        "SLI is the metric measured (e.g. 99.92% successful requests); SLO is the internal target set by engineering (e.g. 99.9%); SLA is the formal contractual commitment to customers with financial penalties if breached",
        "SLO is legally binding; SLA is internal",
        "SLI is measured in dollars; SLO is measured in seconds",
        "There is no difference; all three represent uptime percentage"
      ],
      answerIndex: 0,
      difficulty: "hard",
      topic: "SRE Governance"
    }
  ]
};
