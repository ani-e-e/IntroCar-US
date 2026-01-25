'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'introcar_cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load cart from storage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error('Failed to save cart to storage:', error);
      }
    }
  }, [items, isLoading]);

  // Add item to cart
  const addItem = useCallback((product, quantity = 1) => {
    setItems((currentItems) => {
      const existingIndex = currentItems.findIndex(
        (item) => item.sku === product.sku
      );

      if (existingIndex >= 0) {
        // Update quantity of existing item
        const updatedItems = [...currentItems];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + quantity,
        };
        return updatedItems;
      }

      // Add new item
      // price = USD (for Stripe), priceGbp = GBP (for Magento)
      return [
        ...currentItems,
        {
          sku: product.sku,
          description: product.description || product.name,
          price: parseFloat(product.price) || 0, // USD price for display & Stripe
          priceGbp: parseFloat(product.priceGbp) || parseFloat(product.price) || 0, // GBP price for Magento
          stockType: product.stockType || product.stock_type,
          image: product.image || product.imageUrl,
          weight: product.weight || 0.5, // Default weight in kg
          quantity,
          addedAt: new Date().toISOString(),
        },
      ];
    });
  }, []);

  // Remove item from cart
  const removeItem = useCallback((sku) => {
    setItems((currentItems) => currentItems.filter((item) => item.sku !== sku));
  }, []);

  // Update item quantity
  const updateQuantity = useCallback((sku, quantity) => {
    if (quantity <= 0) {
      removeItem(sku);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.sku === sku ? { ...item, quantity } : item
      )
    );
  }, [removeItem]);

  // Clear entire cart
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Calculate totals
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalWeight = items.reduce(
    (sum, item) => sum + (item.weight || 0.5) * item.quantity,
    0
  );

  // Check if item is in cart
  const isInCart = useCallback(
    (sku) => items.some((item) => item.sku === sku),
    [items]
  );

  // Get item from cart
  const getItem = useCallback(
    (sku) => items.find((item) => item.sku === sku),
    [items]
  );

  const value = {
    items,
    itemCount,
    subtotal,
    totalWeight,
    isLoading,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isInCart,
    getItem,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;
