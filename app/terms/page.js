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
          <h1 className="text-3xl md:text-4xl font-display font-light text-white">
            Terms & Conditions
          </h1>
          <p className="text-gray-400 mt-2">Last updated: January 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="prose prose-gray max-w-none">
            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">1. Introduction</h2>
            <p className="text-gray-600 mb-4">
              These terms and conditions govern your use of the IntroCar website (introcar.us) and the purchase
              of products from IntroCar Ltd ("IntroCar", "we", "us", "our"). By using this website or placing an order,
              you agree to be bound by these terms.
            </p>
            <p className="text-gray-600 mb-6">
              IntroCar Ltd is a company registered in England and Wales under company number 02105867, with registered
              address at Units C & D The Pavilions, 2 East Road, Wimbledon, London SW19 1UW. VAT Registration Number: 468638789.
            </p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">2. Orders and Acceptance</h2>
            <p className="text-gray-600 mb-4">
              All orders placed through our website are subject to acceptance. We reserve the right to decline any order
              for any reason. An order is not accepted until we send confirmation of dispatch.
            </p>
            <p className="text-gray-600 mb-6">
              We make every effort to ensure product descriptions and prices are accurate. However, errors may occur.
              If we discover an error in the price or description of a product you have ordered, we will inform you and
              offer you the option to confirm your order at the correct price or cancel it.
            </p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">3. Pricing and Payment</h2>
            <p className="text-gray-600 mb-4">
              All prices displayed on this website are in US Dollars (USD) and exclude shipping costs and any applicable
              import duties, taxes, or tariffs. US customers are responsible for all import duties and taxes imposed by
              US customs authorities.
            </p>
            <p className="text-gray-600 mb-4">
              We accept payment by major credit cards (Visa, Mastercard, American Express), debit cards, and PayPal.
              All payments are processed securely through our payment providers. Payment is required in full at the
              time of ordering.
            </p>
            <p className="text-gray-600 mb-6">
              Prices are subject to change without notice. The price applicable to your order will be the price shown
              at the time the order is placed.
            </p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">4. Shipping and Delivery</h2>
            <p className="text-gray-600 mb-4">
              We ship primarily via DHL Express to the United States. Orders placed before 2:00 PM GMT (Monday-Friday)
              are typically dispatched the same day. Orders placed after this time or on weekends will be dispatched
              the next business day.
            </p>
            <p className="text-gray-600 mb-4">
              Delivery times are estimates only and are not guaranteed. Standard delivery to mainland USA is typically
              3-5 business days via DHL Express. Delays may occur due to customs clearance, weather, or other factors
              beyond our control.
            </p>
            <p className="text-gray-600 mb-4">
              Risk of loss or damage passes to you upon delivery. All shipments require a signature upon delivery.
              If you are not available to sign, DHL will leave a notice and attempt redelivery or hold the package
              at a local facility.
            </p>
            <p className="text-gray-600 mb-6">
              For full shipping information, please see our <a href="/shipping" className="text-introcar-blue hover:underline">Shipping page</a>.
            </p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">5. Import Duties and Taxes</h2>
            <p className="text-gray-600 mb-4">
              As the importer of record, you are responsible for all import duties, taxes, and fees assessed by
              US customs authorities. These charges are not included in our prices and will be collected by DHL
              upon delivery or during customs clearance.
            </p>
            <p className="text-gray-600 mb-6">
              Import duty rates vary by product type. Recent US tariff changes may affect the duty rate on automotive
              parts imported from the UK. We recommend checking current tariff rates if you have concerns about
              import costs.
            </p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">6. Returns and Refunds</h2>
            <p className="text-gray-600 mb-4">
              We accept returns of unused items in original condition and packaging within 30 days of receipt.
              To initiate a return, please contact us first at <a href="mailto:sales@introcar.com" className="text-introcar-blue hover:underline">sales@introcar.com</a>.
            </p>
            <p className="text-gray-600 mb-4">
              Return conditions:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>Items must be unused, in original condition, and in original packaging</li>
              <li>Return shipping is at the customer's expense</li>
              <li>Electrical items cannot be returned once fitted or installed</li>
              <li>Special order items may be subject to restocking fees</li>
              <li>We recommend using tracked, insured shipping for returns</li>
            </ul>
            <p className="text-gray-600 mb-6">
              Refunds will be processed within 14 days of receiving the returned item. Refunds will be issued to
              the original payment method. Shipping costs are non-refundable except in cases of our error.
            </p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">7. Warranty</h2>
            <p className="text-gray-600 mb-4">
              <strong>Prestige Parts®:</strong> All Prestige Parts® branded products carry a comprehensive 3-year
              worldwide warranty against defects in materials and workmanship.
            </p>
            <p className="text-gray-600 mb-4">
              <strong>Original Equipment:</strong> Genuine OE parts carry manufacturer warranties where applicable.
              Warranty terms vary by manufacturer and product.
            </p>
            <p className="text-gray-600 mb-4">
              <strong>Reconditioned Parts:</strong> Reconditioned and exchange parts carry a warranty as specified
              at the time of purchase, typically 12 months.
            </p>
            <p className="text-gray-600 mb-6">
              Warranties do not cover damage resulting from improper installation, misuse, accident, modification,
              or normal wear and tear. Warranty claims must be made in writing with proof of purchase. Parts must
              be installed by qualified technicians in accordance with manufacturer specifications.
            </p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">8. Product Information</h2>
            <p className="text-gray-600 mb-4">
              We make every effort to ensure product information is accurate. However, due to the nature of
              automotive parts for heritage vehicles, some products may differ slightly from descriptions or images.
            </p>
            <p className="text-gray-600 mb-6">
              It is your responsibility to ensure parts are suitable for your specific vehicle. If you are unsure
              about compatibility, please contact us before ordering. We can provide guidance on chassis-specific
              applications and part numbers.
            </p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-600 mb-4">
              Our liability for any claim arising from the sale of products or use of this website is limited to
              the purchase price of the relevant products. We are not liable for any indirect, incidental,
              consequential, or special damages, including loss of profits, vehicle downtime, or repair costs.
            </p>
            <p className="text-gray-600 mb-6">
              Nothing in these terms limits or excludes our liability for death or personal injury caused by
              our negligence, fraud, or any other liability that cannot be lawfully limited or excluded.
            </p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">10. Intellectual Property</h2>
            <p className="text-gray-600 mb-4">
              All content on this website, including text, images, logos, and software, is owned by IntroCar Ltd
              or its licensors and is protected by copyright and other intellectual property laws.
            </p>
            <p className="text-gray-600 mb-6">
              "Prestige Parts" and the Prestige Parts logo are registered trademarks of IntroCar Ltd.
              Rolls-Royce, Bentley, and associated marks are trademarks of their respective owners. IntroCar is
              an independent supplier and is not affiliated with Rolls-Royce Motor Cars Ltd or Bentley Motors Ltd.
            </p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">11. Force Majeure</h2>
            <p className="text-gray-600 mb-6">
              We shall not be liable for any delay or failure to perform our obligations due to circumstances
              beyond our reasonable control, including but not limited to acts of God, war, terrorism, pandemic,
              labor disputes, carrier delays, or government actions.
            </p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">12. Governing Law</h2>
            <p className="text-gray-600 mb-6">
              These terms are governed by and construed in accordance with the laws of England and Wales.
              Any disputes arising from these terms or your use of our services shall be subject to the exclusive
              jurisdiction of the courts of England and Wales.
            </p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">13. Changes to Terms</h2>
            <p className="text-gray-600 mb-6">
              We may update these terms from time to time. Any changes will be posted on this page. Your continued
              use of the website after changes are posted constitutes acceptance of the revised terms.
            </p>

            <h2 className="text-xl font-medium text-introcar-charcoal mb-4">14. Contact Information</h2>
            <p className="text-gray-600 mb-4">
              For questions about these terms or any aspect of your order, please contact us:
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
