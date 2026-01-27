'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronRight, X } from 'lucide-react';

// Placeholder component for model cards when no image exists
const ModelPlaceholder = ({ make, model }) => {
  const isBentley = make === 'Bentley';
  return (
    <div className={`w-full h-full flex items-center justify-center ${
      isBentley ? 'bg-gradient-to-br from-[#333] to-[#1a1a1a]' : 'bg-gradient-to-br from-[#1a1a2e] to-[#0d0d1a]'
    }`}>
      <div className="text-center p-2">
        <div className={`text-2xl font-display font-bold ${
          isBentley ? 'text-[#b8860b]' : 'text-[#c0c0c0]'
        }`}>
          {isBentley ? 'B' : 'RR'}
        </div>
        <div className="text-[10px] text-white/60 mt-1 uppercase tracking-wider">
          {make}
        </div>
      </div>
    </div>
  );
};

// Group models by era for better organization
const getEra = (yearStart) => {
  if (yearStart >= 2010) return 'Modern (2010+)';
  if (yearStart >= 1990) return 'Contemporary (1990-2009)';
  if (yearStart >= 1970) return 'Classic (1970-1989)';
  return 'Heritage (Pre-1970)';
};

export default function ShopByModelMegaMenu({ isOpen, onClose, vehicles = [] }) {
  const [activeMake, setActiveMake] = useState('Bentley');
  const [activeEra, setActiveEra] = useState(null);
  const menuRef = useRef(null);

  // Group vehicles by make
  const bentleyModels = vehicles
    .filter(v => v.make === 'Bentley')
    .sort((a, b) => b.yearStart - a.yearStart); // Newest first

  const rollsRoyceModels = vehicles
    .filter(v => v.make === 'Rolls-Royce')
    .sort((a, b) => b.yearStart - a.yearStart);

  // Group by era
  const groupByEra = (models) => {
    const groups = {};
    models.forEach(model => {
      const era = getEra(model.yearStart);
      if (!groups[era]) groups[era] = [];
      groups[era].push(model);
    });
    return groups;
  };

  const bentleyByEra = groupByEra(bentleyModels);
  const rollsRoyceByEra = groupByEra(rollsRoyceModels);

  const currentModels = activeMake === 'Bentley' ? bentleyByEra : rollsRoyceByEra;
  const eras = Object.keys(currentModels);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute left-0 right-0 top-full bg-white border-b border-gray-200 shadow-2xl animate-slide-down z-50"
      style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}
    >
      <div className="container-wide py-6">
        {/* Header with Make Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1">
            {/* Bentley Tab */}
            <button
              onClick={() => {
                setActiveMake('Bentley');
                setActiveEra(null);
              }}
              className={`flex items-center gap-3 px-6 py-3 rounded-t-lg font-medium transition-all ${
                activeMake === 'Bentley'
                  ? 'bg-[#333] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                activeMake === 'Bentley' ? 'bg-[#b8860b] text-white' : 'bg-[#333] text-[#b8860b]'
              }`}>B</span>
              <span>Bentley</span>
              <span className="text-xs opacity-70">({bentleyModels.length})</span>
            </button>

            {/* Rolls-Royce Tab */}
            <button
              onClick={() => {
                setActiveMake('Rolls-Royce');
                setActiveEra(null);
              }}
              className={`flex items-center gap-3 px-6 py-3 rounded-t-lg font-medium transition-all ${
                activeMake === 'Rolls-Royce'
                  ? 'bg-[#1a1a2e] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                activeMake === 'Rolls-Royce' ? 'bg-[#c0c0c0] text-[#1a1a2e]' : 'bg-[#1a1a2e] text-[#c0c0c0]'
              }`}>RR</span>
              <span>Rolls-Royce</span>
              <span className="text-xs opacity-70">({rollsRoyceModels.length})</span>
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Era Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveEra(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeEra === null
                ? 'bg-introcar-blue text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Models
          </button>
          {eras.map(era => (
            <button
              key={era}
              onClick={() => setActiveEra(era)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeEra === era
                  ? 'bg-introcar-blue text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {era}
              <span className="ml-1 opacity-70">({currentModels[era]?.length || 0})</span>
            </button>
          ))}
        </div>

        {/* Models Grid */}
        <div className="space-y-8">
          {(activeEra ? [activeEra] : eras).map(era => (
            <div key={era}>
              {/* Era Header */}
              {!activeEra && (
                <h3 className="text-lg font-display font-light text-introcar-charcoal mb-4 pb-2 border-b border-gray-200">
                  {era}
                </h3>
              )}

              {/* Model Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {currentModels[era]?.map((vehicle, idx) => (
                  <Link
                    key={`${vehicle.model}-${idx}`}
                    href={`/shop?make=${encodeURIComponent(vehicle.make)}&model=${encodeURIComponent(vehicle.model)}`}
                    onClick={onClose}
                    className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-introcar-blue hover:shadow-lg transition-all"
                  >
                    {/* Model Placeholder with Styling */}
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <ModelPlaceholder make={vehicle.make} model={vehicle.model} />
                      {/* Year Badge */}
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {vehicle.yearStart === vehicle.yearEnd
                          ? vehicle.yearStart
                          : `${vehicle.yearStart}-${vehicle.yearEnd}`}
                      </div>
                    </div>

                    {/* Model Name */}
                    <div className="p-3">
                      <h4 className="font-medium text-sm text-introcar-charcoal group-hover:text-introcar-blue transition-colors line-clamp-2">
                        {vehicle.model}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Links */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-4">
            <Link
              href={`/products?make=${activeMake}`}
              onClick={onClose}
              className="text-introcar-blue hover:underline font-medium flex items-center gap-1"
            >
              View All {activeMake} Parts
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="/catalogues"
              onClick={onClose}
              className="text-introcar-blue hover:underline font-medium flex items-center gap-1"
            >
              Shop by Catalogue
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <Link
            href="/shop"
            onClick={onClose}
            className="btn-secondary text-sm"
          >
            Browse All Models
          </Link>
        </div>
      </div>
    </div>
  );
}
