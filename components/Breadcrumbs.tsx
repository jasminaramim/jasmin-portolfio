import React from 'react';
import { motion } from 'framer-motion';

interface BreadcrumbsProps {
  title: string;
  subtitle: string;
  image: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ title, subtitle, image }) => {
  return (
    <div 
      className="relative flex flex-col items-center justify-center overflow-hidden border-b border-[#4B0082]/10 breadcrumb-bg pt-[150px] md:pt-[250px] pb-[70px] md:pb-[100px]"
      style={{ backgroundImage: `url(${image})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-[1px]"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40"></div>
      
      <div className="relative z-10 text-center px-6">
        <motion.h4 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[#a855f7] font-black uppercase tracking-[0.4em] text-[10px] mb-3"
        >
          {subtitle}
        </motion.h4>
        <motion.h1 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white"
        >
          {title.split(' ').map((word, i) => (
            <span key={i} className={i % 2 === 1 ? 'text-[#a855f7]' : ''}>{word} </span>
          ))}
        </motion.h1>
        <div className="mt-6 flex justify-center items-center gap-4">
          <div className="h-[1px] w-10 bg-[#a855f7]/40"></div>
          <span className="text-gray-400 text-[9px] font-black uppercase tracking-widest">Home / {title}</span>
          <div className="h-[1px] w-10 bg-[#a855f7]/40"></div>
        </div>
      </div>
    </div>
  );
};

export default Breadcrumbs;