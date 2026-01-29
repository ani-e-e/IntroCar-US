'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Package } from 'lucide-react';
import { useTenant } from '@/context/TenantContext';

/**
 * ResellerCatalogueCard component for displaying catalogues in reseller product grids
 * Adapted from CatalogueCard to use tenant colors and link to reseller catalogue pages
 */
export default function ResellerCatalogueCard({ catalogue, tenantSlug, viewMode = 'grid' }) {
  const { colors } = useTenant();
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
  } = catalogue;

  const primaryColor = colors?.primary || '#1e3a5f';

  // Use Cloudinary 'image' field first, fall back to legacy 'imageUrl'
  const imageSource = image || imageUrl;

  // If no image or image failed to load, don't render anything
  if (!imageSource || imageError) {
    return null;
  }

  // Format models for display (limit to 2)
  const displayModels = models?.slice(0, 2).join(', ') || '';
  const hasMoreModels = models?.length > 2;

  const catalogueUrl = `/reseller/${tenantSlug}/catalogues/${encodeURIComponent(id)}`;

  // List View
  if (viewMode === 'list') {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4 hover:shadow-md transition-shadow group">
        {/* Image */}
        <Link href={catalogueUrl} className="relative w-32 h-32 shrink-0 bg-gray-100 rounded-lg overflow-hidden">
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
              <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: primaryColor, borderTopColor: 'transparent' }} />
            </div>
          )}
          {/* Catalogue indicator badge */}
          <div className="absolute top-1 left-1">
            <span className="bg-gray-900/90 text-white text-xs flex items-center gap-0.5 px-1.5 py-0.5 rounded-full font-medium">
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
              <Link href={catalogueUrl}>
                <h3 className="text-gray-900 font-medium mt-1 transition-colors line-clamp-2" style={{ ':hover': { color: primaryColor } }}>
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
                  <p className="text-sm flex items-center gap-1" style={{ color: primaryColor }}>
                    <Package className="w-4 h-4" />
                    {hotspotCount} parts in this catalogue
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="text-right shrink-0">
              <Link
                href={catalogueUrl}
                className="inline-flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-medium transition-colors uppercase tracking-wider"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                View Catalogue
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View (default)
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group">
      {/* Image Container */}
      <Link href={catalogueUrl} className="block relative aspect-square bg-gray-100">
        {/* Catalogue Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-gray-900/90 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            Catalogue
          </span>
        </div>

        {/* Parts Count Badge */}
        {hotspotCount > 0 && (
          <div className="absolute top-3 right-3 z-10">
            <span className="text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1" style={{ backgroundColor: primaryColor }}>
              <Package className="w-3 h-3" />
              {hotspotCount}
            </span>
          </div>
        )}

        {/* Catalogue Image */}
        <Image
          src={imageSource}
          alt={title}
          fill
          className={`object-contain p-1 transition-transform duration-300 group-hover:scale-105 ${!imageLoaded ? 'opacity-0' : 'opacity-100'}`}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          unoptimized
          onError={() => setImageError(true)}
          onLoad={() => setImageLoaded(true)}
        />
        {/* Loading spinner */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: primaryColor, borderTopColor: 'transparent' }} />
          </div>
        )}

        {/* Hover Overlay - Show model info */}
        <div className="absolute inset-0 bg-gray-900/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-3">
          {models && models.length > 0 ? (
            <div className="text-center text-white text-xs space-y-1 max-h-full overflow-hidden">
              <p className="font-medium text-white/70 uppercase tracking-wider mb-2">Models:</p>
              {models.slice(0, 4).map((model, i) => (
                <p key={i} className="truncate">{model}</p>
              ))}
              {models.length > 4 && (
                <p className="text-white/60">+{models.length - 4} more...</p>
              )}
            </div>
          ) : (
            <span className="bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              View Catalogue
            </span>
          )}
        </div>
      </Link>

      {/* Card Body */}
      <div className="p-4">
        {/* Category */}
        {category && (
          <span className="text-xs text-gray-500 uppercase tracking-wider">{category}</span>
        )}

        {/* Title */}
        <Link href={catalogueUrl}>
          <h3 className="text-gray-900 font-medium mt-1 hover:opacity-80 transition-colors line-clamp-2">
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
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between gap-2">
            {/* Parts count instead of price */}
            <div className="flex items-center gap-1" style={{ color: primaryColor }}>
              <Package className="w-4 h-4" />
              <span className="font-medium">{hotspotCount} parts</span>
            </div>
          </div>

          {/* View Catalogue Button */}
          <Link
            href={catalogueUrl}
            className="mt-3 w-full py-2 border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <BookOpen className="w-4 h-4" />
            View Catalogue
          </Link>
        </div>
      </div>
    </div>
  );
}
