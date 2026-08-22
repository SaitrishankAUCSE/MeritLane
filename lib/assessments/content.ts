export interface MCQ {
  question: string;
  options: string[];
  answerIndex: number;
}

export interface CodingChallenge {
  title: string;
  instructions: string;
  initialCode: string;
}

export interface AssessmentContent {
  mcqs: MCQ[];
  coding: CodingChallenge;
}

const fallbackContent: AssessmentContent = {
  mcqs: [
    {
      question: "Which of the following is a primary benefit of using version control systems like Git?",
      options: [
        "Automatically writing tests for your code",
        "Tracking changes and collaborating with other developers",
        "Compiling code faster",
        "Hosting databases locally"
      ],
      answerIndex: 1
    },
    {
      question: "What does 'DRY' stand for in software engineering?",
      options: [
        "Do Repeat Yourself",
        "Don't Run Yet",
        "Don't Repeat Yourself",
        "Data Routing Yield"
      ],
      answerIndex: 2
    }
  ],
  coding: {
    title: "Data Parsing Challenge",
    instructions: "Write a function that takes an array of user objects and returns a list of just the names of users who are strictly older than 18.",
    initialCode: "def filter_adults(users):\n    # users is a list of dicts like {'name': 'Alice', 'age': 20}\n    pass\n"
  }
};

const skillContentMap: Record<string, AssessmentContent> = {
  python: {
    mcqs: [
      {
        question: "What is the output of `print(type([]))` in Python?",
        options: ["<class 'list'>", "<class 'array'>", "<class 'dict'>", "<class 'tuple'>"],
        answerIndex: 0
      },
      {
        question: "Which of the following statements is true regarding Python's Global Interpreter Lock (GIL)?",
        options: [
          "It allows multiple threads to execute Python bytecodes in parallel.",
          "It ensures only one thread executes Python bytecode at a time.",
          "It manages memory allocation automatically.",
          "It compiles Python code to machine code."
        ],
        answerIndex: 1
      }
    ],
    coding: {
      title: "Python Data Processing",
      instructions: "Write a Python function `process_transactions(csv_string)` that takes a multiline CSV string of financial transactions.\n\nColumns: transaction_id, user_id, amount, status\n\nRequirements:\n1. Filter out any transaction where status is not 'COMPLETED'.\n2. Ignore any malformed rows.\n3. Sum the total valid amount per user_id.\n4. Return a Python dictionary mapping user_id to their total spend.",
      initialCode: "def process_transactions(csv_string):\n    pass\n"
    }
  },
  java: {
    mcqs: [
      {
        question: "Which of these is NOT a primitive data type in Java?",
        options: ["int", "boolean", "String", "double"],
        answerIndex: 2
      },
      {
        question: "What is the purpose of the 'transient' keyword in Java?",
        options: [
          "To make a variable thread-safe.",
          "To indicate that a field should not be serialized.",
          "To declare a constant.",
          "To restrict access to the same package."
        ],
        answerIndex: 1
      }
    ],
    coding: {
      title: "Java Stream Processing",
      instructions: "Write a public static Java method `filterAndSort(List<Integer> numbers)` that filters out all odd numbers, multiplies the remaining even numbers by 2, and returns a sorted List of the results in descending order.",
      initialCode: "import java.util.*;\n\npublic class Solution {\n    public static List<Integer> filterAndSort(List<Integer> numbers) {\n        // Your code here\n        return new ArrayList<>();\n    }\n}\n"
    }
  },
  react: {
    mcqs: [
      {
        question: "Which hook should you use to perform side effects in a React function component?",
        options: ["useState", "useMemo", "useEffect", "useReducer"],
        answerIndex: 2
      },
      {
        question: "What causes a React component to re-render?",
        options: [
          "Only when props change",
          "Only when state changes",
          "When state or props change, or when the parent component re-renders",
          "When the DOM is manually updated"
        ],
        answerIndex: 2
      }
    ],
    coding: {
      title: "React Counter Component",
      instructions: "Create a React component called `Counter` that displays a number. It should have two buttons: 'Increment' and 'Decrement'. Ensure the count never goes below 0.",
      initialCode: "import React, { useState } from 'react';\n\nexport default function Counter() {\n  return (\n    <div>\n      {/* Your UI here */}\n    </div>\n  );\n}\n"
    }
  }
};

export const getAssessmentContent = (skillName: string): AssessmentContent => {
  if (!skillName) return fallbackContent;
  const normalized = skillName.toLowerCase().trim();
  
  if (skillContentMap[normalized]) {
    return skillContentMap[normalized];
  }

  for (const [key, content] of Object.entries(skillContentMap)) {
    if (normalized.includes(key)) {
      return content;
    }
  }

  return {
    ...fallbackContent,
    coding: {
      title: `${skillName} Fundamentals`,
      instructions: `Write a ${skillName} function that takes an array of user objects and returns a list of just the names of users who are strictly older than 18.`,
      initialCode: `// ${skillName} Implementation\nfunction filterAdults(users) {\n\n}\n`
    }
  };
};
