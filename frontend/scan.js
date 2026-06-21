const fs = require('fs');
const path = require('path');

const logPath = "C:\\Users\\saiva\\.gemini\\antigravity-ide\\brain\\952b0476-f80d-4d58-a792-517108565625\\.system_generated\\logs\\transcript.jsonl";
const outPath = "c:\\Users\\saiva\\Downloads\\smart-energy-dashboard\\frontend\\scan_results.txt";

const matches = [];

try {
  matches.push("Starting Node log scan...");
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, idx) => {
    if (!line.trim()) return;
    try {
      const data = JSON.parse(line);
      const strData = JSON.stringify(data);
      if (strData.includes("App.jsx")) {
        matches.push(`Line ${idx}: source=${data.source} type=${data.type}`);
        matches.push(`  Preview: ${strData.substring(0, 300)}`);
      }
    } catch (e) {
      matches.push(`Error parsing line ${idx}: ${e.message}`);
    }
  });
} catch (e) {
  matches.push(`Global error: ${e.message}`);
  matches.push(e.stack);
}

fs.writeFileSync(outPath, matches.join('\n'), 'utf8');
console.log(`Done. Wrote ${matches.length} lines.`);
