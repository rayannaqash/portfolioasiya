const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // ALLOWS FRONTEND TO CONNECT
require('dotenv').config();

// Ensure this file exists in /models/message.js and is named exactly 'message.js'
const Message = require('./models/message'); 

const app = express();
const PORT = 5000;

// --- MIDDLEWARE ---
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- ROUTES ---
app.get('/', (req, res) => {
    res.send('<h1>Server is Online and Ready!</h1>');
});

app.post('/api/contact', async (req, res) => {
    try {
        const newMessage = new Message(req.body);
        await newMessage.save();
        console.log('✅ New Message Saved:', req.body.name);
        res.status(201).json({ message: 'Success! Message saved.' });
    } catch (error) {
        console.error('❌ Error Saving:', error);
        res.status(500).json({ error: 'Failed to save message' });
    }
});

// --- SERVER STARTUP ---
// 1. Connect to Database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected!'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// 2. Start Listening (Force Start)
app.listen(PORT, () => {
    console.log(`🚀 SUCCESS! Server is running at http://localhost:${PORT}`);
});