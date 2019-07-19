const jwt = require("jsonwebtoken");
const secrets = process.env.JWT_SECRET || "lambda";

module.exports = (req, res, next) => {
  const token = req.headers.authorization;

  if (token) {
    jwt.verify(token, secrets, (err, payload) => {
      if (err) {
        res.status(403).json({ message: "Token not authorized." });
      } else {
        req.id = payload.id;
        next();
      }
    });
  } else {
    res.status(400).json({ message: "No credentials provided." });
  }
};
