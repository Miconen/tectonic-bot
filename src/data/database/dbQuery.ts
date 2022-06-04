import pool from './pooling.js';

const createQuery = async (
	QUERY: string,
	parameters: Array<string | number>
) => {
	let queryResponse: object = {};
	pool.getConnection((err, connection) => {
		if (err) throw err;

		connection.query(QUERY, parameters, (error, response, fields) => {
			connection.release();
			console.log(response);
			if (error) throw error;
			queryResponse = response;
		});
	});
	return queryResponse;
};

export default createQuery;
