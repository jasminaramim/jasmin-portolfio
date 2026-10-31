import React, { createContext, useContext, useState, useEffect } from 'react';
import { StoreProduct, CartItem } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: StoreProduct, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  discount: number;
  totalAmount: number;
  toastMessage: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('jasmin_store_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('jasmin_store_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to persist cart:', e);
    }
  }, [cart]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const addToCart = (product: StoreProduct, quantity = 1) => {
    const pId = product._id || product.id || product.slug;
    setCart((prev) => {
      const existing = prev.find(
        (item) => (item.product._id || item.product.id || item.product.slug) === pId
      );
      if (existing) {
        // Digital products are usually single license, but allow quantity 1 or update
        showToast(`"${product.title}" is already in your cart!`);
        return prev;
      }
      showToast(`Added "${product.title}" to cart!`);
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) =>
      prev.filter(
        (item) => (item.product._id || item.product.id || item.product.slug) !== productId
      )
    );
    showToast("Item removed from cart");
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        const id = item.product._id || item.product.id || item.product.slug;
        if (id === productId) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce((sum, item) => {
    const itemPrice = item.product.discountPrice !== undefined ? item.product.discountPrice : item.product.price;
    return sum + itemPrice * item.quantity;
  }, 0);

  const discount = 0;
  const totalAmount = subtotal - discount;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        discount,
        totalAmount,
        toastMessage,
      }}
    >
      {children}
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0f0f15]/95 backdrop-blur-md border border-[#a855f7]/40 text-white px-5 py-3 rounded-xl shadow-[0_10px_30px_rgba(168,85,247,0.3)] flex items-center gap-3 text-xs font-semibold animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#a855f7] animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
