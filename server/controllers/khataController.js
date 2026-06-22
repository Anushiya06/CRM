import KhataAccount from "../models/KhataAccount.js";

export async function listKhataAccounts(_req, res, next) {
  try {
    const accounts = await KhataAccount.find({ creditBalance: { $gt: 0 } })
      .populate("customerId", "name phone email")
      .sort({ updatedAt: -1 });
    res.json(accounts);
  } catch (err) {
    next(err);
  }
}

export async function applyKhataPayment(req, res, next) {
  try {
    const { customerId, amount } = req.body;
    const payment = Number(amount);
    if (!customerId || payment <= 0) return res.status(400).json({ message: "Customer and payment amount are required" });

    const account = await KhataAccount.findOneAndUpdate(
      { customerId },
      {
        $inc: { creditBalance: -payment },
        $push: { transactionHistory: { amount: payment, type: "DEBIT" } }
      },
      { new: true }
    ).populate("customerId", "name phone email");

    if (!account) return res.status(404).json({ message: "Khata account not found" });

    if (account.creditBalance < 0) {
      account.creditBalance = 0;
      await account.save();
    }

    res.json(account);
  } catch (err) {
    next(err);
  }
}

export async function listDefaulters(_req, res, next) {
  try {
    const accounts = await KhataAccount.find({ creditBalance: { $gt: 0 } })
      .populate("customerId", "name phone email")
      .sort({ creditBalance: -1 }); // Highest dues first
    res.json(accounts);
  } catch (err) {
    next(err);
  }
}


