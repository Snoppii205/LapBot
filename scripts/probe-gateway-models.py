import urllib.request
import json
import time
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

API_KEY = os.environ.get("LLM_API_KEY", "")
BASE_URL = os.environ.get("LLM_BASE_URL", "http://localhost:11434/v1")

def call_stream(payload):
    req = urllib.request.Request(
        f"{BASE_URL}/chat/completions",
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
            "Accept": "text/event-stream"
        },
        data=json.dumps(payload).encode("utf-8")
    )
    res = {
        "reply": "",
        "tools": {},
        "finish_reason": None,
        "model": None,
        "rate_limit": False,
        "error": None
    }
    try:
        with urllib.request.urlopen(req, timeout=35) as resp:
            for line in resp:
                line_str = line.decode("utf-8", errors="replace").strip()
                if not line_str.startswith("data:"):
                    continue
                data_str = line_str[5:].strip()
                if data_str == "[DONE]":
                    break
                try:
                    chunk = json.loads(data_str)
                except Exception:
                    continue
                if "error" in chunk:
                    res["error"] = chunk["error"]
                choices = chunk.get("choices", [])
                if choices:
                    c0 = choices[0]
                    if c0.get("finish_reason"):
                        res["finish_reason"] = c0["finish_reason"]
                    delta = c0.get("delta", {})
                    if delta.get("content"):
                        res["reply"] += delta["content"]
                    for tc in delta.get("tool_calls", []):
                        idx = tc.get("index", 0)
                        if idx not in res["tools"]:
                            res["tools"][idx] = {"id": "", "name": "", "arguments": ""}
                        if tc.get("id"):
                            res["tools"][idx]["id"] += tc["id"]
                        fn = tc.get("function", {})
                        if fn.get("name"):
                            res["tools"][idx]["name"] += fn["name"]
                        if fn.get("arguments"):
                            res["tools"][idx]["arguments"] += fn["arguments"]
        if "SYSTEM NOTICE: RATE LIMIT EXCEEDED" in res["reply"] or "RPM limit exceeded" in res["reply"]:
            res["rate_limit"] = True
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        res["error"] = f"HTTP {e.code}: {body[:200]}"
        if e.code == 429:
            res["rate_limit"] = True
    except Exception as e:
        res["error"] = str(e)
    return res

tool_schema = [{
    "type": "function",
    "function": {
        "name": "search_laptop_catalog",
        "description": "Search laptop catalog by maximum budget in VND.",
        "parameters": {
            "type": "object",
            "properties": {"max_price": {"type": "integer", "minimum": 0}},
            "required": ["max_price"],
            "additionalProperties": False
        }
    }
}]

# Models to test
models_to_test = [
    "gemini-4-argon",
    "glm-5.3",
    "glm-5.3-flash",
    "gpt-5.6-luna",
    "gpt-6-astra",
    "gpt-6-luna",
    "grok-4.6",
    "grok-4.7",
    "qwen3.8-flash",
    "claude-fable-5.1",
    "claude-opus-5-5"
]

print(f"Starting test for {len(models_to_test)} models...")
sys.stdout.flush()

results = {}

for m in models_to_test:
    print(f"\n==========================================")
    print(f"Testing model: {m}")
    sys.stdout.flush()

    # Pause between tests to avoid rate limit
    time.sleep(3)

    # 1. Text test
    t_res = call_stream({
        "model": m,
        "messages": [{"role": "user", "content": "Tra loi tieng Viet 3 dong: 1. Nhu cau 2. Ngan sach 3. Bao hanh."}],
        "max_tokens": 200,
        "stream": True
    })
    text_ok = bool(t_res["reply"]) and not t_res["error"] and not t_res["rate_limit"]
    print(f"  [1] Text: ok={text_ok}, finish={t_res['finish_reason']}, rate_limit={t_res['rate_limit']}, err={t_res['error']}")
    if t_res["reply"]:
        print(f"      Preview: {t_res['reply'][:60].strip()}...")
    sys.stdout.flush()

    if t_res["rate_limit"]:
        print("  --> HIT RATE LIMIT! Pausing 25s...")
        time.sleep(25)
        results[m] = {"status": "RATE_LIMITED"}
        continue

    # 2. Tool test
    time.sleep(3)
    call_msgs = [
        {"role": "system", "content": "You are a laptop sales assistant. Use search_laptop_catalog before answering catalog queries."},
        {"role": "user", "content": "Tim laptop duoi 20 trieu dong."}
    ]
    tool_res = call_stream({
        "model": m,
        "messages": call_msgs,
        "tools": tool_schema,
        "tool_choice": "auto",
        "max_tokens": 300,
        "stream": True
    })
    tool_call = tool_res["tools"].get(0)
    tool_ok = bool(tool_call and tool_call["name"] == "search_laptop_catalog" and tool_call["id"])
    print(f"  [2] Tool: ok={tool_ok}, tools={tool_res['tools']}, err={tool_res['error']}")
    sys.stdout.flush()

    # 3. Followup test
    follow_ok = False
    follow_reply = ""
    if tool_ok:
        time.sleep(3)
        follow_msgs = list(call_msgs)
        follow_msgs.append({
            "role": "assistant",
            "content": tool_res["reply"] if tool_res["reply"] else None,
            "tool_calls": [{
                "id": tool_call["id"],
                "type": "function",
                "function": {"name": tool_call["name"], "arguments": tool_call["arguments"]}
            }]
        })
        follow_msgs.append({
            "role": "tool",
            "tool_call_id": tool_call["id"],
            "content": json.dumps({"products": [{"name": "Laptop Demo A", "price_vnd": 17990000}]})
        })
        follow_res = call_stream({
            "model": m,
            "messages": follow_msgs,
            "tools": tool_schema,
            "max_tokens": 300,
            "stream": True
        })
        follow_reply = follow_res["reply"]
        follow_ok = bool(follow_reply) and ("17990000" in follow_reply or "Demo A" in follow_reply)
        print(f"  [3] Followup: ok={follow_ok}, err={follow_res['error']}")
        if follow_reply:
            print(f"      Preview: {follow_reply[:80].strip()}...")
        sys.stdout.flush()

    overall = "PASS" if (text_ok and tool_ok and follow_ok) else ("TEXT_ONLY" if text_ok else "FAIL")
    print(f"  ==> OVERALL RESULT: {overall}")
    results[m] = {
        "overall": overall,
        "text_ok": text_ok,
        "tool_ok": tool_ok,
        "follow_ok": follow_ok,
        "note": t_res["error"] or tool_res["error"] or (follow_res["error"] if tool_ok else None)
    }

print("\n\n================ SUMMARY ================")
for m, r in results.items():
    print(f"{m:22}: {r['overall']} (text={r.get('text_ok')}, tool={r.get('tool_ok')}, follow={r.get('follow_ok')})")

os.makedirs("diagnostics", exist_ok=True)
with open("diagnostics/model_probe_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
print("Saved results to diagnostics/model_probe_results.json")
