export interface PaymentProgram {
  trigger: {
    type: 'CRON' | 'ON_RECEIVE' | 'MANUAL';
    cronInterval: number;
    cronDescription: string;
  };
  rules: Array<{
    recipient: string;
    amountType: 0 | 1 | 2;
    fixedAmount: string;
    percentBps: number;
    token: string;
    tokenSymbol: string;
    description: string;
  }>;
  receiptEnabled: boolean;
  summary: string;
  estimatedGasHSK: string;
  warnings: string[];
}

export async function parsePaymentIntent(
  userPrompt: string,
  conversationHistory: Array<{ role: string; content: string }> = []
): Promise<PaymentProgram> {
  const response = await fetch('/api/parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: userPrompt, history: conversationHistory })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Parse API Error:", errorText);
    throw new Error('Failed to parse intent');
  }

  const data = await response.json();
  return data as PaymentProgram;
}
