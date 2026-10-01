import { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext.jsx';
import ProductArt from './ProductArt.jsx';
import { Price, Badges } from './Price.jsx';
import { CloseIcon } from './Icons.jsx';

export default function ProductModal() {
  const { products, modalProductId, closeProduct, add } = useStore();
  const [qty, setQty] = useState(1);
  const p = products.find((x) => x.id === modalProductId);
  useEffect(() => setQty(1), [modalProductId]);
  useEffect(() => {
    if (!p) return;
    const onKey = (e) => e.key === 'Escape' && closeProduct();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [p, closeProduct]);
  if (!p) return null;
  return (
    <>
      <div className="scrim on" onClick={closeProduct} />
      <div className="modal">
        <div className="modal__box" role="dialog" aria-modal="true" aria-labelledby="mTitle">
          <div className="modal__img"><ProductArt product={p} /></div>
          <div className="modal__info">
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}><Badges product={p} /></div>
            <h2 id="mTitle">{p.name}</h2>
            <p className="muted" style={{ margin: 0 }}>{p.meta}</p>
            <ul>{(p.info || []).map((i) => <li key={i}>{i}</li>)}</ul>
            <span className="stock">במלאי · יוצא היום</span>
            <Price product={p} />
            <div className="buy-row">
              <span className="qty" style={{ margin: 0 }}>
                <button onClick={() => setQty(Math.min(99, qty + 1))} aria-label="הוספת יחידה">+</button><span>{qty}</span>
                <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="הורדת יחידה">−</button>
              </span>
              <button className="btn btn--primary" style={{ flex: 1 }} autoFocus onClick={() => { add(p.id, qty); closeProduct(); }}>הוספה לסל</button>
            </div>
          </div>
          <button className="icon-btn modal__close" onClick={closeProduct} aria-label="סגירה"><CloseIcon /></button>
        </div>
      </div>
    </>
  );
}
