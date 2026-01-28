'use client';
import { useState } from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import ProductCard from '../../../components/ProductCard';

// Sample product data - in production would come from API
const productsData = {
  'UB84868': {
    sku: 'UB84868',
    name: 'Front Brake Disc - Bentley Continental GT',
    price: 845,
    originalPrice: 1199,
    brand: 'Bentley',
    condition: 'Genuine New',
    inStock: true,
    stockQty: 4,
    isPrestige: true,
    category: 'Brakes & Suspension',
    description: 'Genuine Bentley front brake disc for Continental GT models. This precision-engineered component meets all OEM specifications and provides exceptional stopping power. Suitable for 2003-2018 model years.',
    specifications: {
      'Part Number': 'UB84868',
      'OEM Reference': '3W0615301S',
      'Diameter': '405mm',
      'Thickness': '36mm',
      'Mounting': 'Front Axle',
      'Material': 'Cast Iron',
      'Ventilated': 'Yes',
      'Weight': '15.2 kg',
    },
    compatibility: [
      'Bentley Continental GT (2003-2018)',
      'Bentley Continental GTC (2006-2018)',
      'Bentley Continental Flying Spur (2005-2013)',
    ],
    warranty: '3 Year Warranty (Prestige Parts®)',
    images: [
      'https://introcar.co.uk/image/UB84868.jpg',
    ],
  },
  'UR27692': {
    sku: 'UR27692',
    name: 'Radiator Grille - Rolls-Royce Phantom',
    price: 2450,
    brand: 'Rolls-Royce',
    condition: 'Reconditioned',
    inStock: true,
    stockQty: 2,
    isPrestige: true,
    category: 'Body & Exterior',
    description: 'Professionally reconditioned radiator grille for Rolls-Royce Phantom. Restored to original factory specifications with authentic chrome finish. Each piece undergoes rigorous quality inspection.',
    specifications: {
      'Part Number': 'UR27692',
      'OEM Reference': '51117033748',
      'Finish': 'Chrome',
      'Material': 'Stainless Steel',
      'Condition': 'Reconditioned',
    },
    compatibility: [
      'Rolls-Royce Phantom VII (2003-2017)',
      'Rolls-Royce Phantom Drophead (2007-2016)',
      'Rolls-Royce Phantom Coupe (2008-2016)',
    ],
    warranty: '3 Year Warranty (Prestige Parts®)',
    images: [],
  },
};

const relatedProducts = [
  { sku: 'UB55443', name: 'Rear Brake Caliper - Bentley Flying Spur', price: 1650, originalPrice: 2100, brand: 'Bentley', condition: 'Reconditioned', inStock: true, isPrestige: true },
  { sku: 'UB91234', name: 'Air Filter Element - Bentley Mulsanne', price: 189, brand: 'Bentley', condition: 'Genuine New', inStock: true, isPrestige: false },
  { sku: 'PM10282', name: 'Engine Mount - Rolls-Royce Silver Shadow', price: 395, brand: 'Rolls-Royce', condition: 'Genuine New', inStock: true, isPrestige: true },
];

export default function ProductDetailClient({ sku }) {
  const product = productsData[sku] || productsData['UB84868'];

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow bg-introcar-slate">
        {/* Breadcrumb */}
        <div className="bg-introcar-dark border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-sm flex-wrap">
              <Link href="/" className="text-gray-400 hover:text-introcar-blue">Home</Link>
              <span className="text-gray-600">/</span>
              <Link href="/products" className="text-gray-400 hover:text-introcar-blue">Parts Catalogue</Link>
              <span className="text-gray-600">/</span>
              <span className="text-white">{product.sku}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Product main section */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Images */}
            <div>
              <div className="bg-introcar-dark rounded-xl border border-gray-800 overflow-hidden">
                <div className="aspect-square flex items-center justify-center bg-gray-900">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-32 h-32 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-4">
                {product.isPrestige && (
                  <span className="bg-introcar-blue text-white text-sm font-bold px-3 py-1 rounded">
                    PRESTIGE PARTS®
                  </span>
                )}
                <span className={`text-sm font-medium px-3 py-1 rounded ${
                  product.brand === 'Bentley' ? 'bg-bentley-green text-white' :
                  'bg-rolls-purple text-white'
                }`}>
                  {product.brand}
                </span>
                <span className="bg-gray-700 text-white text-sm px-3 py-1 rounded">
                  {product.condition}
                </span>
              </div>
            </div>

            {/* Product info */}
            <div>
              <p className="text-gray-500 font-mono mb-2">{product.sku}</p>
              <h1 className="text-3xl font-display font-bold text-white mb-4">{product.name}</h1>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-bold text-introcar-charcoal">${product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-gray-500 line-through">${product.originalPrice.toLocaleString()}</span>
                    <span className="bg-red-600 text-white text-sm font-bold px-2 py-1 rounded">
                      Save {discount}%
                    </span>
                  </>
                )}
              </div>

              {/* Stock status */}
              <div className="flex items-center gap-2 mb-6">
                {product.inStock ? (
                  <>
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <span className="text-green-400">In Stock</span>
                    <span className="text-gray-500">({product.stockQty} available)</span>
                  </>
                ) : (
                  <>
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    <span className="text-red-400">Out of Stock</span>
                  </>
                )}
              </div>

              {/* Warranty */}
              {product.warranty && (
                <div className="bg-introcar-blue/10 border border-introcar-blue/30 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-introcar-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-introcar-blue font-medium">{product.warranty}</span>
                  </div>
                </div>
              )}

              {/* Quantity & Add to cart */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex items-center border border-gray-700 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 text-gray-400 hover:text-white transition-colors"
                  >
                    −
                  </button>
                  <span className="px-6 py-3 text-white font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQty || 10, quantity + 1))}
                    className="px-4 py-3 text-gray-400 hover:text-white transition-colors"
                  >
                    +
                  </button>
                </div>

                <button
                  disabled={!product.inStock}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                    product.inStock
                      ? 'bg-introcar-blue text-white hover:bg-introcar-blue/90'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>

                <button className="p-3 border border-gray-700 rounded-lg text-gray-400 hover:text-introcar-blue hover:border-introcar-blue transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              {/* Quick info */}
              <div className="grid grid-cols-2 gap-4 py-6 border-t border-gray-800">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-introcar-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  <div>
                    <p className="text-white text-sm font-medium">Insured Shipping</p>
                    <p className="text-gray-500 text-xs">Worldwide via DHL</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-introcar-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <div>
                    <p className="text-white text-sm font-medium">30-Day Returns</p>
                    <p className="text-gray-500 text-xs">Hassle-free</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-introcar-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-white text-sm font-medium">Fast Dispatch</p>
                    <p className="text-gray-500 text-xs">Same-day shipping</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-introcar-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <div>
                    <p className="text-white text-sm font-medium">Expert Support</p>
                    <p className="text-gray-500 text-xs">Call us anytime</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs section */}
          <div className="bg-introcar-dark rounded-xl border border-gray-800 overflow-hidden mb-16">
            <div className="flex border-b border-gray-800">
              {['description', 'specifications', 'compatibility'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? 'text-introcar-blue border-b-2 border-introcar-blue'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === 'description' && (
                <div>
                  <p className="text-gray-300 leading-relaxed">{product.description}</p>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {Object.entries(product.specifications || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-3 border-b border-gray-800">
                      <span className="text-gray-400">{key}</span>
                      <span className="text-white font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'compatibility' && (
                <div>
                  <h3 className="text-white font-semibold mb-4">Compatible Vehicles</h3>
                  <ul className="space-y-2">
                    {(product.compatibility || []).map((vehicle, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-300">
                        <svg className="w-4 h-4 text-introcar-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {vehicle}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Related products */}
          <div>
            <h2 className="text-2xl font-display font-bold text-white mb-6">Related Parts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.sku} product={product} />
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
