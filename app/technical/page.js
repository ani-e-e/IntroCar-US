import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Book, Wrench, ExternalLink, Youtube, FileText, Settings, Play } from 'lucide-react';

export const metadata = {
  title: 'Technical Info',
  description: 'Technical resources, workshop manuals, and how-to guides for Rolls-Royce and Bentley vehicles.',
};

// IntroCar YouTube Videos - How To Guides
const howToVideos = [
  {
    title: 'Heritage Meets Innovation - IntroCar',
    description: 'Discover IntroCar - the leading international supplier of Rolls-Royce and Bentley parts.',
    youtubeId: 'Jp-uqufYyvA',
  },
];

// Technical Resources
const technicalResources = [
  {
    title: 'RR Technical Info',
    description: 'The most comprehensive online resource for Rolls-Royce and Bentley technical information. Covers all models from 1904 to present day with detailed specifications, wiring diagrams, and troubleshooting guides.',
    url: 'https://www.rrtechnical.info/',
    icon: Book,
    featured: true,
  },
];

// Parts Guides
const partsGuides = [
  {
    title: 'Brake System Components',
    description: 'Understanding brake components for classic and modern Rolls-Royce and Bentley vehicles.',
    href: '/products?category=Brakes',
  },
  {
    title: 'Suspension & Steering',
    description: 'Guide to suspension and steering parts across different model ranges.',
    href: '/products?category=Steering',
  },
  {
    title: 'Electrical Systems',
    description: 'Electrical components, sensors, and modules explained.',
    href: '/products?category=Electrical',
  },
  {
    title: 'Engine Components',
    description: 'From V8s to straight-sixes, understanding your engine parts.',
    href: '/products?category=Engine',
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
            <h1 className="text-4xl md:text-5xl font-display font-light text-white mb-6">
              Technical Info
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              Workshop manuals, how-to guides, and technical resources to help you maintain
              and restore your Rolls-Royce or Bentley.
            </p>
          </div>
        </div>
      </section>

      {/* RR Technical - Featured Resource */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-introcar-charcoal rounded-2xl p-8 text-white">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full mb-4">
                  <Book className="w-4 h-4" />
                  <span className="text-sm font-medium">Recommended Resource</span>
                </div>
                <h2 className="text-3xl font-display font-light text-white mb-4">
                  RR Technical Info
                </h2>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  The most comprehensive online resource for Rolls-Royce and Bentley technical information.
                  Covers all models from 1904 to present day with detailed specifications, wiring diagrams,
                  workshop procedures, and troubleshooting guides.
                </p>
                <ul className="space-y-2 mb-8 text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-introcar-blue rounded-full"></span>
                    Complete workshop manuals for all models
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-introcar-blue rounded-full"></span>
                    Detailed wiring diagrams and schematics
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-introcar-blue rounded-full"></span>
                    Technical service bulletins
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-introcar-blue rounded-full"></span>
                    Model specifications and data
                  </li>
                </ul>
                <a
                  href="https://www.rrtechnical.info/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-white text-introcar-charcoal font-medium rounded-full hover:bg-introcar-light transition-colors"
                >
                  Visit RR Technical
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </div>
              <div className="hidden md:flex items-center justify-center">
                <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center">
                  <Book className="w-24 h-24 text-white/50" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How-To Videos */}
      <section className="py-16 bg-introcar-light">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Youtube className="w-6 h-6 text-red-600" />
            <h2 className="text-2xl font-display font-light text-introcar-charcoal">
              IntroCar Videos
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {howToVideos.map((video) => (
              <div
                key={video.title}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Video Embed */}
                <div className="aspect-video bg-gray-900 relative">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0`}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-introcar-charcoal mb-2">
                    {video.title}
                  </h3>
                  <p className="text-gray-500 text-sm">{video.description}</p>
                </div>
              </div>
            ))}
            {/* Placeholder for more videos */}
            <div className="bg-white border border-gray-200 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center">
              <Youtube className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">More Videos Coming Soon</h3>
              <p className="text-gray-400 text-sm">Subscribe to our YouTube channel for updates</p>
            </div>
          </div>
          <div className="text-center mt-8">
            <a
              href="https://www.youtube.com/@introikicar6486"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-full hover:bg-red-700 transition-colors"
            >
              <Youtube className="w-5 h-5 mr-2" />
              Subscribe to Our YouTube Channel
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </div>
        </div>
      </section>

      {/* Parts Guides */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Settings className="w-6 h-6 text-introcar-blue" />
            <h2 className="text-2xl font-display font-light text-introcar-charcoal">
              Parts Guides by Category
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {partsGuides.map((guide) => (
              <Link
                key={guide.title}
                href={guide.href}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-introcar-blue transition-all group"
              >
                <h3 className="text-lg font-medium text-introcar-charcoal mb-2 group-hover:text-introcar-blue transition-colors">
                  {guide.title}
                </h3>
                <p className="text-gray-500 text-sm">{guide.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Blog Articles */}
      <section className="py-16 bg-introcar-light">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-introcar-blue" />
              <h2 className="text-2xl font-display font-light text-introcar-charcoal">
                Technical Articles
              </h2>
            </div>
            <Link
              href="/blog"
              className="text-introcar-blue hover:text-introcar-charcoal text-sm font-medium"
            >
              View All Articles →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <a
              href="https://www.introcar.com/blog/6-common-bentley-continental-gt-issues-20042018--and-the-parts-to-fix-them"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-introcar-blue transition-all group"
            >
              <span className="inline-block px-2 py-1 bg-introcar-blue/10 text-xs text-introcar-blue rounded mb-3">
                Technical
              </span>
              <h3 className="text-lg font-medium text-introcar-charcoal mb-2 group-hover:text-introcar-blue transition-colors">
                6 Common Continental GT Issues
              </h3>
              <p className="text-gray-500 text-sm">Common problems affecting 2004-2018 Bentley Continental GT models and the parts to fix them.</p>
            </a>
            <a
              href="https://www.introcar.com/blog/own-a-classic-rolls-royce-or-bentley-dont-ignore-these-5-common-issues"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-introcar-blue transition-all group"
            >
              <span className="inline-block px-2 py-1 bg-introcar-blue/10 text-xs text-introcar-blue rounded mb-3">
                Technical
              </span>
              <h3 className="text-lg font-medium text-introcar-charcoal mb-2 group-hover:text-introcar-blue transition-colors">
                5 Common Classic RR/Bentley Issues
              </h3>
              <p className="text-gray-500 text-sm">Essential maintenance advice for classic Rolls-Royce and Bentley owners.</p>
            </a>
            <a
              href="https://www.introcar.com/blog/assembling-the-ug2747-x-rear-wheel-cylinder-for-bentley-s1-and-rolls-royce-silver-cloud-i"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-introcar-blue transition-all group"
            >
              <span className="inline-block px-2 py-1 bg-introcar-blue/10 text-xs text-introcar-blue rounded mb-3">
                How-To
              </span>
              <h3 className="text-lg font-medium text-introcar-charcoal mb-2 group-hover:text-introcar-blue transition-colors">
                Assembling Rear Wheel Cylinders
              </h3>
              <p className="text-gray-500 text-sm">Detailed guide for Bentley S1 and Rolls-Royce Silver Cloud I brake components.</p>
            </a>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-display font-light text-introcar-charcoal mb-4">
            Need Technical Assistance?
          </h2>
          <p className="text-gray-500 mb-6 max-w-2xl mx-auto">
            Our team has over 38 years of experience with Rolls-Royce and Bentley vehicles.
            We're here to help you find the right parts and provide technical guidance.
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
