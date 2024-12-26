import { PostgreSqlPool as pool } from "../database/database.js";

export const getAllPerformances = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM performance;");

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Performance data not found " });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching performance data:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const getPerformance = async (req, res) => {
  const { restaurant_id } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM performance WHERE restaurant_id = $1;",
      [restaurant_id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Performance data not found for this lead." });
    }

    res.status(200).json([result.rows[0]]);
  } catch (error) {
    console.error("Error fetching performance data:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const updatePerformance = async (req, res) => {
  const { restaurant_id } = req.params;
  const { performanceDetails = {} } = req.body;
  const {
    order_count = 0,
    order_value = 0,
    last_order_date = null,
  } = performanceDetails;

  try {
    const result = await pool.query(
      `UPDATE performance
       SET
         order_count = COALESCE($1, 0) ,
         order_value = COALESCE($2, 0) ,
         last_order_date = COALESCE($3, last_order_date)
       WHERE restaurant_id = $4
       RETURNING *;`,
      [order_count, order_value, last_order_date, restaurant_id]
    );
    console.log(result.rows[0]);
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Performance data not found for this lead." });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating performance data:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const getTopPerformingAccounts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT restaurant_id, order_value, order_count, last_order_date
       FROM performance
       WHERE order_value > $1 AND order_count > $2
       ORDER BY order_value DESC, order_count DESC
       LIMIT 10;`,
      [10000, 5]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "No high-performing accounts found." });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching top-performing accounts:", error.message);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const getTopPerformingAccountsUnderKAM = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const result = await pool.query(
      `SELECT rst.name as restaurant_name, prf.order_value, prf.order_count, prf.last_order_date
        FROM  leads rst
        JOIN performance prf ON prf.restaurant_id = rst.id
        WHERE rst.assigned_to = $3 AND (prf.order_value > $1 AND prf.order_count > $2)
        ORDER BY prf.order_value DESC, prf.order_count DESC
        LIMIT 10;`,
      [1000, 1, userId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "No high-performing accounts found." });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching top-performing accounts:", error.message);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const getOrderingPatterns = async (req, res) => {
  const { restaurant_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT
         EXTRACT(MONTH FROM last_order_date) AS month,
         COUNT(*) AS order_count,
         SUM(order_value) AS total_value
       FROM performance
       WHERE restaurant_id = $1
       GROUP BY month
       ORDER BY month;`,
      [restaurant_id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "No ordering patterns found for this restaurant." });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching ordering patterns:", error.message);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const getUnderperformingAccounts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT restaurant_id, order_value, order_count, last_order_date
       FROM performance
       WHERE order_value < $1 OR order_count < $2 OR last_order_date < NOW() - INTERVAL '30 days'
       ORDER BY last_order_date ASC, order_value ASC;`,
      [1000, 0]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "No underperforming accounts found." });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching underperforming accounts:", error.message);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const getUnderperformingAccountsUnderKAM = async (req, res) => {
  try {
    const { id: userId } = req.user;
    console.log(userId);
    const result = await pool.query(
      `SELECT rst.name as restaurant_name , prf.order_value, prf.order_count, prf.last_order_date, rst.assigned_to
       FROM leads rst
       JOIN performance prf
       ON rst.id =  prf.restaurant_id
       WHERE
       rst.assigned_to = $3
       AND
       (prf.order_value < $1 OR prf.order_count < $2
       OR prf.last_order_date < NOW() - INTERVAL '30 days')
       ORDER BY prf.last_order_date ASC, prf.order_value ASC;`,
      [1000, 0, userId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "No underperforming accounts found." });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching underperforming accounts:", error.message);
    res.status(500).json({ error: "Internal Server Error." });
  }
};
