import { PostgreSqlPool as pool } from "../database/database.js";
import {
  getHashedPassword,
  verifyPassword,
  generateToken,
} from "../services/user.js";

export const signUpUser = async (req, res) => {
  const { userDetails = {} } = req.body;
  const { email, password, name, contact_number } = userDetails;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email already in use" });
    }
    const hashedPassword = await getHashedPassword(password);

    const newUser = await pool.query(
      "INSERT INTO users (name , email, password) VALUES ($1, $2 , $3) RETURNING *",
      [name || "", email, hashedPassword]
    );

    const token = generateToken(
      newUser.rows[0].id,
      newUser.rows[0].email,
      user.rows[0]?.role
    );

    res.status(201).json({
      message: "User created successfully",
      token,
      role: newUser?.rows[0]?.role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const signInUser = async (req, res) => {
  const { userDetails } = req.body;
  const { email, password } = userDetails;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const validPassword = await verifyPassword(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = generateToken(
      user.rows[0].id,
      user.rows[0].email,
      user.rows[0]?.role
    );
    res
      .status(200)
      .json({ message: "Login successful", token, role: user.rows[0]?.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserDetails = async (req, res) => {
  const { id } = req.user;

  try {
    const user = await pool.query("SELECT * FROM users WHERE id = $1", [id]);

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUsersList = async (req, res) => {
  try {
    const users = await pool.query("SELECT id, email FROM users");

    if (users.rows.length === 0) {
      return res.status(404).json({ message: "Users not found" });
    }

    res.status(200).json(users.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
