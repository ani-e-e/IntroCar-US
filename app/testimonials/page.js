import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Star, ExternalLink, Quote } from 'lucide-react';

export const metadata = {
  title: 'Testimonials',
  description: 'Read reviews and testimonials from IntroCar customers. Rated Excellent on Trustpilot.',
};

// Sample testimonials - would ideally be fetched from Trustpilot API
const testimonials = [
  {
    rating: 5,
    title: 'Excellent service and quality parts',
    text: 'IntroCar provided exactly the parts I needed for my Bentley restoration. Fast shipping to the US and excellent communication throughout.',
    author: 'M. Anderson',
    location: 'California, USA',
    date: 'January 2026',
  },
  {
    rating: 5,
    title: 'The go-to source for RR parts',
    text: 'I\'ve been ordering from IntroCar for years. Their knowledge of Rolls-Royce parts is unmatched and they always find what I need.',
    author: 'J. Williams',
    location: 'Texas, USA',
    date: 'December 2025',
  },
  {
    rating: 5,
    title: 'Prestige Parts quality is outstanding',
    text: 'Fitted Prestige Parts brake components to my Arnage. Perfect fit and quality that matches OEM at a fraction of the price.',
    author: 'R. Thompson',
    location: 'Florida, USA',
    date: 'December 2025',
  },
  {
    rating: 5,
    title: 'Saved my restoration project',
    text: 'Found an NLA part I\'d been searching for months. IntroCar had it in stock and shipped it within days. Incredible service.',
    author: 'D. Chen',
    location: 'New York, USA',
    date: 'November 2025',
  },
  {
    rating: 5,
    title: 'Professional and knowledgeable',
    text: 'The team helped me identify the correct parts for my Silver Shadow. Their expertise saved me from ordering wrong parts.',
    author: 'P. Martinez',
    location: 'Arizona, USA',
    date: 'November 2025',
  },
  {
    rating: 5,
    title: 'Fast international shipping',
    text: 'Despite being in the UK, my order arrived in less than a week. Well packaged and exactly as described.',
    author: 'K. Johnson',
    location: 'Colorado, USA',
    date: 'October 2025',
  },
];

function StarRating({ rating }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 ${star <= rating ? 'text-green-500 fill-green-500' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
}

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-introcar-blue to-introcar-charcoal text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-6 h-6 text-green-400 fill-green-400" />
                ))}
              </div>
              <span className="text-sm font-medium">Rated Excellent</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-light text-white mb-6">
              Customer Reviews
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              See what our customers have to say about their experience with IntroCar.
              We're proud to be rated Excellent on Trustpilot.
            </p>
          </div>
        </div>
      </section>

      {/* Trustpilot Widget */}
      <section className="py-8 bg-introcar-light border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-8 h-8 text-green-500 fill-green-500" />
                ))}
              </div>
              <div>
                <div className="font-semibold text-introcar-charcoal">Excellent</div>
                <div className="text-sm text-gray-500">Based on customer reviews</div>
              </div>
            </div>
            <a
              href="https://www.trustpilot.com/review/introcar.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-[#00B67A] text-white font-medium rounded-full hover:bg-[#00A06A] transition-colors"
            >
              <Star className="w-5 h-5 mr-2 fill-white" />
              See All Reviews on Trustpilot
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <StarRating rating={testimonial.rating} />
                <h3 className="text-lg font-medium text-introcar-charcoal mt-4 mb-2">
                  {testimonial.title}
                </h3>
                <div className="relative">
                  <Quote className="absolute -top-2 -left-2 w-8 h-8 text-introcar-blue/10" />
                  <p className="text-gray-600 text-sm relative z-10 pl-4">
                    {testimonial.text}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="font-medium text-introcar-charcoal">{testimonial.author}</div>
                  <div className="text-sm text-gray-500">{testimonial.location} • {testimonial.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leave a Review CTA */}
      <section className="py-16 bg-introcar-light">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-display font-light text-introcar-charcoal mb-4">
            Had a Great Experience?
          </h2>
          <p className="text-gray-500 mb-6 max-w-2xl mx-auto">
            We'd love to hear about it! Leave us a review on Trustpilot and help other
            Rolls-Royce and Bentley enthusiasts discover IntroCar.
          </p>
          <a
            href="https://www.trustpilot.com/evaluate/introcar.co.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-[#00B67A] text-white font-medium rounded-full hover:bg-[#00A06A] transition-colors"
          >
            Leave a Review on Trustpilot
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
