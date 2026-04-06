import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Create a transporter using Ethereal test credentials.
// For production, replace with your actual SMTP server details.
const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true, // Use true for port 465, false for port 587
  auth: {
    user: process.env.EMAIL, // Your email address
    pass: process.env.PASS,
  },
});

export const sendOtpMail= async (to,otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL, // Sender address
    to,
    subject:"Reset Your Password",
    html: `<p>Your OTP for resetting your password is: <b>${otp}</b>.It expires in 5 minutes</p>`,  
  })
}

export const sendDeliveryOtpMail= async (user,otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL, // Sender address
    to: user.email,
    subject:"Delivery OTP",
    html: `<p>Your OTP for the delivery is: <b>${otp}</b>.It expires in 5 minutes</p>`,  
  })
}