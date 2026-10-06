import { EXPANDED_MCQS } from "./expanded-bank";

export interface MCQ {
  id?: string;
  question: string;
  options: string[];
  answerIndex?: number;
  explanation?: string;
  difficulty?: "easy" | "medium" | "hard";
  topic?: string;
}

export interface SupportedLanguage {
  id: string;
  name: string;
  monacoLang: string;
  template: string;
}

export interface CodingChallenge {
  id?: string;
  title: string;
  instructions: string;
  initialCode: string;
  language?: string;
  supportedLanguages?: SupportedLanguage[];
}

export interface AssessmentContent {
  mcqs: MCQ[];
  /** Single task (legacy) */
  coding?: CodingChallenge;
  /** Dual-task bank-aware mode: [0] = easy, [1] = medium-hard */
  codingTasks?: CodingChallenge[];
  hasCoding: boolean;
  timeLimitMinutes: number;
  /** "coding_capable" (bank) | "mcq_only" (legacy MCQ) */
  assessmentType?: "coding_capable" | "mcq_only";
}

export const COMMON_SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  {
    id: "python",
    name: "Python 3",
    monacoLang: "python",
    template: `def process_transactions(csv_string: str) -> dict:
    # Write your solution here
    pass
`
  },
  {
    id: "javascript",
    name: "JavaScript (ES6)",
    monacoLang: "javascript",
    template: `export function processTransactions(csvString) {
    // Parse CSV, filter status == 'COMPLETED', sum by user_id
    const totals = {};
    return totals;
}
`
  },
  {
    id: "typescript",
    name: "TypeScript",
    monacoLang: "typescript",
    template: `export function processTransactions(csvString: string): Record<string, number> {
    // Parse CSV, filter status == 'COMPLETED', sum by user_id
    const totals: Record<string, number> = {};
    return totals;
}
`
  },
  {
    id: "java",
    name: "Java 21",
    monacoLang: "java",
    template: `import java.util.*;

public class Solution {
    public static Map<String, Double> processTransactions(String csvString) {
        Map<String, Double> totals = new HashMap<>();
        return totals;
    }
}
`
  },
  {
    id: "cpp",
    name: "C++ (GCC 14)",
    monacoLang: "cpp",
    template: `#include <iostream>
#include <string>
#include <unordered_map>

std::unordered_map<std::string, double> processTransactions(const std::string& csv) {
    std::unordered_map<std::string, double> totals;
    return totals;
}
`
  },
  {
    id: "sql",
    name: "SQL",
    monacoLang: "sql",
    template: `-- Write your query below
-- Problem: Top 3 Spenders in 2024
-- Table: orders (id, user_id, amount, status, created_at)
-- Filter: status = 'COMPLETED'
-- Output: user_id, total_spent (ordered by total_spent DESC, LIMIT 3)

SELECT
    -- Fill in your SQL query here
FROM orders
WHERE status = 'COMPLETED'
`
  },
  {
    id: "golang",
    name: "Go (Golang)",
    monacoLang: "go",
    template: `package main

import "fmt"

func processTransactions(csvString string) map[string]float64 {
    totals := make(map[string]float64)
    // Write your solution here
    return totals
}
`
  },
  {
    id: "csharp",
    name: "C# (.NET 8)",
    monacoLang: "csharp",
    template: `using System;
using System.Collections.Generic;

public class Solution {
    public static Dictionary<string, double> ProcessTransactions(string csvString) {
        var totals = new Dictionary<string, double>();
        // Write your solution here
        return totals;
    }
}
`
  },
  {
    id: "django",
    name: "Python (Django)",
    monacoLang: "python",
    template: `from django.db import models

# Assume a Django environment is available
def process_transactions(csv_string: str) -> dict:
    # Write your solution here
    pass
`
  },
  {
    id: "angular",
    name: "TypeScript (Angular)",
    monacoLang: "typescript",
    template: `import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TransactionService {
    processTransactions(csvString: string): Record<string, number> {
        const totals: Record<string, number> = {};
        // Write your solution here
        return totals;
    }
}
`
  }
];

export const SQL_SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  {
    id: "sql",
    name: "SQL",
    monacoLang: "sql",
    template: `-- Write your SQL query here
-- Table schema: orders (id, user_id, amount, status, created_at)
-- Requirements:
-- 1. Filter for orders where status = 'COMPLETED'
-- 2. Sum total amount spent per user in year 2024
-- 3. Return user_id, total_spent
-- 4. Order by total_spent descending and return the top 3 spenders

SELECT
    -- Write your query logic here
FROM orders
WHERE status = 'COMPLETED'
`
  }
];

const BASE_QUESTION_BANKS: Record<string, { mcqPool: MCQ[]; codingPool: CodingChallenge[] }> = {
  // 1. REACT
  react: {
    mcqPool: [
      {
        question: "Which hook should you use to perform side effects in a React function component?",
        options: ["useState", "useMemo", "useEffect", "useReducer"],
        answerIndex: 2,
        difficulty: "easy",
        topic: "Hooks"
      },
      {
        question: "What causes a React functional component to re-render?",
        options: [
          "Only when props change",
          "Only when state changes",
          "When state or props change, or when its parent component re-renders",
          "When the DOM is manually updated"
        ],
        answerIndex: 2,
        difficulty: "easy",
        topic: "Rendering"
      },
      {
        question: "What is the primary purpose of the React useCallback hook?",
        options: [
          "To memoize a calculated value",
          "To memoize a callback function instance between renders to prevent unnecessary child re-renders",
          "To trigger a synchronous side-effect before paint",
          "To manage global application state"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Optimization"
      },
      {
        question: "In React, why should you avoid using array indices as key props when list items can be reordered or filtered?",
        options: [
          "It throws a compile-time syntax error in strict mode",
          "It can cause component state mismatches and degrades virtual DOM reconciliation performance",
          "Array indices cannot be cast to strings",
          "React keys are strictly required to be UUID strings"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Reconciliation"
      },
      {
        question: "What does the React Fiber reconciler achieve over the legacy Stack reconciler?",
        options: [
          "It forces all DOM mutations to execute completely synchronously",
          "It enables incremental rendering by splitting work into units and pausing/resuming based on priority",
          "It replaces the Virtual DOM with direct multithreaded web workers",
          "It compiles JSX into machine binary bytecode"
        ],
        answerIndex: 1,
        difficulty: "hard",
        topic: "Architecture"
      },
      {
        question: "What is the primary difference between useLayoutEffect and useEffect?",
        options: [
          "useLayoutEffect runs on a background Web Worker thread",
          "useLayoutEffect fires synchronously after DOM mutations but before the browser paints to prevent layout shift",
          "useLayoutEffect cannot have a dependency array",
          "useLayoutEffect is only available in Class Components"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Hooks"
      },
      {
        question: "In React 18+, what is the purpose of the useTransition hook?",
        options: [
          "To run CSS keyframe animations",
          "To mark state updates as non-urgent transitions, keeping the user interface responsive during heavy renders",
          "To navigate between browser URL routes",
          "To handle HTTP 302 redirects"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Concurrent Mode"
      },
      {
        question: "How does React manage synthetic events compared to native browser events?",
        options: [
          "It binds native event listeners directly to every single target DOM node",
          "It uses event delegation at the root container to normalize cross-browser discrepancies and optimize memory",
          "It intercepts native browser mouse interrupts in the OS kernel",
          "It serializes events into JSON WebSockets"
        ],
        answerIndex: 1,
        difficulty: "hard",
        topic: "Events"
      },
      {
        question: "Consider: const [count, setCount] = useState(0); function handleClick() { setCount(count + 1); setCount(count + 1); }. What is count after one click?",
        options: ["2", "1", "0", "NaN"],
        answerIndex: 1,
        difficulty: "medium",
        topic: "State Batching"
      },
      {
        question: "How should you update state when the next state depends on the previous state in asynchronous closures?",
        options: [
          "setCount(count + 1)",
          "setCount((prev) => prev + 1)",
          "count = count + 1",
          "useRef(count + 1)"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Hooks"
      },
      {
        question: "What happens when an Error Boundary catches an error in a child component tree?",
        options: [
          "The entire webpage crashes and reloads from cache",
          "It catches errors during rendering, in lifecycle methods, and constructors, displaying a fallback UI instead of unmounting the whole tree",
          "It intercepts asynchronous fetch promise rejections automatically",
          "It redirects the user to /404"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Error Handling"
      },
      {
        question: "Which of the following errors CANNOT be caught by a React Error Boundary?",
        options: [
          "Errors in child component render methods",
          "Errors in child component constructor functions",
          "Errors inside asynchronous event handlers (e.g. onClick async functions)",
          "Errors in child component getDerivedStateFromProps"
        ],
        answerIndex: 2,
        difficulty: "hard",
        topic: "Error Handling"
      },
      {
        question: "Why should you NOT call hooks inside loops, conditions, or nested functions?",
        options: [
          "V8 garbage collection fails on nested scope declarations",
          "React relies on the exact call order of hooks on every render to correctly preserve hook state arrays",
          "JavaScript closures cannot capture outer variables inside conditional blocks",
          "It triggers an uncatchable WebAssembly memory fault"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Hook Rules"
      },
      {
        question: "What does the useRef hook return, and how does mutating .current affect rendering?",
        options: [
          "It returns a tuple [value, setter] and triggers a re-render on change",
          "It returns a mutable object { current: ... } whose modification does NOT trigger a component re-render",
          "It returns an immutable frozen proxy that throws on mutation",
          "It returns a DOM element string identifier"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Hooks"
      },
      {
        question: "In React 18, how does automatic batching behave for state updates inside promises and setTimeout?",
        options: [
          "It only batches updates inside native React synthetic event handlers",
          "It automatically batches state updates regardless of whether they originate in promises, timeouts, or native event handlers",
          "It disables batching entirely unless flushSync is invoked",
          "It batches updates only in development mode"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "React 18"
      },
      {
        question: "When should you use useMemo over standard inline variable calculation?",
        options: [
          "For every single primitive number or string assignment",
          "Only when the computation is computationally expensive or when preserving reference equality for memoized children is required",
          "To fetch remote API data asynchronously",
          "To update document.title on route change"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Optimization"
      }
    ],
    codingPool: [
      {
        id: "react-counter",
        title: "Bounded Counter Component",
        language: "javascript",
        instructions: "Implement a React functional component `Counter` with 'Increment', 'Decrement', and 'Reset' buttons.\n\nRequirements:\n1. The count must never drop below 0.\n2. When count reaches 10, disable the Increment button.\n3. Display an alert text 'Max reached' when count is 10.",
        initialCode: `import React, { useState } from 'react';

export default function Counter() {
    // Write your code here
    
}
`,
        supportedLanguages: COMMON_SUPPORTED_LANGUAGES
      }
    ]
  },

  // 2. PYTHON
  python: {
    mcqPool: [
      {
        question: "What is the output of print(type([])) in Python 3?",
        options: ["<class 'list'>", "<class 'array'>", "<class 'dict'>", "<class 'tuple'>"],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Types"
      },
      {
        question: "Which statement accurately describes Python's Global Interpreter Lock (GIL)?",
        options: [
          "It enables multiple native threads to execute CPU-bound Python bytecode in parallel across all cores",
          "It is a mutex in CPython that prevents multiple native threads from executing Python bytecodes simultaneously",
          "It disables garbage collection in multi-threaded programs",
          "It automatically compiles Python into machine code"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Concurrency"
      },
      {
        question: "What is the average time complexity of looking up an item by key in a Python dict?",
        options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Data Structures"
      },
      {
        question: "Consider def func(a, items=[]): items.append(a); return items. What is returned after calling func(1) followed by func(2)?",
        options: ["[1] and [2]", "[1] and [1, 2]", "[1, 2] and [1, 2]", "TypeError"],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Mutable Defaults"
      },
      {
        question: "How do Python generator functions manage memory when processing massive datasets?",
        options: [
          "They load the whole dataset into disk swap partition",
          "They yield elements lazily on demand, maintaining state with minimal memory footprint without loading all items at once",
          "They compress elements in RAM using zlib",
          "They convert Python objects to C structs"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Generators"
      },
      {
        question: "What is the difference between copy.copy() (shallow copy) and copy.deepcopy() in Python?",
        options: [
          "copy.copy() is for lists only; deepcopy is for dictionaries",
          "copy() creates a new compound object inserting references to objects in the original; deepcopy() recursively copies all nested objects",
          "deepcopy() freezes objects into immutable tuples",
          "They are identical aliases"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Memory"
      },
      {
        question: "What method must a Python class implement to support the 'with' statement context manager protocol?",
        options: [
          "__init__ and __del__",
          "__enter__ and __exit__",
          "__open__ and __close__",
          "__start__ and __stop__"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Context Managers"
      },
      {
        question: "What is the Method Resolution Order (MRO) algorithm used in Python 3 for multiple inheritance?",
        options: [
          "Depth-First Search (DFS)",
          "C3 Linearization algorithm",
          "Breadth-First Search (BFS)",
          "Dijkstra's Shortest Path"
        ],
        answerIndex: 1,
        difficulty: "hard",
        topic: "OOP"
      },
      {
        question: "What does the @functools.wraps decorator do when writing custom Python decorators?",
        options: [
          "It forces the decorated function to execute on a separate OS thread",
          "It copies metadata such as __name__, __doc__, and annotations from the original function to the wrapper function",
          "It caches the return value using LRU memoization",
          "It verifies type hints at runtime"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Decorators"
      },
      {
        question: "In Python, what is the purpose of defining __slots__ in a class?",
        options: [
          "To allow dynamic addition of arbitrary new attributes at runtime",
          "To restrict attribute creation and save memory by replacing __dict__ with a fixed-size array of references",
          "To encrypt class attributes in bytecode",
          "To declare abstract methods"
        ],
        answerIndex: 1,
        difficulty: "hard",
        topic: "Optimization"
      },
      {
        question: "What is the output of print([i for i in range(5) if i % 2 == 0])?",
        options: ["[0, 2, 4]", "[2, 4]", "[1, 3]", "[0, 1, 2, 3, 4]"],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Comprehensions"
      },
      {
        question: "What happens if an exception is raised inside an asyncio coroutine that is not awaited or gathered?",
        options: [
          "The entire OS process halts immediately",
          "The task logs an 'unretrieved exception was never awaited' warning upon garbage collection without crashing other coroutines",
          "It is automatically rerouted to the sys.stderr handler",
          "Asyncio converts it into a synchronous ValueError"
        ],
        answerIndex: 1,
        difficulty: "hard",
        topic: "Asyncio"
      },
      {
        question: "Which of the following data types in Python is IMMUTABLE?",
        options: ["list", "set", "dict", "tuple"],
        answerIndex: 3,
        difficulty: "easy",
        topic: "Types"
      },
      {
        question: "What does the 'is' operator test in Python compared to '=='?",
        options: [
          "'is' tests value equality; '==' tests reference identity",
          "'is' tests object identity (memory address); '==' tests value equality",
          "They are interchangeable in all Python versions",
          "'is' checks type compatibility only"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Operators"
      },
      {
        question: "In Python 3.12+, what feature allows opting out of the Global Interpreter Lock for true multi-core threading?",
        options: [
          "PyPy JIT compiler",
          "Free-threaded CPython build (--disable-gil / PEP 703)",
          "The multiprocessing module exclusively",
          "Numba @jit(nopython=True)"
        ],
        answerIndex: 1,
        difficulty: "hard",
        topic: "Modern Python"
      },
      {
        question: "What will dict.get('missing_key', 42) return if 'missing_key' does not exist in the dictionary?",
        options: ["KeyError exception", "None", "42", "0"],
        answerIndex: 2,
        difficulty: "easy",
        topic: "Data Structures"
      }
    ],
    codingPool: [
      {
        id: "python-transactions",
        title: "Transaction Reconciliation",
        language: "python",
        instructions: "Write a function `process_transactions(csv_string)` that parses a CSV string.\nColumns: `tx_id, user_id, amount, status`\n\nRequirements:\n1. Filter for rows where status is 'COMPLETED'.\n2. Ignore empty or malformed rows.\n3. Return a dictionary of `{ user_id: total_amount }` with amounts summed as floats.",
        initialCode: `def process_transactions(csv_string: str) -> dict:
    """
    Process CSV transactions, filter COMPLETED records, and sum by user_id.
    :param csv_string: raw multi-line CSV string
    :return: dict of {user_id: total_amount}
    """
    # Write your solution here
    pass
`,
        supportedLanguages: [
          { id: "python", name: "Python 3", monacoLang: "python", template: "" }
        ]
      }
    ]
  },

  // 3. TYPESCRIPT
  typescript: {
    mcqPool: [
      {
        question: "What is the primary difference between the 'unknown' and 'any' types in TypeScript?",
        options: [
          "'unknown' is an alias for undefined",
          "'unknown' is the type-safe counterpart of 'any'; values of type 'unknown' require type narrowing or casting before operations can be performed",
          "'unknown' can only hold primitive string values",
          "'unknown' turns off TypeScript type checking completely"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Type Safety"
      },
      {
        question: "What is declaration merging in TypeScript?",
        options: [
          "Combining two JavaScript files into a bundle",
          "The ability of the compiler to merge multiple interface declarations with the same name into a single definition",
          "Converting types into runtime JSON schemas",
          "Automatic import resolution"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Interfaces"
      },
      {
        question: "What does the 'readonly' modifier on array types (ReadonlyArray<T>) guarantee?",
        options: [
          "It allocates the array in V8 immutable memory",
          "It prevents mutating methods like push, pop, and index assignments at compile time",
          "It deeply freezes all nested object properties",
          "It converts the array elements into symbols"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Immutability"
      },
      {
        question: "What is the purpose of the 'infer' keyword in TypeScript conditional types?",
        options: [
          "To disable strict null checks inside a function body",
          "To declare a type variable to be deduced within the true branch of a conditional type",
          "To import external types dynamically",
          "To cast values to any at runtime"
        ],
        answerIndex: 1,
        difficulty: "hard",
        topic: "Conditional Types"
      },
      {
        question: "What does the 'as const' assertion do when applied to an object literal?",
        options: [
          "It declares a runtime const variable",
          "It marks all properties as readonly and narrows literal types (e.g. 'hello' instead of string)",
          "It serializes the object to immutable JSON",
          "It prevents garbage collection"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Type Narrowing"
      },
      {
        question: "How does a discriminated union enable exhaustive type checking in TypeScript?",
        options: [
          "By assigning a unique symbol to every interface",
          "By using a common literal property (discriminant) across union members that TypeScript can check exhaustively with 'never'",
          "By compiling unions to runtime switch statements",
          "By requiring all properties to be optional"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Unions"
      },
      {
        question: "What is the utility type 'Partial<T>' doing under the hood?",
        options: [
          "It deletes non-primitive keys",
          "It maps every property of T to be optional (P in keyof T?: T[P])",
          "It picks the first half of object properties",
          "It converts functions into promises"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Utility Types"
      },
      {
        question: "What does the 'never' type represent in TypeScript?",
        options: [
          "An unassigned variable",
          "The return type of a function that never returns (e.g. throws or infinite loops) or values that can never occur",
          "An alias for null | undefined",
          "A deprecated type"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Bottom Type"
      },
      {
        question: "What is the difference between 'type' aliases and 'interface' declarations regarding extends?",
        options: [
          "Types cannot use intersection (&) to combine shapes",
          "Interfaces can extend other interfaces or classes via 'extends', while type aliases use intersection (&) to compose types",
          "Interfaces cannot describe object shapes",
          "Type aliases can be reopened for declaration merging"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Types vs Interfaces"
      },
      {
        question: "What does 'keyof T' produce in TypeScript?",
        options: [
          "An array of string values at runtime",
          "A union type of all public property names (keys) of type T",
          "A boolean indicating if the key exists",
          "The prototype of T"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Keyof"
      },
      {
        question: "What is a user-defined type guard function signature in TypeScript?",
        options: [
          "function isString(val: any): boolean",
          "function isString(val: any): val is string",
          "function isString(val: any): asserts val",
          "function isString(val: any): typeof val"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Type Guards"
      },
      {
        question: "What is the behavior of the non-null assertion operator (!) in TypeScript?",
        options: [
          "It performs a runtime check and throws if null",
          "It tells the compiler to assert that a value is neither null nor undefined without generating any runtime check code",
          "It negates the boolean value of the expression",
          "It deletes the property from the object"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Type Assertion"
      },
      {
        question: "What does the utility type 'Record<K, T>' construct?",
        options: [
          "A database table record",
          "An object type whose property keys are K and property values are T",
          "An audio recording stream",
          "A tuple with K elements"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Utility Types"
      },
      {
        question: "What is function parameter bivariance vs contravariance in TypeScript under strictFunctionTypes?",
        options: [
          "Function parameters are strictly invariant",
          "Function parameters are checked contravariantly instead of bivariantly, ensuring safer subtype assignment",
          "Functions cannot be passed as arguments",
          "Parameters must be any"
        ],
        answerIndex: 1,
        difficulty: "hard",
        topic: "Type Theory"
      },
      {
        question: "What does the 'satisfies' operator introduced in TypeScript 4.9 do?",
        options: [
          "It converts the expression into a runtime unit test",
          "It validates that an expression matches a type without widening or losing the specific literal types of the expression",
          "It forces an asynchronous function to execute synchronously",
          "It suppresses all lint warnings on the line"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Modern TS"
      },
      {
        question: "How does TypeScript handle private fields declared with '#' compared to the 'private' keyword?",
        options: [
          "'#' fields are purely compile-time; 'private' fields are runtime private",
          "'#' fields use ECMAScript private fields which are genuinely private at runtime in the JavaScript engine",
          "They compile to the exact same code in all targets",
          "'#' fields can be accessed by subclasses"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "OOP"
      }
    ],
    codingPool: [
      {
        id: "ts-debounce",
        title: "Type-Safe Debounce Function",
        language: "typescript",
        instructions: "Implement a type-safe `debounce<T extends (...args: any[]) => any>(fn: T, delayMs: number)` function in TypeScript that cancels previous pending calls and executes `fn` only after `delayMs` milliseconds have elapsed since the last invocation.",
        initialCode: `export function debounce<T extends (...args: any[]) => void>(fn: T, delayMs: number): (...args: Parameters<T>) => void {
  // Implement timer cancellation and debouncing
  return (...args: Parameters<T>) => {};
}
`,
        supportedLanguages: COMMON_SUPPORTED_LANGUAGES
      }
    ]
  },

  // 4. JAVASCRIPT
  javascript: {
    mcqPool: [
      {
        question: "What is the output of console.log(0.1 + 0.2 === 0.3) in JavaScript?",
        options: ["true", "false", "undefined", "TypeError"],
        answerIndex: 1,
        difficulty: "easy",
        topic: "IEEE 754 Floating Point"
      },
      {
        question: "What is a JavaScript closure?",
        options: [
          "A function that terminates the execution loop",
          "A function bundled with references to its surrounding lexical state, allowing access to outer scope variables even after outer execution finishes",
          "A block that deletes all parent variables",
          "An event listener attached to the window object"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Closures"
      },
      {
        question: "In the JavaScript Event Loop, what is the execution priority order between Microtasks and Macrotasks?",
        options: [
          "Macrotasks run before all microtasks",
          "All pending microtasks (Promise.then, queueMicrotask) execute immediately after the current synchronous frame and before the next macrotask (setTimeout)",
          "They execute simultaneously on two parallel CPU threads",
          "requestAnimationFrame runs before microtasks"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Event Loop"
      },
      {
        question: "Consider: for (var i = 0; i < 3; i++) { setTimeout(() => console.log(i), 0); }. What is printed?",
        options: ["0, 1, 2", "3, 3, 3", "undefined, undefined, undefined", "0, 0, 0"],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Scope & Hoisting"
      },
      {
        question: "How does the 'let' keyword differ from 'var' in JavaScript?",
        options: [
          "'let' is globally scoped; 'var' is block-scoped",
          "'let' is block-scoped and cannot be accessed before declaration (Temporal Dead Zone); 'var' is function-scoped and hoisted",
          "'let' cannot be reassigned once declared",
          "'var' prevents garbage collection"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Variables"
      },
      {
        question: "What does Object.freeze() do to an object in JavaScript?",
        options: [
          "It compresses the object in memory",
          "It prevents adding, deleting, or modifying existing properties of the top-level object (shallow freeze)",
          "It deeply freezes all nested objects recursively",
          "It converts the object into a Map"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Objects"
      },
      {
        question: "What is the difference between == and === in JavaScript?",
        options: [
          "== compares memory addresses; === compares values",
          "== performs type coercion before comparison; === compares both value and type strictly without coercion",
          "=== is only supported in Node.js",
          "There is no difference"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Operators"
      },
      {
        question: "What is the output of typeof NaN in JavaScript?",
        options: ["'nan'", "'number'", "'undefined'", "'object'"],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Types"
      },
      {
        question: "What is the behavior of Promise.all([p1, p2, p3]) if one of the promises rejects?",
        options: [
          "It waits for all others to finish and returns resolved ones",
          "It immediately rejects with the error of the first rejected promise (fail-fast)",
          "It ignores the error and returns null",
          "It retries the rejected promise"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Promises"
      },
      {
        question: "Which method should you use if you want all promises to complete regardless of resolution or rejection?",
        options: ["Promise.race()", "Promise.allSettled()", "Promise.any()", "Promise.all()"],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Promises"
      },
      {
        question: "What does the 'this' keyword refer to inside an arrow function?",
        options: [
          "The object that called the function at runtime",
          "It lexically captures 'this' from the surrounding enclosing execution context where it was defined",
          "The global window object always",
          "undefined in all cases"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Functions"
      },
      {
        question: "What happens when you access an undeclared variable (without let/const/var) in 'use strict' mode?",
        options: [
          "It creates a global variable automatically",
          "It throws a ReferenceError",
          "It assigns undefined silently",
          "It converts to null"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Strict Mode"
      },
      {
        question: "What does Array.prototype.reduce((acc, curr) => acc + curr, 0) return for an empty array []?",
        options: ["TypeError", "0", "undefined", "NaN"],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Arrays"
      },
      {
        question: "What is WeakMap's primary memory advantage over a standard Map?",
        options: [
          "It stores keys in binary format",
          "Keys must be objects, and they are held weakly so they can be garbage collected if there are no other references",
          "It can store unlimited primitive keys",
          "It is thread-safe"
        ],
        answerIndex: 1,
        difficulty: "hard",
        topic: "Memory"
      },
      {
        question: "What does the structuredClone() global function do in modern JavaScript?",
        options: [
          "It creates a shallow copy of an object",
          "It creates a deep copy of a JavaScript value using the structured clone algorithm, supporting nested objects, arrays, and Maps",
          "It converts objects to XML",
          "It creates a DOM node"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Modern JS"
      },
      {
        question: "What is the output of [1, 2, 3] + [4, 5, 6] in JavaScript?",
        options: ["[1, 2, 3, 4, 5, 6]", "'1,2,34,5,6'", "NaN", "TypeError"],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Type Coercion"
      }
    ],
    codingPool: [
      {
        id: "js-debounce",
        title: "Debounce Implementation",
        language: "javascript",
        instructions: "Implement a `debounce(fn, delayMs)` function in JavaScript that delays executing `fn` until `delayMs` milliseconds have passed since the last time it was called.",
        initialCode: `export function debounce(fn, delayMs) {
  // Implement debouncing
  return function(...args) {
  };
}
`,
        supportedLanguages: [
          {
            id: "javascript",
            name: "JavaScript (ES6)",
            monacoLang: "javascript",
            template: `export function debounce(fn, delayMs) {
  // Implement debouncing
  return function(...args) {
  };
}
`
          }
        ]
      }
    ]
  },

  // 5. JAVA
  java: {
    mcqPool: [
      {
        question: "Which of the following is NOT a primitive data type in Java?",
        options: ["int", "boolean", "String", "double"],
        answerIndex: 2,
        difficulty: "easy",
        topic: "Types"
      },
      {
        question: "What is the purpose of the 'transient' keyword in Java?",
        options: [
          "To make a variable accessible across JVM processes",
          "To specify that a field should not be serialized when the object is converted into a byte stream",
          "To mark a method as thread-safe",
          "To enforce compile-time immutability"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Serialization"
      },
      {
        question: "How does ConcurrentHashMap achieve thread safety without locking the entire table?",
        options: [
          "It uses a single global mutex lock on all read and write operations",
          "It uses lock-striping / CAS (Compare-And-Swap) operations on individual bucket nodes",
          "It copies the entire array on every write",
          "It executes operations on a background daemon thread"
        ],
        answerIndex: 1,
        difficulty: "hard",
        topic: "Concurrency"
      },
      {
        question: "In Java, what does the 'volatile' keyword guarantee for a shared variable?",
        options: [
          "Atomic compound operations (such as count++)",
          "Memory visibility of writes across threads and prevents instruction reordering around reads/writes",
          "Automatic disk backup",
          "That the variable cannot be null"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Memory Model"
      },
      {
        question: "What are Java Virtual Threads (Project Loom)?",
        options: [
          "Threads that run exclusively on GPU hardware",
          "Lightweight user-mode threads managed by the JVM that drastically reduce memory and scheduling overhead for I/O-bound tasks",
          "A replacement for the JVM Garbage Collector",
          "Daemon threads that cannot be interrupted"
        ],
        answerIndex: 1,
        difficulty: "hard",
        topic: "Virtual Threads"
      },
      {
        question: "What is the difference between Comparable and Comparator in Java?",
        options: [
          "Comparable is for primitives, Comparator is for Objects",
          "Comparable defines natural ordering via compareTo(); Comparator defines external customized sorting via compare()",
          "Comparable cannot be used with Collections.sort()",
          "They are synonymous interfaces in Java 8+"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Collections"
      },
      {
        question: "What is type erasure in Java generics?",
        options: [
          "Deleting untyped classes at compile time",
          "The process where generic type parameters are removed at compile time and replaced with their bounds (or Object) to maintain backward compatibility",
          "Throwing an error when incompatible types are cast",
          "Converting Java classes to C++ templates"
        ],
        answerIndex: 1,
        difficulty: "hard",
        topic: "Generics"
      },
      {
        question: "What does the try-with-resources statement require of the resource being opened?",
        options: [
          "It must extend java.lang.Thread",
          "It must implement java.lang.AutoCloseable or java.io.Closeable",
          "It must be annotated with @Transactional",
          "It must be declared static final"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Exception Handling"
      },
      {
        question: "What is the difference between checked and unchecked exceptions in Java?",
        options: [
          "Checked exceptions inherit from RuntimeException and do not require handling",
          "Checked exceptions extend Exception (excluding RuntimeException) and must be declared in throws or caught in a try-catch block",
          "Unchecked exceptions crash the JVM immediately",
          "Checked exceptions are checked only at runtime"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Exceptions"
      },
      {
        question: "How does String immutability benefit Java security and performance?",
        options: [
          "It allows strings to be stored in the String Constant Pool and safely shared across threads without synchronization",
          "It prevents strings from using heap memory",
          "It compiles strings into binary integers",
          "It disables garbage collection on strings"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "String Pool"
      },
      {
        question: "What does the default method in a Java interface allow?",
        options: [
          "Declaring instance fields in interfaces",
          "Providing a concrete default implementation of a method in an interface without breaking existing implementing classes",
          "Making all interface methods private",
          "Bypassing package access modifiers"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Interfaces"
      },
      {
        question: "In Java Stream API, why are operations like filter() and map() considered lazy?",
        options: [
          "They only run on background threads",
          "They do not process any elements until a terminal operation (e.g. collect(), forEach()) is invoked",
          "They skip null values automatically",
          "They run slower than traditional for loops"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Streams"
      },
      {
        question: "What happens if two objects return the same hashCode() in Java?",
        options: [
          "They must be equal according to equals()",
          "A hash collision occurs; they are placed in the same bucket and equals() is used to distinguish them",
          "The JVM throws a DuplicateKeyException",
          "The second object overwrites the first in memory"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Hash Table"
      },
      {
        question: "What is the purpose of the Optional<T> class introduced in Java 8?",
        options: [
          "To replace all null pointers in the JVM",
          "To provide a clear container type that explicitly indicates that a return value may be absent, reducing NullPointerExceptions",
          "To mark parameters as optional in method signatures",
          "To allow multiple return types"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Optional"
      },
      {
        question: "Which Garbage Collector in modern Java is designed for ultra-low latency (sub-millisecond pauses)?",
        options: ["Serial GC", "Parallel GC", "ZGC (Z Garbage Collector)", "CMS GC"],
        answerIndex: 2,
        difficulty: "hard",
        topic: "JVM"
      },
      {
        question: "What is a Java Record (introduced in Java 14+)?",
        options: [
          "A database row abstraction in JDBC",
          "A transparent, immutable data carrier class that automatically generates constructor, getters, equals(), hashCode(), and toString()",
          "An audio recording format",
          "A replacement for Java interfaces"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Records"
      }
    ],
    codingPool: [
      {
        id: "java-streams",
        title: "Java Stream Processing",
        language: "java",
        instructions: "Write a public static Java method `filterAndSort(List<Integer> numbers)` that:\n1. Filters out all odd numbers.\n2. Multiplies remaining even numbers by 2.\n3. Eliminates any duplicates.\n4. Returns a List of results sorted in descending order.",
        initialCode: `import java.util.*;
import java.util.stream.*;

public class Solution {
    public static List<Integer> filterAndSort(List<Integer> numbers) {
        // Implement using Java Streams
        return new ArrayList<>();
    }
}
`,
        supportedLanguages: COMMON_SUPPORTED_LANGUAGES
      }
    ]
  },

  // 6. SQL
  sql: {
    mcqPool: [
      {
        question: "What is the key difference between WHERE and HAVING in an SQL query?",
        options: [
          "WHERE is for MySQL, while HAVING is for PostgreSQL",
          "WHERE filters individual rows before aggregation; HAVING filters aggregated groups created by GROUP BY",
          "HAVING cannot contain boolean conditions",
          "There is no difference"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Filtering"
      },
      {
        question: "In relational database ACID properties, what does 'Isolation' guarantee?",
        options: [
          "Data is stored on an isolated physical disk",
          "Concurrent transactions execute without interfering with one another's uncommitted intermediate states",
          "Only one user can connect to the database",
          "Foreign keys cannot be modified"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Transactions"
      },
      {
        question: "Why is a B-Tree index particularly efficient for range queries (e.g. BETWEEN 10 AND 50)?",
        options: [
          "It uses random hashing to find records in O(1)",
          "Its leaf nodes are sorted and linked, allowing fast O(log N) lookup of the start key followed by sequential leaf traversal",
          "It stores all rows uncompressed in memory",
          "It eliminates table scans completely"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Indexing"
      },
      {
        question: "What is the Leftmost Prefix Rule in composite B-Tree indexes (e.g. INDEX(a, b, c))?",
        options: [
          "The index can only search string columns starting from the left letter",
          "The query can only utilize the index if the query conditions include the leading column (a) and consecutive prefix columns without gaps",
          "Index columns must be ordered alphabetically",
          "All queries must sort from left to right"
        ],
        answerIndex: 1,
        difficulty: "hard",
        topic: "Indexing"
      },
      {
        question: "What is the difference between UNION and UNION ALL in SQL?",
        options: [
          "UNION is faster than UNION ALL",
          "UNION removes duplicate rows from the combined result set (performing an implicit sort/dedup); UNION ALL retains all rows including duplicates",
          "UNION works only on integer columns",
          "UNION ALL only merges two tables"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Set Operations"
      },
      {
        question: "In SQL, what is the result of evaluating 'NULL = NULL'?",
        options: ["TRUE", "FALSE", "UNKNOWN / NULL", "TypeError"],
        answerIndex: 2,
        difficulty: "medium",
        topic: "Three-Valued Logic"
      },
      {
        question: "What is a 'Phantom Read' phenomenon in database transaction isolation levels?",
        options: [
          "Reading data that was never written",
          "When a transaction re-executes a query returning a set of rows matching a condition and finds that another committed transaction has inserted or removed rows",
          "Reading cached rows after server reboot",
          "Reading dirty data that was rolled back"
        ],
        answerIndex: 1,
        difficulty: "hard",
        topic: "Isolation Levels"
      },
      {
        question: "Which transaction isolation level prevents Dirty Reads, Non-Repeatable Reads, AND Phantom Reads?",
        options: ["READ UNCOMMITTED", "READ COMMITTED", "REPEATABLE READ", "SERIALIZABLE"],
        answerIndex: 3,
        difficulty: "medium",
        topic: "Isolation Levels"
      },
      {
        question: "What is the difference between the window functions ROW_NUMBER() and RANK() when encountering duplicate values?",
        options: [
          "ROW_NUMBER() skips numbers; RANK() does not",
          "ROW_NUMBER() assigns consecutive sequential integers without ties; RANK() assigns the same rank to ties and skips subsequent numbers",
          "RANK() is only supported in SQLite",
          "ROW_NUMBER() cannot be used with OVER()"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Window Functions"
      },
      {
        question: "What does a LEFT OUTER JOIN return?",
        options: [
          "Only rows that have matches in both tables",
          "All rows from the left table, along with matching rows from the right table (with NULLs for right table columns where no match exists)",
          "All rows from both tables unconditionally",
          "Only rows from the left table that have NO match in the right table"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Joins"
      },
      {
        question: "What is a Common Table Expression (CTE) defined by the 'WITH' clause?",
        options: [
          "A temporary table saved on the user's hard drive",
          "A named temporary result set that exists within the scope of a single SELECT, INSERT, UPDATE, or DELETE statement",
          "A permanent database view stored in system metadata",
          "A stored procedure"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "CTEs"
      },
      {
        question: "What is database normalization (3NF) designed to eliminate?",
        options: [
          "All table indexes",
          "Data redundancy and undesirable update, insertion, and deletion anomalies",
          "Primary keys",
          "Query optimization"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Normalization"
      },
      {
        question: "What does the SQL command EXPLAIN ANALYZE do in PostgreSQL/MySQL?",
        options: [
          "It analyzes database security logs",
          "It executes the query and shows the actual execution plan, cost estimates, and execution time per node",
          "It repairs corrupted table sectors",
          "It formats SQL syntax with indentation"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Query Planning"
      },
      {
        question: "Why should you avoid using SELECT * in production queries?",
        options: [
          "It crashes SQL query parsers",
          "It transfers unnecessary columns over the network, increases memory usage, and prevents covering index optimizations",
          "It is deprecated in SQL:2023 standard",
          "It forces table locks"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Performance"
      },
      {
        question: "What does a correlated subquery mean in SQL?",
        options: [
          "A subquery that executes once independently before the outer query",
          "A subquery that references columns from the outer query, evaluating once for each row processed by the outer query",
          "A subquery connected via WebSocket",
          "A subquery that cannot return rows"
        ],
        answerIndex: 1,
        difficulty: "hard",
        topic: "Subqueries"
      },
      {
        question: "What is a database deadlock and how does the engine resolve it?",
        options: [
          "A hardware disk crash; resolved by rebooting",
          "A situation where two or more transactions each hold locks that the other needs; resolved by detecting the cycle and aborting/rolling back one transaction",
          "When a query takes longer than 10 seconds",
          "When the connection pool is exhausted"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Locks"
      }
    ],
    codingPool: [
      {
        id: "sql-top-spenders",
        title: "Top Spenders Query",
        language: "sql",
        instructions: "Write an SQL query to find the top 3 users who spent the most money in '2024'. Table: `orders (id, user_id, amount, status, created_at)`.\nRequirements: Only consider status = 'COMPLETED'. Order by total spent descending.",
        initialCode: `-- Write your SQL query here
-- Table schema: orders (id, user_id, amount, status, created_at)
-- Requirements:
-- 1. Filter for orders where status = 'COMPLETED'
-- 2. Sum total amount spent per user in year 2024
-- 3. Return user_id, total_spent
-- 4. Order by total_spent descending and return the top 3 spenders

SELECT
    -- Write your query logic here
FROM orders
WHERE status = 'COMPLETED'
`,
        supportedLanguages: SQL_SUPPORTED_LANGUAGES
      }
    ]
  },

  // 7. C++
  "c++": {
    mcqPool: [
      {
        question: "What is the primary difference between std::unique_ptr and std::shared_ptr in modern C++?",
        options: [
          "std::unique_ptr cannot point to heap allocations",
          "std::unique_ptr enforces exclusive single ownership and cannot be copied, only moved; std::shared_ptr uses reference counting for shared ownership",
          "std::shared_ptr is allocated on the stack only",
          "std::unique_ptr requires manual delete calls"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Smart Pointers"
      },
      {
        question: "What does the RAII (Resource Acquisition Is Initialization) idiom guarantee in C++?",
        options: [
          "All pointers are converted to garbage-collected handles",
          "Resource lifetime is bound to object lifetime, guaranteeing automatic cleanup upon destruction even when exceptions are thrown",
          "All memory is initialized to zero at compile time",
          "Threads join automatically"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "RAII"
      },
      {
        question: "What is the consequence of defining a non-virtual destructor in a C++ polymorphic base class?",
        options: [
          "A compile-time syntax error",
          "Undefined behavior and memory leaks when deleting a derived class object through a pointer to the base class",
          "The derived class cannot override methods",
          "The object cannot be allocated on the heap"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "OOP"
      },
      {
        question: "What does std::move(obj) actually do at runtime?",
        options: [
          "It physically copies bytes across memory addresses",
          "It performs an unconditional static_cast to an rvalue reference (T&&), enabling move constructors to steal resources without copying",
          "It deletes the original object immediately",
          "It pauses thread execution"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Move Semantics"
      },
      {
        question: "What is the Rule of Five in modern C++?",
        options: [
          "A class can have at most 5 member variables",
          "If you explicitly declare any of Destructor, Copy Constructor, Copy Assignment, Move Constructor, or Move Assignment, you should declare all five",
          "A function cannot have more than 5 arguments",
          "Code must compile in under 5 seconds"
        ],
        answerIndex: 1,
        difficulty: "hard",
        topic: "Class Design"
      },
      {
        question: "What is the difference between const int* p, int* const p, and const int* const p?",
        options: [
          "They are synonymous declarations in C++20",
          "const int* p is pointer to const data; int* const p is const pointer to mutable data; const int* const p is const pointer to const data",
          "int* const p cannot be dereferenced",
          "const int* p is allocated in read-only RAM"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Pointers"
      },
      {
        question: "What does the 'constexpr' specifier indicate in C++?",
        options: [
          "The variable or function can be evaluated at compile time if provided with constant expressions",
          "The variable is stored on the stack only",
          "The function cannot be inlined",
          "The expression is thread-safe"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Constexpr"
      },
      {
        question: "What is the vtable (virtual method table) in C++?",
        options: [
          "A vector allocated in standard template library",
          "A compiler-generated lookup table of function pointers used to resolve dynamic dispatch for virtual functions at runtime",
          "A database table stored in memory",
          "A stack frame registry"
        ],
        answerIndex: 1,
        difficulty: "hard",
        topic: "Virtual Dispatch"
      },
      {
        question: "What is Undefined Behavior (UB) in C++?",
        options: [
          "A syntax error caught by the compiler",
          "Execution of code for which the C++ language specification imposes no requirements, allowing unpredictable execution, crashes, or security vulnerabilities",
          "A standard exception that can be caught with try/catch",
          "A missing header file"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Language Rules"
      },
      {
        question: "How does std::vector manage memory capacity when resizing beyond its current capacity?",
        options: [
          "It adds 1 element to the end without reallocating",
          "It allocates a new larger contiguous memory block (typically 1.5x or 2x size), moves/copies elements, and frees the old block",
          "It switches to a linked list structure",
          "It raises a StackOverflowException"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Containers"
      },
      {
        question: "What does 'pass by reference' (const T&) achieve over 'pass by value' (T) for large objects?",
        options: [
          "It prevents the function from accessing member variables",
          "It passes a reference avoiding costly copy constructor allocations while preserving immutability",
          "It forces heap allocation",
          "It enables automatic multithreading"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "References"
      },
      {
        question: "What is Copy Elision / Return Value Optimization (RVO) in C++?",
        options: [
          "A technique where the compiler omits copy and move constructors when returning by value, constructing the object directly in the destination storage",
          "Deleting duplicate code lines during preprocessing",
          "Throwing an exception on copy",
          "Converting pointers to references"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Optimization"
      },
      {
        question: "What is the purpose of std::weak_ptr in C++?",
        options: [
          "A pointer that runs with lower CPU priority",
          "A non-owning smart pointer that observes a std::shared_ptr without increasing its reference count, breaking cyclic dependencies",
          "A deprecated pointer in C++17",
          "A pointer allocated in thread-local storage"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Smart Pointers"
      },
      {
        question: "What does the 'noexcept' specifier guarantee on a C++ function?",
        options: [
          "The function will return 0 on failure",
          "The function promises not to throw exceptions; if an exception escapes, std::terminate is called immediately",
          "The compiler disables runtime checking",
          "The function can only be called from main()"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Exceptions"
      },
      {
        question: "What is SFINAE (Substitution Failure Is Not An Error) in C++ templates?",
        options: [
          "A compile-time feature where a failed template substitution simply discards the candidate overload rather than triggering a hard compiler error",
          "A runtime memory failure handler",
          "A macro for debugging template classes",
          "A rule that disallows template specialization"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Templates"
      },
      {
        question: "In C++20, what do 'Concepts' provide over traditional template metaprogramming?",
        options: [
          "Runtime reflection on class properties",
          "Named compile-time constraints on template arguments, producing clear compiler errors and clean function overloading",
          "Garbage collection for pointers",
          "Dynamic typing"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Modern C++"
      }
    ],
    codingPool: [
      {
        id: "cpp-vector-dedup",
        title: "In-Place Vector Deduplication",
        language: "cpp",
        instructions: "Write a C++ function `int removeDuplicates(std::vector<int>& nums)` that removes duplicates in-place from a sorted vector and returns the number of unique elements.",
        initialCode: `#include <vector>

int removeDuplicates(std::vector<int>& nums) {
    // Modify nums in-place and return unique count
    return 0;
}
`,
        supportedLanguages: COMMON_SUPPORTED_LANGUAGES
      }
    ]
  },

  // 8. GO (GOLANG)
  go: {
    mcqPool: [
      {
        question: "How does the Go runtime schedule Goroutines?",
        options: [
          "1:1 kernel thread mapping for each goroutine",
          "An M:N multiplexer (Go Scheduler) that maps M goroutines onto N OS threads across P logical processors",
          "Cooperative round-robin in user libc",
          "Goroutines run on GPU compute shaders"
        ],
        answerIndex: 1,
        difficulty: "hard",
        topic: "Concurrency"
      },
      {
        question: "What happens when you receive from a closed Go channel?",
        options: [
          "It panics with 'panic: receive on closed channel'",
          "It immediately yields the zero-value of the channel type with ok == false without blocking",
          "It blocks the goroutine indefinitely",
          "It returns nil"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Channels"
      },
      {
        question: "What happens when you SEND to a closed Go channel?",
        options: [
          "It yields ok == false",
          "It panics with 'panic: send on closed channel'",
          "It discards the message silently",
          "It buffers the value until reopened"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Channels"
      },
      {
        question: "In Go, how do you prevent goroutine leaks when performing cancellable operations?",
        options: [
          "By calling runtime.GC() after every call",
          "By propagating a context.Context and listening on ctx.Done() to terminate early",
          "By setting infinite buffer sizes on channels",
          "Goroutines cannot leak in Go"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Context"
      },
      {
        question: "What is the memory layout of a Go slice header?",
        options: [
          "A pointer to a linked list node",
          "A 3-word struct containing: a pointer to the backing array, length (int), and capacity (int)",
          "An array of interface{} pointers",
          "A hashtable bucket"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Slices"
      },
      {
        question: "What does the 'defer' keyword do in Go?",
        options: [
          "Executes a function in a background goroutine",
          "Pushes a function call onto a stack to be executed in LIFO order immediately before the surrounding function returns",
          "Cancels the function execution if it takes too long",
          "Delays execution by 1000 milliseconds"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Control Flow"
      },
      {
        question: "Why can an interface variable in Go be non-nil even if the underlying pointer value is nil?",
        options: [
          "It is a bug in the Go compiler",
          "An interface value is a tuple of (type, value); if the concrete type is present, the interface is non-nil even if the concrete pointer value is nil",
          "Interfaces cannot hold nil pointers",
          "Pointers are automatically initialized to non-nil"
        ],
        answerIndex: 1,
        difficulty: "hard",
        topic: "Interfaces"
      },
      {
        question: "How do you detect data races in a Go application?",
        options: [
          "By checking error logs manually",
          "By compiling or running with the -race flag (Go Race Detector)",
          "By using GODEBUG=schedtrace=1000",
          "Data races are impossible in Go"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Race Detector"
      },
      {
        question: "What is the purpose of sync.WaitGroup in Go?",
        options: [
          "To lock a critical section with mutual exclusion",
          "To wait for a collection of goroutines to finish executing by calling Add(), Done(), and Wait()",
          "To measure execution latency",
          "To pool reusable byte buffers"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Sync"
      },
      {
        question: "What is the difference between sync.Mutex and sync.RWMutex in Go?",
        options: [
          "sync.Mutex allows multiple writers",
          "sync.RWMutex allows concurrent readers while granting exclusive access to writers",
          "sync.RWMutex cannot be unlocked",
          "sync.Mutex is lock-free"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Sync"
      },
      {
        question: "What does the 'select' statement do when multiple channel cases are ready simultaneously?",
        options: [
          "It executes the first case in source code order",
          "It selects one case pseudo-randomly with uniform distribution",
          "It executes all ready cases concurrently",
          "It panics"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Channels"
      },
      {
        question: "What does the 'recover()' function do in Go?",
        options: [
          "Re-establishes a broken network connection",
          "Regains control of a panicking goroutine inside a deferred function, capturing the panic value and resuming normal execution",
          "Rolls back database transactions",
          "Resets CPU registers"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Panic & Recover"
      },
      {
        question: "In Go, what does capitalizing the first letter of an identifier (e.g. ExportedFunc) indicate?",
        options: [
          "It is a constant",
          "It is exported (public) outside the package",
          "It is an interface type",
          "It executes with administrator privileges"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Packages"
      },
      {
        question: "What is sync.Pool used for in high-performance Go applications?",
        options: [
          "To pool worker goroutines",
          "To cache and reuse allocated temporary objects, reducing GC pressure and memory allocations across threads",
          "To manage database connection sockets",
          "To synchronize clocks"
        ],
        answerIndex: 1,
        difficulty: "hard",
        topic: "Performance"
      },
      {
        question: "What is the difference between a value receiver and a pointer receiver on a Go method?",
        options: [
          "Value receivers can mutate the caller struct; pointer receivers cannot",
          "Pointer receivers operate on the original struct allowing mutations and avoid copying large structs on every method call",
          "Value receivers cannot be called on interfaces",
          "Pointer receivers cannot return values"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Methods"
      },
      {
        question: "How do Go modules handle versioning and dependency resolution?",
        options: [
          "Using arbitrary semantic ranges like ^1.0.0",
          "Using Minimal Version Selection (MVS) algorithm ensuring predictable and reproducible builds",
          "By pulling the latest master commit on every build",
          "Using global GOPATH exclusively"
        ],
        answerIndex: 1,
        difficulty: "hard",
        topic: "Go Modules"
      }
    ],
    codingPool: [
      {
        id: "go-worker-pool",
        title: "Concurrent Worker Pool",
        language: "go",
        instructions: "Write a Go function `ProcessJobs(jobs []int, numWorkers int) []int` that processes integers concurrently across `numWorkers` goroutines, squares each number, and returns the results safely using channels and `sync.WaitGroup`.",
        initialCode: `package main

import (
    "sync"
)

func ProcessJobs(jobs []int, numWorkers int) []int {
    // Implement concurrent worker pool
    return nil
}
`,
        supportedLanguages: COMMON_SUPPORTED_LANGUAGES
      }
    ]
  },

  // 9. NEXT.JS
  "next.js": {
    mcqPool: [
      {
        question: "In Next.js App Router, what is the default rendering paradigm for components in the app/ directory?",
        options: [
          "Client Components",
          "React Server Components (RSC)",
          "Static HTML without JavaScript",
          "Edge Middleware exclusively"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Server Components"
      },
      {
        question: "Which directive must be added at the very top of a file to make a component a React Client Component in Next.js?",
        options: ["'use server'", "'use client'", "'use browser'", "'export client'"],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Directives"
      },
      {
        question: "What is the primary benefit of React Server Components in Next.js?",
        options: [
          "They have direct access to DOM event listeners like onClick",
          "They execute exclusively on the server, sending zero JavaScript to the client bundle and accessing backend databases directly",
          "They enable React state hooks like useState without client hydration",
          "They compile to WebAssembly"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "RSC"
      },
      {
        question: "How does Incremental Static Regeneration (ISR) work in Next.js?",
        options: [
          "It rebuilds the entire website from scratch on every user visit",
          "It serves cached static HTML immediately while revalidating and updating the page in the background after a configured revalidate time window",
          "It streams components over WebSockets",
          "It disables client-side caching"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "ISR"
      },
      {
        question: "What is the purpose of the 'loading.tsx' file in Next.js App Router?",
        options: [
          "To show a browser progress bar in the URL bar",
          "It automatically wraps page.tsx in a React <Suspense> boundary, displaying an immediate instant loading skeleton while data fetches",
          "To preload static image assets",
          "To measure Time-to-First-Byte (TTFB)"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Routing"
      },
      {
        question: "What is the execution runtime of Next.js Middleware (middleware.ts)?",
        options: [
          "Full Node.js runtime with all native C++ bindings",
          "Edge Runtime (a lightweight V8-based environment with standard Web APIs for fast global execution before routing)",
          "Client browser thread",
          "Redis worker"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Middleware"
      },
      {
        question: "How does Next.js Server Actions ('use server') handle form mutations?",
        options: [
          "By sending WebSockets to a dedicated microservice",
          "As asynchronous functions executed on the server that can be invoked via form action attributes or client handlers with automatic revalidation",
          "By storing records in client localStorage",
          "By compiling forms to PHP"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Server Actions"
      },
      {
        question: "What does calling revalidatePath('/dashboard') inside a Server Action do?",
        options: [
          "It reloads the user's browser window",
          "It purges the Next.js Data Cache and Router Cache for that route, re-rendering fresh data without a full page reload",
          "It deletes database records",
          "It clears session cookies"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Caching"
      },
      {
        question: "What is the difference between generateStaticParams and legacy getStaticPaths in Next.js?",
        options: [
          "generateStaticParams is used in App Router to define route parameters for static pre-rendering at build time",
          "getStaticPaths is used only in React Native",
          "generateStaticParams runs on the client browser",
          "There is no difference"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Static Generation"
      },
      {
        question: "Why should you pass sensitive database credentials only to Server Components or Server Actions?",
        options: [
          "Client Components encrypt credentials automatically",
          "Server Components and Server Actions never expose their execution code or imported environment variables to the browser bundle",
          "Client Components can only read JSON",
          "Next.js prohibits importing libraries in Client Components"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Security"
      },
      {
        question: "What is Next.js Partial Prerendering (PPR)?",
        options: [
          "Rendering half the webpage on desktop and half on mobile",
          "Combining a static shell with dynamically streamed server components inside Suspense boundaries in a single HTTP response",
          "Caching images on edge CDN exclusively",
          "Prerendering only the footer"
        ],
        answerIndex: 1,
        difficulty: "hard",
        topic: "PPR"
      },
      {
        question: "What does the 'next/image' component provide over standard <img> HTML tags?",
        options: [
          "It converts all images into SVG vector format",
          "Automatic image optimization (WebP/AVIF), responsive sizing, lazy loading, and prevention of Cumulative Layout Shift (CLS)",
          "It applies Instagram filters",
          "It disables image right-clicking"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Optimization"
      },
      {
        question: "How do you handle unhandled errors in Next.js App Router routes?",
        options: [
          "By creating an error.tsx Client Component boundary that wraps the route and receives the error and reset callback",
          "By modifying the package.json scripts",
          "By adding try/catch around import statements",
          "Next.js catches all errors automatically without custom UI"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Error Handling"
      },
      {
        question: "What does the 'notFound()' function do when invoked inside a Server Component?",
        options: [
          "Throws a generic JavaScript runtime error",
          "Renders the closest not-found.tsx UI boundary and returns an HTTP 404 status code",
          "Redirects to Google search",
          "Logs a warning and renders a blank screen"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Routing"
      },
      {
        question: "How does the Next.js fetch() API cache data by default in modern App Router?",
        options: [
          "It never caches any requests",
          "It integrates with the Next.js Data Cache allowing granular control via { cache: 'no-store' } or { next: { revalidate: 3600 } }",
          "It caches all requests permanently on the client hard drive",
          "It only caches GET requests in development"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Data Cache"
      },
      {
        question: "What is the purpose of route.ts files in Next.js App Router?",
        options: [
          "To configure router animation keyframes",
          "To define custom HTTP Route Handlers (GET, POST, PUT, DELETE, PATCH) similar to API routes in Pages router",
          "To set DNS nameservers",
          "To redirect HTTP to HTTPS"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "API Route Handlers"
      }
    ],
    codingPool: [
      {
        id: "nextjs-api-handler",
        title: "Next.js Route Handler",
        language: "typescript",
        instructions: "Implement a Next.js Route Handler `POST(req: Request)` that parses a JSON body containing `{ email: string, role: string }`.\n\nRequirements:\n1. Validate that `email` is non-empty and contains '@'.\n2. Validate that `role` is either 'candidate' or 'employer'.\n3. Return JSON with status 200 on success or 400 with an error message.",
        initialCode: `import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    // Implement validation and response
    return NextResponse.json({ success: true });
}
`,
        supportedLanguages: COMMON_SUPPORTED_LANGUAGES
      }
    ]
  },

  // 10. DOCKER / DEVOPS
  docker: {
    mcqPool: [
      {
        question: "Why should you use multi-stage builds in Dockerfiles for production microservices?",
        options: [
          "To allow Docker to run on multiple OS architectures simultaneously",
          "To separate heavy build-time tooling and dependencies from the minimal runtime container, drastically reducing image size and attack surface",
          "To bypass Docker Hub rate limits",
          "To automatically generate Kubernetes manifests"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Optimization"
      },
      {
        question: "What is the difference between COPY and ADD in a Dockerfile?",
        options: [
          "ADD is deprecated in Docker 20+",
          "COPY only copies local files from build context; ADD can also extract local tar archives and fetch remote URLs",
          "COPY creates layers while ADD does not",
          "They are exact synonyms"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Directives"
      },
      {
        question: "What Linux kernel primitives provide container isolation in Docker?",
        options: [
          "QEMU hypervisor exclusively",
          "Namespaces (for resource isolation like PID, NET, MNT) and cgroups (for CPU, memory, and I/O resource limitation)",
          "systemd services and swap partitions",
          "iptables firewalls exclusively"
        ],
        answerIndex: 1,
        difficulty: "hard",
        topic: "Kernel"
      },
      {
        question: "Why should you avoid running container applications as the root user?",
        options: [
          "Root containers run slower due to permission checks",
          "If a container breakout vulnerability occurs, the attacker gains full root privileges on the underlying host operating system",
          "Docker daemon does not support root execution",
          "Port numbers under 1024 cannot be bound by root"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Security"
      },
      {
        question: "How does Docker layer caching optimize image build speed?",
        options: [
          "By downloading prebuilt images from Google",
          "Each Dockerfile instruction creates a read-only image layer; if an instruction and its inputs haven't changed, Docker reuses the cached layer",
          "By compressing files with tar before building",
          "By skipping RUN instructions in CI/CD"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Caching"
      },
      {
        question: "What happens if an application inside a container runs as PID 1 without proper signal forwarding?",
        options: [
          "The container uses 100% CPU",
          "It may ignore SIGTERM signals sent by 'docker stop', leading to dirty shutdowns after the 10-second SIGKILL timeout",
          "The container cannot open network ports",
          "Garbage collection is disabled"
        ],
        answerIndex: 1,
        difficulty: "hard",
        topic: "PID 1"
      },
      {
        question: "What is the difference between CMD and ENTRYPOINT in a Dockerfile?",
        options: [
          "CMD sets the fixed executable; ENTRYPOINT provides default arguments",
          "ENTRYPOINT sets the default command executable; CMD provides default arguments that can be easily overridden from the command line",
          "CMD runs at build time; ENTRYPOINT runs at deploy time",
          "There is no difference"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Directives"
      },
      {
        question: "What does the .dockerignore file accomplish?",
        options: [
          "It ignores docker commands in shell scripts",
          "It prevents sensitive files (.env, .git, node_modules) from being sent into the build context, reducing build payload and preventing secret leaks",
          "It disables Docker daemon logging",
          "It skips security scans"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Build Context"
      },
      {
        question: "What is the primary difference between a Docker bind mount and a named volume?",
        options: [
          "Bind mounts rely on specific host filesystem paths; named volumes are completely managed by Docker in a dedicated directory with better performance and isolation",
          "Named volumes can only store read-only files",
          "Bind mounts are faster on macOS and Windows",
          "Named volumes are deleted whenever a container stops"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Storage"
      },
      {
        question: "How does the default Docker bridge network manage container DNS resolution?",
        options: [
          "The default bridge does NOT support automatic container name DNS resolution; user-defined bridge networks DO support automatic DNS resolution by container name",
          "The default bridge uses public Cloudflare 1.1.1.1 DNS",
          "All containers share the host's localhost directly",
          "DNS resolution is only available in Docker Swarm"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "Networking"
      },
      {
        question: "What does the 'HEALTHCHECK' instruction in a Dockerfile do?",
        options: [
          "Runs virus scanning on the container filesystem",
          "Instructs Docker how to test if the container application is still functioning correctly (e.g. curling an endpoint), setting health status to healthy/unhealthy",
          "Restarts the physical host server if CPU is high",
          "Monitors memory leaks in RAM"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Healthcheck"
      },
      {
        question: "In Kubernetes, what is the relationship between a Pod and a Container?",
        options: [
          "A Pod is an operating system kernel",
          "A Pod is the smallest deployable compute unit in Kubernetes and can encapsulate one or more tightly coupled containers sharing network and storage namespaces",
          "A Container contains multiple Pods",
          "They are synonymous terms"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Kubernetes"
      },
      {
        question: "What is the difference between a Liveness Probe and a Readiness Probe in Kubernetes?",
        options: [
          "Liveness determines if the container should receive network traffic; Readiness determines if it should be restarted",
          "Liveness probe determines if the container needs to be restarted; Readiness probe determines if the container is ready to accept user network traffic",
          "They are checked at the exact same interval with identical outcomes",
          "Liveness probe runs only during deployment"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Kubernetes"
      },
      {
        question: "What is an OverlayFS in Docker storage architecture?",
        options: [
          "A cloud backup service",
          "A union mount filesystem that combines multiple directory layers (lower read-only image layers and an upper writable container layer) into a unified view",
          "An encrypted network tunnel",
          "A swap file system"
        ],
        answerIndex: 1,
        difficulty: "hard",
        topic: "Storage Driver"
      },
      {
        question: "What does docker system prune -a --volumes do?",
        options: [
          "Reboots the Docker daemon",
          "Removes all unused containers, networks, images (not just dangling ones), and unused volumes from host disk",
          "Deletes the host operating system",
          "Updates Docker to the latest version"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Maintenance"
      },
      {
        question: "How should secrets (e.g. database passwords, private keys) be passed into Docker builds securely?",
        options: [
          "Hardcoded into ENV instructions in the Dockerfile",
          "Using BuildKit secret mounts (--mount=type=secret) so secrets are not baked into any permanent image layer",
          "Passed as ARG variables in public GitHub Actions",
          "Committed in a public config.json file"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Security"
      }
    ],
    codingPool: [
      {
        id: "docker-multistage",
        title: "Production Node.js Dockerfile",
        language: "dockerfile",
        instructions: "Write a multi-stage `Dockerfile` for a Node.js app:\nStage 1 ('builder'): installs dependencies and runs build.\nStage 2 ('runner'): uses `node:20-alpine`, copies compiled assets, runs as non-root user `node`, exposes port 3000.",
        initialCode: `# Multi-stage Dockerfile
FROM node:20-alpine AS builder
# Implement builder stage

FROM node:20-alpine AS runner
# Implement runner stage
`,
        supportedLanguages: COMMON_SUPPORTED_LANGUAGES
      }
    ]
  },

  // 11. MACHINE LEARNING / AI
  "machine learning": {
    mcqPool: [
      {
        question: "How does L2 regularization (Ridge) prevent overfitting in machine learning models?",
        options: [
          "It forces weights strictly to zero, producing sparse models",
          "It adds a penalty proportional to the sum of squared weights to the loss function, discouraging excessively large weights",
          "It increases learning rate exponentially",
          "It removes outlier rows from training sets"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Regularization"
      },
      {
        question: "What is the primary difference between L1 (Lasso) and L2 (Ridge) regularization?",
        options: [
          "L1 regularization drives coefficients exactly to zero, performing automated feature selection; L2 shrinks coefficients toward zero without setting them to zero",
          "L1 cannot be used with linear models",
          "L2 produces sparse models while L1 does not",
          "There is no mathematical difference"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Regularization"
      },
      {
        question: "In classification problems with severe class imbalance (e.g. 99% negative, 1% positive), why is Accuracy a misleading metric?",
        options: [
          "Accuracy cannot be calculated as a percentage",
          "A naive model predicting the majority negative class for every sample achieves 99% accuracy while having zero utility (0% recall for positives)",
          "Accuracy is only for regression tasks",
          "It requires quadratic compute time"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Evaluation Metrics"
      },
      {
        question: "What does Precision measure versus Recall in binary classification?",
        options: [
          "Precision is TP / (TP + FN); Recall is TP / (TP + FP)",
          "Precision is TP / (TP + FP) (of all predicted positives, how many are true); Recall is TP / (TP + FN) (of all actual positives, how many were detected)",
          "Precision measures training speed; Recall measures inference speed",
          "They are identical metrics"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Evaluation Metrics"
      },
      {
        question: "What is the Self-Attention mechanism's computational complexity with respect to sequence length N in standard Transformers?",
        options: ["O(N)", "O(N log N)", "O(N^2)", "O(1)"],
        answerIndex: 2,
        difficulty: "hard",
        topic: "Transformers"
      },
      {
        question: "Why are activation functions (like ReLU or GELU) essential in deep neural networks?",
        options: [
          "To keep weights within integer bounds",
          "To introduce non-linearity, enabling the network to approximate complex non-linear functions (without which stacked linear layers collapse into a single linear transformation)",
          "To prevent floating point overflow in GPU shaders",
          "To normalize inputs to unit variance"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Deep Learning"
      },
      {
        question: "What is the vanishing gradient problem in deep networks, and what commonly alleviates it?",
        options: [
          "Loss values becoming negative; alleviated by square root functions",
          "Gradients shrinking exponentially as they backpropagate through deep layers (common with Sigmoid/Tanh); alleviated by ReLU activations, residual connections (ResNet), and Batch/Layer Normalization",
          "GPU running out of memory; alleviated by deleting layers",
          "Data being shuffled too quickly"
        ],
        answerIndex: 1,
        difficulty: "hard",
        topic: "Optimization"
      },
      {
        question: "What does the Bias-Variance tradeoff describe in supervised learning?",
        options: [
          "High bias causes overfitting; high variance causes underfitting",
          "High bias causes underfitting (model too simple); high variance causes overfitting (model too sensitive to training noise)",
          "Tradeoff between CPU and RAM usage",
          "Tradeoff between precision and recall"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Theory"
      },
      {
        question: "What is Gradient Clipping used for when training Recurrent Neural Networks (RNNs) and LLMs?",
        options: [
          "Deleting unused weights to compress models",
          "Limiting the maximum norm of the gradient vector to prevent exploding gradients from destabilizing weight updates",
          "Clipping training datasets to 1000 rows",
          "Rounding weights to nearest integer"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Training"
      },
      {
        question: "How does Dropout prevent co-adaptation of neurons during neural network training?",
        options: [
          "By dropping learning rate to zero periodically",
          "By randomly deactivating a fraction of neurons on each forward pass, forcing network units to learn robust, generalized representations independently",
          "By deleting outlier samples",
          "By stopping training when loss plateaus"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Regularization"
      },
      {
        question: "In LLM generation, what does the Temperature parameter control?",
        options: [
          "The temperature of the GPU hardware",
          "The sharpness of the probability distribution over tokens: lower temperature produces deterministic/focused output; higher temperature flattens distribution for diverse/creative output",
          "The maximum context window length in tokens",
          "The learning rate during fine-tuning"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "LLMs"
      },
      {
        question: "What is Retrieval-Augmented Generation (RAG)?",
        options: [
          "Training an LLM from scratch on private documents",
          "A pattern where external relevant documents are retrieved from a vector database or search index and injected into the LLM prompt context to ground generation in factual data",
          "Compressing model parameters using quantization",
          "Replacing attention layers with RNNs"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "RAG & LLMs"
      },
      {
        question: "What is the purpose of Positional Encodings in Transformer architectures?",
        options: [
          "To number the layers in the neural network",
          "To provide information about the order of tokens in the sequence since standard attention operations are permutation-invariant",
          "To calculate gradient descent steps",
          "To compress token embeddings"
        ],
        answerIndex: 1,
        difficulty: "hard",
        topic: "Transformers"
      },
      {
        question: "What does cosine similarity measure between two high-dimensional text embedding vectors?",
        options: [
          "The Euclidean physical distance between endpoints",
          "The cosine of the angle between two vectors, measuring directional alignment regardless of vector magnitude",
          "The dot product divided by standard deviation",
          "The number of identical words"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Embeddings"
      },
      {
        question: "In Random Forests, how are individual decision trees made diverse?",
        options: [
          "By using different programming languages for each tree",
          "Through Bootstrap Aggregating (Bagging) on training samples and random feature subset selection at each split node",
          "By pruning all trees to depth 1",
          "By training on different hardware"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Ensemble Methods"
      },
      {
        question: "What is the primary advantage of the Adam optimizer over standard Stochastic Gradient Descent (SGD)?",
        options: [
          "Adam never requires tuning learning rate",
          "Adam computes individual adaptive learning rates for different parameters using estimates of first and second moments of the gradients",
          "Adam runs with zero memory overhead",
          "Adam guarantees finding the global minimum in non-convex loss surfaces"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Optimizers"
      }
    ],
    codingPool: [
      {
        id: "ml-normalizer",
        title: "Min-Max Feature Normalizer",
        language: "python",
        instructions: "Write a function `min_max_scale(data)` that takes a list of numerical floats and scales them to the range [0.0, 1.0].\n\nFormula: (x - min) / (max - min).\nRequirements:\n1. If all values are identical or the list is empty, return an empty list or zeros.\n2. Round scaled results to 4 decimal places.",
        initialCode: `def min_max_scale(data):
    # Implement Min-Max scaling
    return []
`,
        supportedLanguages: COMMON_SUPPORTED_LANGUAGES
      }
    ]
  },

  // 12. RUST
  rust: {
    mcqPool: [
      {
        question: "What is the primary principle of Rust's ownership model?",
        options: [
          "Variables can have multiple simultaneous owners across threads",
          "Each value in Rust has an owner; there can only be one owner at a time; and when the owner goes out of scope, the value is dropped",
          "All memory is managed by a reference-counting garbage collector",
          "Values are kept in memory until the program terminates"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Ownership"
      },
      {
        question: "What are the borrowing rules in Rust regarding mutable and immutable references?",
        options: [
          "You can have unlimited mutable and immutable references simultaneously",
          "At any given time, you can have either one mutable reference OR any number of immutable references, but never both",
          "Immutable references can be mutated inside unsafe blocks only",
          "References cannot outlive the main function"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Borrow Checker"
      },
      {
        question: "What does the 'Copy' trait signify for a Rust type compared to 'Clone'?",
        options: [
          "Copy performs deep heap duplication; Clone is shallow",
          "Copy signifies types whose values can be duplicated simply by copying bits in memory without heap allocation (implicit and inexpensive); Clone is explicit",
          "Copy is deprecated in Rust 2021",
          "Copy is only for String types"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Traits"
      },
      {
        question: "What does the 'Option<T>' enum represent in Rust, and why does Rust have no 'null'?",
        options: [
          "Option is an optional compiler flag",
          "Option represents an optional value with variants Some(T) and None, forcing developers to handle absence explicitly at compile time and eliminating NullPointerExceptions",
          "Null was omitted to save 4 bytes per variable",
          "Option is only used for command line arguments"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Enums"
      },
      {
        question: "What is the difference between Rc<T> and Arc<T> in Rust?",
        options: [
          "Rc is thread-safe; Arc is single-threaded",
          "Rc is a single-threaded reference-counting pointer; Arc (Atomic Reference Counting) is thread-safe and can be shared across threads",
          "Arc can only point to primitive integers",
          "Rc cannot be cloned"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Smart Pointers"
      },
      {
        question: "What does RefCell<T> provide in Rust?",
        options: [
          "Thread-safe atomic updates",
          "Interior mutability by enforcing borrowing rules at runtime instead of compile time, panicking if borrowing rules are violated",
          "Garbage collection",
          "Read-only storage in flash memory"
        ],
        answerIndex: 1,
        difficulty: "hard",
        topic: "Interior Mutability"
      },
      {
        question: "What is the purpose of explicit lifetime annotations (e.g. 'a) in Rust function signatures?",
        options: [
          "To tell the CPU how many clock cycles to allocate",
          "To inform the compiler's borrow checker about how the lifetimes of input references relate to the lifetime of the returned reference",
          "To prolong the life of variables in RAM",
          "To declare static constants"
        ],
        answerIndex: 1,
        difficulty: "hard",
        topic: "Lifetimes"
      },
      {
        question: "What does the '?' operator do in Rust when applied to a Result<T, E>?",
        options: [
          "Prompts the user for confirmation in the terminal",
          "Unwraps Ok(T) if successful; if Err(E), returns Err(From::from(e)) from the enclosing function immediately",
          "Converts Result into an Option",
          "Catches panics"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Error Handling"
      },
      {
        question: "What does an 'unsafe' block allow a developer to do in Rust?",
        options: [
          "Disables all compiler type checking",
          "Allows dereferencing raw pointers, calling unsafe functions, implementing unsafe traits, mutating mutable statics, and accessing union fields",
          "Allows memory leaks without warnings",
          "Converts Rust to C++ automatically"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Unsafe"
      },
      {
        question: "How does Rust achieve zero-cost abstractions with traits?",
        options: [
          "By running all traits in virtual machines",
          "By using monomorphization at compile time, generating specialized, inlined code for each concrete type without runtime dynamic dispatch overhead",
          "By converting traits to dynamic interfaces",
          "By omitting destructors"
        ],
        answerIndex: 1,
        difficulty: "hard",
        topic: "Generics"
      },
      {
        question: "What is the difference between String and &str in Rust?",
        options: [
          "String is an immutable string slice; &str is a heap-allocated growable buffer",
          "String is a growable, heap-allocated, owned buffer; &str is an immutable string slice borrowing a sequence of UTF-8 bytes",
          "&str is only for ASCII characters",
          "They are identical aliases"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Strings"
      },
      {
        question: "What is the purpose of the 'Send' and 'Sync' marker traits in Rust?",
        options: [
          "To send network packets over HTTP",
          "Send indicates ownership of a type can be transferred across thread boundaries; Sync indicates it is safe to share references to the type between threads",
          "They indicate the type can be serialized to JSON",
          "They are used for async/await file I/O"
        ],
        answerIndex: 1,
        difficulty: "hard",
        topic: "Concurrency"
      },
      {
        question: "What does the pattern matching expression 'match' guarantee in Rust?",
        options: [
          "Matching is always asynchronous",
          "Pattern matching is exhaustive; the compiler forces developers to handle every possible variant of an enum or use a catch-all (_)",
          "Matches must evaluate in O(1) time",
          "Only integer values can be matched"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Pattern Matching"
      },
      {
        question: "What happens when a Rust thread panics?",
        options: [
          "The entire operating system crashes",
          "The panicking thread unwinds its stack running destructors for all owned objects, while other threads continue running (unless panic=abort is set)",
          "It automatically restarts the thread",
          "The panic is ignored silently"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Panics"
      },
      {
        question: "What does the 'Deref' trait enable in Rust smart pointers?",
        options: [
          "Deleting pointers from memory",
          "Customizing the behavior of the dereference operator (*), enabling deref coercion (e.g. automatically coercing &String to &str)",
          "Allowing null pointers",
          "Converting values to integers"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Deref Coercion"
      },
      {
        question: "In Rust, what does cargo clippy provide?",
        options: [
          "A desktop animated assistant",
          "An advanced static analysis linter that checks for unidiomatic code patterns, common mistakes, and performance optimizations",
          "A dependency vulnerability scanner only",
          "A benchmark runner"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Tooling"
      }
    ],
    codingPool: [
      {
        id: "rust-reverse-words",
        title: "Reverse String Words",
        language: "rust",
        instructions: "Write a function `reverse_words(s: &str) -> String` that reverses the words in a given string sentence separated by spaces.",
        initialCode: `pub fn reverse_words(s: &str) -> String {
    // Implement word reversal
    String::new()
}
`,
        supportedLanguages: COMMON_SUPPORTED_LANGUAGES
      }
    ]
  },

  // 13. AWS / CLOUD
  aws: {
    mcqPool: [
      {
        question: "What is the security principle of 'Least Privilege' in AWS IAM?",
        options: [
          "Granting all users AdministratorAccess for development velocity",
          "Granting identities and services only the minimal set of permissions necessary to perform their required tasks, and nothing more",
          "Disabling multi-factor authentication",
          "Using root credentials in production"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "IAM"
      },
      {
        question: "What consistency model does Amazon S3 provide for all GET, PUT, and LIST operations?",
        options: [
          "Eventual consistency only",
          "Strong read-after-write consistency for PUT and DELETE requests of objects across all regions",
          "Periodic 15-minute batch consistency",
          "Weak consistency for buckets with encryption"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "S3"
      },
      {
        question: "How should AWS Lambda cold starts be minimized for latency-sensitive microservices?",
        options: [
          "By increasing timeout to 15 minutes",
          "Using Provisioned Concurrency, reducing deployment package size, and keeping initialization logic outside the handler",
          "By allocating 128MB RAM",
          "By disabling CloudWatch logging"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Lambda"
      },
      {
        question: "What is the difference between an AWS Security Group and a Network ACL (NACL)?",
        options: [
          "Security Groups are stateless at subnet level; NACLs are stateful at instance level",
          "Security Groups operate at the instance (ENI) level and are stateful; NACLs operate at the subnet level and are stateless (requiring explicit inbound and outbound rules)",
          "Security Groups can only block IP addresses",
          "NACLs apply to IAM users"
        ],
        answerIndex: 1,
        difficulty: "hard",
        topic: "VPC"
      },
      {
        question: "In Amazon DynamoDB, why is selecting a high-cardinality Partition Key crucial?",
        options: [
          "To allow DynamoDB to store numbers as strings",
          "To distribute data and request traffic uniformly across internal storage partitions, avoiding 'hot partitions' that throttle throughput",
          "To sort data alphabetically automatically",
          "To reduce billing to zero"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "DynamoDB"
      },
      {
        question: "What does Amazon CloudFront provide in a cloud architecture?",
        options: [
          "A relational database service",
          "A global Content Delivery Network (CDN) that caches content at edge locations worldwide to minimize latency for end users",
          "A container registry",
          "A virtual private cloud generator"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "CloudFront"
      },
      {
        question: "What is the primary difference between Amazon SQS and Amazon SNS?",
        options: [
          "SQS is a pub/sub fan-out notification service; SNS is a message queue",
          "SQS is a point-to-point message queuing service for decoupling components; SNS is a publish/subscribe (pub/sub) broadcast notification service",
          "SQS cannot store messages",
          "SNS requires polling by consumers"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Messaging"
      },
      {
        question: "What is an SQS Dead-Letter Queue (DLQ) used for?",
        options: [
          "To delete unread messages immediately",
          "To isolate and store messages that cannot be processed successfully after a configured maximum receive count for debugging without blocking the main queue",
          "To broadcast messages to millions of subscribers",
          "To encrypt messages at rest"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "SQS"
      },
      {
        question: "How does Amazon RDS Multi-AZ deployment improve database resilience?",
        options: [
          "By increasing query speed by 200%",
          "By synchronously replicating database transactions to a standby replica in a different Availability Zone, providing automatic failover during outages",
          "By converting MySQL into PostgreSQL automatically",
          "By storing backups on user desktop"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "RDS"
      },
      {
        question: "What is the difference between AWS RDS Read Replicas and Multi-AZ standby instances?",
        options: [
          "Read Replicas handle read traffic asynchronously to scale read workloads; Multi-AZ standby instances are synchronous failover targets that do not serve live read queries",
          "Multi-AZ handles read traffic; Read Replicas handle write transactions",
          "Read Replicas can only exist in the same region and AZ",
          "There is no difference"
        ],
        answerIndex: 0,
        difficulty: "hard",
        topic: "RDS"
      },
      {
        question: "What does AWS Auto Scaling use to determine when to add or remove EC2 instances?",
        options: [
          "Manual human intervention exclusively",
          "CloudWatch metric alarms (e.g. average CPU utilization, target tracking policies, or schedule-based rules)",
          "Random number generator",
          "Billing thresholds"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Auto Scaling"
      },
      {
        question: "What is an Application Load Balancer (ALB) operating at compared to a Network Load Balancer (NLB)?",
        options: [
          "ALB operates at Layer 7 (HTTP/HTTPS) with path-based and host-based routing; NLB operates at Layer 4 (TCP/UDP) for ultra-low latency and extreme throughput",
          "ALB operates at Layer 4; NLB operates at Layer 7",
          "ALB cannot terminate SSL/TLS",
          "NLB can only inspect HTTP cookies"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "ELB"
      },
      {
        question: "What does an AWS VPC NAT Gateway do?",
        options: [
          "Allows internet traffic to directly access database instances in private subnets",
          "Enables instances in private subnets to connect outbound to the internet (e.g. for OS patches) while preventing unsolicited inbound connections from the internet",
          "Acts as a DNS nameserver",
          "Encrypts S3 buckets"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "VPC"
      },
      {
        question: "How should applications running on Amazon EC2 or ECS authenticate with AWS services securely?",
        options: [
          "By baking hardcoded AWS_ACCESS_KEY_ID into environment variables",
          "By attaching an IAM Role (Instance Profile / Task Role) so AWS automatically rotates and injects temporary credentials",
          "By emailing root passwords to admin",
          "By using public unauthenticated endpoints"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "IAM Roles"
      },
      {
        question: "What is the purpose of AWS KMS (Key Management Service)?",
        options: [
          "To generate passwords for website users",
          "To create, manage, and control cryptographic keys used to encrypt data across AWS services and applications with hardware security modules (HSMs)",
          "To host DNS records",
          "To deploy Kubernetes pods"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Security"
      },
      {
        question: "What AWS service provides centralized infrastructure-as-code (IaC) templating?",
        options: ["AWS CloudFormation", "AWS CloudTrail", "AWS CloudWatch", "Amazon Inspector"],
        answerIndex: 0,
        difficulty: "easy",
        topic: "DevOps"
      }
    ],
    codingPool: [
      {
        id: "aws-policy-parser",
        title: "IAM Policy Statement Validator",
        language: "javascript",
        instructions: "Write a function `validatePolicy(policyObj)` that validates an AWS IAM Policy document.\n\nRequirements:\n1. Must contain a 'Statement' array.\n2. Each statement must have 'Effect' ('Allow' or 'Deny'), 'Action', and 'Resource'.\n3. Return true if valid, false otherwise.",
        initialCode: `export function validatePolicy(policyObj) {
    // Validate IAM Policy document
    return false;
}
`,
        supportedLanguages: COMMON_SUPPORTED_LANGUAGES
      }
    ]
  },

  // 14. REACT NATIVE
  "react native": {
    mcqPool: [
      {
        question: "In React Native's New Architecture, what replaces the asynchronous JSON Bridge?",
        options: [
          "WebSockets",
          "JavaScript Interface (JSI), allowing synchronous, direct C++ function invocation between JavaScript and native platforms",
          "CORBA RPC",
          "Local storage pipes"
        ],
        answerIndex: 1,
        difficulty: "hard",
        topic: "Architecture"
      },
      {
        question: "What is Hermes in the context of React Native?",
        options: [
          "A messaging library",
          "An open-source JavaScript engine optimized specifically for fast app startup, low memory consumption, and ahead-of-time (AOT) bytecode compilation on mobile devices",
          "A build tool for iOS exclusively",
          "A state management library"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Hermes"
      },
      {
        question: "Why should you use FlatList instead of ScrollView when rendering long lists of items in React Native?",
        options: [
          "ScrollView cannot render text",
          "FlatList virtualizes list items, rendering only those currently visible on screen and recycling views to maintain low memory usage; ScrollView renders all items simultaneously",
          "FlatList disables user touch scrolling",
          "ScrollView is deprecated in React Native 0.70+"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Performance"
      },
      {
        question: "What layout engine does React Native use to implement Flexbox on mobile platforms?",
        options: ["WebKit", "Yoga (C++ flexbox layout engine)", "Blink", "Chromium"],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Layout"
      },
      {
        question: "How does the default Flexbox flexDirection differ between React Native and CSS for web?",
        options: [
          "Web defaults to 'column'; React Native defaults to 'row'",
          "Web defaults to 'row'; React Native defaults to 'column'",
          "Both default to 'grid'",
          "There is no difference"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Flexbox"
      },
      {
        question: "What is Fabric in React Native's New Architecture?",
        options: [
          "A CSS-in-JS framework",
          "The new concurrent rendering system that enables synchronous UI updates and improves interoperability with native host platforms",
          "A cloud deployment pipeline",
          "An analytics tool"
        ],
        answerIndex: 1,
        difficulty: "hard",
        topic: "Fabric"
      },
      {
        question: "Why should animations be run using useNativeDriver: true in React Native Animated API?",
        options: [
          "To execute animations on the GPU shader without passing frame-by-frame updates across the JavaScript bridge, ensuring 60+ FPS even if the JS thread is busy",
          "To disable CSS animations",
          "To bypass device battery saving mode",
          "To animate non-layout properties like flex"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Animations"
      },
      {
        question: "Which component should you use to capture user touches with native visual feedback (like ripple on Android or opacity on iOS)?",
        options: ["<View>", "<Pressable>", "<Text>", "<ScrollView>"],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Gestures"
      },
      {
        question: "How does React Native handle different screen densities across mobile devices?",
        options: [
          "All dimensions are defined in physical hardware millimetres",
          "Dimensions are unitless and represent Density-Independent Pixels (dp on Android, points on iOS), scaled automatically to physical device pixels",
          "Developers must write separate code for every screen resolution",
          "It forces 1080p resolution on all devices"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Dimensions"
      },
      {
        question: "What does TurboModules provide in the React Native New Architecture?",
        options: [
          "Fast download of npm packages",
          "Lazy loading of native modules on demand using JSI rather than initializing all native modules upfront during app startup",
          "Automatic compilation of Kotlin to Swift",
          "Memory defragmentation"
        ],
        answerIndex: 1,
        difficulty: "hard",
        topic: "TurboModules"
      },
      {
        question: "How can you run platform-specific code in React Native?",
        options: [
          "Using Platform.select({ ios: ..., android: ... }) or platform-specific file extensions like Component.ios.tsx and Component.android.tsx",
          "By querying window.navigator.userAgent",
          "By deploying two separate git repositories",
          "React Native cannot run platform-specific code"
        ],
        answerIndex: 0,
        difficulty: "easy",
        topic: "Platform API"
      },
      {
        question: "What is AsyncStorage used for in React Native applications?",
        options: [
          "A high-speed relational SQL database for video caching",
          "An unencrypted, asynchronous, persistent, key-value storage system for storing small application state across app restarts",
          "RAM cache that clears when the app is minimised",
          "Storing credit card numbers securely"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Storage"
      },
      {
        question: "What should be used instead of AsyncStorage when storing sensitive data (e.g. JWT tokens or biometric credentials) in React Native?",
        options: [
          "Plain Redux store",
          "react-native-keychain / Expo SecureStore (which uses iOS Keychain and Android Keystore/EncryptedSharedPreferences)",
          "document.cookie",
          "Hardcoded strings"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Security"
      },
      {
        question: "How does the AppState API in React Native help manage background behavior?",
        options: [
          "It manages Redux global state",
          "It reports whether the app is in the 'active', 'background', or 'inactive' state, allowing developers to pause animations, timers, and network polling",
          "It controls the Android status bar color",
          "It restarts the app on crash"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "AppState"
      },
      {
        question: "What is Fast Refresh in React Native?",
        options: [
          "A hardware refresh rate overclocking tool",
          "A developer experience feature that preserves React component state while editing source code and hot-reloading changes instantaneously",
          "A command to clear Xcode cache",
          "An automatic database migration runner"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Dev Experience"
      },
      {
        question: "What component handles keyboard avoidance when inputs are focused on mobile screens?",
        options: ["<SafeAreaView>", "<KeyboardAvoidingView>", "<StatusBar>", "<Modal>"],
        answerIndex: 1,
        difficulty: "easy",
        topic: "UI Components"
      }
    ],
    codingPool: [
      {
        id: "rn-list-filter",
        title: "Item Filter Function",
        language: "javascript",
        instructions: "Write a function `filterItems(items, search)` that filters a list of objects `{ id, title }` by case-insensitive substring match on `title`.",
        initialCode: `export function filterItems(items, search) {
    // Filter items by title substring
    return [];
}
`,
        supportedLanguages: COMMON_SUPPORTED_LANGUAGES
      }
    ]
  },

  // 15. TECHNICAL MANAGEMENT (Pure Non-Coding Skill: 20 Scenario MCQs)
  "technical management": {
    mcqPool: [
      {
        question: "How should an engineering leader prioritize technical debt reduction alongside product feature delivery?",
        options: [
          "Postpone all tech debt indefinitely until production crashes",
          "Allocate a sustainable percentage of sprint capacity (e.g. 15-20%) continuously and quantify debt in terms of reliability risk and velocity impact",
          "Stop all feature development for 6 months to rewrite everything from scratch",
          "Assign tech debt tickets exclusively to incoming interns"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Engineering Leadership"
      },
      {
        question: "In a Blameless Post-Mortem after a Sev-1 outage, what is the core objective?",
        options: [
          "Determine which developer made the git commit to issue disciplinary action",
          "Identify systemic, process, and tooling vulnerabilities that allowed the failure to occur, creating preventive automated guardrails",
          "Assign blame to third-party vendors exclusively",
          "Delete the incident logs to prevent legal exposure"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Incident Management"
      },
      {
        question: "What is the primary indicator of team health when evaluating DORA metrics?",
        options: [
          "Total lines of code written per engineer per day",
          "Deployment Frequency, Lead Time for Changes, Change Failure Rate, and Time to Restore Service (MTTR)",
          "Number of hours spent in daily standup meetings",
          "Total number of Jira tickets closed regardless of quality"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "DORA Metrics"
      },
      {
        question: "When managing microservices architecture migration from a monolith, what architectural pattern is recommended to minimize risk?",
        options: [
          "Big Bang rewrite where all services launch simultaneously overnight",
          "Strangler Fig pattern, incrementally intercepting and routing specific domain calls to new microservices while the monolith continues running",
          "Replicating the entire monolith database into every microservice without decoupling",
          "Stopping all production traffic during the multi-month migration"
        ],
        answerIndex: 1,
        difficulty: "hard",
        topic: "System Architecture"
      },
      {
        question: "What is the main goal of establishing Service Level Objectives (SLOs) and Error Budgets?",
        options: [
          "To penalize on-call engineers when uptime dips below 100%",
          "To create an objective, shared balance between feature velocity and infrastructure reliability, halting risky rollouts when error budgets are exhausted",
          "To guarantee 100.000% uptime under all circumstances",
          "To eliminate the need for QA testing"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "SRE & Operations"
      },
      {
        question: "How should cross-functional sprint commitments be sized in Agile teams?",
        options: [
          "By strictly tracking individual developer hours against a 40-hour work week",
          "By utilizing relative sizing (story points or T-shirt sizes) focused on complexity, uncertainty, and effort rather than absolute calendar hours",
          "By having the product manager assign arbitrary hour estimates to each task",
          "By assuming every engineer operates at 100% capacity without meetings or interruptions"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Agile Estimation"
      },
      {
        question: "What is the primary risk of having a low 'Bus Factor' on an engineering team?",
        options: [
          "Excessive expenditure on public transportation subsidies",
          "Concentration of critical architectural knowledge in a single individual, creating operational paralysis if that person departs",
          "Too many developers contributing to the same Git repository branch",
          "Hardware failure of server buses"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Team Structure"
      },
      {
        question: "In continuous deployment (CD), what is the purpose of Canary Deployments?",
        options: [
          "Deploying code only on weekends when traffic is low",
          "Routing a small percentage of real user traffic (e.g. 2-5%) to the new release to monitor error rates and latency before wide rollout",
          "Running tests exclusively in simulated bird-watching environments",
          "Manually verifying each HTTP request before it reaches the backend"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Release Engineering"
      },
      {
        question: "How should an engineering manager handle high-performing engineers whose behavior is toxic to team psychological safety?",
        options: [
          "Ignore the behavior completely as long as their individual output remains high",
          "Address the behavior immediately through direct feedback, establishing clear conduct expectations, because toxic dynamics degrade overall team performance",
          "Promote them to director to isolate them from juniors",
          "Blame the rest of the team for not being resilient enough"
        ],
        answerIndex: 1,
        difficulty: "hard",
        topic: "Team Culture"
      },
      {
        question: "What does Conway's Law state regarding system design?",
        options: [
          "Software systems always become slower over time as hardware speeds increase",
          "Organizations design systems that mirror their own communication structures",
          "Every bug discovered in production requires two new unit tests",
          "Open source software is inherently more secure than proprietary code"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "System Design"
      },
      {
        question: "What is the primary advantage of Trunk-Based Development over GitFlow for fast-moving engineering teams?",
        options: [
          "Trunk-based development eliminates all code reviews",
          "Frequent small merges to the main branch minimize merge conflicts, avoid long-lived stale branches, and enable continuous integration",
          "Trunk-based development requires zero automated CI/CD pipelines",
          "Trunk-based development prevents junior engineers from committing code"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Source Control"
      },
      {
        question: "What is the main function of an Architectural Decision Record (ADR)?",
        options: [
          "To provide legally binding documentation for patent filings",
          "To capture important architectural decisions, context, trade-offs, and consequences for future engineering teams",
          "To track daily bug fixes and minor style adjustments",
          "To generate automatic unit tests from markdown"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Architecture Governance"
      },
      {
        question: "In database scaling, what is the main trade-off introduced by Database Sharding?",
        options: [
          "Sharding makes all SQL queries 10x faster automatically",
          "Horizontal scaling capacity increases, but cross-shard transactions, queries, and schema migrations become significantly more complex",
          "Sharding eliminates the need for database backups",
          "Sharding is only compatible with NoSQL document stores"
        ],
        answerIndex: 1,
        difficulty: "hard",
        topic: "Database Architecture"
      },
      {
        question: "How should API versioning be managed to prevent breaking downstream client integrations?",
        options: [
          "Immediately drop deprecated fields without notice",
          "Support backward compatibility, document deprecation periods in advance, and version APIs via URI paths or headers",
          "Force all mobile app users to update their apps within 1 hour",
          "Never add new fields to any existing endpoint"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "API Design"
      },
      {
        question: "What is the purpose of Chaos Engineering (e.g. Chaos Monkey)?",
        options: [
          "To introduce random syntax errors into source code during compile time",
          "To proactively inject real-world failures (e.g. terminated instances, network partition) into production to uncover weaknesses before outages occur",
          "To test whether developers can work without coffee",
          "To randomly delete customer records for compliance audits"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Resilience Engineering"
      },
      {
        question: "What is a major symptom of 'Scrum in name only' (Cargo Cult Agile)?",
        options: [
          "Daily automated deployments to staging environments",
          "Rigid adherence to ceremonies without delivering working software iteratively or adapting to feedback",
          "High customer satisfaction and rapid iteration cycles",
          "Engineers writing comprehensive unit and integration tests"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Agile Practices"
      },
      {
        question: "When evaluating third-party dependencies or SaaS tools, what is the most critical security consideration?",
        options: [
          "Whether the vendor logo looks modern",
          "Supply chain vulnerabilities, SBOM (Software Bill of Materials), access permissions, compliance certifications (SOC2/ISO), and data residency",
          "Whether the library is trending on social media",
          "The number of GitHub stars exclusively"
        ],
        answerIndex: 1,
        difficulty: "medium",
        topic: "Security Governance"
      },
      {
        question: "What does the 'Two-Pizza Team' rule coined by Amazon advocate?",
        options: [
          "Providing free lunch to developers every Friday",
          "Keeping teams small enough (typically 6-10 people) to minimize communication overhead and maintain autonomy and accountability",
          "Restricting developers from ordering dinner during hackathons",
          "Pair programming in pairs of two"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "Organizational Design"
      },
      {
        question: "How does Feature Flagging (Feature Toggles) decouple deployment from release?",
        options: [
          "By deploying code to production in a disabled state, allowing it to be enabled for specific users or turned off instantly without re-deploying",
          "By removing git tags from release branches",
          "By compiling code directly on client devices",
          "By requiring manual QA approval before every commit"
        ],
        answerIndex: 0,
        difficulty: "medium",
        topic: "Continuous Delivery"
      },
      {
        question: "In site reliability engineering, what is the definition of MTTR (Mean Time to Resolution)?",
        options: [
          "The time taken to write a new pull request",
          "The average time required to troubleshoot, fix, and restore normal service operation after an incident is detected",
          "The time between server reboots during scheduled maintenance",
          "The duration of the annual performance review cycle"
        ],
        answerIndex: 1,
        difficulty: "easy",
        topic: "SRE Metrics"
      }
    ],
    codingPool: []
  }
};

export const QUESTION_BANKS: Record<string, { mcqPool: MCQ[]; codingPool: CodingChallenge[] }> = Object.fromEntries(
  Object.entries(BASE_QUESTION_BANKS).map(([skill, bank]) => [
    skill,
    {
      ...bank,
      mcqPool: [
        ...bank.mcqPool,
        ...(EXPANDED_MCQS[skill] || [])
      ]
    }
  ])
);

export const SKILL_ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  golang: "go",
  postgres: "sql",
  postgresql: "sql",
  mysql: "sql",
  sqlite: "sql",
  database: "sql",
  databases: "sql",
  frontend: "react",
  backend: "python",
  fullstack: "react",
  next: "next.js",
  nextjs: "next.js",
  ai: "machine learning",
  ml: "machine learning",
  "data science": "machine learning",
  pytorch: "machine learning",
  tensorflow: "machine learning",
  pandas: "machine learning",
  rust: "rust",
  "react native": "react native",
  "react-native": "react native",
  flutter: "react native",
  mobile: "react native",
  "spring boot": "java",
  spring: "java",
  cpp: "c++",
  django: "python",
  fastapi: "python",
  flask: "python",
  management: "technical management",
  agile: "technical management",
  scrum: "technical management",
  pm: "technical management",
  "product management": "technical management"
};

function hashString32(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleArray<T>(array: T[], seed?: number): T[] {
  const arr = [...array];
  const rand = seed !== undefined ? mulberry32(seed) : Math.random;
  for (let i = arr.length - 1; i > 0; i--) {
    const r = rand();
    const j = Math.floor(r * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function resolveSkillKey(skillName: string): string | null {
  if (!skillName) return null;
  const normalized = skillName.toLowerCase().trim();
  if (QUESTION_BANKS[normalized]) return normalized;
  if (SKILL_ALIASES[normalized]) return SKILL_ALIASES[normalized];
  for (const key of Object.keys(QUESTION_BANKS)) {
    if (normalized.includes(key)) return key;
  }
  return null;
}

export function sanitizeAssessmentContent(content: AssessmentContent): AssessmentContent {
  return {
    ...content,
    mcqs: content.mcqs.map((mcq) => ({
      question: mcq.question,
      options: mcq.options,
      difficulty: mcq.difficulty,
      topic: mcq.topic,
    })),
  };
}

export function getAssessmentContent(
  skillName: string,
  userSeed?: string | number,
  options?: { sanitize?: boolean }
): AssessmentContent | null {
  const key = resolveSkillKey(skillName);
  if (!key) return null;
  const bank = QUESTION_BANKS[key];
  if (!bank) return null;

  let seedNum: number;
  if (typeof userSeed === "number") {
    seedNum = userSeed >>> 0;
  } else if (typeof userSeed === "string" && userSeed.length > 0) {
    seedNum = hashString32(userSeed);
  } else {
    seedNum = hashString32(`${Date.now()}_${Math.random()}`);
  }

  const hasCoding = Boolean(bank.codingPool && bank.codingPool.length > 0);

  // Exact requirement: 15 questions = 5 easy + 5 medium + 5 hard, and in strict sequential order
  const easyPool = bank.mcqPool.filter((q) => q.difficulty === "easy");
  const mediumPool = bank.mcqPool.filter((q) => q.difficulty === "medium");
  const hardPool = bank.mcqPool.filter((q) => q.difficulty === "hard");

  // Pick 5 from each difficulty pool deterministically using seed
  const selectedEasy = shuffleArray(easyPool.length >= 5 ? easyPool : bank.mcqPool, (seedNum + 101) >>> 0).slice(0, 5);
  const selectedMedium = shuffleArray(mediumPool.length >= 5 ? mediumPool : bank.mcqPool, (seedNum + 202) >>> 0).slice(0, 5);
  const selectedHard = shuffleArray(hardPool.length >= 5 ? hardPool : bank.mcqPool, (seedNum + 303) >>> 0).slice(0, 5);

  // Strictly in sequential order:
  // Questions 1 to 5: Easy
  // Questions 6 to 10: Medium
  // Questions 11 to 15: Hard
  const selectedMcqs: MCQ[] = [
    ...selectedEasy,
    ...selectedMedium,
    ...selectedHard,
  ].slice(0, 15);

  // 2. Shuffle option choices for each MCQ while preserving the correct answer index
  const randomizedMcqs: MCQ[] = selectedMcqs.map((mcq, mIdx) => {
    const correctAnswerText = mcq.options[mcq.answerIndex || 0];
    const mcqSeed = (seedNum + mIdx * 10007) >>> 0;
    const shuffledOptions = shuffleArray(mcq.options, mcqSeed);
    const newAnswerIndex = shuffledOptions.indexOf(correctAnswerText);

    if (options?.sanitize) {
      return {
        id: mcq.id || `mcq-${mIdx + 1}`,
        question: mcq.question,
        options: shuffledOptions,
        difficulty: mcq.difficulty,
        topic: mcq.topic,
      };
    }

    return {
      id: mcq.id || `mcq-${mIdx + 1}`,
      question: mcq.question,
      options: shuffledOptions,
      answerIndex: newAnswerIndex >= 0 ? newAnswerIndex : 0,
      explanation: mcq.explanation,
      difficulty: mcq.difficulty,
      topic: mcq.topic,
    };
  });

  // 3. Pick a coding challenge dynamically from the pool if available
  let selectedCoding: CodingChallenge | undefined = undefined;
  if (hasCoding && bank.codingPool) {
    const codingPool = bank.codingPool;
    const codingRand = mulberry32((seedNum + 54321) >>> 0)();
    const codingIndex = Math.floor(codingRand * codingPool.length);
    selectedCoding = codingPool[codingIndex] || codingPool[0];
  }

  return {
    mcqs: randomizedMcqs,
    coding: selectedCoding,
    hasCoding,
    timeLimitMinutes: hasCoding ? 90 : 35,
    assessmentType: hasCoding ? "coding_capable" : "mcq_only",
  };
}
