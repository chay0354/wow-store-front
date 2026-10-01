import { Link } from 'react-router-dom';
export default function NotFound() {
  return <div className="page-head"><h1>העמוד לא נמצא</h1><p><Link className="link-more" to="/">חזרה לדף הבית</Link></p></div>;
}
