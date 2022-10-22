import "dotenv/config";
import mysql from "mysql";
const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.MYSQLHOST ?? "localhost",
    port: Number.parseInt(process.env.MYSQLPORT ?? "3306"),
    user: process.env.MYSQLUSER ?? "root",
    password: process.env.MYSQLPASSWORD ?? "root",
    database: process.env.MYSQLDATABASE ?? "tectonic",
});

export default pool;