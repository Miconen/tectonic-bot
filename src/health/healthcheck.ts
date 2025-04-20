import { Requests } from "@requests/main";
import { pino } from "pino";

const logger = pino();

let isHealthy = false;
let isChecked = false;

export async function checkHealth() {
	if (isChecked) {
		logger.debug({ healthy: isHealthy }, "Hit healthcheck cache");
		return isHealthy;
	}

	try {
		const user = await Requests.checkHealth();
		isHealthy = Boolean(user && !user.error && user.data);
	} catch (err) {
		logger.error({ error: err }, "Healthcheck failed with exception");
		isHealthy = false;
	}

	isChecked = true;

	setTimeout(() => {
		isChecked = false;
	}, 30 * 1000);

	logger.debug({ healthy: isHealthy }, "Performed fresh healthcheck");

	return isHealthy;
}
