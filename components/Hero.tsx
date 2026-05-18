import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface HeroProps {
  onNavigate?: (page: string) => void;
}

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop", // Clean code on macbook
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop", // Terminal / Logic
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop", // Code editor focus
  "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=2070&auto=format&fit=crop"  // Modern workspace
];

const Hero: React.FC<HeroProps> = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [profile, setProfile] = useState<any>({
    image: HERO_IMAGES[0]
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/profile').then(res => res.json()).then(data => {
      if (data && data.image) setProfile(data);
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const bgImage = profile.image && profile.image !== HERO_IMAGES[0] ? profile.image : HERO_IMAGES[currentImage];

  return (
    <div className="relative h-[85vh] flex flex-col items-center justify-center overflow-hidden bg-transparent">
      {/* Background Image Slider with Zoom Animation */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={bgImage}
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 0.15, scale: 1.1 }} // Make highly transparent so 3D background is beautifully visible
            exit={{ opacity: 0 }}
            transition={{ duration: 6, ease: "linear" }}
            className="w-full h-full"
          >
            <img
              src={bgImage}
              className="w-full h-full object-cover brightness-[0.95] contrast-[1.1]"
              alt="Premium Tech Background"
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Lighter Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-transparent z-20"></div>
      </div>

      <div className="relative z-30 text-center px-4 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-block px-4 py-2 border border-[#4B0082]/30 mb-6 bg-black/60 backdrop-blur-md rounded-lg"
        >
          <span className="text-[#FF69B4] font-black uppercase tracking-[0.3em] text-[9px]">
            WordPress & MERN Stack Developer
          </span>
        </motion.div>

        <motion.h1 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-3xl md:text-5xl font-black tracking-tighter leading-tight mb-6 text-white uppercase italic"
        >
          JAS<span className="text-[#FF69B4]">MIN</span> ARA MIM
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-base md:text-lg font-bold text-gray-200 mb-10 uppercase tracking-[0.15em] max-w-2xl mx-auto drop-shadow-xl italic"
        >
          Building <span className="text-white border-b border-[#FF69B4] pb-0.5">WordPress Solutions</span> & MERN Stack Applications
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <button 
            onClick={() => window.open('https://docs.google.com/document/d/10LrwL1bTOHBr_vz2jej2xxaN-_Y5VgH1rbasbPbaIYg/edit?usp=sharing', '_blank')}
            className="px-10 py-5 bg-gradient-to-r from-[#4B0082] to-[#FF69B4] text-white font-black uppercase tracking-widest text-[10px] hover:opacity-90 transition-all shadow-[0_0_30px_rgba(255,105,180,0.3)] rounded-full"
          >
            View CV
          </button>
          <button 
            onClick={() => navigate('/projects')}
            className="px-10 py-5 bg-white/5 border border-white/20 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all backdrop-blur-sm rounded-full"
          >
            Featured Works
          </button>
        </motion.div>
      </div>

      <motion.div 
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 z-30"
      >
        <div className="w-5 h-8 border border-[#FF69B4]/30 rounded-full flex justify-center p-1.5">
          <div className="w-1 h-1.5 bg-[#FF69B4] rounded-full"></div>
        </div>
      </motion.div>
    </div>
  );
};

export default Hero;