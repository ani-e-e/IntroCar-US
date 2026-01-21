import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Shield, Award, CheckCircle, ArrowRight, Wrench, Clock, Truck, Star } from 'lucide-react';

export const metadata = {
  title: 'Prestige Parts® Range',
  description: 'Discover Prestige Parts® - our exclusive aftermarket range for Rolls-Royce & Bentley. Premium quality parts that meet or exceed OEM specifications with a 3-year warranty.',
  openGraph: {
    title: 'Prestige Parts® Range | IntroCar USA',
    description: 'Premium quality aftermarket parts for Rolls-Royce & Bentley with 3-year warranty.',
  },
};

const benefits = [
  {
    icon: Shield,
    title: '3-Year Warranty',
    description: 'Every Prestige Parts® product is backed by our comprehensive 3-year warranty, giving you complete peace of mind.',
  },
  {
    icon: Award,
    title: 'OEM Quality',
    description: 'Manufactured to meet or exceed original equipment specifications, ensuring perfect fit and lasting performance.',
  },
  {
    icon: Wrench,
    title: 'Expertly Developed',
    description: 'Developed by our team with 38+ years of Rolls-Royce & Bentley expertise, addressing common failure points.',
  },
  {
    icon: CheckCircle,
    title: 'Tested & Proven',
    description: 'Every part undergoes rigorous testing to ensure reliability and durability in real-world conditions.',
  },
];

const features = [
  'Meets or exceeds OEM specifications',
  'Comprehensive 3-year warranty',
  'Developed by marque specialists',
  'Extensive range covering all models',
  'Cost-effective alternative to OE',
  'Fast worldwide shipping',
  'Technical support included',
  'Many NLA parts available',
];

export default function PrestigePartsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-introcar-blue to-introcar-charcoal text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
              <Star className="w-4 h-4 text-introcar-gold" />
              <span className="text-sm font-medium">Our Exclusive Range</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-light mb-6">
              Prestige Parts<sup>®</sup>
            </h1>
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              Premium quality aftermarket parts for Rolls-Royce & Bentley, developed by experts
              with decades of marque experience. Backed by our industry-leading 3-year warranty.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/products?stockType=Prestige+Parts"
                className="inline-flex items-center px-6 py-3 bg-introcar-gold text-white font-medium rounded-full hover:bg-introcar-gold/90 transition-colors"
              >
                Shop Prestige Parts®
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                href="/products?stockType=Prestige+Parts+(OE)"
                className="inline-flex items-center px-6 py-3 bg-white/10 text-white font-medium rounded-full hover:bg-white/20 transition-colors"
              >
                Shop Prestige Parts® (OE)
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
              Why Choose Prestige Parts®?
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              When original equipment is unavailable or cost-prohibitive, Prestige Parts® offers
              the quality and reliability you need.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.title} className="bg-white p-6 rounded-xl border border-gray-200">
                  <div className="w-12 h-12 bg-introcar-blue/10 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-introcar-blue" />
                  </div>
                  <h3 className="text-lg font-medium text-introcar-charcoal mb-2">{benefit.title}</h3>
                  <p className="text-gray-500 text-sm">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-introcar-blue text-sm font-medium uppercase tracking-wide">
                Quality Assured
              </span>
              <h2 className="text-3xl font-display font-light text-introcar-charcoal mt-2 mb-6">
                The Prestige Parts® Difference
              </h2>
              <p className="text-gray-600 mb-8">
                Our Prestige Parts® range is the result of decades of expertise in the Rolls-Royce
                and Bentley aftermarket. Each part is carefully developed and tested to ensure it
                delivers the performance and reliability these exceptional vehicles deserve.
              </p>
              <ul className="grid grid-cols-2 gap-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-introcar-light rounded-2xl p-8 border border-gray-200">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-introcar-blue rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">PP</span>
                </div>
                <h3 className="text-xl font-display text-introcar-charcoal mb-2">
                  Prestige Parts®
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  The trusted choice for quality-conscious owners
                </p>
                <div className="flex items-center justify-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-introcar-blue">3</div>
                    <div className="text-gray-500">Year Warranty</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-introcar-blue">1000+</div>
                    <div className="text-gray-500">Parts Available</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NLA Section */}
      <section className="py-16 bg-introcar-charcoal text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-display font-light mb-4">
              No Longer Available from the Factory?
            </h2>
            <p className="text-gray-300 mb-8">
              Many original equipment parts have been discontinued by Bentley and Rolls-Royce.
              Our Prestige Parts® range includes numerous NLA items, remanufactured to exacting
              standards so you can keep your classic car on the road.
            </p>
            <Link
              href="/products?stockType=Prestige+Parts"
              className="inline-flex items-center px-6 py-3 bg-introcar-gold text-white font-medium rounded-full hover:bg-introcar-gold/90 transition-colors"
            >
              Browse Prestige Parts®
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
