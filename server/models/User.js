import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["OWNER", "SALES_EXEC", "CASHIER"], default: "SALES_EXEC" }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);

