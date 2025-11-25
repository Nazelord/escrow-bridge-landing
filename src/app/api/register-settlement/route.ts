import { NextRequest, NextResponse } from 'next/server';

const CHAINSETTLE_API = process.env.NEXT_PUBLIC_CHAINSETTLE_API || "https://api.chainsettle.tech/";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.salt || !body.settlement_id || !body.recipient_email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Forward request to ChainSettle API
    const response = await fetch(`${CHAINSETTLE_API}/settlement/register_settlement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        salt: body.salt,
        settlement_id: body.settlement_id,
        recipient_email: body.recipient_email,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ChainSettle API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to register settlement', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Settlement registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
