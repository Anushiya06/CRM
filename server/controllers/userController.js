import User from "../models/User.js";

// List all users in system registry (excl. passwords)
export async function listUsers(req, res, next) {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
}

// Modify user roles
export async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !["OWNER", "SALES_EXEC", "CASHIER"].includes(role)) {
      return res.status(400).json({ message: "Invalid or unsupported system role." });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User account not found." });

    user.role = role;
    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    next(err);
  }
}

// Delete user account from registry
export async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;

    if (String(req.user.id) === String(id)) {
      return res.status(400).json({ message: "Administrators cannot delete their own active account." });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: "User account not found." });

    res.json({ message: "User deleted successfully from records." });
  } catch (err) {
    next(err);
  }
}
