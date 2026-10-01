import { useCallback, useEffect, useState } from 'react';
import { api, tokenStore } from '../lib/api.js';
import { money, dateTime } from '../lib/format.js';

const KEY = 'wow-admin-token';
const STATUS = { new: 'חדשה', processing: 'בטיפול', shipped: 'נשלחה', cancelled: 'בוטלה' };

function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const submit = async (e) => {
    e.preventDefault(); setError('');
    try { const { token } = await api('/admin/login', { method: 'POST', body: { password } }); onLogin(token); }
    catch (err) { setError(err.message); }
  };
  return (
    <div className="panel login-box">
      <h2>כניסת מנהל</h2>
      <form className="form" onSubmit={submit}>
        <div className="field"><label htmlFor="adminPw">סיסמה</label><input id="adminPw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" autoFocus /></div>
        {error && <p className="error-box" role="alert">{error}</p>}
        <button className="btn btn--primary">כניסה</button>
      </form>
    </div>
  );
}

function CouponForm({ token, onCreated }) {
  const empty = { code: '', name: '', discount: 10, commission: 10, pin: '' };
  const [f, setF] = useState(empty);
  const [error, setError] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setError('');
    try { await api('/admin/coupons', { method: 'POST', token, body: f }); setF(empty); onCreated(`הקופון ${f.code.toUpperCase()} נוצר`); }
    catch (err) { setError(err.message); }
  };
  return (
    <>
      <form className="coupon-form" onSubmit={submit} noValidate>
        <div className="field"><label htmlFor="cCode">קוד קופון</label><input id="cCode" value={f.code} onChange={set('code')} placeholder="NOA10" style={{ direction: 'ltr', textAlign: 'right', textTransform: 'uppercase' }} /></div>
        <div className="field"><label htmlFor="cName">שם השותף</label><input id="cName" value={f.name} onChange={set('name')} placeholder="נועה לוי" /></div>
        <div className="field"><label htmlFor="cDisc">הנחה ללקוח %</label><input id="cDisc" type="number" min="0" max="50" value={f.discount} onChange={set('discount')} /></div>
        <div className="field"><label htmlFor="cComm">עמלה לשותף %</label><input id="cComm" type="number" min="0" max="50" value={f.commission} onChange={set('commission')} /></div>
        <div className="field"><label htmlFor="cPin">קוד כניסה לשותף</label><input id="cPin" value={f.pin} onChange={set('pin')} placeholder="לפחות 4 תווים" /></div>
        <button className="btn btn--primary">יצירה</button>
      </form>
      {error && <p className="form-err">{error}</p>}
    </>
  );
}

function Dashboard({ token, onLogout }) {
  const [tab, setTab] = useState('orders');
  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [msg, setMsg] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const [s, o, c] = await Promise.all([api('/admin/summary', { token }), api('/admin/orders', { token }), api('/admin/coupons', { token })]);
      setSummary(s); setOrders(o.orders); setCoupons(c.coupons);
    } catch (err) { if (err.status === 401) onLogout(); else setMsg(err.message); }
  }, [token, onLogout]);

  useEffect(() => { refresh(); const t = setInterval(refresh, 30000); return () => clearInterval(t); }, [refresh]);

  const run = async (fn, okMsg) => {
    try { await fn(); setMsg(okMsg); await refresh(); } catch (err) { setMsg(err.message); }
    setTimeout(() => setMsg(''), 2500);
  };
  const setStatus = (id, status) => run(() => api(`/admin/orders/${id}`, { method: 'PATCH', token, body: { status } }), `הזמנה עודכנה: ${STATUS[status]}`);
  const toggle = (c) => run(() => api(`/admin/coupons/${c.code}`, { method: 'PATCH', token, body: { active: !c.active } }), c.active ? 'הקופון הושהה' : 'הקופון הופעל');
  const pay = (c) => run(() => api(`/admin/coupons/${c.code}/pay`, { method: 'POST', token }), `העמלות של ${c.code} סומנו כשולמו`);
  const del = (c) => {
    if (confirmDelete !== c.code) { setConfirmDelete(c.code); setTimeout(() => setConfirmDelete(null), 4000); return; }
    setConfirmDelete(null);
    run(() => api(`/admin/coupons/${c.code}`, { method: 'DELETE', token }), 'הקופון נמחק');
  };

  return (
    <>
      <div className="admin-top">
        <div><h1>פאנל ניהול</h1><p className="muted" style={{ margin: '4px 0 0' }}>הזמנות, קופונים ושותפים.</p></div>
        <div className="topbar-actions"><button className="btn btn--secondary btn--xs" onClick={refresh}>רענון</button><button className="btn btn--ghost btn--xs" onClick={onLogout}>יציאה</button></div>
      </div>
      {summary && (
        <div className="stats">
          <div className="stat"><span>הכנסות</span><b>{money(summary.revenue)}</b></div>
          <div className="stat"><span>הזמנות</span><b>{summary.orders}</b></div>
          <div className={`stat${summary.newOrders ? ' hl' : ''}`}><span>הזמנות חדשות לטיפול</span><b>{summary.newOrders}</b></div>
          <div className="stat"><span>עמלות לתשלום לשותפים</span><b>{money(summary.commissionDue)}</b></div>
        </div>
      )}
      {msg && <p className="notice" role="status">{msg}</p>}
      <div className="tabs" role="tablist">
        <button className="chip" role="tab" aria-pressed={tab === 'orders'} onClick={() => setTab('orders')}>הזמנות</button>
        <button className="chip" role="tab" aria-pressed={tab === 'coupons'} onClick={() => setTab('coupons')}>קופונים ושותפים</button>
      </div>

      {tab === 'orders' && (
        <div className="table-wrap"><table>
          <thead><tr><th>מס׳</th><th>תאריך</th><th>לקוח</th><th>כתובת</th><th>פריטים</th><th>קופון</th><th>סה״כ</th><th>סטטוס</th></tr></thead>
          <tbody>
            {orders.length ? orders.map((o) => (
              <tr key={o.id}>
                <td className="num">{o.number}</td><td className="num">{dateTime(o.createdAt)}</td>
                <td><b>{o.customer.name}</b><br /><span className="muted" style={{ direction: 'ltr', display: 'inline-block' }}>{o.customer.phone}</span></td>
                <td>{o.customer.street}, {o.customer.city}<br /><span className="muted">{o.customer.slot}{o.customer.note ? ` · ${o.customer.note}` : ''}</span></td>
                <td className="items-cell">{o.items.map((i) => <div key={i.productId}>{i.name} ×{i.qty}</div>)}</td>
                <td>{o.couponCode ? <code>{o.couponCode}</code> : <span className="muted">—</span>}</td>
                <td className="num"><b>{money(o.total)}</b></td>
                <td><select className="mini-select" aria-label="סטטוס" value={o.status} onChange={(e) => setStatus(o.id, e.target.value)}>
                  {Object.entries(STATUS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select></td>
              </tr>
            )) : <tr className="empty-row"><td colSpan={8}>עוד אין הזמנות. הן יופיעו כאן ברגע שלקוח ישלים קנייה.</td></tr>}
          </tbody>
        </table></div>
      )}

      {tab === 'coupons' && (
        <>
          <CouponForm token={token} onCreated={(m) => run(async () => {}, m)} />
          <div className="table-wrap"><table>
            <thead><tr><th>קוד</th><th>שותף</th><th>הנחה</th><th>עמלה</th><th>הזמנות</th><th>מכירות</th><th>עמלה שנצברה</th><th>ממתין לתשלום</th><th>סטטוס</th><th>פעולות</th></tr></thead>
            <tbody>
              {coupons.length ? coupons.map((c) => (
                <tr key={c.code}>
                  <td><code>{c.code}</code></td><td>{c.name}</td><td className="num">{c.discount}%</td><td className="num">{c.commission}%</td>
                  <td className="num">{c.stats.orders}</td><td className="num">{money(c.stats.sales)}</td><td className="num"><b>{money(c.stats.earned)}</b></td>
                  <td className="num">{c.stats.unpaid ? <span className="pill pill--due">{money(c.stats.unpaid)}</span> : <span className="pill pill--paid">הכול שולם</span>}</td>
                  <td>{c.active ? <span className="pill pill--sent">פעיל</span> : <span className="pill pill--off">מושהה</span>}</td>
                  <td><div className="actions">
                    {c.stats.unpaid > 0 && <button className="btn btn--secondary btn--xs" onClick={() => pay(c)}>סימון כשולם</button>}
                    <button className="btn btn--ghost btn--xs" onClick={() => toggle(c)}>{c.active ? 'השהיה' : 'הפעלה'}</button>
                    <button className="btn btn--danger btn--xs" onClick={() => del(c)}>{confirmDelete === c.code ? 'בטוח? מחיקה' : 'מחיקה'}</button>
                  </div></td>
                </tr>
              )) : <tr className="empty-row"><td colSpan={10}>אין עדיין קופונים. צרו את הראשון בטופס למעלה.</td></tr>}
            </tbody>
          </table></div>
        </>
      )}
    </>
  );
}

export default function Admin() {
  const [token, setToken] = useState(() => tokenStore.get(KEY));
  const login = (t) => { tokenStore.set(KEY, t); setToken(t); };
  const logout = useCallback(() => { tokenStore.set(KEY, null); setToken(null); }, []);
  return token ? <Dashboard token={token} onLogout={logout} /> : <Login onLogin={login} />;
}
