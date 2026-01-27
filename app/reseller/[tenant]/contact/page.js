'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Phone, Mail, MapPin, Clock, Send, CheckCircle, Car, Wrench } from 'lucide-react';
import ResellerHeader from '../components/ResellerHeader';
import ResellerFooter from '../components/ResellerFooter';
import { TenantProvider, useTenant } from '@/context/TenantContext';
import { getTenant } from '@/lib/tenants';

function ContactContent({ tenantSlug }) {
  const { colors, companyInfo } = useTenant();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    vin: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const subject = formData.subject || 'Website Inquiry';
    const body = `
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
${formData.vin ? `VIN: ${formData.vin}` : ''}

Message:
${formData.message}
    `.trim();

    window.location.href = `mailto:parts@albersrb.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    setTimeout(() => {
      setSubmitted(true);
      setSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white">
      <ResellerHeader tenantSlug={tenantSlug} />

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href={`/reseller/${tenantSlug}`} className="hover:text-gray-900">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span style={{ color: colors?.primary }}>Contact</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <div className="py-12" style={{ backgroundColor: `${colors?.primary}08` }}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-display font-light text-gray-900 mb-4">Contact Us</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Contact us for any inquiries regarding parts, service, or pre-owned cars.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Directly</h2>

            <div className="space-y-6 mb-8">
              {/* Parts Sales */}
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${colors?.primary}15` }}
                >
                  <Mail className="w-5 h-5" style={{ color: colors?.primary }} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Parts Sales</h3>
                  <a href="mailto:parts@albersrb.com" className="text-gray-600 hover:underline">
                    parts@albersrb.com
                  </a>
                </div>
              </div>

              {/* Car Sales */}
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${colors?.primary}15` }}
                >
                  <Car className="w-5 h-5" style={{ color: colors?.primary }} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Car Sales</h3>
                  <a href="mailto:sales@albersrb.com" className="text-gray-600 hover:underline">
                    sales@albersrb.com
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${colors?.primary}15` }}
                >
                  <Phone className="w-5 h-5" style={{ color: colors?.primary }} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Call Us</h3>
                  <a href="tel:3178732360" className="text-gray-600 hover:underline">
                    (317) 873-2360
                  </a>
                </div>
              </div>
            </div>

            {/* Locations */}
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Hours & Directions</h2>

            <div className="grid gap-6">
              {/* Pre-Owned Car Sales Location */}
              <div
                className="p-5 rounded-xl border"
                style={{ borderColor: `${colors?.primary}30`, backgroundColor: `${colors?.primary}05` }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <Car className="w-5 h-5 mt-0.5" style={{ color: colors?.primary }} />
                  <div>
                    <h3 className="font-semibold text-gray-900">Preowned Car Sales</h3>
                    <p className="text-gray-600 text-sm">360 S. First St., Zionsville, IN 46077</p>
                  </div>
                </div>
                <div className="ml-8 text-sm text-gray-600 space-y-1">
                  <p>Monday - Friday: 10:00 AM – 4:30 PM</p>
                  <p>Saturday: By Appointment</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>

              {/* Parts & Service Location */}
              <div
                className="p-5 rounded-xl border"
                style={{ borderColor: `${colors?.primary}30`, backgroundColor: `${colors?.primary}05` }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <Wrench className="w-5 h-5 mt-0.5" style={{ color: colors?.primary }} />
                  <div>
                    <h3 className="font-semibold text-gray-900">Parts & Service</h3>
                    <p className="text-gray-600 text-sm">190 W. Sycamore St., Zionsville, IN 46077</p>
                  </div>
                </div>
                <div className="ml-8 text-sm text-gray-600 space-y-1">
                  <p>Monday - Friday: 8:00 AM – 4:30 PM</p>
                  <p>Saturday - Sunday: Closed</p>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="mt-8 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 h-64 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapPin className="w-8 h-8 mx-auto mb-2" />
                <p className="font-medium">Zionsville, Indiana</p>
                <a
                  href="https://maps.google.com/?q=360+S+First+St,+Zionsville,+IN+46077"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm underline mt-2 inline-block"
                  style={{ color: colors?.primary }}
                >
                  Open in Google Maps
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Send Us a Message</h2>

            {submitted ? (
              <div className="text-center py-12">
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${colors?.primary}15` }}
                >
                  <CheckCircle className="w-8 h-8" style={{ color: colors?.primary }} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent</h3>
                <p className="text-gray-600 mb-6">
                  Your email client should have opened. If not, please email us directly at parts@albersrb.com.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2 rounded-full font-medium"
                  style={{ backgroundColor: colors?.primary, color: 'white' }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">VIN Number</label>
                    <input
                      type="text"
                      name="vin"
                      value={formData.vin}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: colors?.primary }}
                >
                  <Send className="w-5 h-5" />
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <ResellerFooter tenantSlug={tenantSlug} />
    </div>
  );
}

export default function ContactPage({ params }) {
  const tenant = getTenant(params.tenant);

  if (!tenant) {
    return <div>Invalid tenant</div>;
  }

  return (
    <TenantProvider tenant={tenant}>
      <ContactContent tenantSlug={params.tenant} />
    </TenantProvider>
  );
}
