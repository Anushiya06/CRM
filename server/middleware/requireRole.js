// Middleware to check if the authenticated user has one of the allowed roles
export function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: Missing authentication credentials." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: `Forbidden: Access restricted. Requires roles: [${allowedRoles.join(", ")}]` });
    }

    next();
  };
}
