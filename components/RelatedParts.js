'use client';

import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

export default function RelatedParts({ sku }) {
  const [relatedParts, setRelatedParts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelated() {
      try {
        const res = await fetch(`/api/related-parts?sku=${sku}&limit=4`);
        if (res.ok) {
          const data = await res.json();
          setRelatedParts(data.relatedParts || []);
        }
      } catch (error) {
        console.error('Error fetching related parts:', error);
      } finally {
        setLoading(false);
      }
    }

    if (sku) {
      fetchRelated();
    }
  }, [sku]);

  if (loading) {
    return (
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-white mb-6">You May Also Like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-800 rounded-xl animate-pulse">
              <div className="aspect-square bg-slate-700 rounded-t-xl" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-slate-700 rounded w-1/2" />
                <div className="h-4 bg-slate-700 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (relatedParts.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold text-white mb-6">You May Also Like</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {relatedParts.map((product) => (
          <ProductCard key={product.sku} product={product} />
        ))}
      </div>
    </div>
  );
}
