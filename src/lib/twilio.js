import twilio from "twilio";
import logger from "#config/logger.js";

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

// Send SMS function
const sendSMS = async (to, body) => {
  try {
    if (
      process.env.NODE_ENV === "development" ||
      process.env.NODE_ENV === "local"
    ) {
      logger.info(`Mock SMS send to ${to} in dev/local mode`);
      return { sid: "mock_sms_sid" }; // Mock response
    }

    // TODO: Implement actual SMS sending logic
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    logger.info(`SMS sent: ${message.sid}`);
    return message;
  } catch (error) {
    logger.error(`SMS sending error: ${error.message}`);
    throw error;
  }
};

export default sendSMS;
