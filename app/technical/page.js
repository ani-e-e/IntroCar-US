import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Wrench, ExternalLink, Youtube, Play, Mail } from 'lucide-react';
import { getTechnicalVideos } from '@/lib/data-server';

export const metadata = {
  title: 'Technical Info | Rolls-Royce & Bentley Technical Videos and Parts Related Content',
  description: 'Technical videos, workshop guides, and parts-related content for Rolls-Royce and Bentley vehicles. Subscribe to our YouTube channel for new technical videos.',
};

export default function TechnicalPage() {
  // Load videos from JSON data
  const { videos: technicalVideos, categories } = getTechnicalVideos();

  // Extract unique models from videos that have model associations
  const uniqueModels = [...new Set(
    technicalVideos
      .filter(v => v.models && v.models.length > 0)
      .flatMap(v => v.models)
  )].sort();

  // Group videos by model for display
  const videosByModel = {};
  uniqueModels.forEach(model => {
    videosByModel[model] = technicalVideos.filter(
      v => v.models && v.models.includes(model)
    );
  });

  // Also keep unassigned videos (no models set)
  const unassignedVideos = technicalVideos.filter(
    v => !v.models || v.models.length === 0
  );

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
              Technical
            </h1>
            <p className="text-xl text-white/80 leading-relaxed mb-6">
              Subscribe to our RR technical videos on any of our social channels. We release new technical videos regularly covering maintenance, repairs, and parts for Rolls-Royce and Bentley vehicles.
            </p>
            {uniqueModels.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-8">
                {uniqueModels.map((model) => (
                  <a
                    key={model}
                    href={`#${model.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                    className="inline-flex items-center px-4 py-2 bg-white/10 text-white text-sm font-medium rounded-full hover:bg-white/20 transition-colors"
                  >
                    {model}
                  </a>
                ))}
              </div>
            )}
            <a
              href="mailto:info@introcar.com?subject=Technical Video Request"
              className="inline-flex items-center px-6 py-3 bg-white text-introcar-charcoal font-medium rounded-full hover:bg-introcar-light transition-colors"
            >
              <Mail className="w-5 h-5 mr-2" />
              Request a Technical Video
            </a>
          </div>
        </div>
      </section>

      {/* Technical Videos by Model */}
      {uniqueModels.map((model) => {
        const modelVideos = videosByModel[model];
        if (modelVideos.length === 0) return null;

        return (
          <section key={model} className="py-12 border-b border-gray-100 last:border-b-0" id={model.toLowerCase().replace(/[^a-z0-9]+/g, '-')}>
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center gap-3 mb-8">
                <Play className="w-6 h-6 text-red-600" />
                <h2 className="text-2xl font-display font-light text-introcar-charcoal">
                  {model}
                </h2>
                <span className="text-sm text-gray-400">({modelVideos.length} videos)</span>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modelVideos.map((video) => (
                  <div
                    key={`${model}-${video.id}`}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                  >
                    <div className="aspect-video bg-gray-900 relative">
                      <iframe
                        src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0`}
                        title={video.title}
                        className="absolute inset-0 w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="text-base font-medium text-introcar-charcoal mb-2 line-clamp-2">
                        {video.title}
                      </h3>
                      <p className="text-gray-500 text-sm line-clamp-2">{video.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* Unassigned Videos (no model set) */}
      {unassignedVideos.length > 0 && (
        <section className="py-12 border-b border-gray-100" id="other-videos">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-3 mb-8">
              <Play className="w-6 h-6 text-red-600" />
              <h2 className="text-2xl font-display font-light text-introcar-charcoal">
                Other Videos
              </h2>
              <span className="text-sm text-gray-400">({unassignedVideos.length} videos)</span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {unassignedVideos.map((video) => (
                <div
                  key={video.id}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="aspect-video bg-gray-900 relative">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0`}
                      title={video.title}
                      className="absolute inset-0 w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-medium text-introcar-charcoal mb-2 line-clamp-2">
                      {video.title}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2">{video.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Subscribe CTA */}
      <section className="py-16 bg-introcar-light">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Youtube className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-display font-light text-introcar-charcoal mb-4">
            Subscribe for New Technical Videos
          </h2>
          <p className="text-gray-500 mb-6 max-w-2xl mx-auto">
            We regularly release new technical videos covering maintenance, repairs, and parts for Rolls-Royce and Bentley vehicles. Subscribe to our YouTube channel to stay updated.
          </p>
          <a
            href="https://www.youtube.com/channel/UCXXKCVAUeBYx6TpLREJ_5rQ?sub_confirmation=1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-full hover:bg-red-700 transition-colors"
          >
            <Youtube className="w-5 h-5 mr-2" />
            Subscribe to Our YouTube Channel
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>
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
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-introcar-blue text-white font-medium rounded-full hover:bg-introcar-charcoal transition-colors"
            >
              Contact Our Team
            </Link>
            <a
              href="mailto:info@introcar.com?subject=Technical Question"
              className="inline-flex items-center px-6 py-3 border-2 border-introcar-blue text-introcar-blue font-medium rounded-full hover:bg-introcar-blue hover:text-white transition-colors"
            >
              <Mail className="w-5 h-5 mr-2" />
              Email Us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
