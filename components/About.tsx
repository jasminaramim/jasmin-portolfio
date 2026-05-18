import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AboutProps {
  onNavigate?: (page: string) => void;
}

const About: React.FC<AboutProps> = ({ onNavigate }) => {
  const [profile, setProfile] = useState<any>({
    bio: 'I am a dedicated Developer with a passion for creating pixel-perfect, highly responsive websites. My journey as a coder is defined by a relentless pursuit of excellence in both WordPress and MERN Stack development.',
    image: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?q=80&w=800&auto=format&fit=crop'
  });

  useEffect(() => {
    fetch('/api/profile').then(res => res.json()).then(data => {
      if (data && data.bio) setProfile(data);
    });
  }, []);

  return (
    <div className="py-24 px-6 max-w-7xl mx-auto bg-transparent">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-[#FF69B4] font-bold uppercase tracking-widest mb-3 italic text-[10px]">Identity & Craft</h3>
          <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">
            Wordpress & <span className="text-[#FF69B4]">MERN Stack</span> Developer.
          </h2>
          <p className="text-gray-400 text-base md:text-lg leading-relaxed mb-6 whitespace-pre-line">
            {profile.bio}
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            {[
              { title: 'Full-Stack MERN', desc: 'React, Node, Express, and MongoDB.' },
              { title: 'WordPress Expert', desc: 'Complex custom themes & WooCommerce.' },
              { title: 'Modern UI/UX', desc: 'Figma-to-code with Tailwind & Motion.' },
              { title: 'Client-First', desc: 'Strategic solutions for business goals.' }
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-1 h-full bg-[#FF69B4]"></div>
                <div>
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider">{item.title}</h4>
                  <p className="text-gray-500 text-[10px] mt-1 uppercase font-semibold">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {onNavigate && (
            <button 
              onClick={() => onNavigate('about')}
              className="px-8 py-4 border-2 border-[#FF69B4] text-[#FF69B4] font-black uppercase tracking-widest text-[10px] hover:bg-[#FF69B4] hover:text-white transition-all"
            >
              More About Me
            </button>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="aspect-[4/5] bg-white/5 relative border border-white/10 p-3">
            <img 
              src={profile.image} 
              alt="Professional Tech Setup" 
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
            />
            {/* Visual Decor */}
            <div className="absolute -top-3 -left-3 w-16 h-16 border-t-2 border-l-2 border-[#FF69B4]"></div>
            <div className="absolute -bottom-4 -right-4 w-28 h-28 bg-[#FF69B4] shadow-[0_0_30px_rgba(255,105,180,0.4)] flex items-center justify-center p-3 text-center z-10">
              <span className="text-[10px] font-black text-white leading-tight uppercase tracking-widest italic">Digital Architect</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;