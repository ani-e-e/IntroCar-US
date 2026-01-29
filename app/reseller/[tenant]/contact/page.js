'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Phone, Mail, MapPin, Clock, Send, CheckCircle, ExternalLink } from 'lucide-react';
import ResellerHeader from '../components/ResellerHeader';
import ResellerFooter from '../components/ResellerFooter';
import { useTenant } from '@/context/TenantContext';

function ContactContent({ tenantSlug }) {
  const { colors, companyInfo, tenant } = useTenant();
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

  // Get contact email - prefer specific parts email, fall back to general email
  const contactEmail = companyInfo?.email || companyInfo?.salesEmail || 'info@example.com';

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

    window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

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
            Get in touch with our team for parts inquiries, quotes, or any questions.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h2>

            <div className="space-y-6 mb-8">
              {/* Email */}
              {companyInfo?.email && (
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${colors?.primary}15` }}
                  >
                    <Mail className="w-5 h-5" style={{ color: colors?.primary }} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Email</h3>
                    <a href={`mailto:${companyInfo.email}`} className="text-gray-600 hover:underline">
                      {companyInfo.email}
                    </a>
                    {companyInfo?.salesEmail && companyInfo.salesEmail !== companyInfo.email && (
                      <div className="mt-1">
                        <span className="text-gray-500 text-sm">Sales: </span>
                        <a href={`mailto:${companyInfo.salesEmail}`} className="text-gray-600 hover:underline text-sm">
                          {companyInfo.salesEmail}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Phone */}
              {companyInfo?.phone && (
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${colors?.primary}15` }}
                  >
                    <Phone className="w-5 h-5" style={{ color: colors?.primary }} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Phone</h3>
                    <a href={`tel:${companyInfo.phone.replace(/\s/g, '')}`} className="text-gray-600 hover:underline">
                      {companyInfo.phone}
                    </a>
                  </div>
                </div>
              )}

              {/* Address */}
              {companyInfo?.address && (
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${colors?.primary}15` }}
                  >
                    <MapPin className="w-5 h-5" style={{ color: colors?.primary }} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Address</h3>
                    <p className="text-gray-600">{companyInfo.address}</p>
                    {companyInfo?.partsAddress && companyInfo.partsAddress !== companyInfo.address && (
                      <p className="text-gray-500 text-sm mt-1">Parts: {companyInfo.partsAddress}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Hours */}
              {companyInfo?.hours && (
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${colors?.primary}15` }}
                  >
                    <Clock className="w-5 h-5" style={{ color: colors?.primary }} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Hours</h3>
                    <p className="text-gray-600">{companyInfo.hours}</p>
                  </div>
                </div>
              )}

              {/* Website */}
              {companyInfo?.website && (
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${colors?.primary}15` }}
                  >
                    <ExternalLink className="w-5 h-5" style={{ color: colors?.primary }} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Website</h3>
                    <a
                      href={companyInfo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:underline"
                    >
                      {companyInfo.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Company Card */}
            <div
              className="p-6 rounded-xl border"
              style={{ borderColor: `${colors?.primary}30`, backgroundColor: `${colors?.primary}05` }}
            >
              <h3 className="font-semibold text-gray-900 mb-2">{tenant?.name}</h3>
              {companyInfo?.tagline && (
                <p className="text-gray-600 text-sm mb-3">{companyInfo.tagline}</p>
              )}
              <p className="text-gray-600 text-sm">
                Specializing in quality Rolls-Royce and Bentley parts. Contact us for availability and pricing.
              </p>
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
                  Your email client should have opened. If not, please email us directly at {contactEmail}.
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
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
                      placeholder="Optional - helps us find exact parts"
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
                    placeholder="e.g., Parts Inquiry, Quote Request"
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
                    placeholder="Please describe the parts you're looking for, including vehicle year and model if applicable."
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
  return <ContactContent tenantSlug={params.tenant} />;
}
