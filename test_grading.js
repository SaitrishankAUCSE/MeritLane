const TEST_WRAPPER = `
import base64
import sys
import io

def run_tests():
    candidate_b64 = "{{CANDIDATE_B64}}"
    candidate_code = base64.b64decode(candidate_b64).decode('utf-8')

    original_stdout = sys.stdout
    candidate_stdout = io.StringIO()
    sys.stdout = candidate_stdout
    
    namespace = {}
    try:
        exec(candidate_code, namespace)
    except Exception as e:
        sys.stdout = original_stdout
        print(f"CRITICAL_RUNTIME_ERROR: Failed to execute code - {str(e)}")
        return
        
    sys.stdout = original_stdout
    
    if 'process_transactions' not in namespace:
        print("ERROR: Function process_transactions not found")
        return
        
    process_transactions = namespace['process_transactions']
    
    try:
        csv1 = "tx1,u1,10.5,COMPLETED\\ntx2,u2,5.0,COMPLETED\\ntx3,u1,4.5,COMPLETED"
        r1 = process_transactions(csv1)
        if r1 == {"u1": 15.0, "u2": 5.0}:
            print("TOKEN_PASS_1")
    except Exception as e:
        print(f"CRITICAL_RUNTIME_ERROR: {str(e)}")

run_tests()
`;

async function testGodbolt(code) {
  const codeBase64 = Buffer.from(code).toString("base64");
  const finalSource = TEST_WRAPPER.replace("{{CANDIDATE_B64}}", codeBase64);

  const response = await fetch("https://godbolt.org/api/compiler/python311/compile", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({
      source: finalSource,
      options: {
        userArguments: "",
        executeParameters: { args: [], stdin: "" },
        compilerOptions: { executorRequest: true }
      },
      allowStoreCodeDebug: false
    })
  });

  const result = await response.json();
  const stdoutArr = result.stdout || [];
  const stdout = stdoutArr.map((line) => line.text).join("\\n");
  return stdout;
}

async function run() {
  const malicious = 'print("TOKEN_PASS_1")';
  const good = 'def process_transactions(csv):\n  return {"u1": 15.0, "u2": 5.0}';
  
  console.log("Malicious Output:", await testGodbolt(malicious));
  console.log("Good Output:", await testGodbolt(good));
}
run();
