import pino from "pino";

export const rootLogger = pino({
	level: process.env.LOG_LEVEL || "info",
	// Add a prefix to messages if one exists
	formatters: {
		log: (obj) => {
			if (obj._logPrefix) {
				return { ...obj, msg: `${obj._logPrefix} ${obj.msg || ""}` };
			}
			return obj;
		},
	},
});
