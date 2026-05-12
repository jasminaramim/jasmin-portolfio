import express from "express";
import { createServer as createViteServer } from "vite";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "jasmin_premium_secret_key_123";

// MongoDB Configuration
const uri = process.env.MONGODB_URI || "mongodb+srv://Jasmin:Ele%2FSq9%3FuA.d3Z%236%21yR@cluster0.ssmpl.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db: any;

async function connectDB() {
  try {
    await client.connect();
    db = client.db("portfolio");
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

connectDB();

app.use(express.json());
app.use(cookieParser());

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid token" });
  }
};

// --- API Routes ---

// Admin Login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "jasmin1142005" && password === "password123") {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "24h" });
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
    return res.json({ success: true, message: "Logged in successfully" });
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

// Helper for CRUD
const createCRUDRoutes = (collectionName: string) => {
  app.get(`/api/${collectionName}`, async (req, res) => {
    try {
      if (!db) return res.json([]);
      const data = await db.collection(collectionName).find().toArray();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: `Failed to fetch ${collectionName}` });
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

// Profile Special Routes
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
    const result = await db.collection("profile").updateOne(
      {},
      { $set: profileData },
      { upsert: true }
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// --- Vite Middleware ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
