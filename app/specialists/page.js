import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Wrench, MapPin, Globe, ExternalLink, Car } from 'lucide-react';

export const metadata = {
  title: 'Specialist Links',
  description: 'Find Rolls-Royce and Bentley specialists, restoration shops, and service centers worldwide.',
};

const specialists = [
  {
    name: 'Flying Spares',
    location: 'UK',
    specialty: 'Parts & Service',
    url: 'https://www.flyingspares.com/',
    description: 'Comprehensive parts supplier and service center for Rolls-Royce & Bentley.',
  },
  {
    name: 'Phantom Motor Cars',
    location: 'USA',
    specialty: 'Sales & Service',
    url: 'https://www.phantommotorcars.com/',
    description: 'Pre-owned Rolls-Royce and Bentley sales and service in the United States.',
  },
  {
    name: 'P & A Wood',
    location: 'UK',
    specialty: 'Restoration',
    url: 'https://www.pa-wood.co.uk/',
    description: 'Specialists in Rolls-Royce and Bentley restoration and coachbuilding.',
  },
  {
    name: 'Frank Dale & Stepsons',
    location: 'UK',
    specialty: 'Sales & Restoration',
    url: 'https://www.frankdale.com/',
    description: 'Established dealer specializing in classic Rolls-Royce and Bentley vehicles.',
  },
  {
    name: 'Colbrook Specialists',
    location: 'UK',
    specialty: 'Service & Repair',
    url: 'https://www.colbrookspecialists.co.uk/',
    description: 'Independent service and repair specialists for all Rolls-Royce and Bentley models.',
  },
  {
    name: 'Euro Motorcars',
    location: 'USA',
    specialty: 'Parts & Service',
    url: '#',
    description: 'Full-service facility for European luxury vehicles including RR & Bentley.',
  },
];

export default function SpecialistsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-introcar-blue to-introcar-charcoal text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <Wrench className="w-8 h-8" />
              <span className="text-sm font-medium uppercase tracking-wider">Network</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-light mb-6">
              Specialist Links
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              Find trusted Rolls-Royce and Bentley specialists, restoration shops, and service
              centers around the world.
            </p>
          </div>
        </div>
      </section>

      {/* Specialists Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specialists.map((specialist) => (
              <a
                key={specialist.name}
                href={specialist.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-introcar-blue transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-introcar-light rounded-lg flex items-center justify-center">
                    <Car className="w-6 h-6 text-introcar-blue" />
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-introcar-blue transition-colors" />
                </div>
                <h3 className="text-lg font-medium text-introcar-charcoal mb-2 group-hover:text-introcar-blue transition-colors">
                  {specialist.name}
                </h3>
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-introcar-light text-xs text-gray-600 rounded">
                    <MapPin className="w-3 h-3" />
                    {specialist.location}
                  </span>
                  <span className="inline-block px-2 py-1 bg-introcar-blue/10 text-xs text-introcar-blue rounded">
                    {specialist.specialty}
                  </span>
                </div>
                <p className="text-gray-500 text-sm">{specialist.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Prestige Parts Stockists */}
      <section className="py-16 bg-introcar-light">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-xl p-8 border border-gray-200">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-introcar-blue/10 rounded-xl flex items-center justify-center shrink-0">
                <Globe className="w-8 h-8 text-introcar-blue" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-display font-light text-introcar-charcoal mb-4">
                  Prestige Parts® International Stockists
                </h2>
                <p className="text-gray-600 mb-6">
                  Our growing network of international resellers stock Prestige Parts® products.
                  Find a stockist near you for local availability and support.
                </p>
                <a
                  href="https://prestigeparts.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-introcar-blue text-white font-medium rounded-full hover:bg-introcar-charcoal transition-colors"
                >
                  Find a Stockist
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add Your Business */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-display font-light text-introcar-charcoal mb-4">
            Are You a Specialist?
          </h2>
          <p className="text-gray-500 mb-6 max-w-2xl mx-auto">
            If you're a Rolls-Royce or Bentley specialist and would like to be listed here,
            or if you're interested in becoming a Prestige Parts® stockist, please get in touch.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center px-6 py-3 bg-introcar-blue text-white font-medium rounded-full hover:bg-introcar-charcoal transition-colors"
          >
            Contact Us
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
