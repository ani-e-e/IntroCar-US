import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Award, Users, Globe, Shield, Truck, ArrowRight, CheckCircle } from 'lucide-react';

export const metadata = {
  title: 'About Us',
  description: 'Learn about IntroCar - the world\'s trusted supplier of Rolls-Royce & Bentley parts since 1988. Family-run business with over 230,000 parts available.',
};

const milestones = [
  { year: '1988', title: 'Founded', description: 'IntroCar established as a family business in the UK' },
  { year: '1995', title: 'Expansion', description: 'Warehouse expansion to accommodate growing inventory' },
  { year: '2005', title: 'Prestige Parts®', description: 'Launch of our exclusive aftermarket brand' },
  { year: '2015', title: 'Global Reach', description: 'International shipping to over 100 countries' },
  { year: '2024', title: 'US Launch', description: 'IntroCar USA launched to better serve North American customers' },
];

const stats = [
  { value: '38+', label: 'Years Experience', icon: Clock },
  { value: '230,000+', label: 'Parts Available', icon: Award },
  { value: '100+', label: 'Countries Served', icon: Globe },
  { value: '1000s', label: 'Happy Customers', icon: Users },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-introcar-blue to-introcar-charcoal text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 bg-white/10 text-white text-sm font-medium rounded-full mb-4">
              Our Story
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-light text-white mb-4">
              About IntroCar
            </h1>
            <p className="text-lg text-white/90 leading-relaxed">
              The leading international supplier of Rolls-Royce & Bentley parts,
              serving a global community of enthusiasts and specialists who share our
              passion for keeping the world's most beautiful cars on the road.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-introcar-light border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <div className="flex justify-center mb-2">
                    <Icon className="w-8 h-8 text-introcar-blue" />
                  </div>
                  <div className="text-3xl font-bold text-introcar-charcoal">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-display font-light text-introcar-charcoal mb-6">
                Heritage Meets Innovation
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  IntroCar® is the leading international supplier of Rolls-Royce & Bentley parts,
                  serving a global community of enthusiasts and specialists who share our passion
                  for keeping the world's most beautiful cars on the road.
                </p>
                <p>
                  We're proud to be the market's most trusted source of knowledge and support,
                  and the go-to destination for an unparalleled inventory including original
                  equipment, branded aftermarket, recycled & reconditioned exchange.
                </p>
                <p>
                  As a family-run business established in 1988, we bring decades of expertise
                  and a genuine passion for these marques to everything we do.
                </p>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-introcar-blue mt-1" />
                  <div>
                    <h4 className="font-medium text-introcar-charcoal">Quality Assured</h4>
                    <p className="text-sm text-gray-500">Every part inspected</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-introcar-blue mt-1" />
                  <div>
                    <h4 className="font-medium text-introcar-charcoal">Fast Shipping</h4>
                    <p className="text-sm text-gray-500">Worldwide delivery</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video bg-introcar-light rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/Jp-uqufYyvA?rel=0"
                  title="IntroCar - Heritage Meets Innovation"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-introcar-light">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-light text-introcar-charcoal mb-4">
              Why Choose IntroCar?
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Family Run Business', desc: 'Over 38 years of industry experience and personal service' },
              { title: 'Extensive Inventory', desc: 'Over 230,000 new, recycled & reconditioned parts available' },
              { title: 'Fast Shipping', desc: 'Insured local and international shipping options' },
              { title: 'Price Match Guarantee', desc: 'Excellent customer service and competitive pricing' },
              { title: '3-Year Warranty', desc: 'Worldwide warranty on Prestige Parts® products' },
              { title: 'Specialist Discounts', desc: 'Bulk and trade discounts for enthusiast and trade customers' },
            ].map((item) => (
              <div key={item.title} className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                  <div>
                    <h3 className="font-medium text-introcar-charcoal mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Memberships */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-display font-light text-introcar-charcoal mb-4">
              Proud Members
            </h2>
            <p className="text-gray-500 mb-8">
              We're proud members of leading industry organizations
            </p>
            <div className="flex flex-wrap justify-center items-center gap-12">
              <div className="text-center">
                <div className="h-20 flex items-center justify-center mb-3">
                  <Image
                    src="/images/logos/RRBSA.png"
                    alt="Rolls-Royce Bentley Specialist Association"
                    width={180}
                    height={80}
                    className="object-contain max-h-20"
                  />
                </div>
                <div className="text-sm text-gray-500">Rolls-Royce Bentley Specialist Association</div>
              </div>
              <div className="text-center">
                <div className="h-20 flex items-center justify-center mb-3">
                  <Image
                    src="/images/logos/HCVA Member.jpg"
                    alt="Historic and Classic Vehicles Alliance"
                    width={120}
                    height={80}
                    className="object-contain max-h-20"
                  />
                </div>
                <div className="text-sm text-gray-500">Historic and Classic Vehicles Alliance</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-introcar-blue py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-display font-light text-white mb-2">
                Ready to find your parts?
              </h2>
              <p className="text-gray-300">
                Browse our extensive catalogue or contact our team for expert advice.
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/products"
                className="inline-flex items-center px-6 py-3 bg-white text-introcar-blue font-medium rounded-full hover:bg-introcar-light transition-colors"
              >
                Browse Parts
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center px-6 py-3 bg-white/10 text-white font-medium rounded-full hover:bg-white/20 transition-colors border border-white/20"
              >
                Contact Us
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
