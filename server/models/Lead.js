import mongoose from "mongoose";

// Sub-document schemas for granular timeline logs
const noteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const callSchema = new mongoose.Schema({
  status: { type: String, required: true }, // Connected, Busy, No Answer, etc.
  outcome: { type: String, required: true },
  duration: { type: Number, default: 0 }, // in minutes
  date: { type: Date, default: Date.now }
});

const meetingSchema = new mongoose.Schema({
  summary: { type: String, required: true },
  decisions: { type: String },
  date: { type: Date, default: Date.now }
});

const reminderSchema = new mongoose.Schema({
  note: { type: String, required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ["PENDING", "COMPLETED"], default: "PENDING" }
});

const leadSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true },
    lastMessage: String,
    status: { type: String, enum: ["WARM", "HOT", "CONVERTED"], default: "WARM" },
    intent: { type: String, default: "GENERAL" },
    notes: [noteSchema],
    callHistory: [callSchema],
    meetingNotes: [meetingSchema],
    reminders: [reminderSchema]
  },
  { timestamps: true }
);

export default mongoose.model("Lead", leadSchema);
