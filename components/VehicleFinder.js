'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Info, Search, AlertCircle, CheckCircle } from 'lucide-react';

export default function VehicleFinder() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState([]);
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [chassisRange, setChassisRange] = useState(null);
  const [chassisInput, setChassisInput] = useState('');
  const [showChassisInput, setShowChassisInput] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingChassis, setLoadingChassis] = useState(false);

  // Chassis lookup mode (direct chassis entry)
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

  // Fetch chassis range when year is selected (legacy mode)
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

  // Validate chassis against T2 when user enters it (in normal mode with make/model selected)
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

  // Direct chassis lookup (when in lookup mode)
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
        // Optionally set year if there's a single year
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

  // Handle chassis lookup on Enter key
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
    return years.reverse(); // Most recent first
  };

  const years = getYearsForModel();

  // Handle make change
  const handleMakeChange = (e) => {
    setSelectedMake(e.target.value);
    setSelectedModel('');
    setSelectedYear('');
    setChassisRange(null);
    setChassisInput('');
    setShowChassisInput(false);
    setChassisValidation(null);
  };

  // Handle model change
  const handleModelChange = (e) => {
    setSelectedModel(e.target.value);
    setSelectedYear('');
    setChassisRange(null);
    setChassisInput('');
    setShowChassisInput(false);
    setChassisValidation(null);
  };

  // Handle year change
  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  // Toggle chassis lookup mode
  const toggleChassisLookupMode = () => {
    setChassisLookupMode(!chassisLookupMode);
    setChassisInput('');
    setChassisLookupResult(null);
    setChassisValidation(null);
    if (!chassisLookupMode) {
      // Entering lookup mode - clear vehicle selection
      setSelectedMake('');
      setSelectedModel('');
      setSelectedYear('');
      setShowChassisInput(false);
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
  };

  // Handle search
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedMake) params.set('make', selectedMake);
    if (selectedModel) params.set('model', selectedModel);
    if (selectedYear) params.set('year', selectedYear);

    // If chassis number provided (and validated), include it for precise matching
    if (chassisInput.trim()) {
      params.set('chassis', chassisInput.trim().toUpperCase());
    }

    router.push(`/products?${params.toString()}`);
  };

  // Format chassis number for display
  const formatChassisDisplay = () => {
    if (!chassisRange) return null;
    const { chassisFirst, chassisLast, count } = chassisRange;
    if (chassisFirst === chassisLast) {
      return `Chassis: ${chassisFirst}`;
    }
    return `Chassis range: ${chassisFirst} – ${chassisLast}`;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Mode Toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleChassisLookupMode}
          className={`text-sm flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors ${
            chassisLookupMode
              ? 'bg-introcar-blue text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Search className="w-4 h-4" />
          {chassisLookupMode ? 'Chassis Lookup Mode' : 'Know your chassis?'}
        </button>
        {chassisLookupMode && (
          <span className="text-sm text-gray-500">
            Enter your chassis code to find your vehicle
          </span>
        )}
      </div>

      {/* Chassis Lookup Mode */}
      {chassisLookupMode ? (
        <div className="bg-introcar-light rounded-lg p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1 w-full md:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Chassis Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. ALB36 or 12345"
                  value={chassisInput}
                  onChange={(e) => setChassisInput(e.target.value.toUpperCase().trim())}
                  onKeyDown={handleChassisKeyDown}
                  className="input-field flex-1 font-mono text-lg tracking-wider"
                  maxLength={10}
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
                Enter the chassis code from your vehicle&apos;s VIN plate (alphanumeric or numeric)
              </p>
            </div>
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
                        <button
                          key={idx}
                          onClick={() => applyChassisMatch(match)}
                          className="text-left p-3 bg-white rounded border border-gray-200 hover:border-introcar-blue hover:bg-blue-50 transition-colors"
                        >
                          <span className="font-medium">{match.make} {match.model}</span>
                          <span className="text-gray-500 ml-2">
                            ({match.yearStart}{match.yearStart !== match.yearEnd ? ` – ${match.yearEnd}` : ''})
                          </span>
                        </button>
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
                      onClick={() => {
                        setChassisLookupMode(false);
                        handleSearch();
                      }}
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
                      Please check the chassis code and try again, or select your vehicle manually.
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
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="shrink-0">
              <h2 className="text-lg font-display font-light text-introcar-charcoal">Find Parts for Your Vehicle</h2>
              <p className="text-sm text-gray-500">Select your make, model and year</p>
            </div>
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
              <select
                className="input-field"
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
                className="input-field"
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
                className="input-field"
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
                className="btn-primary"
                onClick={handleSearch}
                disabled={!selectedMake}
              >
                Find Parts
              </button>
            </div>
          </div>

          {/* Chassis Range Display */}
          {selectedYear && (
            <div className="flex flex-col md:flex-row md:items-center gap-3 pl-0 md:pl-[220px]">
              {loadingChassis ? (
                <div className="text-sm text-gray-400 italic">Loading chassis data...</div>
              ) : chassisRange ? (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600 font-medium">{formatChassisDisplay()}</span>
                    <span className="text-gray-400">({chassisRange.count?.toLocaleString()} vehicles)</span>
                  </div>

                  <button
                    onClick={() => setShowChassisInput(!showChassisInput)}
                    className="text-introcar-blue text-sm flex items-center gap-1 hover:underline"
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
                </>
              ) : (
                <div className="text-sm text-gray-400">No chassis data available for this selection</div>
              )}
            </div>
          )}

          {/* Chassis Number Input (in normal mode) */}
          {showChassisInput && selectedMake && selectedModel && (
            <div className="flex flex-col md:flex-row md:items-center gap-3 pl-0 md:pl-[220px] bg-introcar-light p-4 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Info className="w-4 h-4 text-introcar-blue shrink-0" />
                <span>Enter your chassis code for more precise part matching</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. ALB36"
                  value={chassisInput}
                  onChange={(e) => setChassisInput(e.target.value.toUpperCase().trim())}
                  className="input-field w-32 text-center font-mono"
                  maxLength={10}
                />
                {chassisValidation && (
                  <span className="text-xs">
                    {chassisValidation.valid ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Valid for {selectedModel}
                      </span>
                    ) : (
                      <span className="text-amber-600 flex items-center gap-1">
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
        </>
      )}
    </div>
  );
}
