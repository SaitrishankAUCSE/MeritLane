const fs = require('fs');
const readline = require('readline');

async function processLineByLine() {
  const fileStream = fs.createReadStream('C:\\Users\\saitr\\.gemini\\antigravity-ide\\brain\\5d438e1b-5501-461d-aba2-a2ae9edac0aa\\.system_generated\\logs\\transcript_full.jsonl');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lastUserInput = "";

  for await (const line of rl) {
    try {
      const parsed = JSON.parse(line);
      if (parsed.type === 'USER_INPUT' && parsed.content.includes("STAGE 1")) {
        lastUserInput = parsed.content;
      }
    } catch (e) {
      // ignore
    }
  }

  console.log("Last USER_INPUT with STAGE 1:");
  console.log(lastUserInput);
}

processLineByLine();
