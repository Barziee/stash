import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;
  if (!apiKey || apiKey === 'your-key-here') {
    return NextResponse.json({ usdToNis: 3.7, source: 'fallback' });
  }

  try {
    const res = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/pair/USD/ILS`,
      { next: { revalidate: 86400 } } // cache 24h server-side
    );
    const data = await res.json();
    const usdToNis: number = data.conversion_rate;
    return NextResponse.json({ usdToNis });
  } catch {
    return NextResponse.json({ usdToNis: 3.7, source: 'fallback' });
  }
}
