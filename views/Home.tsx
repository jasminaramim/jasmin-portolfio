import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Reviews from '../components/Reviews';
import Hero from '../components/Hero';
import Stats from '../components/Stats';
import WhatIDo from '../components/WhatIDo';
import About from '../components/About';
import Skills from '../components/Skills';
import ExperienceTeaser from '../components/ExperienceTeaser';
import GetConnected from '../components/GetConnected';
import { motion } from 'framer-motion';
import { PROJECTS } from '../constants';

interface HomeProps {
  onNavigate: (page: string) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        setProjects(Array.isArray(data) && data.length > 0 ? [...data].reverse() : [...PROJECTS].reverse());
      } catch (e) {
        setProjects([...PROJECTS].reverse());
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="bg-transparent text-white">
      <Hero onNavigate={onNavigate} />

      <div className="bg-gradient-to-r from-[#4B0082] to-[#a855f7] py-6 border-y border-white/10 relative z-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-around items-center gap-6">
          {['WORDPRESS ARCHITECTURE', 'MERN STACK DEVELOPER', '80+ DELIVERED PROJECTS', '2+ YEARS EXPERIENCE'].map((text) => (
            <span key={text} className="text-white font-black italic tracking-[0.15em] text-[10px] md:text-xs">
              {text}
            </span>
          ))}
        </div>
      </div>

      <About onNavigate={onNavigate} />

      <section id="projects" className="py-[50px] md:py-24 bg-transparent relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h3 className="text-[#a855f7] font-bold uppercase tracking-widest mb-3 italic text-[10px]">Case Studies</h3>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white italic">Featured <span className="text-[#a855f7]">Works</span></h2>
            </div>
            <a 
              href="/projects" 
              className="hidden md:block text-[#a855f7] font-black uppercase tracking-[0.2em] text-[9px] border-b border-[#a855f7] pb-1.5 hover:text-white hover:border-white transition-all"
            >
              Explore Full Gallery
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {projects.slice(0, 4).map((project, idx) => (
              <motion.div 
                key={project._id || idx}
                whileHover={{ y: -8 }}
                className="flex flex-col items-center w-full mb-12 group"
              >
                {/* Monitor Container */}
                <div className="relative w-full aspect-[16/10] bg-gradient-to-b from-[#d4d4d4] to-[#a3a3a3] p-[2px] md:p-[4px] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-10">
                  {/* Screen Bezel */}
                  <div className="w-full h-full bg-[#111111] rounded-lg p-2 md:p-3 lg:p-4 relative flex flex-col justify-between items-center shadow-inner">
                    
                    {/* Camera Dot */}
                    <div className="absolute top-1.5 md:top-2 left-1/2 -translate-x-1/2 w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-black/50 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]"></div>

                    {/* Actual Screen */}
                    <div className="w-full h-full bg-gray-900 rounded-sm md:rounded-md overflow-hidden relative mt-1 md:mt-2">
                      <img 
                        src={project.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop'} 
                        alt={project.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm z-20">
                         <Link 
                           to={`/projects/${project._id || project.id || ''}`}
                           className="px-6 md:px-8 py-2 md:py-3 bg-[#a855f7] text-white text-xs md:text-sm font-bold uppercase tracking-widest hover:bg-[#9333ea] transition-all rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                         >
                           View Details
                         </Link>
                      </div>
                    </div>
                    
                    {/* Bottom Bezel branding (empty for clean look) */}
                    <div className="h-2 md:h-4 w-full"></div>
                  </div>
                </div>

                {/* Monitor Stand */}
                <div className="relative z-0 flex flex-col items-center -mt-1 w-full">
                  {/* Neck */}
                  <div 
                    className="w-16 md:w-24 h-10 md:h-14 bg-gradient-to-b from-[#8a8a8a] to-[#5a5a5a] shadow-[inset_0_5px_10px_rgba(0,0,0,0.5)]"
                    style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }}
                  ></div>
                  {/* Base */}
                  <div className="w-32 md:w-48 h-2 md:h-3 bg-gradient-to-b from-[#cccccc] to-[#888888] rounded-t-xl shadow-2xl border-b-2 border-[#444444]"></div>
                </div>

                {/* Project Title */}
                <h3 className="text-lg md:text-2xl font-bold mt-6 text-white group-hover:text-[#a855f7] transition-colors uppercase tracking-tight italic text-center max-w-sm px-4">
                  {project.title}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Skills onNavigate={onNavigate} isHomePage={true} />

      <WhatIDo />

      <ExperienceTeaser onNavigate={onNavigate} />

      <Stats />

      <Reviews />

      <GetConnected />

      <section className="py-[50px] md:py-32 bg-gradient-to-tr from-[#4B0082] to-[#a855f7] text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-6">
            <h3 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-6 leading-tight">READY TO ELEVATE YOUR BRAND?</h3>
            <p className="text-white font-bold uppercase tracking-[0.2em] text-[10px] mb-10 opacity-80">Strategic development for world-class digital assets.</p>
            <button 
              onClick={() => onNavigate('contact')}
              className="px-12 py-5 bg-black text-white font-black uppercase tracking-widest text-xs hover:bg-[#4B0082] transition-all shadow-xl rounded-full"
            >
              Start Your Project
            </button>
        </div>
      </section>
    </div>
  );
};

export default Home;