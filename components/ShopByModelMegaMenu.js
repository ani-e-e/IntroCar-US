'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

// Curated model lists matching introcar.com structure
const rollsRoyceModels = [
  // Column 1
  [
    { label: 'Camargue', models: ['Camargue'] },
    { label: 'Corniche (1970–1982)', models: ['Corniche'] },
    { label: 'Silver Cloud', models: ['Silver Cloud'] },
    { label: 'Silver Cloud II', models: ['Silver Cloud II'] },
    { label: 'Silver Cloud III', models: ['Silver Cloud III'] },
    { label: 'Silver Dawn (1949-1955)', models: ['Silver Dawn'] },
  ],
  // Column 2
  [
    { label: 'Silver Seraph', models: ['Silver Seraph'] },
    { label: 'Silver Shadow', models: ['Silver Shadow'] },
    { label: 'Silver Shadow II', models: ['Silver Shadow II'] },
    { label: 'Silver Spirit', models: ['Silver Spirit'] },
    { label: 'Silver Spur', models: ['Silver Spur'] },
    { label: 'Silver Wraith', models: ['Silver Wraith'] },
  ],
];

const bentleyModels = [
  // Column 1
  [
    { label: 'Arnage R / Arnage RL / Arnage T', models: ['Arnage R', 'Arnage RL', 'Arnage T'] },
    { label: 'Azure', models: ['Azure'] },
    { label: 'Bentayga', models: ['Bentayga'] },
    { label: 'Brooklands Saloon', models: ['Brooklands Saloon'] },
    { label: 'Continental', models: ['Continental'] },
    { label: 'Continental GT / Continental GTC', models: ['Continental GT', 'Continental GTC'] },
  ],
  // Column 2
  [
    { label: 'Eight', models: ['Eight'] },
    { label: 'Mk VI', models: ['Mk VI'] },
    { label: 'R-Type', models: ['R-Type'] },
    { label: 'S1 / S2 / S3', models: ['S1', 'S2', 'S3'] },
    { label: 'T1 / T2', models: ['T1', 'T2'] },
    { label: 'Turbo R / Turbo RL / Turbo RT', models: ['Turbo R', 'Turbo RL', 'Turbo RT'] },
  ],
];

export default function ShopByModelMegaMenu({ isOpen, onClose }) {
  const menuRef = useRef(null);

  // Build URL for model(s)
  const buildModelUrl = (make, models) => {
    if (models.length === 1) {
      return `/shop?make=${encodeURIComponent(make)}&model=${encodeURIComponent(models[0])}`;
    }
    // Multiple models - use the first one as primary
    return `/shop?make=${encodeURIComponent(make)}&model=${encodeURIComponent(models[0])}`;
  };

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
        <div className="flex gap-8">
          {/* Rolls Royce Models */}
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
              Rolls Royce Models
            </h3>
            <div className="flex gap-8">
              {rollsRoyceModels.map((col, colIdx) => (
                <div key={colIdx} className="flex-1 space-y-2">
                  {col.map((item, idx) => (
                    <Link
                      key={idx}
                      href={buildModelUrl('Rolls-Royce', item.models)}
                      onClick={onClose}
                      className="block text-introcar-blue hover:underline text-sm"
                    >
                      {item.label}
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

          {/* Bentley Models */}
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
              Bentley Models
            </h3>
            <div className="flex gap-8">
              {bentleyModels.map((col, colIdx) => (
                <div key={colIdx} className="flex-1 space-y-2">
                  {col.map((item, idx) => (
                    <Link
                      key={idx}
                      href={buildModelUrl('Bentley', item.models)}
                      onClick={onClose}
                      className="block text-introcar-blue hover:underline text-sm"
                    >
                      {item.label}
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

          {/* Bundles & Offers */}
          <div className="w-44">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
              Bundles & Offers
            </h3>
            <div className="space-y-3">
              <Link
                href="/products?category=Bundles"
                onClick={onClose}
                className="block px-4 py-2.5 border border-gray-300 text-introcar-charcoal text-sm font-medium rounded hover:border-introcar-blue hover:text-introcar-blue transition-colors text-center"
              >
                Bundles
              </Link>
              <Link
                href="/products?category=Service+Kits"
                onClick={onClose}
                className="block px-4 py-2.5 border border-gray-300 text-introcar-charcoal text-sm font-medium rounded hover:border-introcar-blue hover:text-introcar-blue transition-colors text-center"
              >
                Service Kits
              </Link>
              <Link
                href="/products?promotional=true"
                onClick={onClose}
                className="block px-4 py-2.5 border border-gray-300 text-introcar-charcoal text-sm font-medium rounded hover:border-introcar-blue hover:text-introcar-blue transition-colors text-center"
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
