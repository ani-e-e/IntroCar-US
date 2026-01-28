'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, Menu, X, Phone, User, ChevronDown, Check, Truck, Shield, Star, AlertCircle, CheckCircle } from 'lucide-react';
import ShopByModelMegaMenu from './ShopByModelMegaMenu';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const { itemCount: cartCount } = useCart();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleFinderOpen, setVehicleFinderOpen] = useState(false);
  const [shopByModelOpen, setShopByModelOpen] = useState(false);

  // Vehicle finder state
  const [vehicles, setVehicles] = useState([]);
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [vehiclesLoading, setVehiclesLoading] = useState(true);

  // Chassis lookup state
  const [chassisLookupMode, setChassisLookupMode] = useState(false);
  const [chassisInput, setChassisInput] = useState('');
  const [chassisLookupResult, setChassisLookupResult] = useState(null);
  const [chassisLookupLoading, setChassisLookupLoading] = useState(false);

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

  // Handle vehicle finder search - goes to /products (parts only)
  const handleVehicleSearch = () => {
    const params = new URLSearchParams();
    if (selectedMake) params.set('make', selectedMake);
    if (selectedModel) params.set('model', selectedModel);
    if (selectedYear) params.set('year', selectedYear);
    // Include chassis if it was entered (from chassis lookup)
    if (chassisInput.trim()) params.set('chassis', chassisInput.trim().toUpperCase());
    router.push(`/products?${params.toString()}`);
    setVehicleFinderOpen(false);
  };

  // Handle shop by model - goes to /shop (parts + catalogues)
  const handleShopByModel = () => {
    const params = new URLSearchParams();
    if (selectedMake) params.set('make', selectedMake);
    if (selectedModel) params.set('model', selectedModel);
    if (selectedYear) params.set('year', selectedYear);
    router.push(`/shop?${params.toString()}`);
    setVehicleFinderOpen(false);
  };

  // Toggle chassis lookup mode
  const toggleChassisLookupMode = () => {
    setChassisLookupMode(!chassisLookupMode);
    setChassisInput('');
    setChassisLookupResult(null);
    if (!chassisLookupMode) {
      // Entering lookup mode - clear vehicle selection
      setSelectedMake('');
      setSelectedModel('');
      setSelectedYear('');
    }
  };

  // Perform chassis lookup
  const performChassisLookup = async () => {
    if (!chassisInput || chassisInput.length < 2) return;

    setChassisLookupLoading(true);
    setChassisLookupResult(null);

    try {
      const res = await fetch(`/api/chassis-lookup?chassis=${encodeURIComponent(chassisInput)}`);
      const data = await res.json();
      setChassisLookupResult(data);

      // If single match found, auto-populate make/model
      if (data.found && !data.multipleMatches) {
        setSelectedMake(data.make);
        setSelectedModel(data.model);
        if (data.yearStart === data.yearEnd) {
          setSelectedYear(String(data.yearStart));
        }
      }
    } catch (err) {
      console.error('Chassis lookup error:', err);
      setChassisLookupResult({ found: false, error: 'Lookup failed' });
    } finally {
      setChassisLookupLoading(false);
    }
  };

  // Handle Enter key in chassis input
  const handleChassisKeyDown = (e) => {
    if (e.key === 'Enter') {
      performChassisLookup();
    }
  };

  // Apply chassis lookup result to selection
  const applyChassisMatch = (match) => {
    setSelectedMake(match.make);
    setSelectedModel(match.model);
    if (match.yearStart === match.yearEnd) {
      setSelectedYear(String(match.yearStart));
    }
    setChassisLookupMode(false);
    setChassisLookupResult(null);
  };

  // Search with chassis included
  const handleVehicleSearchWithChassis = () => {
    const params = new URLSearchParams();
    if (selectedMake) params.set('make', selectedMake);
    if (selectedModel) params.set('model', selectedModel);
    if (selectedYear) params.set('year', selectedYear);
    if (chassisInput.trim()) params.set('chassis', chassisInput.trim().toUpperCase());
    router.push(`/products?${params.toString()}`);
    setVehicleFinderOpen(false);
    setChassisLookupMode(false);
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
          <div className="flex items-center justify-between h-28">
            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0 mr-8">
              <Image
                src="/images/logos/introcar-logo.png"
                alt="IntroCar - Rolls-Royce & Bentley Parts Specialists"
                width={350}
                height={110}
                className="h-20 md:h-24 w-auto"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              <button
                onClick={() => {
                  setVehicleFinderOpen(!vehicleFinderOpen);
                  setShopByModelOpen(false);
                }}
                className="nav-link flex items-center gap-1"
              >
                Vehicle Part Finder
                <ChevronDown className={`w-4 h-4 transition-transform ${vehicleFinderOpen ? 'rotate-180' : ''}`} />
              </button>
              <Link href="/catalogues" className="nav-link">
                Shop by Catalogue
              </Link>
              <button
                onClick={() => {
                  setShopByModelOpen(!shopByModelOpen);
                  setVehicleFinderOpen(false);
                }}
                className="nav-link flex items-center gap-1"
              >
                Shop by Model
                <ChevronDown className={`w-4 h-4 transition-transform ${shopByModelOpen ? 'rotate-180' : ''}`} />
              </button>
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
            {/* Know Your Chassis Number? - Prominent Button */}
            <div className="mb-6">
              <button
                onClick={toggleChassisLookupMode}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 font-medium text-sm transition-all ${
                  chassisLookupMode
                    ? 'bg-introcar-blue text-white border-introcar-blue'
                    : 'bg-white text-introcar-blue border-introcar-blue hover:bg-introcar-blue hover:text-white'
                }`}
              >
                <Search className="w-4 h-4" />
                Know Your Chassis Number?
              </button>
            </div>

            {/* Chassis Lookup Mode */}
            {chassisLookupMode ? (
              <div className="bg-introcar-light rounded-lg p-6">
                <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
                  <div className="flex-1 w-full md:w-auto">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter Chassis Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. ALB36 or 12345"
                        value={chassisInput}
                        onChange={(e) => setChassisInput(e.target.value.toUpperCase().replace(/\s/g, ''))}
                        onKeyDown={handleChassisKeyDown}
                        className="input-field flex-1 font-mono text-lg tracking-wider"
                        maxLength={10}
                        autoFocus
                      />
                      <button
                        onClick={performChassisLookup}
                        disabled={!chassisInput || chassisInput.length < 2 || chassisLookupLoading}
                        className="btn-primary px-6 flex items-center gap-2"
                      >
                        {chassisLookupLoading ? (
                          <span className="animate-spin">⏳</span>
                        ) : (
                          <Search className="w-4 h-4" />
                        )}
                        Lookup
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Enter the chassis code from your vehicle&apos;s VIN plate
                    </p>
                  </div>
                  <button
                    onClick={toggleChassisLookupMode}
                    className="text-sm text-gray-500 hover:text-introcar-blue underline"
                  >
                    Back to vehicle selection
                  </button>
                </div>

                {/* Lookup Results */}
                {chassisLookupResult && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {chassisLookupResult.found ? (
                      chassisLookupResult.multipleMatches ? (
                        <div>
                          <p className="text-sm font-medium text-amber-700 flex items-center gap-2 mb-3">
                            <AlertCircle className="w-4 h-4" />
                            Chassis &quot;{chassisLookupResult.chassis}&quot; found in multiple models:
                          </p>
                          <div className="grid gap-2">
                            {chassisLookupResult.matches.map((match, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-3 bg-white rounded border border-gray-200"
                              >
                                <div>
                                  <span className="font-medium">{match.make} {match.model}</span>
                                  <span className="text-gray-500 ml-2">
                                    ({match.yearStart}{match.yearStart !== match.yearEnd ? ` – ${match.yearEnd}` : ''})
                                  </span>
                                </div>
                                <button
                                  onClick={() => {
                                    const params = new URLSearchParams();
                                    params.set('make', match.make);
                                    params.set('model', match.model);
                                    params.set('chassis', chassisInput.trim().toUpperCase());
                                    router.push(`/products?${params.toString()}`);
                                    setVehicleFinderOpen(false);
                                    setChassisLookupMode(false);
                                  }}
                                  className="btn-primary text-sm px-4 py-1.5"
                                >
                                  Find Parts
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="font-medium text-green-700">
                                Found: {chassisLookupResult.make} {chassisLookupResult.model}
                              </p>
                              <p className="text-sm text-gray-600">
                                Year: {chassisLookupResult.yearStart}
                                {chassisLookupResult.yearStart !== chassisLookupResult.yearEnd && ` – ${chassisLookupResult.yearEnd}`}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={handleVehicleSearchWithChassis}
                            className="btn-primary"
                          >
                            Find Parts
                          </button>
                        </div>
                      )
                    ) : (
                      <div className="flex items-center gap-3 text-red-600">
                        <AlertCircle className="w-5 h-5" />
                        <div>
                          <p className="font-medium">{chassisLookupResult.message || 'Chassis not found'}</p>
                          <p className="text-sm text-gray-600">
                            Please check the code and try again, or select your vehicle manually.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Normal Vehicle Selection Mode */
              <>
                <h3 className="text-lg font-display font-light text-introcar-charcoal mb-2">Find Parts for Your Vehicle</h3>
                <p className="text-sm text-gray-500 mb-6">Select your make, model and year</p>
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
              </>
            )}
          </div>
        </div>
      )}

      {/* Shop by Model Mega Menu */}
      <ShopByModelMegaMenu
        isOpen={shopByModelOpen}
        onClose={() => setShopByModelOpen(false)}
        vehicles={vehicles}
      />

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

            {/* Mobile Chassis Lookup Button */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setVehicleFinderOpen(true);
                setChassisLookupMode(true);
              }}
              className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-introcar-blue text-introcar-blue font-medium hover:bg-introcar-blue hover:text-white transition-colors"
            >
              <Search className="w-4 h-4" />
              Know Your Chassis Number?
            </button>

            {/* Mobile Nav Links */}
            <nav className="space-y-1">
              <Link href="/products" className="block py-3 px-4 text-introcar-charcoal hover:text-introcar-blue hover:bg-introcar-light rounded-lg transition-colors">
                All Parts
              </Link>
              <Link href="/shop" className="block py-3 px-4 text-introcar-charcoal hover:text-introcar-blue hover:bg-introcar-light rounded-lg transition-colors">
                Shop by Model
              </Link>
              <Link href="/catalogues" className="block py-3 px-4 text-introcar-charcoal hover:text-introcar-blue hover:bg-introcar-light rounded-lg transition-colors">
                Shop by Catalogue
              </Link>
              <Link href="/products?make=Bentley" className="block py-3 px-4 text-introcar-charcoal hover:text-introcar-blue hover:bg-introcar-light rounded-lg transition-colors">
                Bentley Parts
              </Link>
              <Link href="/products?make=Rolls-Royce" className="block py-3 px-4 text-introcar-charcoal hover:text-introcar-blue hover:bg-introcar-light rounded-lg transition-colors">
                Rolls-Royce Parts
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
