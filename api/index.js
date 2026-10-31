// server.ts
import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import path from "path";
import dotenv from "dotenv";
import crypto from "crypto";
import fs from "fs";
import nodemailer from "nodemailer";

// data/defaultStoreProducts.ts
var DEFAULT_STORE_SETTINGS = {
  storeName: "Jasmin's Digital Marketplace",
  storeLogo: "/logo.png",
  storeDescription: "Explore premium digital products and source code crafted from real client projects to accelerate your growth.",
  currency: "USD",
  announcement: "\u{1F680} Exclusive Source Code: Get instant access to full production-ready project archives with lifetime commercial license!",
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
    provider: "sslcommerz",
    isLive: false,
    storeId: "testbox_jasmin",
    storePassword: "test_password_placeholder"
  }
};
var DEFAULT_STORE_PRODUCTS = [
  // 1. TypeMaster
  {
    title: "TypeMaster - Bangla & English Touch Typing Platform",
    slug: "typemaster-bangla-english-touch-typing-platform",
    shopName: "Jasmin Code Studio",
    shortDescription: "Interactive Bangla (\u09AC\u09BE\u0982\u09B2\u09BE) & English touch typing platform with real-time WPM, accuracy metrics, and AI typing speed coaching.",
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
      "Bilingual Bangla (\u09AC\u09BE\u0982\u09B2\u09BE) & English touch typing modes",
      "Live real-time WPM & error accuracy scoring engine",
      "Custom timer challenges & interactive speed coaching",
      "Complete React + TypeScript source code with commercial license"
    ],
    tags: ["React", "TypeScript", "Typing", "Bangla", "EdTech", "AI Coaching"],
    rating: 5,
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
    title: "ShekhaGhor - Video Learning & EdTech Platform (\u09B6\u09C7\u0996\u09BE\u0998\u09B0)",
    slug: "shekhaghor-video-learning-edtech-platform",
    shopName: "Jasmin Code Studio",
    shortDescription: "\u09B6\u09C7\u0996\u09BE\u09B0 \u09A8\u09A4\u09C1\u09A8 \u09A0\u09BF\u0995\u09BE\u09A8\u09BE\u0964 Modern video-based learning and tutorial discovery platform for tech, coding, and career growth.",
    description: "ShekhaGhor (\u09B6\u09C7\u0996\u09BE\u0998\u09B0) is a high-performance educational platform designed to curate, organize, and stream technology, programming, and career skill video courses. Features category filters, video player modals, bookmarking, and sleek dark UI.",
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
    rating: 5,
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
    rating: 5,
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

// server.ts
dotenv.config();
var app = express();
var PORT = 3e3;
var JWT_SECRET = process.env.JWT_SECRET || "jasmin_premium_secret_key_123";
var CUSTOMER_JWT_SECRET = process.env.CUSTOMER_JWT_SECRET || "jasmin_store_customer_secret_key_456";
var isVercel = Boolean(process.env.VERCEL);
var uploadsDir = isVercel ? path.join("/tmp", "uploads") : path.join(process.cwd(), "public", "uploads");
var downloadsDir = isVercel ? path.join("/tmp", "downloads") : path.join(process.cwd(), "public", "downloads");
var privateDownloadsDir = isVercel ? path.join("/tmp", "private_downloads") : path.join(process.cwd(), "storage", "private_downloads");
try {
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });
  if (!fs.existsSync(privateDownloadsDir)) fs.mkdirSync(privateDownloadsDir, { recursive: true });
} catch (e) {
}
app.use("/uploads", express.static(uploadsDir));
app.use("/downloads", express.static(downloadsDir));
app.use((req, res, next) => {
  const originalUrlHeader = req.headers["x-vercel-original-url"] || req.headers["x-matched-path"] || req.headers["x-forwarded-uri"] || req.headers["x-now-route-matches"];
  if (req.query && req.query.__path) {
    const subpath = Array.isArray(req.query.__path) ? req.query.__path.join("/") : req.query.__path;
    const urlObj = new URL(req.url, "http://localhost");
    urlObj.searchParams.delete("__path");
    const remainingQuery = urlObj.searchParams.toString();
    req.url = `/api/${subpath}${remainingQuery ? "?" + remainingQuery : ""}`;
  } else if ((req.url === "/api/server" || req.url === "/api/index" || req.url === "/api" || req.url.startsWith("/api/server?") || req.url.startsWith("/api/index?")) && originalUrlHeader && originalUrlHeader.startsWith("/api")) {
    req.url = originalUrlHeader;
  }
  next();
});
var uri = process.env.MONGODB_URI || "mongodb://Jasmin:Ele%2FSq9%3FuA.d3Z%236%21yR@cluster0-shard-00-00.ssmpl.mongodb.net:27017,cluster0-shard-00-01.ssmpl.mongodb.net:27017,cluster0-shard-00-02.ssmpl.mongodb.net:27017/?ssl=true&authSource=admin&replicaSet=atlas-islggq-shard-0&retryWrites=true&w=majority";
var client = null;
var db = null;
async function seedStoreData() {
  try {
    if (!db) return;
    const productsCount = await db.collection("store_products").countDocuments();
    if (productsCount === 0) {
      console.log("Seeding default store products into MongoDB...");
      const seeded = DEFAULT_STORE_PRODUCTS.map((p, index) => ({
        ...p,
        createdAt: new Date(Date.now() - index * 864e5),
        updatedAt: /* @__PURE__ */ new Date()
      }));
      await db.collection("store_products").insertMany(seeded);
      console.log(`Seeded ${seeded.length} store products.`);
    }
    const settingsCount = await db.collection("store_settings").countDocuments();
    if (settingsCount === 0) {
      console.log("Seeding default store settings into MongoDB...");
      await db.collection("store_settings").insertOne({
        ...DEFAULT_STORE_SETTINGS,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      });
      console.log("Seeded default store settings.");
    } else {
      await db.collection("store_settings").updateOne(
        {},
        {
          $set: {
            "bkash.number": "+8801613475871",
            "bkash.instructions": "Send Money or Make Payment to our bKash number +8801613475871 (01613475871). Copy the TrxID from your SMS or bKash app and enter it below.",
            "nagad.number": "+8801613475871",
            "nagad.instructions": "Send Money to our Nagad number +8801613475871 (01613475871) via Nagad App or USSD *167#. Enter your Transaction ID and Sender Number for instant verification."
          }
        }
      );
    }
  } catch (err) {
    console.error("Error during store data seeding:", err);
  }
}
function isClientConnected() {
  if (!client) return false;
  try {
    const topology = client.topology;
    if (!topology) return false;
    if (typeof topology.isDestroyed === "function" && topology.isDestroyed()) return false;
    if (typeof topology.isConnected === "function" && !topology.isConnected()) return false;
    const state = topology.s?.state;
    if (state === "destroyed" || state === "closing" || state === "closed") return false;
    return true;
  } catch (e) {
    return false;
  }
}
async function connectDB() {
  if (client && db && isClientConnected()) {
    return db;
  }
  if (client) {
    try {
      await client.close();
    } catch (e) {
    }
    client = null;
    db = null;
  }
  try {
    client = new MongoClient(uri, {
      connectTimeoutMS: 5e3,
      serverSelectionTimeoutMS: 5e3,
      maxPoolSize: 10,
      minPoolSize: 0,
      maxIdleTimeMS: 15e3,
      socketTimeoutMS: 2e4
    });
    await client.connect();
    db = client.db("portfolio");
    console.log("Connected to MongoDB");
    seedStoreData().catch((err) => console.error("Error during store data seeding:", err));
    return db;
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    client = null;
    db = null;
    return null;
  }
}
app.use(async (req, res, next) => {
  if (req.path.startsWith("/api") || req.url.startsWith("/api")) {
    try {
      await connectDB();
    } catch (e) {
      console.error("Middleware DB connect error:", e);
    }
  }
  next();
});
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}
function verifyPassword(password, salt, originalHash) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return hash === originalHash;
}
var authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const bearerToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  const token = req.cookies?.token || bearerToken;
  if (!token) return res.status(401).json({ error: "Access denied" });
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid token" });
  }
};
var authenticateCustomerToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1] || req.cookies.customer_token;
  if (!token) return res.status(401).json({ error: "Authentication required" });
  try {
    const decoded = jwt.verify(token, CUSTOMER_JWT_SECRET);
    req.customer = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired session" });
  }
};
async function sendOrderCodeEmail(customerEmail, customerName, orderNumber, items, githubRepoUrl, customZipUrl, adminNotes, downloadToken, downloadInstructions) {
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpUser = process.env.SMTP_USER || "jasminaramim2005@gmail.com";
  const smtpPass = process.env.SMTP_PASS;
  const productTitles = items && items.length > 0 ? items.map((i) => i.title).join(", ") : "Digital Products";
  const secureDownloadUrl = customZipUrl ? customZipUrl.startsWith("http") ? customZipUrl : `http://127.0.0.1:3000${customZipUrl}` : `http://127.0.0.1:3000/api/store/download/${orderNumber}/0?token=${downloadToken || ""}`;
  const textBody = `Hello,

Thank you for purchasing from our Digital Store!

Your payment has been verified and approved by our team.

Your purchased digital product is now ready.

Product: ${productTitles}
Order Number: ${orderNumber}

Download Your Product:
${secureDownloadUrl}

${downloadInstructions ? `Installation Instructions:
${downloadInstructions}

` : ""}${githubRepoUrl ? `GitHub Repository Link:
${githubRepoUrl}

` : ""}Thank you for choosing our store.

Best regards,
Digital Store Team
WhatsApp Support: +8801915996145`;
  const html = `
    <div style="font-family: Arial, sans-serif; background: #07070a; color: #ffffff; padding: 32px; border-radius: 16px; max-width: 620px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.1);">
      <div style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 25px;">
        <h1 style="color: #a855f7; font-size: 24px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Digital Store</h1>
        <p style="color: #9ca3af; font-size: 12px; margin: 6px 0 0; text-transform: uppercase; letter-spacing: 2px;">Official Order Delivery & License Confirmation</p>
      </div>

      <div style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <h2 style="color: #10b981; font-size: 16px; margin: 0 0 10px; font-weight: 800;">\u2714 Payment Verified & Approved</h2>
        <p style="color: #e5e7eb; font-size: 14px; line-height: 1.6; margin: 0 0 8px;">Hello,</p>
        <p style="color: #d1d5db; font-size: 13px; line-height: 1.6; margin: 0 0 8px;">Thank you for purchasing from our Digital Store!</p>
        <p style="color: #d1d5db; font-size: 13px; line-height: 1.6; margin: 0 0 8px;">Your payment has been verified and approved by our team.</p>
        <p style="color: #10b981; font-size: 13px; font-weight: bold; line-height: 1.6; margin: 0;">Your purchased digital product is now ready.</p>
      </div>

      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px; color: #9ca3af; font-size: 12px; text-transform: uppercase; font-weight: bold;">Order Reference:</p>
        <p style="margin: 0 0 16px; color: #ffffff; font-size: 15px; font-weight: bold; font-family: monospace;">Order Number: ${orderNumber}</p>

        <p style="margin: 0 0 8px; color: #9ca3af; font-size: 12px; text-transform: uppercase; font-weight: bold;">Purchased Product(s):</p>
        <p style="margin: 0 0 20px; color: #c084fc; font-size: 16px; font-weight: bold;">${productTitles}</p>

        <div style="margin-bottom: 20px; padding: 18px; background: rgba(0,0,0,0.6); border-radius: 12px; border: 1px solid rgba(168,85,247,0.3); text-align: center;">
          <span style="color: #9ca3af; font-size: 11px; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 12px;">Download Your Product:</span>
          <a href="${secureDownloadUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #a855f7, #7e22ce); color: #ffffff; padding: 12px 28px; border-radius: 10px; font-weight: 800; font-size: 13px; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(168,85,247,0.4);">Download Secure ZIP</a>
          <span style="display: block; color: #6b7280; font-size: 10px; margin-top: 8px;">Single Commercial License &middot; Secure Token Protected</span>
        </div>

        ${githubRepoUrl ? `
          <div style="margin-bottom: 16px; padding: 14px; background: rgba(0,0,0,0.4); border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);">
            <span style="color: #c084fc; font-size: 11px; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 4px;">GitHub Source Code Repository:</span>
            <a href="${githubRepoUrl}" target="_blank" style="color: #a855f7; font-size: 13px; font-family: monospace; text-decoration: underline; word-break: break-all;">${githubRepoUrl}</a>
          </div>
        ` : ""}

        ${downloadInstructions ? `
          <div style="margin-bottom: 16px; padding: 14px; background: rgba(0,0,0,0.4); border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);">
            <span style="color: #9ca3af; font-size: 11px; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 6px;">Installation & Setup Instructions:</span>
            <pre style="color: #d1d5db; font-size: 11px; margin: 0; white-space: pre-wrap; font-family: monospace; line-height: 1.5;">${downloadInstructions}</pre>
          </div>
        ` : ""}

        ${adminNotes ? `
          <div style="padding: 12px; background: rgba(168,85,247,0.1); border-radius: 8px; border: 1px solid rgba(168,85,247,0.2); margin-top: 12px;">
            <span style="color: #c084fc; font-size: 11px; font-weight: bold; text-transform: uppercase; display: block; margin-bottom: 4px;">Admin Note:</span>
            <p style="color: #e5e7eb; font-size: 12px; margin: 0; line-height: 1.5;">${adminNotes}</p>
          </div>
        ` : ""}
      </div>

      <div style="text-align: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0 0 6px;">Thank you for choosing our store.</p>
        <p style="color: #ffffff; font-weight: bold; font-size: 12px; margin: 0 0 10px;">Best regards,<br />Digital Store Team</p>
        <p style="color: #6b7280; font-size: 11px; margin: 0;">
          Need support or custom setup? WhatsApp: <a href="https://wa.me/8801915996145" style="color: #ef4444; font-weight: bold;">+880 1915-996145</a>
        </p>
      </div>
    </div>
  `;
  const subject = "Your Digital Product Is Ready \u2013 Order Confirmed!";
  if (smtpPass && smtpUser) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: 465,
        secure: true,
        auth: { user: smtpUser, pass: smtpPass }
      });
      await transporter.sendMail({
        from: `"Digital Store" <${smtpUser}>`,
        to: customerEmail,
        subject,
        text: textBody,
        html
      });
      return { success: true, log: `Email sent to ${customerEmail}`, html, text: textBody };
    } catch (err) {
      console.error("Nodemailer error:", err);
      return { success: false, log: `SMTP error: ${err.message}`, html, text: textBody };
    }
  } else {
    console.log(`[Email Dispatched] Subject: "${subject}" | To: ${customerEmail} | Order: #${orderNumber}`);
    return {
      success: true,
      log: `Email generated for ${customerEmail}. Subject: "${subject}" (Add SMTP_USER and SMTP_PASS in .env for live dispatch)`,
      html,
      text: textBody
    };
  }
}
async function sendOrderReceivedEmail(customerEmail, customerName, orderNumber, totalAmount, paymentMethod) {
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpUser = process.env.SMTP_USER || "jasminaramim2005@gmail.com";
  const smtpPass = process.env.SMTP_PASS;
  const html = `
    <div style="font-family: Arial, sans-serif; background: #07070a; color: #ffffff; padding: 32px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.1);">
      <h2 style="color: #ef4444; margin: 0 0 10px;">Order Received \u2013 Payment Pending Verification</h2>
      <p style="color: #d1d5db; font-size: 14px;">Hello ${customerName},</p>
      <p style="color: #d1d5db; font-size: 13px; line-height: 1.6;">Thank you for ordering from Jasmin Digital Store! We have received your order <strong>#${orderNumber}</strong> for $${totalAmount} via ${paymentMethod.toUpperCase()}.</p>
      <div style="background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3); border-radius: 10px; padding: 16px; margin: 20px 0;">
        <strong style="color: #f59e0b; display: block; margin-bottom: 4px;">Status: Pending Verification</strong>
        <span style="color: #e5e7eb; font-size: 12px;">Admin will verify your payment and approve your order. Your secure ZIP download link and source code repository will be sent as soon as verified!</span>
      </div>
      <p style="color: #6b7280; font-size: 11px;">Questions? WhatsApp: +8801915996145</p>
    </div>
  `;
  if (smtpPass && smtpUser) {
    try {
      const transporter = nodemailer.createTransport({ host: smtpHost, port: 465, secure: true, auth: { user: smtpUser, pass: smtpPass } });
      await transporter.sendMail({ from: `"Digital Store" <${smtpUser}>`, to: customerEmail, subject: `Order Received \u2013 Pending Verification (#${orderNumber})`, html });
    } catch (e) {
      console.error("Order received email error:", e);
    }
  }
}
async function sendPaymentRejectedEmail(customerEmail, customerName, orderNumber, reason) {
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpUser = process.env.SMTP_USER || "jasminaramim2005@gmail.com";
  const smtpPass = process.env.SMTP_PASS;
  const html = `
    <div style="font-family: Arial, sans-serif; background: #07070a; color: #ffffff; padding: 32px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.1);">
      <h2 style="color: #ef4444; margin: 0 0 10px;">Payment Verification Update (#${orderNumber})</h2>
      <p style="color: #d1d5db; font-size: 14px;">Hello ${customerName},</p>
      <p style="color: #d1d5db; font-size: 13px; line-height: 1.6;">Your submitted payment for order <strong>#${orderNumber}</strong> could not be verified by our admin team.</p>
      ${reason ? `<div style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 10px; padding: 14px; margin: 16px 0; color: #fca5a5; font-size: 12px;"><strong>Reason:</strong> ${reason}</div>` : ""}
      <p style="color: #d1d5db; font-size: 13px;">If you have sent money or have the correct TrxID, please contact us directly on WhatsApp to resolve this: <a href="https://wa.me/8801915996145" style="color: #ef4444; font-weight: bold;">+880 1915-996145</a></p>
    </div>
  `;
  if (smtpPass && smtpUser) {
    try {
      const transporter = nodemailer.createTransport({ host: smtpHost, port: 465, secure: true, auth: { user: smtpUser, pass: smtpPass } });
      await transporter.sendMail({ from: `"Digital Store" <${smtpUser}>`, to: customerEmail, subject: `Payment Verification Update (#${orderNumber})`, html });
    } catch (e) {
      console.error("Payment rejected email error:", e);
    }
  }
}
app.post("/api/store/admin/upload-zip", authenticateToken, async (req, res) => {
  try {
    const fileData = req.body.fileData || req.body.data;
    const fileName = req.body.fileName || req.body.filename;
    const { productCode, version } = req.body;
    if (!fileData || !fileName) {
      return res.status(400).json({ error: "File data and filename are required." });
    }
    if (!fileName.toLowerCase().endsWith(".zip") && !fileName.toLowerCase().endsWith(".tar.gz")) {
      return res.status(400).json({ error: "Only .zip or .tar.gz archives are permitted for product source code." });
    }
    const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const base64Data = matches ? matches[2] : fileData;
    const buffer = Buffer.from(base64Data, "base64");
    if (buffer.length > 100 * 1024 * 1024) {
      return res.status(400).json({ error: "File size exceeds 100MB limit." });
    }
    const cleanBase = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueName = `${productCode || "prod"}-${Date.now()}-${cleanBase}`;
    const filePath = path.join(privateDownloadsDir, uniqueName);
    fs.writeFileSync(filePath, buffer);
    const sizeFormatted = buffer.length > 1024 * 1024 ? (buffer.length / (1024 * 1024)).toFixed(1) + " MB" : Math.round(buffer.length / 1024) + " KB";
    res.json({
      success: true,
      fileName: cleanBase,
      storageReference: `/downloads/private/${uniqueName}`,
      size: sizeFormatted,
      sizeBytes: buffer.length,
      uploadedAt: /* @__PURE__ */ new Date()
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to upload ZIP file: " + err.message });
  }
});
app.post(["/api/login", "/api/auth/login"], async (req, res) => {
  const { username, password } = req.body;
  let targetUsername = "jasmin1142005";
  let targetPassword = "password123";
  try {
    if (db) {
      const siteSettings = await db.collection("settings").findOne({});
      if (siteSettings && siteSettings.adminUsername) {
        targetUsername = siteSettings.adminUsername;
        if (siteSettings.adminPassword) {
          targetPassword = siteSettings.adminPassword;
        }
      }
    }
  } catch (e) {
    console.error("Failed to load settings credentials from db, using defaults", e);
  }
  if (username === targetUsername && password === targetPassword) {
    const token = jwt.sign({ username, role: "admin" }, JWT_SECRET, { expiresIn: "24h" });
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
    return res.json({ success: true, token, message: "Logged in successfully" });
  }
  res.status(401).json({ error: "Invalid credentials" });
});
app.post("/api/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
});
app.get("/api/auth/check", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.json({ authenticated: false });
  try {
    jwt.verify(token, JWT_SECRET);
    res.json({ authenticated: true });
  } catch (e) {
    res.json({ authenticated: false });
  }
});
app.get("/api/settings", async (req, res) => {
  try {
    if (!db) return res.json({});
    const settings = await db.collection("settings").findOne({});
    res.json(settings || {
      siteTitle: "JASMIN | Frontend & MERN Stack Developer",
      brandLetter: "J",
      metaDesc: "MERN stack and premium WordPress developer showcasing outstanding case studies and client projects.",
      analyticsId: "G-XXXXXXXXXX",
      adminUsername: "jasmin1142005"
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});
app.post("/api/settings", authenticateToken, async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" });
    const { _id, ...settingsData } = req.body;
    if (!settingsData.adminPassword) {
      const current = await db.collection("settings").findOne({});
      settingsData.adminPassword = current?.adminPassword || "password123";
    }
    const result = await db.collection("settings").updateOne(
      {},
      { $set: settingsData },
      { upsert: true }
    );
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: "Failed to update settings" });
  }
});
app.post("/api/settings/reset-db", authenticateToken, async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" });
    const { exec } = await import("child_process");
    exec("npx tsx seed.ts", (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to execute seed script: " + err.message });
      }
      res.json({ success: true });
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to reset database: " + err.message });
  }
});
var createCRUDRoutes = (collectionName) => {
  app.get(`/api/${collectionName}`, async (req, res) => {
    try {
      const activeDb = await connectDB();
      if (!activeDb) return res.json([]);
      const data = await activeDb.collection(collectionName).find().toArray();
      res.json(data);
    } catch (err) {
      console.error(`Failed to fetch ${collectionName}:`, err.message);
      client = null;
      db = null;
      res.json([]);
    }
  });
  app.get(`/api/${collectionName}/:id`, async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: "Database not connected" });
      let query = {};
      try {
        query = { _id: new ObjectId(req.params.id) };
      } catch (e) {
        query = { id: req.params.id };
      }
      const data = await db.collection(collectionName).findOne(query);
      if (!data) return res.status(404).json({ error: "Not found" });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: `Failed to fetch ${collectionName} by ID` });
    }
  });
  app.post(`/api/${collectionName}`, authenticateToken, async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: "Database not connected" });
      const result = await db.collection(collectionName).insertOne(req.body);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: `Failed to create ${collectionName}` });
    }
  });
  app.put(`/api/${collectionName}/:id`, authenticateToken, async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: "Database not connected" });
      const { _id, ...updateData } = req.body;
      const result = await db.collection(collectionName).updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: updateData }
      );
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: `Failed to update ${collectionName}` });
    }
  });
  app.delete(`/api/${collectionName}/:id`, authenticateToken, async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: "Database not connected" });
      const result = await db.collection(collectionName).deleteOne({ _id: new ObjectId(req.params.id) });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: `Failed to delete ${collectionName}` });
    }
  });
};
createCRUDRoutes("projects");
createCRUDRoutes("services");
createCRUDRoutes("skills");
createCRUDRoutes("reviews");
createCRUDRoutes("experience");
createCRUDRoutes("education");
createCRUDRoutes("stats");
createCRUDRoutes("techcode");
createCRUDRoutes("gallery");
app.get("/api/hero", async (req, res) => {
  try {
    if (!db) return res.json({});
    const hero = await db.collection("hero").findOne({});
    res.json(hero || {});
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch hero content" });
  }
});
app.post("/api/hero", authenticateToken, async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" });
    const { _id, ...heroData } = req.body;
    const result = await db.collection("hero").updateOne({}, { $set: heroData }, { upsert: true });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to update hero content" });
  }
});
app.get("/api/profile", async (req, res) => {
  try {
    if (!db) return res.json({});
    const profile = await db.collection("profile").findOne({});
    res.json(profile || {});
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});
app.post("/api/profile", authenticateToken, async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" });
    const { _id, ...profileData } = req.body;
    const result = await db.collection("profile").updateOne({}, { $set: profileData }, { upsert: true });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});
function generateSlug(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
app.post("/api/store/upload", async (req, res) => {
  try {
    const { data, filename } = req.body;
    if (!data || !filename) {
      return res.status(400).json({ error: "Data URL and filename are required." });
    }
    const matches = data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: "Invalid base64 payload." });
    }
    const buffer = Buffer.from(matches[2], "base64");
    const sanitizedFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const targetFilePath = path.join(uploadsDir, sanitizedFilename);
    await fs.promises.writeFile(targetFilePath, buffer);
    res.json({
      success: true,
      url: `/uploads/${sanitizedFilename}`,
      filename: sanitizedFilename
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "File upload failed: " + err.message });
  }
});
app.get("/api/store/settings", async (req, res) => {
  try {
    const activeDb = await connectDB();
    if (!activeDb) return res.json(DEFAULT_STORE_SETTINGS);
    const settings = await activeDb.collection("store_settings").findOne({});
    if (!settings) return res.json(DEFAULT_STORE_SETTINGS);
    const { gateway, ...safeSettings } = settings;
    const safeGateway = gateway ? {
      provider: gateway.provider,
      isLive: gateway.isLive,
      storeId: gateway.storeId
    } : DEFAULT_STORE_SETTINGS.gateway;
    res.json({
      ...safeSettings,
      gateway: safeGateway
    });
  } catch (err) {
    console.error("Failed to fetch store settings:", err.message);
    client = null;
    db = null;
    res.json(DEFAULT_STORE_SETTINGS);
  }
});
app.get("/api/store/admin/settings", authenticateToken, async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" });
    const settings = await db.collection("store_settings").findOne({});
    res.json(settings || DEFAULT_STORE_SETTINGS);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch admin store settings" });
  }
});
app.post("/api/store/admin/settings", authenticateToken, async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" });
    const { _id, ...settingsData } = req.body;
    settingsData.updatedAt = /* @__PURE__ */ new Date();
    const result = await db.collection("store_settings").updateOne(
      {},
      { $set: settingsData },
      { upsert: true }
    );
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: "Failed to update store settings: " + err.message });
  }
});
app.post("/api/store/auth/register", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" });
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await db.collection("store_users").findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ error: "An account with this email already exists." });
    }
    const { salt, hash } = hashPassword(password);
    const newUser = {
      name: name.trim(),
      email: normalizedEmail,
      phone: phone || "",
      passwordSalt: salt,
      passwordHash: hash,
      role: "user",
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    const insertResult = await db.collection("store_users").insertOne(newUser);
    const userId = insertResult.insertedId.toString();
    const token = jwt.sign(
      { id: userId, email: normalizedEmail, name: newUser.name, role: "user" },
      CUSTOMER_JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.cookie("customer_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1e3
    });
    res.json({
      success: true,
      user: { id: userId, name: newUser.name, email: normalizedEmail, role: "user", phone: newUser.phone },
      token
    });
  } catch (err) {
    res.status(500).json({ error: "Registration failed: " + err.message });
  }
});
app.post("/api/store/auth/login", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" });
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const user = await db.collection("store_users").findOne({ email: normalizedEmail });
    if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    const userId = user._id.toString();
    const token = jwt.sign(
      { id: userId, email: user.email, name: user.name, role: user.role || "user" },
      CUSTOMER_JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.cookie("customer_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1e3
    });
    res.json({
      success: true,
      user: { id: userId, name: user.name, email: user.email, role: user.role || "user", phone: user.phone },
      token
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed: " + err.message });
  }
});
app.get("/api/store/auth/me", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1] || req.cookies.customer_token;
  if (!token) return res.json({ authenticated: false });
  try {
    const decoded = jwt.verify(token, CUSTOMER_JWT_SECRET);
    res.json({ authenticated: true, user: decoded });
  } catch (err) {
    res.json({ authenticated: false });
  }
});
app.post("/api/store/auth/logout", (req, res) => {
  res.clearCookie("customer_token");
  res.json({ success: true, message: "Logged out from store account" });
});
app.get("/api/store/products", async (req, res) => {
  try {
    const activeDb = await connectDB();
    if (!activeDb) return res.json(DEFAULT_STORE_PRODUCTS);
    const { category, search, featured, status, sort } = req.query;
    const query = {};
    if (status) {
      query.status = status;
    } else {
      query.status = { $ne: "Draft" };
    }
    if (category && category !== "All") {
      query.category = category;
    }
    if (featured === "true") {
      query.featured = true;
    }
    if (search && typeof search === "string" && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [
        { title: regex },
        { shortDescription: regex },
        { description: regex },
        { tags: regex }
      ];
    }
    let sortOption = { createdAt: -1 };
    if (sort === "price-low") sortOption = { price: 1 };
    if (sort === "price-high") sortOption = { price: -1 };
    if (sort === "popular") sortOption = { salesCount: -1 };
    const products = await activeDb.collection("store_products").find(query).sort(sortOption).toArray();
    res.json(products.length > 0 ? products : DEFAULT_STORE_PRODUCTS);
  } catch (err) {
    console.error("Failed to fetch store products:", err.message);
    client = null;
    db = null;
    res.json(DEFAULT_STORE_PRODUCTS);
  }
});
app.get("/api/store/products/:slugOrId", async (req, res) => {
  try {
    const activeDb = await connectDB();
    const { slugOrId } = req.params;
    if (!activeDb) {
      const fallback = DEFAULT_STORE_PRODUCTS.find((p) => p.slug === slugOrId || p._id === slugOrId);
      return fallback ? res.json(fallback) : res.status(404).json({ error: "Product not found" });
    }
    let product = null;
    if (ObjectId.isValid(slugOrId)) {
      product = await activeDb.collection("store_products").findOne({ _id: new ObjectId(slugOrId) });
    }
    if (!product) {
      product = await activeDb.collection("store_products").findOne({ slug: slugOrId });
    }
    if (!product) {
      const fallback = DEFAULT_STORE_PRODUCTS.find((p) => p.slug === slugOrId);
      if (fallback) return res.json(fallback);
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    console.error("Failed to fetch product details:", err.message);
    client = null;
    db = null;
    const fallback = DEFAULT_STORE_PRODUCTS.find((p) => p.slug === req.params.slugOrId);
    if (fallback) return res.json(fallback);
    res.status(500).json({ error: "Failed to fetch product details: " + err.message });
  }
});
app.post("/api/store/admin/products", authenticateToken, async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" });
    const productData = req.body;
    if (!productData.title || productData.price === void 0) {
      return res.status(400).json({ error: "Title and price are required." });
    }
    const slug = productData.slug ? generateSlug(productData.slug) : generateSlug(productData.title);
    const existingSlug = await db.collection("store_products").findOne({ slug });
    const finalSlug = existingSlug ? `${slug}-${Date.now().toString().slice(-4)}` : slug;
    const newProduct = {
      ...productData,
      slug: finalSlug,
      price: Number(productData.price) || 0,
      discountPrice: productData.discountPrice ? Number(productData.discountPrice) : void 0,
      status: productData.status || "Published",
      featured: Boolean(productData.featured),
      salesCount: Number(productData.salesCount) || 0,
      rating: Number(productData.rating) || 5,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    const result = await db.collection("store_products").insertOne(newProduct);
    res.json({ success: true, result, product: { ...newProduct, _id: result.insertedId } });
  } catch (err) {
    res.status(500).json({ error: "Failed to create product: " + err.message });
  }
});
app.put("/api/store/admin/products/:id", authenticateToken, async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" });
    const { _id, ...updateData } = req.body;
    updateData.updatedAt = /* @__PURE__ */ new Date();
    if (updateData.price !== void 0) updateData.price = Number(updateData.price);
    if (updateData.discountPrice !== void 0) {
      updateData.discountPrice = updateData.discountPrice ? Number(updateData.discountPrice) : void 0;
    }
    const result = await db.collection("store_products").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: "Failed to update product: " + err.message });
  }
});
app.delete("/api/store/admin/products/:id", authenticateToken, async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" });
    const result = await db.collection("store_products").deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product: " + err.message });
  }
});
app.post(["/api/store/admin/upload-image", "/api/store/upload"], authenticateToken, async (req, res) => {
  try {
    const fileName = req.body.fileName || req.body.filename || "image.png";
    const fileData = req.body.fileData || req.body.data;
    if (!fileData) {
      return res.status(400).json({ error: "fileData or data is required." });
    }
    const cleanBase64 = fileData.includes(",") ? fileData.split(",")[1] : fileData;
    const buffer = Buffer.from(cleanBase64, "base64");
    const ext = path.extname(fileName).toLowerCase() || ".png";
    const uniqueFileName = `img-${Date.now()}-${Math.floor(Math.random() * 1e3)}${ext}`;
    const destinationPath = path.join(uploadsDir, uniqueFileName);
    fs.writeFileSync(destinationPath, buffer);
    res.json({
      success: true,
      url: `/uploads/${uniqueFileName}`
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to upload image: " + err.message });
  }
});
app.post("/api/store/orders", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" });
    const { customer, items, paymentMethod, paymentDetails, currency } = req.body;
    if (!customer || !customer.email || !customer.name) {
      return res.status(400).json({ error: "Customer name and email are required." });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty." });
    }
    let subtotal = 0;
    const enrichedItems = await Promise.all(items.map(async (item) => {
      const price = Number(item.price) || 0;
      subtotal += price * (Number(item.quantity) || 1);
      let githubRepoUrl = item.githubRepoUrl || "";
      let sourceCodeZipUrl = item.sourceCodeZipUrl || "";
      let downloadableFiles = item.downloadableFiles || [];
      if ((!githubRepoUrl || !downloadableFiles.length) && db) {
        const prod = await db.collection("store_products").findOne({
          $or: [
            { slug: item.slug },
            { title: item.title }
          ]
        });
        if (prod) {
          if (!githubRepoUrl && prod.githubRepoUrl) githubRepoUrl = prod.githubRepoUrl;
          if (!sourceCodeZipUrl && prod.sourceCodeZipUrl) sourceCodeZipUrl = prod.sourceCodeZipUrl;
          if (!downloadableFiles.length && prod.downloadableFiles) {
            downloadableFiles = prod.downloadableFiles;
          }
        }
      }
      return {
        productId: item.productId || item._id,
        title: item.title,
        slug: item.slug,
        price,
        thumbnail: item.thumbnail,
        downloadableFiles,
        githubRepoUrl,
        sourceCodeZipUrl
      };
    }));
    const discount = 0;
    const totalAmount = subtotal - discount;
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 899 + 100)}`;
    const downloadToken = crypto.randomBytes(24).toString("hex");
    let userId = "";
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1] || req.cookies.customer_token;
    if (token) {
      try {
        const decoded = jwt.verify(token, CUSTOMER_JWT_SECRET);
        userId = decoded.id;
      } catch (e) {
      }
    }
    const isManualPayment = ["bkash", "nagad", "rocket"].includes(paymentMethod);
    const newOrder = {
      orderNumber,
      userId: userId || null,
      customer: {
        name: customer.name.trim(),
        email: customer.email.toLowerCase().trim(),
        phone: customer.phone ? customer.phone.trim() : "",
        notes: customer.notes || ""
      },
      items: enrichedItems,
      subtotal,
      discount,
      totalAmount,
      currency: currency || "USD",
      paymentMethod,
      paymentStatus: isManualPayment ? "Pending Verification" : "Pending Payment",
      paymentDetails: {
        senderNumber: paymentDetails?.senderNumber || "",
        transactionId: paymentDetails?.transactionId || "",
        screenshotUrl: paymentDetails?.screenshotUrl || "",
        gatewayResponse: paymentDetails?.gatewayResponse || null
      },
      orderStatus: isManualPayment ? "Pending Verification" : "Pending Payment",
      downloadToken,
      downloadAccess: false,
      downloadCount: 0,
      downloadLimit: 10,
      tokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3),
      downloadHistory: [],
      deliveryHistory: [],
      verificationLogs: [],
      adminNotes: "",
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    const insertResult = await db.collection("store_orders").insertOne(newOrder);
    sendOrderReceivedEmail(
      newOrder.customer.email,
      newOrder.customer.name,
      orderNumber,
      totalAmount,
      paymentMethod
    ).catch((e) => console.error("Error sending order received email:", e));
    res.json({
      success: true,
      orderNumber,
      orderId: insertResult.insertedId,
      order: { ...newOrder, _id: insertResult.insertedId }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to place order: " + err.message });
  }
});
app.get("/api/store/orders/:orderNumber", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" });
    const order = await db.collection("store_orders").findOne({ orderNumber: req.params.orderNumber });
    if (!order) return res.status(404).json({ error: "Order not found" });
    const sanitizedItems = order.items.map((item) => ({
      productId: item.productId,
      title: item.title,
      slug: item.slug,
      price: item.price,
      thumbnail: item.thumbnail,
      downloadableFiles: order.downloadAccess ? item.downloadableFiles : [],
      githubRepoUrl: order.downloadAccess ? item.githubRepoUrl || order.deliveredGithubLink : void 0
    }));
    res.json({
      ...order,
      deliveredGithubLink: order.downloadAccess ? order.deliveredGithubLink : void 0,
      deliveredZipUrl: order.downloadAccess ? order.deliveredZipUrl : void 0,
      items: sanitizedItems
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch order: " + err.message });
  }
});
app.post("/api/store/payment/init-gateway", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" });
    const { orderNumber, gatewayProvider } = req.body;
    const order = await db.collection("store_orders").findOne({ orderNumber });
    if (!order) return res.status(404).json({ error: "Order not found" });
    const settings = await db.collection("store_settings").findOne({});
    const gateway = settings?.gateway || {};
    if (!gateway.storeId || gateway.provider === "disabled") {
      return res.json({
        success: false,
        requiresConfiguration: true,
        message: "Payment Gateway requires merchant credentials. Please use bKash, Nagad, or Rocket manual payment."
      });
    }
    const isLive = Boolean(gateway.isLive);
    const sandboxUrl = `/api/store/payment/sslcommerz/simulate?orderNumber=${orderNumber}&status=success`;
    res.json({
      success: true,
      redirectUrl: sandboxUrl,
      gatewayProvider: gatewayProvider || gateway.provider
    });
  } catch (err) {
    res.status(500).json({ error: "Payment initiation error: " + err.message });
  }
});
app.get("/api/store/payment/sslcommerz/simulate", async (req, res) => {
  try {
    const { orderNumber, status } = req.query;
    if (!db || !orderNumber) return res.redirect("/");
    if (status === "success") {
      await db.collection("store_orders").updateOne(
        { orderNumber },
        {
          $set: {
            paymentStatus: "Paid",
            orderStatus: "Completed",
            downloadAccess: true,
            "paymentDetails.paidAt": /* @__PURE__ */ new Date(),
            "paymentDetails.transactionId": `TXN-GW-${Date.now()}`
          }
        }
      );
      return res.redirect(`/order-success/${orderNumber}`);
    } else {
      await db.collection("store_orders").updateOne(
        { orderNumber },
        { $set: { paymentStatus: "Failed", orderStatus: "Cancelled" } }
      );
      return res.redirect(`/order-success/${orderNumber}?error=payment_failed`);
    }
  } catch (err) {
    res.redirect("/");
  }
});
app.post("/api/store/payment/sslcommerz/success", async (req, res) => {
  try {
    const { tran_id, val_id } = req.body;
    if (db && tran_id) {
      await db.collection("store_orders").updateOne(
        { orderNumber: tran_id },
        {
          $set: {
            paymentStatus: "Paid",
            orderStatus: "Completed",
            downloadAccess: true,
            "paymentDetails.transactionId": val_id || `SSL-${Date.now()}`,
            "paymentDetails.paidAt": /* @__PURE__ */ new Date()
          }
        }
      );
      return res.redirect(`/order-success/${tran_id}`);
    }
    res.redirect("/");
  } catch (e) {
    res.redirect("/");
  }
});
app.post("/api/store/payment/sslcommerz/fail", async (req, res) => {
  const { tran_id } = req.body;
  if (db && tran_id) {
    await db.collection("store_orders").updateOne(
      { orderNumber: tran_id },
      { $set: { paymentStatus: "Failed" } }
    );
    return res.redirect(`/order-success/${tran_id}?error=payment_failed`);
  }
  res.redirect("/");
});
app.post("/api/store/payment/sslcommerz/cancel", async (req, res) => {
  res.redirect("/cart");
});
app.post("/api/store/payment/sslcommerz/ipn", async (req, res) => {
  res.json({ received: true });
});
function computeCRC32(buf) {
  let crc = ~0;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = crc >>> 1 ^ (crc & 1 ? 3988292384 : 0);
    }
  }
  return ~crc >>> 0;
}
function createZipBuffer(files) {
  const localHeaders = [];
  const centralHeaders = [];
  let offset = 0;
  for (const file of files) {
    const fileData = Buffer.isBuffer(file.content) ? file.content : Buffer.from(file.content, "utf8");
    const nameBuffer = Buffer.from(file.name, "utf8");
    const crc = computeCRC32(fileData);
    const size = fileData.length;
    const localHeader = Buffer.alloc(30 + nameBuffer.length);
    localHeader.writeUInt32LE(67324752, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(22176, 10);
    localHeader.writeUInt16LE(22176, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(size, 18);
    localHeader.writeUInt32LE(size, 22);
    localHeader.writeUInt16LE(nameBuffer.length, 26);
    localHeader.writeUInt16LE(0, 28);
    nameBuffer.copy(localHeader, 30);
    localHeaders.push(localHeader, fileData);
    const centralHeader = Buffer.alloc(46 + nameBuffer.length);
    centralHeader.writeUInt32LE(33639248, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(22176, 12);
    centralHeader.writeUInt16LE(22176, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(size, 20);
    centralHeader.writeUInt32LE(size, 24);
    centralHeader.writeUInt16LE(nameBuffer.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    nameBuffer.copy(centralHeader, 46);
    centralHeaders.push(centralHeader);
    offset += localHeader.length + fileData.length;
  }
  const centralDir = Buffer.concat(centralHeaders);
  const localData = Buffer.concat(localHeaders);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(101010256, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(centralDir.length, 12);
  eocd.writeUInt32LE(localData.length, 16);
  eocd.writeUInt16LE(0, 20);
  return Buffer.concat([localData, centralDir, eocd]);
}
app.get("/api/store/download/:orderNumber/:fileIndex", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" });
    const { orderNumber, fileIndex } = req.params;
    const order = await db.collection("store_orders").findOne({ orderNumber });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (!order.downloadAccess || order.paymentStatus !== "Paid") {
      return res.status(403).json({
        error: "Digital product downloads are locked. Payment is currently pending admin verification."
      });
    }
    const providedToken = req.query.token || req.headers["authorization"]?.replace("Bearer ", "") || req.cookies?.customer_token;
    let isAuthorized = false;
    if (providedToken && order.downloadToken && providedToken === order.downloadToken) {
      isAuthorized = true;
    } else if (providedToken) {
      try {
        const decoded = jwt.verify(providedToken, CUSTOMER_JWT_SECRET);
        if (decoded && (decoded.email === order.customer?.email || decoded.id === order.userId)) {
          isAuthorized = true;
        }
      } catch (e) {
        try {
          const adminDec = jwt.verify(providedToken, JWT_SECRET);
          if (adminDec && adminDec.role === "admin") isAuthorized = true;
        } catch (err) {
        }
      }
    }
    if (!isAuthorized) {
      return res.status(401).json({
        error: "Unauthorized download access. Valid secure expiring token or customer account required."
      });
    }
    if (order.tokenExpiry && /* @__PURE__ */ new Date() > new Date(order.tokenExpiry)) {
      return res.status(403).json({
        error: "Download link has expired (7-day validity). Please contact WhatsApp +8801915996145 to regenerate your access."
      });
    }
    const currentDownloads = Number(order.downloadCount) || 0;
    const downloadLimit = Number(order.downloadLimit) || 10;
    if (currentDownloads >= downloadLimit) {
      return res.status(403).json({
        error: `Download limit exceeded (${currentDownloads}/${downloadLimit}). Please contact WhatsApp +8801915996145 for assistance.`
      });
    }
    await db.collection("store_orders").updateOne(
      { _id: order._id },
      {
        $inc: { downloadCount: 1 },
        $push: {
          downloadHistory: {
            downloadedAt: /* @__PURE__ */ new Date(),
            ip: req.ip || req.headers["x-forwarded-for"] || "127.0.0.1",
            userAgent: req.headers["user-agent"] || "unknown"
          }
        }
      }
    );
    const allFiles = [];
    order.items.forEach((item) => {
      const prodTitle = item.title;
      const instructions = item.downloadInstructions || "";
      const license = item.productLicense || "Single Commercial License";
      const customZip = item.sourceCodeZip || item.sourceCodeZipUrl || "";
      if (Array.isArray(item.downloadableFiles) && item.downloadableFiles.length > 0) {
        item.downloadableFiles.forEach((file) => {
          allFiles.push({
            ...file,
            productTitle: prodTitle,
            downloadInstructions: instructions,
            productLicense: license,
            sourceCodeZip: customZip
          });
        });
      } else {
        allFiles.push({
          name: `${item.title.replace(/[^a-zA-Z0-9.-]/g, "_")}-source-code.zip`,
          url: customZip || "",
          productTitle: prodTitle,
          downloadInstructions: instructions,
          productLicense: license,
          sourceCodeZip: customZip
        });
      }
    });
    const index = parseInt(fileIndex, 10);
    const targetFile = allFiles[index] || allFiles[0];
    if (!targetFile) {
      return res.status(404).json({ error: "Requested download file not found" });
    }
    const fileRef = targetFile.sourceCodeZip || targetFile.url || "";
    if (fileRef.startsWith("/downloads/private/")) {
      const privName = fileRef.replace("/downloads/private/", "");
      const privPath = path.join(privateDownloadsDir, privName);
      if (fs.existsSync(privPath)) {
        return res.download(privPath, targetFile.downloadFileName || targetFile.name || `${order.orderNumber}-source-code.zip`);
      }
    }
    let localPath = "";
    if (fileRef.startsWith("/downloads/")) {
      localPath = path.join(downloadsDir, fileRef.replace("/downloads/", ""));
    } else if (fileRef.startsWith("/uploads/")) {
      localPath = path.join(uploadsDir, fileRef.replace("/uploads/", ""));
    }
    if (localPath && fs.existsSync(localPath)) {
      return res.download(localPath, targetFile.downloadFileName || targetFile.name || path.basename(localPath));
    }
    if (fileRef.startsWith("http://") || fileRef.startsWith("https://")) {
      return res.redirect(fileRef);
    }
    const zipFiles = [
      {
        name: "README-INSTALLATION.txt",
        content: `JASMIN DIGITAL STORE - PRODUCT INSTALLATION GUIDE
===================================================
Order Number: ${order.orderNumber}
Customer: ${order.customer.name} (${order.customer.email})
Product: ${targetFile.productTitle || targetFile.name}
License: ${targetFile.productLicense || "Single Commercial License"}
Delivery Date: ${(/* @__PURE__ */ new Date()).toISOString()}

INSTALLATION INSTRUCTIONS:
--------------------------
${targetFile.downloadInstructions || "1. Extract this ZIP archive into your workspace.\n2. Follow project README for build instructions (e.g. npm install && npm run dev).\n3. For WordPress themes/plugins, upload directly via WP Admin > Plugins > Add New > Upload Plugin."}

WHATSAPP SUPPORT: +8801915996145
===================================================`
      },
      {
        name: "LICENSE-COMMERCIAL.txt",
        content: `COMMERCIAL USE LICENSE AGREEMENT
=================================
Granted to: ${order.customer.name} (${order.customer.email})
Order ID: ${order.orderNumber}
Date of Verification: ${(/* @__PURE__ */ new Date()).toLocaleDateString()}

This license grants the licensee a non-exclusive, non-transferable right to use the digital product for commercial and personal client projects. Redistribution or reselling of original source files is strictly prohibited.

Jasmin Code Studio - Official License`
      },
      {
        name: "package-manifest.json",
        content: JSON.stringify({
          orderNumber: order.orderNumber,
          customer: order.customer.name,
          email: order.customer.email,
          product: targetFile.productTitle,
          verified: true,
          support: "+8801915996145",
          issuedAt: (/* @__PURE__ */ new Date()).toISOString()
        }, null, 2)
      }
    ];
    const zipBuffer = createZipBuffer(zipFiles);
    const downloadFileName = targetFile.downloadFileName || `${targetFile.productTitle ? targetFile.productTitle.replace(/[^a-zA-Z0-9.-]/g, "_") : "digital-product"}-package.zip`;
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${downloadFileName}"`);
    res.setHeader("Content-Length", zipBuffer.length.toString());
    res.send(zipBuffer);
  } catch (err) {
    res.status(500).json({ error: "Download delivery failed: " + err.message });
  }
});
app.get("/api/store/customer/orders", authenticateCustomerToken, async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" });
    const userEmail = req.customer.email;
    const userId = req.customer.id;
    const orders = await db.collection("store_orders").find({
      $or: [
        { userId },
        { "customer.email": userEmail }
      ]
    }).sort({ createdAt: -1 }).toArray();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch customer orders: " + err.message });
  }
});
app.get("/api/store/customer/downloads", authenticateCustomerToken, async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" });
    const userEmail = req.customer.email;
    const userId = req.customer.id;
    const verifiedOrders = await db.collection("store_orders").find({
      $or: [{ userId }, { "customer.email": userEmail }],
      downloadAccess: true
    }).sort({ createdAt: -1 }).toArray();
    const downloadsList = [];
    verifiedOrders.forEach((order) => {
      order.items.forEach((item) => {
        const itemGithub = item.githubRepoUrl || order.deliveredGithubLink || "";
        const itemZip = item.sourceCodeZipUrl || order.deliveredZipUrl || "";
        if (Array.isArray(item.downloadableFiles) && item.downloadableFiles.length > 0) {
          item.downloadableFiles.forEach((file, fileIdx) => {
            downloadsList.push({
              orderNumber: order.orderNumber,
              productTitle: item.title,
              thumbnail: item.thumbnail,
              fileName: file.name,
              size: file.size || "Standard",
              downloadUrl: `/api/store/download/${order.orderNumber}/${fileIdx}`,
              githubRepoUrl: itemGithub,
              sourceCodeZipUrl: itemZip,
              purchasedAt: order.createdAt
            });
          });
        } else {
          downloadsList.push({
            orderNumber: order.orderNumber,
            productTitle: item.title,
            thumbnail: item.thumbnail,
            fileName: `${item.title} Source Code Package.zip`,
            size: "Standard",
            downloadUrl: itemZip || `/api/store/download/${order.orderNumber}/0`,
            githubRepoUrl: itemGithub,
            sourceCodeZipUrl: itemZip,
            purchasedAt: order.createdAt
          });
        }
      });
    });
    res.json(downloadsList);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch downloads: " + err.message });
  }
});
app.get("/api/store/admin/stats", authenticateToken, async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" });
    const totalProducts = await db.collection("store_products").countDocuments();
    const totalOrders = await db.collection("store_orders").countDocuments();
    const pendingVerifications = await db.collection("store_orders").countDocuments({ paymentStatus: "Pending Verification" });
    const totalCustomers = await db.collection("store_users").countDocuments();
    const paidOrders = await db.collection("store_orders").find({
      $or: [{ paymentStatus: "Paid" }, { orderStatus: "Completed" }]
    }).toArray();
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const recentOrders = await db.collection("store_orders").find().sort({ createdAt: -1 }).limit(6).toArray();
    res.json({
      totalRevenue,
      totalOrders,
      pendingVerifications,
      totalProducts,
      totalCustomers,
      recentOrders
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch store stats: " + err.message });
  }
});
app.get("/api/store/admin/orders", authenticateToken, async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" });
    const { status, paymentStatus, search } = req.query;
    const query = {};
    if (status && status !== "All") query.orderStatus = status;
    if (paymentStatus && paymentStatus !== "All") query.paymentStatus = paymentStatus;
    if (search && typeof search === "string" && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [
        { orderNumber: regex },
        { "customer.name": regex },
        { "customer.email": regex },
        { "paymentDetails.transactionId": regex }
      ];
    }
    const orders = await db.collection("store_orders").find(query).sort({ createdAt: -1 }).toArray();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders: " + err.message });
  }
});
app.put("/api/store/admin/orders/:id/verify", authenticateToken, async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" });
    const { action, adminNotes, githubRepoUrl, customZipUrl, sendEmail } = req.body;
    const orderId = new ObjectId(req.params.id);
    const existingOrder = await db.collection("store_orders").findOne({ _id: orderId });
    if (!existingOrder) return res.status(404).json({ error: "Order not found" });
    const adminUsername = req.user?.username || "Admin";
    if (action === "approve" && existingOrder.paymentStatus === "Paid" && existingOrder.downloadAccess) {
      return res.status(400).json({
        error: "This order has already been verified and approved. Use 'Send ZIP Manually' if you wish to re-deliver."
      });
    }
    let updateFields = {
      updatedAt: /* @__PURE__ */ new Date(),
      adminNotes: adminNotes || existingOrder.adminNotes || ""
    };
    let pushFields = {};
    if (action === "approve") {
      updateFields.paymentStatus = "Paid";
      updateFields.orderStatus = "Delivered";
      updateFields.downloadAccess = true;
      updateFields["paymentDetails.paidAt"] = /* @__PURE__ */ new Date();
      const downloadToken = existingOrder.downloadToken || crypto.randomBytes(32).toString("hex");
      updateFields.downloadToken = downloadToken;
      updateFields.downloadLimit = existingOrder.downloadLimit || 10;
      updateFields.tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
      const finalGithub = githubRepoUrl || existingOrder.deliveredGithubLink || existingOrder.items && existingOrder.items[0]?.githubRepoUrl || "";
      const finalZip = customZipUrl || existingOrder.deliveredZipUrl || existingOrder.items && (existingOrder.items[0]?.sourceCodeZip || existingOrder.items[0]?.sourceCodeZipUrl || existingOrder.items[0]?.downloadableFiles?.[0]?.url) || "";
      updateFields.deliveredGithubLink = finalGithub;
      updateFields.deliveredZipUrl = finalZip;
      updateFields.deliveredAt = /* @__PURE__ */ new Date();
      updateFields.githubCodeDelivered = true;
      const verLog = {
        action: "Approved",
        adminUser: adminUsername,
        timestamp: /* @__PURE__ */ new Date(),
        notes: adminNotes || "Payment verified and approved"
      };
      const deliveryItem = {
        deliveredAt: /* @__PURE__ */ new Date(),
        deliveredBy: adminUsername,
        method: "automatic",
        recipientEmail: existingOrder.customer.email,
        downloadLink: `/api/store/download/${existingOrder.orderNumber}/0?token=${downloadToken}`,
        status: "Sent",
        notes: adminNotes || "Automatic delivery on payment approval"
      };
      pushFields = {
        verificationLogs: verLog,
        deliveryHistory: deliveryItem
      };
      if (sendEmail !== false) {
        const emailRes = await sendOrderCodeEmail(
          existingOrder.customer.email,
          existingOrder.customer.name,
          existingOrder.orderNumber,
          existingOrder.items,
          finalGithub,
          finalZip,
          adminNotes || "",
          downloadToken,
          existingOrder.items?.[0]?.downloadInstructions || ""
        );
        updateFields.emailDeliveryStatus = emailRes.success ? "Sent" : "Failed";
        updateFields.emailDeliveryLog = emailRes.log;
      }
    } else if (action === "reject") {
      updateFields.paymentStatus = "Rejected";
      updateFields.orderStatus = "Rejected";
      updateFields.downloadAccess = false;
      const verLog = {
        action: "Rejected",
        adminUser: adminUsername,
        timestamp: /* @__PURE__ */ new Date(),
        notes: adminNotes || "Payment verification rejected"
      };
      pushFields = {
        verificationLogs: verLog
      };
      await sendPaymentRejectedEmail(
        existingOrder.customer.email,
        existingOrder.customer.name,
        existingOrder.orderNumber,
        adminNotes || ""
      );
    } else {
      return res.status(400).json({ error: "Invalid action. Use 'approve' or 'reject'." });
    }
    const updateDoc = { $set: updateFields };
    if (Object.keys(pushFields).length > 0) {
      updateDoc.$push = pushFields;
    }
    await db.collection("store_orders").updateOne({ _id: orderId }, updateDoc);
    const updatedOrder = await db.collection("store_orders").findOne({ _id: orderId });
    res.json({ success: true, order: updatedOrder });
  } catch (err) {
    res.status(500).json({ error: "Failed to verify order: " + err.message });
  }
});
app.post("/api/store/admin/orders/:id/deliver-manual", authenticateToken, async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" });
    const { productId, productZipUrl, githubRepoUrl, notes, recipientEmail } = req.body;
    const orderId = new ObjectId(req.params.id);
    const order = await db.collection("store_orders").findOne({ _id: orderId });
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.paymentStatus !== "Paid") {
      return res.status(400).json({
        error: "Cannot manually deliver files for unverified orders. Please verify and approve payment first."
      });
    }
    const adminUsername = req.user?.username || "Admin";
    const downloadToken = order.downloadToken || crypto.randomBytes(32).toString("hex");
    const targetEmail = (recipientEmail || order.customer.email).toLowerCase().trim();
    const targetItem = (order.items || []).find((i) => i.productId === productId || i.slug === productId) || order.items[0];
    const finalZip = productZipUrl || targetItem?.sourceCodeZip || targetItem?.sourceCodeZipUrl || order.deliveredZipUrl || "";
    const finalGithub = githubRepoUrl || targetItem?.githubRepoUrl || order.deliveredGithubLink || "";
    const emailRes = await sendOrderCodeEmail(
      targetEmail,
      order.customer.name,
      order.orderNumber,
      targetItem ? [targetItem] : order.items,
      finalGithub,
      finalZip,
      notes || "",
      downloadToken,
      targetItem?.downloadInstructions || ""
    );
    const deliveryItem = {
      deliveredAt: /* @__PURE__ */ new Date(),
      deliveredBy: adminUsername,
      method: "manual",
      recipientEmail: targetEmail,
      downloadLink: finalZip || `/api/store/download/${order.orderNumber}/0?token=${downloadToken}`,
      status: emailRes.success ? "Sent" : "Failed",
      notes: notes || `Manual ZIP dispatch by admin ${adminUsername}`
    };
    await db.collection("store_orders").updateOne(
      { _id: orderId },
      {
        $set: {
          downloadAccess: true,
          downloadToken,
          orderStatus: "Delivered",
          deliveredZipUrl: finalZip,
          deliveredGithubLink: finalGithub,
          deliveredAt: /* @__PURE__ */ new Date(),
          emailDeliveryStatus: emailRes.success ? "Sent" : "Failed",
          emailDeliveryLog: emailRes.log,
          updatedAt: /* @__PURE__ */ new Date()
        },
        $push: {
          deliveryHistory: deliveryItem
        }
      }
    );
    const updatedOrder = await db.collection("store_orders").findOne({ _id: orderId });
    res.json({
      success: true,
      emailResult: emailRes,
      order: updatedOrder
    });
  } catch (err) {
    res.status(500).json({ error: "Manual ZIP delivery failed: " + err.message });
  }
});
app.get("/api/store/customer/purchases", authenticateCustomerToken, async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" });
    const userEmail = req.customer.email;
    const userId = req.customer.id;
    const orders = await db.collection("store_orders").find({
      $or: [
        { userId },
        { "customer.email": userEmail }
      ]
    }).sort({ createdAt: -1 }).toArray();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch customer purchases: " + err.message });
  }
});
app.delete("/api/store/admin/orders/:id", authenticateToken, async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" });
    const result = await db.collection("store_orders").deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete order: " + err.message });
  }
});
app.get("/api/store/admin/customers", authenticateToken, async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" });
    const customers = await db.collection("store_users").find().sort({ createdAt: -1 }).toArray();
    const enrichedCustomers = await Promise.all(
      customers.map(async (c) => {
        const orders = await db.collection("store_orders").find({
          $or: [{ userId: c._id.toString() }, { "customer.email": c.email }]
        }).toArray();
        const totalSpend = orders.filter((o) => o.paymentStatus === "Paid").reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
        return {
          id: c._id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          role: c.role || "user",
          createdAt: c.createdAt,
          ordersCount: orders.length,
          totalSpend
        };
      })
    );
    res.json(enrichedCustomers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch customers: " + err.message });
  }
});
async function startServer() {
  if (!process.env.VERCEL) {
    if (process.env.NODE_ENV !== "production") {
      const viteModule = "vite";
      const { createServer } = await import(viteModule);
      const vite = await createServer({
        server: { middlewareMode: true },
        appType: "spa"
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
    app.listen(PORT, "127.0.0.1", () => {
      console.log(`Server running on http://127.0.0.1:${PORT}`);
    });
  }
}
startServer();
var server_default = app;
export {
  server_default as default
};
