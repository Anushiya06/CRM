import Product from "../models/Product.js";
import Sale from "../models/Sale.js";
import Customer from "../models/Customer.js";
import KhataAccount from "../models/KhataAccount.js";

export async function createSale(req, res, next) {
  try {
    const { customerId, items, paymentMode } = req.body;
    if (!customerId || !items?.length || !["CASH", "CREDIT"].includes(paymentMode)) {
      return res.status(400).json({ message: "Customer, items, and payment mode are required" });
    }

    let totalAmount = 0;
    const saleItems = [];

    // NOTE: This keeps the same behavior as the original monolith (no transaction session).
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      if (product.stockQuantity < item.qty) throw new Error(`Not enough stock for ${product.name}`);

      product.stockQuantity -= item.qty;
      await product.save();

      const linePrice = Number(item.price ?? product.price);
      totalAmount += linePrice * item.qty;
      saleItems.push({ productId: product._id, qty: item.qty, price: linePrice });
    }

    const invoiceNo = `INV-${Date.now()}`;
    const sale = await Sale.create({ customerId, items: saleItems, totalAmount, paymentMode, invoiceNo });

    await Customer.findByIdAndUpdate(customerId, { $inc: { lifetimeSpent: totalAmount } });

    if (paymentMode === "CREDIT") {
      await KhataAccount.findOneAndUpdate(
        { customerId },
        {
          $inc: { creditBalance: totalAmount },
          $push: { transactionHistory: { amount: totalAmount, type: "CREDIT" } }
        },
        { upsert: true, new: true }
      );
    }

    res.status(201).json(sale);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

