import { StoreProduct, StoreSettings } from '../types';

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: "Jasmin's Digital Marketplace",
  storeLogo: "/logo.png",
  storeDescription: "Explore premium digital products, WordPress themes, plugins, Elementor kits, and web templates crafted to accelerate businesses and creators.",
  currency: 'USD',
  announcement: "🚀 Special Launch Offer: Get 20% off all WordPress themes & plugins with instant delivery!",
  bkash: {
    number: "01915996145",
    qrImage: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=400&auto=format&fit=crop",
    instructions: "Send Money or Make Payment to our bKash number 01915996145. Copy the TrxID from your SMS or bKash app and enter it below.",
    enabled: true
  },
  nagad: {
    number: "01800-000000",
    qrImage: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=400&auto=format&fit=crop",
    instructions: "Send Money via Nagad App or USSD *167#. Enter your Transaction ID and Sender Number for instant verification.",
    enabled: true
  },
  rocket: {
    number: "01900-000000-1",
    qrImage: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=400&auto=format&fit=crop",
    instructions: "Make payment via DBBL Rocket mobile banking to our account. Submit the transaction identifier.",
    enabled: true
  },
  manualPaymentEnabled: true,
  gateway: {
    provider: 'sslcommerz',
    isLive: false,
    storeId: 'testbox_jasmin',
    storePassword: 'test_password_placeholder'
  }
};

export const DEFAULT_STORE_PRODUCTS: StoreProduct[] = [
  // Recent Portfolio Projects as Products
  {
    title: "TypeMaster - Bangla & English Touch Typing Platform",
    slug: "typemaster-bangla-english-touch-typing-platform",
    shopName: "Jasmin Code Studio",
    shortDescription: "Interactive Bangla (বাংলা) & English touch typing platform with real-time WPM, accuracy metrics, and AI typing speed coaching.",
    description: "TypeMaster is an advanced touch-typing training web platform supporting both Bangla (Avro/Unicode) and English. Includes real-time WPM calculation, keystroke accuracy tracking, custom test durations, leaderboard integration, and responsive dark-mode luxury design.",
    category: "Website Templates",
    thumbnail: "https://kommodo.ai/i/bfvirgJp5PVN7vu2yvJd",
    galleryImages: [
      "https://kommodo.ai/i/bfvirgJp5PVN7vu2yvJd"
    ],
    demoImages: [
      "https://kommodo.ai/i/bfvirgJp5PVN7vu2yvJd"
    ],
    liveLink: "https://typemaster-ecru.vercel.app/",
    githubRepoUrl: "https://github.com/jasminaramim/typemaster",
    sourceCodeZipUrl: "/downloads/typemaster-full-source-code.zip",
    price: 15,
    discountPrice: 9,
    downloadableFiles: [
      { name: "typemaster-full-source-code.zip", url: "/downloads/typemaster-full-source-code.zip", size: "15.4 MB" }
    ],
    status: "Published",
    featured: true,
    features: [
      "Bilingual Bangla (বাংলা) & English touch typing modes",
      "Live real-time WPM & error accuracy scoring engine",
      "Custom timer challenges & difficulty presets",
      "Complete React + TypeScript source code with commercial license"
    ],
    tags: ["React", "TypeScript", "Typing", "Bangla", "EdTech", "Web App"],
    rating: 5.0,
    salesCount: 48
  },
  {
    title: "GoWheels - Car Rental & Vehicle Booking Platform",
    slug: "gowheels-car-rental-vehicle-booking-platform",
    shopName: "Jasmin Code Studio",
    shortDescription: "Full-stack car rental & vehicle booking platform with transparent BDT pricing, car fleet directory, and rapid booking approval.",
    description: "GoWheels provides a complete vehicle booking and fleet management web solution. Built with React, Next.js, and MongoDB, featuring executive sedans, rugged SUVs, vehicle filtering, transparent daily rental pricing, and rapid WhatsApp booking integration.",
    category: "Website Templates",
    thumbnail: "https://www.image2url.com/r2/default/images/1793244551880-a5cfbdeb-231d-46eb-a646-14b8bdc3e5e5.png",
    galleryImages: [
      "https://www.image2url.com/r2/default/images/1793244551880-a5cfbdeb-231d-46eb-a646-14b8bdc3e5e5.png"
    ],
    demoImages: [
      "https://www.image2url.com/r2/default/images/1793244551880-a5cfbdeb-231d-46eb-a646-14b8bdc3e5e5.png"
    ],
    liveLink: "https://gowheels-wheat.vercel.app/#home",
    githubRepoUrl: "https://github.com/jasminaramim/gowheels",
    sourceCodeZipUrl: "/downloads/gowheels-rental-platform.zip",
    price: 19,
    discountPrice: 12,
    downloadableFiles: [
      { name: "gowheels-rental-platform.zip", url: "/downloads/gowheels-rental-platform.zip", size: "22.8 MB" }
    ],
    status: "Published",
    featured: true,
    features: [
      "Complete Car Fleet Showcase with specifications and daily BDT rates",
      "Instant Vehicle Booking & WhatsApp inquiry integration",
      "Responsive mobile-first luxury automotive aesthetic",
      "Clean React, Next.js & MongoDB architecture"
    ],
    tags: ["React", "Next.js", "Car Rental", "Booking", "MongoDB", "Automotive"],
    rating: 4.9,
    salesCount: 36
  },
  {
    title: "ShekhaGhor - Video Learning & EdTech Platform (শেখাঘর)",
    slug: "shekhaghor-video-learning-edtech-platform",
    shopName: "Jasmin Code Studio",
    shortDescription: "শেখার নতুন ঠিকানা। Modern video-based learning and tutorial discovery platform for tech, coding, and career growth.",
    description: "ShekhaGhor (শেখাঘর) is a high-performance educational platform designed to curate, organize, and stream technology, programming, and career skill video courses. Features category filters, video player modals, bookmarking, and sleek dark UI.",
    category: "Website Templates",
    thumbnail: "https://www.image2url.com/r2/default/images/1792930815411-3b79ec35-947a-42d1-8150-029d40356075.png",
    galleryImages: [
      "https://www.image2url.com/r2/default/images/1792930815411-3b79ec35-947a-42d1-8150-029d40356075.png"
    ],
    demoImages: [
      "https://www.image2url.com/r2/default/images/1792930815411-3b79ec35-947a-42d1-8150-029d40356075.png"
    ],
    liveLink: "https://sekhaghor.vercel.app/",
    githubRepoUrl: "https://github.com/jasminaramim/shekhaghor",
    sourceCodeZipUrl: "/downloads/shekhaghor-edtech-platform.zip",
    price: 16,
    discountPrice: 9,
    downloadableFiles: [
      { name: "shekhaghor-edtech-platform.zip", url: "/downloads/shekhaghor-edtech-platform.zip", size: "18.1 MB" }
    ],
    status: "Published",
    featured: true,
    features: [
      "Categorized video course & tutorial streaming interface",
      "Bilingual Bangla & English content readiness",
      "Interactive video search, skill tags, and playlists",
      "React + TypeScript + Node backend architecture"
    ],
    tags: ["EdTech", "React", "Node", "TypeScript", "Bangla", "Courses"],
    rating: 5.0,
    salesCount: 62
  },
  {
    title: "Velvet - Haute Couture & Luxury Fashion E-Commerce",
    slug: "velvet-haute-couture-luxury-fashion-ecommerce",
    shopName: "Jasmin Code Studio",
    shortDescription: "Haute Couture 2026. Editorial high-fashion apparel and luxury boutique e-commerce web platform.",
    description: "Velvet is a minimalist luxury fashion storefront crafted with crimson velvets, pure silks, and editorial typography. Features lookbook showcases, product catalogs, collection highlights, interactive cart, and smooth responsive animations.",
    category: "Website Templates",
    thumbnail: "https://www.image2url.com/r2/default/images/1791449091256-5d4ab167-9bc9-40be-8b03-c50c377ad013.png",
    galleryImages: [
      "https://www.image2url.com/r2/default/images/1791449091256-5d4ab167-9bc9-40be-8b03-c50c377ad013.png"
    ],
    demoImages: [
      "https://www.image2url.com/r2/default/images/1791449091256-5d4ab167-9bc9-40be-8b03-c50c377ad013.png"
    ],
    liveLink: "https://velvet-amber.vercel.app/",
    githubRepoUrl: "https://github.com/jasminaramim/velvet",
    sourceCodeZipUrl: "/downloads/velvet-fashion-ecommerce.zip",
    price: 18,
    discountPrice: 10,
    downloadableFiles: [
      { name: "velvet-fashion-ecommerce.zip", url: "/downloads/velvet-fashion-ecommerce.zip", size: "20.5 MB" }
    ],
    status: "Published",
    featured: true,
    features: [
      "High-end luxury fashion editorial design with crimson dark mode accents",
      "Lookbook gallery & seasonal collection showcases",
      "Shopping cart and product detail views",
      "Full React + Node responsive codebase"
    ],
    tags: ["Fashion", "E-Commerce", "React", "Luxury", "Boutique"],
    rating: 4.9,
    salesCount: 41
  },

  // 1. WordPress Themes
  {
    title: "ApexPulse - Modern SaaS & Startup WordPress Theme",
    slug: "apexpulse-modern-saas-startup-wordpress-theme",
    shopName: "Jasmin Code Studio",
    shortDescription: "Ultra-fast, conversion-optimized WordPress theme designed for high-growth SaaS, AI tools, and tech companies.",
    description: "ApexPulse is a world-class WordPress theme engineered for technology startups, SaaS products, and digital agencies. Featuring custom block patterns, WooCommerce ready shop, lightning-fast 98+ PageSpeed scores, and deep Elementor / Gutenberg integration.",
    category: "WordPress Themes",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop"
    ],
    demoImages: [
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800&auto=format&fit=crop"
    ],
    liveLink: "https://apexpulse-theme-preview.demo.site",
    price: 15,
    discountPrice: 9,
    downloadableFiles: [
      { name: "apexpulse-theme-v2.1.zip", url: "/downloads/apexpulse-theme-v2.1.zip", size: "14.2 MB" },
      { name: "documentation-and-licensing.pdf", url: "/downloads/apexpulse-docs.pdf", size: "2.8 MB" }
    ],
    status: "Published",
    featured: true,
    features: [
      "Full Site Editing (FSE) & Elementor Pro Compatible",
      "One-click demo importer with 6 unique layouts",
      "Built-in SEO schema markup & 99+ GTmetrix rating",
      "Lifetime updates and dedicated developer support"
    ],
    tags: ["WordPress", "SaaS", "Theme", "WooCommerce", "Startup"],
    rating: 4.9,
    salesCount: 142
  },
  {
    title: "VerveStore - High-Converting WooCommerce Fashion Theme",
    slug: "vervestore-high-converting-woocommerce-theme",
    shopName: "Jasmin Code Studio",
    shortDescription: "A minimalist luxury eCommerce theme built for modern fashion, apparel, and lifestyle brands.",
    description: "VerveStore delivers an editorial, high-end shopping experience. Includes AJAX live search, slide-out cart drawer, smart color swatches, quick view, and seamless checkout optimization.",
    category: "WordPress Themes",
    thumbnail: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=800&auto=format&fit=crop"
    ],
    liveLink: "https://vervestore.demo.site",
    price: 19,
    discountPrice: 12,
    downloadableFiles: [
      { name: "vervestore-woocommerce-v1.4.zip", url: "/downloads/vervestore-v1.4.zip", size: "18.5 MB" }
    ],
    status: "Published",
    featured: false,
    features: [
      "AJAX Cart Drawer & Quick Checkout",
      "Variations Swatches & Product Filter",
      "Mobile-First Responsive UX",
      "Multi-Currency & Multilingual Ready"
    ],
    tags: ["WooCommerce", "Fashion", "Minimalist", "E-commerce"],
    rating: 4.8,
    salesCount: 88
  },

  // 2. WordPress Plugins
  {
    title: "WP SpeedFlow - Smart Cache & Image Optimizer Plugin",
    slug: "wp-speedflow-smart-cache-image-optimizer-plugin",
    shopName: "Jasmin Automation",
    shortDescription: "Automated WebP conversion, critical CSS generation, and database cleanup for maximum speed.",
    description: "Supercharge your WordPress site performance without touching a single line of code. SpeedFlow optimizes Google Core Web Vitals, removes render-blocking JS, and serves WebP imagery on the fly.",
    category: "WordPress Plugins",
    thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop"
    ],
    liveLink: "https://speedflow-plugin.demo.site",
    price: 9,
    discountPrice: 5,
    downloadableFiles: [
      { name: "wp-speedflow-pro-v1.2.zip", url: "/downloads/wp-speedflow-pro.zip", size: "4.1 MB" }
    ],
    status: "Published",
    featured: true,
    features: [
      "Automatic Next-Gen WebP/AVIF Image Generation",
      "Instant Critical CSS and Font Preloading",
      "Cloudflare API automatic cache purger",
      "Clean DB cron & transient cleaner"
    ],
    tags: ["Plugin", "WordPress", "Speed", "SEO", "Performance"],
    rating: 5.0,
    salesCount: 310
  },
  {
    title: "FormPulse - WhatsApp & Telegram Leads Sync for WP",
    slug: "formpulse-whatsapp-telegram-leads-sync",
    shopName: "Jasmin Automation",
    shortDescription: "Instant real-time lead notifications straight to WhatsApp and Telegram from Contact Form 7, WPForms, and Elementor.",
    description: "Never lose another client inquiry! FormPulse hooks into all major WordPress form builders and instantly routes new inquiries with custom formatting directly to your phone.",
    category: "WordPress Plugins",
    thumbnail: "https://images.unsplash.com/photo-1611746872915-64382b5c76da?q=80&w=800&auto=format&fit=crop",
    liveLink: "https://formpulse.demo.site",
    price: 8,
    discountPrice: 5,
    downloadableFiles: [
      { name: "formpulse-leads-v1.0.zip", url: "/downloads/formpulse-leads.zip", size: "2.3 MB" }
    ],
    status: "Published",
    featured: false,
    features: [
      "Zero API fees - uses direct webhook dispatch",
      "Supports Elementor, CF7, WPForms & Fluent Forms",
      "Custom notification formatting with emojis",
      "Secure encrypted communication"
    ],
    tags: ["WhatsApp", "Telegram", "Leads", "WordPress", "Plugin"],
    rating: 4.9,
    salesCount: 95
  },

  // 3. Elementor Templates
  {
    title: "NovaAgency - 30+ High-Conversion Elementor Pro Kit",
    slug: "novaagency-high-conversion-elementor-pro-kit",
    shopName: "Jasmin Design Labs",
    shortDescription: "Complete digital agency & consulting website kit with 30+ pre-styled pages, popups, and mega menus.",
    description: "Elevate your client deliverables with NovaAgency. Includes Homepage, Case Studies, Portfolio, Service Details, Pricing Tables, Lead Capture Popups, and interactive headers built strictly with Elementor Pro container flexbox.",
    category: "Elementor Templates",
    thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop"
    ],
    liveLink: "https://novaagency-elementor.demo.site",
    price: 8,
    discountPrice: 4,
    downloadableFiles: [
      { name: "novaagency-elementor-kit.zip", url: "/downloads/novaagency-elementor-kit.zip", size: "8.7 MB" }
    ],
    status: "Published",
    featured: true,
    features: [
      "Built with Elementor Flexbox Containers",
      "Global Design System (Colors, Typography, Buttons)",
      "30+ Unique page templates and theme builder parts",
      "100% Mobile & Tablet Optimized"
    ],
    tags: ["Elementor", "Template Kit", "Agency", "Portfolio"],
    rating: 4.9,
    salesCount: 220
  },
  {
    title: "RestoDeluxe - Luxury Restaurant & Bistro Elementor Kit",
    slug: "restodeluxe-luxury-restaurant-elementor-kit",
    shopName: "Jasmin Design Labs",
    shortDescription: "Atmospheric dark-mode restaurant template with interactive food menu, reservation modal, and chef spotlight.",
    description: "Created specifically for fine dining, cafes, and luxury lounges. Fully responsive with OpenTable and custom form reservation integration.",
    category: "Elementor Templates",
    thumbnail: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop",
    liveLink: "https://restodeluxe.demo.site",
    price: 7,
    discountPrice: 4,
    downloadableFiles: [
      { name: "restodeluxe-kit.zip", url: "/downloads/restodeluxe-kit.zip", size: "6.9 MB" }
    ],
    status: "Published",
    featured: false,
    features: [
      "Interactive Filterable Food & Wine Menu",
      "Table Reservation Popup Modal",
      "Event Calendar & Chef Bio Sections",
      "Stunning Dark Luxury Glass Aesthetic"
    ],
    tags: ["Restaurant", "Elementor", "Food", "Luxury"],
    rating: 4.7,
    salesCount: 65
  },

  // 4. Website Templates
  {
    title: "CyberFolio - Next-Gen Developer & Designer Portfolio",
    slug: "cyberfolio-developer-designer-portfolio-template",
    shopName: "Jasmin Frontend Lab",
    shortDescription: "Futuristic dark-mode HTML/React/Tailwind portfolio featuring 3D ambient glows and smooth framer motion.",
    description: "Stand out from the crowd and land 6-figure contracts with CyberFolio. Includes working contact forms, animated skill bars, dynamic project showcase modals, and blog layouts.",
    category: "Website Templates",
    thumbnail: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800&auto=format&fit=crop"
    ],
    liveLink: "https://cyberfolio-template.demo.site",
    price: 15,
    discountPrice: 9,
    downloadableFiles: [
      { name: "cyberfolio-react-tailwind-source.zip", url: "/downloads/cyberfolio-source.zip", size: "12.4 MB" }
    ],
    status: "Published",
    featured: true,
    features: [
      "React + Vite + Tailwind CSS Architecture",
      "Framer Motion Micro-Interactions",
      "Pre-configured SEO & OpenGraph Meta Tags",
      "Full Light & Dark Theme Support"
    ],
    tags: ["React", "Tailwind", "Portfolio", "Template", "Frontend"],
    rating: 5.0,
    salesCount: 178
  },
  {
    title: "ScaleFlow - B2B Business & FinTech Landing Page",
    slug: "scaleflow-b2b-business-fintech-landing-page",
    shopName: "Jasmin Frontend Lab",
    shortDescription: "Clean, high-trust landing page designed for B2B tech, payment gateways, and consulting firms.",
    description: "Tailored to drive enterprise conversions with interactive pricing calculators, testimonial carousels, and trust security badges.",
    category: "Website Templates",
    thumbnail: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=800&auto=format&fit=crop",
    liveLink: "https://scaleflow.demo.site",
    price: 14,
    discountPrice: 9,
    downloadableFiles: [
      { name: "scaleflow-landing-kit.zip", url: "/downloads/scaleflow-kit.zip", size: "9.2 MB" }
    ],
    status: "Published",
    featured: false,
    features: [
      "Interactive ROI Calculator Widget",
      "Clean semantic HTML5 & Modern CSS Grid",
      "Accessible & Lighthouse 100/100 Tested",
      "Comprehensive Figma Design Tokens included"
    ],
    tags: ["FinTech", "B2B", "Landing Page", "Template"],
    rating: 4.8,
    salesCount: 74
  },

  // 5. UI Kits & Components
  {
    title: "HyperDark UI - 120+ Glassmorphic React Components",
    slug: "hyperdark-ui-glassmorphic-react-components",
    shopName: "Jasmin UI Studio",
    shortDescription: "Copy-paste luxury dark-mode buttons, cards, modals, navigation bars, and forms for Tailwind CSS.",
    description: "Build ultra-modern web apps in record time. HyperDark UI is a comprehensive component library designed with sleek neon accents, frosted glass effects, and accessible keyboard navigation.",
    category: "UI Kits & Components",
    thumbnail: "https://images.unsplash.com/photo-1545235617-9465d2a55698?q=80&w=800&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1545235617-9465d2a55698?q=80&w=800&auto=format&fit=crop"
    ],
    liveLink: "https://hyperdark-ui.demo.site",
    price: 6,
    discountPrice: 3,
    downloadableFiles: [
      { name: "hyperdark-ui-components-bundle.zip", url: "/downloads/hyperdark-ui.zip", size: "5.5 MB" }
    ],
    status: "Published",
    featured: true,
    features: [
      "120+ Production-ready Tailwind Components",
      "Figma File + React JSX / TSX code files",
      "Radix UI / Headless UI accessible foundations",
      "Zero external dependency overhead"
    ],
    tags: ["UI Kit", "Tailwind CSS", "React", "Glassmorphism"],
    rating: 4.9,
    salesCount: 260
  },
  {
    title: "MetricCraft - Dashboard Analytics UI Kit",
    slug: "metriccraft-dashboard-analytics-ui-kit",
    shopName: "Jasmin UI Studio",
    shortDescription: "Complete admin dashboard UI kit with revenue charts, user tables, and transaction feeds.",
    description: "Designed for SaaS founders and developers. Includes responsive sidebar layouts, metric stat cards, and interactive data grid components.",
    category: "UI Kits & Components",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
    liveLink: "https://metriccraft.demo.site",
    price: 7,
    discountPrice: 3,
    downloadableFiles: [
      { name: "metriccraft-dashboard-kit.zip", url: "/downloads/metriccraft.zip", size: "7.8 MB" }
    ],
    status: "Published",
    featured: false,
    features: [
      "Chart.js and Recharts ready configurations",
      "Light and Deep Dark mode tokens",
      "Data table with sort, filter, and pagination styles",
      "Mobile responsive navigation drawer"
    ],
    tags: ["Dashboard", "Analytics", "UI Kit", "Admin"],
    rating: 4.8,
    salesCount: 115
  },

  // 6. Canva Templates
  {
    title: "BrandVibe - 50+ Social Media Carousel & Post Templates",
    slug: "brandvibe-50-social-media-canva-templates",
    shopName: "Jasmin Creative Assets",
    shortDescription: "Engaging Instagram, LinkedIn, and Facebook marketing templates for tech agencies and developers.",
    description: "Attract higher paying clients on LinkedIn and Instagram with these professionally designed social media carousel decks and promotional post graphics. Fully editable with a free Canva account.",
    category: "Canva Templates",
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=800&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=800&auto=format&fit=crop"
    ],
    liveLink: "https://brandvibe-canva.demo.site",
    price: 5,
    discountPrice: 2,
    downloadableFiles: [
      { name: "canva-template-access-links.pdf", url: "/downloads/brandvibe-canva-links.pdf", size: "1.1 MB" }
    ],
    status: "Published",
    featured: true,
    features: [
      "50+ Reusable Canva Template Designs",
      "Editable in Free or Pro Canva",
      "Tailored for Developers, Creators, and Agencies",
      "Includes step-by-step branding customization guide"
    ],
    tags: ["Canva", "Social Media", "Instagram", "Marketing", "Carousel"],
    rating: 4.9,
    salesCount: 340
  },
  {
    title: "PitchDeck Pro - 25-Slide Modern Investor Presentation",
    slug: "pitchdeck-pro-canva-investor-presentation",
    shopName: "Jasmin Creative Assets",
    shortDescription: "High-impact presentation deck for startup pitches, client proposals, and portfolio reviews.",
    description: "Win your next pitch with confidence. Clean layouts covering Problem, Solution, Market Size, Traction, Team, Financials, and Ask.",
    category: "Canva Templates",
    thumbnail: "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=800&auto=format&fit=crop",
    liveLink: "https://pitchdeck-canva.demo.site",
    price: 6,
    discountPrice: 2,
    downloadableFiles: [
      { name: "pitchdeck-pro-canva-access.pdf", url: "/downloads/pitchdeck-canva-access.pdf", size: "1.2 MB" }
    ],
    status: "Published",
    featured: false,
    features: [
      "25 Professionally designed 16:9 slides",
      "Infographic charts, roadmap, and pricing matrices",
      "Instant 1-click Canva template import link",
      "Exportable to PDF, PowerPoint, or Web"
    ],
    tags: ["Pitch Deck", "Canva", "Presentation", "Startup"],
    rating: 4.8,
    salesCount: 190
  }
];
