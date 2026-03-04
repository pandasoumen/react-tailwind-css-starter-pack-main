export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
      }

      if (req.user.isActive === false) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: account is blocked",
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };
};
