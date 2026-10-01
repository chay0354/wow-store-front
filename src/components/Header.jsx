import { NavLink, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { CartIcon, SearchIcon } from './Icons.jsx';
import { useEffect, useRef, useState } from 'react';

export default function Header() {
  const { count, openCart } = useStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const qParam = params.get('q') || '';
  const [q, setQ] = useState(qParam);
  const [bump, setBump] = useState(false);
  const prev = useRef(count);

  useEffect(() => { setQ(qParam); }, [qParam]);

  useEffect(() => {
    if (count > prev.current) { setBump(true); setTimeout(() => setBump(false), 400); }
    prev.current = count;
  }, [count]);

  const onSearch = (v) => { setQ(v); navigate(v ? `/shop?q=${encodeURIComponent(v)}` : '/shop', { replace: true }); };

  return (
    <header className="header">
      <div className="wrap header__row">
        <Link className="logo" to="/" aria-label="Wowindow Store, לדף הבית">
          <img className="logo__mark" src="/logo-mark.png" alt="" />
          <img className="logo__word" src="/logo-word.png" alt="Wowindow Store" />
        </Link>
        <nav className="nav" aria-label="ראשי">
          <NavLink to="/" end>בית</NavLink>
          <NavLink to="/shop">חנות</NavLink>
          <NavLink to="/affiliate">שותפים</NavLink>
          <NavLink to="/about">אודות</NavLink>
        </nav>
        <label className="search">
          <SearchIcon /><span className="sr">חיפוש מוצר</span>
          <input id="q" type="search" placeholder="חיפוש מוצר, למשל אקונומיקה" autoComplete="off" value={q} onChange={(e) => onSearch(e.target.value)} />
        </label>
        <button className="cart-btn" onClick={openCart} aria-label={`סל קניות, ${count} פריטים`}>
          <CartIcon />
          {count > 0 && <span className={`cart-count${bump ? ' bump' : ''}`}>{count}</span>}
        </button>
      </div>
    </header>
  );
}
