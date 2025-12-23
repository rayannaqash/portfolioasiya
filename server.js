require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import Models
const Contact = require('./models/Contact');
const Subscriber = require('./models/Subscriber'); 
const Booking = require('./models/Booking');

const app = express();

// Allow Netlify to talk to Render
app.use(cors()); 
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected!"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// --- ROUTES ---

// Health Check (Optional, but good for testing)
app.get('/', (req, res) => res.send("API is Running!"));

// API Routes
app.post('/api/contact', async (req, res) => {
  try {
    await new Contact(req.body).save();
    res.status(201).json({ message: "Message sent!" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/newsletter', async (req, res) => {
  try {
    const { email } = req.body;
    if (await Subscriber.findOne({ email })) return res.status(400).json({ message: 'Already subscribed' });
    await new Subscriber({ email }).save();
    res.status(201).json({ message: 'Subscribed!' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/book', async (req, res) => {
  try {
    await new Booking(req.body).save();
    res.status(201).json({ message: "Booking received!" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));