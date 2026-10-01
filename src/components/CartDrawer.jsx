import { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext.jsx';
import { api } from '../lib/api.js';
import { money, LRM } from '../lib/format.js';
import ProductArt from './ProductArt.jsx';
import { CloseIcon, BackIcon, CheckIcon, CartIcon } from './Icons.jsx';
import { useNavigate } from 'react-router-dom';

const FREE_FROM = 199;
const SLOTS = ['מחר, 8:00–12:00', 'מחר, 12:00–16:00', 'מחר, 16:00–20:00'];

function Totals({ q }) {
  if (!q) return null;
  return (
    <div className="totals">
      <div><span className="muted">סכום ביניים</span><span>{money(q.subtotal)}</span></div>
      {q.bundleDiscount > 0 && <div><span className="muted">הנחת מארז</span><span style={{ color: 'var(--sale)' }}>{LRM}-{money(q.bundleDiscount)}</span></div>}
      {q.couponDiscount > 0 && <div><span className="muted">קופון {q.coupon?.code} ({q.coupon?.discount}%)</span><span style={{ color: 'var(--sale)' }}>{LRM}-{money(q.couponDiscount)}</span></div>}
      <div><span className="muted">משלוח</span><span>{q.shipping ? money(q.shipping) : 'חינם'}</span></div>
      <div className="grand"><span>לתשלום</span><span>{money(q.total)}</span></div>
    </div>
  );
}

function CouponBox() {
  const { couponCode, setCouponCode, applyCoupon } = useStore();
  const [input, setInput] = useState('');
  const [msg, setMsg] = useState('');
  if (couponCode) return (
    <div style={{ display: 'grid', gap: 6 }}>
      <span className="muted" style={{ fontSize: 13 }}>קוד קופון</span>
      <span><span className="coupon-tag">{couponCode}<button onClick={() => setCouponCode(null)} aria-label="הסרת הקופון">×</button></span></span>
    </div>
  );
  const submit = async (e) => {
    e.preventDefault();
    try { await applyCoupon(input); setMsg(''); setInput(''); } catch (err) { setMsg(err.message); }
  };
  return (
    <>
      <form className="coupon" onSubmit={submit}>
        <label className="sr" htmlFor="cpIn">קוד קופון</label>
        <input id="cpIn" placeholder="יש לך קוד קופון?" autoComplete="off" value={input} onChange={(e) => setInput(e.target.value)} />
        <button className="btn btn--secondary">החלה</button>
      </form>
      {msg && <p className="coupon-msg bad">{msg}</p>}
    </>
  );
}

function Checkout({ onBack, onDone }) {
  const { items, couponCode, quote } = useStore();
  const [f, setF] = useState({ name: '', phone: '', city: '', street: '', slot: SLOTS[0], note: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSending(true); setError('');
    try {
      const res = await api('/orders', { method: 'POST', body: { customer: f, items, couponCode } });
      onDone({ ...res, name: f.name.split(' ')[0], slot: f.slot });
    } catch (err) {
      setErrors(err.fields || {}); setError(err.message);
    } finally { setSending(false); }
  };

  const field = (k, label, props = {}) => (
    <div className="field">
      <label htmlFor={`co-${k}`}>{label}</label>
      <input id={`co-${k}`} value={f[k]} onChange={set(k)} aria-invalid={!!errors[k]} {...props} />
      {errors[k] && <span className="err">{errors[k]}</span>}
    </div>
  );

  return (
    <>
      <div className="drawer__body">
        <button className="btn btn--ghost" onClick={onBack} style={{ justifySelf: 'start', paddingInline: 0 }}><BackIcon /> חזרה לסל</button>
        <form className="form" id="coForm" onSubmit={submit} noValidate>
          {field('name', 'שם מלא', { autoComplete: 'name', autoFocus: true })}
          {field('phone', 'טלפון נייד', { type: 'tel', inputMode: 'tel', autoComplete: 'tel', placeholder: '050-1234567' })}
          <div className="two">{field('city', 'עיר', { autoComplete: 'address-level2' })}{field('street', 'רחוב ומספר', { autoComplete: 'street-address' })}</div>
          <div className="field"><span style={{ font: '500 13px/18px var(--font-sans)' }}>מועד משלוח</span>
            <div className="slots" role="radiogroup">
              {SLOTS.map((s, i) => (
                <span key={s}><input type="radio" name="slot" id={`s${i}`} value={s} checked={f.slot === s} onChange={set('slot')} /><label htmlFor={`s${i}`}>{s.replace('מחר, ', 'מחר ').replace(':00', '').replace(':00', '')}</label></span>
              ))}
            </div>
          </div>
          {field('note', 'הערה לשליח', { placeholder: 'קומה, קוד לבניין' })}
          <p className="note">התשלום עוד לא מחובר לאתר. אחרי ההזמנה נחזור אליכם בטלפון לתיאום תשלום ומשלוח.</p>
          {error && <p className="error-box" role="alert">{error}</p>}
        </form>
      </div>
      <div className="drawer__foot">
        <Totals q={quote} />
        <button className="btn btn--primary btn--block" type="submit" form="coForm" disabled={sending}>{sending ? 'שולחים…' : `שליחת הזמנה · ${money(quote?.total)}`}</button>
      </div>
    </>
  );
}

export default function CartDrawer() {
  const store = useStore();
  const { drawerOpen, closeCart, items, products, quote, setQty, clearCart } = store;
  const [view, setView] = useState('cart'); // cart | checkout | done
  const [done, setDone] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { if (!drawerOpen && view === 'done') setView('cart'); }, [drawerOpen, view]);
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e) => e.key === 'Escape' && closeCart();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen, closeCart]);

  const title = view === 'checkout' ? 'פרטי משלוח' : view === 'done' ? 'ההזמנה התקבלה' : 'הסל שלי';
  const left = quote ? FREE_FROM - quote.net : FREE_FROM;

  return (
    <>
      <div className={`scrim${drawerOpen ? ' on' : ''}`} onClick={closeCart} />
      <aside className={`drawer${drawerOpen ? ' on' : ''}`} role="dialog" aria-modal="true" aria-labelledby="drawerTitle" aria-hidden={!drawerOpen}>
        <div className="drawer__head"><h2 id="drawerTitle">{title}</h2><button className="icon-btn" onClick={closeCart} aria-label="סגירת הסל"><CloseIcon /></button></div>

        {view === 'cart' && (!items.length ? (
          <div className="drawer__body"><div className="cart-empty"><CartIcon size={56} /><p>הסל שלך עדיין ריק.</p><button className="btn btn--secondary" onClick={() => { closeCart(); navigate('/shop'); }}>להתחיל לקנות</button></div></div>
        ) : (
          <>
            <div className="drawer__body">
              <div className={`ship${left <= 0 ? ' done' : ''}`}>
                {left <= 0 ? 'יש לך משלוח חינם' : `עוד ${money(left)} למשלוח חינם`}
                <div className="ship__bar"><i style={{ width: `${Math.min(100, ((quote?.net || 0) / FREE_FROM) * 100)}%` }} /></div>
              </div>
              {items.map(({ productId, qty }) => {
                const p = products.find((x) => x.id === productId);
                if (!p) return null;
                return (
                  <div className="line" key={productId}>
                    <div className="line__img"><ProductArt product={p} /></div>
                    <div>
                      <div className="line__name">{p.name}</div><div className="line__meta">{p.meta}</div>
                      <div>
                        <span className="qty"><button onClick={() => setQty(productId, qty + 1)} aria-label="הוספת יחידה">+</button><span>{qty}</span><button onClick={() => setQty(productId, qty - 1)} aria-label="הורדת יחידה">−</button></span>
                        <button className="remove" onClick={() => setQty(productId, 0)}>הסרה</button>
                      </div>
                    </div>
                    <div className="line__price">{money(p.price * qty)}</div>
                  </div>
                );
              })}
            </div>
            <div className="drawer__foot">
              <CouponBox />
              <Totals q={quote} />
              <button className="btn btn--primary btn--block" onClick={() => setView('checkout')}>לקופה</button>
            </div>
          </>
        ))}

        {view === 'checkout' && <Checkout onBack={() => setView('cart')} onDone={(d) => { setDone(d); clearCart(); setView('done'); }} />}

        {view === 'done' && done && (
          <>
            <div className="drawer__body">
              <div className="done-box"><div className="tick"><CheckIcon /></div><h3>תודה, {done.name}!</h3>
                <p className="muted">הזמנה מס׳ {done.number} על סך {money(done.total)}.<br />משלוח: {done.slot}.</p>
                <p className="note">נחזור אליך בטלפון לתיאום התשלום.</p></div>
            </div>
            <div className="drawer__foot"><button className="btn btn--secondary btn--block" onClick={closeCart}>חזרה לחנות</button></div>
          </>
        )}
      </aside>
    </>
  );
}
