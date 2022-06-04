// import postgres from 'pg';
// const { Pool } = postgres;
import mysql from 'mysql';
const pool = mysql.createPool({
	connectionLimit: 10,
	host: 'db',
	user: 'root',
	password: 'root',
	database: 'tectonic',
});

export default pool;

pool.on('acquire', function (connection) {
	console.log('Connection %d acquired', connection.threadId);
});

pool.on('connection', function (connection) {
	connection.query('SET SESSION auto_increment_increment=1');
});

pool.on('release', function (connection) {
	console.log('Connection %d released', connection.threadId);
});

pool.on('enqueue', function () {
	console.log('Waiting for available connection slot');
});
