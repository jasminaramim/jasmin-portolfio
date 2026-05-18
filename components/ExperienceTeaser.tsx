import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { EXPERIENCE, EDUCATION } from '../constants';
import { ChevronRight } from 'lucide-react';

interface ExperienceTeaserProps {
  onNavigate: (page: string) => void;
}

const ExperienceTeaser: React.FC<ExperienceTeaserProps> = ({ onNavigate }) => {
  const [experience, setExperience] = useState<any[]>(EXPERIENCE);
  const recentExp = experience.slice(0, 2);
  const recentEdu = EDUCATION.slice(0, 2);

  useEffect(() => {
    fetch('/api/experience').then(res => res.json()).then(data => {
      if (Array.isArray(data) && data.length > 0) setExperience(data);
    });
  }, []);

  return (
    <section className="py-32 bg-transparent border-y border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.h4 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[#FF69B4] font-bold uppercase tracking-[0.4em] text-[10px] mb-3"
          >
            Background & Growth
          </motion.h4>
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black uppercase tracking-tighter"
          >
            🏆 History & <span className="text-[#FF69B4]">Education</span>
          </motion.h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 mb-16">
          <div className="space-y-10">
            <h3 className="text-xl font-black text-white uppercase italic tracking-widest flex items-center gap-4">
              <span className="w-8 h-[2px] bg-[#FF69B4]"></span> Latest Exp
            </h3>
            <div className="space-y-6">
              {recentExp.map((exp, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative p-8 glass border-l-2 border-[#FF69B4] hover:bg-[#FF69B4]/5 transition-all rounded-r-3xl"
                >
                  <span className="text-[#FF69B4] font-black text-[9px] uppercase tracking-widest block mb-2">{exp.period}</span>
                  <h4 className="text-lg font-black text-white uppercase mb-1">{exp.role}</h4>
                  <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-4">{exp.company}</p>
                  <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 italic">{exp.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-10">
            <h3 className="text-xl font-black text-white uppercase italic tracking-widest flex items-center gap-4">
              <span className="w-8 h-[2px] bg-[#FF69B4]"></span> Education
            </h3>
            <div className="space-y-6">
              {recentEdu.map((edu, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: 15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative p-8 glass border-l-2 border-[#FF69B4] hover:bg-[#FF69B4]/5 transition-all rounded-r-3xl"
                >
                  <span className="text-[#FF69B4] font-black text-[9px] uppercase tracking-widest block mb-2">{edu.period}</span>
                  <h4 className="text-lg font-black text-white uppercase mb-1">{edu.degree}</h4>
                  <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">{edu.institution}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('experience')}
            className="group flex items-center gap-4 px-12 py-5 bg-[#FF69B4] text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-lg rounded-full"
          >
            Read More History
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default ExperienceTeaser;