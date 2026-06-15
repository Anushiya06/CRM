import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/crm_khata")
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection failed:", error.message));

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, default: "STAFF" }
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    price: { type: Number, required: true, min: 0 },
    stockQuantity: { type: Number, required: true, min: 0 }
  },
  { timestamps: true }
);

const leadSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true },
    lastMessage: String,
    status: { type: String, enum: ["WARM", "HOT", "CONVERTED"], default: "WARM" },
    intent: { type: String, default: "GENERAL" }
  },
  { timestamps: true }
);

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: String,
    lifetimeSpent: { type: Number, default: 0 }
  },
  { timestamps: true }
);

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

const User = mongoose.model("User", userSchema);
const Product = mongoose.model("Product", productSchema);
const Lead = mongoose.model("Lead", leadSchema);
const Customer = mongoose.model("Customer", customerSchema);
const Sale = mongoose.model("Sale", saleSchema);
const KhataAccount = mongoose.model("KhataAccount", khataAccountSchema);

const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

const makeToken = (user) =>
  jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Name, email, and password are required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role: role || "STAFF" });

    res.status(201).json({
      token: makeToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      token: makeToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/webhook", async (req, res) => {
  try {
    const { phone, message } = req.body;
    if (!phone || !message) return res.status(400).json({ message: "Phone and message are required" });

    const text = message.toLowerCase();
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.use("/api", requireAuth);

app.post("/api/customers/from-lead/:leadId", async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.leadId);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    const customer = await Customer.findOneAndUpdate(
      { phone: lead.phone },
      {
        name: req.body.name || `Customer ${lead.phone}`,
        phone: lead.phone,
        email: req.body.email || ""
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    lead.status = "CONVERTED";
    await lead.save();

    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/leads", async (_req, res) => {
  const leads = await Lead.find().sort({ updatedAt: -1 });
  res.json(leads);
});

app.get("/api/customers", async (_req, res) => {
  const customers = await Customer.find().sort({ createdAt: -1 });
  res.json(customers);
});

app.get("/api/products", async (_req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});

app.post("/api/products", async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post("/api/sales", async (req, res) => {
  try {
    const { customerId, items, paymentMode } = req.body;
    if (!customerId || !items?.length || !["CASH", "CREDIT"].includes(paymentMode)) {
      return res.status(400).json({ message: "Customer, items, and payment mode are required" });
    }

    let totalAmount = 0;
    const saleItems = [];

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
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/api/khata", async (_req, res) => {
  const accounts = await KhataAccount.find({ creditBalance: { $gt: 0 } })
    .populate("customerId", "name phone email")
    .sort({ updatedAt: -1 });
  res.json(accounts);
});

app.post("/api/khata", async (req, res) => {
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/dashboard", async (_req, res) => {
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
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
