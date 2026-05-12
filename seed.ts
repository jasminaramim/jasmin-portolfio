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
    title: "Premium AI SaaS Dashboard",
    description: "A high-fidelity AI-powered analytics dashboard featuring real-time data visualization, predictive modeling capabilities, and a sleek dark mode glassmorphism UI. Built for enterprise scalability.",
    tags: ["React", "TypeScript", "Tailwind CSS", "Framer Motion", "Recharts"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
    liveLink: "https://demo.example.com/ai-saas",
    assignTo: "Current Admin",
    type: "Collaborative",
    status: "Completed",
    orderId: "ORD-001",
    clientName: "Nexus Tech",
    profileName: "Upwork",
    achievementValue: 2500,
    totalProjectValue: 5000,
    developerName: "Jasmin",
    docLink: "https://docs.example.com/ai-saas"
  },
  {
    title: "E-commerce Luxury Watch Store",
    description: "An elegant, high-performance e-commerce platform for luxury timepieces. Features include a custom 3D product viewer, secure payment gateway integration, and a minimalist premium aesthetic.",
    tags: ["Next.js", "Stripe", "Three.js", "MongoDB", "Redux"],
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=2080&auto=format&fit=crop",
    liveLink: "https://demo.example.com/luxury-watches",
    assignTo: "Current Admin",
    type: "Solo",
    status: "Completed",
    orderId: "ORD-002",
    clientName: "Horology Elite",
    profileName: "Fiverr",
    achievementValue: 1800,
    totalProjectValue: 3000,
    developerName: "Jasmin",
    docLink: "https://docs.example.com/watches"
  },
  {
    title: "Crypto Wallet Mobile App",
    description: "A secure and intuitive mobile application for managing cryptocurrency portfolios. Includes live price tracking, multi-chain support, and biometric authentication for enhanced security.",
    tags: ["React Native", "Web3.js", "Node.js", "GraphQL"],
    image: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=2069&auto=format&fit=crop",
    liveLink: "https://demo.example.com/crypto-wallet",
    assignTo: "Current Admin",
    type: "Solo",
    status: "In Progress",
    orderId: "ORD-003",
    clientName: "BlockSafe",
    profileName: "Direct",
    achievementValue: 3000,
    totalProjectValue: 8000,
    developerName: "Jasmin",
    docLink: "https://docs.example.com/crypto"
  },
  {
    title: "Real Estate Virtual Tour Platform",
    description: "A cutting-edge platform allowing users to take immersive 360-degree virtual tours of premium real estate properties. Features advanced search filters and interactive maps.",
    tags: ["Vue.js", "Firebase", "Mapbox", "WebGL"],
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop",
    liveLink: "https://demo.example.com/real-estate",
    assignTo: "Current Admin",
    type: "Collaborative",
    status: "Completed",
    orderId: "ORD-004",
    clientName: "Prime Properties",
    profileName: "Upwork",
    achievementValue: 2200,
    totalProjectValue: 4500,
    developerName: "Jasmin",
    docLink: "https://docs.example.com/real-estate"
  },
  {
    title: "Fitness Tracking Wearable UI",
    description: "A vibrant and energetic UI design and integration for a next-generation fitness tracking wearable device. Monitors heart rate, sleep patterns, and daily activity metrics in real-time.",
    tags: ["React", "D3.js", "Express", "PostgreSQL"],
    image: "https://images.unsplash.com/photo-1510065096181-79e5d481023a?q=80&w=2069&auto=format&fit=crop",
    liveLink: "https://demo.example.com/fitness",
    assignTo: "Current Admin",
    type: "Solo",
    status: "Completed",
    orderId: "ORD-005",
    clientName: "Vitality Tech",
    profileName: "Fiverr",
    achievementValue: 1500,
    totalProjectValue: 2500,
    developerName: "Jasmin",
    docLink: "https://docs.example.com/fitness"
  },
  {
    title: "Architectural Portfolio Studio",
    description: "A minimalist, award-winning portfolio website for a high-end architectural firm. Features smooth page transitions, large typography, and high-resolution image galleries.",
    tags: ["Gatsby", "GraphQL", "Contentful", "Styled Components"],
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop",
    liveLink: "https://demo.example.com/architect",
    assignTo: "Current Admin",
    type: "Solo",
    status: "Completed",
    orderId: "ORD-006",
    clientName: "Studio Arch",
    profileName: "Direct",
    achievementValue: 1200,
    totalProjectValue: 2000,
    developerName: "Jasmin",
    docLink: "https://docs.example.com/architect"
  }
];

async function seed() {
  try {
    await client.connect();
    console.log("Connected correctly to server");
    const db = client.db("portfolio");
    
    // Clear existing demo projects or all projects to start fresh? 
    // The user said "add 6 demo data projects". I'll just insert them.
    // To avoid duplicates if run multiple times, I can clear first, but maybe just insert is fine.
    await db.collection("projects").insertMany(demoProjects);
    
    console.log("Successfully inserted 6 demo projects!");
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

seed();
