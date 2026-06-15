import React, { useState, useEffect } from 'react';
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
        setProjects(Array.isArray(data) && data.length > 0 ? data : PROJECTS);
      } catch (e) {
        setProjects(PROJECTS);
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

      <Skills onNavigate={onNavigate} isHomePage={true} />

      <ExperienceTeaser onNavigate={onNavigate} />

      <Stats />
      
      <WhatIDo />

      <section id="projects" className="py-24 bg-transparent relative">
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
                className="group relative bg-[#0a0a0a]/70 backdrop-blur-md border border-white/5 overflow-hidden transition-all hover:border-[#a855f7]/30 shadow-2xl rounded-[32px]"
              >
                <div className="relative h-72 overflow-hidden">
                  <img 
                    src={project.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop'} 
                    alt={project.title} 
                    className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700 scale-100 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-all"></div>
                  <div className="absolute top-6 left-6 flex gap-2">
                    {(project.tags || project.tech || []).slice(0, 2).map((t: string) => (
                      <span key={t} className="px-3 py-1 bg-black text-[#a855f7] text-[8px] font-black uppercase tracking-widest border border-[#a855f7]/30 backdrop-blur-md">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="p-10">
                   <h3 className="text-2xl font-black mb-6 uppercase tracking-tight group-hover:text-[#a855f7] transition-colors italic">{project.title}</h3>
                   <div className="flex gap-4">
                     <a href={project.liveLink || '#'} target="_blank" rel="noreferrer" className="flex-1 py-4 text-center bg-[#4B0082] text-white text-[9px] font-black uppercase tracking-widest hover:bg-[#a855f7] transition-all rounded-xl">Live Preview</a>
                     {(project.hasCaseStudy || project.docLink) && (
                       <a href={project.docLink || '#'} className="flex-1 py-4 text-center border border-[#a855f7] text-white text-[9px] font-black uppercase tracking-widest hover:bg-[#a855f7] transition-all rounded-xl">Case Study</a>
                     )}
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <GetConnected />

      <section className="py-32 bg-gradient-to-tr from-[#4B0082] to-[#a855f7] text-center relative overflow-hidden group">
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