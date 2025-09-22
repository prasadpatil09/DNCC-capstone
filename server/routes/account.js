import express from "express";
import { Account } from "../models/account.js";
import { verifyToken } from "./user.js";

const router = express.Router();

// Get all accounts
router.get("/account", async (req, res) => {
  const accounts = await Account.find().sort({ _id: -1 });
  return res.json(accounts);
});

// Add account (admin only)
router.post("/add-account", verifyToken, async (req, res) => {
  if (!req.user.admin) return res.status(403).json({ status: false, message: "Only admins can add accounts" });

  try {
    await Account.create(req.body);
    return res.json({ status: true, message: "Account added successfully" });
  } catch (err) {
    return res.status(400).json({ status: false, message: "Error adding account", error: err.message });
  }
});

// Get single account
router.get("/get-account/:id", async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account) return res.status(404).json({ message: "Account not found" });
    return res.json(account);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching account" });
  }
});

// Update account (admin only)
router.patch("/update-account/:id", verifyToken, async (req, res) => {
  if (!req.user.admin) return res.status(403).json({ status: false, message: "Only admins can update accounts" });

  try {
    const updated = await Account.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ status: false, message: "Account not found" });
    return res.json({ status: true, message: "Account updated successfully", updated });
  } catch (err) {
    return res.status(500).json({ status: false, message: "Error updating account", error: err.message });
  }
});

// Delete account (admin only)
router.delete("/delete/:id", verifyToken, async (req, res) => {
  if (!req.user.admin) return res.status(403).json({ status: false, message: "Only admins can delete accounts" });

  try {
    const deleted = await Account.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ status: false, message: "Account not found" });
    return res.json({ status: true, message: "Account deleted successfully" });
  } catch (err) {
    return res.status(500).json({ status: false, message: "Error deleting account", error: err.message });
  }
});

export { router as accountrouter };
