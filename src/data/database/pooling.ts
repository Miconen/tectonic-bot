import mysql from 'mysql';
const pool = mysql.createPool({
	connectionLimit: 10,
	host: 'db',
	user: 'root',
	password: 'root',
	database: 'tectonic',
});

export default pool;
