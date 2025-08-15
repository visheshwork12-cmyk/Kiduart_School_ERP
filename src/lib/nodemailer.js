import nodemailer from "nodemailer";
import logger from "#config/logger.js";

// Create Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter on initialization
transporter.verify((error, success) => {
  if (error) {
    logger.error(`Nodemailer transporter error: ${error.message}`);
  } else {
    logger.info("Nodemailer transporter ready");
  }
});

// Send email function
const sendEmail = async (to, subject, html) => {
  try {
    if (
      process.env.NODE_ENV === "development" ||
      process.env.NODE_ENV === "local"
    ) {
      logger.info(`Mock email send to ${to} in dev/local mode`);
      return { messageId: "mock_message_id" }; // Mock response
    }

    // TODO: Implement actual email sending logic
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Email sending error: ${error.message}`);
    throw error;
  }
};

export default sendEmail;
