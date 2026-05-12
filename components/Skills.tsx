import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SKILL_CATEGORIES } from '../constants';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SkillsProps {
  onNavigate?: (page: string) => void;
  isHomePage?: boolean;
}

const Skills: React.FC<SkillsProps> = ({ isHomePage }) => {
  const navigate = useNavigate();
  const [skillCategories, setSkillCategories] = useState<any[]>(SKILL_CATEGORIES);

  useEffect(() => {
    fetch('/api/skills').then(res => res.json()).then(data => {
      if (Array.isArray(data) && data.length > 0) {
        // Group by category
        const grouped = data.reduce((acc: any, skill: any) => {
          const cat = skill.category || 'Other';
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(skill);
          return acc;
        }, {});
        
        const categories = Object.keys(grouped).map(title => ({
          title,
          skills: grouped[title]
        }));
        setSkillCategories(categories);
      }
    });
  }, []);

  const displayedCategories = isHomePage ? skillCategories.slice(0, 2) : skillCategories;

  return (
    <section className={`py-32 bg-black relative overflow-hidden border-y border-white/5`}>
      <div className="absolute top-0 right-0 w-full h-full tech-grid pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-20 text-left">
          <motion.h3 
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-[#FF69B4] font-bold uppercase tracking-[0.4em] mb-3 text-[10px]"
          >
            Full Stack Expertise
          </motion.h3>
          <motion.h2 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white"
          >
            💻 My <span className="text-[#FF69B4] pink-glow">Skills</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {displayedCategories.map((category, catIdx) => (
            <div key={category.title} className="space-y-10 p-10 glass border border-white/5 hover:border-[#FF69B4]/30 transition-all duration-500">
              <div className="flex items-center gap-4">
                <div className="w-12 h-[2px] bg-[#4B0082]"></div>
                <h4 className="text-2xl font-black text-white uppercase tracking-widest">{category.title}</h4>
              </div>

              <div className="space-y-8">
                {category.skills.map((skill: any, skillIdx: number) => (
                  <div key={skill.name} className="group">
                    <div className="flex justify-between items-end mb-3">
                      <div className="flex items-center gap-3">
                         {skill.logoLink && <img src={skill.logoLink} alt={skill.name} className="w-5 h-5 object-contain grayscale group-hover:grayscale-0 transition-all" />}
                         <span className="text-xs font-bold uppercase tracking-widest text-gray-300 group-hover:text-[#FF69B4] transition-colors">
                            {skill.name}
                         </span>
                      </div>
                      <span className="text-xs font-black text-[#FF69B4]">
                        {skill.level}%
                      </span>
                    </div>
                    <div className="h-2.5 bg-white/5 relative overflow-hidden rounded-full border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 + (skillIdx * 0.05) }}
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#4B0082] to-[#FF69B4] shadow-[0_0_15px_rgba(255,105,180,0.3)]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {isHomePage && (
          <div className="flex justify-center">
            <button 
              onClick={() => navigate('/experience')}
              className="group flex items-center gap-4 px-10 py-5 border-2 border-[#FF69B4] text-[#FF69B4] font-black uppercase tracking-widest text-[10px] hover:bg-[#FF69B4] hover:text-white transition-all shadow-[0_0_20px_rgba(255,105,180,0.1)]"
            >
              Load More Skills
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Skills;