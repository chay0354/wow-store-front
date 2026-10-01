import { useSearchParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { CATEGORIES, matchCategory } from '../lib/format.js';

const SORTS = {
  pop: (a, b) => a.popularity - b.popularity,
  low: (a, b) => a.price - b.price,
  high: (a, b) => b.price - a.price,
  new: (a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || a.popularity - b.popularity,
};

export default function Shop() {
  const { products, catalogError } = useStore();
  const [params, setParams] = useSearchParams();
  const cat = params.get('cat') || 'all';
  const q = (params.get('q') || '').trim();
  const sort = params.get('sort') || 'pop';
  const update = (k, v) => { const n = new URLSearchParams(params); v && v !== 'all' && v !== 'pop' ? n.set(k, v) : n.delete(k); setParams(n, { replace: true }); };

  const list = products.filter((p) => matchCategory(p, cat) && (!q || (p.name + ' ' + p.meta).includes(q))).sort(SORTS[sort] || SORTS.pop);
  const catName = CATEGORIES.find((c) => c.id === cat)?.name || 'כל המוצרים';

  return (
    <section className="section" style={{ marginTop: 'var(--space-8)' }}>
      <div className="section__head">
        <div><h1 className="section__title">{cat === 'all' ? 'כל המוצרים' : catName}</h1><p className="section__sub">{q ? `${list.length} תוצאות עבור "${q}"` : `${list.length} מוצרים`}</p></div>
        <label className="sort">מיון
          <select value={sort} onChange={(e) => update('sort', e.target.value)}>
            <option value="pop">הכי נמכרים</option><option value="low">מחיר: מהנמוך</option><option value="high">מחיר: מהגבוה</option><option value="new">חדשים קודם</option>
          </select>
        </label>
      </div>
      <div className="chips" role="group" aria-label="סינון לפי קטגוריה">
        {CATEGORIES.map((c) => (
          <button key={c.id} className="chip" aria-pressed={cat === c.id} onClick={() => update('cat', c.id)}>
            {c.name}<span className="n">{products.filter((p) => matchCategory(p, c.id)).length}</span>
          </button>
        ))}
      </div>
      {catalogError ? <p className="error-box">{catalogError}</p> : (
        <div className="grid">
          {list.length ? list.map((p) => <ProductCard key={p.id} product={p} />) :
            <div className="empty">לא מצאנו מוצרים שמתאימים לחיפוש. <button className="btn btn--ghost" onClick={() => setParams({})}>הציגו את כל המוצרים</button></div>}
        </div>
      )}
    </section>
  );
}
