import jwt from "jsonwebtoken";

export function makeToken(user) {
  const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

