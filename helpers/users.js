const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const privateKey = process.env.PRIVATE_KEY

const calculateJWTToken = (user) => {
  return jwt.sign({ email: user.email, id: user.id }, privateKey);
};

const decodeUserFromJWT = (token) => {
  return jwt.decode(token);
};

module.exports = { calculateJWTToken, decodeUserFromJWT };
