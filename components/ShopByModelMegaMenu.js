'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

export default function ShopByModelMegaMenu({ isOpen, onClose, vehicles = [] }) {
  const menuRef = useRef(null);

  // Get unique models by make, sorted alphabetically
  const rollsRoyceModels = vehicles
    .filter(v => v.make === 'Rolls-Royce')
    .sort((a, b) => a.model.localeCompare(b.model));

  const bentleyModels = vehicles
    .filter(v => v.make === 'Bentley')
    .sort((a, b) => a.model.localeCompare(b.model));

  // Split into columns (roughly equal)
  const splitIntoColumns = (models, numCols = 2) => {
    const perCol = Math.ceil(models.length / numCols);
    const cols = [];
    for (let i = 0; i < numCols; i++) {
      cols.push(models.slice(i * perCol, (i + 1) * perCol));
    }
    return cols;
  };

  const rrColumns = splitIntoColumns(rollsRoyceModels, 2);
  const bentleyColumns = splitIntoColumns(bentleyModels, 2);

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
      className="absolute left-0 right-0 top-full bg-white border-b border-gray-200 shadow-lg animate-slide-down z-50"
    >
      <div className="container-wide py-6">
        {/* Arrow indicator */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full">
          <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white"></div>
        </div>

        <div className="flex gap-12">
          {/* Rolls-Royce Models */}
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
              Rolls Royce Models
            </h3>
            <div className="flex gap-8">
              {rrColumns.map((col, colIdx) => (
                <div key={colIdx} className="flex-1 space-y-2">
                  {col.map((vehicle, idx) => (
                    <Link
                      key={`${vehicle.model}-${idx}`}
                      href={`/shop?make=${encodeURIComponent(vehicle.make)}&model=${encodeURIComponent(vehicle.model)}`}
                      onClick={onClose}
                      className="block text-introcar-charcoal hover:text-introcar-blue transition-colors text-sm"
                    >
                      {vehicle.model}
                      {vehicle.yearStart !== vehicle.yearEnd && (
                        <span className="text-gray-400 ml-1">
                          ({vehicle.yearStart}–{vehicle.yearEnd})
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
            <Link
              href="/shop?make=Rolls-Royce"
              onClick={onClose}
              className="inline-block mt-6 px-6 py-2.5 bg-introcar-charcoal text-white text-sm font-medium rounded-full hover:bg-introcar-blue transition-colors"
            >
              See all Rolls Royce Models
            </Link>
          </div>

          {/* Divider */}
          <div className="w-px bg-introcar-blue/20"></div>

          {/* Bentley Models */}
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
              Bentley Models
            </h3>
            <div className="flex gap-8">
              {bentleyColumns.map((col, colIdx) => (
                <div key={colIdx} className="flex-1 space-y-2">
                  {col.map((vehicle, idx) => (
                    <Link
                      key={`${vehicle.model}-${idx}`}
                      href={`/shop?make=${encodeURIComponent(vehicle.make)}&model=${encodeURIComponent(vehicle.model)}`}
                      onClick={onClose}
                      className="block text-introcar-charcoal hover:text-introcar-blue transition-colors text-sm"
                    >
                      {vehicle.model}
                      {vehicle.yearStart !== vehicle.yearEnd && (
                        <span className="text-gray-400 ml-1">
                          ({vehicle.yearStart}–{vehicle.yearEnd})
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
            <Link
              href="/shop?make=Bentley"
              onClick={onClose}
              className="inline-block mt-6 px-6 py-2.5 bg-introcar-charcoal text-white text-sm font-medium rounded-full hover:bg-introcar-blue transition-colors"
            >
              See all Bentley Models
            </Link>
          </div>

          {/* Divider */}
          <div className="w-px bg-introcar-blue/20"></div>

          {/* Bundles & Offers */}
          <div className="w-48">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
              Bundles & Offers
            </h3>
            <div className="space-y-3">
              <Link
                href="/products?category=Bundles"
                onClick={onClose}
                className="block px-5 py-3 bg-introcar-charcoal text-white text-sm font-medium rounded-lg hover:bg-introcar-blue transition-colors text-center"
              >
                Bundles
              </Link>
              <Link
                href="/products?category=Service+Kits"
                onClick={onClose}
                className="block px-5 py-3 bg-introcar-charcoal text-white text-sm font-medium rounded-lg hover:bg-introcar-blue transition-colors text-center"
              >
                Service Kits
              </Link>
              <Link
                href="/products?promotional=true"
                onClick={onClose}
                className="block px-5 py-3 bg-introcar-charcoal text-white text-sm font-medium rounded-lg hover:bg-introcar-blue transition-colors text-center"
              >
                Promotional Parts
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
