export interface MCQ {
  id?: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation?: string;
}

export interface CodingChallenge {
  id?: string;
  title: string;
  instructions: string;
  initialCode: string;
  language?: string;
}

export interface AssessmentContent {
  mcqs: MCQ[];
  coding: CodingChallenge;
}

// ─── COMPREHENSIVE QUESTION POOLS BY DOMAIN ───────────────────────────────────

export const QUESTION_BANKS: Record<string, { mcqPool: MCQ[]; codingPool: CodingChallenge[] }> = {
  // 1. REACT
  react: {
    mcqPool: [
      {
        question: "Which hook should you use to perform side effects in a React function component?",
        options: ["useState", "useMemo", "useEffect", "useReducer"],
        answerIndex: 2,
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
      },
      {
        question: "What is the primary purpose of the React `useCallback` hook?",
        options: [
          "To memoize a calculated value",
          "To memoize a callback function instance between renders to prevent unnecessary child re-renders",
          "To trigger a synchronous side-effect before paint",
          "To manage global application state"
        ],
        answerIndex: 1,
      },
      {
        question: "In React, why should you avoid using array indices as `key` props when the list order can change?",
        options: [
          "It throws a compile-time syntax error in strict mode",
          "It degrades performance and can cause unintended component state mismatches during reconciliation",
          "Array indices cannot be converted to strings",
          "Keys must always be UUIDs"
        ],
        answerIndex: 1,
      },
      {
        question: "What does the React Fiber reconciler achieve over the legacy Stack reconciler?",
        options: [
          "It forces all DOM renders to be completely synchronous",
          "It enables incremental rendering by splitting rendering work into chunks and pausing/resuming based on priority",
          "It replaces the Virtual DOM with direct web workers",
          "It compiles JSX directly to binary bytecode"
        ],
        answerIndex: 1,
      }
    ],
    codingPool: [
      {
        id: "react-counter",
        title: "Bounded Counter Component",
        language: "javascript",
        instructions: "Implement a React functional component `Counter` with 'Increment' and 'Decrement' buttons and a 'Reset' button. Requirements:\n1. The count must never drop below 0.\n2. When count reaches 10, disable the Increment button.\n3. Display an alert tag 'Max reached' when count is 10.",
        initialCode: `import React, { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-4 border rounded-lg max-w-sm">
      <h2 className="text-xl font-bold mb-2">Count: {count}</h2>
      {/* Implement buttons and logic here */}
    </div>
  );
}
`
      },
      {
        id: "react-todo-filter",
        title: "Searchable Todo Filter",
        language: "javascript",
        instructions: "Create a React component `TodoList` that manages an array of tasks ({ id, text, completed }). Requirements:\n1. Provide a text input that filters visible tasks by substring match.\n2. Provide checkboxes to toggle task completion status.\n3. Show a count badge with total remaining active (uncompleted) tasks.",
        initialCode: `import React, { useState, useMemo } from 'react';

export default function TodoList({ initialTasks = [] }) {
  // Implement state and filter logic
  return (
    <div>
      {/* Filter input and task list */}
    </div>
  );
}
`
      }
    ]
  },

  // 2. JAVA
  java: {
    mcqPool: [
      {
        question: "Which of these is NOT a primitive data type in Java?",
        options: ["int", "boolean", "String", "double"],
        answerIndex: 2,
      },
      {
        question: "What is the purpose of the 'transient' keyword in Java?",
        options: [
          "To make a variable thread-safe across CPU caches",
          "To indicate that a field should not be serialized when the object is converted to a byte stream",
          "To declare a runtime constant",
          "To restrict access to subclasses within the same package"
        ],
        answerIndex: 1,
      },
      {
        question: "How does the Java `ConcurrentHashMap` achieve thread safety without locking the entire table?",
        options: [
          "It uses a single global mutex lock on all read and write operations",
          "It uses lock-striping / CAS (Compare-And-Swap) operations on individual bucket nodes",
          "It converts all keys to immutable records at runtime",
          "It runs all mutating operations on a dedicated daemon thread"
        ],
        answerIndex: 1,
      },
      {
        question: "What is the difference between `Comparable` and `Comparator` in Java?",
        options: [
          "`Comparable` is for primitives, while `Comparator` is for Objects",
          "`Comparable` defines natural ordering via `compareTo`, while `Comparator` defines external customized sorting via `compare`",
          "`Comparable` cannot be used with Collections.sort",
          "They are synonymous interfaces in Java 8+"
        ],
        answerIndex: 1,
      },
      {
        question: "What happens when an unhandled exception occurs in a Java thread created via `Thread`?",
        options: [
          "The entire JVM terminates immediately",
          "The thread terminates, and the JVM queries the thread's UncaughtExceptionHandler before releasing thread resources",
          "The exception is automatically re-routed to the main thread",
          "The thread is restarted automatically"
        ],
        answerIndex: 1,
      }
    ],
    codingPool: [
      {
        id: "java-streams",
        title: "Java Stream Processing",
        language: "java",
        instructions: "Write a public static Java method `filterAndSort(List<Integer> numbers)` that:\n1. Filters out all odd numbers.\n2. Multiplies the remaining even numbers by 2.\n3. Eliminates any duplicates.\n4. Returns a List of the results sorted in descending order.",
        initialCode: `import java.util.*;
import java.util.stream.*;

public class Solution {
    public static List<Integer> filterAndSort(List<Integer> numbers) {
        // Implement using Java Streams
        return new ArrayList<>();
    }
}
`
      },
      {
        id: "java-lru",
        title: "LRU Cache Structure",
        language: "java",
        instructions: "Implement a basic `LRUCache<K, V>` class with a fixed capacity using `LinkedHashMap` or doubly linked nodes. Requirements:\n1. `get(K key)` returns the value or null, updating access recency.\n2. `put(K key, V value)` inserts or updates, evicting the least recently used entry if over capacity.",
        initialCode: `import java.util.*;

public class LRUCache<K, V> {
    private final int capacity;

    public LRUCache(int capacity) {
        this.capacity = capacity;
    }

    public V get(K key) {
        return null;
    }

    public void put(K key, V value) {
        // Implement eviction and insertion
    }
}
`
      }
    ]
  },

  // 3. PYTHON
  python: {
    mcqPool: [
      {
        question: "What is the output of `print(type([]))` in Python?",
        options: ["<class 'list'>", "<class 'array'>", "<class 'dict'>", "<class 'tuple'>"],
        answerIndex: 0,
      },
      {
        question: "Which of the following statements is true regarding Python's Global Interpreter Lock (GIL)?",
        options: [
          "It allows multiple native threads to execute Python bytecodes in parallel on multiple CPU cores",
          "It is a mutex that prevents multiple threads from executing Python bytecodes simultaneously in CPython",
          "It manages garbage collection cycles automatically",
          "It compiles Python source code to C before execution"
        ],
        answerIndex: 1,
      },
      {
        question: "What is the time complexity of looking up a key in an average Python `dict`?",
        options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
        answerIndex: 0,
      },
      {
        question: "How do Python generator functions manage memory when streaming large datasets?",
        options: [
          "They load the entire dataset into virtual swap memory",
          "They yield values lazily one at a time, maintaining state without loading all elements into memory simultaneously",
          "They compress elements using zlib",
          "They compile the generator into a C struct"
        ],
        answerIndex: 1,
      },
      {
        question: "What does the `@functools.wraps` decorator do when writing custom Python decorators?",
        options: [
          "It compiles the decorated function using Cython",
          "It preserves the original function's metadata such as `__name__` and `__doc__`",
          "It makes the function thread-safe",
          "It caches the return value automatically"
        ],
        answerIndex: 1,
      }
    ],
    codingPool: [
      {
        id: "python-transactions",
        title: "Transaction Reconciliation",
        language: "python",
        instructions: "Write a function `process_transactions(csv_string)` that parses a CSV string.\nColumns: `tx_id, user_id, amount, status`\n\nRequirements:\n1. Filter for rows where status is 'COMPLETED'.\n2. Ignore empty or malformed rows.\n3. Return a dictionary of `{ user_id: total_amount }` with amounts summed as floats.",
        initialCode: `def process_transactions(csv_string):
    # Parse CSV, filter status == 'COMPLETED', sum by user_id
    totals = {}
    return totals
`
      },
      {
        id: "python-aov",
        title: "Average Order Value Calculator",
        language: "python",
        instructions: "Write a function `calculate_aov(csv_string)` that parses order records.\nColumns: `order_id, user_id, amount, status`\n\nRequirements:\n1. Filter for rows where status is 'SUCCESS'.\n2. Calculate the average order amount per user.\n3. Return a dictionary of `{ user_id: round(avg, 2) }`.",
        initialCode: `def calculate_aov(csv_string):
    # Calculate average order value per user for SUCCESS orders
    return {}
`
      }
    ]
  },

  // 4. JAVASCRIPT / TYPESCRIPT
  typescript: {
    mcqPool: [
      {
        question: "What does the `unknown` type represent in TypeScript compared to `any`?",
        options: [
          "It is an alias for `undefined`",
          "It is the type-safe counterpart of `any`; operations on `unknown` require explicit type narrowing or casting before use",
          "It can only hold primitive string values",
          "It disables the TypeScript compiler checks entirely"
        ],
        answerIndex: 1,
      },
      {
        question: "What is the output of `console.log(0.1 + 0.2 === 0.3)` in JavaScript?",
        options: ["true", "false", "undefined", "TypeError"],
        answerIndex: 1,
      },
      {
        question: "What does the JavaScript Event Loop prioritize first after the current execution context completes?",
        options: [
          "Macrotasks (e.g. `setTimeout`)",
          "Microtasks (e.g. `Promise.then`, `queueMicrotask`)",
          "I/O events",
          "`requestAnimationFrame` callbacks"
        ],
        answerIndex: 1,
      },
      {
        question: "In TypeScript, what is the purpose of the `readonly` modifier on array types (e.g., `ReadonlyArray<T>`)?",
        options: [
          "It freezes the array in V8 engine memory so it cannot be garbage collected",
          "It prevents mutating methods like `push`, `pop`, or index assignments from compiling",
          "It causes the array to be deeply cloned on every read",
          "It turns array elements into symbols"
        ],
        answerIndex: 1,
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
`
      }
    ]
  },

  // 5. C++
  "c++": {
    mcqPool: [
      {
        question: "What is the primary difference between `std::unique_ptr` and `std::shared_ptr` in modern C++?",
        options: [
          "`std::unique_ptr` cannot point to arrays",
          "`std::unique_ptr` enforces single exclusive ownership and cannot be copied, only moved",
          "`std::shared_ptr` does not use reference counting",
          "`std::unique_ptr` is allocated on the stack only"
        ],
        answerIndex: 1,
      },
      {
        question: "What does the RAII (Resource Acquisition Is Initialization) idiom guarantee in C++?",
        options: [
          "All pointers are converted to garbage-collected handles",
          "Resources are tied to object lifetime, guaranteeing release upon destruction even when exceptions occur",
          "All variables must be initialized at compile time",
          "Threads are joined automatically"
        ],
        answerIndex: 1,
      },
      {
        question: "What is the consequence of defining a non-virtual destructor in a C++ polymorphic base class?",
        options: [
          "A compiler syntax error",
          "Undefined behavior and potential memory leaks when deleting a derived object via a base class pointer",
          "The derived class cannot inherit member variables",
          "Virtual method tables cannot be constructed"
        ],
        answerIndex: 1,
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
`
      }
    ]
  },

  // 6. GO (GOLANG)
  go: {
    mcqPool: [
      {
        question: "How are Goroutines scheduled in the Go runtime?",
        options: [
          "Using 1:1 kernel thread mapping for every goroutine",
          "Using an M:N multiplexer (Go Scheduler) that maps M goroutines onto N OS threads across P processors",
          "Using cooperative round-robin inside the user libc library",
          "Goroutines run on the GPU"
        ],
        answerIndex: 1,
      },
      {
        question: "What is the output when reading from an unbuffered, closed Go channel?",
        options: [
          "It panics with `panic: send on closed channel`",
          "It yields the zero-value of the channel's type and `ok == false` immediately without blocking",
          "It blocks the calling goroutine indefinitely",
          "It returns `nil`"
        ],
        answerIndex: 1,
      },
      {
        question: "In Go, how do you prevent goroutine leaks when working with cancellable operations?",
        options: [
          "By calling `runtime.GC()` after each call",
          "By passing a `context.Context` and listening on `ctx.Done()`",
          "By declaring channels with infinite buffers",
          "Goroutines cannot leak in Go"
        ],
        answerIndex: 1,
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
`
      }
    ]
  },

  // 7. SQL / DATABASES
  sql: {
    mcqPool: [
      {
        question: "What is the key difference between `WHERE` and `HAVING` in an SQL query?",
        options: [
          "`WHERE` is used with MySQL, while `HAVING` is for PostgreSQL",
          "`WHERE` filters rows before aggregation, while `HAVING` filters aggregated groups produced by `GROUP BY`",
          "`HAVING` cannot contain boolean expressions",
          "There is no difference"
        ],
        answerIndex: 1,
      },
      {
        question: "In relational databases, what does the ACID property 'Isolation' guarantee?",
        options: [
          "Transactions are persisted immediately to optical storage",
          "Concurrent transactions execute without interfering with one another's intermediate states",
          "Only one user can connect to the database at a time",
          "Foreign keys are strictly enforced"
        ],
        answerIndex: 1,
      },
      {
        question: "What is a B-Tree index's primary performance advantage for range queries?",
        options: [
          "It stores all keys in random hash buckets",
          "It maintains sorted keys in hierarchical linked leaves, allowing O(log N) lookup and sequential scanning",
          "It compresses data using gzip",
          "It avoids disk reads completely"
        ],
        answerIndex: 1,
      }
    ],
    codingPool: [
      {
        id: "sql-top-spenders",
        title: "Top Spenders Query",
        language: "sql",
        instructions: "Write an SQL query to find the top 3 users who spent the most money in '2024'. Table: `orders (id, user_id, amount, status, created_at)`.\nRequirements: Only consider status = 'COMPLETED'. Order by total spent descending.",
        initialCode: `-- Write your SQL query here
SELECT user_id, SUM(amount) AS total_spent
FROM orders
-- complete query
`
      }
    ]
  },

  // 8. DOCKER / DEVOPS
  docker: {
    mcqPool: [
      {
        question: "Why should you use multi-stage builds in Dockerfiles for production services?",
        options: [
          "To allow Docker to run on multiple operating systems simultaneously",
          "To separate the build environment from the lean runtime container, drastically reducing image size and attack surface",
          "To compile kernels dynamically",
          "To bypass Docker hub layer caching"
        ],
        answerIndex: 1,
      },
      {
        question: "What is the difference between `COPY` and `ADD` in a Dockerfile?",
        options: [
          "`ADD` is deprecated in Docker 20+",
          "`COPY` only copies local files, while `ADD` can also fetch remote URLs and automatically unpack local tar archives",
          "`COPY` creates new layers while `ADD` does not",
          "They are identical aliases"
        ],
        answerIndex: 1,
      },
      {
        question: "What Linux kernel primitives provide the underlying isolation mechanism for Docker containers?",
        options: [
          "Hypervisors and QEMU emulation",
          "Namespaces (for isolation) and cgroups (for resource limitation)",
          "systemd services and swap partitions",
          "iptables exclusively"
        ],
        answerIndex: 1,
      }
    ],
    codingPool: [
      {
        id: "docker-multistage",
        title: "Production Node.js Dockerfile",
        language: "dockerfile",
        instructions: "Write a multi-stage `Dockerfile` for a Node.js TypeScript app:\nStage 1 ('builder'): installs dependencies and runs `npm run build`.\nStage 2 ('runner'): uses `node:20-alpine`, copies only compiled `dist/` and production `node_modules`, runs as non-root user `node`, exposes port 3000.",
        initialCode: `# Multi-stage Dockerfile
FROM node:20-alpine AS builder
# Implement builder stage

FROM node:20-alpine AS runner
# Implement runner stage
`
      }
    ]
  }
};

// Aliases for skills mapping
const SKILL_ALIASES: Record<string, string> = {
  javascript: "typescript",
  js: "typescript",
  ts: "typescript",
  "node.js": "typescript",
  nodejs: "typescript",
  nextjs: "react",
  "next.js": "react",
  vue: "react",
  "vue.js": "react",
  angular: "react",
  svelte: "react",
  golang: "go",
  cpp: "c++",
  cplusplus: "c++",
  "c#": "java",
  csharp: "java",
  dotnet: "java",
  ".net": "java",
  postgres: "sql",
  postgresql: "sql",
  mysql: "sql",
  sqlite: "sql",
  database: "sql",
  databases: "sql",
  kubernetes: "docker",
  k8s: "docker",
  devops: "docker",
  "ci/cd": "docker",
  fastapi: "python",
  flask: "python",
  django: "python",
  "machine learning": "python",
  "deep learning": "python",
  pytorch: "python",
  tensorflow: "python",
  pandas: "python",
  "spring boot": "java",
  spring: "java"
};

// ─── PSEUDO-RANDOM SEED SHUFFLE ───────────────────────────────────────────────

function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

/**
 * Shuffles an array deterministically given a numeric seed (or randomly if seed is absent).
 */
function shuffleArray<T>(array: T[], seed?: number): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const r = seed !== undefined ? seededRandom(seed + i) : Math.random();
    const j = Math.floor(r * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Resolves a normalized skill identifier to its primary question bank key.
 */
export function resolveSkillKey(skillName: string): string {
  if (!skillName) return "python";
  const normalized = skillName.toLowerCase().trim();
  if (QUESTION_BANKS[normalized]) return normalized;
  if (SKILL_ALIASES[normalized]) return SKILL_ALIASES[normalized];
  for (const key of Object.keys(QUESTION_BANKS)) {
    if (normalized.includes(key)) return key;
  }
  return "python";
}

/**
 * Generates randomized assessment content for a specific user and skill.
 *
 * Requirements met:
 * 1. React has React MCQs & coding challenge.
 * 2. Java has Java MCQs & coding challenge.
 * 3. Questions are selected and shuffled dynamically per user/seed.
 * 4. Option choices are shuffled while maintaining the correct answer index.
 */
export function getAssessmentContent(skillName: string, userSeed?: string | number): AssessmentContent {
  const key = resolveSkillKey(skillName);
  const bank = QUESTION_BANKS[key] || QUESTION_BANKS.python;

  let seedNum = typeof userSeed === "number" ? userSeed : Date.now();
  if (typeof userSeed === "string") {
    seedNum = userSeed.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  }

  // 1. Shuffle and pick MCQs
  const shuffledPool = shuffleArray(bank.mcqPool, seedNum);
  const selectedMcqs = shuffledPool.slice(0, Math.min(3, shuffledPool.length));

  // 2. Shuffle option choices for each MCQ while preserving the correct answer
  const randomizedMcqs: MCQ[] = selectedMcqs.map((mcq, mIdx) => {
    const correctAnswerText = mcq.options[mcq.answerIndex];
    const shuffledOptions = shuffleArray(mcq.options, seedNum + mIdx * 17);
    const newAnswerIndex = shuffledOptions.indexOf(correctAnswerText);
    return {
      question: mcq.question,
      options: shuffledOptions,
      answerIndex: newAnswerIndex,
      explanation: mcq.explanation,
    };
  });

  // 3. Pick a coding challenge
  const codingPool = bank.codingPool;
  const codingIndex = Math.abs(seedNum) % codingPool.length;
  const selectedCoding = codingPool[codingIndex] || codingPool[0];

  return {
    mcqs: randomizedMcqs,
    coding: selectedCoding,
  };
}
