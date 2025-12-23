require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import Models
const Contact = require('./models/Contact');
const Subscriber = require('./models/Subscriber'); 
const Booking = require('./models/Booking');

const app = express();

// Allow Netlify (or any frontend) to talk to Render
app.use(cors()); 
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected!"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// --- ROUTES ---

// 1. Health Check
app.get('/', (req, res) => res.send("API is Running!"));

// 2. 🆕 UNSUBSCRIBE ROUTE
// This handles the click from the email. It finds the user by ID and deletes them.
app.get('/unsubscribe/:id', async (req, res) => {
  try {
    const subscriberId = req.params.id;

    // Attempt to find and delete
    const deletedSubscriber = await Subscriber.findByIdAndDelete(subscriberId);

    // HTML Template for the response page
    const htmlStart = `
      <div style="font-family: 'Segoe UI', Tahoma, sans-serif; background-color: #f3f4f6; height: 100vh; display: flex; align-items: center; justify-content: center;">
        <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); text-align: center; max-width: 500px;">
    `;
    const htmlEnd = `</div></div>`;

    // Case A: User was already deleted (or clicked link twice)
    if (!deletedSubscriber) {
      return res.send(htmlStart + `
        <h1 style="color: #d97706; margin-top: 0;">Already Unsubscribed</h1>
        <p style="color: #555;">This email address is no longer in our mailing list.</p>
        <p style="font-size: 12px; color: #999;">You can close this window.</p>
      ` + htmlEnd);
    }

    // Case B: Success
    res.send(htmlStart + `
      <h1 style="color: #0f766e; margin-top: 0;">Unsubscribe Successful</h1>
      <p style="color: #555;">You have been removed from Dr. Asiya Nabi's insights list.</p>
      <p style="color: #555;">We are sorry to see you go!</p>
    ` + htmlEnd);
    
    console.log(`🗑️ Unsubscribed user ID: ${subscriberId}`);

  } catch (error) {
    console.error("Unsubscribe Error:", error);
    res.status(500).send("An error occurred. Please contact support.");
  }
});

// 3. API Routes (Forms)
app.post('/api/contact', async (req, res) => {
  try {
    await new Contact(req.body).save();
    res.status(201).json({ message: "Message sent!" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/newsletter', async (req, res) => {
  try {
    const { email } = req.body;
    // Check for duplicates before saving
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