import React, { useState, useEffect } from 'react';
import About from '../components/About';
import Breadcrumbs from '../components/Breadcrumbs';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import Stats from '../components/Stats';
import Skills from '../components/Skills';

const AboutView: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/reviews').then(res => res.json()).then(data => {
      if (Array.isArray(data)) setReviews(data);
    });
    fetch('/api/gallery').then(res => res.json()).then(data => {
      if (Array.isArray(data)) setGallery(data);
    });
  }, []);

  return (
    <div className="min-h-screen bg-transparent">
      <Breadcrumbs 
        title="About Profile" 
        subtitle="The Digital Artisan" 
        image="https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2070&auto=format&fit=crop"
      />
      
      <About />

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <section className="py-[50px] md:py-32 bg-transparent border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-20 text-center">
              <h3 className="text-[#a855f7] font-bold uppercase tracking-widest mb-3 italic text-[10px]">Client Feedback</h3>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white italic">Digital <span className="text-[#a855f7]">Reputation</span></h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.map((review, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-10 glass border border-white/5 rounded-[40px] hover:border-[#a855f7]/30 transition-all"
                >
                  <div className="flex gap-1 mb-6">
                    {[...Array(review.rating)].map((_, j) => (
                      <Star key={j} size={14} className="fill-[#a855f7] text-[#a855f7]" />
                    ))}
                  </div>
                  <p className="text-gray-400 italic text-sm mb-8 leading-relaxed">"{review.description}"</p>
                  <h4 className="text-[#a855f7] font-black uppercase italic tracking-tighter">{review.clientName}</h4>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {gallery.length > 0 && (
        <section className="py-[50px] md:py-32 bg-transparent">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-20 text-center">
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white italic">My <span className="text-[#a855f7]">Gallery</span></h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {gallery.map((item, i) => (
                <motion.div 
                  key={item._id || i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: (i % 3) * 0.1 }}
                  className="rounded-[40px] overflow-hidden border border-white/5 hover:border-[#a855f7]/30 transition-all group aspect-square relative glass"
                >
                  <img src={item.imageUrl} alt="Work Gallery Item" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      <Skills />
      
      <Stats />
    </div>
  );
};

export default AboutView;