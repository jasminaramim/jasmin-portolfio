import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PROJECTS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import Breadcrumbs from '../components/Breadcrumbs';

const ProjectsView: React.FC = () => {
  const [filter, setFilter] = useState('All');
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const categories = ['All', 'WordPress', 'React', 'Multi-language', 'E-commerce'];
  
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

  const filteredProjects = projects.filter(p => {
    const tags = p.tags || p.tech || [];
    return filter === 'All' || tags.some((t: string) => t.toLowerCase().includes(filter.toLowerCase()));
  });

  return (
    <div className="min-h-screen bg-transparent">
      <Breadcrumbs 
        title="My Works" 
        subtitle="Full Professional Gallery" 
        image="https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop"
      />

      <div className="py-[50px] md:py-20 max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap gap-4 mb-24 justify-center">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-8 py-3 text-[9px] font-black uppercase tracking-widest transition-all rounded-full ${
                filter === cat ? 'bg-gradient-to-r from-[#4B0082] to-[#a855f7] text-white shadow-[0_0_15px_rgba(255,105,180,0.4)]' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, idx) => (
              <motion.div 
                key={project._id || idx}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
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
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectsView;
