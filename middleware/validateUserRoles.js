export const roleMiddleware = (roles) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).send("Unauthorized");
    }
    if (!roles.includes(user.role)) {
      return res.status(403).send("Forbidden");
    }
    next();
  };
};
