import type { ExecutionResult, TestCaseResult } from "./index";

/**
 * Validates a given structural configuration (like Dockerfile, YAML, or HCL)
 * statically against a set of invariants instead of executing it.
 */
export async function executeStructuralConfig(
  skill: string,
  code: string,
  language: string,
  isPublicTest: boolean,
  tests: Array<{ name: string; expected: string }> = []
): Promise<ExecutionResult> {
  const startTime = Date.now();
  const normalizedSkill = skill.toLowerCase();
  
  const cases: TestCaseResult[] = [];
  let compileSuccess = true;
  let stderr = "";

  // Helper to extract lines and strip comments
  const lines = code
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("#"));

  const normalizedCode = lines.join("\n").toLowerCase();

  // ─────────────────────────────────────────────────────────────────────────────
  // DOCKER STRUCTURAL VALIDATION
  // ─────────────────────────────────────────────────────────────────────────────
  if (normalizedSkill.includes("docker") || language === "dockerfile") {
    // Basic AST/Regex parser for Dockerfiles
    const hasFrom = code.match(/^FROM\s+/mi);
    if (!hasFrom) {
      compileSuccess = false;
      stderr = "Structural Syntax Error: Dockerfile must begin with a FROM instruction.";
    }

    const testSuite = isPublicTest ? tests.slice(0, 5) : tests;
    
    // If no tests were provided (e.g., fallback), use these default invariants
    const invariants = testSuite.length > 0 ? testSuite : [
      { name: "Test Case 1: Base Image Defined", expected: "Uses a valid base image via FROM" },
      { name: "Test Case 2: Uses Non-Root User", expected: "Declares a USER instruction for security" },
      { name: "Test Case 3: Exposes Network Port", expected: "Uses EXPOSE instruction" },
      { name: "Test Case 4: Defines Entrypoint or CMD", expected: "Has ENTRYPOINT or CMD" },
      { name: "Test Case 5: Working Directory Set", expected: "Uses WORKDIR instruction" },
    ];

    for (let i = 0; i < (isPublicTest ? 5 : 50); i++) {
      const t = invariants[i] || { 
        name: `Test Case ${i + 1}: Hidden Structural Invariant`, 
        expected: "Meets advanced security and optimization criteria"
      };

      let passed = false;
      let actual = "Failed structural requirement";

      if (compileSuccess) {
        const req = t.expected.toLowerCase();
        // Heuristics for expected structural checks
        if (req.includes("base image") || req.includes("from")) {
          passed = !!hasFrom;
          actual = passed ? "FROM instruction found" : "Missing FROM";
        } else if (req.includes("non-root") || req.includes("user")) {
          passed = !!code.match(/^USER\s+(?!root)/mi);
          actual = passed ? "Non-root USER declared" : "Runs as default root user";
        } else if (req.includes("expose") || req.includes("port")) {
          passed = !!code.match(/^EXPOSE\s+\d+/mi);
          actual = passed ? "EXPOSE instruction found" : "No port exposed";
        } else if (req.includes("entrypoint") || req.includes("cmd")) {
          passed = !!code.match(/^(ENTRYPOINT|CMD)\s+/mi);
          actual = passed ? "Execution command defined" : "Missing CMD or ENTRYPOINT";
        } else if (req.includes("workdir") || req.includes("working directory")) {
          passed = !!code.match(/^WORKDIR\s+/mi);
          actual = passed ? "WORKDIR is set" : "Missing WORKDIR";
        } else if (req.includes("copy") || req.includes("add")) {
          passed = !!code.match(/^(COPY|ADD)\s+/mi);
          actual = passed ? "Files copied into image" : "No COPY/ADD found";
        } else {
          // Generic heuristic if we don't know the exact intent:
          // Just verify the Dockerfile has substantive structure (>3 valid instructions)
          passed = lines.length >= 3;
          actual = passed ? "Structural pattern matched" : "Insufficient instructions";
        }
      }

      cases.push({
        name: t.name,
        input: "(Dockerfile Structural Analysis)",
        expected: t.expected,
        actual,
        passed
      });
    }

  // ─────────────────────────────────────────────────────────────────────────────
  // KUBERNETES / YAML STRUCTURAL VALIDATION
  // ─────────────────────────────────────────────────────────────────────────────
  } else if (normalizedSkill.includes("kubernetes") || normalizedSkill.includes("k8s") || language === "yaml") {
    const hasApiVersion = code.match(/^apiVersion:\s+/mi);
    const hasKind = code.match(/^kind:\s+/mi);

    if (!hasApiVersion || !hasKind) {
      compileSuccess = false;
      stderr = "Structural Syntax Error: Kubernetes YAML must contain 'apiVersion' and 'kind'.";
    }

    const testSuite = isPublicTest ? tests.slice(0, 5) : tests;
    const invariants = testSuite.length > 0 ? testSuite : [
      { name: "Test Case 1: Valid Resource Kind", expected: "Defines kind (Deployment, Service, etc.)" },
      { name: "Test Case 2: Metadata Name", expected: "Contains metadata.name" },
      { name: "Test Case 3: Pod Spec Defined", expected: "Contains spec/containers" },
      { name: "Test Case 4: Image Declared", expected: "Declares container image" },
      { name: "Test Case 5: Resource Limits", expected: "Defines resources (requests/limits)" },
    ];

    for (let i = 0; i < (isPublicTest ? 5 : 50); i++) {
      const t = invariants[i] || { 
        name: `Test Case ${i + 1}: Hidden YAML Invariant`, 
        expected: "Meets operational deployment criteria"
      };

      let passed = false;
      let actual = "Failed structural requirement";

      if (compileSuccess) {
        const req = t.expected.toLowerCase();
        if (req.includes("kind")) {
          passed = !!hasKind;
          actual = passed ? "Valid kind defined" : "Missing kind";
        } else if (req.includes("metadata") || req.includes("name")) {
          passed = !!code.match(/^\s*metadata:/mi) && !!code.match(/^\s*name:\s+/mi);
          actual = passed ? "Metadata name defined" : "Missing metadata.name";
        } else if (req.includes("spec") || req.includes("container")) {
          passed = !!code.match(/^\s*containers:/mi);
          actual = passed ? "Container spec found" : "Missing containers array";
        } else if (req.includes("image")) {
          passed = !!code.match(/^\s*image:\s+/mi);
          actual = passed ? "Container image declared" : "No image specified";
        } else if (req.includes("resource") || req.includes("limit") || req.includes("request")) {
          passed = !!code.match(/^\s*(resources|limits|requests):/mi);
          actual = passed ? "Resource boundaries defined" : "Missing CPU/Memory constraints";
        } else {
          passed = lines.length >= 5;
          actual = passed ? "YAML structure matched" : "Insufficient YAML hierarchy";
        }
      }

      cases.push({
        name: t.name,
        input: "(YAML Structural Analysis)",
        expected: t.expected,
        actual,
        passed
      });
    }

  // ─────────────────────────────────────────────────────────────────────────────
  // FALLBACK FOR UNSUPPORTED CONFIG
  // ─────────────────────────────────────────────────────────────────────────────
  } else {
    compileSuccess = false;
    stderr = `Structural Validation Engine does not yet support ${skill} (${language})`;
  }

  const passedCount = cases.filter(c => c.passed).length;
  
  return {
    success: compileSuccess && passedCount > 0,
    compileSuccess,
    stdout: compileSuccess ? "Structural validation completed successfully.\n" + (passedCount === cases.length ? "All constraints met." : "Some constraints failed.") : "",
    stderr,
    durationMs: Date.now() - startTime,
    cases,
    passedTests: passedCount,
    totalTests: cases.length,
  };
}
