require('dotenv').config();
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

// ⚠️ Ensure this points to your Subscriber model
const Subscriber = require('./models/Subscriber'); 

// --- 1. SETTINGS & CREDENTIALS ---
const EMAIL_USER = process.env.EMAIL_USER; 
const EMAIL_PASS = process.env.EMAIL_PASS; 

// ✅ YOUR LIVE SERVER URL
const BASE_URL = "https://portfolioasiya.onrender.com"; 

const SUBJECT = "Is AI Replacing Triage Nurses? The Verdict.";

// --- 2. DYNAMIC HTML GENERATOR ---
// This function creates the email and inserts the unique unsubscribe link for each person
const getHtmlContent = (unsubscribeUrl) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Reset & Basics */
    body { margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    
    /* Responsive Wrapper */
    .wrapper { width: 100%; table-layout: fixed; background-color: #f3f4f6; padding-bottom: 40px; }
    .main-card { background-color: #ffffff; margin: 0 auto; max-width: 600px; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    
    /* Mobile adjustments */
    @media only screen and (max-width: 600px) {
      .main-card { width: 100% !important; border-radius: 0 !important; }
      .content-padding { padding: 25px 20px !important; }
      .header-padding { padding: 30px 20px !important; }
    }
  </style>
</head>
<body>
  
  <div class="wrapper">
    <div style="display: none; max-height: 0px; overflow: hidden;">
      Exploring the intersection of Technology, Bedside Care, and the Human Touch.
    </div>

    <br>

    <div class="main-card">
      
      <div style="background-color: #ffffff; padding: 20px 0; text-align: center; border-bottom: 3px solid #0f766e;">
        <span style="color: #0f766e; font-weight: 700; font-size: 16px; letter-spacing: 1.5px; text-transform: uppercase;">
          Dr. Asiya Nabi
        </span>
        <span style="color: #94a3b8; padding: 0 8px;">|</span>
        <span style="color: #64748b; font-size: 14px; font-weight: 500;">Weekly Insights</span>
      </div>

      <div class="header-padding" style="background-color: #115e59; padding: 45px 40px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 26px; line-height: 1.3; font-weight: 600; letter-spacing: -0.5px;">
          Is AI Replacing Triage Nurses?
        </h1>
        <p style="color: #ccfbf1; margin-top: 12px; font-size: 17px; line-height: 1.5;">
          The controversial shift in modern healthcare.
        </p>
      </div>

      <div class="content-padding" style="padding: 40px 40px; color: #334155; line-height: 1.7; font-size: 16px;">
        
        <p style="margin-top: 0;">Hello,</p>
        
        <p>It is the biggest question in our industry right now: <strong>Will Artificial Intelligence replace the human touch?</strong></p>
        
        <p>Specifically in triage—where every second counts—new AI tools are analyzing patient data to predict sepsis, shock, and deterioration faster than humanly possible.</p>

        <div style="background-color: #f0fdfa; border-left: 4px solid #0d9488; padding: 20px; margin: 30px 0; border-radius: 4px;">
          <h3 style="margin: 0 0 8px 0; color: #115e59; font-size: 18px;">The Verdict</h3>
          <p style="margin: 0; color: #134e4a; font-size: 15px;">
            AI is not a replacement—it is a <strong>co-pilot</strong>. It processes data, but it cannot process emotion.
          </p>
        </div>

        <p>While machines can calculate risk scores, they lack "clinical intuition." They cannot read the fear in a patient's eyes or provide the reassurance of a holding hand.</p>

        <p>The future of nursing isn't <em>Man vs. Machine</em>. It is <strong>Human + Machine</strong> working together to save more lives.</p>

        <br>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        
        <p style="margin-bottom: 0;">Stay healthy and informed,</p>
        <p style="margin-top: 5px; font-weight: bold; color: #0f766e;">Dr. Asiya Nabi</p>

      </div>

      <div style="background-color: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="font-size: 12px; color: #94a3b8; margin: 0; line-height: 1.5;">
          You received this email because you are part of Dr. Asiya Nabi's healthcare community.
        </p>
        <p style="font-size: 12px; margin-top: 10px;">
          <a href="${unsubscribeUrl}" style="color: #64748b; text-decoration: underline;">Unsubscribe</a>
        </p>
      </div>

    </div>
    <br><br>
  </div>
</body>
</html>
`;

// --- 3. SENDING LOGIC ---
async function sendBroadcast() {
  if (!EMAIL_USER || !EMAIL_PASS || !process.env.MONGODB_URI) {
    console.error("❌ ERROR: Missing credentials in .env file.");
    return;
  }

  try {
    // Connect DB
    console.log("🔌 Connecting to Database...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Database Connected!");

    // Get Subscribers
    const subscribers = await Subscriber.find({});
    console.log(`📋 Found ${subscribers.length} subscribers.`);

    if (subscribers.length === 0) {
      console.log("⚠️ No subscribers found. Exiting.");
      process.exit();
    }

    // Prepare Mailer
    const transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });

    console.log("🚀 Starting broadcast...");
    
    let successCount = 0;
    let failCount = 0;

    for (const sub of subscribers) {
      
      // ✨ GENERATE UNIQUE LINK: https://portfolioasiya.onrender.com/unsubscribe/USER_ID
      const uniqueUnsubscribeLink = `${BASE_URL}/unsubscribe/${sub._id}`;

      const mailOptions = {
        from: `"Dr. Asiya Nabi" <${EMAIL_USER}>`,
        to: sub.email,
        subject: SUBJECT,
        html: getHtmlContent(uniqueUnsubscribeLink) // Pass the link to the HTML generator
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Sent to: ${sub.email}`);
        successCount++;
      } catch (err) {
        console.error(`❌ Failed: ${sub.email} - ${err.message}`);
        failCount++;
      }
      
      // ⏳ Rate Limit: 1 second delay
      await new Promise(resolve => setTimeout(resolve, 1000)); 
    }

    console.log("\n--- BROADCAST REPORT ---");
    console.log(`🎉 Total Sent: ${successCount}`);
    console.log(`⚠️ Total Failed: ${failCount}`);
    console.log("------------------------");

  } catch (error) {
    console.error("CRITICAL ERROR:", error);
  } finally {
    mongoose.connection.close();
    console.log("🔌 Connection Closed.");
  }
}

sendBroadcast();