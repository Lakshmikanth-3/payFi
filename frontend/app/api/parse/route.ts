import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const PayFi_SYSTEM_PROMPT = `
You are PayFi, a payment program parser for HashKey Chain.
Your job is to convert natural language payment instructions into a structured PaymentProgram JSON object.

TERMINOLOGY:
- "HSK", "HashKey", "Native", "Coal" all refer to address(0).

HASHKEY TESTNET TOKEN ADDRESSES (ChainID 133):
- HSK: address(0)
- USDT: 0xbE6cAD380f232d848C788d2d7D65DC9A50d2eCC3
- USDC: 0x298453531F107baE05973A72102868297771746fCd
- WETH: 0xefd4bC9afD210517803f293ABABd701CaeeCdfd0FF

INSTRUCTIONS:
- If a user says "this address: 0x...", ignore the "this address:" part and use the hex value.
- If no token is mentioned, assume HSK.
- If a frequency like "every week" or "recurring" is mentioned, set trigger.type to "CRON".
- For "send once" or immediate single payments, set trigger.type to "MANUAL".

ALWAYS respond with valid JSON matching this schema:
{
  "trigger": {
    "type": "CRON" | "ON_RECEIVE" | "MANUAL",
    "cronInterval": number (seconds),
    "cronDescription": "human readable description"
  },
  "rules": [
    {
      "recipient": "0x wallet address",
      "amountType": 0,
      "fixedAmount": "amount as string (e.g. '0.0001')",
      "percentBps": 0,
      "token": "0x contract address (use the REAL addresses above)",
      "tokenSymbol": "USDC" | "USDT" | "HSK" | "WETH",
      "description": "rule summary"
    }
  ],
  "receiptEnabled": true,
  "summary": "overall summary",
  "estimatedGasHSK": "0.000021",
  "warnings": []
}

No markdown formatting. No preamble. Just pure JSON.
`.trim();

async function attemptParse(modelName: string, prompt: string, history: any[], apiKey: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  // We use the prompt-injection method for maximum compatibility across all model versions
  const genModel = genAI.getGenerativeModel({ model: modelName });
  
  const mappedHistory = history.map((m: any) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));
  
  const chat = genModel.startChat({ history: mappedHistory });
  const fullPrompt = `${PayFi_SYSTEM_PROMPT}\n\nUSER INTENT: ${prompt}`;
  
  const result = await chat.sendMessage(fullPrompt);
  return result.response.text();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, history = [] } = body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) throw new Error("API Key missing");

    // We try models in priority order based on the earlier diagnostic list
    const modelsToTry = ["gemini-3-flash-preview", "gemini-1.5-flash", "gemini-pro"];
    let lastError = null;
    let text = "";

    for (const model of modelsToTry) {
      try {
        console.log(`Attempting parse with ${model}...`);
        text = await attemptParse(model, prompt, history, apiKey);
        if (text) break;
      } catch (err: any) {
        lastError = err;
        console.warn(`${model} failed:`, err.message);
        // If it's a 404, we immediately try the next one. 
        // If it's a 429, we also try the next one to use a different quota pool.
        continue;
      }
    }

    if (!text && lastError) throw lastError;

    try {
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      const jsonStr = text.slice(jsonStart, jsonEnd);
      const parsed = JSON.parse(jsonStr);
      return NextResponse.json(parsed);
    } catch (parseErr) {
      console.error("JSON Parse Error:", text);
      return NextResponse.json({ error: "Invalid AI response format" }, { status: 500 });
    }
  } catch (err: any) {
    console.error("General Parse Error:", err);
    return NextResponse.json({ error: err.message || "Internal parse error" }, { status: 500 });
  }
}
