'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function HeroSlider() {
  return (
    <section className="relative h-[500px] md:h-[600px] lg:h-[650px] overflow-hidden">
      {/* Background Image - Desktop */}
      <div className="absolute inset-0 hidden md:block">
        <Image
          src="/images/hero/Stock Image_Bentley.webp"
          alt="Rolls-Royce & Bentley Parts"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Background Image - Mobile */}
      <div className="absolute inset-0 md:hidden">
        <Image
          src="/images/hero/Stock Image_Bentley.webp"
          alt="Rolls-Royce & Bentley Parts"
          fill
          className="object-cover object-center"
          priority
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />

      {/* Content */}
      <div className="relative h-full container-wide flex items-center">
        <div className="max-w-2xl text-white">
          <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white text-sm font-medium rounded-full mb-6 border border-white/20">
            Committed to Quality
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-light mb-6 leading-tight">
            The World's Trusted Supplier of Rolls-Royce & Bentley Parts
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
            230,000+ genuine, recycled & reconditioned spares. 3-year warranty on Prestige Parts®.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/products?make=Rolls-Royce"
              className="inline-flex items-center px-8 py-4 bg-introcar-blue text-white font-medium rounded-full hover:bg-introcar-blue/90 transition-colors uppercase tracking-wider"
            >
              Shop Rolls-Royce
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              href="/products?make=Bentley"
              className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-medium rounded-full hover:bg-white/20 transition-colors uppercase tracking-wider border border-white/30"
            >
              Shop Bentley
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
