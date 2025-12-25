import oracledb from "oracledb";
import dotenv from "dotenv";

dotenv.config();

const {
  ORACLE_USER = "front",
  ORACLE_PASSWORD = "back",
  ORACLE_CONNECT_STRING = "localhost/XEPDB1",
} = process.env;

/**
 * Get an Oracle connection. The caller is responsible for closing it.
 */
export async function getConnection() {
  try {
    return await oracledb.getConnection({
      user: ORACLE_USER,
      password: ORACLE_PASSWORD,
      connectString: ORACLE_CONNECT_STRING,
    });
  } catch (err) {
    console.error("Oracle connection failed", err);
    throw err;
  }
}
