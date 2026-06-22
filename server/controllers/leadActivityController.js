import Lead from "../models/Lead.js";

// Add a note to a specific lead
export async function addNote(req, res, next) {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Note text is required." });

    const lead = await Lead.findById(id);
    if (!lead) return res.status(404).json({ message: "Lead not found." });

    lead.notes.push({ text });
    await lead.save();

    res.status(201).json(lead);
  } catch (err) {
    next(err);
  }
}

// Log a call event for a lead
export async function logCall(req, res, next) {
  try {
    const { id } = req.params;
    const { status, outcome, duration, date } = req.body;
    if (!status || !outcome) {
      return res.status(400).json({ message: "Status and outcome are required for call log." });
    }

    const lead = await Lead.findById(id);
    if (!lead) return res.status(404).json({ message: "Lead not found." });

    lead.callHistory.push({
      status,
      outcome,
      duration: Number(duration) || 0,
      date: date || new Date()
    });
    await lead.save();

    res.status(201).json(lead);
  } catch (err) {
    next(err);
  }
}

// Record a meeting for a lead
export async function logMeeting(req, res, next) {
  try {
    const { id } = req.params;
    const { summary, decisions, date } = req.body;
    if (!summary) return res.status(400).json({ message: "Meeting summary is required." });

    const lead = await Lead.findById(id);
    if (!lead) return res.status(404).json({ message: "Lead not found." });

    lead.meetingNotes.push({
      summary,
      decisions,
      date: date || new Date()
    });
    await lead.save();

    res.status(201).json(lead);
  } catch (err) {
    next(err);
  }
}

// Schedule a follow-up reminder for a lead
export async function addReminder(req, res, next) {
  try {
    const { id } = req.params;
    const { note, date } = req.body;
    if (!note || !date) return res.status(400).json({ message: "Note and date are required for reminders." });

    const lead = await Lead.findById(id);
    if (!lead) return res.status(404).json({ message: "Lead not found." });

    lead.reminders.push({
      note,
      date,
      status: "PENDING"
    });
    await lead.save();

    res.status(201).json(lead);
  } catch (err) {
    next(err);
  }
}

// Toggle a reminder state (PENDING <-> COMPLETED)
export async function toggleReminder(req, res, next) {
  try {
    const { id, reminderId } = req.params;
    const lead = await Lead.findById(id);
    if (!lead) return res.status(404).json({ message: "Lead not found." });

    const reminder = lead.reminders.id(reminderId);
    if (!reminder) return res.status(404).json({ message: "Reminder not found in lead records." });

    reminder.status = reminder.status === "PENDING" ? "COMPLETED" : "PENDING";
    await lead.save();

    res.json(lead);
  } catch (err) {
    next(err);
  }
}
