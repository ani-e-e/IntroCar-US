'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Package, ExternalLink } from 'lucide-react';

/**
 * CatalogueCard component for displaying catalogues in product grids
 * Different from ProductCard: no price, no add to cart, shows part count and PDF link
 */
export default function CatalogueCard({ catalogue, viewMode = 'grid' }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const {
    id,
    title,
    image,
    imageUrl,
    hotspotCount,
    category,
    subcategory,
    makes,
    models,
    catalogueLink
  } = catalogue;

  // Use Cloudinary 'image' field first, fall back to legacy 'imageUrl'
  const imageSource = image || imageUrl;

  // If no image or image failed to load, don't render anything
  if (!imageSource || imageError) {
    return null;
  }

  // Format models for display (limit to 2)
  const displayModels = models?.slice(0, 2).join(', ') || '';
  const hasMoreModels = models?.length > 2;

  // List View
  if (viewMode === 'list') {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4 hover:shadow-md transition-shadow group">
        {/* Image */}
        <Link href={`/catalogues/${encodeURIComponent(id)}`} className="relative w-32 h-32 shrink-0 bg-introcar-light rounded-lg overflow-hidden">
          <Image
            src={imageSource}
            alt={title}
            fill
            className={`object-contain p-2 ${!imageLoaded ? 'opacity-0' : 'opacity-100'}`}
            sizes="128px"
            unoptimized
            onError={() => setImageError(true)}
            onLoad={() => setImageLoaded(true)}
          />
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-introcar-blue border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {/* Catalogue indicator badge */}
          <div className="absolute top-1 left-1">
            <span className="bg-amber-100 text-amber-800 text-xs flex items-center gap-0.5 px-1.5 py-0.5 rounded-full font-medium">
              <BookOpen className="w-3 h-3" />
              Catalogue
            </span>
          </div>
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {category && (
                  <span className="text-sm text-gray-500">{category}</span>
                )}
              </div>
              <Link href={`/catalogues/${encodeURIComponent(id)}`}>
                <h3 className="text-introcar-charcoal font-medium mt-1 hover:text-introcar-blue transition-colors line-clamp-2">
                  {title}
                </h3>
              </Link>

              {/* Additional details */}
              <div className="mt-2 space-y-1">
                {displayModels && (
                  <p className="text-sm text-gray-500">
                    {displayModels}{hasMoreModels ? ` +${models.length - 2} more` : ''}
                  </p>
                )}
                {hotspotCount > 0 && (
                  <p className="text-sm text-introcar-blue flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    {hotspotCount} parts in this catalogue
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="text-right shrink-0 space-y-2">
              <Link
                href={`/catalogues/${encodeURIComponent(id)}`}
                className="inline-flex items-center gap-2 px-4 py-2 border border-introcar-blue text-introcar-blue rounded-full text-sm font-medium hover:bg-introcar-blue hover:text-white transition-colors uppercase tracking-wider"
              >
                View Catalogue
              </Link>
              {catalogueLink && (
                <a
                  href={catalogueLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-introcar-blue transition-colors justify-end"
                >
                  <ExternalLink className="w-3 h-3" />
                  View on IntroCAR UK
                </a>
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
      <Link href={`/catalogues/${encodeURIComponent(id)}`} className="product-card-image">
        {/* Catalogue Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            Catalogue
          </span>
        </div>

        {/* Parts Count Badge */}
        {hotspotCount > 0 && (
          <div className="absolute top-3 right-3 z-10">
            <span className="bg-introcar-blue text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Package className="w-3 h-3" />
              {hotspotCount}
            </span>
          </div>
        )}

        {/* Catalogue Image */}
        <div className="relative w-full h-full bg-introcar-light">
          <Image
            src={imageSource}
            alt={title}
            fill
            className={`object-contain p-4 transition-transform duration-300 group-hover:scale-105 ${!imageLoaded ? 'opacity-0' : 'opacity-100'}`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized
            onError={() => setImageError(true)}
            onLoad={() => setImageLoaded(true)}
          />
          {/* Loading spinner */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-introcar-blue border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-amber-600/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="bg-white text-amber-700 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            View Catalogue
          </span>
        </div>
      </Link>

      {/* Card Body */}
      <div className="product-card-body">
        {/* Category */}
        {category && (
          <span className="text-xs text-gray-500 uppercase tracking-wider">{category}</span>
        )}

        {/* Title */}
        <Link href={`/catalogues/${encodeURIComponent(id)}`}>
          <h3 className="product-card-title hover:text-introcar-blue transition-colors line-clamp-2">
            {title}
          </h3>
        </Link>

        {/* Models */}
        {displayModels && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
            {displayModels}{hasMoreModels ? ` +${models.length - 2} more` : ''}
          </p>
        )}

        {/* Parts Count & Action */}
        <div className="mt-auto pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between gap-2">
            {/* Parts count instead of price */}
            <div className="flex items-center gap-1 text-introcar-blue">
              <Package className="w-4 h-4" />
              <span className="font-medium">{hotspotCount} parts</span>
            </div>
          </div>

          {/* View Catalogue Button */}
          <Link
            href={`/catalogues/${encodeURIComponent(id)}`}
            className="mt-3 w-full py-2 border border-amber-600 text-amber-700 hover:bg-amber-600 hover:text-white rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <BookOpen className="w-4 h-4" />
            View Catalogue
          </Link>
        </div>
      </div>
    </div>
  );
}
