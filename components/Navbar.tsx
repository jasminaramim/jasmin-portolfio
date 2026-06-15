import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CONTACT_INFO } from '../constants';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', id: '/' },
    { name: 'About', id: '/about' },
    { name: 'Projects', id: '/projects' },
    { name: 'Experience', id: '/experience' },
    { name: 'Contact', id: '/contact' },
  ];

  const handleHireMe = () => {
    window.open(CONTACT_INFO.whatsapp, '_blank');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 w-full z-[60] transition-all duration-300 ${
          scrolled ? 'py-4 glass border-b border-[#4B0082]/30 shadow-[0_4px_30px_rgba(0,0,0,0.5)]' : 'py-8'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <button 
            onClick={() => handleNavigate('/')}
            className="flex flex-col items-center justify-center outline-none z-[70] transition-transform hover:scale-105"
          >
            <div className="flex items-center leading-none tracking-tighter" style={{ fontSize: '2.5rem', marginBottom: '4px' }}>
              <span className="text-white font-black" style={{ fontFamily: 'Arial, sans-serif' }}>J</span>
              <span className="text-[#a855f7] font-black" style={{ fontFamily: 'Arial, sans-serif' }}>M</span>
            </div>
            <div className="flex text-[11px] font-black tracking-[0.3em] uppercase">
              <span className="text-white">JAS</span>
              <span className="text-[#a855f7]">MIN</span>
            </div>
          </button>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavigate(link.id)}
                className={`text-xs font-bold uppercase tracking-widest transition-colors ${
                  (currentPage === 'home' ? '/' : '/' + currentPage) === link.id ? 'text-[#a855f7]' : 'text-gray-400 hover:text-white'
                }`}
              >
                {link.name}
              </button>
            ))}
            <button
              onClick={handleHireMe}
              className="px-6 py-2 bg-gradient-to-r from-[#4B0082] to-[#a855f7] text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-[0_0_20px_rgba(255,105,180,0.2)]"
            >
              Hire Me
            </button>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden text-white cursor-pointer p-2 z-[70]" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[55] bg-black md:hidden flex flex-col pt-32 px-10"
          >
            {/* Background Glows for Mobile Menu */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#4B0082]/10 blur-[120px] pointer-events-none -z-10"></div>
            
            <div className="flex flex-col space-y-6">
              {navLinks.map((link, idx) => (
                <motion.button
                  key={link.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  onClick={() => handleNavigate(link.id)}
                  className="text-left group flex items-center gap-4"
                >
                  <span className={`text-xl font-black uppercase tracking-tighter transition-colors ${
                     (currentPage === 'home' ? '/' : '/' + currentPage) === link.id ? 'text-[#a855f7]' : 'text-white group-hover:text-[#a855f7]'
                  }`}>
                    {link.name}
                  </span>
                  {(currentPage === 'home' ? '/' : '/' + currentPage) === link.id && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className="w-8 h-[2px] bg-[#a855f7]"
                    />
                  )}
                </motion.button>
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-16 pt-10 border-t border-white/5"
            >
              <button
                onClick={handleHireMe}
                className="w-full py-5 bg-gradient-to-r from-[#4B0082] to-[#a855f7] text-white font-black uppercase tracking-[0.2em] text-sm shadow-[0_0_30px_rgba(255,105,180,0.2)]"
              >
                Launch Collaboration
              </button>
              <p className="mt-8 text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] italic text-center">
                Available for worldwide projects
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;