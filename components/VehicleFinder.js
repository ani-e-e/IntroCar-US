'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VehicleFinder() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState([]);
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(true);

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
  };

  // Handle model change
  const handleModelChange = (e) => {
    setSelectedModel(e.target.value);
    setSelectedYear('');
  };

  // Handle search
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedMake) params.set('make', selectedMake);
    if (selectedModel) params.set('model', selectedModel);
    if (selectedYear) params.set('year', selectedYear);

    router.push(`/products?${params.toString()}`);
  };

  return (
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
          onChange={(e) => setSelectedYear(e.target.value)}
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
  );
}
