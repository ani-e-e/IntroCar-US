import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Truck, Clock, Globe, Shield, AlertTriangle, Package, CheckCircle } from 'lucide-react';

export const metadata = {
  title: 'Delivery & Shipping',
  description: 'Shipping information for IntroCar USA. We ship Rolls-Royce & Bentley parts worldwide via DHL Express with fast delivery times.',
};

const shippingOptions = [
  {
    name: 'DHL Express',
    time: '3-5 business days',
    description: 'Our primary shipping method to the USA. Fast, reliable, and fully tracked.',
    features: ['Full tracking', 'Insured', 'Signature required'],
    available: true,
  },
  {
    name: 'DHL Road Service',
    time: '7-14 business days',
    description: 'Economy option for larger or heavier items. Cost-effective for non-urgent orders.',
    features: ['Full tracking', 'Insured', 'Best for heavy items'],
    available: true,
  },
  {
    name: 'Royal Mail International',
    time: 'Currently suspended',
    description: 'Due to ongoing service disruptions, Royal Mail services to the USA are temporarily suspended.',
    features: [],
    available: false,
  },
];

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-introcar-blue to-introcar-charcoal text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <Truck className="w-8 h-8" />
              <span className="text-sm font-medium uppercase tracking-wider">Shipping</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-light text-white mb-6">
              Delivery & Shipping
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              Fast, insured worldwide shipping. We dispatch orders daily from our UK warehouse
              with typical USA delivery in 3-5 business days via DHL Express.
            </p>
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="bg-yellow-50 border-y border-yellow-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-medium text-yellow-800">US Shipping Update</h3>
              <p className="text-sm text-yellow-700">
                Royal Mail services to the USA are currently suspended. All US orders are shipped via DHL Express.
                Please note that new US import tariffs on UK auto parts may affect duties on some items.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Shipping Options */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-display font-light text-introcar-charcoal mb-8">
            Shipping Options to USA
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {shippingOptions.map((option) => (
              <div
                key={option.name}
                className={`border rounded-xl p-6 ${
                  option.available
                    ? 'border-gray-200 bg-white'
                    : 'border-gray-200 bg-gray-50 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-medium text-introcar-charcoal">{option.name}</h3>
                  {!option.available && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                      Suspended
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-introcar-blue font-medium mb-3">
                  <Clock className="w-4 h-4" />
                  {option.time}
                </div>
                <p className="text-gray-500 text-sm mb-4">{option.description}</p>
                {option.features.length > 0 && (
                  <ul className="space-y-2">
                    {option.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shipping Info Grid */}
      <section className="py-16 bg-introcar-light">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Processing */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-6 h-6 text-introcar-blue" />
                <h3 className="text-lg font-medium text-introcar-charcoal">Order Processing</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li>• Orders placed before 2pm GMT ship same day (Mon-Fri)</li>
                <li>• Orders placed after 2pm ship next business day</li>
                <li>• Weekend orders processed Monday</li>
                <li>• Tracking information emailed upon dispatch</li>
              </ul>
            </div>

            {/* Insurance */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-introcar-blue" />
                <h3 className="text-lg font-medium text-introcar-charcoal">Insurance & Protection</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li>• All shipments fully insured</li>
                <li>• Signature required on delivery</li>
                <li>• Careful packaging for fragile items</li>
                <li>• Claims handled by our team</li>
              </ul>
            </div>

            {/* International */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-6 h-6 text-introcar-blue" />
                <h3 className="text-lg font-medium text-introcar-charcoal">Customs & Duties</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li>• Prices shown exclude US import duties</li>
                <li>• Customer responsible for import taxes</li>
                <li>• DHL will collect duties on delivery</li>
                <li>• Commercial invoice included with shipment</li>
              </ul>
            </div>

            {/* Returns */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <Truck className="w-6 h-6 text-introcar-blue" />
                <h3 className="text-lg font-medium text-introcar-charcoal">Returns</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li>• 30-day return policy on unused items</li>
                <li>• Return shipping at customer expense</li>
                <li>• Electrical items non-returnable once fitted</li>
                <li>• Contact us before returning items</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Shipping Cost Note */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-introcar-blue/5 border border-introcar-blue/20 rounded-xl p-8">
            <h3 className="text-xl font-medium text-introcar-charcoal mb-4">
              Shipping Costs
            </h3>
            <p className="text-gray-600 mb-4">
              Shipping costs are calculated based on weight and destination. Final shipping cost
              will be displayed at checkout. For heavy or oversized items, we may contact you
              to confirm shipping costs before dispatch.
            </p>
            <p className="text-gray-600">
              <strong>Large Items:</strong> For items over 100kg or with unusual dimensions,
              we will provide a custom quote. You will be contacted to confirm the shipping
              cost before your order is processed.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
