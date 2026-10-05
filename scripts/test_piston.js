async function testPiston(lang, version, files) {
  const res = await fetch('https://emkc.org/api/v2/piston/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language: lang,
      version: version,
      files: files
    })
  });
  const data = await res.json();
  console.log(`[${lang}] Output:`, data.run?.output?.trim());
}

async function runAll() {
  await testPiston('c++', '10.2.0', [{ name: 'main.cpp', content: '#include <iostream>\nint main(){ std::cout << "TEST C++ OK\\n"; return 0; }' }]);
  await testPiston('java', '15.0.2', [{ name: 'Solution.java', content: 'public class Solution { public static void main(String[] args){ System.out.println("TEST JAVA OK"); } }' }]);
  await testPiston('go', '1.16.2', [{ name: 'main.go', content: 'package main\nimport "fmt"\nfunc main(){ fmt.Println("TEST GO OK") }' }]);
  await testPiston('rust', '1.68.2', [{ name: 'main.rs', content: 'fn main(){ println!("TEST RUST OK"); }' }]);
}

runAll().catch(console.error);
