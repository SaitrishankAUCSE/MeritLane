import { validateCodeSafety } from "../lib/security/codeSandbox";
import { sanitizeUrl } from "../lib/security/url";
import { checkRateLimit } from "../lib/security/rateLimit";

console.log("==================================================");
console.log("       MERITLANE SECURITY REMEDIATION TESTS       ");
console.log("==================================================");

let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
  } else {
    console.error(`[FAIL] ${testName}`);
    failed++;
  }
}

// 1. URL SANITIZATION (XSS PREVENTION)
assert(sanitizeUrl("javascript:alert(1)") === "#", "Blocked javascript: protocol");
assert(sanitizeUrl("JAVASCRIPT:alert(1)") === "#", "Blocked uppercase JAVASCRIPT: protocol");
assert(sanitizeUrl("data:text/html,<script>alert(1)</script>") === "#", "Blocked data: protocol");
assert(sanitizeUrl("vbscript:msgbox(1)") === "#", "Blocked vbscript: protocol");
assert(sanitizeUrl("file:///etc/passwd") === "#", "Blocked file: protocol");
assert(sanitizeUrl("https://github.com/developer") === "https://github.com/developer", "Allowed legitimate https URL");
assert(sanitizeUrl("http://example.com") === "http://example.com", "Allowed legitimate http URL");
assert(sanitizeUrl("/candidates/profile") === "/candidates/profile", "Allowed relative path");

// 2. SANDBOX CODE EXECUTION PREVENTION
const maliciousPython1 = `
import os
os.system("whoami")
`;
assert(!validateCodeSafety(maliciousPython1, "python").safe, "Blocked Python 'import os'");

const maliciousPython2 = `
from subprocess import Popen
p = Popen(["ls", "-la"])
`;
assert(!validateCodeSafety(maliciousPython2, "python").safe, "Blocked Python 'from subprocess import Popen'");

const maliciousPython3 = `
secret = open(".env.local").read()
`;
assert(!validateCodeSafety(maliciousPython3, "python").safe, "Blocked Python 'open()'");

const maliciousPython4 = `
mod = __import__("socket")
`;
assert(!validateCodeSafety(maliciousPython4, "python").safe, "Blocked Python '__import__'");

const safePython = `
import math
import collections
from typing import List

def solve(arr: List[int]) -> int:
    return sum(arr)
`;
assert(validateCodeSafety(safePython, "python").safe, "Allowed safe Python solution");

const maliciousJs = `
const { execSync } = require('child_process');
execSync('rm -rf /');
`;
assert(!validateCodeSafety(maliciousJs, "javascript").safe, "Blocked JS 'child_process'");

const maliciousJsEscape = `
this.constructor.constructor("return process")().exit(1);
`;
assert(!validateCodeSafety(maliciousJsEscape, "javascript").safe, "Blocked JS constructor escape");

const safeJs = `
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
`;
assert(validateCodeSafety(safeJs, "javascript").safe, "Allowed safe JS debounce");

const maliciousJava = `
import java.io.File;
public class Solution {
  public static void run() {
    Runtime.getRuntime().exec("calc.exe");
  }
}
`;
assert(!validateCodeSafety(maliciousJava, "java").safe, "Blocked Java Runtime.getRuntime");

const maliciousCpp = `
#include <windows.h>
int main() {
  system("powershell.exe");
  return 0;
}
`;
assert(!validateCodeSafety(maliciousCpp, "cpp").safe, "Blocked C++ system()");

// 3. RATE LIMITING
const rate1 = checkRateLimit("test-ns", "user-1", 2, 60000);
assert(rate1.success && rate1.remaining === 1, "Rate limit pass 1");
const rate2 = checkRateLimit("test-ns", "user-1", 2, 60000);
assert(rate2.success && rate2.remaining === 0, "Rate limit pass 2");
const rate3 = checkRateLimit("test-ns", "user-1", 2, 60000);
assert(!rate3.success && rate3.remaining === 0, "Rate limit blocked on 3rd attempt");

console.log("==================================================");
if (failed === 0) {
  console.log("ALL SECURITY TESTS PASSED SUCCESSFULLY! (17/17)");
} else {
  console.error(`${failed} SECURITY TESTS FAILED!`);
  process.exit(1);
}
