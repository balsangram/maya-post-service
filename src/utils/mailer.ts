import nodemailer from "nodemailer";
import env from "../config/env.js";

// ======================================================
// Email Types
// ======================================================

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

// ======================================================
// Nodemailer Transporter
// ======================================================

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASSWORD,
  },
});

// ======================================================
// Send Email
// ======================================================

export const sendEmail = async ({
  to,
  subject,
  html,
}: SendEmailOptions) => {
  try {
    const info = await transporter.sendMail({
      from: `"My App" <${env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(
      "Email sent:",
      info.messageId
    );

    return info;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(
        "Email sending failed:",
        error.message
      );
    } else {
      console.error(
        "Email sending failed:",
        error
      );
    }

    throw error;
  }
};

export default sendEmail;