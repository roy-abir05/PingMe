const mongoose = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const messageSchema = new mongoose.Schema(
  {
    messageId: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    sender: {
      type: String,
      ref: "user",
      required: true,
    },
    receiver: {
      type: String,
      ref: "user",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["sending", "sent", "delivered", "read", "failed"],
      default: "sending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("message", messageSchema);
