import { NextResponse } from 'next/server';
import { getTenant } from '@/lib/tenants';

/**
 * Reseller Checkout API
 *
 * Handles order submission for reseller "light" sites.
 * Orders are emailed to the reseller's orderEmail address.
 * Supports "pay by check" payment method.
 */

// Generate a unique order number
function generateOrderNumber() {
  const date = new Date();
  const timestamp = date.getFullYear().toString().slice(-2) +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

// Format currency
function formatPrice(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

// Generate plain text email body
function generateEmailBody(order, tenant) {
  const { customer, items, subtotal, shipping, total, orderNumber, paymentMethod } = order;

  let body = `
NEW ORDER RECEIVED
==================

Order Number: ${orderNumber}
Date: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}
Payment Method: ${paymentMethod === 'check' ? 'Pay by Check' : paymentMethod}

CUSTOMER INFORMATION
--------------------
Name: ${customer.firstName} ${customer.lastName}
Email: ${customer.email}
Phone: ${customer.phone}

SHIPPING ADDRESS
----------------
${customer.address1}
${customer.address2 ? customer.address2 + '\n' : ''}${customer.city}, ${customer.state} ${customer.zip}
${customer.country}

ORDER ITEMS
-----------
`;

  items.forEach((item, index) => {
    body += `
${index + 1}. ${item.description}
   SKU: ${item.sku}
   Quantity: ${item.quantity}
   ${item.price ? `Price: ${formatPrice(item.price)} each` : ''}
   ${item.price ? `Line Total: ${formatPrice(item.price * item.quantity)}` : ''}
`;
  });

  body += `
ORDER TOTALS
------------
Subtotal: ${formatPrice(subtotal)}
Shipping (DHL Air Service): ${shipping === 0 ? 'FREE' : formatPrice(shipping)}
--------------------------
TOTAL: ${formatPrice(total)}

`;

  if (customer.notes) {
    body += `
CUSTOMER NOTES
--------------
${customer.notes}

`;
  }

  body += `
NEXT STEPS
----------
1. Contact customer at ${customer.email} or ${customer.phone}
2. Send invoice with check payment instructions
3. Provide check mailing address: ${tenant.companyInfo?.address || 'N/A'}
4. Process order once check clears
5. Ship via DHL Air Service

---
This order was submitted through ${tenant.name} website.
`;

  return body;
}

// Generate HTML email body
function generateHtmlEmail(order, tenant) {
  const { customer, items, subtotal, shipping, total, orderNumber, paymentMethod } = order;

  const primaryColor = tenant.colors?.primary || '#2D5A27';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Order - ${orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <tr>
      <td style="background-color: ${primaryColor}; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">New Order Received</h1>
      </td>
    </tr>

    <!-- Order Info -->
    <tr>
      <td style="padding: 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom: 1px solid #eee; padding-bottom: 16px; margin-bottom: 16px;">
          <tr>
            <td>
              <strong style="font-size: 14px; color: #666;">Order Number</strong><br>
              <span style="font-size: 18px; color: #333; font-weight: bold;">${orderNumber}</span>
            </td>
            <td style="text-align: right;">
              <strong style="font-size: 14px; color: #666;">Date</strong><br>
              <span style="font-size: 14px; color: #333;">${new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'America/New_York'
              })}</span>
            </td>
          </tr>
        </table>

        <!-- Payment Method -->
        <div style="background-color: #fff8e1; border-left: 4px solid #ffc107; padding: 12px 16px; margin-bottom: 24px;">
          <strong style="color: #333;">Payment Method:</strong> Pay by Check
        </div>

        <!-- Customer Info -->
        <h2 style="font-size: 16px; color: ${primaryColor}; border-bottom: 2px solid ${primaryColor}; padding-bottom: 8px; margin-bottom: 16px;">Customer Information</h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
          <tr>
            <td style="width: 50%; vertical-align: top; padding-right: 16px;">
              <strong style="color: #666; font-size: 12px;">CONTACT</strong><br>
              <span style="color: #333;">${customer.firstName} ${customer.lastName}</span><br>
              <a href="mailto:${customer.email}" style="color: ${primaryColor};">${customer.email}</a><br>
              <a href="tel:${customer.phone}" style="color: ${primaryColor};">${customer.phone}</a>
            </td>
            <td style="width: 50%; vertical-align: top;">
              <strong style="color: #666; font-size: 12px;">SHIPPING ADDRESS</strong><br>
              <span style="color: #333;">
                ${customer.address1}<br>
                ${customer.address2 ? customer.address2 + '<br>' : ''}
                ${customer.city}, ${customer.state} ${customer.zip}<br>
                ${customer.country}
              </span>
            </td>
          </tr>
        </table>

        <!-- Order Items -->
        <h2 style="font-size: 16px; color: ${primaryColor}; border-bottom: 2px solid ${primaryColor}; padding-bottom: 8px; margin-bottom: 16px;">Order Items</h2>
        <table width="100%" cellpadding="8" cellspacing="0" style="margin-bottom: 24px; border-collapse: collapse;">
          <tr style="background-color: #f5f5f5;">
            <th style="text-align: left; padding: 12px; font-size: 12px; color: #666;">ITEM</th>
            <th style="text-align: center; padding: 12px; font-size: 12px; color: #666;">QTY</th>
            <th style="text-align: right; padding: 12px; font-size: 12px; color: #666;">PRICE</th>
          </tr>
          ${items.map(item => `
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 12px;">
              <strong style="color: #333;">${item.description}</strong><br>
              <span style="font-size: 12px; color: #666;">SKU: ${item.sku}</span>
            </td>
            <td style="text-align: center; padding: 12px; color: #333;">${item.quantity}</td>
            <td style="text-align: right; padding: 12px; color: #333;">${item.price ? formatPrice(item.price * item.quantity) : 'TBD'}</td>
          </tr>
          `).join('')}
        </table>

        <!-- Totals -->
        <table width="100%" cellpadding="8" cellspacing="0" style="margin-bottom: 24px;">
          <tr>
            <td style="text-align: right; color: #666;">Subtotal:</td>
            <td style="text-align: right; width: 120px; color: #333;">${formatPrice(subtotal)}</td>
          </tr>
          <tr>
            <td style="text-align: right; color: #666;">Shipping (DHL Air):</td>
            <td style="text-align: right; color: ${shipping === 0 ? '#4CAF50' : '#333'};">${shipping === 0 ? 'FREE' : formatPrice(shipping)}</td>
          </tr>
          <tr style="border-top: 2px solid #333;">
            <td style="text-align: right; font-size: 18px; font-weight: bold; color: #333; padding-top: 12px;">Total:</td>
            <td style="text-align: right; font-size: 18px; font-weight: bold; color: ${primaryColor}; padding-top: 12px;">${formatPrice(total)}</td>
          </tr>
        </table>

        ${customer.notes ? `
        <!-- Notes -->
        <h2 style="font-size: 16px; color: ${primaryColor}; border-bottom: 2px solid ${primaryColor}; padding-bottom: 8px; margin-bottom: 16px;">Customer Notes</h2>
        <p style="color: #333; background-color: #f9f9f9; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
          ${customer.notes}
        </p>
        ` : ''}

        <!-- Next Steps -->
        <div style="background-color: #e8f5e9; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 12px 0; color: #2e7d32; font-size: 14px;">NEXT STEPS</h3>
          <ol style="margin: 0; padding-left: 20px; color: #333; line-height: 1.8;">
            <li>Contact customer at <a href="mailto:${customer.email}" style="color: ${primaryColor};">${customer.email}</a></li>
            <li>Send invoice with check payment instructions</li>
            <li>Check address: ${tenant.companyInfo?.address || 'N/A'}</li>
            <li>Process order once check clears</li>
            <li>Ship via DHL Air Service (3-5 business days)</li>
          </ol>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #f5f5f5; padding: 16px; text-align: center; font-size: 12px; color: #666;">
        This order was submitted through the ${tenant.name} website.<br>
        &copy; ${new Date().getFullYear()} ${tenant.name}
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { tenant: tenantSlug, customer, items, subtotal, shipping, total, paymentMethod } = body;

    // Validate tenant
    const tenant = getTenant(tenantSlug);
    if (!tenant) {
      return NextResponse.json({ error: 'Invalid tenant' }, { status: 400 });
    }

    // Validate required fields
    if (!customer || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required order data' }, { status: 400 });
    }

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Build order object
    const order = {
      orderNumber,
      customer,
      items,
      subtotal,
      shipping,
      total,
      paymentMethod: paymentMethod || 'check',
      tenant: tenantSlug,
      createdAt: new Date().toISOString(),
    };

    // Prepare email content
    const emailTo = tenant.orderEmail || tenant.companyInfo?.email;
    const emailSubject = `New Order ${orderNumber} - ${customer.firstName} ${customer.lastName}`;
    const emailBody = generateEmailBody(order, tenant);
    const emailHtml = generateHtmlEmail(order, tenant);

    // Log the order (in production, you would send this to a database)
    console.log('='.repeat(60));
    console.log('NEW RESELLER ORDER');
    console.log('='.repeat(60));
    console.log(`Order Number: ${orderNumber}`);
    console.log(`Tenant: ${tenant.name}`);
    console.log(`Customer: ${customer.firstName} ${customer.lastName}`);
    console.log(`Email: ${customer.email}`);
    console.log(`Items: ${items.length}`);
    console.log(`Total: ${formatPrice(total)}`);
    console.log(`Send to: ${emailTo}`);
    console.log('='.repeat(60));

    // In production, send email using your email service (SendGrid, Resend, etc.)
    // For now, we'll use a mailto: fallback or log to console

    // Option 1: Use an email API like Resend (when configured)
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (RESEND_API_KEY) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'orders@introcar.com',
            to: emailTo,
            cc: customer.email, // Send copy to customer
            subject: emailSubject,
            html: emailHtml,
            text: emailBody,
          }),
        });

        if (!emailResponse.ok) {
          console.error('Email send failed:', await emailResponse.text());
          // Continue anyway - order was placed
        } else {
          console.log('Order email sent successfully');
        }
      } catch (emailError) {
        console.error('Email service error:', emailError);
        // Continue anyway - order was placed
      }
    } else {
      // No email service configured - log the email content
      console.log('Email service not configured. Order email content:');
      console.log('To:', emailTo);
      console.log('Subject:', emailSubject);
      console.log('Body:', emailBody);
    }

    // Store order in database (when configured)
    // TODO: Add Supabase order storage

    return NextResponse.json({
      success: true,
      orderNumber,
      message: 'Order submitted successfully',
      emailSent: !!RESEND_API_KEY,
      emailTo,
    });
  } catch (error) {
    console.error('Reseller checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to process order', details: error.message },
      { status: 500 }
    );
  }
}
