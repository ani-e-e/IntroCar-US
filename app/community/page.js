import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Users, ExternalLink, Globe, Calendar, Car } from 'lucide-react';

export const metadata = {
  title: 'Community & Clubs',
  description: 'Connect with Rolls-Royce and Bentley enthusiasts worldwide. Find clubs, events, and communities near you.',
};

const clubs = [
  {
    name: 'Rolls-Royce Owners\' Club (RROC)',
    region: 'USA',
    url: 'https://www.rroc.org/',
    description: 'The premier organization for Rolls-Royce and Bentley enthusiasts in the United States.',
  },
  {
    name: 'Rolls-Royce Enthusiasts\' Club (RREC)',
    region: 'UK',
    url: 'https://www.rrec.org.uk/',
    description: 'The world\'s largest club for Rolls-Royce and Bentley enthusiasts, based in the UK.',
  },
  {
    name: 'Bentley Drivers Club',
    region: 'UK/International',
    url: 'https://www.bdcl.org/',
    description: 'Founded in 1936, dedicated to Bentley motor cars and their enthusiasts.',
  },
  {
    name: 'Rolls-Royce & Bentley Specialists Association',
    region: 'UK',
    url: 'https://www.rrbsa.co.uk/',
    description: 'Association of specialist businesses serving the Rolls-Royce and Bentley community.',
  },
  {
    name: 'Flying Ladies Forum',
    region: 'International',
    url: 'https://www.flyingladies.com/',
    description: 'Online forum for Rolls-Royce and Bentley enthusiasts worldwide.',
  },
];

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-introcar-blue to-introcar-charcoal text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-8 h-8" />
              <span className="text-sm font-medium uppercase tracking-wider">Community</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-light mb-6">
              Community & Clubs
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              Join a global community of Rolls-Royce and Bentley enthusiasts.
              Find clubs, events, and like-minded owners near you.
            </p>
          </div>
        </div>
      </section>

      {/* Clubs Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-display font-light text-introcar-charcoal mb-8">
            Clubs & Organizations
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club) => (
              <a
                key={club.name}
                href={club.url}
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
                  {club.name}
                </h3>
                <span className="inline-block px-2 py-1 bg-introcar-light text-xs text-gray-600 rounded mb-3">
                  {club.region}
                </span>
                <p className="text-gray-500 text-sm">{club.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16 bg-introcar-light">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Calendar className="w-6 h-6 text-introcar-blue" />
            <h2 className="text-2xl font-display font-light text-introcar-charcoal">
              Events & Shows
            </h2>
          </div>
          <div className="bg-white rounded-xl p-8 border border-gray-200">
            <p className="text-gray-600 mb-4">
              Throughout the year, clubs and organizations host various events including:
            </p>
            <ul className="grid md:grid-cols-2 gap-3 text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-introcar-blue rounded-full"></span>
                Annual rallies and meets
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-introcar-blue rounded-full"></span>
                Concours d'Elegance
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-introcar-blue rounded-full"></span>
                Technical seminars
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-introcar-blue rounded-full"></span>
                Regional gatherings
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-introcar-blue rounded-full"></span>
                Tours and driving events
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-introcar-blue rounded-full"></span>
                Parts swap meets
              </li>
            </ul>
            <p className="text-gray-500 text-sm mt-6">
              Check individual club websites for upcoming event schedules.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-display font-light text-introcar-charcoal mb-4">
            Know a club we should add?
          </h2>
          <p className="text-gray-500 mb-6">
            Help us build a comprehensive resource for the community.
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
