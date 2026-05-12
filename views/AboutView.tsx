import React, { useState, useEffect } from 'react';
import About from '../components/About';
import Breadcrumbs from '../components/Breadcrumbs';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const AboutView: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/reviews').then(res => res.json()).then(data => {
      if (Array.isArray(data)) setReviews(data);
    });
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <Breadcrumbs 
        title="About Profile" 
        subtitle="The Digital Artisan" 
        image="https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2070&auto=format&fit=crop"
      />
      
      <About />

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <section className="py-32 bg-black border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-20 text-center">
              <h3 className="text-[#FF69B4] font-bold uppercase tracking-widest mb-3 italic text-[10px]">Client Feedback</h3>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white italic">Digital <span className="text-[#FF69B4]">Reputation</span></h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.map((review, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-10 glass border border-white/5 rounded-[40px] hover:border-[#FF69B4]/30 transition-all"
                >
                  <div className="flex gap-1 mb-6">
                    {[...Array(review.rating)].map((_, j) => (
                      <Star key={j} size={14} className="fill-[#FF69B4] text-[#FF69B4]" />
                    ))}
                  </div>
                  <p className="text-gray-400 italic text-sm mb-8 leading-relaxed">"{review.description}"</p>
                  <h4 className="text-[#FF69B4] font-black uppercase italic tracking-tighter">{review.clientName}</h4>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-32 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-24">
          <div>
            <h2 className="text-4xl font-black mb-12 uppercase text-[#FF69B4] italic tracking-tighter">Career Objectives</h2>
            <div className="space-y-8">
              <p className="text-gray-400 text-xl leading-relaxed font-bold">
                My immediate focus is joining an innovative tech environment where I can contribute to complex <span className="text-white">React.js</span> ecosystems while maintaining my edge as a premium <span className="text-white">WordPress</span> developer.
              </p>
              <div className="p-8 border-l-4 border-[#FF69B4] bg-[#FF69B4]/5">
                <p className="text-gray-400 italic">
                  "I don't just build websites; I deliver business tools that solve real problems. My journey from a curious student to a professional developer is driven by the thrill of clean code and pixel-perfect aesthetics."
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-12">
            <div>
               <h3 className="text-2xl font-black text-white uppercase mb-4 tracking-widest italic">The Multi-stack Approach</h3>
               <p className="text-gray-500 leading-relaxed font-medium">
                 By mastering both high-end custom JavaScript frameworks and the world's leading CMS, I provide a holistic development service that few can match. Whether it's a dynamic data-driven app or a content-rich e-commerce store, I have the tools to deliver.
               </p>
            </div>
            <div className="grid grid-cols-2 gap-8">
               <div className="p-10 border border-white/5 glass text-center">
                  <div className="text-[#FF69B4] font-black text-5xl mb-2 italic">80+</div>
                  <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Projects Delivered</div>
               </div>
               <div className="p-10 border border-white/5 glass text-center">
                  <div className="text-[#FF69B4] font-black text-5xl mb-2 italic">50+</div>
                  <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Global Clients</div>
               </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutView;