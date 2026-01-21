'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, Menu, X, Phone, User, ChevronDown, Check, Truck, Shield, Star } from 'lucide-react';

export default function Header({ cartCount = 0 }) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleFinderOpen, setVehicleFinderOpen] = useState(false);

  // Vehicle finder state
  const [vehicles, setVehicles] = useState([]);
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [vehiclesLoading, setVehiclesLoading] = useState(true);

  // Load vehicle data
  useEffect(() => {
    fetch('/data/vehicles.json')
      .then(res => res.json())
      .then(data => {
        setVehicles(data);
        setVehiclesLoading(false);
      })
      .catch(err => {
        console.error('Failed to load vehicles:', err);
        setVehiclesLoading(false);
      });
  }, []);

  // Get unique makes
  const makes = [...new Set(vehicles.map(v => v.make))].sort();

  // Get models for selected make
  const models = selectedMake
    ? [...new Set(vehicles.filter(v => v.make === selectedMake).map(v => v.model))].sort()
    : [];

  // Get years for selected model
  const getYearsForModel = () => {
    if (!selectedMake || !selectedModel) return [];
    const vehicle = vehicles.find(v => v.make === selectedMake && v.model === selectedModel);
    if (!vehicle) return [];
    const years = [];
    for (let year = vehicle.yearStart; year <= vehicle.yearEnd; year++) {
      years.push(year);
    }
    return years.reverse();
  };

  const years = getYearsForModel();

  // Handle vehicle finder search
  const handleVehicleSearch = () => {
    const params = new URLSearchParams();
    if (selectedMake) params.set('make', selectedMake);
    if (selectedModel) params.set('model', selectedModel);
    if (selectedYear) params.set('year', selectedYear);
    router.push(`/products?${params.toString()}`);
    setVehicleFinderOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Top Trust Bar */}
      <div className="trust-bar hidden md:block">
        <div className="container-wide">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div className="trust-item">
                <Check className="w-4 h-4" />
                <span>Family Run Business Est. 1988</span>
              </div>
              <div className="trust-item">
                <Truck className="w-4 h-4" />
                <span>Insured Worldwide Shipping</span>
              </div>
              <div className="trust-item">
                <Shield className="w-4 h-4" />
                <span>Price Match Guarantee</span>
              </div>
              <a
                href="https://uk.trustpilot.com/review/introcar.co.uk?utm_medium=trustbox&utm_source=Mini"
                target="_blank"
                rel="noopener noreferrer"
                className="trust-item hover:text-introcar-blue transition-colors"
              >
                <Star className="w-4 h-4 fill-introcar-blue text-introcar-blue" />
                <span>Rated Excellent on Trustpilot</span>
              </a>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <a href="tel:+442085462027" className="text-introcar-charcoal hover:text-introcar-blue transition-colors">
                <Phone className="w-4 h-4 inline mr-1" />
                +44 (0)20 8546 2027
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-wide">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0">
              <div className="flex items-center">
                <div className="w-10 h-10 border-2 border-introcar-blue rounded-full flex items-center justify-center mr-2">
                  <span className="text-introcar-blue font-bold text-sm">IC</span>
                </div>
                <span className="text-2xl font-display font-light text-introcar-blue tracking-wide">IntroCar</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <button
                onClick={() => setVehicleFinderOpen(!vehicleFinderOpen)}
                className="nav-link flex items-center gap-1"
              >
                Vehicle Part Finder
                <ChevronDown className={`w-4 h-4 transition-transform ${vehicleFinderOpen ? 'rotate-180' : ''}`} />
              </button>
              <Link href="/catalogues" className="nav-link">
                Shop by Catalogue
              </Link>
              <Link href="/products" className="nav-link">
                Shop by Model
              </Link>
              <Link href="/products?stockType=Prestige+Parts" className="text-introcar-blue hover:underline transition-colors font-medium">
                Prestige Parts®
              </Link>
            </nav>

            {/* Search Bar */}
            <div className="hidden md:block flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="search-box">
                <Search className="search-icon w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by part number or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              {/* Account */}
              <Link
                href="/account"
                className="hidden sm:flex items-center gap-2 text-introcar-charcoal hover:text-introcar-blue transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="text-sm">Account</span>
              </Link>

              {/* Cart */}
              <Link href="/cart" className="relative p-2 text-introcar-charcoal hover:text-introcar-blue transition-colors">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-introcar-blue text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-introcar-charcoal hover:text-introcar-blue transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Finder Dropdown */}
      {vehicleFinderOpen && (
        <div className="absolute left-0 right-0 bg-white border-b border-gray-200 shadow-lg animate-slide-down">
          <div className="container-wide py-8">
            <h3 className="text-lg font-display font-light text-introcar-charcoal mb-6">Find Parts for Your Vehicle</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-2">Make</label>
                <select
                  className="input-field"
                  value={selectedMake}
                  onChange={(e) => {
                    setSelectedMake(e.target.value);
                    setSelectedModel('');
                    setSelectedYear('');
                  }}
                  disabled={vehiclesLoading}
                >
                  <option value="">Select Make</option>
                  {makes.map(make => (
                    <option key={make} value={make}>{make}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-2">Model</label>
                <select
                  className="input-field"
                  value={selectedModel}
                  onChange={(e) => {
                    setSelectedModel(e.target.value);
                    setSelectedYear('');
                  }}
                  disabled={!selectedMake || vehiclesLoading}
                >
                  <option value="">Select Model</option>
                  {models.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-2">Year</label>
                <select
                  className="input-field"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  disabled={!selectedModel || vehiclesLoading}
                >
                  <option value="">Select Year</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  className="btn-primary w-full"
                  onClick={handleVehicleSearch}
                  disabled={!selectedMake}
                >
                  Find Parts
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 animate-slide-down">
          <div className="container-wide py-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="search-box mb-4">
              <Search className="search-icon w-5 h-5" />
              <input
                type="text"
                placeholder="Search parts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            {/* Mobile Nav Links */}
            <nav className="space-y-1">
              <Link href="/products" className="block py-3 px-4 text-introcar-charcoal hover:text-introcar-blue hover:bg-introcar-light rounded-lg transition-colors">
                All Parts
              </Link>
              <Link href="/products?make=Bentley" className="block py-3 px-4 text-introcar-charcoal hover:text-introcar-blue hover:bg-introcar-light rounded-lg transition-colors">
                Bentley Parts
              </Link>
              <Link href="/products?make=Rolls-Royce" className="block py-3 px-4 text-introcar-charcoal hover:text-introcar-blue hover:bg-introcar-light rounded-lg transition-colors">
                Rolls-Royce Parts
              </Link>
              <Link href="/products?stockType=Prestige+Parts" className="block py-3 px-4 text-introcar-blue hover:bg-introcar-light rounded-lg transition-colors font-medium">
                Prestige Parts®
              </Link>
              <hr className="border-gray-200 my-2" />
              <Link href="/account" className="block py-3 px-4 text-introcar-charcoal hover:text-introcar-blue hover:bg-introcar-light rounded-lg transition-colors">
                My Account
              </Link>
              <Link href="/contact" className="block py-3 px-4 text-introcar-charcoal hover:text-introcar-blue hover:bg-introcar-light rounded-lg transition-colors">
                Contact Us
              </Link>
            </nav>

            {/* Mobile Trust Items */}
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-3">
              <div className="trust-item text-xs">
                <Check className="w-3 h-3" />
                <span>Est. 1988</span>
              </div>
              <div className="trust-item text-xs">
                <Truck className="w-3 h-3" />
                <span>Fast Shipping</span>
              </div>
              <div className="trust-item text-xs">
                <Shield className="w-3 h-3" />
                <span>Price Match</span>
              </div>
              <div className="trust-item text-xs">
                <Star className="w-3 h-3 fill-introcar-blue text-introcar-blue" />
                <span>5★ Rated</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
