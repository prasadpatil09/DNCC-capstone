import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { User } from "../models/user.js";

dotenv.config();
const router = express.Router();
const secretKey = process.env.KEY;

// Middleware to verify JWT
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ status: false, message: "No token provided" });

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(403).json({ status: false, message: "Token expired. Please login again." });
      }
      return res.status(403).json({ status: false, message: "Invalid token" });
    }
    req.user = decoded; // { id, admin }
    next();
  });
};

// Signup
router.post("/signup", async (req, res) => {
  const { username, mail, password } = req.body;
  const existingUser = await User.findOne({ username });
  const existingMail = await User.findOne({ mail });
  if (existingUser) return res.json({ message: "User already exists" });
  if (existingMail) return res.json({ message: "Email already registered" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, mail, password: hashedPassword });
  await newUser.save();
  return res.json({ status: true, message: "Registered successfully" });
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.json({ message: "User does not exist" });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.json({ message: "Invalid password" });

  const token = jwt.sign({ id: user._id, admin: user.admin }, secretKey, { expiresIn: "1h" });
  res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });

  return res.json({ status: true, message: "Login successful", user, token });
});

// Forgot password
router.post("/forgot", async (req, res) => {
  const { mail } = req.body;
  const user = await User.findOne({ mail });
  if (!user) return res.json({ message: "Email not signed up" });

  const token = jwt.sign({ id: user._id }, secretKey, { expiresIn: "5m" });
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: "ytchannel2ai@gmail.com", pass: "exhr xuyr gilo csie" },
  });
  const mailOptions = {
    from: "ytchannel2ai@gmail.com",
    to: mail,
    subject: "Reset Password Link",
    text: `https://dncc-1.onrender.com/reset/${token}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) return res.json({ message: "Error sending email" });
    return res.json({ status: true, message: "Email sent" });
  });
});

// Reset password
router.post("/reset/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, secretKey);
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });
    return res.json({ status: true, message: "Password changed successfully" });
  } catch (err) {
    return res.json({ status: false, message: "Error changing password or token expired " });
  }
});

export { router as userrouter };
