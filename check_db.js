import { MongoClient } from "mongodb";

const uri = "mongodb+srv://Jasmin:Ele%2FSq9%3FuA.d3Z%236%21yR@cluster0.ssmpl.mongodb.net/?appName=Cluster0";

async function check() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("portfolio");
  const settings = await db.collection("settings").findOne({});
  console.log("Settings in DB:", settings);
  await client.close();
}

check().catch(console.error);
