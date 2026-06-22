import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: String,
    lifetimeSpent: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("Customer", customerSchema);

