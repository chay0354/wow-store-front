import { useStore } from '../context/StoreContext.jsx';
export default function Toast() {
  const { toastText } = useStore();
  return <div className={`toast${toastText ? ' on' : ''}`} role="status" aria-live="polite">{toastText}</div>;
}
