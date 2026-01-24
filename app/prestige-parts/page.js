import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
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
              <Star className="w-4 h-4 text-white" />
              <span className="text-sm font-medium">Our Exclusive Range</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-light text-white mb-4">
              Prestige Parts<sup>®</sup>
            </h1>
            <p className="text-2xl text-white font-light mb-4">Heritage Meets Innovation</p>
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              The world's most respected brand of aftermarket parts for heritage and modern
              Rolls-Royce and Bentley motorcars. Through relentless R&D and a passionate commitment
              to quality, we fill vital gaps in the market with innovative products that meet or
              exceed OEM specifications.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/products?stockType=Prestige+Parts,Prestige+Parts+(OE),Uprated"
                className="inline-flex items-center px-6 py-3 bg-white text-introcar-blue font-medium rounded-full hover:bg-introcar-light transition-colors"
              >
                Shop All Prestige Parts®
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                href="/products?stockType=Prestige+Parts"
                className="inline-flex items-center px-5 py-2.5 bg-white/10 text-white font-medium rounded-full hover:bg-white/20 transition-colors border border-white/20"
              >
                Prestige Parts®
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link
                href="/products?stockType=Prestige+Parts+(OE)"
                className="inline-flex items-center px-5 py-2.5 bg-white/10 text-white font-medium rounded-full hover:bg-white/20 transition-colors border border-white/20"
              >
                Prestige Parts® (OE)
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link
                href="/products?stockType=Uprated"
                className="inline-flex items-center px-5 py-2.5 bg-white/10 text-white font-medium rounded-full hover:bg-white/20 transition-colors border border-white/20"
              >
                Uprated
                <ArrowRight className="w-4 h-4 ml-2" />
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
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <div className="text-center">
                <div className="relative w-64 h-32 mx-auto mb-6">
                  <Image
                    src="/images/logos/prestige-parts-logo.png"
                    alt="Prestige Parts®"
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="text-gray-500 text-sm mb-6">
                  The trusted choice for quality-conscious owners
                </p>
                <div className="flex items-center justify-center gap-8 text-sm">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-introcar-blue">3</div>
                    <div className="text-gray-500">Year Warranty</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-introcar-blue">1000+</div>
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
            <h2 className="text-3xl font-display font-light text-white mb-4">
              No Longer Available from the Factory?
            </h2>
            <p className="text-gray-300 mb-8">
              Many original equipment parts have been discontinued by Bentley and Rolls-Royce.
              Our Prestige Parts® range includes numerous NLA items, remanufactured to exacting
              standards so you can keep your classic car on the road.
            </p>
            <Link
              href="/products?stockType=Prestige+Parts"
              className="inline-flex items-center px-6 py-3 bg-white text-introcar-charcoal font-medium rounded-full hover:bg-introcar-light transition-colors"
            >
              Browse Prestige Parts®
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* International Stockists */}
      <section className="py-16 bg-introcar-light">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-display font-light text-introcar-charcoal mb-4">
              Our International Stockists
            </h2>
            <p className="text-gray-600">
              We are proud to partner with international Rolls-Royce & Bentley Specialists who each
              carry the full range of Prestige Parts® products in order to provide an unparalleled
              depth and breadth to their Rolls-Royce & Bentley parts and spares inventory.
            </p>
          </div>

          {/* Stockists Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Albers Motorcars */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <h3 className="text-xl font-medium text-introcar-charcoal mb-2">Albers Motorcars</h3>
              <p className="text-gray-500 text-sm mb-1">Indianapolis, USA</p>
              <p className="text-gray-500 text-sm mb-3">T: +1 317 873 2360</p>
              <a
                href="https://www.albersrb.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-introcar-blue hover:underline text-sm"
              >
                www.albersrb.com
              </a>
            </div>

            {/* Spur Parts */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <h3 className="text-xl font-medium text-introcar-charcoal mb-2">Spur Parts</h3>
              <p className="text-gray-500 text-sm mb-1">Sydney, Australia</p>
              <p className="text-gray-500 text-sm mb-3">T: +61 452 558112</p>
              <a
                href="https://www.spurparts.com.au"
                target="_blank"
                rel="noopener noreferrer"
                className="text-introcar-blue hover:underline text-sm"
              >
                www.spurparts.com.au
              </a>
            </div>

            {/* Bruce McIlroy Ltd */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <h3 className="text-xl font-medium text-introcar-charcoal mb-2">Bruce McIlroy Ltd</h3>
              <p className="text-gray-500 text-sm mb-1">Ashburton, New Zealand</p>
              <p className="text-gray-500 text-sm mb-3">T: +64 3 308 7282</p>
              <a
                href="https://www.bentleyservice.co.nz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-introcar-blue hover:underline text-sm"
              >
                www.bentleyservice.co.nz
              </a>
            </div>

            {/* Rohdins Classic Car AB */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <h3 className="text-xl font-medium text-introcar-charcoal mb-2">Rohdins Classic Car AB</h3>
              <p className="text-gray-500 text-sm mb-1">Trollhättan, Sweden</p>
              <p className="text-gray-500 text-sm mb-3">T: +46 520 188 00</p>
              <a
                href="https://www.rohdinsclassiccar.se"
                target="_blank"
                rel="noopener noreferrer"
                className="text-introcar-blue hover:underline text-sm"
              >
                www.rohdinsclassiccar.se
              </a>
            </div>

            {/* IntroCar */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <h3 className="text-xl font-medium text-introcar-charcoal mb-2">IntroCar</h3>
              <p className="text-gray-500 text-sm mb-1">London, UK</p>
              <p className="text-gray-500 text-sm mb-3">T: +44 (0)20 8546 2027</p>
              <a
                href="https://www.introcar.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-introcar-blue hover:underline text-sm"
              >
                www.introcar.com
              </a>
            </div>

            {/* Beroparts */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <h3 className="text-xl font-medium text-introcar-charcoal mb-2">Beroparts</h3>
              <p className="text-gray-500 text-sm mb-1">Oostkamp, Belgium</p>
              <p className="text-gray-500 text-sm mb-3">T: +32 479 89 15 67</p>
              <a
                href="https://www.beroparts.be"
                target="_blank"
                rel="noopener noreferrer"
                className="text-introcar-blue hover:underline text-sm"
              >
                www.beroparts.be
              </a>
            </div>
          </div>

          {/* Map */}
          <div className="mb-8">
            <div className="relative w-full aspect-[2/1] rounded-xl overflow-hidden border border-gray-200">
              <Image
                src="/images/prestige-parts/reseller-map.webp"
                alt="International Stockists Map"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* View Full Range Button */}
          <div className="text-center">
            <Link
              href="/products?stockType=Prestige+Parts,Prestige+Parts+(OE),Uprated"
              className="inline-flex items-center px-6 py-3 bg-introcar-blue text-white font-medium rounded-full hover:bg-introcar-charcoal transition-colors"
            >
              View Full Range
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
