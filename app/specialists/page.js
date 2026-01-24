import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Wrench, MapPin, Globe, ExternalLink, Car, Users, Building2 } from 'lucide-react';

export const metadata = {
  title: 'Specialist Links',
  description: 'Find Rolls-Royce and Bentley specialists, restoration shops, clubs and service centers worldwide.',
};

// Owners Clubs - Rolls-Royce
const rrClubs = [
  { name: 'Rolls-Royce Enthusiasts Club (RREC)', url: 'https://www.rrec.org.uk/', location: 'International' },
  { name: 'Rolls-Royce Owners Club (RROC)', url: 'https://www.rroc.org/', location: 'USA' },
  { name: 'Rolls-Royce Owners Club of Australia', url: 'https://www.rroca.org.au/', location: 'Australia' },
];

// Owners Clubs - Bentley
const bentleyClubs = [
  { name: 'Bentley Drivers Club', url: 'https://www.bdcl.org/', location: 'International' },
  { name: 'W.O. Bentley Memorial Foundation', url: 'https://www.wobmf.org/', location: 'UK' },
];

// Service & Restoration Specialists (NOT parts competitors)
const serviceSpecialists = [
  {
    name: 'P & A Wood',
    location: 'UK',
    specialty: 'Restoration & Coachbuilding',
    url: 'https://www.pa-wood.co.uk/',
    description: 'Award-winning Rolls-Royce and Bentley restoration specialists with over 50 years of experience.',
  },
  {
    name: 'Frank Dale & Stepsons',
    location: 'UK',
    specialty: 'Sales & Restoration',
    url: 'https://www.frankdale.com/',
    description: 'Established dealer specializing in classic Rolls-Royce and Bentley vehicles since 1920.',
  },
  {
    name: 'Colbrook Specialists',
    location: 'UK',
    specialty: 'Service & Repair',
    url: 'https://www.colbrookspecialists.co.uk/',
    description: 'Independent service and repair specialists for all Rolls-Royce and Bentley models.',
  },
  {
    name: 'Royce Service & Engineering',
    location: 'UK',
    specialty: 'Service & Engineering',
    url: 'https://www.royceservice.co.uk/',
    description: 'Specialist engineering and servicing for Rolls-Royce and Bentley motor cars.',
  },
  {
    name: 'Phantom Motor Cars',
    location: 'USA',
    specialty: 'Sales & Service',
    url: 'https://www.phantommotorcars.com/',
    description: 'Pre-owned Rolls-Royce and Bentley sales and service in the United States.',
  },
];

// Technical Resources
const technicalResources = [
  {
    name: 'RR Technical',
    url: 'https://www.rrtechnical.info/',
    description: 'Comprehensive technical information and workshop manuals for Rolls-Royce and Bentley vehicles.',
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
            <h1 className="text-4xl md:text-5xl font-display font-light text-white mb-6">
              Specialist Links
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              A curated collection of trusted Rolls-Royce and Bentley specialists, owners clubs,
              and technical resources from around the world.
            </p>
          </div>
        </div>
      </section>

      {/* Owners Clubs - Rolls-Royce */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Users className="w-6 h-6 text-introcar-blue" />
            <h2 className="text-2xl font-display font-light text-introcar-charcoal">
              Rolls-Royce Owners Clubs
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {rrClubs.map((club) => (
              <a
                key={club.name}
                href={club.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-introcar-blue transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-introcar-light rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-introcar-blue" />
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-introcar-blue transition-colors" />
                </div>
                <h3 className="text-lg font-medium text-introcar-charcoal mb-2 group-hover:text-introcar-blue transition-colors">
                  {club.name}
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-introcar-light text-xs text-gray-600 rounded">
                  <MapPin className="w-3 h-3" />
                  {club.location}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Owners Clubs - Bentley */}
      <section className="py-16 bg-introcar-light">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Users className="w-6 h-6 text-introcar-blue" />
            <h2 className="text-2xl font-display font-light text-introcar-charcoal">
              Bentley Owners Clubs
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {bentleyClubs.map((club) => (
              <a
                key={club.name}
                href={club.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-introcar-blue transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-introcar-light rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-introcar-blue" />
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-introcar-blue transition-colors" />
                </div>
                <h3 className="text-lg font-medium text-introcar-charcoal mb-2 group-hover:text-introcar-blue transition-colors">
                  {club.name}
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-introcar-light text-xs text-gray-600 rounded">
                  <MapPin className="w-3 h-3" />
                  {club.location}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Service & Restoration Specialists */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Building2 className="w-6 h-6 text-introcar-blue" />
            <h2 className="text-2xl font-display font-light text-introcar-charcoal">
              Service & Restoration Specialists
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceSpecialists.map((specialist) => (
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

      {/* Technical Resources */}
      <section className="py-16 bg-introcar-light">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Wrench className="w-6 h-6 text-introcar-blue" />
            <h2 className="text-2xl font-display font-light text-introcar-charcoal">
              Technical Resources
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {technicalResources.map((resource) => (
              <a
                key={resource.name}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-introcar-blue transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-introcar-light rounded-lg flex items-center justify-center">
                    <Wrench className="w-6 h-6 text-introcar-blue" />
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-introcar-blue transition-colors" />
                </div>
                <h3 className="text-lg font-medium text-introcar-charcoal mb-2 group-hover:text-introcar-blue transition-colors">
                  {resource.name}
                </h3>
                <p className="text-gray-500 text-sm">{resource.description}</p>
              </a>
            ))}
            <Link
              href="/technical"
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-introcar-blue transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-introcar-light rounded-lg flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-introcar-blue" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-introcar-charcoal mb-2 group-hover:text-introcar-blue transition-colors">
                IntroCar Technical Info
              </h3>
              <p className="text-gray-500 text-sm">Technical guides, how-to videos, and helpful resources from IntroCar.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Prestige Parts Stockists */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-introcar-charcoal rounded-xl p-8 text-white">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-display font-light text-white mb-4">
                  Prestige Parts® International Stockists
                </h2>
                <p className="text-gray-300 mb-6">
                  Our growing network of international resellers stock Prestige Parts® products.
                  Find a stockist near you for local availability and support.
                </p>
                <Link
                  href="/prestige-parts"
                  className="inline-flex items-center px-6 py-3 bg-white text-introcar-charcoal font-medium rounded-full hover:bg-introcar-light transition-colors"
                >
                  Find a Stockist
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add Your Business */}
      <section className="py-16 bg-introcar-light">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-display font-light text-introcar-charcoal mb-4">
            Are You a Specialist?
          </h2>
          <p className="text-gray-500 mb-6 max-w-2xl mx-auto">
            If you're a Rolls-Royce or Bentley specialist and would like to be listed here,
            or if you're interested in becoming a Prestige Parts® stockist, please get in touch.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-6 py-3 bg-introcar-blue text-white font-medium rounded-full hover:bg-introcar-charcoal transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
