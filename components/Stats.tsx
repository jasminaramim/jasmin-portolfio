import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { STATS } from '../constants';

const Stats: React.FC = () => {
  const [stats, setStats] = useState(STATS);

  useEffect(() => {
    // Dynamically calculate some stats if projects are available
    fetch('/api/projects').then(res => res.json()).then(data => {
      if (Array.isArray(data) && data.length > 0) {
        const newStats = [...STATS];
        const projectsCount = data.length;
        // Find "Projects Completed" index
        const idx = newStats.findIndex(s => s.label === 'Projects Completed');
        if (idx !== -1) {
          newStats[idx].value = `${projectsCount}+`;
        }
        setStats(newStats);
      }
    });
  }, []);

  return (
    <div className="py-20 bg-transparent relative overflow-hidden">
      <div className="absolute inset-0 bg-[#FF69B4]/5 blur-[120px]"></div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="text-center group"
            >
              <div className="text-4xl md:text-5xl font-black text-[#FF69B4] group-hover:text-white transition-colors duration-500 mb-2 italic tracking-tighter">
                {stat.value}
              </div>
              <div className="text-[9px] uppercase tracking-[0.2em] font-black text-gray-500 group-hover:text-[#FF69B4] transition-colors">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stats;