import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for IntroCar USA. Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-introcar-charcoal text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-display font-light">
            Privacy Policy
          </h1>
          <p className="text-gray-400 mt-2">Last updated: January 2024</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="prose prose-gray max-w-none">
            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">1. Information We Collect</h2>
            <p className="text-gray-600 mb-6">
              We collect information you provide when placing orders, creating an account, or contacting us.
              This includes your name, email address, shipping address, phone number, and payment information.
              We also collect technical data such as IP address, browser type, and pages visited.
            </p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-600 mb-6">
              We use your information to process orders, communicate about your purchases, provide customer
              support, improve our services, and send marketing communications (with your consent). We may
              also use your information to comply with legal obligations.
            </p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">3. Information Sharing</h2>
            <p className="text-gray-600 mb-6">
              We share your information with shipping carriers to deliver your orders, payment processors
              to handle transactions, and service providers who assist our operations. We do not sell your
              personal information to third parties.
            </p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">4. Data Security</h2>
            <p className="text-gray-600 mb-6">
              We implement appropriate security measures to protect your personal information. Payment
              details are processed securely and we do not store full credit card numbers. However, no
              internet transmission is completely secure.
            </p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">5. Cookies</h2>
            <p className="text-gray-600 mb-6">
              We use cookies to improve your browsing experience, remember your preferences, and analyze
              site usage. You can control cookies through your browser settings. Some features may not
              work properly if cookies are disabled.
            </p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">6. Your Rights</h2>
            <p className="text-gray-600 mb-6">
              You have the right to access, correct, or delete your personal information. You can
              unsubscribe from marketing emails at any time. To exercise these rights, please contact us.
            </p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">7. Data Retention</h2>
            <p className="text-gray-600 mb-6">
              We retain your personal information for as long as necessary to provide our services and
              comply with legal obligations. Order records are kept for accounting and warranty purposes.
            </p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">8. Children's Privacy</h2>
            <p className="text-gray-600 mb-6">
              Our services are not intended for children under 16. We do not knowingly collect information
              from children. If you believe a child has provided us information, please contact us.
            </p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">9. Changes to This Policy</h2>
            <p className="text-gray-600 mb-6">
              We may update this privacy policy from time to time. Changes will be posted on this page
              with an updated revision date.
            </p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">10. Contact Us</h2>
            <p className="text-gray-600 mb-6">
              For questions about this privacy policy or your personal information, please contact us at{' '}
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
