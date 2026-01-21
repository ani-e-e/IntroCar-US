import { Suspense } from 'react';
import CatalogueDetailContent from './CatalogueDetailContent';

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-introcar-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">Loading catalogue...</p>
      </div>
    </div>
  );
}

export default function CatalogueDetailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CatalogueDetailContent />
    </Suspense>
  );
}
