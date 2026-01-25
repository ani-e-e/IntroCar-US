import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export async function POST(request) {
  // Rate limit: 10 checkout attempts per minute per IP
  const clientIp = getClientIp(request);
  const rateLimitResult = checkRateLimit(clientIp, 10, 60000);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.reset.toString(),
        },
      }
    );
  }

  try {
    const { items, shipping } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      );
    }

    // Create line items for Stripe
    // Note: item.price is USD (for Stripe), item.priceGbp is GBP (for Magento)
    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.description || item.name,
          description: `SKU: ${item.sku}${item.stockType ? ` | ${item.stockType}` : ''}`,
          images: item.image ? [item.image] : [],
          metadata: {
            sku: item.sku,
            stockType: item.stockType || '',
            priceGbp: (item.priceGbp || item.price).toString(), // GBP price for Magento
          },
        },
        // Stripe expects amounts in cents (USD)
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Add shipping as a line item if applicable
    if (shipping && shipping.price > 0 && !shipping.freeShipping) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Shipping - ${shipping.name || 'Standard'}`,
            description: shipping.deliveryTime || 'Delivery estimate provided at checkout',
          },
          unit_amount: Math.round(shipping.price * 100),
        },
        quantity: 1,
      });
    }

    // Get the base URL for redirects
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
                   (request.headers.get('origin') || 'http://localhost:3000');

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      // Collect shipping address
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      // Allow promo codes
      allow_promotion_codes: true,
      // Success and cancel URLs
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
      // Store metadata for order processing
      // GBP prices stored for Magento order creation
      metadata: {
        source: 'introcar_us_website',
        itemCount: items.length.toString(),
        itemSkus: items.map(i => i.sku).join(','),
        // Store GBP prices and quantities for Magento (JSON format)
        itemsGbp: JSON.stringify(items.map(i => ({
          sku: i.sku,
          priceGbp: i.priceGbp || i.price,
          quantity: i.quantity,
        }))),
      },
      // Custom text
      custom_text: {
        submit: {
          message: 'Your order will be processed within 1 business day.',
        },
      },
      // Automatic tax calculation (optional - requires Stripe Tax setup)
      // automatic_tax: { enabled: true },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
