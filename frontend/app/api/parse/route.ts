import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const PayFi_SYSTEM_PROMPT = `
You are PayFi, a payment program parser for HashKey Chain.
Your job is to convert natural language payment instructions into a structured PaymentProgram JSON object.

HASHKEY TESTNET TOKEN ADDRESSES (ChainID 133):
- HSK: address(0)
- USDT: 0xbE6cAD380f232d848C788d2d7D65DC9A50d2eCC3
- USDC: 0x298453531F107baE05973A72102868297771746fCd
- WETH: 0xefd4bC9afD210517803f293ABABd701CaeeCdfd0FF

NETWORK SPECS:
- Mainnet ChainID: 177 | Explorer: https://hashkey.blockscout.com
- Testnet ChainID: 133 | Explorer: https://testnet-explorer.hsk.xyz
- Settlement: HSP (HashKey Settlement Protocol)

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
      "amountType": 0 | 1 | 2,
      "fixedAmount": "amount as string (e.g. '100')",
      "percentBps": number (0-10000),
      "token": "0x contract address (use the REAL addresses above)",
      "tokenSymbol": "USDC" | "USDT" | "HSK" | "WETH",
      "description": "rule summary"
    }
  ],
  "receiptEnabled": boolean,
  "summary": "overall summary",
  "estimatedGasHSK": "string gas est",
  "warnings": ["string warning"]
}

amountType: 0=fixed, 1=%, 2=equal share.

IMPORTANT: 
- Use the REAL contract addresses provided above for the 'token' field.
- No markdown formatting. No preamble. Just pure JSON.
`.trim();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, history = [] } = body;

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("API Key missing");
    }

    const genModel = genAI.getGenerativeModel({ 
      model: "gemini-3-flash-preview",
      systemInstruction: PayFi_SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: "application/json",
      }
    });
    
    // Format history for Gemini
    const mappedHistory = history.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));
    
    const chat = genModel.startChat({
      history: mappedHistory,
    });
    
    const result = await chat.sendMessage(prompt);
    const text = result.response.text();
    console.log("Gemini Response:", text);
    
    return NextResponse.json(JSON.parse(text.trim()));
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
