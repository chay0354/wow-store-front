// Global store state: catalogue, cart, coupon, server price quote, UI (drawer/modal/toast).
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../lib/api.js';

const StoreContext = createContext(null);
export const useStore = () => useContext(StoreContext);

const load = (k, fallback) => { try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; } };
const persist = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };
const clampQty = (q) => Math.min(99, Math.max(0, Math.floor(Number(q)) || 0));
const loadCart = () => {
  const raw = load('wow-cart', {});
  const next = {};
  if (!raw || typeof raw !== 'object') return next;
  for (const [id, qty] of Object.entries(raw)) {
    const q = clampQty(qty);
    if (q > 0) next[id] = q;
  }
  return next;
};

export function StoreProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [bundle, setBundle] = useState(null);
  const [catalogError, setCatalogError] = useState('');
  const [cart, setCart] = useState(loadCart);                            // { [productId]: qty }
  const [couponCode, setCouponCode] = useState(() => load('wow-coupon', null));
  const [quote, setQuote] = useState(null);                                // totals from the server
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalProductId, setModalProductId] = useState(null);
  const [toastText, setToastText] = useState('');
  const toastTimer = useRef();

  useEffect(() => {
    api('/products')
      .then((d) => { setProducts(d.products); setBundle(d.bundle); })
      .catch(() => setCatalogError('לא הצלחנו לטעון את המוצרים. בדקו שהשרת רץ.'));
  }, []);

  useEffect(() => persist('wow-cart', cart), [cart]);
  useEffect(() => persist('wow-coupon', couponCode), [couponCode]);

  const items = useMemo(() => Object.entries(cart).map(([productId, qty]) => ({ productId: +productId, qty })), [cart]);

  // Ask the server for the real totals whenever the cart or coupon changes.
  useEffect(() => {
    if (!items.length) { setQuote(null); return; }
    let alive = true;
    api('/cart/quote', { method: 'POST', body: { items, couponCode } })
      .then((q) => {
        if (!alive) return;
        setQuote(q);
        if (couponCode && !q.coupon) {
          setCouponCode(null);
          setToastText('הקופון אינו פעיל יותר');
          clearTimeout(toastTimer.current);
          toastTimer.current = setTimeout(() => setToastText(''), 2000);
        }
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [items, couponCode]);

  const toast = useCallback((t) => {
    setToastText(t);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastText(''), 2000);
  }, []);

  const add = useCallback((id, qty = 1, silent) => {
    setCart((c) => ({ ...c, [id]: Math.min(99, (c[id] || 0) + qty) }));
    if (!silent) {
      const p = products.find((x) => x.id === id);
      if (p) toast(`${p.name} נוסף לסל`);
    }
  }, [products, toast]);

  const setQty = useCallback((id, qty) => {
    setCart((c) => { const n = { ...c }; const q = clampQty(qty); if (q <= 0) delete n[id]; else n[id] = q; return n; });
  }, []);

  const clearCart = useCallback(() => { setCart({}); setCouponCode(null); }, []);

  const applyCoupon = useCallback(async (raw) => {
    const code = String(raw || '').trim().toUpperCase();
    if (!code) throw new Error('הקלידו קוד קופון');
    const c = await api(`/coupons/${encodeURIComponent(code)}`);
    setCouponCode(c.code);
    toast(`הקופון ${c.code} הופעל: ${c.discount}% הנחה`);
    return c;
  }, [toast]);

  const count = items.reduce((s, i) => s + i.qty, 0);

  const value = {
    products, bundle, catalogError, cart, items, count, quote,
    couponCode, setCouponCode, applyCoupon,
    add, setQty, clearCart,
    drawerOpen, openCart: () => setDrawerOpen(true), closeCart: () => setDrawerOpen(false),
    modalProductId, openProduct: setModalProductId, closeProduct: () => setModalProductId(null),
    toastText, toast,
  };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
