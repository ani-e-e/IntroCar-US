import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Youtube, Facebook, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      {/* Newsletter Section */}
      <div className="bg-introcar-light border-b border-gray-200">
        <div className="container-wide py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-display font-light text-introcar-charcoal mb-2">
                Get 10% off your next order
              </h3>
              <p className="text-gray-500">
                Stay up to date with IntroCar and be the first to get all the latest news and promotions
              </p>
            </div>
            <form className="flex gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="input-field flex-1 md:w-80"
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                Sign Up
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer - Blue Background */}
      <div className="bg-introcar-blue">
        <div className="container-wide py-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {/* Logo & About */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="block mb-4">
                <Image
                  src="/images/logos/footer-logo-intro_1_.webp"
                  alt="IntroCar USA"
                  width={160}
                  height={50}
                  className="h-12 w-auto"
                />
              </Link>
              <p className="text-gray-300 text-sm mb-4">
                The Registered Home of Prestige Parts®
              </p>
              <div className="space-y-2 text-sm">
                <a href="tel:+442085462027" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                  <Phone className="w-4 h-4" />
                  +44 (0)20 8546 2027
                </a>
                <a href="mailto:sales@introcar.com" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                  <Mail className="w-4 h-4" />
                  sales@introcar.com
                </a>
                <div className="flex items-start gap-2 text-gray-300 pt-2">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>Units C & D The Pavilions,<br />2 East Road, Wimbledon,<br />London SW19 1UW</span>
                </div>
              </div>
            </div>

            {/* Company */}
            <div>
              <h4 className="footer-heading">Company</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="footer-link">About Us</Link></li>
                <li><Link href="/testimonials" className="footer-link">Testimonials</Link></li>
                <li><Link href="/blog" className="footer-link">Blog</Link></li>
                <li><Link href="/prestige-parts" className="footer-link">Prestige Parts® Range</Link></li>
              </ul>
            </div>

            {/* Useful Links */}
            <div>
              <h4 className="footer-heading">Useful Links</h4>
              <ul className="space-y-3">
                <li><Link href="/community" className="footer-link">Community & Clubs</Link></li>
                <li><a href="https://www.rrtechnical.info/" target="_blank" rel="noopener noreferrer" className="footer-link">Workshop Manuals</a></li>
                <li><Link href="/technical" className="footer-link">Technical Info</Link></li>
                <li><Link href="/specialists" className="footer-link">Specialist Links</Link></li>
              </ul>
            </div>

            {/* Information */}
            <div>
              <h4 className="footer-heading">Information</h4>
              <ul className="space-y-3">
                <li><Link href="/contact" className="footer-link">Contact Us</Link></li>
                <li><Link href="/terms" className="footer-link">Terms & Conditions</Link></li>
                <li><Link href="/privacy" className="footer-link">Privacy Policy</Link></li>
                <li><Link href="/shipping" className="footer-link">Delivery & Shipping</Link></li>
              </ul>
            </div>

            {/* Social & Trustpilot */}
            <div>
              <h4 className="footer-heading">Connect With Us</h4>
              <div className="flex gap-3 mb-6">
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"
                   className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-gray-300 hover:bg-white hover:text-introcar-blue transition-all">
                  <Youtube className="w-5 h-5" />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                   className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-gray-300 hover:bg-white hover:text-introcar-blue transition-all">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                   className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-gray-300 hover:bg-white hover:text-introcar-blue transition-all">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                   className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-gray-300 hover:bg-white hover:text-introcar-blue transition-all">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
              {/* Trustpilot Widget */}
              <a
                href="https://www.trustpilot.com/review/introcar.co.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white/10 hover:bg-white/20 transition-colors rounded-lg p-4 text-center"
              >
                <div className="flex justify-center gap-1 mb-2">
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} className="w-5 h-5 text-green-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-300">Rated <span className="text-white font-semibold">Excellent</span> on Trustpilot</p>
                <p className="text-xs text-gray-400 mt-1">Click to see our reviews</p>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20">
          <div className="container-wide py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-400">
                © {new Date().getFullYear()} IntroCar. All rights reserved.
              </p>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm">Secure payments:</span>
                <div className="flex gap-2">
                  <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-300 font-semibold">VISA</span>
                  </div>
                  <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-300 font-semibold">MC</span>
                  </div>
                  <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-300 font-semibold">AMEX</span>
                  </div>
                  <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-300 font-semibold">PayPal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
