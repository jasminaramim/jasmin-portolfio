import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const Background3D: React.FC = () => {
  const { scrollYProgress } = useScroll();
  
  // Parallax values for different layers
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -600]);
  const rotate1 = useTransform(scrollYProgress, [0, 1], [0, 90]);
  
  const techKeywords = [
    { text: 'MERN', top: '15%', left: '10%', size: 'text-8xl', delay: 0 },
    { text: 'REACT', top: '45%', left: '80%', size: 'text-9xl', delay: 2 },
    { text: 'WP', top: '75%', left: '15%', size: 'text-[12rem]', delay: 4 },
    { text: 'NODE', top: '10%', left: '70%', size: 'text-7xl', delay: 1 },
    { text: '{ }', top: '60%', left: '40%', size: 'text-[15rem]', delay: 3 },
    { text: '</>', top: '30%', left: '30%', size: 'text-9xl', delay: 5 },
    { text: 'JS', top: '85%', left: '75%', size: 'text-8xl', delay: 2.5 },
  ];

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-black">
      {/* Mesh Gradient Layer 1 */}
      <motion.div 
        style={{ y: y1, rotate: rotate1 }}
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.15, 0.1]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-[#4B0082]/20 rounded-full blur-[120px]"
      />

      {/* 3D Floating Typography "Types" */}
      <div className="absolute inset-0">
        {techKeywords.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.02, 0.05, 0.02],
              y: [0, -30, 0],
              rotateX: [0, 15, 0],
              rotateY: [0, 25, 0]
            }}
            style={{
              top: item.top,
              left: item.left,
              perspective: '1000px'
            }}
            transition={{ 
              duration: 10 + i * 2, 
              repeat: Infinity, 
              delay: item.delay,
              ease: "easeInOut" 
            }}
            className={`absolute font-black tracking-tighter text-[#FF69B4]/20 pointer-events-none select-none ${item.size} italic`}
          >
            {item.text}
          </motion.div>
        ))}
      </div>

      {/* Mesh Gradient Layer 2 */}
      <motion.div 
        style={{ y: y2 }}
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.05, 0.08, 0.05]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[140px]"
      />

      {/* Floating Particles */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + '%', 
              y: Math.random() * 100 + '%',
              opacity: Math.random()
            }}
            animate={{ 
              y: [null, '-100px', null],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{ 
              duration: 5 + Math.random() * 10, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute w-1 h-1 bg-[#FF69B4] rounded-full blur-[1px]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              boxShadow: '0 0 10px #dc2626'
            }}
          />
        ))}
      </div>
      
      {/* Dark Overlay with noise texture simulation */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
    </div>
  );
};

export default Background3D;