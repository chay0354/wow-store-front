import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__grid">
          <div><img className="footer__logo" src="/logo-full.png" alt="Wowindow Store" /><p>מוצרי ניקיון לבית, במחירים הוגנים ועד הדלת. חנות ישראלית.</p></div>
          <div><h4>חנות</h4><ul><li><Link className="link-more" to="/shop">כל המוצרים</Link></li><li><Link className="link-more" to="/shop?cat=kitchen">מטבח</Link></li><li><Link className="link-more" to="/shop?cat=bath">אמבטיה</Link></li><li><Link className="link-more" to="/shop?cat=laundry">כביסה</Link></li></ul></div>
          <div><h4>שירות</h4><ul><li>משלוחים</li><li>החזרות</li><li><Link className="link-more" to="/about">צרו קשר</Link></li></ul></div>
          <div><h4>שותפים</h4><ul><li><Link className="link-more" to="/affiliate">כמה הרווחתי</Link></li><li><Link className="link-more" to="/admin">כניסת מנהל</Link></li></ul></div>
        </div>
        <div className="footer__bottom"><span>© {new Date().getFullYear()} Wowindow Store</span><span>התשלום עוד לא מחובר לסליקה</span></div>
      </div>
    </footer>
  );
}
