import { useState } from 'react';
import { useStore } from '../context/StoreContext.jsx';
import ProductArt from './ProductArt.jsx';
import { Price, Badges } from './Price.jsx';
import { PlusIcon, CheckIcon } from './Icons.jsx';

export default function ProductCard({ product }) {
  const { add, openProduct } = useStore();
  const [added, setAdded] = useState(false);
  const onAdd = () => { add(product.id); setAdded(true); setTimeout(() => setAdded(false), 1100); };
  return (
    <article className="card">
      <button className="card__img" onClick={() => openProduct(product.id)} aria-label={`פרטים על ${product.name}`}>
        <ProductArt product={product} />
        <span className="card__badges"><Badges product={product} /></span>
      </button>
      <h3 className="card__name"><button onClick={() => openProduct(product.id)}>{product.name}</button></h3>
      <p className="card__meta">{product.meta}</p>
      <div className="card__row">
        <Price product={product} />
        <button className={`btn btn--primary btn--round${added ? ' added' : ''}`} onClick={onAdd} aria-label={`הוספה לסל: ${product.name}`}>
          {added ? <CheckIcon /> : <PlusIcon />}
        </button>
      </div>
    </article>
  );
}
