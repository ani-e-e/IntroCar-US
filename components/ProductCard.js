'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Eye, AlertTriangle } from 'lucide-react';

export default function ProductCard({ product }) {
  const {
    sku,
    description,
    stockType,
    price,
    availableNow,
    available1to3Days,
    nlaDate,
    imageUrl,
    parentSku
  } = product;

  // Determine stock status
  const getStockStatus = () => {
    if (availableNow > 0) {
      return { text: 'In Stock', class: 'badge-in-stock', available: true };
    }
    if (available1to3Days > 0) {
      return { text: '1-3 Days', class: 'badge-low-stock', available: true };
    }
    return { text: 'Out of Stock', class: 'badge-out-of-stock', available: false };
  };

  // Get stock type badge styling
  const getStockTypeBadge = () => {
    switch (stockType) {
      case 'Prestige Parts':
        return { text: 'Prestige Parts®', class: 'badge-prestige' };
      case 'Original Equipment':
        return { text: 'OE Genuine', class: 'badge-oe' };
      case 'Uprated':
        return { text: 'Uprated', class: 'badge-uprated' };
      case 'Reconditioned Exchange':
        return { text: 'Reconditioned', class: 'badge-reconditioned' };
      case 'Used':
        return { text: 'Used', class: 'badge-used' };
      default:
        return null;
    }
  };

  const stockStatus = getStockStatus();
  const stockTypeBadge = getStockTypeBadge();

  // Format price
  const formattedPrice = price
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
    : null;

  // Default placeholder image
  const displayImage = imageUrl || '/images/placeholder-part.png';

  return (
    <div className="product-card group">
      {/* Image Container */}
      <Link href={`/products/${sku}`} className="product-card-image">
        {/* Stock Type Badge */}
        {stockTypeBadge && (
          <div className="absolute top-3 left-3 z-10">
            <span className={`badge ${stockTypeBadge.class}`}>
              {stockTypeBadge.text}
            </span>
          </div>
        )}

        {/* NLA Badge */}
        {nlaDate && (
          <div className="absolute top-3 right-3 z-10">
            <span className="badge badge-nla flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              NLA
            </span>
          </div>
        )}

        {/* Product Image */}
        <div className="relative w-full h-full bg-introcar-light">
          <Image
            src={displayImage}
            alt={description || sku}
            fill
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={(e) => {
              e.target.src = '/images/placeholder-part.png';
            }}
          />
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-introcar-blue/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="btn-primary bg-white text-introcar-blue border-white text-sm flex items-center gap-2">
            <Eye className="w-4 h-4" />
            View Details
          </span>
        </div>
      </Link>

      {/* Card Body */}
      <div className="product-card-body">
        {/* SKU */}
        <span className="product-card-sku">{sku}</span>

        {/* Description */}
        <Link href={`/products/${sku}`}>
          <h3 className="product-card-title hover:text-introcar-blue transition-colors">
            {description || 'Part Description'}
          </h3>
        </Link>

        {/* Price & Stock */}
        <div className="mt-auto pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between gap-2">
            {/* Price */}
            <div>
              {formattedPrice ? (
                <span className="product-card-price">{formattedPrice}</span>
              ) : (
                <span className="text-sm text-gray-400">Price on request</span>
              )}
            </div>

            {/* Stock Status */}
            <span className={`badge text-xs ${stockStatus.class}`}>
              {stockStatus.text}
            </span>
          </div>

          {/* Add to Cart Button */}
          {stockStatus.available && formattedPrice && (
            <button
              className="mt-3 w-full py-2 border border-introcar-blue text-introcar-blue hover:bg-introcar-blue hover:text-white rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 uppercase tracking-wider"
              onClick={(e) => {
                e.preventDefault();
                // Add to cart logic here
                alert(`Added ${sku} to cart`);
              }}
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Bag
            </button>
          )}

          {/* Contact for Out of Stock */}
          {!stockStatus.available && (
            <Link
              href={`/contact?sku=${sku}`}
              className="mt-3 w-full py-2 bg-gray-100 text-gray-500 hover:text-introcar-charcoal rounded-full text-sm font-medium transition-colors flex items-center justify-center uppercase tracking-wider"
            >
              Notify When Available
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
