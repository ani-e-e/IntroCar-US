'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

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
    if (selectedMake && selectedModel && selectedYear) {
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
      setChassisInput('');
      setShowChassisInput(false);
    }
  }, [selectedMake, selectedModel, selectedYear]);

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
  };

  // Handle model change
  const handleModelChange = (e) => {
    setSelectedModel(e.target.value);
    setSelectedYear('');
    setChassisRange(null);
    setChassisInput('');
    setShowChassisInput(false);
  };

  // Handle year change
  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
    setChassisInput('');
  };

  // Handle search
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedMake) params.set('make', selectedMake);
    if (selectedModel) params.set('model', selectedModel);
    if (selectedYear) params.set('year', selectedYear);

    // If chassis number provided, include it for more precise matching
    if (chassisInput.trim()) {
      params.set('chassis', chassisInput.trim());
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

      {/* Chassis Number Input */}
      {showChassisInput && chassisRange && (
        <div className="flex flex-col md:flex-row md:items-center gap-3 pl-0 md:pl-[220px] bg-introcar-light p-4 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Info className="w-4 h-4 text-introcar-blue shrink-0" />
            <span>Enter the last 5 digits of your chassis number for more precise part matching</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g. 12345"
              value={chassisInput}
              onChange={(e) => setChassisInput(e.target.value.replace(/\D/g, '').slice(0, 5))}
              className="input-field w-32 text-center font-mono"
              maxLength={5}
            />
            {chassisInput && (
              <span className="text-xs text-gray-500">
                {parseInt(chassisInput) >= chassisRange.chassisNumericStart &&
                 parseInt(chassisInput) <= chassisRange.chassisNumericEnd ? (
                  <span className="text-green-600">✓ Valid for {selectedYear}</span>
                ) : (
                  <span className="text-amber-600">Outside expected range</span>
                )}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
