import express from "express";
import { Contact } from "../models/contact.js";

const router = express.Router();

router.post("/contact-us", async (req, res) => {
  try {
    const { contactname, contactmail, contactmessage } = req.body;

    // validate input
    if (!contactname || !contactmail || !contactmessage) {
      return res
        .status(400)
        .json({ status: false, message: "All fields are required" });
    }

    // save in MongoDB
    const contact_person = await Contact.create({
      contactname,
      contactmail,
      contactmessage,
    });

    return res.json({
      status: true,
      message: "Your form has been successfully submitted",
      data: contact_person,
    });
  } catch (error) {
    console.error("Error saving contact form:", error.message);
    return res
      .status(500)
      .json({ status: false, message: "Server error. Please try again later." });
  }
});

export { router as ContactRouter };
