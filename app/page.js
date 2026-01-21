import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shield, Truck, Award, Clock, Wrench, Settings, Zap, Car, CircuitBoard, Gauge, Flame, Droplets, Filter } from 'lucide-react';

// Category data
const categories = [
  { name: 'Body', icon: Car, href: '/products?category=Body', image: '/images/categories/body.jpg' },
  { name: 'Brakes & Hydraulics', icon: Gauge, href: '/products?category=Brakes', image: '/images/categories/brakes.jpg' },
  { name: 'Cooling System', icon: Droplets, href: '/products?category=Cooling', image: '/images/categories/cooling.jpg' },
  { name: 'Electrical & Ignition', icon: Zap, href: '/products?category=Electrical', image: '/images/categories/electrical.jpg' },
  { name: 'Engine', icon: Settings, href: '/products?category=Engine', image: '/images/categories/engine.jpg' },
  { name: 'Exhaust', icon: Flame, href: '/products?category=Exhaust', image: '/images/categories/exhaust.jpg' },
  { name: 'Fuel System', icon: Filter, href: '/products?category=Fuel', image: '/images/categories/fuel.jpg' },
  { name: 'Service & Maintenance', icon: Wrench, href: '/products?category=Service', image: '/images/categories/service.jpg' },
];

// Part options
const partOptions = [
  {
    title: 'Original / Crewe Genuine',
    description: 'Original Equipment (OE) components sourced from Bentley Motors or their appointed agents.',
    href: '/products?stockType=Original+Equipment',
    badge: 'OE',
  },
  {
    title: 'Prestige Parts® Branded',
    description: 'Our exclusive aftermarket range that meets or exceeds OEM specifications. 3-year warranty.',
    href: '/products?stockType=Prestige+Parts',
    badge: 'PP',
    featured: true,
  },
  {
    title: 'Reconditioned & Recycled',
    description: 'Components restored to full working order, tested, roadworthy & supplied with warranty.',
    href: '/products?stockType=Reconditioned+Exchange',
    badge: 'RC',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-introcar-light">
        <div className="container-wide relative py-20 md:py-32">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 bg-introcar-blue/10 text-introcar-blue text-sm font-medium rounded-full mb-6">
              The World's Trusted Supplier
            </span>
            <h1 className="text-4xl md:text-6xl font-display font-light text-introcar-charcoal mb-6 leading-tight">
              Rolls-Royce & Bentley <span className="text-introcar-blue">Parts</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              230,000+ genuine, recycled & reconditioned spares. 3-year warranty on Prestige Parts®.
              Fast shipping to the USA.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products?make=Bentley" className="btn-primary-filled">
                Shop Bentley
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link href="/products?make=Rolls-Royce" className="btn-primary">
                Shop Rolls-Royce
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Vehicle Finder */}
      <section className="bg-white border-y border-gray-200">
        <div className="container-wide py-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="shrink-0">
              <h2 className="text-lg font-display font-light text-introcar-charcoal">Find Parts for Your Vehicle</h2>
              <p className="text-sm text-gray-500">Select your make, model and year</p>
            </div>
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
              <select className="input-field">
                <option value="">Select Make</option>
                <option value="Bentley">Bentley</option>
                <option value="Rolls-Royce">Rolls-Royce</option>
              </select>
              <select className="input-field">
                <option value="">Select Model</option>
              </select>
              <select className="input-field">
                <option value="">Select Year</option>
              </select>
              <button className="btn-primary">
                Find Parts
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="container-wide py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-light text-introcar-charcoal mb-4">Popular Categories</h2>
          <p className="text-gray-500">Browse our extensive range of parts by category</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.name}
                href={category.href}
                className="group relative bg-white border border-gray-200 rounded-xl p-6 text-center hover:border-introcar-blue hover:shadow-lg transition-all duration-300"
              >
                <div className="w-14 h-14 mx-auto mb-4 bg-introcar-light rounded-xl flex items-center justify-center group-hover:bg-introcar-blue/10 transition-colors">
                  <Icon className="w-7 h-7 text-introcar-blue" />
                </div>
                <h3 className="text-introcar-charcoal font-medium group-hover:text-introcar-blue transition-colors">
                  {category.name}
                </h3>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Part Options */}
      <section className="bg-introcar-light">
        <div className="container-wide py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-light text-introcar-charcoal mb-4">Part Options Available</h2>
            <p className="text-gray-500">Choose the right option for your needs and budget</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {partOptions.map((option) => (
              <Link
                key={option.title}
                href={option.href}
                className={`relative p-8 rounded-2xl border transition-all duration-300 group ${
                  option.featured
                    ? 'bg-white border-introcar-blue shadow-lg'
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg'
                }`}
              >
                {option.featured && (
                  <div className="absolute -top-3 left-6">
                    <span className="badge badge-prestige">Recommended</span>
                  </div>
                )}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  option.featured ? 'bg-introcar-blue text-white' : 'bg-introcar-light text-introcar-charcoal'
                }`}>
                  <span className="font-bold">{option.badge}</span>
                </div>
                <h3 className={`text-xl font-display font-light mb-3 ${
                  option.featured ? 'text-introcar-blue' : 'text-introcar-charcoal'
                }`}>
                  {option.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {option.description}
                </p>
                <div className="mt-6 flex items-center text-sm font-medium group-hover:gap-2 transition-all uppercase tracking-wider">
                  <span className={option.featured ? 'text-introcar-blue' : 'text-introcar-charcoal'}>
                    Shop Now
                  </span>
                  <ArrowRight className={`w-4 h-4 ml-1 ${option.featured ? 'text-introcar-blue' : 'text-introcar-charcoal'}`} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="container-wide py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-introcar-blue text-sm font-medium uppercase tracking-wide">Why Choose Us</span>
            <h2 className="text-3xl font-display font-light text-introcar-charcoal mt-2 mb-6">
              Heritage Meets Innovation
            </h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              IntroCar is the leading international supplier of Rolls-Royce & Bentley parts,
              serving a global community of enthusiasts and specialists who share our passion
              for keeping the world's most beautiful cars on the road.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-introcar-light rounded-lg flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-introcar-blue" />
                </div>
                <div>
                  <h4 className="text-introcar-charcoal font-medium">38+ Years</h4>
                  <p className="text-sm text-gray-500">Industry experience</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-introcar-light rounded-lg flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-introcar-blue" />
                </div>
                <div>
                  <h4 className="text-introcar-charcoal font-medium">230,000+</h4>
                  <p className="text-sm text-gray-500">Parts available</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-introcar-light rounded-lg flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 text-introcar-blue" />
                </div>
                <div>
                  <h4 className="text-introcar-charcoal font-medium">Fast Shipping</h4>
                  <p className="text-sm text-gray-500">To USA & worldwide</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-introcar-light rounded-lg flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-introcar-blue" />
                </div>
                <div>
                  <h4 className="text-introcar-charcoal font-medium">3-Year Warranty</h4>
                  <p className="text-sm text-gray-500">On Prestige Parts®</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-introcar-light rounded-2xl overflow-hidden border border-gray-200">
              {/* Placeholder for company image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-24 h-24 mx-auto mb-4 border-2 border-introcar-blue rounded-full flex items-center justify-center">
                    <span className="text-4xl font-display font-light text-introcar-blue">IC</span>
                  </div>
                  <p className="text-gray-500">Family owned since 1988</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-introcar-blue">
        <div className="container-wide py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-display font-light text-white mb-2">
                Can't find what you're looking for?
              </h2>
              <p className="text-gray-300">
                Our parts specialists are here to help. Contact us for expert advice.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-4 bg-white text-introcar-blue font-medium rounded-full hover:bg-introcar-light transition-colors uppercase tracking-wider"
            >
              Contact Our Team
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
