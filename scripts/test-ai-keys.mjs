import fs from "fs";
import path from "path";

// Read .env file directly
const envPath = path.resolve(process.cwd(), ".env");
let rawKeys = "";

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  const match = content.match(/^AI_API_KEYS\s*=\s*(.+)$/m);
  if (match && match[1]) {
    rawKeys = match[1].trim().replace(/^["']|["']$/g, "");
  }
}

const keys = rawKeys
  .split(",")
  .map((k) => k.trim())
  .filter((k) => Boolean(k) && !k.includes("your_groq_api_key"));

console.log(`\n======================================================`);
console.log(`🤖 BYTEVERSE AI KEY POOL HEALTH CHECK (${keys.length} Keys Found)`);
console.log(`======================================================\n`);

if (keys.length === 0) {
  console.error("❌ No keys found in .env under AI_API_KEYS!");
  process.exit(1);
}

async function testAllKeys() {
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const masked = `${key.slice(0, 8)}••••••••${key.slice(-4)}`;
    const t0 = Date.now();
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "qwen/qwen3.8-27b",
          messages: [{ role: "user", content: "Say 'Operational' in 1 word." }],
          max_tokens: 15,
        }),
      });

      const latency = Date.now() - t0;
      const data = await res.json();

      if (res.ok) {
        const reply = data.choices?.[0]?.message?.content?.trim() || "OK";
        console.log(`[PASS] Key #${i + 1} (${masked}) -> Status: HEALTHY | Latency: ${latency}ms | Reply: "${reply}"`);
      } else {
        console.error(`[FAIL] Key #${i + 1} (${masked}) -> Status: ERROR | Latency: ${latency}ms | Reason: ${data.error?.message}`);
      }
    } catch (err) {
      console.error(`[ERROR] Key #${i + 1} (${masked}) -> Connection failed: ${err.message}`);
    }
  }
  console.log(`\n======================================================`);
  console.log(`✅ Health check completed for all ${keys.length} accounts.`);
  console.log(`======================================================\n`);
}

testAllKeys();
