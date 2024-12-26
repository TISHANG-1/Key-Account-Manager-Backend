import { PostgreSqlPool as pool } from "../database/database.js";
const rolesEnum = ["Employee", "Manager", "Owner"];

export const createContact = async (req, res) => {
  const { contactDetails = {} } = req.body;
  const {
    restaurant_id = null,
    name = null,
    role = null,
    email = null,
    contact_number = null,
  } = contactDetails;

  if (!restaurant_id || !name || !email || !contact_number) {
    return res.status(400).json({ error: "Required Fields are missing." });
  }

  try {
    console.log("here");
    const result = await pool.query(
      `INSERT INTO contacts (restaurant_id, name, role, email, contact_number)
       VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
      [restaurant_id, name, role || rolesEnum[0], email, contact_number]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding contact:", error);
    res.status(500).json({ error: "Internal Server Error." + error });
  }
};

export const getContactsForLead = async (req, res) => {
  const { restaurant_id = null } = req.params;

  try {
    if (!restaurant_id) {
      return res.status(404).json({ error: "Contacts not found." });
    }
    const result = await pool.query(
      `SELECT * FROM contacts WHERE restaurant_id = $1 ORDER BY created_at DESC;`,
      [restaurant_id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({
      error: "Internal Server Error." + "Error fetching contact:" + error,
    });
  }
};

export const updateContact = async (req, res) => {
  const { contactDetails = {} } = req.body;
  const {
    id = null,
    name = null,
    role = null,
    email = null,
    contact_number = null,
  } = contactDetails;
  if (!id) {
    return res.status(404).json({ error: "Contact not found. Id is null" });
  }
  try {
    const result = await pool.query(
      `UPDATE contacts
       SET
           contact_number = COALESCE($1, contact_number),
           role = COALESCE($2 , role),
           email = COALESCE($3 , email),
           name= COALESCE($4, name),
           updated_at = now()
       WHERE id = $5 RETURNING *;`,
      [contact_number, role, email, name, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Contact not found." });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating contact:", error);
    res.status(500).json({
      error: "Internal Server Error." + "Error updating contact:" + error,
    });
  }
};

export const deleteContact = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM contacts WHERE id = $1 RETURNING *;",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Contact not found." });
    }

    res.status(200).json({
      message: "Contact deleted successfully.",
      contact: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({
      error: "Internal Server Error." + "Error deleting contact:" + error,
    });
  }
};
