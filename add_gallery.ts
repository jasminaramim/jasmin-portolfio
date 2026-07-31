import { MongoClient, ServerApiVersion } from "mongodb";

const uri = "mongodb+srv://Jasmin:Ele%2FSq9%3FuA.d3Z%236%21yR@cluster0.ssmpl.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const db = client.db("portfolio");
    await db.collection("gallery").insertOne({
      imageUrl: "https://www.image2url.com/r2/default/images/1785470876616-45625c8f-097d-4c82-9df8-5c11557536f8.png"
    });
    console.log("Inserted image successfully");
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
