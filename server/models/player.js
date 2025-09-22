import mongoose from "mongoose";

const PlayerSchema = new mongoose.Schema({
  playername: { type: String, required: true, unique: true },
  playertype: { type: String, required: true },
  matches: { type: Number, default: 0 },
  runs: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  age: { type: Number, required: true },
  accepted: { type: Boolean, default: false },
  // Reference to User model
  userRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
});

const PlayerModel = mongoose.model("Player", PlayerSchema);

export { PlayerModel as Player };
