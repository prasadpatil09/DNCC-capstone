import express from "express";
import { Player } from "../models/player.js";
import { User } from "../models/user.js";
import { verifyToken } from "./user.js";

const router = express.Router();

// Create/submit player (by user)
router.post("/player-approval", verifyToken, async (req, res) => {
  const { userid, playername, playertype, matches, runs, wickets, age } = req.body;

  try {
    const existingPlayer = await Player.findOne({ playername });
    if (existingPlayer) return res.json({ status: false, message: "Player already exists" });

    const newPlayer = new Player({
      playername,
      playertype,
      matches,
      runs,
      wickets,
      age,
      userRef: userid,
    });
    await newPlayer.save();

    return res.json({ status: true, message: "Player submitted successfully", newPlayer });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, message: "Error submitting player" });
  }
});

// Get all pending player requests (for admin)
router.get("/player-req", verifyToken, async (req, res) => {
  try {
    const players = await Player.find({ accepted: { $ne: true } }).sort({ _id: -1 });
    return res.json(players);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, message: "Error fetching player requests" });
  }
});

// Accept a player request (admin only)
router.patch("/player-accept/:id", verifyToken, async (req, res) => {
  if (!req.user.admin) return res.status(403).json({ status: false, message: "Only admins can accept players" });

  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ status: false, message: "Player not found" });

    player.accepted = true;
    await player.save();

    const user = await User.findById(player.userRef);
    if (user) {
      user.player = true;
      await user.save();
    }

    return res.json({ status: true, message: "Player request accepted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, message: "Error accepting player request" });
  }
});

// Reject/delete player request (admin only)
router.delete("/player-reject/:id", verifyToken, async (req, res) => {
  if (!req.user.admin) return res.status(403).json({ status: false, message: "Only admins can reject players" });

  try {
    const player = await Player.findByIdAndDelete(req.params.id);
    if (!player) return res.status(404).json({ status: false, message: "Player not found" });

    const user = await User.findById(player.userRef);
    if (user) {
      user.player = false;
      await user.save();
    }

    return res.json({ status: true, message: "Player request rejected" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, message: "Error rejecting player request" });
  }
});

// Get all players
router.get("/player-request", async (req, res) => {
  try {
    const players = await Player.find().sort({ _id: -1 });
    return res.json(players);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, message: "Error fetching players" });
  }
});

// View a single player
router.get("/player-view/:id", async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ status: false, message: "Player not found" });
    return res.json(player);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, message: "Error fetching player" });
  }
});

// Delete a player (admin only)
router.delete("/player-delete/:id", verifyToken, async (req, res) => {
  if (!req.user.admin) return res.status(403).json({ status: false, message: "Only admins can delete players" });

  try {
    const player = await Player.findByIdAndDelete(req.params.id);
    if (!player) return res.status(404).json({ status: false, message: "Player not found" });

    const user = await User.findById(player.userRef);
    if (user) {
      user.player = false;
      await user.save();
    }

    return res.json({ status: true, message: "Player deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, message: "Error deleting player" });
  }
});
router.put("/player-update/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { playername, playertype, age, matches, runs, wickets } = req.body;

  try {
    const playerref = await Player.findById(id);
    if (!playerref) {
      return res.status(404).json({ status: false, message: "Player does not exist" });
    }

    // Allow only admin OR the same player who owns this profile
    if (!(req.user.admin || req.user.id === playerref.userRef.toString())) {
      return res.status(403).json({
        status: false,
        message: "Only admins or the player himself can update this account"
      });
    }

    const player = await Player.findByIdAndUpdate(
      id,
      { playername, playertype, age, matches, runs, wickets },
      { new: true }
    );

    return res.json({
      status: true,
      message: "Player details updated successfully",
      player
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Server error", error });
  }
});

export { router as playerrouter };
