const jwt = require('jsonwebtoken');
const { randomUUID } = require('node:crypto');
module.exports = (userId, tokenVersion = 0) => jwt.sign({ userId, tokenVersion }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN || '7d', jwtid: randomUUID(),
});
