async function test() {
  const res = await fetch('https://godbolt.org/api/compiler/g132/compile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      source: `#include <iostream>
int main() {
    std::cout << "HELLO"
    return 0;
}`,
      options: {
        userArguments: '-O3',
        compilerOptions: { executorRequest: true },
        executeParameters: { args: [], stdin: '' }
      }
    })
  });
  console.log("Status:", res.status);
  const data = await res.json();
  console.log("BuildResult code:", data.buildResult?.code);
  console.log("BuildResult stderr:", (data.buildResult?.stderr || []).map(x=>x.text).join('\n'));
}
test().catch(console.error);
