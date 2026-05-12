import React, { useState, useEffect } from 'react';
import Contact from '../components/Contact';
import Breadcrumbs from '../components/Breadcrumbs';
import { CONTACT_INFO } from '../constants';
import { motion } from 'framer-motion';
import { Mail, MapPin, MessageSquare, ExternalLink } from 'lucide-react';

const ContactView: React.FC = () => {
  const [profile, setProfile] = useState<any>({
    email: CONTACT_INFO.email,
    address: CONTACT_INFO.address,
    socialLinks: {
      whatsapp: CONTACT_INFO.whatsapp
    }
  });

  useEffect(() => {
    fetch('/api/profile').then(res => res.json()).then(data => {
      if (data && data.email) setProfile(data);
    });
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <Breadcrumbs 
        title="Connect Me" 
        subtitle="Let's Talk Business" 
        image="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?q=80&w=2074&auto=format&fit=crop"
      />

      <div className="py-12">
        <Contact />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { 
            icon: <Mail className="w-8 h-8 text-[#FF69B4]" />, 
            title: 'Direct Email', 
            value: profile.email, 
            link: `mailto:${profile.email}` 
          },
          { 
            icon: <MapPin className="w-8 h-8 text-[#FF69B4]" />, 
            title: 'Office Location', 
            value: profile.address, 
            link: CONTACT_INFO.googleMapsLink 
          },
          { 
            icon: <MessageSquare className="w-8 h-8 text-[#FF69B4]" />, 
            title: 'Instant Chat', 
            value: 'WhatsApp Active', 
            link: profile.socialLinks.whatsapp 
          }
        ].map((item, idx) => (
          <motion.a 
            key={idx}
            href={item.link}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-16 border border-white/5 hover:border-[#FF69B4]/30 transition-all group bg-[#080808] text-center relative overflow-hidden rounded-[40px]"
          >
            <div className="flex justify-center mb-8 group-hover:scale-110 transition-transform relative z-10">{item.icon}</div>
            <h3 className="font-black uppercase tracking-[0.2em] text-[10px] mb-4 text-[#FF69B4] italic relative z-10">{item.title}</h3>
            <p className="text-white font-bold text-sm tracking-wide relative z-10">{item.value}</p>
            <div className="absolute bottom-6 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink className="w-4 h-4 text-[#FF69B4]" />
            </div>
          </motion.a>
        ))}
      </div>

      {/* Embedded Map Section */}
      <section className="py-24 px-6 border-t border-white/5 bg-[#050505] relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h3 className="text-[#FF69B4] font-bold uppercase tracking-widest mb-4 italic text-[10px]">Geographic Location</h3>
              <h2 className="text-4xl font-black uppercase tracking-tighter text-white italic">Banasree <span className="text-[#FF69B4]">HQ</span></h2>
            </div>
            <p className="max-w-md text-gray-500 text-xs font-bold uppercase tracking-widest italic leading-relaxed">
              Block K, Banasree, Dhaka, Bangladesh. Available for local consultations and global collaborations.
            </p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="relative h-[500px] w-full border border-white/10 glass p-3 group rounded-[40px] overflow-hidden shadow-2xl"
          >
            {/* Live Feed Decoration */}
            <div className="absolute top-8 left-8 z-10 flex items-center gap-3 bg-black/80 backdrop-blur-md px-4 py-2 border border-[#FF69B4]/50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-[#FF69B4] animate-pulse"></div>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Live HQ Feed</span>
            </div>

            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.90226685822!2d90.4300!3d23.7661!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b80a568d4a37%3A0x8e87d898d910243!2sBanasree%2C%20Dhaka!5e0!3m2!1sen!2sbd!4v1710000000000!5m2!1sen!2sbd"
              className="w-full h-full grayscale invert-[0.9] brightness-[0.4] contrast-[1.2] opacity-80 group-hover:opacity-100 transition-all duration-700"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
            
            {/* Map Corner Accents */}
            <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-[#FF69B4] rounded-tl-3xl"></div>
            <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-[#FF69B4] rounded-br-3xl"></div>
          </motion.div>

          <div className="mt-12 flex justify-center">
            <a 
              href={CONTACT_INFO.googleMapsLink}
              target="_blank"
              rel="noreferrer"
              className="px-12 py-5 border border-[#FF69B4] text-[#FF69B4] text-[9px] font-black uppercase tracking-[0.3em] hover:bg-[#FF69B4] hover:text-white transition-all shadow-[0_0_20px_rgba(255,105,180,0.2)] rounded-full"
            >
              Open Large Map
            </a>
          </div>
        </div>
        
        {/* Ambient Glow */}
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#4B0082]/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      </section>
    </div>
  );
};

export default ContactView;