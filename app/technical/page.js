import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Play, BookOpen, Wrench, ExternalLink, FileText } from 'lucide-react';

export const metadata = {
  title: 'Technical Info',
  description: 'Technical information, videos, and resources for Rolls-Royce and Bentley owners and enthusiasts.',
};

const videoCategories = [
  {
    title: 'Engine & Drivetrain',
    videos: [
      'Cam belt replacement guide',
      'Oil change procedures',
      'Cooling system flush',
      'Fuel system maintenance',
    ],
  },
  {
    title: 'Brakes & Suspension',
    videos: [
      'Brake pad replacement',
      'Hydraulic system bleeding',
      'Shock absorber replacement',
      'Wheel bearing inspection',
    ],
  },
  {
    title: 'Electrical & Ignition',
    videos: [
      'Battery maintenance',
      'Spark plug replacement',
      'Window motor diagnosis',
      'Central locking repair',
    ],
  },
];

export default function TechnicalPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-introcar-blue to-introcar-charcoal text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <Wrench className="w-8 h-8" />
              <span className="text-sm font-medium uppercase tracking-wider">Resources</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-light mb-6">
              Technical Information
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              Access technical videos, workshop manuals, and helpful resources for maintaining
              your Rolls-Royce or Bentley.
            </p>
          </div>
        </div>
      </section>

      {/* Workshop Manuals */}
      <section className="py-16 bg-introcar-light">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-xl p-8 border border-gray-200">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-introcar-blue/10 rounded-xl flex items-center justify-center shrink-0">
                <BookOpen className="w-8 h-8 text-introcar-blue" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-display font-light text-introcar-charcoal mb-4">
                  Workshop Manuals
                </h2>
                <p className="text-gray-600 mb-6">
                  Access comprehensive workshop manuals and technical documentation for Rolls-Royce
                  and Bentley vehicles at RR Technical Info - the definitive online resource for
                  technical information.
                </p>
                <a
                  href="https://www.rrtechnical.info/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-introcar-blue text-white font-medium rounded-full hover:bg-introcar-charcoal transition-colors"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Visit RR Technical Info
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Videos */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-light text-introcar-charcoal mb-4">
              Technical Videos
            </h2>
            <p className="text-gray-500">
              Watch helpful how-to videos on our YouTube channel
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {videoCategories.map((category) => (
              <div key={category.title} className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-medium text-introcar-charcoal mb-4">{category.title}</h3>
                <ul className="space-y-3">
                  {category.videos.map((video) => (
                    <li key={video} className="flex items-center gap-2 text-gray-600">
                      <Play className="w-4 h-4 text-introcar-blue" />
                      <span className="text-sm">{video}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center">
            <a
              href="https://www.youtube.com/channel/UCXXKCVAUeBYx6TpLREJ_5rQ"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-full hover:bg-red-700 transition-colors"
            >
              <Play className="w-5 h-5 mr-2" />
              Visit Our YouTube Channel
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </div>
        </div>
      </section>

      {/* Downloads Section */}
      <section className="py-16 bg-introcar-light">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-display font-light text-introcar-charcoal mb-8">
            Product Information Downloads
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              'Prestige Parts® Catalogue',
              'Technical Bulletins',
              'Installation Guides',
              'Part Number Cross-Reference',
              'Torque Specifications',
              'Fluid Capacities',
            ].map((item) => (
              <div
                key={item}
                className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3 hover:border-introcar-blue transition-colors cursor-pointer"
              >
                <FileText className="w-5 h-5 text-introcar-blue" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Contact us for specific technical documents or installation guides.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-display font-light text-introcar-charcoal mb-4">
            Need Technical Help?
          </h2>
          <p className="text-gray-500 mb-6">
            Our parts specialists have decades of experience and are happy to help.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-6 py-3 bg-introcar-blue text-white font-medium rounded-full hover:bg-introcar-charcoal transition-colors"
          >
            Contact Our Team
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
