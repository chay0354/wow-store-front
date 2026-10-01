import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import ProductModal from './components/ProductModal.jsx';
import Toast from './components/Toast.jsx';
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import Affiliate from './pages/Affiliate.jsx';
import About from './pages/About.jsx';
import Admin from './pages/Admin.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);

  return (
    <>
      <div className="promo-strip">משלוח חינם בהזמנה מעל ₪199 · 1+1 על כל מוצרי הכביסה עד סוף החודש</div>
      <Header />
      <main className="wrap">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/affiliate" element={<Affiliate />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
      <ProductModal />
      <Toast />
    </>
  );
}
