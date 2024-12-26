import { configDotenv } from "dotenv";
import pkg from "pg";
const { Client } = pkg;
configDotenv({});

const establishPostgreConnection = () => {
  try {
    let pool = new Client({
      connectionString: process.env.POSTGRESQL_URL,
    });
    pool.connect();
    return pool;
  } catch (e) {
    console.error(e);
  }
};

export const PostgreSqlPool = establishPostgreConnection();
