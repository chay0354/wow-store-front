import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import ProductCard from '../components/ProductCard.jsx';

const PERKS = [
  ['משלוח תוך 48 שעות', 'חינם מעל ₪199', <path key="a" d="M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19.8a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6zM17 19.8a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6z" />],
  ['קו ירוק', 'נוסחאות מתכלות, בלי פוספטים', <path key="b" d="M5 21c0-9 5-15 15-16-1 10-7 15-15 16zM5 21 13 12" />],
  ['החזרה קלה', '14 יום, בלי שאלות', <path key="c" d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />],
  ['קוד קופון של שותף', 'הנחה מיידית בסל', <path key="d" d="M20 12v8H4v-8M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />],
];

export default function Home() {
  const { products, bundle, add, openCart, toast, catalogError } = useStore();
  const navigate = useNavigate();
  const best = [...products].sort((a, b) => a.popularity - b.popularity).slice(0, 4);
  const addBundle = () => { bundle.productIds.forEach((id) => add(id, 1, true)); toast('ערכת הבית המלאה נוספה לסל'); openCart(); };

  return (
    <>
      <section className="hero">
        <div>
          <span className="badge badge--eco">חדש: קו ירוק, 98% רכיבים מהטבע</span>
          <h1 className="hero__title">בית נקי.<br />חלונות של וואו.</h1>
          <p className="hero__text">כל מוצרי הניקיון לבית במקום אחד, במחירים הוגנים ועד הדלת תוך 48 שעות.</p>
          <div className="hero__ctas">
            <Link className="btn btn--primary" to="/shop">לקנייה עכשיו</Link>
            <button className="btn btn--secondary" onClick={() => navigate('/shop?cat=sale')}>למבצעי השבוע</button>
          </div>
        </div>
        <div className="hero__art" aria-hidden="true">
          <span className="bubble b1" /><span className="bubble b2" /><span className="bubble b3" /><span className="bubble b4" /><span className="bubble b5" />
          <svg className="bottle" viewBox="0 0 100 140"><rect x="38" y="6" width="40" height="14" rx="4" fill="var(--cta)" /><path d="M40 20h20v14H40z" fill="var(--cta)" /><rect x="22" y="34" width="56" height="100" rx="16" fill="var(--accent-lemon)" /><rect x="32" y="62" width="36" height="42" rx="6" fill="var(--surface-card)" /><circle cx="50" cy="83" r="9" fill="var(--cta)" /></svg>
        </div>
      </section>

      <div className="perks">
        {PERKS.map(([title, sub, icon]) => (
          <div className="perk" key={title}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icon}</svg>
            <div><b>{title}</b><span>{sub}</span></div>
          </div>
        ))}
      </div>

      <section className="section">
        <div className="section__head"><div><h2 className="section__title">הנמכרים ביותר</h2><p className="section__sub">מה שהכי הרבה בתים מזמינים החודש</p></div><Link className="link-more" to="/shop">לכל המוצרים ←</Link></div>
        {catalogError ? <p className="error-box">{catalogError}</p> : <div className="grid">{best.map((p) => <ProductCard key={p.id} product={p} />)}</div>}
      </section>

      {bundle && (
        <section className="section">
          <div className="bundle">
            <div>
              <span className="badge badge--promo">מארז חיסכון</span>
              <h2>ערכת הבית המלאה</h2>
              <p>ספריי רב-תכליתי, נוזל כלים, מסיר אבנית, נוזל לרצפה וג׳ל כביסה אקולוגי. חמישה מוצרים שמכסים את כל הבית במחיר אחד.</p>
            </div>
            <div className="bundle__price">
              <div><span className="big">₪{bundle.price}</span></div>
              <button className="btn btn--primary" onClick={addBundle}>הוספת המארז לסל</button>
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="section__head"><h2 className="section__title">שאלות נפוצות</h2></div>
        <div className="faq">
          <details open><summary>כמה זמן לוקח המשלוח?</summary><p>הזמנות שמתקבלות עד 14:00 יוצאות באותו יום ומגיעות תוך 48 שעות לרוב הארץ.</p></details>
          <details><summary>ממתי המשלוח חינם?</summary><p>מ-₪199 בסל. מתחת לזה המשלוח עולה ₪24.90.</p></details>
          <details><summary>יש לי קוד קופון, איפה מזינים אותו?</summary><p>בסל הקניות, מעל כפתור "לקופה". ההנחה מתעדכנת מיד.</p></details>
          <details><summary>אפשר להחזיר מוצר?</summary><p>כן. מוצר סגור אפשר להחזיר תוך 14 יום ולקבל זיכוי מלא.</p></details>
        </div>
      </section>
    </>
  );
}
