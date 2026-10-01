import { useCallback, useEffect, useState } from 'react';
import { api, tokenStore } from '../lib/api.js';
import { money, dateTime } from '../lib/format.js';

const KEY = 'wow-affiliate-token';

function Login({ onLogin }) {
  const [code, setCode] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const submit = async (e) => {
    e.preventDefault(); setError('');
    try { const { token } = await api('/affiliate/login', { method: 'POST', body: { code, pin } }); onLogin(token); }
    catch (err) { setError(err.message); }
  };
  return (
    <form className="form" onSubmit={submit}>
      <div className="field"><label htmlFor="affCode">קוד הקופון שלך</label><input id="affCode" value={code} onChange={(e) => setCode(e.target.value)} placeholder="למשל NOA10" style={{ direction: 'ltr', textAlign: 'right', textTransform: 'uppercase' }} autoComplete="username" /></div>
      <div className="field"><label htmlFor="affPin">קוד כניסה</label><input id="affPin" type="password" value={pin} onChange={(e) => setPin(e.target.value)} autoComplete="current-password" /></div>
      {error && <p className="error-box" role="alert">{error}</p>}
      <button className="btn btn--primary">כניסה</button>
      <p className="muted" style={{ fontSize: 13, margin: 0 }}>את הקוד וקוד הכניסה מקבלים ממנהל האתר.</p>
    </form>
  );
}

function Dashboard({ token, onLogout }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api('/affiliate/me', { token }).then(setData).catch((err) => { if (err.status === 401) onLogout(); else setError(err.message); });
  }, [token, onLogout]);
  if (error) return (<><p className="error-box">{error}</p><button className="btn btn--ghost" style={{ marginTop: 12 }} onClick={onLogout}>יציאה</button></>);
  if (!data) return <p className="spinner">טוענים…</p>;
  const { coupon, totals, rows } = data;
  return (
    <>
      <p style={{ margin: '0 0 4px' }}>שלום {coupon.name}! הקוד <code>{coupon.code}</code> נותן {coupon.discount}% הנחה ללקוחות ו-{coupon.commission}% עמלה לך.
        {!coupon.active && <> <span className="pill pill--off">הקוד מושהה</span></>}</p>
      <div className="stats">
        <div className="stat"><span>הזמנות</span><b>{totals.orders}</b></div>
        <div className="stat"><span>מכירות עם הקוד</span><b>{money(totals.sales)}</b></div>
        <div className="stat hl"><span>הרווחת סה״כ</span><b>{money(totals.earned)}</b></div>
        <div className="stat"><span>ממתין לתשלום</span><b>{money(totals.pending)}</b></div>
      </div>
      <div className="table-wrap"><table>
        <thead><tr><th>תאריך</th><th>הזמנה</th><th>סכום</th><th>העמלה שלך</th><th>סטטוס</th></tr></thead>
        <tbody>
          {rows.length ? rows.map((r) => (
            <tr key={r.orderNumber}><td className="num">{dateTime(r.createdAt)}</td><td className="num">{r.orderNumber}</td><td className="num">{money(r.sale)}</td><td className="num"><b>{money(r.commission)}</b></td>
              <td>{r.status === 'paid' ? <span className="pill pill--paid">שולם</span> : <span className="pill pill--due">ממתין</span>}</td></tr>
          )) : <tr className="empty-row"><td colSpan={5}>עוד אין הזמנות עם הקוד. שתפו אותו!</td></tr>}
        </tbody>
      </table></div>
      <button className="btn btn--ghost" style={{ marginTop: 12 }} onClick={onLogout}>יציאה</button>
    </>
  );
}

export default function Affiliate() {
  const [token, setToken] = useState(() => tokenStore.get(KEY));
  const login = (t) => { tokenStore.set(KEY, t); setToken(t); };
  const logout = useCallback(() => { tokenStore.set(KEY, null); setToken(null); }, []);
  return (
    <>
      <div className="page-head"><h1>תוכנית השותפים</h1><p>יש לך קוד קופון של Wowindow? כל מי שקונה איתו מקבל הנחה, ואת/ה מקבל/ת אחוזים מכל רכישה. כאן רואים כמה הרווחת.</p></div>
      <div className="aff-grid">
        <div className="panel">
          <h2>איך זה עובד</h2>
          <ol className="steps">
            <li><div><b>מקבלים קוד אישי</b><span>מנהל האתר יוצר לך קוד וקוד כניסה.</span></div></li>
            <li><div><b>משתפים אותו</b><span>בסטורי, בקבוצת וואטסאפ או עם חברים.</span></div></li>
            <li><div><b>הקונים מקבלים הנחה</b><span>הם מזינים את הקוד בסל ומשלמים פחות.</span></div></li>
            <li><div><b>את/ה מרוויח/ה</b><span>אחוז מכל רכישה נרשם לזכותך ומשולם אחת לחודש.</span></div></li>
          </ol>
        </div>
        <div className="panel">
          <h2>{token ? 'הרווחים שלי' : 'כניסה לשותפים'}</h2>
          {token ? <Dashboard token={token} onLogout={logout} /> : <Login onLogin={login} />}
        </div>
      </div>
    </>
  );
}
