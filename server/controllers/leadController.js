import Lead from "../models/Lead.js";
import Customer from "../models/Customer.js";

export async function webhook(req, res, next) {
  try {
    const { phone, message } = req.body;
    if (!phone || !message) return res.status(400).json({ message: "Phone and message are required" });

    const text = String(message).toLowerCase();
    const isPurchaseIntent = text.includes("buy") || text.includes("price");

    const lead = await Lead.findOneAndUpdate(
      { phone },
      {
        phone,
        lastMessage: message,
        status: isPurchaseIntent ? "HOT" : "WARM",
        intent: isPurchaseIntent ? "PURCHASE" : "GENERAL"
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json(lead);
  } catch (err) {
    next(err);
  }
}

export async function listLeads(_req, res, next) {
  try {
    const leads = await Lead.find().sort({ updatedAt: -1 });
    res.json(leads);
  } catch (err) {
    next(err);
  }
}

// Backward compatible with: POST /api/customers/from-lead/:leadId
export async function convertFromLead(req, res, next) {
  try {
    const { leadId } = req.params;

    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    const customer = await Customer.findOneAndUpdate(
      { phone: lead.phone },
      {
        name: req.body?.name || `Customer ${lead.phone}`,
        phone: lead.phone,
        email: req.body?.email || ""
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    lead.status = "CONVERTED";
    await lead.save();

    res.status(201).json(customer);
  } catch (err) {
    next(err);
  }
}

