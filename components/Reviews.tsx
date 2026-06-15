import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Review {
  _id?: string;
  clientName: string;
  description: string;
  rating: number;
}

const DUMMY_REVIEWS: Review[] = [
  {
    clientName: "Alex Turner",
    description: "Jasmin delivered a world-class enterprise application that exceeded our expectations. The MERN stack architecture is flawless.",
    rating: 5
  },
  {
    clientName: "Sarah Jenkins",
    description: "The WooCommerce optimization she did boosted our sales by 40% in just two months. Unbelievable performance improvements!",
    rating: 5
  },
  {
    clientName: "David Chen",
    description: "A true professional. She architected our custom WordPress theme from scratch, ensuring pixel-perfect design and fast load times.",
    rating: 5
  },
  {
    clientName: "Emily Rodriguez",
    description: "Her attention to detail with Framer Motion animations made our frontend feel so premium and alive. Highly recommended.",
    rating: 5
  },
  {
    clientName: "Michael Chang",
    description: "Best backend API architecture we've seen. Scalable, secure, and well-documented. Jasmin is an elite developer.",
    rating: 5
  }
];

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setReviews(data);
        } else {
          setReviews(DUMMY_REVIEWS);
        }
      })
      .catch(() => {
        setReviews(DUMMY_REVIEWS);
      });
  }, []);

  return (
    <section className="py-24 bg-[#050505] relative overflow-hidden font-['Space_Grotesk'] border-y border-white/5">
      <style>
        {`
          @keyframes scrollMarquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-scroll-marquee {
            animation: scrollMarquee 40s linear infinite;
          }
          .animate-scroll-marquee:hover {
            animation-play-state: paused;
          }
        `}
      </style>

      <div className="max-w-7xl mx-auto px-6 relative z-10 mb-16 text-center">
        <motion.h4 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[#8b5cf6] font-bold uppercase tracking-[0.2em] text-[11px] mb-3"
        >
          Testimonials
        </motion.h4>
        <motion.h2 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-black uppercase tracking-[-1px] mb-6"
        >
          <span className="text-white">CLIENT </span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7e22ce] to-[#8b5cf6]">REVIEWS</span>
        </motion.h2>
      </div>

      <div className="relative w-full overflow-hidden flex">
        {/* Left and Right fade gradients for smooth entering/exiting effect */}
        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none"></div>

        <div className="flex w-[max-content] animate-scroll-marquee">
          {/* We render the list twice to create an infinite loop effect */}
          {[...reviews, ...reviews].map((review, idx) => (
            <div 
              key={idx} 
              className="w-[350px] md:w-[450px] mx-4 p-8 bg-gradient-to-b from-[rgba(255,255,255,0.03)] to-[rgba(255,255,255,0.01)] border border-[#8b5cf6]/20 rounded-3xl hover:border-[#8b5cf6]/60 transition-all duration-300 flex flex-col shrink-0"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-400 text-[13px] leading-relaxed italic mb-8 flex-grow">
                "{review.description}"
              </p>
              <div className="flex items-center gap-4 border-t border-white/10 pt-6">
                <div className="w-10 h-10 rounded-full bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 flex items-center justify-center text-[#8b5cf6] font-black">
                  {review.clientName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-white text-[11px] font-black uppercase tracking-widest">{review.clientName}</h4>
                  <span className="text-[#8b5cf6] text-[9px] uppercase tracking-[0.2em] font-bold">Verified Client</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;
