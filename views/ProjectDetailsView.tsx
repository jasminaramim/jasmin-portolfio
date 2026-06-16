import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PROJECTS } from '../constants';
import { motion } from 'framer-motion';
import Breadcrumbs from '../components/Breadcrumbs';

const ProjectDetailsView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProject(data);
        } else {
          const localProject = PROJECTS.find(p => p._id === id || p.id === id) || PROJECTS[0];
          setProject(localProject);
        }
      } catch (e) {
        const localProject = PROJECTS.find(p => p._id === id || p.id === id) || PROJECTS[0];
        setProject(localProject);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProject();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#a855f7] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <h2 className="text-3xl font-black">Project Not Found</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent font-['Space_Grotesk'] text-white">
      <Breadcrumbs 
        title={project.title} 
        subtitle="Project Details & Case Study" 
        image={project.image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop'}
      />

      <div className="max-w-5xl mx-auto px-6 py-24">
        <button 
          onClick={() => navigate(-1)}
          className="mb-12 flex items-center gap-2 text-[#8b5cf6] hover:text-white transition-colors font-bold uppercase tracking-widest text-[10px]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back to Projects
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[32px] overflow-hidden border border-white/10 shadow-2xl"
            >
              <img 
                src={project.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop'} 
                alt={project.title}
                className="w-full object-cover"
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-3xl font-black uppercase italic mb-6 text-[#a855f7]">Overview</h2>
              <p className="text-gray-400 leading-relaxed text-[15px]">
                {project.description || "Detailed overview for this project will be updated soon."}
              </p>
            </motion.div>
          </div>

          {/* Sidebar / Metadata */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div className="p-8 bg-gradient-to-b from-[rgba(255,255,255,0.03)] to-[rgba(255,255,255,0.01)] border border-[#8b5cf6]/20 rounded-3xl backdrop-blur-md">
              <h3 className="text-sm font-black uppercase tracking-widest text-white mb-8 border-b border-white/10 pb-4">Project Info</h3>
              
              <div className="space-y-6">
                {project.clientName && (
                  <div>
                    <p className="text-[#8b5cf6] text-[9px] font-black uppercase tracking-widest mb-1">Client</p>
                    <p className="text-white text-sm font-bold">{project.clientName}</p>
                  </div>
                )}
                
                {project.type && (
                  <div>
                    <p className="text-[#8b5cf6] text-[9px] font-black uppercase tracking-widest mb-1">Type</p>
                    <p className="text-white text-sm font-bold">{project.type}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-[#8b5cf6] text-[9px] font-black uppercase tracking-widest mb-2">Technologies Used</p>
                  <div className="flex flex-wrap gap-2">
                    {(project.tags || project.tech || []).map((tag: string) => (
                      <span key={tag} className="px-3 py-1 bg-[#8b5cf6]/10 text-[#8b5cf6] text-[9px] font-black uppercase tracking-widest border border-[#8b5cf6]/30 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {project.liveLink && (
                <a 
                  href={project.liveLink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full py-5 text-center bg-[#4B0082] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#a855f7] transition-all rounded-2xl shadow-xl flex items-center justify-center gap-2"
                >
                  Visit Live Site
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
              )}
              
              {project.githubLink && (
                <a 
                  href={project.githubLink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full py-5 text-center bg-white/5 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all rounded-2xl flex items-center justify-center gap-2"
                >
                  View Source Code
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                </a>
              )}
              
              {project.docLink && (
                <a 
                  href={project.docLink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full py-5 text-center border-2 border-[#a855f7] text-[#a855f7] text-[10px] font-black uppercase tracking-widest hover:bg-[#a855f7] hover:text-white transition-all rounded-2xl flex items-center justify-center gap-2"
                >
                  Read Full Case Study
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                </a>
              )}
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsView;
