/**
 * Host Sandbox Protection for Code Compilers & Evaluators
 * Prevents unauthorized system calls, process spawning, file system manipulation,
 * network socket calls, and VM sandbox escapes.
 */

export interface SafetyCheckResult {
  safe: boolean;
  reason?: string;
}

export function validateCodeSafety(code: string, languageOrSkill: string): SafetyCheckResult {
  const lang = (languageOrSkill || "").toLowerCase().trim();

  // 1. PYTHON VALIDATION
  if (
    lang.includes("python") ||
    lang.includes("django") ||
    lang.includes("fastapi") ||
    lang.includes("flask") ||
    lang.includes("pandas") ||
    lang.includes("numpy") ||
    lang.includes("pytorch") ||
    lang.includes("tensorflow") ||
    lang.includes("machine learning") ||
    lang.includes("data")
  ) {
    // Prohibited system and network modules
    const forbiddenPyModules = [
      "os", "sys", "subprocess", "shutil", "socket", "pty", "commands",
      "pathlib", "ctypes", "winreg", "msvcrt", "multiprocessing", "threading",
      "importlib", "urllib", "requests", "http", "pickle", "shelve", "webbrowser",
      "posix", "nt", "inspect"
    ];

    for (const mod of forbiddenPyModules) {
      const importRegex = new RegExp(`(^|\\n|;)\\s*(import\\s+${mod}\\b|from\\s+${mod}\\b)`, "i");
      if (importRegex.test(code)) {
        return {
          safe: false,
          reason: `Access to system module '${mod}' is prohibited in the execution sandbox.`,
        };
      }
    }

    // Dangerous builtins and introspection escapes
    const forbiddenPyPatterns = [
      { pattern: /\b__import__\s*\(/i, name: "__import__" },
      { pattern: /\bopen\s*\(/i, name: "file open()" },
      { pattern: /\beval\s*\(/i, name: "eval()" },
      { pattern: /\bexec\s*\(/i, name: "exec()" },
      { pattern: /\bcompile\s*\(/i, name: "compile()" },
      { pattern: /\bbreakpoint\s*\(/i, name: "breakpoint()" },
      { pattern: /\b__builtins__\b/i, name: "__builtins__" },
      { pattern: /\b__subclasses__\s*\(/i, name: "__subclasses__()" },
      { pattern: /\bglobals\s*\(\s*\)/i, name: "globals()" },
    ];

    for (const { pattern, name } of forbiddenPyPatterns) {
      if (pattern.test(code)) {
        return {
          safe: false,
          reason: `Restricted capability '${name}' is prohibited in the execution sandbox.`,
        };
      }
    }
  }

  // 2. JAVA VALIDATION
  if (lang.includes("java") && !lang.includes("javascript")) {
    const forbiddenJavaPatterns = [
      { pattern: /\bRuntime\.getRuntime\b/i, name: "Runtime.getRuntime" },
      { pattern: /\bProcessBuilder\b/i, name: "ProcessBuilder" },
      { pattern: /\bSystem\.exit\b/i, name: "System.exit" },
      { pattern: /\bimport\s+java\.(lang\.reflect|net|nio\.file|rmi|security)\b/i, name: "Restricted Java standard library" },
      { pattern: /\bnew\s+(File|FileInputStream|FileOutputStream|Socket|ServerSocket|ProcessBuilder)\b/i, name: "Host I/O or network socket" },
    ];

    for (const { pattern, name } of forbiddenJavaPatterns) {
      if (pattern.test(code)) {
        return {
          safe: false,
          reason: `Restricted Java operation '${name}' is prohibited for execution security.`,
        };
      }
    }
  }

  // 3. C / C++ VALIDATION
  if (lang.includes("c++") || lang.includes("cpp") || lang === "c") {
    const forbiddenCppPatterns = [
      { pattern: /#\s*include\s*[<"](windows\.h|unistd\.h|sys\/|dirent\.h|filesystem|dlfcn\.h)[>"]/i, name: "System/OS Header" },
      { pattern: /\b(system|popen|fork|execve|kill|socket|connect)\s*\(/i, name: "Host process or socket system call" },
    ];

    for (const { pattern, name } of forbiddenCppPatterns) {
      if (pattern.test(code)) {
        return {
          safe: false,
          reason: `Restricted C/C++ capability '${name}' is prohibited for execution security.`,
        };
      }
    }
  }

  // 4. JAVASCRIPT / TYPESCRIPT VALIDATION
  if (
    lang.includes("javascript") ||
    lang.includes("typescript") ||
    lang === "js" ||
    lang === "ts" ||
    lang.includes("react") ||
    lang.includes("node") ||
    lang.includes("next")
  ) {
    const forbiddenJsPatterns = [
      { pattern: /\bchild_process\b/i, name: "child_process" },
      { pattern: /\bprocess\s*\.\s*(env|exit|kill|binding|mainModule|argv|execPath)\b/i, name: "Host process bindings" },
      { pattern: /\b(require\s*\(\s*['"]fs['"]|from\s+['"]fs['"]|from\s+['"]node:fs['"])/i, name: "fs module import" },
      { pattern: /constructor\s*\.\s*constructor\s*\(/i, name: "Dynamic Function constructor escape" },
    ];

    for (const { pattern, name } of forbiddenJsPatterns) {
      if (pattern.test(code)) {
        return {
          safe: false,
          reason: `Restricted JavaScript capability '${name}' is prohibited in the evaluation sandbox.`,
        };
      }
    }
  }

  return { safe: true };
}
