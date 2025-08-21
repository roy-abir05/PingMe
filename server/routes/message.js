const express = require("express");
const Message = require("../models/message");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.get("/conversations/:userId/messages", authMiddleware, async (req, res) => {
  const { userId } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.userId, receiver: userId },
        { sender: userId, receiver: req.user.userId }
      ]
    }).sort({ createdAt: 1 }); // oldest → newest
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/messages", authMiddleware, async (req, res) => {
  const { receiver, content } = req.body;

  if (!receiver || !content) {
    return res.status(400).json({ message: "Receiver and content are required" });
  }

  try {
    const newMessage = await Message.create({
      sender: req.user.userId,
      receiver,
      text: content,
      status: "sent"  // default
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
