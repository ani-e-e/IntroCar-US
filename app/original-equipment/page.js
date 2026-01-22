import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Shield, Award, CheckCircle, ArrowRight, Package, Clock, Factory, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Original Equipment Parts',
  description: 'Genuine OEM parts for Rolls-Royce & Bentley, sourced directly from Crewe and authorized distributors. Factory-grade quality with full manufacturer backing.',
  openGraph: {
    title: 'Original Equipment Parts | IntroCar USA',
    description: 'Genuine OEM parts for Rolls-Royce & Bentley, sourced directly from authorized channels.',
  },
};

const benefits = [
  {
    icon: Factory,
    title: 'Factory Sourced',
    description: 'Sourced directly from Bentley Motors, Rolls-Royce Motor Cars, or their appointed agents.',
  },
  {
    icon: Award,
    title: 'Genuine Parts',
    description: 'Identical to the components fitted when your vehicle left the factory.',
  },
  {
    icon: Shield,
    title: 'Manufacturer Warranty',
    description: 'Full manufacturer warranty and backing on all genuine OE parts.',
  },
  {
    icon: Sparkles,
    title: 'Perfect Fit',
    description: 'Designed specifically for your vehicle with guaranteed compatibility.',
  },
];

const stockTypes = [
  {
    title: 'Crewe Genuine / Original Equipment',
    badge: 'OE',
    description: 'Parts sourced directly from the manufacturer or their appointed distributors. These are identical to factory-fitted components.',
    href: '/products?stockType=Original+Equipment',
  },
  {
    title: 'Prestige Parts® (OE)',
    badge: 'PP-OE',
    description: 'Original equipment parts that are part of our Prestige Parts® program, combining genuine quality with our enhanced warranty coverage.',
    href: '/products?stockType=Prestige+Parts+(OE)',
    featured: true,
  },
];

export default function OriginalEquipmentPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-introcar-charcoal to-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
              <Factory className="w-4 h-4" />
              <span className="text-sm font-medium">Factory Quality</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-light mb-6">
              Original Equipment
            </h1>
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              Genuine OEM parts sourced from Bentley Motors, Rolls-Royce Motor Cars, and their
              authorized distributors. The same quality that left the factory.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/products?stockType=Original+Equipment"
                className="inline-flex items-center px-6 py-3 bg-white text-introcar-charcoal font-medium rounded-full hover:bg-gray-100 transition-colors"
              >
                Shop OE Parts
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-16 bg-introcar-light">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-light text-introcar-charcoal mb-4">
              The OE Advantage
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              When only factory-original will do, our genuine OE parts deliver the exact quality
              and specification that your Rolls-Royce or Bentley was built with.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.title} className="bg-white p-6 rounded-xl border border-gray-200">
                  <div className="w-12 h-12 bg-introcar-charcoal/10 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-introcar-charcoal" />
                  </div>
                  <h3 className="text-lg font-medium text-introcar-charcoal mb-2">{benefit.title}</h3>
                  <p className="text-gray-500 text-sm">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stock Types */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-light text-introcar-charcoal mb-4">
              Our OE Options
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {stockTypes.map((type) => (
              <Link
                key={type.title}
                href={type.href}
                className={`relative p-8 rounded-2xl border transition-all duration-300 group ${
                  type.featured
                    ? 'bg-white border-introcar-blue shadow-lg'
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg'
                }`}
              >
                {type.featured && (
                  <div className="absolute -top-3 left-6">
                    <span className="px-3 py-1 bg-introcar-blue text-white text-xs font-medium rounded-full">
                      Enhanced Warranty
                    </span>
                  </div>
                )}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  type.featured ? 'bg-introcar-blue text-white' : 'bg-introcar-light text-introcar-charcoal'
                }`}>
                  <span className="font-bold text-sm">{type.badge}</span>
                </div>
                <h3 className="text-xl font-display font-light text-introcar-charcoal mb-3">
                  {type.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                  {type.description}
                </p>
                <div className="flex items-center text-sm font-medium group-hover:gap-2 transition-all">
                  <span className={type.featured ? 'text-introcar-blue' : 'text-introcar-charcoal'}>
                    Shop Now
                  </span>
                  <ArrowRight className={`w-4 h-4 ml-1 ${type.featured ? 'text-introcar-blue' : 'text-introcar-charcoal'}`} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section className="py-16 bg-introcar-charcoal text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-display font-light mb-4">
                Expert Knowledge & Support
              </h2>
              <p className="text-gray-300 mb-6">
                With over 38 years of experience in Rolls-Royce and Bentley parts, our team can help
                you find the right OE part for your vehicle. We maintain direct relationships with
                factory sources to ensure authenticity and availability.
              </p>
              <ul className="space-y-3">
                {['Parts identification assistance', 'Chassis-specific guidance', 'Technical documentation', 'Worldwide shipping'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-white" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-center">
              <div className="inline-block p-8 bg-white/5 rounded-2xl">
                <Clock className="w-16 h-16 text-white mx-auto mb-4" />
                <div className="text-4xl font-display font-light mb-2">38+</div>
                <div className="text-gray-400">Years of Expertise</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
