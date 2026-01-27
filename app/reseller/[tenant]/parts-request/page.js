'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Send, Phone, Mail, CheckCircle, Fax } from 'lucide-react';
import ResellerHeader from '../components/ResellerHeader';
import ResellerFooter from '../components/ResellerFooter';
import { useTenant } from '@/context/TenantContext';

function PartsRequestContent({ tenantSlug }) {
  const { colors, companyInfo } = useTenant();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    fax: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    make: '',
    model: '',
    year: '',
    vin: '',
    coachBuilder: '',
    bodyType: '',
    engineType: '',
    transmission: '',
    powerSteering: '',
    factoryAC: '',
    emissionControl: '',
    partName: '',
    paymentMethod: 'call',
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

    // Create mailto link with form data
    const subject = `Parts Request - ${formData.make} ${formData.model} ${formData.year}`;
    const body = `
ALBERS MOTORCARS PARTS REQUEST

Contact Information:
- Name: ${formData.name}
- Email: ${formData.email}
- Company: ${formData.company || 'N/A'}
- Phone: ${formData.phone}
- Fax: ${formData.fax || 'N/A'}

Shipping Address:
${formData.street}
${formData.city}, ${formData.state} ${formData.zip}
${formData.country}

Vehicle Information:
- Make: ${formData.make}
- Model: ${formData.model}
- Year: ${formData.year}
- VIN/Chassis: ${formData.vin}
- Coach Builder: ${formData.coachBuilder || 'N/A'}
- Body Type: ${formData.bodyType || 'N/A'}
- Engine Type: ${formData.engineType || 'N/A'}
- Transmission: ${formData.transmission || 'N/A'}
- Power Steering: ${formData.powerSteering || 'N/A'}
- Factory A/C: ${formData.factoryAC || 'N/A'}
- Emission Control Air Injection Pump: ${formData.emissionControl || 'N/A'}

Part Request:
${formData.partName}

Payment Preference: ${formData.paymentMethod === 'call' ? 'Please call me to finalize this order' : 'I will call to finalize this order'}
    `.trim();

    // Open mailto
    window.location.href = `mailto:parts@albersrb.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    setTimeout(() => {
      setSubmitted(true);
      setSubmitting(false);
    }, 1000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white">
        <ResellerHeader tenantSlug={tenantSlug} />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div
            className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${colors?.primary}15` }}
          >
            <CheckCircle className="w-10 h-10" style={{ color: colors?.primary }} />
          </div>
          <h1 className="text-3xl font-display font-light text-gray-900 mb-4">Request Submitted</h1>
          <p className="text-gray-600 mb-8">
            Your email client should have opened with your parts request. If it didn't, please email us directly at{' '}
            <a href="mailto:parts@albersrb.com" className="underline" style={{ color: colors?.primary }}>
              parts@albersrb.com
            </a>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/reseller/${tenantSlug}/products`}
              className="px-6 py-3 rounded-full text-white font-medium"
              style={{ backgroundColor: colors?.primary }}
            >
              Browse Parts
            </Link>
            <button
              onClick={() => setSubmitted(false)}
              className="px-6 py-3 rounded-full font-medium border"
              style={{ borderColor: colors?.primary, color: colors?.primary }}
            >
              Submit Another Request
            </button>
          </div>
        </div>
        <ResellerFooter tenantSlug={tenantSlug} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <ResellerHeader tenantSlug={tenantSlug} />

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href={`/reseller/${tenantSlug}`} className="hover:text-gray-900">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span style={{ color: colors?.primary }}>Parts Request</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-display font-light text-gray-900 mb-4">Albers Motorcars Parts Request</h1>
          <div className="text-gray-600 max-w-3xl mx-auto space-y-4">
            <p>
              For over 60 years, the Albers family has been involved with Crewe Built Rolls-Royce and Bentley motorcars. We believe our knowledge and commitment to these timeless classics is second to none.
            </p>
            <p>
              Through the years, we have assembled a vast inventory of parts for Crewe Built Rolls-Royce cars ranging from 1945 to 2002 and Bentley cars from 1945 to present. We also have a limited stock of pre-war parts for Rolls Royce cars from 1920-1939 and for Bentley cars from 1931-1939.
            </p>
            <p>
              As one of the largest independent suppliers of parts for these cars in North America, allow our helpful and experienced staff to assist you Monday through Friday 8 a.m. to 4:30 p.m. EST (NY Time).
            </p>
          </div>
        </div>

        {/* Contact Options */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          <a
            href="tel:3178732360"
            className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${colors?.primary}15` }}
            >
              <Phone className="w-5 h-5" style={{ color: colors?.primary }} />
            </div>
            <div>
              <p className="font-medium text-gray-900">Call Us</p>
              <p className="text-gray-500">(317) 873-2360</p>
            </div>
          </a>
          <a
            href="mailto:parts@albersrb.com"
            className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${colors?.primary}15` }}
            >
              <Mail className="w-5 h-5" style={{ color: colors?.primary }} />
            </div>
            <div>
              <p className="font-medium text-gray-900">Email Us</p>
              <p className="text-gray-500">parts@albersrb.com</p>
            </div>
          </a>
          <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-200">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${colors?.primary}15` }}
            >
              <svg className="w-5 h-5" style={{ color: colors?.primary }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 2H5a2 2 0 00-2 2v16a2 2 0 002 2h14a2 2 0 002-2V4a2 2 0 00-2-2zm-7 18h-2v-2h2v2zm0-4h-2V8h2v8z"/>
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Fax</p>
              <p className="text-gray-500">(317) 873-6860</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Contact Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Contact Information
            </h2>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                />
              </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Fax</label>
                <input
                  type="tel"
                  name="fax"
                  value={formData.fax}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Shipping Address
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                <input
                  type="text"
                  name="zip"
                  value={formData.zip}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                />
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Vehicle Information
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                <select
                  name="make"
                  value={formData.make}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                >
                  <option value="">Select Make</option>
                  <option value="Rolls-Royce">Rolls-Royce</option>
                  <option value="Bentley">Bentley</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input
                  type="text"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chassis/VIN Number *</label>
                <input
                  type="text"
                  name="vin"
                  value={formData.vin}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coach Builder</label>
                <select
                  name="coachBuilder"
                  value={formData.coachBuilder}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                >
                  <option value="">Select</option>
                  <option value="James Young">James Young</option>
                  <option value="Standard RR/B Coachwork">Standard RR/B Coachwork</option>
                  <option value="Mulliner">Mulliner</option>
                  <option value="Parkward">Parkward</option>
                  <option value="Mulliner-Parkwood">Mulliner-Parkwood</option>
                  <option value="Hooper">Hooper</option>
                  <option value="Jankel">Jankel</option>
                  <option value="Pininfarina">Pininfarina</option>
                  <option value="Freestone & Webb">Freestone & Webb</option>
                  <option value="Radford">Radford</option>
                  <option value="Other">Other, Specify in Notes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Body Type</label>
                <select
                  name="bodyType"
                  value={formData.bodyType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                >
                  <option value="">Select</option>
                  <option value="4 Door Sedan">4 Door Sedan</option>
                  <option value="2 Door Sedan">2 Door Sedan</option>
                  <option value="2 Door Coupe">2 Door Coupe</option>
                  <option value="2 Door Convertible">2 Door Convertible</option>
                  <option value="4 Door Convertible">4 Door Convertible</option>
                  <option value="SWB Limousine">SWB Limousine</option>
                  <option value="LWB Limousine">LWB Limousine</option>
                  <option value="Touring Limousine">Touring Limousine</option>
                  <option value="Stretch Limousine">Stretch Limousine</option>
                  <option value="Other">Other, Specify in Notes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Engine Type</label>
                <select
                  name="engineType"
                  value={formData.engineType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                >
                  <option value="">Select</option>
                  <option value="6 cylinder">6 cylinder</option>
                  <option value="V-8">V-8</option>
                  <option value="V-12">V-12</option>
                </select>
              </div>
            </div>

            {/* Vehicle Options */}
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Auto/Standard Transmission</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="transmission" value="Auto" onChange={handleChange} className="w-4 h-4" style={{ accentColor: colors?.primary }} />
                    <span>Auto</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="transmission" value="Standard" onChange={handleChange} className="w-4 h-4" style={{ accentColor: colors?.primary }} />
                    <span>Standard</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Power Steering</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="powerSteering" value="Yes" onChange={handleChange} className="w-4 h-4" style={{ accentColor: colors?.primary }} />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="powerSteering" value="No" onChange={handleChange} className="w-4 h-4" style={{ accentColor: colors?.primary }} />
                    <span>No</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Factory Air Conditioning</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="factoryAC" value="Yes" onChange={handleChange} className="w-4 h-4" style={{ accentColor: colors?.primary }} />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="factoryAC" value="No" onChange={handleChange} className="w-4 h-4" style={{ accentColor: colors?.primary }} />
                    <span>No</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emission Control Air Injection Pump</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="emissionControl" value="Yes" onChange={handleChange} className="w-4 h-4" style={{ accentColor: colors?.primary }} />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="emissionControl" value="No" onChange={handleChange} className="w-4 h-4" style={{ accentColor: colors?.primary }} />
                    <span>No</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Part Name */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Parts Request for Above Vehicle
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Part Name/Description</label>
              <textarea
                name="partName"
                value={formData.partName}
                onChange={handleChange}
                rows={4}
                placeholder="Please describe the part(s) you need..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              />
            </div>
          </div>

          {/* Payment Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Payment Information
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              We do not take credit cards on this page. Please select one of the choices below to determine how you would like to follow up on this request or make a purchase.
            </p>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="call"
                  checked={formData.paymentMethod === 'call'}
                  onChange={handleChange}
                  className="w-4 h-4"
                  style={{ accentColor: colors?.primary }}
                />
                <span className="text-gray-900">Please call me at this number to finalize this order</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="email"
                  checked={formData.paymentMethod === 'email'}
                  onChange={handleChange}
                  className="w-4 h-4"
                  style={{ accentColor: colors?.primary }}
                />
                <span className="text-gray-900">Please email me with information about this order</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="willCall"
                  checked={formData.paymentMethod === 'willCall'}
                  onChange={handleChange}
                  className="w-4 h-4"
                  style={{ accentColor: colors?.primary }}
                />
                <span className="text-gray-900">I will call to finalize this order (Call 317-873-2360)</span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
              style={{ backgroundColor: colors?.primary }}
            >
              <Send className="w-5 h-5" />
              {submitting ? 'Submitting...' : 'Submit Parts Request'}
            </button>
            <p className="text-center text-sm text-gray-500 mt-4">
              We typically respond within 24 hours during business days (Mon-Fri 8am-4:30pm EST).
            </p>
          </div>
        </form>
      </div>

      <ResellerFooter tenantSlug={tenantSlug} />
    </div>
  );
}

export default function PartsRequestPage({ params }) {
  return <PartsRequestContent tenantSlug={params.tenant} />;
}
