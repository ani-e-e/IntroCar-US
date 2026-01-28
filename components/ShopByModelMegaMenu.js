'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

// Curated model lists matching introcar.com structure
// Each model now has its own link (no combined entries)
const rollsRoyceModels = [
  // Column 1
  [
    { label: 'Camargue', model: 'Camargue' },
    { label: 'Corniche (1970–1982)', model: 'Corniche' },
    { label: 'Silver Cloud', model: 'Silver Cloud' },
    { label: 'Silver Cloud II', model: 'Silver Cloud II' },
    { label: 'Silver Cloud III', model: 'Silver Cloud III' },
    { label: 'Silver Dawn (1949-1955)', model: 'Silver Dawn' },
  ],
  // Column 2
  [
    { label: 'Silver Seraph', model: 'Silver Seraph' },
    { label: 'Silver Shadow', model: 'Silver Shadow' },
    { label: 'Silver Shadow II', model: 'Silver Shadow II' },
    { label: 'Silver Spirit', model: 'Silver Spirit' },
    { label: 'Silver Spur', model: 'Silver Spur' },
    { label: 'Silver Wraith', model: 'Silver Wraith' },
  ],
];

const bentleyModels = [
  // Column 1
  [
    { label: 'Arnage R', model: 'Arnage R' },
    { label: 'Arnage RL', model: 'Arnage RL' },
    { label: 'Arnage T', model: 'Arnage T' },
    { label: 'Azure', model: 'Azure' },
    { label: 'Bentayga', model: 'Bentayga' },
    { label: 'Brooklands Saloon', model: 'Brooklands Saloon' },
    { label: 'Continental', model: 'Continental' },
    { label: 'Continental GT', model: 'Continental GT' },
    { label: 'Continental GTC', model: 'Continental GTC' },
  ],
  // Column 2
  [
    { label: 'Eight', model: 'Eight' },
    { label: 'Mk VI', model: 'Mk VI' },
    { label: 'R Type', model: 'R Type' },
    { label: 'S1', model: 'S1' },
    { label: 'S2', model: 'S2' },
    { label: 'S3', model: 'S3' },
    { label: 'T1', model: 'T1' },
    { label: 'T2', model: 'T2' },
    { label: 'Turbo R', model: 'Turbo R' },
    { label: 'Turbo RL', model: 'Turbo RL' },
    { label: 'Turbo RT', model: 'Turbo RT' },
  ],
];

export default function ShopByModelMegaMenu({ isOpen, onClose }) {
  const menuRef = useRef(null);

  // Build URL for a single model
  const buildModelUrl = (make, model) => {
    return `/shop?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`;
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
                      href={buildModelUrl('Rolls-Royce', item.model)}
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
                      href={buildModelUrl('Bentley', item.model)}
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
