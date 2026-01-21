import { Suspense } from 'react';
import ProductsContent from './ProductsContent';

export const metadata = {
  title: 'Parts Catalogue',
  description: 'Browse our complete range of Rolls-Royce & Bentley parts. Filter by make, model, year, and category. Over 79,000 parts available with fast shipping to USA.',
  openGraph: {
    title: 'Parts Catalogue | IntroCar USA',
    description: 'Browse our complete range of Rolls-Royce & Bentley parts. Over 79,000 parts available.',
  },
};

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-introcar-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">Loading products...</p>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ProductsContent />
    </Suspense>
  );
}
