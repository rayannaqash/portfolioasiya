require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- IMPORT MODELS ---
// Make sure you have created these files in your 'models' folder!
const Contact = require('./models/Contact');
const Subscriber = require('./models/Subscriber'); 

const app = express();

// --- MIDDLEWARE ---
app.use(cors()); // Allows your Netlify site to talk to this server
app.use(express.json()); // Allows the server to understand JSON data

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected!"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// --- ROUTES ---

// 1. Health Check (To test if the server is online in the browser)
app.get('/', (req, res) => {
  res.send("Server is Online and Ready!");
});

// 2. Contact Form Endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const newContact = new Contact(req.body);
    await newContact.save();
    console.log("New Contact Message Saved:", req.body.email);
    res.status(201).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("Contact Error:", error);
    res.status(500).json({ error: "Failed to save message" });
  }
});

// 3. Newsletter Endpoint (NEW)
app.post('/api/newsletter', async (req, res) => {
  try {
    const { email } = req.body;

    // Step A: Check if email already exists in the database
    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({ message: 'Email already subscribed' });
    }

    // Step B: Save new subscriber
    const newSubscriber = new Subscriber({ email });
    await newSubscriber.save();
    
    console.log("New Subscriber Added:", email);
    res.status(201).json({ message: 'Subscribed successfully!' });
  } catch (error) {
    console.error('Newsletter Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));