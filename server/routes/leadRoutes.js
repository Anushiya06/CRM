import express from "express";
import { webhook, listLeads, convertFromLead } from "../controllers/leadController.js";
import { 
  addNote, 
  logCall, 
  logMeeting, 
  addReminder, 
  toggleReminder 
} from "../controllers/leadActivityController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

// Public webhook route (upserts lead from external events)
router.post("/webhook", webhook);

// Internal routes protected by JWT and role authorization (OWNER & SALES_EXEC only)
router.use(requireAuth);
router.use(requireRole(["OWNER", "SALES_EXEC"]));

router.get("/leads", listLeads); // mapped to /api/leads
router.post("/customers/from-lead/:leadId", convertFromLead);

// Activity logs endpoints (REST mapping: /api/leads/:id/...)
router.post("/leads/:id/notes", addNote);
router.post("/leads/:id/calls", logCall);
router.post("/leads/:id/meetings", logMeeting);
router.post("/leads/:id/reminders", addReminder);
router.patch("/leads/:id/reminders/:reminderId", toggleReminder);

export default router;
