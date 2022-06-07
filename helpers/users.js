const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const PRIVATE_KEY = "superSecretStringNowoneShouldKnowOrTheCanGenerateTokens";

const calculateJWTToken = (user) => {
  return jwt.sign({ email: user.email, id: user.id }, PRIVATE_KEY);
};

const decodeUserFromJWT = (token) => {
  return jwt.decode(token);
};

module.exports = { calculateJWTToken, decodeUserFromJWT };
