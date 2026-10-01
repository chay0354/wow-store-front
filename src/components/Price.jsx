import { money, LRM } from '../lib/format.js';

export const Price = ({ product }) => product.was
  ? <span className="price-group"><span className="price price--sale">{money(product.price)}</span><span className="price__was">{money(product.was)}</span></span>
  : <span className="price">{money(product.price)}</span>;

export const Badges = ({ product }) => (
  <>
    {product.was && <span className="badge badge--sale">{LRM}-{Math.round((1 - product.price / product.was) * 100)}%</span>}
    {product.green ? <span className="badge badge--eco">ירוק</span> : product.isNew && <span className="badge badge--new">חדש</span>}
  </>
);
