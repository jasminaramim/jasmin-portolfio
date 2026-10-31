import { StoreProduct, StoreSettings } from '../types';

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: "Jasmin's Digital Marketplace",
  storeLogo: "/logo.png",
  storeDescription: "Explore premium digital products and source code crafted from real client projects to accelerate your growth.",
  currency: 'USD',
  announcement: "🚀 Exclusive Source Code: Get instant access to full production-ready project archives with lifetime commercial license!",
  bkash: {
    number: "+8801613475871",
    qrImage: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=400&auto=format&fit=crop",
    instructions: "Send Money or Make Payment to our bKash number +8801613475871 (01613475871). Copy the TrxID from your SMS or bKash app and enter it below.",
    enabled: true
  },
  nagad: {
    number: "+8801613475871",
    qrImage: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=400&auto=format&fit=crop",
    instructions: "Send Money to our Nagad number +8801613475871 (01613475871) via Nagad App or USSD *167#. Enter your Transaction ID and Sender Number for instant verification.",
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
  // 1. TypeMaster
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
      "Custom timer challenges & interactive speed coaching",
      "Complete React + TypeScript source code with commercial license"
    ],
    tags: ["React", "TypeScript", "Typing", "Bangla", "EdTech", "AI Coaching"],
    rating: 5.0,
    salesCount: 48
  },
  // 2. GoWheels
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
    tags: ["React", "Next.js", "Car Rental", "Booking", "MongoDB", "Node.js"],
    rating: 4.9,
    salesCount: 36
  },
  // 3. ShekhaGhor
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
    tags: ["EdTech", "React", "Node.js", "TypeScript", "Bangla", "Courses"],
    rating: 5.0,
    salesCount: 62
  },
  // 4. Velvet
  {
    title: "Velvet - Haute Couture & Luxury Fashion E-Commerce",
    slug: "velvet-haute-couture-luxury-fashion-ecommerce",
    shopName: "Jasmin Code Studio",
    shortDescription: "Haute Couture 2026. Editorial high-fashion apparel and luxury boutique e-commerce web platform.",
    description: "Velvet is a minimalist luxury fashion storefront crafted with velvet aesthetics, pure silks, and editorial typography. Features lookbook showcases, product catalogs, collection highlights, interactive cart, and smooth responsive animations.",
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
      "High-end luxury fashion editorial design with purple dark mode accents",
      "Lookbook gallery & seasonal collection showcases",
      "Shopping cart and product detail views",
      "Full React + Node responsive codebase"
    ],
    tags: ["Fashion", "E-Commerce", "React", "Luxury", "Boutique"],
    rating: 4.9,
    salesCount: 41
  },
  // 5. Wonders Allied Health
  {
    title: "Wonders Allied Health - Clinic & Child Therapy Website",
    slug: "wonders-allied-health-clinic-therapy-website",
    shopName: "Jasmin Code Studio",
    shortDescription: "Supporting Brighter Tomorrow. Psychology & child-focused allied health clinic website with appointment booking.",
    description: "Wonders Allied Health provides a warm, practical, child-focused allied health and psychological support practice website. Features therapy service breakdowns, practitioner profiles, inquiry forms, and accessible responsive design.",
    category: "WordPress Themes",
    thumbnail: "https://www.image2url.com/r2/default/images/1791355520005-ee7d6de3-25e6-4b59-96a7-ed1848509c0e.png",
    galleryImages: [
      "https://www.image2url.com/r2/default/images/1791355520005-ee7d6de3-25e6-4b59-96a7-ed1848509c0e.png"
    ],
    demoImages: [
      "https://www.image2url.com/r2/default/images/1791355520005-ee7d6de3-25e6-4b59-96a7-ed1848509c0e.png"
    ],
    liveLink: "https://wondersalliedhealth.com.au/",
    githubRepoUrl: "https://github.com/jasminaramim/wonders-allied-health",
    sourceCodeZipUrl: "/downloads/wonders-allied-health-theme.zip",
    price: 19,
    discountPrice: 12,
    downloadableFiles: [
      { name: "wonders-allied-health-theme.zip", url: "/downloads/wonders-allied-health-theme.zip", size: "16.8 MB" }
    ],
    status: "Published",
    featured: true,
    features: [
      "Comprehensive healthcare & psychology therapy practice architecture",
      "Child & family therapy service showcase with appointment booking",
      "SEO & accessibility-optimized responsive layout",
      "WordPress & Elementor compatible custom theme files"
    ],
    tags: ["WordPress", "Healthcare", "Clinic", "Elementor", "Psychology"],
    rating: 5.0,
    salesCount: 29
  },
  // 6. GAIA GLOB
  {
    title: "GAIA GLOB - Water Infrastructure & Industrial Supply",
    slug: "gaia-glob-water-infrastructure-industrial-supply",
    shopName: "Jasmin Code Studio",
    shortDescription: "Engineering Water Infrastructure. Worldwide industrial piping systems, equipment, and B2B project supply portal.",
    description: "GAIA GLOB is an enterprise B2B website built for water infrastructure engineering and international project supply. Features technical product directories, equipment catalog, global delivery specifications, and RFQ quote inquiry forms.",
    category: "WordPress Themes",
    thumbnail: "https://www.image2url.com/r2/default/images/1791355413848-68d691a8-79d8-48ef-b1c9-52e5c853785b.png",
    galleryImages: [
      "https://www.image2url.com/r2/default/images/1791355413848-68d691a8-79d8-48ef-b1c9-52e5c853785b.png"
    ],
    demoImages: [
      "https://www.image2url.com/r2/default/images/1791355413848-68d691a8-79d8-48ef-b1c9-52e5c853785b.png"
    ],
    liveLink: "https://gaiaglob.com/",
    githubRepoUrl: "https://github.com/jasminaramim/gaia-glob",
    sourceCodeZipUrl: "/downloads/gaia-glob-industrial-theme.zip",
    price: 22,
    discountPrice: 14,
    downloadableFiles: [
      { name: "gaia-glob-industrial-theme.zip", url: "/downloads/gaia-glob-industrial-theme.zip", size: "19.3 MB" }
    ],
    status: "Published",
    featured: true,
    features: [
      "Enterprise industrial piping and water equipment catalog",
      "Global project supply & B2B RFQ quotation request workflow",
      "Clean industrial corporate aesthetics with responsive navigation",
      "WordPress architecture built for international enterprises"
    ],
    tags: ["WordPress", "Industrial", "Engineering", "B2B", "Infrastructure"],
    rating: 4.9,
    salesCount: 33
  }
];
