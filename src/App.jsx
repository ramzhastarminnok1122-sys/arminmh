import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import SiteLayout from './components/SiteLayout';
import Home from './pages/Home';
import Emergency from './pages/Emergency';
import Track from './pages/Track';
import Services from './pages/Services';
import Batteries from './pages/Batteries';
import Offers from './pages/Offers';
import Areas from './pages/Areas';
import About from './pages/About';
import Faq from './pages/Faq';
import Contact from './pages/Contact';
import ReviewsPage from './pages/Reviews';
import Account from './pages/Account';
import Auth from './pages/Auth';
import Gallery from './pages/Gallery';
import Pay from './pages/Pay';
import TechLogin from './pages/tech/TechLogin';
import TechDashboard from './pages/tech/TechDashboard';
import OwnerPanel from './pages/owner/OwnerPanel';
import AdminLogin from './pages/admin/Login';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Dispatch from './pages/admin/Dispatch';
import HomeContent from './pages/admin/HomeContent';
import Phones from './pages/admin/Phones';
import Settings from './pages/admin/Settings';
import ReviewsAdmin from './pages/admin/ReviewsAdmin';
import PaymentsAdmin from './pages/admin/Payments';
import Customers from './pages/admin/Customers';
import GalleryAdmin from './pages/admin/GalleryAdmin';
import Crud from './pages/admin/Crud';

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollTop />
      <Routes>
        {/* سایت عمومی */}
        <Route element={<SiteLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/track" element={<Track />} />
          <Route path="/track/:code" element={<Track />} />
          <Route path="/services" element={<Services />} />
          <Route path="/batteries" element={<Batteries />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/areas" element={<Areas />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/account" element={<Account />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/pay" element={<Pay />} />
          <Route path="*" element={<Home />} />
        </Route>

        {/* پنل امدادگر */}
        <Route path="/tech/login" element={<TechLogin />} />
        <Route path="/tech" element={<TechDashboard />} />
        <Route path="/owner" element={<OwnerPanel />} />

        {/* پنل مدیریت */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dispatch" element={<Dispatch />} />
          <Route path="payments" element={<PaymentsAdmin />} />
          <Route path="customers" element={<Customers />} />
          <Route path="home-content" element={<HomeContent />} />
          <Route path="services" element={<Crud moduleKey="services" />} />
          <Route path="offers" element={<Crud moduleKey="offers" />} />
          <Route path="banners" element={<Crud moduleKey="banners" />} />
          <Route path="slides" element={<Crud moduleKey="slides" />} />
          <Route path="pricing" element={<Crud moduleKey="batteries" />} />
          <Route path="gallery" element={<GalleryAdmin />} />
          <Route path="technicians" element={<Crud moduleKey="technicians" />} />
          <Route path="areas" element={<Crud moduleKey="areas" />} />
          <Route path="reviews" element={<ReviewsAdmin />} />
          <Route path="faq" element={<Crud moduleKey="faqs" />} />
          <Route path="phones" element={<Phones />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </>
  );
}
