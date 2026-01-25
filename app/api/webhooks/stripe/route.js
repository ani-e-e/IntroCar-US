import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Webhook secret from Stripe Dashboard
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  let event;

  // Verify webhook signature
  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // For development without webhook secret (not recommended for production)
      console.warn('⚠️ Webhook secret not configured - skipping signature verification');
      event = JSON.parse(body);
    }
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('✅ Payment successful for session:', session.id);

        // Fetch full session details with line items
        const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ['line_items.data.price.product'],
        });

        // Extract order data for Magento
        const orderData = await extractOrderData(fullSession);

        // Send to Magento
        await sendToMagento(orderData);

        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object;
        console.log('⏰ Checkout session expired:', session.id);
        // Optionally handle abandoned carts
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.log('❌ Payment failed:', paymentIntent.id);
        // Optionally notify customer or log for review
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('❌ Error processing webhook:', err);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Extract order data from Stripe session for Magento
 *
 * IMPORTANT: Magento orders should be in GBP (the database currency)
 * The GBP prices are stored in session.metadata.itemsGbp during checkout
 */
async function extractOrderData(session) {
  // Parse GBP items from metadata (stored during checkout)
  let gbpItemsMap = {};
  try {
    if (session.metadata?.itemsGbp) {
      const gbpItems = JSON.parse(session.metadata.itemsGbp);
      gbpItemsMap = gbpItems.reduce((acc, item) => {
        acc[item.sku] = item.priceGbp;
        return acc;
      }, {});
    }
  } catch (e) {
    console.warn('⚠️ Could not parse GBP items from metadata:', e);
  }

  // Extract order items with GBP prices for Magento
  const items = session.line_items?.data.map(item => {
    const sku = item.price?.product?.metadata?.sku || extractSkuFromDescription(item.description);
    // Use GBP price from metadata, falling back to product metadata, then USD price
    const priceGbp = gbpItemsMap[sku] ||
                     parseFloat(item.price?.product?.metadata?.priceGbp) ||
                     (item.amount_total / 100 / item.quantity); // Fallback to USD if GBP not available

    return {
      name: item.description,
      sku: sku,
      qty: item.quantity,
      price: priceGbp, // GBP price for Magento
      priceUsd: item.amount_total / 100 / item.quantity, // USD price (what customer paid)
      rowTotal: priceGbp * item.quantity, // GBP row total
      rowTotalUsd: item.amount_total / 100, // USD row total
    };
  }) || [];

  // Calculate GBP totals for Magento
  const gbpSubtotal = items.reduce((sum, item) => sum + item.rowTotal, 0);

  const orderData = {
    // Order identification
    stripeSessionId: session.id,
    stripePaymentIntentId: session.payment_intent,

    // Customer information
    customer: {
      email: session.customer_details?.email,
      name: session.customer_details?.name,
      phone: session.customer_details?.phone,
    },

    // Billing address (if collected)
    billingAddress: session.customer_details?.address ? {
      street: [
        session.customer_details.address.line1,
        session.customer_details.address.line2,
      ].filter(Boolean),
      city: session.customer_details.address.city,
      region: session.customer_details.address.state,
      postcode: session.customer_details.address.postal_code,
      countryId: session.customer_details.address.country,
    } : null,

    // Shipping address
    shippingAddress: session.shipping_details?.address ? {
      street: [
        session.shipping_details.address.line1,
        session.shipping_details.address.line2,
      ].filter(Boolean),
      city: session.shipping_details.address.city,
      region: session.shipping_details.address.state,
      postcode: session.shipping_details.address.postal_code,
      countryId: session.shipping_details.address.country,
      firstname: session.shipping_details.name?.split(' ')[0] || '',
      lastname: session.shipping_details.name?.split(' ').slice(1).join(' ') || '',
    } : null,

    // Order items (with GBP prices for Magento)
    items: items,

    // Order totals - GBP for Magento
    totals: {
      subtotal: gbpSubtotal, // GBP subtotal for Magento
      shipping: 0, // Shipping will be calculated separately or added manually
      tax: 0, // Tax handled separately
      grandTotal: gbpSubtotal, // GBP grand total for Magento
      currency: 'GBP', // Magento order currency
    },

    // USD totals (what customer actually paid)
    totalsUsd: {
      subtotal: session.amount_subtotal / 100,
      shipping: session.shipping_cost?.amount_total ? session.shipping_cost.amount_total / 100 : 0,
      tax: session.total_details?.amount_tax ? session.total_details.amount_tax / 100 : 0,
      grandTotal: session.amount_total / 100,
      currency: 'USD',
    },

    // Payment info
    payment: {
      method: 'stripe',
      status: session.payment_status,
      amountPaidUsd: session.amount_total / 100, // USD amount charged
      currency: 'USD', // Payment was in USD
    },

    // Metadata (includes SKUs we stored during checkout)
    metadata: session.metadata,

    // Timestamps
    createdAt: new Date(session.created * 1000).toISOString(),
  };

  console.log('📦 Extracted order data (GBP for Magento):', JSON.stringify(orderData, null, 2));
  return orderData;
}

/**
 * Extract SKU from item description (format: "Description | SKU: XXX")
 */
function extractSkuFromDescription(description) {
  const match = description?.match(/SKU:\s*([^\s|]+)/i);
  return match ? match[1] : null;
}

/**
 * Send order to Magento 2 REST API
 *
 * Documentation: https://developer.adobe.com/commerce/webapi/rest/
 */
async function sendToMagento(orderData) {
  const magentoBaseUrl = process.env.MAGENTO_BASE_URL;
  const magentoAccessToken = process.env.MAGENTO_ACCESS_TOKEN;

  if (!magentoBaseUrl || !magentoAccessToken) {
    console.log('⚠️ Magento credentials not configured. Order data:');
    console.log(JSON.stringify(orderData, null, 2));
    console.log('\nTo enable Magento integration, add these environment variables:');
    console.log('- MAGENTO_BASE_URL (e.g., https://your-store.com)');
    console.log('- MAGENTO_ACCESS_TOKEN (from Magento Admin > System > Integrations)');
    return;
  }

  try {
    // Option 1: Create a guest order via Magento REST API
    // This creates an order without requiring customer login

    // First, create a guest cart
    const cartResponse = await fetch(`${magentoBaseUrl}/rest/V1/guest-carts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${magentoAccessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!cartResponse.ok) {
      throw new Error(`Failed to create cart: ${await cartResponse.text()}`);
    }

    const cartId = await cartResponse.json();
    console.log('🛒 Created Magento cart:', cartId);

    // Add items to cart
    for (const item of orderData.items) {
      if (!item.sku) {
        console.warn('⚠️ Skipping item without SKU:', item.name);
        continue;
      }

      const addItemResponse = await fetch(`${magentoBaseUrl}/rest/V1/guest-carts/${cartId}/items`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${magentoAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItem: {
            sku: item.sku,
            qty: item.qty,
            quote_id: cartId,
          },
        }),
      });

      if (!addItemResponse.ok) {
        console.warn(`⚠️ Failed to add item ${item.sku}:`, await addItemResponse.text());
      }
    }

    // Set shipping address
    if (orderData.shippingAddress) {
      const shippingResponse = await fetch(`${magentoBaseUrl}/rest/V1/guest-carts/${cartId}/shipping-information`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${magentoAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addressInformation: {
            shipping_address: {
              email: orderData.customer.email,
              firstname: orderData.shippingAddress.firstname,
              lastname: orderData.shippingAddress.lastname,
              street: orderData.shippingAddress.street,
              city: orderData.shippingAddress.city,
              region: orderData.shippingAddress.region,
              postcode: orderData.shippingAddress.postcode,
              country_id: orderData.shippingAddress.countryId,
              telephone: orderData.customer.phone || '000-000-0000',
            },
            billing_address: {
              email: orderData.customer.email,
              firstname: orderData.shippingAddress.firstname,
              lastname: orderData.shippingAddress.lastname,
              street: orderData.billingAddress?.street || orderData.shippingAddress.street,
              city: orderData.billingAddress?.city || orderData.shippingAddress.city,
              region: orderData.billingAddress?.region || orderData.shippingAddress.region,
              postcode: orderData.billingAddress?.postcode || orderData.shippingAddress.postcode,
              country_id: orderData.billingAddress?.countryId || orderData.shippingAddress.countryId,
              telephone: orderData.customer.phone || '000-000-0000',
            },
            shipping_carrier_code: 'flatrate', // Adjust based on your Magento shipping methods
            shipping_method_code: 'flatrate',
          },
        }),
      });

      if (!shippingResponse.ok) {
        console.warn('⚠️ Failed to set shipping:', await shippingResponse.text());
      }
    }

    // Place the order (payment already collected via Stripe)
    const placeOrderResponse = await fetch(`${magentoBaseUrl}/rest/V1/guest-carts/${cartId}/payment-information`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${magentoAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: orderData.customer.email,
        paymentMethod: {
          method: 'checkmo', // Use a simple payment method since payment was already collected
          additional_data: {
            stripe_session_id: orderData.stripeSessionId,
            stripe_payment_intent: orderData.stripePaymentIntentId,
          },
        },
      }),
    });

    if (!placeOrderResponse.ok) {
      throw new Error(`Failed to place order: ${await placeOrderResponse.text()}`);
    }

    const orderId = await placeOrderResponse.json();
    console.log('✅ Magento order created:', orderId);

    // Optionally, add a comment to the order noting it was paid via Stripe
    await fetch(`${magentoBaseUrl}/rest/V1/orders/${orderId}/comments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${magentoAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        statusHistory: {
          comment: `Payment collected via Stripe. Session ID: ${orderData.stripeSessionId}`,
          is_customer_notified: 0,
          is_visible_on_front: 0,
        },
      }),
    });

    return orderId;
  } catch (error) {
    console.error('❌ Error sending order to Magento:', error);

    // Store failed order for manual review/retry
    // In production, you might want to store this in a database or send an alert
    console.log('📝 Order data for manual processing:', JSON.stringify(orderData, null, 2));

    throw error;
  }
}
