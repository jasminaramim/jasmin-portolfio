import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PROJECTS } from '../constants';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<any[]>(PROJECTS);

  useEffect(() => {
    fetch('/api/projects').then(res => res.json()).then(data => {
      if (Array.isArray(data) && data.length > 0) setProjects([...data].reverse());
    });
  }, []);

  return (
    <div className="py-[50px] md:py-32 bg-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
          <div>
            <h3 className="text-[#a855f7] font-bold uppercase tracking-widest mb-4 italic">Real Client Projects</h3>
            <h2 className="text-5xl font-black uppercase tracking-tighter text-white italic">Selected <span className="text-[#a855f7]">Works</span></h2>
          </div>
          <p className="max-w-md text-gray-500 text-sm leading-relaxed italic font-medium">
            These projects were built for real clients with real business requirements. 
            No demo templates—just professional, production-ready solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
          {projects.map((project, idx) => (
            <motion.div 
              key={project._id || idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
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
                      src={project.image} 
                      alt={project.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm z-20">
                       <Link 
                         to={`/projects/${project._id || project.id}`}
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

        {/* Trusted By Section */}
        <div className="py-[50px] md:py-20 border-t border-white/5 text-center">
          <h4 className="text-gray-600 font-bold uppercase tracking-[0.4em] text-xs mb-10 italic">Trusted by Clients Worldwide</h4>
          <div className="flex flex-wrap justify-center gap-16 md:gap-32 opacity-40">
            <div className="text-2xl font-black italic">50+ CLIENTS</div>
            <div className="text-2xl font-black italic">{projects.length}+ PROJECTS</div>
            <div className="text-2xl font-black italic">2+ YEARS EXP</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;