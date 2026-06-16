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

      <div className="py-20 max-w-7xl mx-auto px-6">
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
                className="group relative bg-[#0a0a0a]/70 backdrop-blur-md border border-white/5 overflow-hidden transition-all hover:border-[#a855f7]/40 shadow-xl rounded-[40px]"
              >
                <Link to={`/projects/${project._id || project.id || ''}`} className="block relative h-[400px] overflow-hidden">
                  <img 
                    src={project.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop'} 
                    alt={project.title} 
                    className="w-full h-full object-cover grayscale-0 brightness-100 group-hover:grayscale group-hover:brightness-90 transition-all duration-1000 ease-out scale-100 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-all duration-700"></div>
                  
                  {/* Floating Tags */}
                  <div className="absolute top-8 left-8 flex flex-wrap gap-2">
                    {(project.tags || project.tech || []).map((tag: string) => (
                      <span key={tag} className="text-[8px] px-4 py-1.5 bg-black/80 backdrop-blur-md text-[#a855f7] border border-[#a855f7]/30 font-black uppercase tracking-widest rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>

                <div className="p-12 relative">
                  <div className="absolute -top-10 left-12 w-20 h-20 bg-gradient-to-br from-[#4B0082] to-[#a855f7] flex items-center justify-center text-white font-black text-2xl italic shadow-2xl group-hover:-translate-y-2 transition-transform rounded-3xl pointer-events-none">
                    {project.title.charAt(0)}
                  </div>
                  
                  <Link to={`/projects/${project._id || project.id || ''}`} className="block outline-none">
                    <h3 className="text-3xl font-black mb-4 group-hover:text-[#a855f7] transition-colors uppercase tracking-tight italic pt-8">
                      {project.title}
                    </h3>
                  </Link>
                  <p className="text-gray-500 text-xs mb-10 leading-relaxed font-bold max-w-lg italic line-clamp-2">
                    {project.description}
                  </p>

                  <div className="flex gap-4">
                    <a 
                      href={project.liveLink || '#'} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex-1 text-center py-5 bg-[#4B0082] text-white text-[9px] font-black uppercase tracking-widest hover:bg-[#a855f7] transition-all shadow-lg rounded-2xl"
                    >
                      🟣 Live Deployment
                    </a>
                    <Link to={`/projects/${project._id || project.id || ''}`} className="flex-1 text-center px-10 py-5 border-2 border-[#4B0082] text-white text-[9px] font-black uppercase tracking-widest hover:bg-[#4B0082] transition-all rounded-2xl block">
                      View Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectsView;
