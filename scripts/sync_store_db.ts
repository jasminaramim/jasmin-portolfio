import { MongoClient } from 'mongodb';
import { DEFAULT_STORE_PRODUCTS } from '../data/defaultStoreProducts.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://Jasmin:Ele%2FSq9%3FuA.d3Z%236%21yR@cluster0-shard-00-00.ssmpl.mongodb.net:27017,cluster0-shard-00-01.ssmpl.mongodb.net:27017,cluster0-shard-00-02.ssmpl.mongodb.net:27017/?ssl=true&authSource=admin&replicaSet=atlas-islggq-shard-0&retryWrites=true&w=majority';
const DB_NAME = 'portfolio';

async function syncStore() {
  console.log('Connecting to MongoDB...');
  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
  });

  try {
    await client.connect();
    console.log('Connected to MongoDB.');
    const db = client.db(DB_NAME);

    // 1. Delete all existing store products
    const delRes = await db.collection('store_products').deleteMany({});
    console.log(`Deleted ${delRes.deletedCount} existing store products.`);

    // 2. Prepare 6 products
    const now = Date.now();
    const productsToInsert = DEFAULT_STORE_PRODUCTS.map((p, idx) => ({
      ...p,
      createdAt: new Date(now - idx * 86400000),
      updatedAt: new Date(now)
    }));

    // 3. Insert the 6 products
    const insRes = await db.collection('store_products').insertMany(productsToInsert);
    console.log(`Successfully inserted ${insRes.insertedCount} products into 'store_products'.`);

    // 4. Verify count
    const totalCount = await db.collection('store_products').countDocuments();
    console.log(`Total store products in database now: ${totalCount}`);

    const titles = await db.collection('store_products').find({}, { projection: { title: 1, slug: 1, category: 1 } }).toArray();
    console.log('Current products in DB:');
    titles.forEach((t, i) => console.log(`${i + 1}. [${t.category}] ${t.title} (${t.slug})`));

  } catch (err) {
    console.error('Error syncing store products:', err);
    process.exit(1);
  } finally {
    await client.close();
    console.log('MongoDB connection closed.');
  }
}

syncStore();
