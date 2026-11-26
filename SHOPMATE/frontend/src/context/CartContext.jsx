import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const CartContext = createContext(null);
const storageKey = 'shopmate_cart_v1';
const readCart = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
    return Array.isArray(stored) ? stored.filter(item => item?._id && Number.isInteger(item.quantity) && item.quantity > 0) : [];
  } catch { return []; }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);
  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(items)); }, [items]);

  const addItem = useCallback((product, quantity = 1) => {
    if (!product || product.stock < 1) return false;
    const amount = Math.max(1, Math.min(10, Math.trunc(quantity)));
    setItems(previous => {
      const existing = previous.find(item => item._id === product._id);
      if (existing) return previous.map(item => item._id === product._id
        ? { ...product, quantity: Math.min(item.quantity + amount, product.stock, 10) } : item);
      return [...previous, { ...product, quantity: Math.min(amount, product.stock, 10) }];
    });
    return true;
  }, []);
  const updateQuantity = useCallback((id, quantity) => setItems(previous => previous.map(item => item._id === id
    ? { ...item, quantity: Math.max(1, Math.min(Math.trunc(quantity) || 1, item.stock, 10)) } : item)), []);
  const removeItem = useCallback(id => setItems(previous => previous.filter(item => item._id !== id)), []);
  const clearCart = useCallback(() => setItems([]), []);
  const refreshCart = useCallback(async () => {
    const saved = readCart();
    if (!saved.length) return [];
    const results = await Promise.all(saved.map(item => api.get(`/products/${item._id}`)));
    const refreshed = results.map(({ data }, index) => ({
      ...data.product, quantity: Math.min(saved[index].quantity, Math.max(0, data.product.stock), 10)
    })).filter(item => item.quantity > 0);
    setItems(refreshed);
    return refreshed;
  }, []);

  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const value = useMemo(() => ({ items, count, subtotal, addItem, updateQuantity, removeItem, clearCart, refreshCart }),
    [items, count, subtotal, addItem, updateQuantity, removeItem, clearCart, refreshCart]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider.');
  return context;
};
