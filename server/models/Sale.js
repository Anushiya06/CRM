import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        qty: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 }
      }
    ],
    totalAmount: { type: Number, required: true, min: 0 },
    paymentMode: { type: String, enum: ["CASH", "CREDIT"], required: true },
    invoiceNo: { type: String, required: true, unique: true }
  },
  { timestamps: true }
);

export default mongoose.model("Sale", saleSchema);

