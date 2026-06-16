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
    <div className="py-[25px] md:py-32 bg-black overflow-hidden">
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
              className="group relative bg-[#0a0a0a] border border-white/5 overflow-hidden pink-border-glow transition-all rounded-[40px]"
            >
              <div className="relative h-80 overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-all"></div>
                <div className="absolute top-8 left-8 flex flex-wrap gap-2">
                  {(project.tags || project.tech || []).map((tag: string) => (
                    <span key={tag} className="text-[10px] px-4 py-1.5 bg-black text-[#a855f7] border border-[#a855f7]/30 font-black uppercase tracking-widest rounded-full backdrop-blur-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-12">
                <h3 className="text-3xl font-black mb-4 group-hover:text-[#a855f7] transition-colors uppercase tracking-tight italic">
                  {project.title}
                </h3>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed line-clamp-2 font-medium italic">
                  {project.description}
                </p>

                <div className="flex gap-4">
                  <a 
                    href={project.liveLink} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-1 text-center py-5 bg-[#4B0082] text-white text-xs font-black uppercase tracking-widest hover:bg-[#a855f7] transition-all rounded-2xl shadow-lg"
                  >
                    🟣 Live Website
                  </a>
                  <Link 
                    to={`/projects/${project._id || project.id}`}
                    className="px-8 py-5 bg-white/5 text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all rounded-2xl border border-white/10 whitespace-nowrap"
                  >
                    Details
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trusted By Section */}
        <div className="py-20 border-t border-white/5 text-center">
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