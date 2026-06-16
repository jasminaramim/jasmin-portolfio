import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { EXPERIENCE, EDUCATION } from '../constants';

const Experience: React.FC = () => {
  const [experience, setExperience] = useState<any[]>(EXPERIENCE);
  const [education, setEducation] = useState<any[]>(EDUCATION);

  useEffect(() => {
    fetch('/api/experience').then(res => res.json()).then(data => {
      if (Array.isArray(data) && data.length > 0) setExperience(data);
    });
    fetch('/api/education').then(res => res.json()).then(data => {
      if (Array.isArray(data) && data.length > 0) setEducation(data);
    });
  }, []);

  return (
    <section className="py-[25px] md:py-20 px-6 max-w-7xl mx-auto bg-transparent overflow-hidden">
      <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
        
        {/* EXPERIENCE SUBSECTION */}
        <div className="relative">
          <motion.h2 
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-black mb-12 uppercase italic tracking-tighter text-white flex items-center gap-4"
          >
            My <span className="text-[#a855f7]">Experience</span>
          </motion.h2>

          <div className="relative border-l border-[#a855f7]/30 ml-4 pl-10 space-y-10">
            {experience.map((exp: any, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.01 }}
                className="group relative bg-[#080808]/50 backdrop-blur-sm border-l-2 border-transparent hover:border-[#a855f7] p-8 hover:bg-[#080808]/80 transition-all duration-300 rounded-[30px]"
              >
                {/* Timeline Dot */}
                <div className="absolute -left-[51px] top-10 w-3.5 h-3.5 bg-[#a855f7] rounded-full border-2 border-black group-hover:scale-110 transition-transform shadow-[0_0_8px_rgba(255,105,180,0.7)]"></div>
                
                <div className="flex gap-6 items-start">
                  {exp.imageUrl && (
                    <div className="w-16 h-16 shrink-0 rounded-full overflow-hidden border-2 border-[#8b5cf6]">
                      <img src={exp.imageUrl} alt={exp.company} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[#a855f7] font-black text-[9px] uppercase tracking-[0.2em]">
                        {exp.period}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-black text-white uppercase tracking-tight mb-1">
                      {exp.role}
                    </h3>
                    <div className="text-gray-400 font-bold mb-3 text-[11px] uppercase tracking-widest italic">
                      {exp.companyLink ? (
                        <a href={exp.companyLink} target="_blank" rel="noreferrer" className="hover:text-[#a855f7] transition-colors">
                          {exp.company}
                        </a>
                      ) : exp.company}
                    </div>
                    <p className="text-gray-500 leading-relaxed text-xs italic font-medium">
                      {exp.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* EDUCATION SUBSECTION */}
        <div className="relative mt-20 lg:mt-0">
          <motion.h2 
            initial={{ opacity: 0, x: 15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-black mb-12 uppercase italic tracking-tighter text-white flex items-center gap-4"
          >
            My <span className="text-[#a855f7]">Education</span>
          </motion.h2>

          <div className="relative border-l border-[#a855f7]/30 ml-4 pl-10 space-y-10">
            {education.map((edu, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 15 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.15 }}
                viewport={{ once: true }}
                whileHover={{ y: -3 }}
                className="group relative bg-[#080808]/50 backdrop-blur-sm border-l-2 border-transparent hover:border-[#a855f7] p-8 hover:bg-[#080808]/80 transition-all duration-300 rounded-[30px]"
              >
                {/* Timeline Dot */}
                <div className="absolute -left-[51px] top-10 w-3.5 h-3.5 bg-[#a855f7] rounded-full border-2 border-black group-hover:scale-110 transition-transform shadow-[0_0_8px_rgba(255,105,180,0.7)]"></div>
                
                <div className="flex gap-6 items-start">
                  {edu.imageUrl && (
                    <div className="w-16 h-16 shrink-0 rounded-full overflow-hidden border-2 border-[#8b5cf6]">
                      <img src={edu.imageUrl} alt={edu.institution} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-gray-500 font-black text-[9px] uppercase tracking-[0.2em]">
                        {edu.period}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-black text-white uppercase tracking-tight mb-1">
                      {edu.degree}
                    </h3>
                    <div className="text-gray-400 font-bold text-[11px] uppercase tracking-widest italic">
                      {edu.institution}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Experience;