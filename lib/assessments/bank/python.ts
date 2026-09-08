// SERVER-ONLY — contains correct answers and all 50 test cases per question.
// Never import this in client components, pages, or any file reachable from the browser bundle.

import type { SkillBank, CodingQuestion, MCQQuestion, TestCase } from "./types";

// ─── Stress Test Generators ────────────────────────────────────────────────────

function genTransactionStress(): TestCase[] {
  const out: TestCase[] = [];
  for (let i = 21; i <= 45; i++) {
    const rows = i * 4;
    const lines: string[] = [];
    const exp: Record<string, number> = {};
    for (let r = 0; r < rows; r++) {
      const uid = `user_${r % Math.max(1, Math.floor(i / 4))}`;
      const amt = Math.round((r + 1) * 2.0 * 1000) / 1000;
      const st = r % 2 === 0 ? "COMPLETED" : "FAILED";
      lines.push(`tx_${i}_${r},${uid},${amt},${st}`);
      if (st === "COMPLETED") exp[uid] = Math.round(((exp[uid] || 0) + amt) * 10000) / 10000;
    }
    out.push({ name: `Hidden ${i}: Stress batch (${rows} rows)`, inputArgs: [lines.join("\n")], expected: exp });
  }
  return out;
}

function genAovStress(): TestCase[] {
  const out: TestCase[] = [];
  for (let i = 21; i <= 45; i++) {
    const orders: string[] = [];
    const totals: Record<string, number> = {};
    const counts: Record<string, number> = {};
    for (let r = 1; r <= i; r++) {
      const u = `usr_${r % 5}`;
      const amt = r * 10.0;
      orders.push(`ord_${r},${u},${amt},SUCCESS`);
      totals[u] = (totals[u] || 0) + amt;
      counts[u] = (counts[u] || 0) + 1;
    }
    const exp: Record<string, number> = {};
    for (const u of Object.keys(totals)) exp[u] = Math.round((totals[u] / counts[u]) * 100) / 100;
    out.push({ name: `Hidden ${i}: AOV stress (${i} orders)`, inputArgs: [orders.join("\n")], expected: exp });
  }
  return out;
}

function genMinMaxStress(): TestCase[] {
  const out: TestCase[] = [];
  for (let n = 21; n <= 45; n++) {
    const arr = Array.from({ length: n }, (_, i) => i * 1.0);
    const scaled = arr.map(x => (n > 1 ? x / (n - 1) : 0.0));
    out.push({ name: `Hidden ${n}: Range 0..${n - 1}`, inputArgs: [arr], expected: scaled });
  }
  return out;
}

function genTopKStress(): TestCase[] {
  const out: TestCase[] = [];
  for (let n = 21; n <= 45; n++) {
    const nums = Array.from({ length: n }, (_, i) => i % 5);
    const firstOcc: Record<number, number> = {};
    const freq: Record<number, number> = {};
    nums.forEach((v, i) => { freq[v] = (freq[v] || 0) + 1; if (firstOcc[v] === undefined) firstOcc[v] = i; });
    const sorted = Object.keys(freq).map(Number)
      .sort((a, b) => freq[b] - freq[a] || firstOcc[a] - firstOcc[b]);
    out.push({ name: `Hidden ${n}: TopK k=3 from n=${n}`, inputArgs: [nums, 3], expected: sorted.slice(0, 3) });
  }
  return out;
}

function genMergeStress(): TestCase[] {
  const out: TestCase[] = [];
  for (let n = 21; n <= 45; n++) {
    const ivs = Array.from({ length: n }, (_, i) => [i * 3, i * 3 + 1]);
    out.push({ name: `Hidden ${n}: ${n} non-overlapping`, inputArgs: [ivs], expected: ivs });
  }
  return out;
}

function genConsecutiveStress(): TestCase[] {
  const out: TestCase[] = [];
  for (let n = 21; n <= 45; n++) {
    const nums = Array.from({ length: n }, (_, i) => i);
    out.push({ name: `Hidden ${n}: Consecutive 0..${n - 1}`, inputArgs: [nums], expected: n });
  }
  return out;
}

function genFizzBuzzStress(): TestCase[] {
  const out: TestCase[] = [];
  for (let n = 21; n <= 45; n++) {
    const fizz = 3, buzz = 7;
    out.push({
      name: `Hidden ${n}: n=${n} fizz=3 buzz=7`,
      inputArgs: [n, fizz, buzz],
      expected: Array.from({ length: n }, (_, i) => {
        const v = i + 1;
        if (v % fizz === 0 && v % buzz === 0) return "FizzBuzz";
        if (v % fizz === 0) return "Fizz";
        if (v % buzz === 0) return "Buzz";
        return String(v);
      }),
    });
  }
  return out;
}

function genRotateStress(): TestCase[] {
  const out: TestCase[] = [];
  for (let n = 21; n <= 45; n++) {
    const arr = Array.from({ length: n }, (_, i) => i + 1);
    const k = (n * 3 + 1) % n;
    const eff = k === 0 ? 0 : k;
    const expected = eff === 0 ? arr.slice() : [...arr.slice(arr.length - eff), ...arr.slice(0, arr.length - eff)];
    out.push({ name: `Hidden ${n}: len=${n} k=${k}`, inputArgs: [arr, k], expected });
  }
  return out;
}

function genWordFreqStress(): TestCase[] {
  const out: TestCase[] = [];
  for (let n = 21; n <= 45; n++) {
    const words = Array.from({ length: n }, (_, i) => (i % 5 === 0 ? "common" : `word${i}`));
    const freq: Record<string, number> = {};
    for (const w of words) freq[w] = (freq[w] || 0) + 1;
    out.push({ name: `Hidden ${n}: ${n} words`, inputArgs: [words.join(" ")], expected: freq });
  }
  return out;
}

// ─── EASY QUESTIONS (pool of 5) ────────────────────────────────────────────────

const easyQuestions: CodingQuestion[] = [
  {
    id: "py_easy_001",
    difficulty: "easy",
    title: "Aggregate Completed Transaction Totals",
    functionName: "process_transactions",
    instructions: `You are given a raw CSV string where each line represents a payment transaction:

  \`<tx_id>,<user_id>,<amount>,<status>\`

Write a function **process_transactions(csv_string: str) -> dict** that:
1. Parses each line (skip malformed rows — fewer than 4 columns or non-numeric amount)
2. Filters to only rows where status == **"COMPLETED"** (exact, case-sensitive)
3. Returns **{user_id: total_amount}** — sum of all completed amounts per user

**Example**
- Input: \`"tx1,alice,10.5,COMPLETED\\ntx2,bob,5.0,COMPLETED\\ntx3,alice,4.5,COMPLETED"\`
- Output: \`{"alice": 15.0, "bob": 5.0}\``,
    starterCode: {
      python: `def process_transactions(csv_string: str) -> dict:
    """
    Parse CSV transactions, filter COMPLETED status, sum amounts by user.
    :param csv_string: raw multi-line CSV string
    :return: dict of {user_id: total_amount (float)}
    """
    # Write your solution here
    pass
`,
    },
    supportedLanguages: [{ id: "python", name: "Python 3" }],
    publicTests: [
      { name: "Test 1: Happy Path", inputArgs: ["tx1,alice,10.5,COMPLETED\ntx2,bob,5.0,COMPLETED\ntx3,alice,4.5,COMPLETED"], expected: { alice: 15.0, bob: 5.0 } },
      { name: "Test 2: Status Filtering", inputArgs: ["t1,u1,10,COMPLETED\nt2,u2,20,FAILED\nt3,u1,5,PENDING\nt4,u3,15,REFUNDED"], expected: { u1: 10.0 } },
      { name: "Test 3: Empty Input", inputArgs: [""], expected: {} },
      { name: "Test 4: Malformed Rows Skipped", inputArgs: ["t1,u1,10,COMPLETED\nBADROW\nt2,u2,5,COMPLETED\nt3,u1,bad_amount,COMPLETED"], expected: { u1: 10.0, u2: 5.0 } },
      { name: "Test 5: Negatives & Float Precision", inputArgs: ["t1,u1,-5.5,COMPLETED\nt2,u1,10.25,COMPLETED\nt3,u2,0.001,COMPLETED"], expected: { u1: 4.75, u2: 0.001 } },
    ],
    hiddenTests: [
      { name: "H1: Single row", inputArgs: ["tx100,alpha,99.99,COMPLETED"], expected: { alpha: 99.99 } },
      { name: "H2: Zero amount", inputArgs: ["tx1,u1,0.0,COMPLETED\ntx2,u1,0,COMPLETED"], expected: { u1: 0.0 } },
      { name: "H3: All failed/pending", inputArgs: ["tx1,u1,50,FAILED\ntx2,u2,100,PENDING\ntx3,u3,200,VOID"], expected: {} },
      { name: "H4: Case sensitivity (lowercase rejected)", inputArgs: ["tx1,u1,100,completed\ntx2,u2,50,COMPLETED"], expected: { u2: 50.0 } },
      { name: "H5: CRLF line endings", inputArgs: ["tx1,u1,10,COMPLETED\r\ntx2,u2,20,COMPLETED"], expected: { u1: 10.0, u2: 20.0 } },
      { name: "H6: Whitespace around delimiters", inputArgs: ["tx1 , u1 , 25.5 , COMPLETED"], expected: { u1: 25.5 } },
      { name: "H7: Extra columns ignored", inputArgs: ["tx1,u1,10,COMPLETED,extra,bar\ntx2,u2,20,COMPLETED,2024"], expected: { u1: 10.0, u2: 20.0 } },
      { name: "H8: Truncated row (no status)", inputArgs: ["tx1,u1,10\ntx2,u2,20,COMPLETED"], expected: { u2: 20.0 } },
      { name: "H9: Net zero (+50, -50)", inputArgs: ["tx1,u1,50.0,COMPLETED\ntx2,u1,-50.0,COMPLETED"], expected: { u1: 0.0 } },
      { name: "H10: Scientific notation (1e2)", inputArgs: ["tx1,u1,1e2,COMPLETED\ntx2,u1,50,COMPLETED"], expected: { u1: 150.0 } },
      { name: "H11: Blank lines", inputArgs: ["tx1,u1,10,COMPLETED\n\n\ntx2,u2,30,COMPLETED\n\n"], expected: { u1: 10.0, u2: 30.0 } },
      { name: "H12: Email as user ID", inputArgs: ["tx1,john@co.org,88.5,COMPLETED"], expected: { "john@co.org": 88.5 } },
      { name: "H13: High value $10M", inputArgs: ["tx1,whale,10000000.0,COMPLETED"], expected: { whale: 10000000.0 } },
      { name: "H14: Decimal without leading zero (.75)", inputArgs: ["tx1,u1,.75,COMPLETED\ntx2,u1,.25,COMPLETED"], expected: { u1: 1.0 } },
      { name: "H15: All corrupted → empty", inputArgs: ["CORRUPT\nLINE_TWO\n1234,foo\n,,,,\n"], expected: {} },
      { name: "H16: Repeated tx IDs allowed", inputArgs: ["tx1,u1,10,COMPLETED\ntx1,u1,10,COMPLETED"], expected: { u1: 20.0 } },
      { name: "H17: Status CANCELLED filtered", inputArgs: ["tx1,u1,100,CANCELLED\ntx2,u2,40,COMPLETED"], expected: { u2: 40.0 } },
      { name: "H18: 10 interleaved users", inputArgs: [Array.from({ length: 20 }, (_, i) => `tx${i},u${i % 10},${i * 2.5},COMPLETED`).join("\n")], expected: Object.fromEntries(Array.from({ length: 10 }, (_, k) => [`u${k}`, Array.from({ length: 20 }, (_, i) => i).filter(i => i % 10 === k).reduce((s, i) => s + i * 2.5, 0)])) },
      { name: "H19: 25 micro-charges single user", inputArgs: [Array.from({ length: 25 }, (_, i) => `tx${i},micro,1.25,COMPLETED`).join("\n")], expected: { micro: 31.25 } },
      { name: "H20: Sub-cent precision", inputArgs: ["tx1,u1,0.0001,COMPLETED\ntx2,u1,0.0002,COMPLETED"], expected: { u1: 0.0003 } },
      ...genTransactionStress(),
    ],
  },

  {
    id: "py_easy_002",
    difficulty: "easy",
    title: "Word Frequency Counter",
    functionName: "word_frequency",
    instructions: `Write a function **word_frequency(text: str) -> dict** that:
1. Splits the text into words (on any whitespace)
2. Normalises to **lowercase**
3. Strips leading/trailing punctuation from each word (\`.,!?;:"'()[]{}\`)
4. Returns **{word: count}** for each unique word
5. Words that become empty after stripping are ignored

**Example**
- Input: \`"Hello, world! Hello."\`
- Output: \`{"hello": 2, "world": 1}\``,
    starterCode: {
      python: `def word_frequency(text: str) -> dict:
    """
    Count word frequencies, case-insensitive, strip punctuation.
    :param text: input text string
    :return: dict of {word: count}
    """
    # Write your solution here
    pass
`,
    },
    supportedLanguages: [{ id: "python", name: "Python 3" }],
    publicTests: [
      { name: "Test 1: Basic repetition", inputArgs: ["hello world hello"], expected: { hello: 2, world: 1 } },
      { name: "Test 2: Case insensitive", inputArgs: ["Hello HELLO hello"], expected: { hello: 3 } },
      { name: "Test 3: Empty string", inputArgs: [""], expected: {} },
      { name: "Test 4: No repetition", inputArgs: ["the quick brown fox"], expected: { the: 1, quick: 1, brown: 1, fox: 1 } },
      { name: "Test 5: Punctuation stripped", inputArgs: ["hello, world! hello."], expected: { hello: 2, world: 1 } },
    ],
    hiddenTests: [
      { name: "H1: Tabs and newlines", inputArgs: ["word1\tword2\nword1"], expected: { word1: 2, word2: 1 } },
      { name: "H2: Numbers as words", inputArgs: ["1 2 3 1 2"], expected: { "1": 2, "2": 2, "3": 1 } },
      { name: "H3: Single word", inputArgs: ["python"], expected: { python: 1 } },
      { name: "H4: All same", inputArgs: ["go go go go go"], expected: { go: 5 } },
      { name: "H5: Mixed punctuation", inputArgs: ["end. end... end!"], expected: { end: 3 } },
      { name: "H6: Only whitespace", inputArgs: ["   \t\n  "], expected: {} },
      { name: "H7: Semicolons and colons", inputArgs: ["python: fast; python; slow?"], expected: { python: 2, fast: 1, slow: 1 } },
      { name: "H8: Mixed case + punctuation", inputArgs: ["Python. PYTHON! python?"], expected: { python: 3 } },
      { name: "H9: Lone punctuation ignored", inputArgs: [", . ! a b"], expected: { a: 1, b: 1 } },
      { name: "H10: Trailing leading spaces", inputArgs: ["  hello world  "], expected: { hello: 1, world: 1 } },
      { name: "H11: Comma-separated words", inputArgs: ["a, a, a, b"], expected: { a: 3, b: 1 } },
      { name: "H12: Parentheses stripped", inputArgs: ["(brackets) [square] {curly}"], expected: { brackets: 1, square: 1, curly: 1 } },
      { name: "H13: Repeated commas + colon", inputArgs: ["hello:world hello:world"], expected: { "hello:world": 2 } },
      { name: "H14: Question marks", inputArgs: ["why? why? because!"], expected: { why: 2, because: 1 } },
      { name: "H15: Long sentence 10 words", inputArgs: ["the cat sat on the mat the cat sat here"], expected: { the: 3, cat: 2, sat: 2, on: 1, mat: 1, here: 1 } },
      { name: "H16: Quotes stripped", inputArgs: ['"hello" "hello" world'], expected: { hello: 2, world: 1 } },
      { name: "H17: Exclamation in middle preserved? (strip only leading/trailing)", inputArgs: ["can't stop won't stop"], expected: { "can't": 1, stop: 2, "won't": 1 } },
      { name: "H18: Mixed numbers and words", inputArgs: ["py3 py3 py2 py"], expected: { py3: 2, py2: 1, py: 1 } },
      { name: "H19: All punctuation words ignored", inputArgs: ["... !!! ??? , . a"], expected: { a: 1 } },
      { name: "H20: Large identical word", inputArgs: [Array.from({ length: 50 }, () => "repeat").join(" ")], expected: { repeat: 50 } },
      ...genWordFreqStress(),
    ],
  },

  {
    id: "py_easy_003",
    difficulty: "easy",
    title: "Recursive List Flattener",
    functionName: "flatten_list",
    instructions: `Write a function **flatten_list(nested: list) -> list** that:
1. Recursively flattens a list of arbitrarily nested lists
2. Returns a single flat list containing all non-list elements **in order**
3. Handles empty sublists correctly — they contribute no elements

**Example**
- Input: \`[[1, 2], [3, [4, 5]], 6]\`
- Output: \`[1, 2, 3, 4, 5, 6]\``,
    starterCode: {
      python: `def flatten_list(nested: list) -> list:
    """
    Recursively flatten a nested list to any depth.
    :param nested: a list that may contain other lists
    :return: flat list of all non-list elements in order
    """
    # Write your solution here
    pass
`,
    },
    supportedLanguages: [{ id: "python", name: "Python 3" }],
    publicTests: [
      { name: "Test 1: Two-level nesting", inputArgs: [[[1, 2], [3, 4]]], expected: [1, 2, 3, 4] },
      { name: "Test 2: Deep nesting", inputArgs: [[[1, [2, [3, [4]]]]]], expected: [1, 2, 3, 4] },
      { name: "Test 3: Empty list", inputArgs: [[]], expected: [] },
      { name: "Test 4: Already flat", inputArgs: [[1, 2, 3, 4, 5]], expected: [1, 2, 3, 4, 5] },
      { name: "Test 5: Mixed types", inputArgs: [[[1, "a"], [true, null]]], expected: [1, "a", true, null] },
    ],
    hiddenTests: [
      { name: "H1: Empty sublists", inputArgs: [[[], [], []]], expected: [] },
      { name: "H2: Mixed empty and non-empty", inputArgs: [[[], [1], [], [2, 3]]], expected: [1, 2, 3] },
      { name: "H3: Single element deeply nested", inputArgs: [[[[[42]]]]], expected: [42] },
      { name: "H4: Strings nested", inputArgs: [["hello", ["world", ["python"]]]], expected: ["hello", "world", "python"] },
      { name: "H5: Negatives preserved", inputArgs: [[-1, [-2, -3]]], expected: [-1, -2, -3] },
      { name: "H6: Float values", inputArgs: [[1.5, [2.5, [3.5]]]], expected: [1.5, 2.5, 3.5] },
      { name: "H7: Single element list", inputArgs: [[42]], expected: [42] },
      { name: "H8: Wide shallow list", inputArgs: [[[1], [2], [3], [4], [5]]], expected: [1, 2, 3, 4, 5] },
      { name: "H9: Mixed depth", inputArgs: [[1, [2, 3], [[4, 5]], [[[6]]]]], expected: [1, 2, 3, 4, 5, 6] },
      { name: "H10: None values", inputArgs: [[null, [null, [null]]]], expected: [null, null, null] },
      { name: "H11: Zeros and booleans", inputArgs: [[0, [false, [0]]]], expected: [0, false, 0] },
      { name: "H12: Alternating flat and nested", inputArgs: [[1, [2], 3, [4], 5]], expected: [1, 2, 3, 4, 5] },
      { name: "H13: Long flat list (100)", inputArgs: [Array.from({ length: 100 }, (_, i) => i)], expected: Array.from({ length: 100 }, (_, i) => i) },
      { name: "H14: 10-level deep", inputArgs: [[[[[[[[[[[99]]]]]]]]]]], expected: [99] },
      { name: "H15: Mixed string and number deep", inputArgs: [["a", [1, ["b", [2]]]]], expected: ["a", 1, "b", 2] },
      ...Array.from({ length: 20 }, (_, i): TestCase => {
        const depth = (i % 4) + 2;
        const size = i + 4;
        let nested: unknown = Array.from({ length: size }, (_, j) => j);
        for (let d = 0; d < depth; d++) nested = [nested];
        return { name: `H${i + 26}: depth=${depth} size=${size}`, inputArgs: [nested], expected: Array.from({ length: size }, (_, j) => j) };
      }),
    ],
  },

  {
    id: "py_easy_004",
    difficulty: "easy",
    title: "Custom FizzBuzz",
    functionName: "fizzbuzz_custom",
    instructions: `Write a function **fizzbuzz_custom(n: int, fizz_div: int, buzz_div: int) -> list** that:
1. Generates a list of strings for integers **1 through n** (inclusive)
2. Multiple of \`fizz_div\` → **"Fizz"**
3. Multiple of \`buzz_div\` → **"Buzz"**
4. Multiple of **both** → **"FizzBuzz"**
5. Otherwise → the integer as a string

**Example**
- Input: \`n=15, fizz_div=3, buzz_div=5\`
- Output: \`["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]\``,
    starterCode: {
      python: `def fizzbuzz_custom(n: int, fizz_div: int, buzz_div: int) -> list:
    """
    Custom FizzBuzz with configurable divisors.
    :param n: count from 1 to n inclusive
    :param fizz_div: Fizz divisor
    :param buzz_div: Buzz divisor
    :return: list of strings
    """
    # Write your solution here
    pass
`,
    },
    supportedLanguages: [{ id: "python", name: "Python 3" }],
    publicTests: [
      { name: "Test 1: Classic (3,5)", inputArgs: [15, 3, 5], expected: ["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"] },
      { name: "Test 2: fizz=2 buzz=3 n=4", inputArgs: [4, 2, 3], expected: ["1","Fizz","Buzz","Fizz"] },
      { name: "Test 3: n=1", inputArgs: [1, 3, 5], expected: ["1"] },
      { name: "Test 4: fizz==buzz (every n is FizzBuzz)", inputArgs: [5, 5, 5], expected: ["1","2","3","4","FizzBuzz"] },
      { name: "Test 5: fizz=2 buzz=6 n=6", inputArgs: [6, 2, 6], expected: ["1","Fizz","Buzz","Fizz","5","FizzBuzz"] },
    ],
    hiddenTests: [
      { name: "H1: n=0 → empty", inputArgs: [0, 3, 5], expected: [] },
      { name: "H2: fizz=1 → every num is Fizz unless also buzz", inputArgs: [6, 1, 3], expected: ["FizzBuzz","Fizz","FizzBuzz","Fizz","Fizz","FizzBuzz"] },
      { name: "H3: n=1 fizz=1 buzz=1 → FizzBuzz", inputArgs: [1, 1, 1], expected: ["FizzBuzz"] },
      { name: "H4: All non-multiples (large divisors)", inputArgs: [7, 11, 13], expected: ["1","2","3","4","5","6","7"] },
      { name: "H5: n=30 classic", inputArgs: [30, 3, 5], expected: Array.from({ length: 30 }, (_, i) => { const v = i + 1; if (v % 15 === 0) return "FizzBuzz"; if (v % 3 === 0) return "Fizz"; if (v % 5 === 0) return "Buzz"; return String(v); }) },
      { name: "H6: n=77 fizz=7 buzz=11", inputArgs: [77, 7, 11], expected: Array.from({ length: 77 }, (_, i) => { const v = i + 1; if (v % 7 === 0 && v % 11 === 0) return "FizzBuzz"; if (v % 7 === 0) return "Fizz"; if (v % 11 === 0) return "Buzz"; return String(v); }) },
      { name: "H7: n=12 fizz=4 buzz=6", inputArgs: [12, 4, 6], expected: Array.from({ length: 12 }, (_, i) => { const v = i + 1; if (v % 4 === 0 && v % 6 === 0) return "FizzBuzz"; if (v % 4 === 0) return "Fizz"; if (v % 6 === 0) return "Buzz"; return String(v); }) },
      { name: "H8: n=100 fizz=3 buzz=5", inputArgs: [100, 3, 5], expected: Array.from({ length: 100 }, (_, i) => { const v = i + 1; if (v % 15 === 0) return "FizzBuzz"; if (v % 3 === 0) return "Fizz"; if (v % 5 === 0) return "Buzz"; return String(v); }) },
      { name: "H9: n=2 fizz=2 buzz=4", inputArgs: [2, 2, 4], expected: ["1","Fizz"] },
      { name: "H10: n=4 fizz=4 buzz=4", inputArgs: [4, 4, 4], expected: ["1","2","3","FizzBuzz"] },
      ...Array.from({ length: 20 }, (_, i): TestCase => {
        const n = 15 + i; const fizz = 3; const buzz = 7;
        return { name: `H${i + 26}: n=${n} fizz=3 buzz=7`, inputArgs: [n, fizz, buzz], expected: Array.from({ length: n }, (_, j) => { const v = j + 1; if (v % fizz === 0 && v % buzz === 0) return "FizzBuzz"; if (v % fizz === 0) return "Fizz"; if (v % buzz === 0) return "Buzz"; return String(v); }) };
      }),
    ],
  },

  {
    id: "py_easy_005",
    difficulty: "easy",
    title: "Rotate List Right by K",
    functionName: "rotate_list",
    instructions: `Write a function **rotate_list(nums: list, k: int) -> list** that:
1. Rotates the list to the **right** by k positions
2. Does NOT modify the input list — return a **new list**
3. Handles k larger than list length (wraps around)
4. Returns an empty list for empty input

**Example**
- Input: \`nums=[1,2,3,4,5], k=2\`
- Output: \`[4,5,1,2,3]\` — the last 2 elements wrap to the front`,
    starterCode: {
      python: `def rotate_list(nums: list, k: int) -> list:
    """
    Rotate list right by k positions.
    :param nums: input list
    :param k: number of positions to rotate right
    :return: new rotated list (input unchanged)
    """
    # Write your solution here
    pass
`,
    },
    supportedLanguages: [{ id: "python", name: "Python 3" }],
    publicTests: [
      { name: "Test 1: Standard k=2", inputArgs: [[1,2,3,4,5], 2], expected: [4,5,1,2,3] },
      { name: "Test 2: Full rotation (k=len)", inputArgs: [[1,2,3], 3], expected: [1,2,3] },
      { name: "Test 3: Empty list", inputArgs: [[], 5], expected: [] },
      { name: "Test 4: Single element k=100", inputArgs: [[1], 100], expected: [1] },
      { name: "Test 5: k=0 no rotation", inputArgs: [[1,2,3,4], 0], expected: [1,2,3,4] },
    ],
    hiddenTests: [
      { name: "H1: k > len wraps", inputArgs: [[1,2,3], 7], expected: [3,1,2] },
      { name: "H2: k=2*len full wrap", inputArgs: [[1,2,3,4], 8], expected: [1,2,3,4] },
      { name: "H3: Two elements k=1", inputArgs: [[1,2], 1], expected: [2,1] },
      { name: "H4: String elements", inputArgs: [["a","b","c","d"], 2], expected: ["c","d","a","b"] },
      { name: "H5: Mixed types", inputArgs: [[1,"a",true,null], 1], expected: [null,1,"a",true] },
      { name: "H6: k=1 moves last to front", inputArgs: [[10,20,30,40,50], 1], expected: [50,10,20,30,40] },
      { name: "H7: Float values", inputArgs: [[1.5,2.5,3.5], 2], expected: [2.5,3.5,1.5] },
      { name: "H8: Negative numbers", inputArgs: [[-1,-2,-3,-4], 2], expected: [-3,-4,-1,-2] },
      { name: "H9: Large k=999 on len=3", inputArgs: [[1,2,3], 999], expected: [1,2,3] },
      { name: "H10: k=len-1", inputArgs: [[1,2,3,4,5], 4], expected: [2,3,4,5,1] },
      { name: "H11: Zeros", inputArgs: [[0,0,0,1], 1], expected: [1,0,0,0] },
      { name: "H12: Booleans", inputArgs: [[true,false,true], 1], expected: [true,true,false] },
      { name: "H13: Duplicates", inputArgs: [[3,3,3,1], 1], expected: [1,3,3,3] },
      { name: "H14: Long list k=10", inputArgs: [Array.from({length:20},(_,i)=>i), 10], expected: [...Array.from({length:20},(_,i)=>i).slice(10), ...Array.from({length:20},(_,i)=>i).slice(0,10)] },
      { name: "H15: k=len+1", inputArgs: [[1,2,3,4,5], 6], expected: [5,1,2,3,4] },
      ...genRotateStress(),
    ],
  },
];

// ─── MEDIUM-HARD QUESTIONS (pool of 5) ─────────────────────────────────────────

const mediumHardQuestions: CodingQuestion[] = [
  {
    id: "py_medium_001",
    difficulty: "medium_hard",
    title: "Average Order Value per Customer",
    functionName: "calculate_aov",
    instructions: `You are given a CSV string of customer orders:

  \`<order_id>,<customer_id>,<order_total>,<status>\`

Write a function **calculate_aov(csv_string: str) -> dict** that:
1. Parses each line, silently skips malformed rows
2. Includes only rows where status == **"SUCCESS"** (exact, case-sensitive)
3. For each customer computes: **AOV = sum(order_totals) / count(orders)**
4. Returns **{customer_id: aov}** rounded to **2 decimal places**
5. Customers with zero successful orders must **NOT** appear in the output

**Example**
- Input: \`"o1,alice,10.0,SUCCESS\\no2,bob,20.0,SUCCESS\\no3,alice,30.0,SUCCESS"\`
- Output: \`{"alice": 20.0, "bob": 20.0}\``,
    starterCode: {
      python: `def calculate_aov(csv_string: str) -> dict:
    """
    Compute Average Order Value per customer for SUCCESS orders only.
    :param csv_string: raw multi-line CSV string
    :return: dict of {customer_id: aov} rounded to 2 decimal places
    """
    # Your implementation here
    pass
`,
    },
    supportedLanguages: [{ id: "python", name: "Python 3" }],
    publicTests: [
      { name: "Test 1: Standard AOV", inputArgs: ["o1,alice,10.0,SUCCESS\no2,bob,20.0,SUCCESS\no3,alice,30.0,SUCCESS"], expected: { alice: 20.0, bob: 20.0 } },
      { name: "Test 2: Mixed statuses", inputArgs: ["o1,alice,10,SUCCESS\no2,bob,20,REFUNDED\no3,alice,5,FAILED"], expected: { alice: 10.0 } },
      { name: "Test 3: Empty input", inputArgs: [""], expected: {} },
      { name: "Test 4: Malformed rows skipped", inputArgs: ["o1,alice,10,SUCCESS\nBADROW\no2,bob,5,SUCCESS\no3,alice,bad,SUCCESS"], expected: { alice: 10.0, bob: 5.0 } },
      { name: "Test 5: Float precision (5.5+4.5)/2=5.0", inputArgs: ["o1,alice,5.5,SUCCESS\no2,alice,4.5,SUCCESS"], expected: { alice: 5.0 } },
    ],
    hiddenTests: [
      { name: "H1: Single order (AOV=total)", inputArgs: ["o1,solo,99.99,SUCCESS"], expected: { solo: 99.99 } },
      { name: "H2: Zero-success customers omitted", inputArgs: ["o1,u1,100,FAILED\no2,u2,50,SUCCESS"], expected: { u2: 50.0 } },
      { name: "H3: All REFUNDED → empty", inputArgs: ["o1,u1,100,REFUNDED\no2,u2,200,REFUNDED"], expected: {} },
      { name: "H4: Case sensitive SUCCESS", inputArgs: ["o1,u1,100,success\no2,u2,50,SUCCESS"], expected: { u2: 50.0 } },
      { name: "H5: CRLF line endings", inputArgs: ["o1,u1,10,SUCCESS\r\no2,u2,20,SUCCESS"], expected: { u1: 10.0, u2: 20.0 } },
      { name: "H6: Whitespace around values", inputArgs: ["o1 , u1 , 15.5 , SUCCESS"], expected: { u1: 15.5 } },
      { name: "H7: Extra columns ignored", inputArgs: ["o1,u1,10,SUCCESS,extra\no2,u2,20,SUCCESS,more"], expected: { u1: 10.0, u2: 20.0 } },
      { name: "H8: Truncated row (no status)", inputArgs: ["o1,u1,10\no2,u2,20,SUCCESS"], expected: { u2: 20.0 } },
      { name: "H9: Zero amount orders", inputArgs: ["o1,u1,0,SUCCESS\no2,u1,0,SUCCESS"], expected: { u1: 0.0 } },
      { name: "H10: Large totals", inputArgs: ["o1,corp,1000000.0,SUCCESS\no2,corp,2000000.0,SUCCESS"], expected: { corp: 1500000.0 } },
      { name: "H11: 3 customers 2 orders each", inputArgs: ["o1,a,10,SUCCESS\no2,a,20,SUCCESS\no3,b,30,SUCCESS\no4,b,40,SUCCESS\no5,c,50,SUCCESS\no6,c,60,SUCCESS"], expected: { a: 15.0, b: 35.0, c: 55.0 } },
      { name: "H12: Scientific notation", inputArgs: ["o1,u1,1e3,SUCCESS\no2,u1,500,SUCCESS"], expected: { u1: 750.0 } },
      { name: "H13: Decimal without leading zero", inputArgs: ["o1,u1,.5,SUCCESS\no2,u1,.5,SUCCESS"], expected: { u1: 0.5 } },
      { name: "H14: Only whitespace rows", inputArgs: ["   \n  \n  "], expected: {} },
      { name: "H15: Customer with mixed success/fail (only success counted in AOV)", inputArgs: ["o1,u1,10,SUCCESS\no2,u1,100,FAILED\no3,u1,20,SUCCESS"], expected: { u1: 15.0 } },
      ...genAovStress(),
    ],
  },

  {
    id: "py_medium_002",
    difficulty: "medium_hard",
    title: "Min-Max Normalization",
    functionName: "min_max_scale",
    instructions: `Write a function **min_max_scale(values: list) -> list** that:
1. Applies Min-Max normalisation to a list of numbers
2. Formula: **scaled = (x − min) / (max − min)** for each value
3. If all values are **identical** (zero variance), return a list of **0.0** for each element
4. Returns an empty list for empty input

**Example**
- Input: \`[10.0, 20.0, 30.0, 40.0, 50.0]\`
- Output: \`[0.0, 0.25, 0.5, 0.75, 1.0]\``,
    starterCode: {
      python: `def min_max_scale(values: list) -> list:
    """
    Apply Min-Max normalisation. Zero variance → all 0.0.
    :param values: list of numeric values
    :return: list of floats in range [0.0, 1.0]
    """
    # Your implementation here
    pass
`,
    },
    supportedLanguages: [{ id: "python", name: "Python 3" }],
    publicTests: [
      { name: "Test 1: Standard 5-point range", inputArgs: [[10.0, 20.0, 30.0, 40.0, 50.0]], expected: [0.0, 0.25, 0.5, 0.75, 1.0] },
      { name: "Test 2: Negative to positive", inputArgs: [[-10.0, 0.0, 10.0]], expected: [0.0, 0.5, 1.0] },
      { name: "Test 3: Empty list", inputArgs: [[]], expected: [] },
      { name: "Test 4: Zero variance (all same)", inputArgs: [[5.0, 5.0, 5.0]], expected: [0.0, 0.0, 0.0] },
      { name: "Test 5: Two elements", inputArgs: [[100.0, 200.0]], expected: [0.0, 1.0] },
    ],
    hiddenTests: [
      { name: "H1: Single element → 0.0", inputArgs: [[42.0]], expected: [0.0] },
      { name: "H2: Integers", inputArgs: [[1, 2, 3, 4, 5]], expected: [0.0, 0.25, 0.5, 0.75, 1.0] },
      { name: "H3: Already [0,1]", inputArgs: [[0.0, 0.5, 1.0]], expected: [0.0, 0.5, 1.0] },
      { name: "H4: All negative", inputArgs: [[-5.0, -3.0, -1.0]], expected: [0.0, 0.5, 1.0] },
      { name: "H5: Large range", inputArgs: [[0, 1000000]], expected: [0.0, 1.0] },
      { name: "H6: Min at end", inputArgs: [[10, 5, 15, 0]], expected: [10/15, 5/15, 1.0, 0.0] },
      { name: "H7: Repeated min value", inputArgs: [[0, 0, 10, 20]], expected: [0.0, 0.0, 0.5, 1.0] },
      { name: "H8: Repeated max value", inputArgs: [[0, 10, 20, 20]], expected: [0.0, 0.5, 1.0, 1.0] },
      { name: "H9: Two zeros", inputArgs: [[0, 0]], expected: [0.0, 0.0] },
      { name: "H10: Negative all same", inputArgs: [[-3, -3, -3]], expected: [0.0, 0.0, 0.0] },
      { name: "H11: Very small range", inputArgs: [[1.0, 1.1, 1.2]], expected: [0.0, 0.5, 1.0] },
      { name: "H12: Descending input", inputArgs: [[100, 75, 50, 25, 0]], expected: [1.0, 0.75, 0.5, 0.25, 0.0] },
      { name: "H13: Mixed int and float", inputArgs: [[0, 0.5, 1]], expected: [0.0, 0.5, 1.0] },
      { name: "H14: Power of 2 range", inputArgs: [[1, 2, 4, 8, 16]], expected: [0.0, 1/15, 3/15, 7/15, 1.0] },
      { name: "H15: 10-element float array", inputArgs: [Array.from({ length: 10 }, (_, i) => i * 1.5)], expected: Array.from({ length: 10 }, (_, i) => i / 9) },
      ...genMinMaxStress(),
    ],
  },

  {
    id: "py_medium_003",
    difficulty: "medium_hard",
    title: "Top K Frequent Elements",
    functionName: "top_k_frequent",
    instructions: `Write a function **top_k_frequent(nums: list, k: int) -> list** that:
1. Returns the **k most frequently occurring** elements in nums
2. Ties in frequency are broken by **first occurrence** (earlier index = higher priority)
3. Result is ordered by **descending frequency**

**Example**
- Input: \`nums=[1,1,1,2,2,3], k=2\`
- Output: \`[1, 2]\` — 1 appears 3×, 2 appears 2×`,
    starterCode: {
      python: `def top_k_frequent(nums: list, k: int) -> list:
    """
    Return k most frequent elements, desc by frequency.
    Ties broken by first occurrence (earlier = higher priority).
    :param nums: input list
    :param k: how many top elements to return
    :return: list of k elements
    """
    # Your implementation here
    pass
`,
    },
    supportedLanguages: [{ id: "python", name: "Python 3" }],
    publicTests: [
      { name: "Test 1: Classic example", inputArgs: [[1,1,1,2,2,3], 2], expected: [1, 2] },
      { name: "Test 2: Single element k=1", inputArgs: [[4], 1], expected: [4] },
      { name: "Test 3: Equal frequencies k=2", inputArgs: [[1,2], 2], expected: [1, 2] },
      { name: "Test 4: Clear winner k=1", inputArgs: [[1,1,2,2,3,3,3], 1], expected: [3] },
      { name: "Test 5: Tie-breaking by first occurrence", inputArgs: [[5,4,3,2,1], 3], expected: [5, 4, 3] },
    ],
    hiddenTests: [
      { name: "H1: All same k=1", inputArgs: [[7,7,7,7], 1], expected: [7] },
      { name: "H2: k equals unique count", inputArgs: [[1,2,3,4,5], 5], expected: [1,2,3,4,5] },
      { name: "H3: Strings as elements", inputArgs: [["apple","banana","apple","cherry","banana","apple"], 2], expected: ["apple","banana"] },
      { name: "H4: Negative numbers", inputArgs: [[-1,-2,-1,-3,-2,-1], 2], expected: [-1, -2] },
      { name: "H5: Mixed freqs k=3", inputArgs: [[1,2,2,3,3,3,4,4,4,4], 3], expected: [4,3,2] },
      { name: "H6: Tie → first occurrence wins", inputArgs: [[1,2,1,2], 1], expected: [1] },
      { name: "H7: Boolean elements", inputArgs: [[true,false,true,true,false], 1], expected: [true] },
      { name: "H8: k=1 single unique", inputArgs: [[99], 1], expected: [99] },
      { name: "H9: All unique k=1 → first element", inputArgs: [[10,20,30], 1], expected: [10] },
      { name: "H10: Three-way tie k=3 by first occurrence", inputArgs: [[3,1,2,2,3,1], 3], expected: [3,1,2] },
      { name: "H11: Zero in list", inputArgs: [[0,0,1,2,0], 1], expected: [0] },
      { name: "H12: Floats", inputArgs: [[1.5, 2.5, 1.5, 3.5, 1.5], 2], expected: [1.5, 2.5] },
      { name: "H13: High freq single element", inputArgs: [[...Array.from({length:50}, ():number => 42), 1], 1], expected: [42] },
      { name: "H14: Two-way tie resolved by occurrence", inputArgs: [[2,1,2,1,3,3,4], 2], expected: [2,1] },
      { name: "H15: 100 elements 10 unique all same freq, k=3", inputArgs: [Array.from({length:100},(_,i)=>i%10), 3], expected: [0,1,2] },
      ...genTopKStress(),
    ],
  },

  {
    id: "py_medium_004",
    difficulty: "medium_hard",
    title: "Merge Overlapping Intervals",
    functionName: "merge_intervals",
    instructions: `Write a function **merge_intervals(intervals: list) -> list** that:
1. Takes a list of intervals where each interval is \`[start, end]\` (inclusive)
2. Merges all **overlapping or adjacent** intervals (touching counts as overlapping: \`c <= b\`)
3. Returns the result **sorted by start time**

**Example**
- Input: \`[[1,3],[2,6],[8,10],[15,18]]\`
- Output: \`[[1,6],[8,10],[15,18]]\``,
    starterCode: {
      python: `def merge_intervals(intervals: list) -> list:
    """
    Merge overlapping intervals and return sorted merged list.
    :param intervals: list of [start, end] pairs
    :return: list of merged [start, end] pairs, sorted by start
    """
    # Your implementation here
    pass
`,
    },
    supportedLanguages: [{ id: "python", name: "Python 3" }],
    publicTests: [
      { name: "Test 1: Standard overlapping", inputArgs: [[[1,3],[2,6],[8,10],[15,18]]], expected: [[1,6],[8,10],[15,18]] },
      { name: "Test 2: Adjacent (touching) merges", inputArgs: [[[1,4],[4,5]]], expected: [[1,5]] },
      { name: "Test 3: No overlap", inputArgs: [[[1,2],[3,4],[5,6]]], expected: [[1,2],[3,4],[5,6]] },
      { name: "Test 4: Empty input", inputArgs: [[]], expected: [] },
      { name: "Test 5: Single interval", inputArgs: [[[1,5]]], expected: [[1,5]] },
    ],
    hiddenTests: [
      { name: "H1: All overlapping → one", inputArgs: [[[1,4],[2,5],[3,6]]], expected: [[1,6]] },
      { name: "H2: Unsorted input", inputArgs: [[[15,18],[1,3],[2,6],[8,10]]], expected: [[1,6],[8,10],[15,18]] },
      { name: "H3: Fully contained interval", inputArgs: [[[1,10],[2,5],[7,8]]], expected: [[1,10]] },
      { name: "H4: Same start different end", inputArgs: [[[1,5],[1,3],[1,8]]], expected: [[1,8]] },
      { name: "H5: Gap of 2 (not touching)", inputArgs: [[[1,2],[4,5]]], expected: [[1,2],[4,5]] },
      { name: "H6: Duplicate intervals", inputArgs: [[[1,5],[1,5]]], expected: [[1,5]] },
      { name: "H7: Reverse sorted", inputArgs: [[[5,6],[3,4],[1,2]]], expected: [[1,2],[3,4],[5,6]] },
      { name: "H8: Large overlap span", inputArgs: [[[1,100],[50,150],[120,200]]], expected: [[1,200]] },
      { name: "H9: Point intervals no overlap", inputArgs: [[[1,1],[3,3],[5,5]]], expected: [[1,1],[3,3],[5,5]] },
      { name: "H10: Negative coordinates", inputArgs: [[[-5,-1],[-3,2],[4,6]]], expected: [[-5,2],[4,6]] },
      { name: "H11: Chain of touching", inputArgs: [[[1,2],[2,3],[3,4],[4,5],[5,6]]], expected: [[1,6]] },
      { name: "H12: Mix of overlapping and separate", inputArgs: [[[1,2],[3,5],[4,7],[8,10],[9,12]]], expected: [[1,2],[3,7],[8,12]] },
      { name: "H13: All same point", inputArgs: [[[2,2],[2,2],[2,2]]], expected: [[2,2]] },
      { name: "H14: Large values", inputArgs: [[[100000,200000],[150000,300000]]], expected: [[100000,300000]] },
      { name: "H15: Two intervals same point touching", inputArgs: [[[1,3],[3,5]]], expected: [[1,5]] },
      ...genMergeStress(),
    ],
  },

  {
    id: "py_medium_005",
    difficulty: "medium_hard",
    title: "Longest Consecutive Sequence",
    functionName: "longest_consecutive",
    instructions: `Write a function **longest_consecutive(nums: list) -> int** that:
1. Finds the **length** of the longest sequence of consecutive integers
2. Elements do not need to be adjacent in the list
3. Duplicates are **ignored**
4. Returns **0** for empty input

Your solution should run in **O(n)** time.

**Example**
- Input: \`[100, 4, 200, 1, 3, 2]\`
- Output: \`4\` — the sequence 1, 2, 3, 4`,
    starterCode: {
      python: `def longest_consecutive(nums: list) -> int:
    """
    Find the length of the longest consecutive integer sequence.
    Duplicates ignored. Returns 0 for empty input.
    :param nums: list of integers
    :return: length of longest consecutive sequence
    """
    # Your implementation here
    pass
`,
    },
    supportedLanguages: [{ id: "python", name: "Python 3" }],
    publicTests: [
      { name: "Test 1: Classic example", inputArgs: [[100, 4, 200, 1, 3, 2]], expected: 4 },
      { name: "Test 2: Long sequence 0-8", inputArgs: [[0,3,7,2,5,8,4,6,0,1]], expected: 9 },
      { name: "Test 3: Empty list", inputArgs: [[]], expected: 0 },
      { name: "Test 4: Single element", inputArgs: [[1]], expected: 1 },
      { name: "Test 5: Includes negative", inputArgs: [[1,2,0,-1]], expected: 4 },
    ],
    hiddenTests: [
      { name: "H1: All same number", inputArgs: [[5,5,5,5]], expected: 1 },
      { name: "H2: All consecutive", inputArgs: [[1,2,3,4,5,6,7,8,9,10]], expected: 10 },
      { name: "H3: Two sequences — return longest", inputArgs: [[1,2,3,10,11,12,13]], expected: 4 },
      { name: "H4: Negative consecutive", inputArgs: [[-3,-2,-1,0]], expected: 4 },
      { name: "H5: No consecutive (all gaps)", inputArgs: [[1,3,5,7,9]], expected: 1 },
      { name: "H6: Duplicates in sequence", inputArgs: [[1,1,2,2,3,3]], expected: 3 },
      { name: "H7: Starts at 0", inputArgs: [[0,1,2,3,4]], expected: 5 },
      { name: "H8: Single pair", inputArgs: [[10,11]], expected: 2 },
      { name: "H9: Scattered neg and positive", inputArgs: [[-5,-4,-3,0,1,2,3,4,5]], expected: 6 },
      { name: "H10: Very large integers", inputArgs: [[1000000,999999,999998]], expected: 3 },
      { name: "H11: No sequence at all (all unique no consecutive)", inputArgs: [[1,10,100,1000]], expected: 1 },
      { name: "H12: Sequence at end of array", inputArgs: [[100,200,300,7,8,9,10]], expected: 4 },
      { name: "H13: Mixed signs consecutive", inputArgs: [[-2,-1,0,1,2]], expected: 5 },
      { name: "H14: Three separate sequences", inputArgs: [[1,2,3,10,11,20,21,22,23]], expected: 4 },
      { name: "H15: Large with dups", inputArgs: [Array.from({length:50},(_,i)=>i%25)], expected: 25 },
      ...genConsecutiveStress(),
    ],
  },
];

// ─── MCQ BANK (22 questions) ────────────────────────────────────────────────────

const mcqBank: MCQQuestion[] = [
  {
    id: "py_mcq_001", difficulty: "easy", topic: "Built-ins",
    question: "What does Python's `list.sort()` return?",
    options: ["A new sorted list", "The sorted list in-place", "None", "A sorted iterator"],
    answerIndex: 2,
    explanation: "`list.sort()` sorts in-place and returns None. Use `sorted(lst)` if you need a new object without modifying the original.",
  },
  {
    id: "py_mcq_002", difficulty: "easy", topic: "Data Structures",
    question: "Which data structure provides O(1) average-case lookup by key?",
    options: ["list", "tuple", "dict", "Sorted list (bisect)"],
    answerIndex: 2,
    explanation: "Python dicts use a hash table internally, giving O(1) average lookup. Lists require O(n) linear scan.",
  },
  {
    id: "py_mcq_003", difficulty: "easy", topic: "References",
    question: "What is printed?\n```python\nx = [1, 2, 3]\ny = x\ny.append(4)\nprint(x)\n```",
    options: ["[1, 2, 3]", "[1, 2, 3, 4]", "[4]", "TypeError"],
    answerIndex: 1,
    explanation: "`y = x` creates a reference, not a copy. Both point to the same list object. Use `y = x.copy()` or `y = x[:]` to avoid mutation.",
  },
  {
    id: "py_mcq_004", difficulty: "medium", topic: "Gotchas",
    question: "What is printed by both calls?\n```python\ndef add(x, items=[]):\n    items.append(x)\n    return items\nprint(add(1))\nprint(add(2))\n```",
    options: ["[1] then [2]", "[1] then [1, 2]", "Error: mutable default argument", "[1, 2] then [1, 2]"],
    answerIndex: 1,
    explanation: "Mutable default arguments (like `[]`) are created ONCE when the function is defined and shared across all calls. Use `items=None` with `if items is None: items = []` instead.",
  },
  {
    id: "py_mcq_005", difficulty: "medium", topic: "Identity vs Equality",
    question: "When does `a is b` return True?",
    options: ["Always when a == b", "Only when they are the same object in memory", "Whenever both values are equal strings", "For all small integers"],
    answerIndex: 1,
    explanation: "`is` checks object identity (same memory address), not equality. String interning and integer caching are CPython implementation details, not language guarantees.",
  },
  {
    id: "py_mcq_006", difficulty: "medium", topic: "Memory",
    question: "Which uses less memory for 1 million integers?",
    options: ["list(range(1_000_000))", "(x for x in range(1_000_000))", "They use identical memory", "tuple(range(1_000_000))"],
    answerIndex: 1,
    explanation: "A generator computes values lazily without storing all elements in memory, using O(1) space regardless of the sequence length.",
  },
  {
    id: "py_mcq_007", difficulty: "easy", topic: "Built-ins",
    question: "What does `enumerate(['a','b','c'], start=1)` produce as its first item?",
    options: ["(0, 'a')", "(1, 'a')", "('a', 0)", "('a', 1)"],
    answerIndex: 1,
    explanation: "The `start` parameter sets the beginning counter. With `start=1`, the first item is (1, 'a').",
  },
  {
    id: "py_mcq_008", difficulty: "easy", topic: "Built-ins",
    question: "What is `list(zip([1,2,3], [4,5]))`?",
    options: ["[(1,4),(2,5),(3,None)]", "[(1,4),(2,5)]", "[(1,4),(2,5),(3,)]", "ZipError: unequal lengths"],
    answerIndex: 1,
    explanation: "`zip` stops at the **shortest** iterable. Use `itertools.zip_longest` if you need to pad with a fill value.",
  },
  {
    id: "py_mcq_009", difficulty: "medium", topic: "Context Managers",
    question: "In a `with` statement, which method is called when the block EXITS (normally or via exception)?",
    options: ["__init__", "__enter__", "__exit__", "__close__"],
    answerIndex: 2,
    explanation: "`__enter__` is called on entry and sets up the resource. `__exit__` is always called on exit and receives exception info (type, value, traceback) if one occurred.",
  },
  {
    id: "py_mcq_010", difficulty: "easy", topic: "OOP",
    question: "What is the conventional name of the first parameter of a `@classmethod`?",
    options: ["self", "cls", "type", "klass"],
    answerIndex: 1,
    explanation: "By convention it's `cls` — it receives the class itself (not an instance). `@staticmethod` has no such automatic parameter.",
  },
  {
    id: "py_mcq_011", difficulty: "easy", topic: "Built-ins",
    question: "What does `{'a': 1}.get('b')` return?",
    options: ["KeyError", "0", "None", "False"],
    answerIndex: 2,
    explanation: "`.get()` returns `None` by default for missing keys. You can specify a custom default: `.get('b', 0)` returns 0.",
  },
  {
    id: "py_mcq_012", difficulty: "easy", topic: "Data Structures",
    question: "What is `{1,2,3} & {2,3,4}`?",
    options: ["{1,2,3,4}", "{2,3}", "{1,4}", "{1,2,3,4} minus duplicates"],
    answerIndex: 1,
    explanation: "`&` is set **intersection** — elements common to both sets. Use `|` for union, `-` for difference.",
  },
  {
    id: "py_mcq_013", difficulty: "medium", topic: "Python 3.8+",
    question: "What does the walrus operator `:=` do?",
    options: ["Compares two values without side effects", "Assigns a value AND returns it as an expression", "Creates a dict key-value pair", "Slices a list"],
    answerIndex: 1,
    explanation: "`n := len(a)` assigns `len(a)` to `n` AND evaluates to that value, enabling use inside conditions: `while chunk := f.read(1024):`.",
  },
  {
    id: "py_mcq_014", difficulty: "medium", topic: "Complexity",
    question: "Which is faster for checking membership when the collection has 1 million elements?",
    options: ["`x in my_list` — lists are ordered so search is efficient", "`x in my_set` — sets use hashing for O(1) average lookup", "They are identical in time complexity", "Depends entirely on the value of x"],
    answerIndex: 1,
    explanation: "Sets use hashing for O(1) average-case lookup. Lists require O(n) linear scan. Always prefer a set when doing repeated membership checks.",
  },
  {
    id: "py_mcq_015", difficulty: "easy", topic: "Functions",
    question: "Python `lambda` functions are limited to:",
    options: ["One line of source code", "No loops of any kind", "A single expression (no statements)", "No recursion allowed"],
    answerIndex: 2,
    explanation: "Lambdas can only contain a **single expression**, not statements (`if/else` blocks as statements, `for` loops, `print`, assignments). This makes them useful for simple one-liners but not complex logic.",
  },
  {
    id: "py_mcq_016", difficulty: "medium", topic: "OOP",
    question: "When is `__repr__` called instead of `__str__`?",
    options: ["When you call str(obj) explicitly", "In interactive mode / `repr(obj)` / as fallback when `__str__` is absent", "When printing to a file stream", "Both are always identical"],
    answerIndex: 1,
    explanation: "`__repr__` is for **developers** — should be unambiguous and ideally re-creatable. `__str__` is for **users**. If `__str__` isn't defined, Python falls back to `__repr__`.",
  },
  {
    id: "py_mcq_017", difficulty: "hard", topic: "Concurrency",
    question: "Python's Global Interpreter Lock (GIL) means that:",
    options: ["Multiple threads can execute Python bytecode simultaneously", "Only one thread executes Python bytecode at a time per process", "Global variables are automatically thread-safe because of the GIL", "The GIL was removed in Python 3.0"],
    answerIndex: 1,
    explanation: "The GIL prevents true parallelism for CPU-bound Python threads. For CPU-bound work, use `multiprocessing`. Threads are still useful for I/O-bound tasks since the GIL is released during I/O waits.",
  },
  {
    id: "py_mcq_018", difficulty: "easy", topic: "Slicing",
    question: "What does `[1, 2, 3, 4, 5][::-1]` produce?",
    options: ["[5, 4, 3, 2, 1]", "[1, 2, 3, 4, 5]", "[]", "[5]"],
    answerIndex: 0,
    explanation: "`[::-1]` uses step=-1 to traverse the list backwards, effectively reversing it. Equivalent to `list(reversed(lst))`.",
  },
  {
    id: "py_mcq_019", difficulty: "easy", topic: "Functions",
    question: "Inside a function, `*args` is accessible as:",
    options: ["A list", "A tuple", "A set", "A generator"],
    answerIndex: 1,
    explanation: "`*args` captures positional arguments as a **tuple** (immutable), not a list. You cannot append to it without converting first.",
  },
  {
    id: "py_mcq_020", difficulty: "medium", topic: "Error Handling",
    question: "When does the `else` clause in `try/except/else/finally` execute?",
    options: ["Always, before finally", "Only if an exception was raised and caught", "Only if NO exception was raised in the try block", "Only if a specific exception type matched"],
    answerIndex: 2,
    explanation: "`else` runs when the `try` block **completes without exception**. It's useful for code that should only run if the try succeeded, keeping it separate from exception handling.",
  },
  {
    id: "py_mcq_021", difficulty: "hard", topic: "Gotchas",
    question: "What does `round(2.5)` return in Python 3?",
    options: ["3", "2", "2.5", "3.0"],
    answerIndex: 1,
    explanation: "Python 3 uses **banker's rounding** (round half to even). 2.5 → 2 (even), 3.5 → 4 (even). This is IEEE 754 default rounding to reduce statistical bias.",
  },
  {
    id: "py_mcq_022", difficulty: "medium", topic: "Scope",
    question: "What keyword is required to MODIFY a global variable from inside a function?",
    options: ["nonlocal", "global", "extern", "const"],
    answerIndex: 1,
    explanation: "Without `global x`, assignment inside a function creates a **new local variable** named x, shadowing the global. `nonlocal` is used for enclosing scope in nested functions.",
  },
];

export function getPythonBank(): SkillBank {
  return {
    skill: "python",
    easy: easyQuestions,
    mediumHard: mediumHardQuestions,
    mcqs: mcqBank,
  };
}
