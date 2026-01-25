'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

// Fallback exchange rate if API fails
const FALLBACK_RATE = 1.27;

export function CurrencyProvider({ children, initialRate = null }) {
  const [exchangeRate, setExchangeRate] = useState(initialRate || FALLBACK_RATE);
  const [loading, setLoading] = useState(!initialRate);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    // Fetch exchange rate on mount if not provided via SSR
    if (!initialRate) {
      fetchExchangeRate();
    }
  }, [initialRate]);

  const fetchExchangeRate = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/exchange-rate');
      const data = await response.json();

      if (data.success && data.rate) {
        setExchangeRate(data.rate);
        setLastUpdated(data.timestamp);
      }
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
      // Keep using fallback rate
    } finally {
      setLoading(false);
    }
  };

  /**
   * Convert GBP (database price) to USD (display price)
   * @param {number} gbpPrice - Price in GBP from database
   * @returns {number} Price in USD
   */
  const convertToUsd = (gbpPrice) => {
    if (typeof gbpPrice !== 'number' || isNaN(gbpPrice)) {
      return 0;
    }
    return Math.round(gbpPrice * exchangeRate * 100) / 100;
  };

  /**
   * Convert USD back to GBP (for Magento orders)
   * @param {number} usdPrice - Price in USD
   * @returns {number} Price in GBP
   */
  const convertToGbp = (usdPrice) => {
    if (typeof usdPrice !== 'number' || isNaN(usdPrice) || exchangeRate === 0) {
      return 0;
    }
    return Math.round((usdPrice / exchangeRate) * 100) / 100;
  };

  /**
   * Format a price for display in USD
   * @param {number} amount - Amount in USD
   * @returns {string} Formatted price string
   */
  const formatUsd = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  /**
   * Convert GBP to USD and format for display
   * Convenience function for displaying database prices
   * @param {number} gbpPrice - Price in GBP from database
   * @returns {string} Formatted USD price string
   */
  const formatGbpAsUsd = (gbpPrice) => {
    return formatUsd(convertToUsd(gbpPrice));
  };

  const value = {
    exchangeRate,
    loading,
    lastUpdated,
    convertToUsd,
    convertToGbp,
    formatUsd,
    formatGbpAsUsd,
    refreshRate: fetchExchangeRate,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

export default CurrencyContext;
