import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Missing session_id parameter' },
      { status: 400 }
    );
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer', 'shipping_details'],
    });

    // Return only the data we need for the success page
    return NextResponse.json({
      id: session.id,
      status: session.status,
      paymentStatus: session.payment_status,
      customerEmail: session.customer_details?.email,
      customerName: session.customer_details?.name,
      amountTotal: session.amount_total / 100, // Convert from cents
      currency: session.currency,
      shippingAddress: session.shipping_details?.address ? {
        line1: session.shipping_details.address.line1,
        line2: session.shipping_details.address.line2,
        city: session.shipping_details.address.city,
        state: session.shipping_details.address.state,
        postalCode: session.shipping_details.address.postal_code,
        country: session.shipping_details.address.country,
      } : null,
      lineItems: session.line_items?.data.map(item => ({
        description: item.description,
        quantity: item.quantity,
        amount: item.amount_total / 100,
      })) || [],
      metadata: session.metadata,
      created: session.created,
    });
  } catch (error) {
    console.error('Error retrieving session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve session' },
      { status: 500 }
    );
  }
}
