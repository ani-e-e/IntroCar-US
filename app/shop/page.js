import { Suspense } from 'react';
import ShopByModelContent from './ShopByModelContent';

export const metadata = {
  title: 'Shop by Model | Parts & Catalogues | IntroCar US',
  description: 'Browse Bentley & Rolls-Royce parts and technical catalogues by model. Find original equipment parts, Prestige Parts, and detailed exploded diagrams.',
};

export default function ShopByModelPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
      <ShopByModelContent />
    </Suspense>
  );
}
