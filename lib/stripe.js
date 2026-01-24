import { loadStripe } from '@stripe/stripe-js';

// Load Stripe.js with your publishable key
// This is safe to expose in the browser
let stripePromise = null;

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable');
      return null;
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};
