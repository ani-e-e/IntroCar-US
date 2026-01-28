'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronDown, ChevronUp, Info, Search, AlertCircle, CheckCircle } from 'lucide-react';
import './embed.css';

/**
 * Embeddable Vehicle Part Finder
 *
 * URL Parameters:
 * - target: URL to redirect to with results (default: /products on same domain)
 * - theme: 'light' or 'dark' (default: light)
 * - hideTitle: 'true' to hide the title
 * - buttonText: Custom text for the search button
 */

// Wrapper component with Suspense for useSearchParams
export default function EmbedVehicleFinderPage() {
  return (
    <Suspense fallback={<div className="embed-container light"><div className="embed-finder"><p>Loading...</p></div></div>}>
      <EmbedVehicleFinder />
    </Suspense>
  );
}

function EmbedVehicleFinder() {
  const searchParams = useSearchParams();
  const targetUrl = searchParams.get('target') || '/products';
  const theme = searchParams.get('theme') || 'light';
  const hideTitle = searchParams.get('hideTitle') === 'true';
  const buttonText = searchParams.get('buttonText') || 'Find Parts';

  const [vehicles, setVehicles] = useState([]);
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [chassisRange, setChassisRange] = useState(null);
  const [chassisInput, setChassisInput] = useState('');
  const [showChassisInput, setShowChassisInput] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingChassis, setLoadingChassis] = useState(false);

  // Chassis lookup mode
  const [chassisLookupMode, setChassisLookupMode] = useState(false);
  const [chassisLookupResult, setChassisLookupResult] = useState(null);
  const [chassisLookupLoading, setChassisLookupLoading] = useState(false);
  const [chassisValidation, setChassisValidation] = useState(null);

  // Load vehicle data
  useEffect(() => {
    fetch('/data/vehicles.json')
      .then(res => res.json())
      .then(data => {
        setVehicles(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load vehicles:', err);
        setLoading(false);
      });
  }, []);

  // Fetch chassis range when year is selected
  useEffect(() => {
    if (selectedMake && selectedModel && selectedYear && !chassisLookupMode) {
      setLoadingChassis(true);
      fetch(`/api/chassis?make=${encodeURIComponent(selectedMake)}&model=${encodeURIComponent(selectedModel)}&year=${selectedYear}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          setChassisRange(data);
          setLoadingChassis(false);
        })
        .catch(err => {
          console.error('Failed to load chassis data:', err);
          setChassisRange(null);
          setLoadingChassis(false);
        });
    } else {
      setChassisRange(null);
    }
  }, [selectedMake, selectedModel, selectedYear, chassisLookupMode]);

  // Validate chassis
  const validateChassis = useCallback(async (chassis) => {
    if (!chassis || chassis.length < 2 || !selectedMake || !selectedModel) {
      setChassisValidation(null);
      return;
    }

    try {
      const res = await fetch(
        `/api/chassis-lookup?make=${encodeURIComponent(selectedMake)}&model=${encodeURIComponent(selectedModel)}&chassis=${encodeURIComponent(chassis)}`
      );
      const data = await res.json();
      setChassisValidation(data);
    } catch (err) {
      console.error('Chassis validation error:', err);
      setChassisValidation(null);
    }
  }, [selectedMake, selectedModel]);

  // Debounced chassis validation
  useEffect(() => {
    if (!chassisLookupMode && chassisInput.length >= 3) {
      const timer = setTimeout(() => {
        validateChassis(chassisInput);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setChassisValidation(null);
    }
  }, [chassisInput, chassisLookupMode, validateChassis]);

  // Direct chassis lookup
  const performChassisLookup = async () => {
    if (!chassisInput || chassisInput.length < 2) return;

    setChassisLookupLoading(true);
    setChassisLookupResult(null);

    try {
      const res = await fetch(`/api/chassis-lookup?chassis=${encodeURIComponent(chassisInput)}`);
      const data = await res.json();
      setChassisLookupResult(data);

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

  const handleChassisKeyDown = (e) => {
    if (e.key === 'Enter' && chassisLookupMode) {
      performChassisLookup();
    }
  };

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

  // Handle changes
  const handleMakeChange = (e) => {
    setSelectedMake(e.target.value);
    setSelectedModel('');
    setSelectedYear('');
    setChassisRange(null);
    setChassisInput('');
    setShowChassisInput(false);
    setChassisValidation(null);
  };

  const handleModelChange = (e) => {
    setSelectedModel(e.target.value);
    setSelectedYear('');
    setChassisRange(null);
    setChassisInput('');
    setShowChassisInput(false);
    setChassisValidation(null);
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  const toggleChassisLookupMode = () => {
    setChassisLookupMode(!chassisLookupMode);
    setChassisInput('');
    setChassisLookupResult(null);
    setChassisValidation(null);
    if (!chassisLookupMode) {
      setSelectedMake('');
      setSelectedModel('');
      setSelectedYear('');
      setShowChassisInput(false);
    }
  };

  const applyChassisMatch = (match) => {
    setSelectedMake(match.make);
    setSelectedModel(match.model);
    if (match.yearStart === match.yearEnd) {
      setSelectedYear(String(match.yearStart));
    }
    setChassisLookupMode(false);
  };

  // Handle search - open results in new tab
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedMake) params.set('make', selectedMake);
    if (selectedModel) params.set('model', selectedModel);
    if (selectedYear) params.set('year', selectedYear);
    if (chassisInput.trim()) {
      params.set('chassis', chassisInput.trim().toUpperCase());
    }

    // Build the full URL - use provided target or default to US site
    let baseUrl = targetUrl;
    if (!targetUrl.startsWith('http')) {
      baseUrl = `https://intro-car-us.vercel.app${targetUrl}`;
    }

    const finalUrl = baseUrl.includes('?')
      ? `${baseUrl}&${params.toString()}`
      : `${baseUrl}?${params.toString()}`;

    // Open in new tab
    window.open(finalUrl, '_blank', 'noopener,noreferrer');
  };

  const formatChassisDisplay = () => {
    if (!chassisRange) return null;
    const { chassisFirst, chassisLast } = chassisRange;
    if (chassisFirst === chassisLast) {
      return `Chassis: ${chassisFirst}`;
    }
    return `Chassis range: ${chassisFirst} – ${chassisLast}`;
  };

  return (
    <div className={`embed-container ${theme}`}>
      <div className="embed-finder">
        {/* Mode Toggle */}
        <div className="mode-toggle">
          <button
            onClick={toggleChassisLookupMode}
            className={`toggle-btn ${chassisLookupMode ? 'active' : ''}`}
          >
            <Search className="w-4 h-4" />
            {chassisLookupMode ? 'Back to Vehicle Selection' : 'Know Your Chassis Number?'}
          </button>
        </div>

        {/* Chassis Lookup Mode */}
        {chassisLookupMode ? (
          <div className="chassis-lookup-panel">
            <div className="chassis-input-row">
              <div className="chassis-input-wrapper">
                <label>Enter Chassis Code</label>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="e.g. ALB36 or 12345"
                    value={chassisInput}
                    onChange={(e) => setChassisInput(e.target.value.toUpperCase().trim())}
                    onKeyDown={handleChassisKeyDown}
                    className="chassis-input"
                    maxLength={10}
                  />
                  <button
                    onClick={performChassisLookup}
                    disabled={!chassisInput || chassisInput.length < 2 || chassisLookupLoading}
                    className="lookup-btn"
                  >
                    {chassisLookupLoading ? '...' : 'Lookup'}
                  </button>
                </div>
                <p className="hint">Enter the chassis code from your vehicle&apos;s VIN plate</p>
              </div>
            </div>

            {/* Lookup Results */}
            {chassisLookupResult && (
              <div className="lookup-results">
                {chassisLookupResult.found ? (
                  chassisLookupResult.multipleMatches ? (
                    <div className="multiple-matches">
                      <p className="match-header">
                        <AlertCircle className="w-4 h-4" />
                        Chassis &quot;{chassisLookupResult.chassis}&quot; found in multiple models:
                      </p>
                      <div className="match-list">
                        {chassisLookupResult.matches.map((match, idx) => (
                          <button
                            key={idx}
                            onClick={() => applyChassisMatch(match)}
                            className="match-option"
                          >
                            <span className="match-name">{match.make} {match.model}</span>
                            <span className="match-years">
                              ({match.yearStart}{match.yearStart !== match.yearEnd ? ` – ${match.yearEnd}` : ''})
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="single-match">
                      <div className="match-info">
                        <CheckCircle className="w-5 h-5 text-green" />
                        <div>
                          <p className="match-title">
                            Found: {chassisLookupResult.make} {chassisLookupResult.model}
                          </p>
                          <p className="match-year">
                            Year: {chassisLookupResult.yearStart}
                            {chassisLookupResult.yearStart !== chassisLookupResult.yearEnd && ` – ${chassisLookupResult.yearEnd}`}
                          </p>
                        </div>
                      </div>
                      <button onClick={handleSearch} className="find-parts-btn">
                        {buttonText}
                      </button>
                    </div>
                  )
                ) : (
                  <div className="no-match">
                    <AlertCircle className="w-5 h-5" />
                    <div>
                      <p className="no-match-title">{chassisLookupResult.message || 'Chassis not found'}</p>
                      <p className="no-match-hint">Please check the chassis code and try again, or select your vehicle manually.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Normal Vehicle Selection Mode */
          <div className="vehicle-selection">
            {!hideTitle && (
              <div className="selection-header">
                <h2>Find Parts for Your Vehicle</h2>
                <p>Select your make, model and year</p>
              </div>
            )}

            <div className="selection-grid">
              <select
                className="select-field"
                value={selectedMake}
                onChange={handleMakeChange}
                disabled={loading}
              >
                <option value="">Select Make</option>
                {makes.map(make => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </select>

              <select
                className="select-field"
                value={selectedModel}
                onChange={handleModelChange}
                disabled={!selectedMake || loading}
              >
                <option value="">Select Model</option>
                {models.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>

              <select
                className="select-field"
                value={selectedYear}
                onChange={handleYearChange}
                disabled={!selectedModel || loading}
              >
                <option value="">Select Year</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              <button
                className="find-parts-btn"
                onClick={handleSearch}
                disabled={!selectedMake}
              >
                {buttonText}
              </button>
            </div>

            {/* Chassis Range Display */}
            {selectedYear && (
              <div className="chassis-info">
                {loadingChassis ? (
                  <span className="loading-text">Loading chassis data...</span>
                ) : chassisRange ? (
                  <div className="chassis-display">
                    <span className="chassis-range">{formatChassisDisplay()}</span>
                    <span className="chassis-count">({chassisRange.count?.toLocaleString()} vehicles)</span>
                    <button
                      onClick={() => setShowChassisInput(!showChassisInput)}
                      className="chassis-toggle"
                    >
                      {showChassisInput ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Hide chassis input
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Know your chassis number?
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <span className="no-chassis">No chassis data available for this selection</span>
                )}
              </div>
            )}

            {/* Chassis Number Input */}
            {showChassisInput && selectedMake && selectedModel && (
              <div className="chassis-input-panel">
                <div className="chassis-hint">
                  <Info className="w-4 h-4" />
                  <span>Enter your chassis code for more precise part matching</span>
                </div>
                <div className="chassis-entry">
                  <input
                    type="text"
                    placeholder="e.g. ALB36"
                    value={chassisInput}
                    onChange={(e) => setChassisInput(e.target.value.toUpperCase().trim())}
                    className="chassis-field"
                    maxLength={10}
                  />
                  {chassisValidation && (
                    <span className="validation-result">
                      {chassisValidation.valid ? (
                        <span className="valid">
                          <CheckCircle className="w-3 h-3" />
                          Valid for {selectedModel}
                        </span>
                      ) : (
                        <span className="invalid">
                          <AlertCircle className="w-3 h-3" />
                          {chassisValidation.suggestions?.length > 0
                            ? `Try: ${chassisValidation.suggestions[0].model}`
                            : 'Not found for this model'}
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Powered by IntroCar */}
        <div className="powered-by">
          <a href="https://introcar.com" target="_blank" rel="noopener noreferrer">
            Powered by IntroCar
          </a>
        </div>
      </div>
    </div>
  );
}
