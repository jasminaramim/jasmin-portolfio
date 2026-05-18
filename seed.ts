import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb+srv://Jasmin:Ele%2FSq9%3FuA.d3Z%236%21yR@cluster0.ssmpl.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const demoProjects = [
  {
    title: "RatioMesh - Web Infrastructure",
    description: "A high-performance infrastructure platform for decentralized networks. Built with custom WordPress architecture, focusing on automation, high-end performance, and global scalability.",
    tags: ["WordPress", "Web Infrastructure", "Scalability", "Custom Dev"],
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
    liveLink: "https://www.ratiomesh.io/",
    assignTo: "Current Admin",
    type: "Collaborative",
    status: "Completed",
    orderId: "ORD-001",
    clientName: "RatioMesh Labs",
    profileName: "Direct Client",
    achievementValue: 3500,
    totalProjectValue: 5000,
    developerName: "Jasmin",
    docLink: "https://www.ratiomesh.io/",
    hasCaseStudy: true
  },
  {
    title: "ClickFuel - Marketing Agency Platform",
    description: "An innovative digital marketing agency platform built on WordPress, helping businesses leverage custom automated workflows for modern lead generation.",
    tags: ["WordPress", "Marketing Agency", "Automation", "Lead Gen"],
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop",
    liveLink: "https://clickfuel.click/",
    assignTo: "Current Admin",
    type: "Solo",
    status: "Completed",
    orderId: "ORD-002",
    clientName: "ClickFuel Media",
    profileName: "Fiverr",
    achievementValue: 2000,
    totalProjectValue: 2000,
    developerName: "Jasmin",
    docLink: "https://clickfuel.click/",
    hasCaseStudy: true
  },
  {
    title: "Rex Auction - Real-Time Live Bidding",
    description: "A sophisticated real-time auction platform featuring live bidding, user notifications, and high-performance data syncing. Built with React for maximum speed and real-time interaction.",
    tags: ["React.js", "Auction Engine", "Real-Time Sync", "Node.js"],
    image: "https://images.unsplash.com/photo-1589191893940-33644063df99?q=80&w=800&auto=format&fit=crop",
    liveLink: "https://demo.example.com/rex-auction",
    assignTo: "Current Admin",
    type: "Collaborative",
    status: "Completed",
    orderId: "ORD-003",
    clientName: "Rex Auctions Inc",
    profileName: "Upwork",
    achievementValue: 4500,
    totalProjectValue: 9000,
    developerName: "Jasmin",
    docLink: "https://docs.example.com/rex-auction",
    hasCaseStudy: true
  },
  {
    title: "Eventify - Event & Ticket Management",
    description: "A comprehensive event management platform with ticket booking and organizer dashboards. Optimized for mobile and built with the React ecosystem for a fluid user experience.",
    tags: ["React.js", "Event Management", "Mobile Optimized", "Tailwind CSS"],
    image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=800&auto=format&fit=crop",
    liveLink: "https://eventify-manage.netlify.app/",
    assignTo: "Current Admin",
    type: "Solo",
    status: "Completed",
    orderId: "ORD-004",
    clientName: "Eventify Ltd",
    profileName: "Upwork",
    achievementValue: 1500,
    totalProjectValue: 2500,
    developerName: "Jasmin",
    docLink: "https://eventify-manage.netlify.app/",
    hasCaseStudy: true
  },
  {
    title: "Motors Concept - Premium Automotive Hub",
    description: "Premier automotive marketplace built with WordPress, featuring advanced WooCommerce integration and robust Multi-language capabilities for the European market.",
    tags: ["WordPress", "WooCommerce", "Multi-language", "Automotive"],
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=800&auto=format&fit=crop",
    liveLink: "https://motorsconcept.nl/",
    assignTo: "Current Admin",
    type: "Collaborative",
    status: "Completed",
    orderId: "ORD-005",
    clientName: "Motors Concept NL",
    profileName: "Direct Client",
    achievementValue: 2800,
    totalProjectValue: 4000,
    developerName: "Jasmin",
    docLink: "https://motorsconcept.nl/",
    hasCaseStudy: false
  },
  {
    title: "The Beauty Shark - High-End Luxury Brand",
    description: "High-end beauty and skincare platform. A premium custom WordPress build (Non-WooCommerce) focused on aesthetics, performance, and high-end brand storytelling.",
    tags: ["WordPress", "Beauty & Care", "Custom Elementor", "Premium UI"],
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?q=80&w=800&auto=format&fit=crop",
    liveLink: "https://www.thebeautyshark.com/",
    assignTo: "Current Admin",
    type: "Solo",
    status: "Completed",
    orderId: "ORD-006",
    clientName: "The Beauty Shark Co",
    profileName: "Fiverr",
    achievementValue: 1200,
    totalProjectValue: 1200,
    developerName: "Jasmin",
    docLink: "https://www.thebeautyshark.com/",
    hasCaseStudy: true
  }
];

const demoSkills = [
  // WordPress & CMS
  { name: "WordPress Core", level: 95, category: "WordPress & CMS", logoLink: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/wordpress/wordpress-original.svg" },
  { name: "WooCommerce", level: 90, category: "WordPress & CMS", logoLink: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/woocommerce/woocommerce-original.svg" },
  { name: "Elementor Page Builder", level: 95, category: "WordPress & CMS", logoLink: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=80&auto=format&fit=crop" },
  { name: "Multilingual WP (WPML)", level: 85, category: "WordPress & CMS" },

  // Backend Engineering
  { name: "Node.js", level: 88, category: "Backend Engineering", logoLink: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
  { name: "Express.js", level: 90, category: "Backend Engineering", logoLink: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" },
  { name: "RESTful API Architecture", level: 92, category: "Backend Engineering" },
  { name: "MongoDB Database", level: 85, category: "Backend Engineering", logoLink: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },

  // Frontend & MERN
  { name: "React.js Framework", level: 90, category: "Frontend & MERN", logoLink: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
  { name: "State (Redux / Context)", level: 85, category: "Frontend & MERN" },
  { name: "Tailwind CSS", level: 95, category: "Frontend & MERN", logoLink: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg" },
  { name: "Framer Motion", level: 80, category: "Frontend & MERN" },

  // Development Tools
  { name: "Git & Version Control", level: 88, category: "Development Tools", logoLink: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" },
  { name: "Firebase Service", level: 75, category: "Development Tools", logoLink: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-original.svg" },
  { name: "Vercel & Netlify Hosting", level: 90, category: "Development Tools" },
  { name: "Responsive Mobile UI", level: 95, category: "Development Tools" }
];

const demoServices = [
  {
    title: "Frontend Architecture",
    desc: "Crafting visually outstanding, lightning-fast web applications using React.js, Next.js, and Framer Motion micro-animations.",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg"
  },
  {
    title: "MERN Stack Solutions",
    desc: "Building highly scalable, robust database-driven custom apps with Node.js, Express APIs, and advanced MongoDB configurations.",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg"
  },
  {
    title: "Enterprise WordPress",
    desc: "Designing bespoke Elementor Pro themes, custom plugins, secure APIs, and responsive enterprise-grade WordPress architectures.",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/wordpress/wordpress-original.svg"
  },
  {
    title: "WooCommerce Optimization",
    desc: "Scaling digital store capacities with secure multi-language checkouts, payment integrations, and high-performance product visualizers.",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/woocommerce/woocommerce-original.svg"
  }
];

const demoReviews = [
  {
    clientName: "Sarah Jenkins",
    description: "Jasmin did an outstanding job optimizing our custom Elementor WordPress theme. Our Core Web Vitals score shot up to 98% and user conversions increased immediately! Highly recommended professional.",
    rating: 5
  },
  {
    clientName: "David Miller",
    description: "A top-tier MERN stack developer. She engineered our real-time bidding dashboard ahead of schedule with flawless websocket sync. Looking forward to our next big infrastructure project.",
    rating: 5
  },
  {
    clientName: "Hans de Vries",
    description: "Excellent WooCommerce multi-language integration. Set up the complex custom tax, shipping, and multi-currency configurations with absolute ease. Communication was flawless.",
    rating: 5
  }
];

const demoExperience = [
  {
    period: "July 2025 – Present",
    role: "Web Developer (Full-Time)",
    company: "BD Calling, Dhaka",
    companyLink: "https://bdcalling.com/",
    desc: "Leading frontend initiatives, custom full-stack React application development, and performance-tuned WordPress architectures for premium global enterprise clients.",
    icon: "🏆"
  },
  {
    period: "Jan 2025 – July 2025",
    role: "Frontend Developer",
    company: "Elegance IT Solution",
    companyLink: "",
    desc: "Focused on crafting high-fidelity responsive UI/UX designs, modular components, and absolute cross-browser compatibility using modern React workflows.",
    icon: "🏆"
  },
  {
    period: "2024 – 2025",
    role: "Professional MERN Programming",
    company: "Programming Hero, BD",
    companyLink: "",
    desc: "Underwent intensive hands-on training in full-stack JavaScript architectures, RESTful API design, database schemas, and modern Agile product cycles.",
    icon: "🏆"
  }
];

const demoEducation = [
  {
    period: "2022 – Present",
    degree: "Diploma in Computer Science & Engineering",
    institution: "Mymensingh Polytechnic Institute",
    icon: "🎓"
  },
  {
    period: "2022",
    degree: "Secondary School Certificate (SSC)",
    institution: "Mymensingh Board",
    icon: "🏫"
  },
  {
    period: "2015 – 2022",
    degree: "Secondary School Academy",
    institution: "Rahmat-e-Alam Academy",
    icon: "🏫"
  }
];

const demoProfile = {
  image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop",
  bio: "Lead Frontend & MERN Stack Developer with 2+ years of professional experience building high-performance web applications, premium custom WordPress themes, and scalable web infrastructure.",
  socialLinks: {
    linkedin: "https://www.linkedin.com/in/jasmin-ara-mim-6157832b5/",
    github: "https://github.com/jasminaramim",
    facebook: "https://www.facebook.com/100085189745123",
    whatsapp: "https://wa.me/8801915996145",
    messenger: "https://m.me/100085189745123"
  }
};

async function seed() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await client.connect();
    console.log("Connected successfully!");
    const db = client.db("portfolio");
    
    // Drop existing collections to start perfectly clean and avoid duplication
    console.log("Clearing existing collections...");
    try { await db.collection("projects").drop(); } catch (e) {}
    try { await db.collection("skills").drop(); } catch (e) {}
    try { await db.collection("services").drop(); } catch (e) {}
    try { await db.collection("reviews").drop(); } catch (e) {}
    try { await db.collection("experience").drop(); } catch (e) {}
    try { await db.collection("education").drop(); } catch (e) {}
    try { await db.collection("profile").drop(); } catch (e) {}
    
    // Seed projects
    console.log("Inserting demo projects...");
    await db.collection("projects").insertMany(demoProjects);
    
    // Seed skills
    console.log("Inserting demo skills...");
    await db.collection("skills").insertMany(demoSkills);
    
    // Seed services
    console.log("Inserting demo services...");
    await db.collection("services").insertMany(demoServices);
    
    // Seed reviews
    console.log("Inserting demo reviews...");
    await db.collection("reviews").insertMany(demoReviews);
    
    // Seed experience
    console.log("Inserting experience entries...");
    await db.collection("experience").insertMany(demoExperience);
    
    // Seed education
    console.log("Inserting academic records...");
    await db.collection("education").insertMany(demoEducation);
    
    // Seed profile
    console.log("Setting default profile bio and identity...");
    await db.collection("profile").insertOne(demoProfile);
    
    console.log("=========================================");
    console.log("🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!");
    console.log("=========================================");
  } catch (err) {
    console.error("❌ Seeding failed with error:", err);
  } finally {
    await client.close();
  }
}

seed();
