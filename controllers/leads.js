import { PostgreSqlPool as pool } from "../database/database.js";

const statusEnum = ["New", "Contacted", "Qualified", "Converted", "Lost"];

export const createLead = async (req, res) => {
  const { leadDetails = {} } = req.body;
  const { id: userID } = req.user;
  const {
    name = null,
    address = null,
    contact_number = null,
    email = null,
  } = leadDetails;

  if (!name || !address || !contact_number || !email) {
    return res
      .status(400)
      .json({ error: "Restaurant's required field is missing." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO leads (name, address, contact_number, email, assigned_to)
       VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
      [name, address, contact_number, email, userID]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding lead:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const getAllLeads = async (req, res) => {
  const { id: userId } = req.user;
  try {
    const result = await pool.query(
      "SELECT * FROM leads where assigned_to = $1 ORDER BY created_at DESC;",
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ error: "Internal Server Error." + error });
  }
};

export const updateLead = async (req, res) => {
  const { leadDetails = {} } = req.body;
  const { id } = req.params;
  const {
    lead_status = null,
    name = null,
    email = null,
    contact_number = null,
    address = null,
    assigned_to = null,
  } = leadDetails;
  if (!lead_status || !id) {
    return res.status(400).json({ error: "Lead status and id is required." });
  }

  try {
    const { rows } = await pool.query(
      `SELECT lead_status FROM leads WHERE id = $1`,
      [id]
    );
    const { lead_status: prev_status } = rows[0];
    const index = statusEnum.findIndex((val) => val === prev_status);
    if (
      prev_status !== lead_status &&
      (index === -1 || (index !== -1 && lead_status !== "Lost"))
    ) {
      console.log(lead_status, index);
      if (lead_status !== statusEnum[(index + 1) % statusEnum.length]) {
        res
          .status(404)
          .json({ error: "Lead status can not be skipped to this state" });
        return;
      }
    }

    const result = await pool.query(
      `UPDATE leads
       SET lead_status = COALESCE($1 , lead_status),
       name = COALESCE($2, name),
       email = COALESCE($3, email),
       contact_number = COALESCE($4, contact_number),
       address = COALESCE($5, address),
       updated_at = now(),
       assigned_to = $7
       WHERE id = $6 RETURNING *;`,
      [lead_status, name, email, contact_number, address, id, assigned_to]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Lead not found." });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating lead:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const deleteLead = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM leads WHERE id = $1 RETURNING *;",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Lead not found." });
    }

    res
      .status(200)
      .json({ message: "Lead deleted successfully.", lead: result.rows[0] });
  } catch (error) {
    console.error("Error deleting lead:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const getLeadById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM leads WHERE id = $1;", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Lead not found." });
    }

    res
      .status(200)
      .json({ message: "Lead Fetched successfully.", lead: result.rows[0] });
  } catch (error) {
    console.error("Error deleting lead:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};
