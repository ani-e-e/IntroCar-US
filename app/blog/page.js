import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { ExternalLink, Calendar, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Blog',
  description: 'Latest news, articles, and updates from IntroCar about Rolls-Royce and Bentley parts, restorations, and the community.',
};

const blogPosts = [
  {
    title: 'Assembling the UG2747-X Rear Wheel Cylinder for Bentley S1 and Rolls-Royce Silver Cloud I',
    excerpt: 'A detailed guide on assembling the rear wheel cylinder for classic Bentley S1 and Rolls-Royce Silver Cloud I models.',
    date: 'December 2024',
    category: 'Technical',
    image: '/images/blog/blog-assembling-wheel-cylinders.webp',
    url: 'https://www.introcar.com/blog/assembling-the-ug2747-x-rear-wheel-cylinder-for-bentley-s1-and-rolls-royce-silver-cloud-i',
  },
  {
    title: '6 Common Bentley Continental GT Issues (2004-2018) – and the Parts to Fix Them',
    excerpt: 'Discover the most common problems affecting Bentley Continental GT models and the replacement parts available to resolve them.',
    date: 'November 2024',
    category: 'Technical',
    image: '/images/blog/blog-6-common-issues-continental-gt.webp',
    url: 'https://www.introcar.com/blog/6-common-bentley-continental-gt-issues-20042018--and-the-parts-to-fix-them',
  },
  {
    title: "Own a Classic Rolls-Royce or Bentley? Don't Ignore These 5 Common Issues",
    excerpt: 'Essential maintenance advice for classic Rolls-Royce and Bentley owners - the key issues to watch out for and how to address them.',
    date: 'October 2024',
    category: 'Technical',
    image: '/images/blog/blog-own-a-classic-roller.webp',
    url: 'https://www.introcar.com/blog/own-a-classic-rolls-royce-or-bentley-dont-ignore-these-5-common-issues',
  },
  {
    title: 'Supplying The Golden Roller: A Conversation Between Passion and Precision',
    excerpt: 'Behind the scenes of a remarkable restoration project and how IntroCar helped bring this stunning golden Rolls-Royce back to life.',
    date: 'October 2025',
    category: 'Feature',
    image: '/images/blog/blog-supplying-golden-roller.webp',
    url: 'https://www.introcar.com/blog/supplying-the-golden-roller--a-conversation-between-passion-and-precision',
  },
  {
    title: 'New Rolls-Royce & Bentley Parts Update – April 2025',
    excerpt: 'The latest additions to our catalogue including new Prestige Parts releases and hard-to-find components now back in stock.',
    date: 'April 2025',
    category: 'News',
    image: '/images/blog/blog-product-updates.webp',
    url: 'https://www.introcar.com/blog/new-rolls-royce-bentley-parts-update-april-2025',
  },
  {
    title: 'Mulsanne Replacement Chrome Door Handle: How-To Guide & Video Tutorial',
    excerpt: 'Step-by-step instructions and video tutorial for replacing the chrome door handle on Bentley Mulsanne models.',
    date: 'September 2024',
    category: 'How-To',
    image: '/images/blog/blog-chrome-door-handle.webp',
    url: 'https://www.introcar.com/blog/mulsanne-replacement-chrome-door-handle-how-to-guide-video-tutorial',
  },
  {
    title: 'Inside Prestige Parts: Developing Rolls-Royce and Bentley Parts 1945-Present',
    excerpt: 'The history and development of our exclusive Prestige Parts® range - how we engineer quality aftermarket components for classic and modern marques.',
    date: 'September 2025',
    category: 'Feature',
    image: '/images/blog/blog-inside-prestige-parts.webp',
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
            <h1 className="text-4xl md:text-5xl font-display font-light text-white mb-6">
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
                {/* Blog Image */}
                <div className="aspect-video relative overflow-hidden bg-introcar-light">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
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
