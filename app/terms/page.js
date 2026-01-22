import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Terms & Conditions',
  description: 'Terms and conditions for IntroCar USA. Read our terms of service and purchase conditions.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-introcar-charcoal text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-display font-light">
            Terms & Conditions
          </h1>
          <p className="text-gray-400 mt-2">Last updated: January 2024</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="prose prose-gray max-w-none">
            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">1. Introduction</h2>
            <p className="text-gray-600 mb-6">
              These terms and conditions govern your use of the IntroCar website and the purchase
              of products from us. By using this website or placing an order, you agree to be bound
              by these terms.
            </p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">2. Orders and Pricing</h2>
            <p className="text-gray-600 mb-6">
              All prices are displayed in USD and exclude shipping costs and any applicable import
              duties or taxes. We reserve the right to change prices without notice. Orders are
              subject to availability and acceptance.
            </p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">3. Payment</h2>
            <p className="text-gray-600 mb-6">
              Payment is required at the time of ordering. We accept major credit cards, debit cards,
              and PayPal. All payments are processed securely through our payment providers.
            </p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">4. Delivery</h2>
            <p className="text-gray-600 mb-6">
              We aim to dispatch orders within 1-2 business days. Delivery times vary by destination
              and shipping method selected. Risk of loss transfers to you upon delivery. See our
              Shipping page for full details.
            </p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">5. Returns and Refunds</h2>
            <p className="text-gray-600 mb-6">
              Unused items may be returned within 30 days of receipt for a refund. Items must be in
              original condition and packaging. Return shipping is at the customer's expense.
              Electrical items cannot be returned once fitted. Contact us before returning any items.
            </p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">6. Warranty</h2>
            <p className="text-gray-600 mb-6">
              Prestige Parts® products carry a 3-year worldwide warranty. Other products carry
              manufacturer warranties where applicable. Warranty claims must be made in writing
              with proof of purchase.
            </p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">7. Liability</h2>
            <p className="text-gray-600 mb-6">
              Our liability is limited to the purchase price of the products. We are not liable for
              indirect, consequential, or incidental damages. Parts should be installed by qualified
              technicians.
            </p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">8. Intellectual Property</h2>
            <p className="text-gray-600 mb-6">
              All content on this website is owned by IntroCar or its licensors. Prestige Parts® is
              a registered trademark. You may not use our content without written permission.
            </p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">9. Governing Law</h2>
            <p className="text-gray-600 mb-6">
              These terms are governed by English law. Any disputes shall be subject to the exclusive
              jurisdiction of the English courts.
            </p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">10. Contact</h2>
            <p className="text-gray-600 mb-6">
              For questions about these terms, please contact us at{' '}
              <a href="mailto:sales@introcar.com" className="text-introcar-blue hover:underline">
                sales@introcar.com
              </a>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
