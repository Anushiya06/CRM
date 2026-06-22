import Sale from "../models/Sale.js";
import KhataAccount from "../models/KhataAccount.js";
import Lead from "../models/Lead.js";
import Product from "../models/Product.js";

export async function getDashboard(_req, res, next) {
  try {
    const [salesAgg, khataAgg, hotLeadsCount, lowStockCount, recentSales] = await Promise.all([
      Sale.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
      KhataAccount.aggregate([{ $group: { _id: null, total: { $sum: "$creditBalance" } } }]),
      Lead.countDocuments({ status: "HOT" }),
      Product.countDocuments({ stockQuantity: { $lte: 5 } }),
      Sale.find().sort({ createdAt: -1 }).limit(8).populate("customerId", "name")
    ]);

    res.json({
      totalRevenue: salesAgg[0]?.total || 0,
      outstandingCredits: khataAgg[0]?.total || 0,
      hotLeadsCount,
      lowStockCount,
      recentSales
    });
  } catch (err) {
    next(err);
  }
}

