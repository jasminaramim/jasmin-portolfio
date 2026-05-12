import { Project, SkillCategory, Stat } from './types';

export const PROJECTS: Project[] = [
  {
    id: 'ratiomesh',
    title: 'RatioMesh',
    description: 'A high-performance infrastructure platform for decentralized networks. Built with custom WordPress architecture, focusing on automation, high-end performance, and global scalability.',
    tags: ['Web Infrastructure', 'WordPress', 'Scalability', 'Custom Development'],
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
    liveLink: 'https://www.ratiomesh.io/',
    githubLink: '#',
    hasCaseStudy: true
  },
  {
    id: 'clickfuel',
    title: 'ClickFuel',
    description: 'An innovative digital marketing agency platform built on WordPress, helping businesses leverage custom automated workflows for modern lead generation.',
    tags: ['Marketing Agency', 'WordPress', 'Automation', 'Lead Gen'],
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop',
    liveLink: 'https://clickfuel.click/',
    githubLink: '#',
    hasCaseStudy: true
  },
  {
    id: 'rex-auction',
    title: 'Rex Auction',
    description: 'A sophisticated real-time auction platform featuring live bidding, user notifications, and high-performance data syncing. Built with React for maximum speed and real-time interaction.',
    tags: ['React', 'Auction', 'Real-time', 'SaaS'],
    image: 'https://images.unsplash.com/photo-1589191893940-33644063df99?q=80&w=800&auto=format&fit=crop',
    liveLink: '#',
    githubLink: '#',
    hasCaseStudy: true
  },
  {
    id: 'eventify',
    title: 'Eventify',
    description: 'A comprehensive event management platform with ticket booking and organizer dashboards. Optimized for mobile and built with the React ecosystem for a fluid user experience.',
    tags: ['React', 'Event Management', 'Mobile Web'],
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=800&auto=format&fit=crop',
    liveLink: 'https://eventify-manage.netlify.app/',
    githubLink: '#',
    hasCaseStudy: true
  },
  {
    id: 'motors-concept',
    title: 'Motors Concept',
    description: 'Premier automotive marketplace built with WordPress, featuring advanced WooCommerce integration and robust Multi-language capabilities for the European market.',
    tags: ['WordPress', 'WooCommerce', 'Multi-language', 'Automotive'],
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=800&auto=format&fit=crop',
    liveLink: 'https://motorsconcept.nl/',
    githubLink: '#',
    hasCaseStudy: false
  },
  {
    id: 'beauty-shark',
    title: 'The Beauty Shark',
    description: 'High-end beauty and skincare platform. A premium custom WordPress build (Non-WooCommerce) focused on aesthetics, performance, and high-end brand storytelling.',
    tags: ['WordPress', 'Beauty', 'Custom Theme'],
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?q=80&w=800&auto=format&fit=crop',
    liveLink: 'https://www.thebeautyshark.com/',
    githubLink: '#',
    hasCaseStudy: true
  },
  {
    id: 'puff-playground',
    title: 'Puff Playground',
    description: 'E-commerce Brand Website. High-end product showcase built with WordPress and WooCommerce, featuring multi-language capabilities and a premium UI.',
    tags: ['WordPress', 'WooCommerce', 'Multi-language', 'E-commerce'],
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
    liveLink: 'https://puffplayground.com/',
    githubLink: '#',
    hasCaseStudy: false
  }
];

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    title: 'WordPress & CMS',
    skills: [
      { name: 'WordPress Core', level: 95 },
      { name: 'WooCommerce', level: 90 },
      { name: 'Elementor', level: 95 },
      { name: 'Multilingual (WPML)', level: 85 }
    ]
  },
  {
    title: 'Backend Engineering',
    skills: [
      { name: 'Node.js', level: 88 },
      { name: 'Express.js', level: 90 },
      { name: 'RESTful APIs', level: 92 },
      { name: 'MongoDB', level: 85 }
    ]
  },
  {
    title: 'Frontend & MERN',
    skills: [
      { name: 'React.js', level: 90 },
      { name: 'Redux / Context', level: 85 },
      { name: 'Tailwind CSS', level: 95 },
      { name: 'Framer Motion', level: 80 }
    ]
  },
  {
    title: 'Development Tools',
    skills: [
      { name: 'Git & GitHub', level: 88 },
      { name: 'Firebase', level: 75 },
      { name: 'Vercel / Netlify', level: 90 },
      { name: 'Responsive Design', level: 95 }
    ]
  }
];

export const STATS: Stat[] = [
  { label: 'Happy Clients', value: '50+' },
  { label: 'Projects Completed', value: '80+' },
  { label: 'Years Experience', value: '2+' },
  { label: 'Web Applications', value: '25+' }
];

export const EXPERIENCE = [
  {
    period: 'July 2025 – Present',
    role: 'Web Developer (Full-Time)',
    company: 'BD Calling, Dhaka',
    companyLink: 'https://bdcalling.com/',
    desc: 'Leading front-end initiatives, full-stack React development, and WordPress architecture for premium business clients.',
    icon: '🏆'
  },
  {
    period: 'Jan 2025 – July 2025',
    role: 'Frontend Developer',
    company: 'Elegance IT Solution',
    desc: 'Focused on high-fidelity UI/UX implementation and cross-browser compatibility using modern React workflows.',
    icon: '🏆'
  },
  {
    period: '2024 – 2025',
    role: 'Programming Course',
    company: 'Programming Hero, BD_online',
    desc: 'Intensive training in MERN stack and professional software development practices.',
    icon: '🏆'
  }
];

export const EDUCATION = [
  {
    period: '2022 – Present',
    degree: 'CSE Diploma',
    institution: 'Mymensingh Polytechnic Institute',
    icon: '🎓'
  },
  {
    period: '2022',
    degree: 'SSC',
    institution: 'Mymensingh',
    icon: '🏫'
  },
  {
    period: '2015 – 2022',
    degree: 'Secondary School',
    institution: 'Rahmat-e-Alam Academy',
    icon: '🏫'
  }
];

export const CONTACT_INFO = {
  email: 'jasminaramim2005@mail.com',
  phone: '+8801915996145',
  whatsapp: 'https://wa.me/8801915996145',
  messenger: 'https://m.me/100085189745123',
  facebook: 'https://www.facebook.com/100085189745123',
  github: 'https://github.com/jasminaramim',
  linkedin: 'https://www.linkedin.com/in/jasmin-ara-mim-6157832b5/',
  address: 'Block K, Banasree, Dhaka, Bangladesh',
  googleMapsLink: 'https://www.google.com/maps/place/Banasree,+Dhaka/@23.7661,90.4300,15z'
};