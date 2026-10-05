async function test() {
  const res = await fetch('https://godbolt.org/api/compiler/java2101/compile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      source: `class Solution {
    public static void main(String[] args) {
        System.out.println("HELLO JAVA OUTPUT");
    }
}`,
      options: {
        compilerOptions: { executorRequest: true },
        executeParameters: { args: [], stdin: '' }
      }
    })
  });
  const data = await res.json();
  console.log("Full data:", JSON.stringify(data, null, 2));
}
test().catch(console.error);
