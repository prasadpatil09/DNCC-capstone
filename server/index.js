import express from 'express';
import http from 'http';
import { Chat } from './models/chat.js';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { ContactRouter } from './routes/contact.js';
import { accountrouter } from './routes/account.js';
import { playerrouter } from './routes/player.js';
import { seasonrouter } from './routes/season.js';
import cors from 'cors';
import { userrouter } from './routes/user.js';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
    origin: ["https://dncc-1.onrender.com", "https://zm1wqhlh-5173.inc1.devtunnels.ms","http://localhost:5173"],
    credentials: true
}));
app.use(cookieParser());

app.use('/auth', userrouter);
app.use('/home', accountrouter);
app.use('/approve', playerrouter);
app.use('/contact', ContactRouter);
app.use('/create', seasonrouter);


// Summarizer route using OpenRouter
app.post('/summarizer', async (req, res) => {
  try {
    const { textData } = req.body;
    if (!textData) return res.status(400).json({ error: "textData is required" });

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini", // fast model
        messages: [
          { role: "system", content: "You are a live chat summarizer. Summarize the main topic of discussion in one short sentence, like a YouTube Live highlight." },
          { role: "user", content: textData }
        ],
        max_tokens: 100
      })
    });

    const data = await response.json();

    // Debugging: log response
    console.log("🔍 OpenRouter response:", JSON.stringify(data, null, 2));

    // Try multiple possible paths
    let summary =
      data.choices?.[0]?.message?.content || // normal OpenAI-style
      data.choices?.[0]?.delta?.content ||   // stream-style
      data.choices?.[0]?.text ||             // fallback for text models
      "No summary generated.";

    res.json({ summary });
  } catch (err) {
    console.error("Summarizer error:", err);
    res.status(500).json({ error: "Failed to generate summary" });
  }
});


// MongoDB + Socket.IO setup (your existing code) ...
mongoose.connect(
  'mongodb+srv://123prasad4009:%40Pp1020975@cluster0.fjnhg5x.mongodb.net/authentication',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    family: 4
  }
)
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("connected");
  const loadmessages = async () => {
    try {
      const messages = await Chat.find().sort({ timestamp: 1 }).exec();
      socket.emit("chat", messages);
    } catch (err) {
      console.log(err);
    }
  };
  loadmessages();

  socket.on("newmessages", async (msg) => {
    try {
      const newchat = new Chat(msg);
      await newchat.save();
      io.emit("message", msg);
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("disconnect", () => {
    console.log("disconnected");
  });
});

server.listen(process.env.PORT || 8500, () => {
  console.log(`server is running on port ${process.env.PORT || 8500}`);
});
