// ============================
// Seed script for learn_app DB
// ============================

// 1. Load env variables and modules
require('dotenv').config();
const { MongoClient } = require('mongodb');
const lessonsData = require('./lessons.json');

// 2. Connection info (MongoDB Atlas)
const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME || 'learn_app';

async function run() {
  console.log('Starting seed script...');

  if (!uri) {
    console.error('No MONGO_URI found in environment variables');
    process.exit(1);
  }

  if (!Array.isArray(lessonsData) || lessonsData.length === 0) {
    console.error('No lessons found in ./data/lessons.json');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    // 3. Connect to MongoDB
    await client.connect();
    const db = client.db(dbName);
    const lessonsCollection = db.collection('lessons');

    // 4. Clear old data
    const deleteResult = await lessonsCollection.deleteMany({});
    console.log(`Removed ${deleteResult.deletedCount} existing lessons`);

    // 5. Insert all lessons from JSON
    const insertResult = await lessonsCollection.insertMany(lessonsData);
    console.log(`Inserted ${insertResult.insertedCount} lessons into "${dbName}.lessons"`);

    console.log('Seed script finished.');
  } catch (err) {
    console.error('Error during seeding:', err);
  } finally {
    await client.close();
  }
}

// 6. Run the function
run();
