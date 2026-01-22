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
          <h1 className="text-3xl md:text-4xl font-display font-light text-white">
            Privacy Policy
          </h1>
          <p className="text-gray-400 mt-2">Last updated: January 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6 text-lg">
              IntroCar Ltd ("IntroCar", "we", "us", "our") is committed to protecting your privacy. This policy
              explains how we collect, use, and safeguard your personal information when you use our website
              (introcar.us) or purchase products from us.
            </p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">1. Data Controller</h2>
            <p className="text-gray-600 mb-6">
              IntroCar Ltd is the data controller for personal information collected through this website.
              Our registered address is Units C & D The Pavilions, 2 East Road, Wimbledon, London SW19 1UW, United Kingdom.
              Company Registration Number: 02105867. For data protection inquiries, contact us at{' '}
              <a href="mailto:sales@introcar.com" className="text-introcar-blue hover:underline">sales@introcar.com</a>.
            </p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">2. Information We Collect</h2>
            <p className="text-gray-600 mb-4">
              <strong>Information you provide:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>Name, email address, and phone number when placing orders or contacting us</li>
              <li>Shipping and billing addresses</li>
              <li>Payment information (processed securely by our payment providers)</li>
              <li>Vehicle information you provide for parts matching</li>
              <li>Communications you send us</li>
              <li>Account information if you create a customer account</li>
            </ul>
            <p className="text-gray-600 mb-4">
              <strong>Information collected automatically:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>IP address and approximate location</li>
              <li>Browser type and version</li>
              <li>Device information and operating system</li>
              <li>Pages visited and time spent on our website</li>
              <li>Referring website or source</li>
              <li>Cookie data (see Cookie Policy section)</li>
            </ul>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">
              We use your personal information for the following purposes:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li><strong>Order fulfillment:</strong> Processing and shipping your orders, providing order confirmations and tracking information</li>
              <li><strong>Customer service:</strong> Responding to inquiries, providing technical support, and handling returns or warranty claims</li>
              <li><strong>Payment processing:</strong> Securely processing your payments through our payment providers</li>
              <li><strong>Communications:</strong> Sending transactional emails about your orders and, with your consent, marketing communications about products and offers</li>
              <li><strong>Website improvement:</strong> Analyzing usage patterns to improve our website and services</li>
              <li><strong>Fraud prevention:</strong> Protecting against fraudulent transactions and unauthorized access</li>
              <li><strong>Legal compliance:</strong> Complying with legal obligations and protecting our rights</li>
            </ul>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">4. Legal Basis for Processing (GDPR)</h2>
            <p className="text-gray-600 mb-4">
              We process your personal information under the following legal bases:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li><strong>Contract:</strong> Processing necessary to fulfill our contract with you when you place an order</li>
              <li><strong>Legitimate interests:</strong> Processing necessary for our legitimate business interests, such as fraud prevention and website improvement</li>
              <li><strong>Consent:</strong> Processing based on your consent, such as marketing communications (you can withdraw consent at any time)</li>
              <li><strong>Legal obligation:</strong> Processing necessary to comply with legal requirements</li>
            </ul>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">5. Information Sharing</h2>
            <p className="text-gray-600 mb-4">
              We share your personal information with the following categories of third parties:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li><strong>Shipping carriers:</strong> DHL and other carriers to deliver your orders</li>
              <li><strong>Payment processors:</strong> Stripe, PayPal, or other payment services to process transactions</li>
              <li><strong>IT service providers:</strong> Hosting, email, and other technical services</li>
              <li><strong>Analytics providers:</strong> Google Analytics and similar services for website analysis</li>
              <li><strong>Professional advisors:</strong> Lawyers, accountants, and auditors as necessary</li>
              <li><strong>Legal authorities:</strong> When required by law or to protect our rights</li>
            </ul>
            <p className="text-gray-600 mb-6">
              <strong>We do not sell your personal information to third parties.</strong> We only share data necessary
              for the purposes described above and require our service providers to protect your information appropriately.
            </p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">6. International Data Transfers</h2>
            <p className="text-gray-600 mb-6">
              Your information may be transferred to and processed in countries outside your country of residence,
              including the United States and the United Kingdom. When we transfer data internationally, we ensure
              appropriate safeguards are in place, such as standard contractual clauses approved by relevant authorities.
            </p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">7. Data Security</h2>
            <p className="text-gray-600 mb-4">
              We implement appropriate technical and organizational measures to protect your personal information:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>SSL/TLS encryption for data transmission</li>
              <li>Secure payment processing through PCI-compliant providers (we do not store full credit card numbers)</li>
              <li>Access controls limiting employee access to personal information</li>
              <li>Regular security assessments and updates</li>
            </ul>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">8. Cookies and Tracking</h2>
            <p className="text-gray-600 mb-4">
              We use cookies and similar technologies to improve your experience on our website:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li><strong>Essential cookies:</strong> Required for website functionality (shopping cart, checkout, login)</li>
              <li><strong>Analytics cookies:</strong> Help us understand how visitors use our website</li>
              <li><strong>Preference cookies:</strong> Remember your preferences (vehicle selection, currency)</li>
              <li><strong>Marketing cookies:</strong> Used to deliver relevant advertisements (with your consent)</li>
            </ul>
            <p className="text-gray-600 mb-6">
              You can control cookies through your browser settings. Please note that disabling certain cookies may
              affect website functionality. For more information, see our cookie preferences in the website footer.
            </p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">9. Your Rights</h2>
            <p className="text-gray-600 mb-4">
              Depending on your location, you may have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal information</li>
              <li><strong>Rectification:</strong> Request correction of inaccurate information</li>
              <li><strong>Erasure:</strong> Request deletion of your personal information (subject to legal retention requirements)</li>
              <li><strong>Restriction:</strong> Request limitation of processing in certain circumstances</li>
              <li><strong>Portability:</strong> Receive your data in a portable format</li>
              <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
              <li><strong>Withdraw consent:</strong> Withdraw consent for marketing communications at any time</li>
            </ul>
            <p className="text-gray-600 mb-6">
              To exercise these rights, contact us at <a href="mailto:sales@introcar.com" className="text-introcar-blue hover:underline">sales@introcar.com</a>.
              We will respond to your request within 30 days. You also have the right to lodge a complaint with
              your local data protection authority.
            </p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">10. California Privacy Rights (CCPA)</h2>
            <p className="text-gray-600 mb-4">
              If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>Right to know what personal information we collect, use, and disclose</li>
              <li>Right to request deletion of your personal information</li>
              <li>Right to opt out of the sale of personal information (we do not sell personal information)</li>
              <li>Right to non-discrimination for exercising your privacy rights</li>
            </ul>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">11. Data Retention</h2>
            <p className="text-gray-600 mb-4">
              We retain your personal information for as long as necessary to fulfill the purposes for which it was collected:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li><strong>Order records:</strong> 7 years for accounting and tax purposes</li>
              <li><strong>Warranty claims:</strong> Duration of warranty period plus 1 year</li>
              <li><strong>Marketing preferences:</strong> Until you withdraw consent</li>
              <li><strong>Website analytics:</strong> 26 months (aggregated and anonymized)</li>
            </ul>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">12. Children's Privacy</h2>
            <p className="text-gray-600 mb-6">
              Our website is not intended for children under 16 years of age. We do not knowingly collect personal
              information from children. If you believe a child has provided us with personal information, please
              contact us immediately and we will delete such information.
            </p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">13. Third-Party Links</h2>
            <p className="text-gray-600 mb-6">
              Our website may contain links to third-party websites (such as YouTube, Trustpilot, or club websites).
              We are not responsible for the privacy practices of these websites. We encourage you to review the
              privacy policies of any third-party sites you visit.
            </p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">14. Changes to This Policy</h2>
            <p className="text-gray-600 mb-6">
              We may update this privacy policy from time to time to reflect changes in our practices or legal
              requirements. Changes will be posted on this page with an updated revision date. We encourage you
              to review this policy periodically.
            </p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">15. Contact Us</h2>
            <p className="text-gray-600 mb-4">
              If you have questions about this privacy policy or wish to exercise your data protection rights,
              please contact us:
            </p>
            <div className="bg-introcar-light rounded-lg p-4 mb-6">
              <p className="text-gray-700">
                <strong>IntroCar Ltd</strong><br />
                Units C & D The Pavilions<br />
                2 East Road, Wimbledon<br />
                London SW19 1UW<br />
                United Kingdom<br /><br />
                Email: <a href="mailto:sales@introcar.com" className="text-introcar-blue hover:underline">sales@introcar.com</a><br />
                Tel: <a href="tel:+442085462027" className="text-introcar-blue hover:underline">+44 (0)20 8546 2027</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
