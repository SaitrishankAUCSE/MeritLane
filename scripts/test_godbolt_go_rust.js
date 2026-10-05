async function test() {
  // Test Go
  const goRes = await fetch('https://godbolt.org/api/compiler/gl1220/compile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      source: `package main
import "fmt"
func main() {
    fmt.Println("HELLO GO OUTPUT")
}`,
      options: {
        compilerOptions: { executorRequest: true },
        executeParameters: { args: [], stdin: '' }
      }
    })
  });
  const goData = await goRes.json();
  console.log("Go didExecute:", goData.didExecute, "stdout:", (goData.stdout||[]).map(x=>x.text));

  // Test Rust
  const rustRes = await fetch('https://godbolt.org/api/compiler/r1770/compile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      source: `fn main() {
    println!("HELLO RUST OUTPUT");
}`,
      options: {
        compilerOptions: { executorRequest: true },
        executeParameters: { args: [], stdin: '' }
      }
    })
  });
  const rustData = await rustRes.json();
  console.log("Rust didExecute:", rustData.didExecute, "stdout:", (rustData.stdout||[]).map(x=>x.text));
}
test().catch(console.error);
