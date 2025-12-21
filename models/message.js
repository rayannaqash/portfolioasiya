const mongoose = require('mongoose');

// Define the structure for your message data
const messageSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  // Automatically adds a timestamp
  date: { 
    type: Date, 
    default: Date.now 
  }
});

// Export the Message Model for use in server.js
// 'message' is the name of the collection in MongoDB (it will be pluralized to 'messages')
module.exports = mongoose.model('message', messageSchema);