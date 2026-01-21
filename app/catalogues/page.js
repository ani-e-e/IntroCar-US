import { Suspense } from 'react';
import CataloguesContent from './CataloguesContent';

export const metadata = {
  title: 'Technical Catalogues',
  description: 'Browse 6,800+ technical diagrams and exploded views for Rolls-Royce & Bentley parts. Find the exact part you need by viewing it in context.',
  openGraph: {
    title: 'Technical Catalogues | IntroCar USA',
    description: 'Browse 6,800+ technical diagrams and exploded views for Rolls-Royce & Bentley parts.',
  },
};

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-introcar-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">Loading catalogues...</p>
      </div>
    </div>
  );
}

export default function CataloguesPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CataloguesContent />
    </Suspense>
  );
}
