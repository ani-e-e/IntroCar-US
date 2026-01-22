import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Phone, Mail, MapPin, Clock, MessageSquare } from 'lucide-react';

export const metadata = {
  title: 'Contact Us',
  description: 'Get in touch with IntroCar USA. Contact our parts specialists for expert advice on Rolls-Royce & Bentley parts.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-introcar-blue to-introcar-charcoal text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-display font-light text-white mb-4">
              Contact Us
            </h1>
            <p className="text-lg text-white/90 leading-relaxed">
              Our parts specialists are here to help. Get in touch for expert advice
              on finding the right parts for your Rolls-Royce or Bentley.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Phone */}
            <div className="bg-introcar-light p-6 rounded-xl text-center">
              <div className="w-12 h-12 bg-introcar-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-introcar-blue" />
              </div>
              <h3 className="font-medium text-introcar-charcoal mb-2">Phone (UK HQ)</h3>
              <a href="tel:+442085462027" className="text-introcar-blue hover:underline">
                +44 (0)20 8546 2027
              </a>
              <p className="text-sm text-gray-500 mt-1">Mon-Fri, 9am-5pm GMT</p>
            </div>

            {/* WhatsApp */}
            <div className="bg-introcar-light p-6 rounded-xl text-center">
              <div className="w-12 h-12 bg-introcar-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-introcar-blue" />
              </div>
              <h3 className="font-medium text-introcar-charcoal mb-2">WhatsApp</h3>
              <a href="tel:+447948756373" className="text-introcar-blue hover:underline">
                +44 (0)79 4875 6373
              </a>
              <p className="text-sm text-gray-500 mt-1">Quick responses</p>
            </div>

            {/* Email */}
            <div className="bg-introcar-light p-6 rounded-xl text-center">
              <div className="w-12 h-12 bg-introcar-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-introcar-blue" />
              </div>
              <h3 className="font-medium text-introcar-charcoal mb-2">Email</h3>
              <a href="mailto:sales@introcar.com" className="text-introcar-blue hover:underline">
                sales@introcar.com
              </a>
              <p className="text-sm text-gray-500 mt-1">We aim to reply within 24hrs</p>
            </div>

            {/* Hours */}
            <div className="bg-introcar-light p-6 rounded-xl text-center">
              <div className="w-12 h-12 bg-introcar-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-introcar-blue" />
              </div>
              <h3 className="font-medium text-introcar-charcoal mb-2">Opening Hours</h3>
              <p className="text-gray-600">Monday - Friday</p>
              <p className="text-sm text-gray-500">9:00 AM - 5:00 PM (GMT)</p>
            </div>
          </div>

          {/* Contact Form & Map */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-display font-light text-introcar-charcoal mb-6">
                Send Us a Message
              </h2>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-introcar-blue focus:border-introcar-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-introcar-blue focus:border-introcar-blue"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-introcar-blue focus:border-introcar-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-introcar-blue focus:border-introcar-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Details (Make, Model, Year)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Bentley Arnage 2003"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-introcar-blue focus:border-introcar-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-introcar-blue focus:border-introcar-blue"
                    placeholder="Please describe what parts you're looking for..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-introcar-blue text-white font-medium rounded-lg hover:bg-introcar-charcoal transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Location Info */}
            <div>
              <h2 className="text-2xl font-display font-light text-introcar-charcoal mb-6">
                Our Location
              </h2>
              <div className="bg-introcar-light rounded-xl p-6 mb-6">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-introcar-blue mt-1" />
                  <div>
                    <h3 className="font-medium text-introcar-charcoal mb-2">IntroCar UK Headquarters</h3>
                    <p className="text-gray-600">
                      Units C & D The Pavilions<br />
                      2 East Road<br />
                      Wimbledon<br />
                      London SW19 1UW<br />
                      United Kingdom
                    </p>
                    <p className="text-sm text-gray-500 mt-3">
                      Company Registration Number 02105867<br />
                      VAT no. 468638789
                    </p>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="aspect-video bg-gray-200 rounded-xl flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>Map would be displayed here</p>
                  <a
                    href="https://maps.google.com/?q=IntroCar+Surbiton+UK"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-introcar-blue hover:underline text-sm"
                  >
                    Open in Google Maps
                  </a>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note for US Customers:</strong> Our main warehouse and headquarters
                  are located in the UK. We ship daily to the USA via DHL Express with typical
                  delivery times of 3-5 business days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
