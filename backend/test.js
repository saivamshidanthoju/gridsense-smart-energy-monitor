const { MongoClient } = require("mongodb");
require("dotenv").config();

async function test() {
  try {
    console.log("Connecting to MongoDB...");
    console.log("URI:", process.env.MONGODB_URI);
    console.log("DB_NAME:", process.env.DB_NAME);
    
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log("Connected ✅");
    
    const db = client.db(process.env.DB_NAME);
    console.log("DB object type:", typeof db);
    console.log("DB object:", db);
    
    const usersCollection = db.collection("users");
    console.log("Users collection type:", typeof usersCollection);
    
    const count = await usersCollection.countDocuments();
    console.log("Document count:", count);
    
    await client.close();
    console.log("Test completed successfully!");
    
  } catch (err) {
    console.error("Test error:", err.message);
    console.error(err.stack);
  }
}

test();
