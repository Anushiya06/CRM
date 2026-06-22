import mongoose from "mongoose";

const khataAccountSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true, unique: true },
    creditBalance: { type: Number, default: 0 },
    transactionHistory: [
      {
        date: { type: Date, default: Date.now },
        amount: { type: Number, required: true },
        type: { type: String, enum: ["CREDIT", "DEBIT"], required: true }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("KhataAccount", khataAccountSchema);

