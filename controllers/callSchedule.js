import { PostgreSqlPool as pool } from "../database/database.js";
import { convertToUTC, getNextDateUTC } from "../services/time.js";

export const scheduleCall = async (req, res) => {
  const { id: userId } = req.user;
  const { callDetails } = req.body;
  const {
    restaurant_id = null,
    call_frequency = null,
    next_call_date = null,
    kam_id = null,
  } = callDetails;
  const next_call_date_utc = convertToUTC(next_call_date);
  if (!restaurant_id || !call_frequency || !next_call_date) {
    return res.status(400).json({
      error: "Lead ID, call frequency, and next call date are required.",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO call_schedule
       (restaurant_id,
        call_frequency,
        next_call_date,
        kam_id)
       VALUES ($1, $2, $3, $4) RETURNING *;`,
      [restaurant_id, call_frequency, next_call_date_utc, kam_id || userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error scheduling call:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const getScheduleCallsForLead = async (req, res) => {
  try {
    const { restaurant_id } = req.params;
    const result = await pool.query(
      "SELECT * FROM call_schedule  WHERE restaurant_id = $1 ORDER BY next_call_date ASC;",
      [restaurant_id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching call schedules:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const getScheduleCallsForKAM = async (req, res) => {
  try {
    const { id } = req.user;
    const result = await pool.query(
      "SELECT * FROM call_schedule where kam_id = $1 ORDER BY next_call_date ASC ;",
      [id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching call schedules:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const updateCallSchedule = async (req, res) => {
  const { callDetails } = req.body;
  const {
    id = null,
    call_frequency = null,
    next_call_date = null,
    kam_id = null,
  } = callDetails;
  const next_call_date_utc = convertToUTC(next_call_date);
  try {
    const result = await pool.query(
      `UPDATE call_schedule
       SET
       call_frequency = COALESCE($1, call_frequency),
       last_called_date = CASE
                              WHEN next_call_date = $2 OR next_call_date IS NULL
                              THEN last_called_date
                              ELSE next_call_date
                          END,
       next_call_date = COALESCE($2, next_call_date),
       kam_id = COALESCE($3, kam_id)
       WHERE id = $4
       RETURNING *;`,
      [call_frequency, next_call_date_utc, kam_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Call schedule not found." });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating call schedule:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const markCallAttended = async (req, res) => {
  const { id } = req.params;
  const { callDetails = {} } = req.body;
  const { call_frequency = null, next_call_date = null } = callDetails;
  const next_call_date_utc = getNextDateUTC(next_call_date, call_frequency);
  try {
    const result = await pool.query(
      `UPDATE call_schedule
       SET
       last_called_date = CASE
                              WHEN next_call_date = $1 OR next_call_date IS NULL
                              THEN last_called_date
                              ELSE next_call_date
                          END,
       next_call_date = COALESCE($1, next_call_date)
       WHERE id = $2
       RETURNING *;`,
      [next_call_date_utc, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Call schedule not found." });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating call schedule:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const deleteCallSchedule = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM call_schedule WHERE id = $1 RETURNING *;",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Call schedule not found." });
    }

    res.status(200).json({
      message: "Call schedule deleted successfully.",
      schedule: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting call schedule:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const getCallsForToday = async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const StartUTC = new Date(thirtyDaysAgo).setUTCHours(0, 0, 0, 0);
    const todayEndUTC = new Date().setUTCHours(23, 59, 59, 999);
    const { id } = req.user;
    const result = await pool.query(
      `SELECT *
       FROM call_schedule
       WHERE next_call_date BETWEEN $1 AND $2
       AND kam_id = $3
       ORDER BY next_call_date ASC;`,
      [new Date(StartUTC), new Date(todayEndUTC), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No calls scheduled for today." });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching today's calls:", error.message);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const getCallsWithLeadToday = async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const StartUTC = new Date(thirtyDaysAgo).setUTCHours(0, 0, 0, 0);
    const todayEndUTC = new Date().setUTCHours(23, 59, 59, 999);
    // console.log(StartUTC);
    const { id } = req.user;
    const { id: restaurant_id } = req.params;
    const result = await pool.query(
      `SELECT *
       FROM call_schedule
       WHERE next_call_date BETWEEN $1 AND $2
       AND kam_id = $3
       AND restaurant_id = $4
       ORDER BY next_call_date ASC;`,
      [new Date(StartUTC), new Date(todayEndUTC), id, restaurant_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No calls scheduled for today." });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching today's calls:", error.message);
    res.status(500).json({ error: "Internal Server Error." });
  }
};
