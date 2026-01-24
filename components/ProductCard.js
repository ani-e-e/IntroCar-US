'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Eye, CheckCircle, Info, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';

// Format NLA date to "Sep 2014" format (from "1st September 2014" or "16th August 2017")
const formatNLADate = (dateStr) => {
  if (!dateStr) return null;
  try {
    const monthsLong = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Try to parse format like "1st September 2014" or "16th August 2017"
    const lowerStr = dateStr.toLowerCase();
    for (let i = 0; i < monthsLong.length; i++) {
      if (lowerStr.includes(monthsLong[i])) {
        // Extract the year (4 digit number)
        const yearMatch = dateStr.match(/\d{4}/);
        if (yearMatch) {
          return `${monthsShort[i]} ${yearMatch[0]}`;
        }
      }
    }

    // Fallback: try parsing as standard date
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }

    return dateStr; // Return as-is if can't parse
  } catch {
    return dateStr;
  }
};

export default function ProductCard({ product, viewMode = 'grid' }) {
  const { addItem } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);

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

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      sku,
      description,
      price,
      stockType,
      image: imageUrl,
      weight: product.weight || 0.5,
    }, 1);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // Determine stock status - only in stock if availableNow or available1to3Days > 0
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

  // Default placeholder image - use IC logo icon
  const displayImage = imageUrl || '/images/logos/introcar-icon.png';

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
              <span className="bg-introcar-blue/10 text-introcar-blue text-xs flex items-center gap-0.5 px-1.5 py-0.5 rounded-full font-medium">
                <CheckCircle className="w-3 h-3" />
                OE NLA
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
                    Related Parts: {supersessions.slice(0, 3).join(', ')}{supersessions.length > 3 ? '...' : ''}
                  </p>
                )}
                {nlaDate && (
                  <p className="text-sm text-introcar-blue">OE Discontinued: {formatNLADate(nlaDate)}</p>
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
                  className={`mt-3 px-4 py-2 border rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 uppercase tracking-wider ${
                    addedToCart
                      ? 'border-green-600 bg-green-600 text-white'
                      : 'border-introcar-blue text-introcar-blue hover:bg-introcar-blue hover:text-white'
                  }`}
                  onClick={handleAddToCart}
                >
                  {addedToCart ? (
                    <>
                      <Check className="w-4 h-4" />
                      Added
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      Add
                    </>
                  )}
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

        {/* NLA Badge - OE Discontinued indicator */}
        {nlaDate && (
          <div className="absolute top-3 right-3 z-10">
            <span className="bg-introcar-blue/10 text-introcar-blue px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              OE NLA
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
              e.target.src = '/images/logos/introcar-icon.png';
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
            Related Parts: {supersessions.slice(0, 2).join(', ')}{supersessions.length > 2 ? '...' : ''}
          </p>
        )}

        {/* NLA Date - OE Discontinued indicator */}
        {nlaDate && (
          <p className="text-xs text-introcar-blue mt-1">OE Discontinued: {formatNLADate(nlaDate)}</p>
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
              className={`mt-3 w-full py-2 border rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 uppercase tracking-wider ${
                addedToCart
                  ? 'border-green-600 bg-green-600 text-white'
                  : 'border-introcar-blue text-introcar-blue hover:bg-introcar-blue hover:text-white'
              }`}
              onClick={handleAddToCart}
            >
              {addedToCart ? (
                <>
                  <Check className="w-4 h-4" />
                  Added!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  Add to Bag
                </>
              )}
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
