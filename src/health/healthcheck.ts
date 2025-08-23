import { getLogger } from "@logging/context";
import { Requests } from "@requests/main";

let isHealthy = false;
let isChecked = false;

export async function checkHealth() {
	const logger = getLogger();

	if (isChecked) {
		logger.debug({ healthy: isHealthy }, "Hit healthcheck cache");
		return isHealthy;
	}

	try {
		logger.debug({ healthy: isHealthy }, "Starting healthcheck");
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
