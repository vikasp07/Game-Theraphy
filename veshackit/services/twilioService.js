require("dotenv").config();
const twilio = require("twilio");

const client = new twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const formatPhoneNumber = (phone) => {
  // Remove non-numeric characters (just in case)
  phone = phone.replace(/\D/g, "");

  // Ensure it's at least 10 digits (Indian mobile numbers)
  if (phone.length === 10) {
    phone = "+91" + phone; // Assume Indian number if only 10 digits
  } else if (!phone.startsWith("+")) {
    phone = "+" + phone; // Ensure leading '+'
  }

  return phone;
};


const sendSMS = async (to, message) => {
  try {
    const formattedPhone = formatPhoneNumber(to);
    console.log(`📨 Sending SMS to: ${formattedPhone} Message: ${message}`);

    if (!/^\+\d{10,15}$/.test(formattedPhone)) {
      throw new Error("Invalid phone number format.");
    }

    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });

    console.log("✅ Message sent:", response.sid);
    return response;
  } catch (error) {
    console.error("❌ Twilio Error:", error.message);
    throw error;
  }
};


module.exports = { sendSMS };
