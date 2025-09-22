import express from 'express'
import { Season } from '../models/season.js'   // don't forget .js if using ES modules
import { verifyToken } from './user.js'

const router = express.Router()

router.post('/createseason', verifyToken, async (req, res) => {
  if (!req.user.admin)
    return res.status(403).json({ status: false, message: "Only admins can add matches" });

  try {
    const { season, team1, team2 } = req.body;

    if (!season || !team1 || !team2) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (team1 === team2) {
      return res.status(400).json({ message: "Team1 and Team2 cannot be the same" });
    }

    // check if season exists
    let existingSeason = await Season.findOne({ season });

    if (!existingSeason) {
      // create new season with first match
      existingSeason = new Season({
        season,
        matches: [{ team1, team2 }]
      });
    } else {
      // push new match into existing season
      existingSeason.matches.push({ team1, team2 });
    }

    await existingSeason.save();

    res.status(201).json({
      message: "Match added successfully",
      season: existingSeason
    });
  } catch (error) {
    console.error("Error creating match:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


router.get('/getseason',async (req,res)=>{
  const season= await Season.find().sort({season:1}).exec();
  if(season){
    return res.json({status:true,season})
  }
  return res.json({message:"error occured or no season data its empty"})
})
// get season by ID
router.get("/getseasonbyid/:id", async (req, res) => {
  try {
    const season = await Season.findById(req.params.id);

    if (!season) {
      return res.json({ status: false, message: "Season not found" });
    }

    return res.json({ status: true, season });
  } catch (err) {
    console.error(err);
    return res.json({ status: false, message: "Error fetching season" });
  }
});
router.delete("/deleteseason/:id", verifyToken, async (req, res) => {
  if (!req.user.admin){
    return res.status(403).json({ status: false, message: "Only admins can delete seasons" });
  }
  try {
    const deletedSeason = await Season.findByIdAndDelete(req.params.id);
    if (!deletedSeason) {
      return res.status(404).json({ status: false, message: "No seasons to delete" });
    }
    return res.json({ status: true, message: "Latest season deleted", season: deletedSeason });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, message: "Error deleting season" });
  }
});
export {router as seasonrouter};
