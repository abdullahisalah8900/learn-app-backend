// ============================================
// Lessons Backend (Express + MongoDB)
// ============================================

// Load env variables (MongoDB URI, DB name)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();

// --------------------------------------------
// Middleware
// --------------------------------------------
app.use(cors());            // allow frontend to talk to backend
app.use(express.json());    // read JSON request bodies
app.use(morgan('dev'));     // request logger

// Custom logger required by coursework
app.use((req, res, next) => {
  console.log(`[LOG] ${req.method} ${req.url}`);
  next();
});

// --------------------------------------------
// Static Images Folder
// (frontend loads images using backend URL)
// --------------------------------------------
const imagesDir = path.join(__dirname, 'images');
app.use('/images', express.static(imagesDir));

app.use('/images', (_req, res) => {
  res.status(404).json({ error: 'Image not found' });
});

// --------------------------------------------
// MongoDB Setup
// --------------------------------------------
const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME; // "learn_app"

let Lessons, Orders;

async function connectDB() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  Lessons = db.collection('lessons');
  Orders  = db.collection('orders');

  console.log(`Connected to MongoDB → Database: ${dbName}`);
}

// --------------------------------------------
// API ROUTES
// --------------------------------------------

// GET all lessons
app.get('/api/lessons', async (req, res) => {
  try {
    const data = await Lessons.find().toArray();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load lessons' });
  }
});

// POST new order
app.post('/api/order', async (req, res) => {
  try {
    const order = {
      name: req.body.name,
      phone: req.body.phone,
      items: req.body.items,
      total: req.body.total,
      createdAt: new Date()
    };

    await Orders.insertOne(order);
    res.json({ message: 'Order saved' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save order' });
  }
});

// PUT update lesson spaces
app.put('/api/lessons', async (req, res) => {
  try {
    const { subject, city, spaces } = req.body;

    const result = await Lessons.updateOne(
      { subject, "locations.city": city },
      { $set: { "locations.$.spaces": spaces } }
    );

    if (result.matchedCount === 0)
      return res.status(404).json({ message: 'Lesson not found' });

    res.json({ message: 'Lesson updated' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update lesson' });
  }
});

// --------------------------------------------
// Start server AFTER connecting to DB
// --------------------------------------------
const port = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(port, () => console.log(`Backend running on port ${port}`));
});
