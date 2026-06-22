import Customer from "../models/Customer.js";

export async function listCustomers(_req, res, next) {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    next(err);
  }
}

export async function getCustomerById(req, res, next) {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  } catch (err) {
    next(err);
  }
}

export async function createCustomer(req, res, next) {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export async function updateCustomer(req, res, next) {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export async function deleteCustomer(req, res, next) {
  try {
    const deleted = await Customer.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Customer not found" });
    res.json({ message: "Customer deleted" });
  } catch (err) {
    next(err);
  }
}

