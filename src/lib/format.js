export const money = (n) => '₪' + (Number(n) || 0).toFixed(2);
export const dateTime = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric', year: '2-digit' }) + ' ' +
      d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
};
export const LRM = '‎';
export const CATEGORIES = [
  { id: 'all', name: 'הכול' }, { id: 'kitchen', name: 'מטבח' }, { id: 'bath', name: 'אמבטיה' },
  { id: 'laundry', name: 'כביסה' }, { id: 'floor', name: 'רצפות' }, { id: 'green', name: 'קו ירוק' }, { id: 'sale', name: 'מבצעים' },
];
export const matchCategory = (p, cat) =>
  cat === 'all' || p.category === cat || (cat === 'green' && p.green) || (cat === 'sale' && !!p.was);
