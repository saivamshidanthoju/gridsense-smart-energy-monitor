import json
import traceback

log_path = r"C:\Users\saiva\.gemini\antigravity-ide\brain\952b0476-f80d-4d58-a792-517108565625\.system_generated\logs\transcript.jsonl"
out_path = r"c:\Users\saiva\Downloads\smart-energy-dashboard\frontend\scan_results.txt"

matches = []
try:
    matches.append("Starting log scan...")
    with open(log_path, "r", encoding="utf-8") as f:
        for idx, line in enumerate(f):
            try:
                data = json.loads(line)
                str_data = json.dumps(data)
                if "App.jsx" in str_data:
                    matches.append(f"Line {idx}: source={data.get('source')} type={data.get('type')}")
                    preview = str_data[:200]
                    matches.append(f"  Preview: {preview}")
            except Exception as e:
                matches.append(f"Error parsing line {idx}: {e}")
except Exception as e:
    matches.append(f"Global error: {e}")
    matches.append(traceback.format_exc())

with open(out_path, "w", encoding="utf-8") as out:
    out.write("\n".join(matches))
print(f"Finished. Wrote {len(matches)} lines to {out_path}")
