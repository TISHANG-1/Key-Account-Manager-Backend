import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

export const generateToken = (id, email, role) => {
  return jwt.sign({ id, email, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const getHashedPassword = async (password) => {
  return await bcrypt.hash(password, 7);
};

export const verifyPassword = async (password, hashedPasssword) => {
  return await bcrypt.compare(password, hashedPasssword);
};
