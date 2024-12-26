import { PostgreSqlPool as pool } from "../database/database.js";

export const createInteraction = async (req, res) => {
  const { interactionDetails = {} } = req.body;
  const {
    restaurant_id = null,
    contact_id = null,
    type = null,
    details = null,
    date = null,
    order_value = null,
  } = interactionDetails;

  if (!restaurant_id || !contact_id || !type) {
    return res.status(400).json({
      error: "Lead ID, Contact ID and interaction type are required.",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO interactions (restaurant_id, contact_id , type, details, date, order_value)
       VALUES ($1, $2, $3, $4, $5,  $6) RETURNING *;`,
      [restaurant_id, contact_id, type, details, date, order_value]
    );
    const { rows } = await pool.query(
      "SELECT * FROM performance WHERE restaurant_id = $1",
      [restaurant_id]
    );
    if (rows.length === 0) {
      await pool.query(
        `INSERT INTO performance (restaurant_id , order_count , order_value)
       VALUES ($1 , $2 , $3) RETURNING *;`,
        [restaurant_id, order_value ? 1 : 0, order_value || 0]
      );
    }
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error recording interaction:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const getInteractionForLead = async (req, res) => {
  const { restaurant_id } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM interactions WHERE restaurant_id = $1 ORDER BY date DESC;",
      [restaurant_id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching interactions:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const updateInteraction = async (req, res) => {
  const { interactionDetails = {} } = req.body;
  const { id = null } = req.params;
  const {
    restaurant_id = null,
    contact_id = null,
    type = null,
    details = null,
    date = null,
    order_value = null,
  } = interactionDetails;

  if (!id || !type) {
    return res.status(400).json({ error: "Required details are missing" });
  }

  try {
    const { rows } = await pool.query(
      "SELECT * FROM  interactions WHERE id = $1",
      [id]
    );

    const { order_value: prev_order_value } = rows[0];
    const result = await pool.query(
      `UPDATE interactions
       SET
       order_value = COALESCE ($1, order_value),
       details = COALESCE($2, details),
       date = COALESCE($3, date),
       type = COALESCE($4, type),
       contact_id = COALESCE($5, contact_id)
       WHERE id = $6
       RETURNING *;`,
      [order_value, details, date, type, contact_id, id]
    );

    if (order_value) {
      await pool.query(
        `UPDATE performance
         SET
         order_value = $1 + order_value - COALESCE($3, 0),
         order_count = order_count + 1 - CASE WHEN $3 IS NOT NULL THEN 1 ELSE 0 END,
         last_order_date = $4
         WHERE restaurant_id = $2`,
        [order_value, restaurant_id, prev_order_value, date]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Interaction not found." });
    }

    res.status(200).json({
      message: "Interaction updated successfully.",
      interaction: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating interaction:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const deleteInteraction = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM interactions WHERE id = $1 RETURNING *;",
      [id]
    );
    const { order_value, restaurant_id } = result.rows[0];
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Interaction not found." });
    }

    if (order_value) {
      await pool.query(
        `UPDATE performance
         SET
         order_value =  order_value - $1,
         order_count = order_count - CASE WHEN $1 IS NOT NULL THEN 1 ELSE 0 END
         WHERE restaurant_id = $2`,
        [order_value, restaurant_id]
      );
    }
    res.status(200).json({
      message: "Interaction deleted successfully.",
      interaction: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting interaction:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};
