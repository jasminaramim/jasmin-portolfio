import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './views/Home';
import AboutView from './views/AboutView';
import ProjectsView from './views/ProjectsView';
import ProjectDetailsView from './views/ProjectDetailsView';
import ExperienceView from './views/ExperienceView';
import ContactView from './views/ContactView';
import LoginView from './views/LoginView';
import AdminDashboard from './views/AdminDashboard';
import StoreView from './views/StoreView';
import StoreProductDetailsView from './views/ProductDetailsView';
import CartView from './views/CartView';
import CheckoutView from './views/CheckoutView';
import OrderSuccessView from './views/OrderSuccessView';
import CustomerAccountView from './views/CustomerAccountView';
import AdminStoreDashboard from './views/AdminStoreDashboard';
import FloatingContact from './components/FloatingContact';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Background3D from './components/Background3D';
import { AnimatePresence, motion } from 'framer-motion';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

const ScrollToTopOnRoute = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTopOnRoute />
          <div className="bg-black text-white selection:bg-[#a855f7] selection:text-white min-h-screen flex flex-col relative">
            <Background3D />
            
            <Routes>
              {/* Admin Routes */}
              <Route path="/admin/login" element={<LoginView />} />
              <Route path="/admin/store" element={<div className="relative z-10 w-full min-h-screen"><AdminStoreDashboard /></div>} />
              <Route path="/admin/store/*" element={<div className="relative z-10 w-full min-h-screen"><AdminStoreDashboard /></div>} />
              <Route path="/admin/*" element={<AdminDashboard />} />
              
              {/* Public Store & Portfolio Routes */}
              <Route path="*" element={
                <>
                  <NavbarWrapper />
                  <main className="flex-grow relative z-10 pt-0">
                    <AnimatePresence mode="wait">
                      <Routes>
                        <Route path="/" element={<PageWrapper><Home onNavigate={() => {}} /></PageWrapper>} />
                        <Route path="/about" element={<PageWrapper><AboutView /></PageWrapper>} />
                        <Route path="/projects" element={<PageWrapper><ProjectsView /></PageWrapper>} />
                        <Route path="/projects/:id" element={<PageWrapper><ProjectDetailsView /></PageWrapper>} />
                        <Route path="/experience" element={<PageWrapper><ExperienceView /></PageWrapper>} />
                        <Route path="/contact" element={<PageWrapper><ContactView /></PageWrapper>} />
                        
                        {/* Digital Store Routes */}
                        <Route path="/store" element={<PageWrapper><StoreView /></PageWrapper>} />
                        <Route path="/store/:slug" element={<PageWrapper><StoreProductDetailsView /></PageWrapper>} />
                        <Route path="/cart" element={<PageWrapper><CartView /></PageWrapper>} />
                        <Route path="/checkout" element={<PageWrapper><CheckoutView /></PageWrapper>} />
                        <Route path="/order-success/:orderNumber" element={<PageWrapper><OrderSuccessView /></PageWrapper>} />
                        <Route path="/my-account" element={<PageWrapper><CustomerAccountView /></PageWrapper>} />
                        <Route path="/my-purchases" element={<PageWrapper><CustomerAccountView defaultTab="purchases" /></PageWrapper>} />
                        <Route path="/purchases" element={<PageWrapper><CustomerAccountView defaultTab="purchases" /></PageWrapper>} />
                        
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </AnimatePresence>
                  </main>
                  <FloatingContact />
                  <ScrollToTop />
                  <Footer onNavigate={() => {}} />
                </>
              } />
            </Routes>
            
            {/* Ambient Background Decorative Glows */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#a855f7]/15 rounded-full blur-[140px] pointer-events-none z-0"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#4B0082]/20 rounded-full blur-[140px] pointer-events-none z-0"></div>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

// Small utility to handle Navbar state based on location
const NavbarWrapper = () => {
  const location = useLocation();
  const path = location.pathname === '/' ? 'home' : location.pathname.substring(1);
  return <Navbar currentPage={path} onNavigate={() => {}} />;
};

export default App;
