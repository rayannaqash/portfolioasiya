require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- IMPORT MODELS ---
const Contact = require('./models/Contact');
const Subscriber = require('./models/Subscriber'); 
const Booking = require('./models/Booking'); // <--- NEW IMPORT

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected!"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// --- ROUTES ---

// 1. Health Check
app.get('/', (req, res) => res.send("Server is Online!"));

// 2. Contact Form
app.post('/api/contact', async (req, res) => {
  try {
    await new Contact(req.body).save();
    res.status(201).json({ message: "Message sent successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to save message" });
  }
});

// 3. Newsletter
app.post('/api/newsletter', async (req, res) => {
  try {
    const { email } = req.body;
    if (await Subscriber.findOne({ email })) {
      return res.status(400).json({ message: 'Email already subscribed' });
    }
    await new Subscriber({ email }).save();
    res.status(201).json({ message: 'Subscribed successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// 4. Booking System (NEW)
app.post('/api/book', async (req, res) => {
  try {
    // Basic validation
    if (!req.body.preferredDate || !req.body.serviceType) {
      return res.status(400).json({ message: "Date and Service are required." });
    }

    const newBooking = new Booking(req.body);
    await newBooking.save();
    
    console.log("New Booking Request:", req.body.email);
    res.status(201).json({ message: "Booking request received! We will confirm shortly." });
  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ message: "Server error processing booking" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));