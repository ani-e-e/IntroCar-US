'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Eye, AlertTriangle, Info } from 'lucide-react';

export default function ProductCard({ product, viewMode = 'grid' }) {
  const {
    sku,
    description,
    stockType,
    price,
    availableNow,
    available1to3Days,
    nlaDate,
    imageUrl,
    parentSku,
    additionalInfo,
    numberRequired,
    supersessions
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
      case 'Prestige Parts (OE)':
        return { text: 'Prestige Parts® OE', class: 'badge-prestige' };
      case 'Original Equipment':
        return { text: 'OE Genuine', class: 'badge-oe' };
      case 'Uprated':
        return { text: 'Uprated', class: 'badge-uprated' };
      case 'Reconditioned Exchange':
        return { text: 'Reconditioned', class: 'badge-reconditioned' };
      case 'Used':
        return { text: 'Used', class: 'badge-used' };
      case 'Aftermarket':
      case 'Aftermarket Product':
        return { text: 'Aftermarket', class: 'badge-aftermarket' };
      default:
        return stockType ? { text: stockType, class: 'badge-default' } : null;
    }
  };

  const stockStatus = getStockStatus();
  const stockTypeBadge = getStockTypeBadge();

  // Format price
  const formattedPrice = price
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
    : null;

  // Default placeholder image
  const displayImage = imageUrl || '/images/placeholder-part.svg';

  // List View
  if (viewMode === 'list') {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4 hover:shadow-md transition-shadow group">
        {/* Image */}
        <Link href={`/products/${sku}`} className="relative w-32 h-32 shrink-0 bg-introcar-light rounded-lg overflow-hidden">
          <Image
            src={displayImage}
            alt={description || sku}
            fill
            className="object-contain p-2"
            sizes="128px"
          />
          {nlaDate && (
            <div className="absolute top-1 right-1">
              <span className="badge badge-nla text-xs flex items-center gap-0.5 px-1.5 py-0.5">
                <AlertTriangle className="w-3 h-3" />
                NLA
              </span>
            </div>
          )}
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-500 font-mono">{sku}</span>
                {stockTypeBadge && (
                  <span className={`badge text-xs ${stockTypeBadge.class}`}>
                    {stockTypeBadge.text}
                  </span>
                )}
              </div>
              <Link href={`/products/${sku}`}>
                <h3 className="text-introcar-charcoal font-medium mt-1 hover:text-introcar-blue transition-colors">
                  {description || 'Part Description'}
                </h3>
              </Link>

              {/* Additional details */}
              <div className="mt-2 space-y-1">
                {additionalInfo && (
                  <p className="text-sm text-gray-500 flex items-start gap-1">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    {additionalInfo}
                  </p>
                )}
                {numberRequired && numberRequired > 1 && (
                  <p className="text-sm text-amber-600">Qty Required: {numberRequired}</p>
                )}
                {supersessions && supersessions.length > 0 && (
                  <p className="text-sm text-blue-600">
                    Also known as: {supersessions.slice(0, 3).join(', ')}{supersessions.length > 3 ? '...' : ''}
                  </p>
                )}
                {nlaDate && (
                  <p className="text-sm text-red-500">No Longer Available from {nlaDate}</p>
                )}
              </div>
            </div>

            {/* Price & Actions */}
            <div className="text-right shrink-0">
              {formattedPrice ? (
                <span className="text-xl font-semibold text-introcar-charcoal">{formattedPrice}</span>
              ) : (
                <span className="text-sm text-gray-400">Price on request</span>
              )}
              <div className="mt-1">
                <span className={`badge text-xs ${stockStatus.class}`}>
                  {stockStatus.text}
                </span>
              </div>
              {stockStatus.available && formattedPrice && (
                <button
                  className="mt-3 px-4 py-2 border border-introcar-blue text-introcar-blue hover:bg-introcar-blue hover:text-white rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 uppercase tracking-wider"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(`Added ${sku} to cart`);
                  }}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View (default)
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
              e.target.src = '/images/placeholder-part.svg';
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

        {/* Additional Info */}
        {additionalInfo && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{additionalInfo}</p>
        )}

        {/* Number Required */}
        {numberRequired && numberRequired > 1 && (
          <p className="text-xs text-amber-600 mt-1">Qty Required: {numberRequired}</p>
        )}

        {/* Supersession Note */}
        {supersessions && supersessions.length > 0 && (
          <p className="text-xs text-blue-600 mt-1">
            Also known as: {supersessions.slice(0, 2).join(', ')}{supersessions.length > 2 ? '...' : ''}
          </p>
        )}

        {/* NLA Date */}
        {nlaDate && (
          <p className="text-xs text-red-500 mt-1">NLA from {nlaDate}</p>
        )}

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
