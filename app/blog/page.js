import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ExternalLink, Calendar, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Blog',
  description: 'Latest news, articles, and updates from IntroCar about Rolls-Royce and Bentley parts, restorations, and the community.',
};

// Placeholder blog posts - would be fetched from Magento/Amasty Blog API
const blogPosts = [
  {
    title: 'New USA Tariffs on UK Auto Parts: What You Need to Know',
    excerpt: 'Important information about recent changes to US import tariffs and how they may affect your parts orders.',
    date: 'January 2026',
    category: 'News',
    url: 'https://www.introcar.com/blog/new-usa-tariffs-on-uk-auto-parts-what-you-need-to-know',
  },
  {
    title: 'Spectre Bailey: A Rolls-Royce Commission Born from Loyalty and Love',
    excerpt: 'The story behind an extraordinary bespoke Rolls-Royce creation.',
    date: 'October 2025',
    category: 'Feature',
    url: 'https://www.introcar.com/blog/spectre-bailey-a-rolls-royce-commission-born-from-loyalty-and-love',
  },
  {
    title: 'Vibrant in Violette: A Modern Revival of a Classic Bentley Hue',
    excerpt: 'Exploring the return of a beloved heritage color in the modern Bentley range.',
    date: 'October 2025',
    category: 'Feature',
    url: 'https://www.introcar.com/blog/vibrant-in-violette-a-modern-revival-of-a-classic-bentley-hue',
  },
  {
    title: 'Supplying The Golden Roller: A Conversation Between Passion and Precision',
    excerpt: 'Behind the scenes of a remarkable restoration project.',
    date: 'October 2025',
    category: 'Feature',
    url: 'https://www.introcar.com/blog/supplying-the-golden-roller--a-conversation-between-passion-and-precision',
  },
  {
    title: 'Prestige Parts: Developing Rolls-Royce and Bentley Parts 1945-Present',
    excerpt: 'The history and development of our exclusive Prestige Parts® range.',
    date: 'September 2025',
    category: 'Technical',
    url: 'https://www.introcar.com/blog/prestige-parts-developing-rolls-royce-and-bentley-parts-1945-present',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-introcar-blue to-introcar-charcoal text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 bg-white/10 text-white text-sm font-medium rounded-full mb-6">
              News & Articles
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-light mb-6">
              Blog
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              Stay up to date with the latest news, technical articles, and stories from
              the world of Rolls-Royce and Bentley.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {blogPosts.map((post) => (
              <a
                key={post.title}
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-introcar-blue transition-all group"
              >
                {/* Placeholder image */}
                <div className="aspect-video bg-introcar-light flex items-center justify-center">
                  <div className="text-4xl font-display text-introcar-blue/20">IC</div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-block px-2 py-1 bg-introcar-blue/10 text-xs text-introcar-blue rounded">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {post.date}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-introcar-charcoal mb-2 group-hover:text-introcar-blue transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2">{post.excerpt}</p>
                  <div className="mt-4 flex items-center text-introcar-blue text-sm font-medium">
                    Read more
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* View All Link */}
          <div className="text-center">
            <a
              href="https://www.introcar.com/blog"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-introcar-blue text-white font-medium rounded-full hover:bg-introcar-charcoal transition-colors"
            >
              View All Articles on IntroCar.com
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </div>
        </div>
      </section>

      {/* Integration Note */}
      <section className="py-8 bg-introcar-light">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <p className="text-gray-500 text-sm text-center">
              <strong>Note:</strong> This page shows selected articles from our main blog.
              For the complete archive of news and articles, visit{' '}
              <a
                href="https://www.introcar.com/blog"
                target="_blank"
                rel="noopener noreferrer"
                className="text-introcar-blue hover:underline"
              >
                introcar.com/blog
              </a>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
