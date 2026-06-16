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
import FloatingContact from './components/FloatingContact';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Background3D from './components/Background3D';
import { AnimatePresence, motion } from 'framer-motion';

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
    <Router>
      <ScrollToTopOnRoute />
      <div className="bg-black text-white selection:bg-[#a855f7] selection:text-white min-h-screen flex flex-col relative">
        <Background3D />
        
        <Routes>
          <Route path="/admin/login" element={<LoginView />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          
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
        
        {/* Purple/Pink Background Decorative Glows */}
        <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#4B0082]/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#a855f7]/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
      </div>
    </Router>
  );
};

// Small utility to handle Navbar state based on location
const NavbarWrapper = () => {
  const location = useLocation();
  const path = location.pathname === '/' ? 'home' : location.pathname.substring(1);
  return <Navbar currentPage={path} onNavigate={() => {}} />;
};

export default App;
