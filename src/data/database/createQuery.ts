import pool from './pooling.js';

const createQuery = (QUERY: string, parameters: Array<string | number>) => {
	return new Promise((resolve, reject) => {
		pool.query(QUERY, parameters, (error, response, fields) => {
			if (error) return reject(error);
			return resolve(response);
		});
	});
};

export default createQuery;
