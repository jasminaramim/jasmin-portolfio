import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { EXPERIENCE, EDUCATION } from '../constants';

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
    <section className="py-24 bg-transparent relative overflow-hidden font-['Space_Grotesk']">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.h4
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[#7e22ce] font-bold uppercase tracking-[0.2em] text-[11px] mb-3"
          >
            Background & Growth
          </motion.h4>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-[54px] font-black uppercase tracking-[-1px]"
          >
            <span className="text-white">History & </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#a855f7] to-[#8b5cf6]">Education</span>
          </motion.h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          <div className="space-y-6">
            <h3 className="text-[12px] font-bold text-[#7e22ce] uppercase tracking-[0.2em] flex items-center gap-4 mb-4">
              <span className="w-10 h-[2px] bg-[#7e22ce]"></span> LATEST EXP
            </h3>
            <div className="space-y-6">
              {recentExp.map((exp, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative p-7 md:p-8 bg-[rgba(255,255,255,0.02)] border border-[rgba(200,80,192,0.3)] rounded-[16px] hover:bg-[rgba(255,255,255,0.04)] transition-all flex gap-6 items-start"
                >
                  <div className="absolute left-0 top-[20%] bottom-[20%] w-[3px] bg-gradient-to-b from-[#8b5cf6] to-[#6366f1] rounded-r-md"></div>
                  {exp.imageUrl && (
                    <div className="w-16 h-16 shrink-0 rounded-full overflow-hidden border-2 border-[#8b5cf6]">
                      <img src={exp.imageUrl} alt={exp.company} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <span className="text-[#7e22ce] font-black text-[10px] uppercase tracking-[0.15em] block mb-2">{exp.period}</span>
                    <h4 className="text-[20px] md:text-[22px] font-black text-white uppercase mb-1 tracking-tight leading-tight">{exp.role}</h4>
                    <p className="text-gray-500 font-bold text-[11px] uppercase tracking-widest mb-4">{exp.company}</p>
                    <p className="text-gray-400 text-[14px] leading-relaxed italic">{exp.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-6 mt-10 lg:mt-0">
            <h3 className="text-[12px] font-bold text-[#7e22ce] uppercase tracking-[0.2em] flex items-center gap-4 mb-4">
              <span className="w-10 h-[2px] bg-[#7e22ce]"></span> EDUCATION
            </h3>
            <div className="space-y-6">
              {recentEdu.map((edu, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative p-7 md:p-8 bg-[rgba(255,255,255,0.02)] border border-[rgba(200,80,192,0.3)] rounded-[16px] hover:bg-[rgba(255,255,255,0.04)] transition-all flex gap-6 items-start"
                >
                  <div className="absolute left-0 top-[20%] bottom-[20%] w-[3px] bg-gradient-to-b from-[#8b5cf6] to-[#6366f1] rounded-r-md"></div>
                  {edu.imageUrl && (
                    <div className="w-16 h-16 shrink-0 rounded-full overflow-hidden border-2 border-[#8b5cf6]">
                      <img src={edu.imageUrl} alt={edu.institution} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <span className="text-[#7e22ce] font-black text-[10px] uppercase tracking-[0.15em] block mb-2">{edu.period}</span>
                    <h4 className="text-[20px] md:text-[22px] font-black text-white uppercase mb-1 tracking-tight leading-tight">{edu.degree}</h4>
                    <p className="text-gray-500 font-bold text-[11px] uppercase tracking-widest">{edu.institution}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('experience')}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#7e22ce] to-[#8b5cf6] text-white font-black uppercase tracking-[0.15em] text-[12px] shadow-[0_0_20px_rgba(200,80,192,0.3)] rounded-full hover:opacity-90 transition-opacity"
          >
            Read More History
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default ExperienceTeaser;