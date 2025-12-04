import { NextRequest, NextResponse } from 'next/server';

const CHAINSETTLE_API = process.env.NEXT_PUBLIC_CHAINSETTLE_API || "https://api.chainsettle.tech";

export async function POST(request: NextRequest) {
  console.log('API Route called: /api/register_settlement');
  try {
    const body = await request.json();
    console.log('Received body:', body);
    
    // Validate required fields (matching Python CLI format)
    if (!body.salt || !body.settlement_id || !body.recipient_email) {
      console.error('Validation failed - missing fields:', {
        hasSalt: !!body.salt,
        hasSettlementId: !!body.settlement_id,
        hasRecipientEmail: !!body.recipient_email
      });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const apiUrl = `${CHAINSETTLE_API}/settlement/register_settlement`;
    const payload = {
      salt: body.salt,
      settlement_id: body.settlement_id,
      recipient_email: body.recipient_email,
    };
    
    console.log('Calling ChainSettle API:', apiUrl);
    console.log('With payload:', payload);

    // Forward request to ChainSettle API (exactly like Python CLI)
    let response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    // If 404, try with trailing slash
    if (response.status === 404) {
      console.log('Got 404, trying with trailing slash...');
      const apiUrlWithSlash = `${apiUrl}/`;
      response = await fetch(apiUrlWithSlash, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ChainSettle API error:', errorText);
      console.error('Response status:', response.status);
      console.error('Response headers:', Object.fromEntries(response.headers.entries()));
      
      return NextResponse.json(
        { error: 'Failed to register settlement', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('ChainSettle API success:', data);
    return NextResponse.json(data);

  } catch (error) {
    console.error('Settlement registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
