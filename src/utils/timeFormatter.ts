/**
 * Converts a timestamp to "X hours and Y minutes ago" format
 * @param timestamp - Timestamp in milliseconds (from Date.now())
 * @returns Formatted string showing hours and minutes ago
 */
export function formatTimeAgo(timestamp: number): string {
	// Calculate the difference in milliseconds
	const now = Date.now();
	const diffMs = now - timestamp;

	// Convert to minutes and hours
	const diffMinutes = Math.floor(diffMs / 60000);
	const hours = Math.floor(diffMinutes / 60);
	const minutes = diffMinutes % 60;

	// Handle different cases for clean formatting
	if (hours === 0) {
		if (minutes === 0) {
			return "just now";
		} else if (minutes === 1) {
			return "1 minute ago";
		} else {
			return `${minutes} minutes ago`;
		}
	} else if (hours === 1) {
		if (minutes === 0) {
			return "1 hour ago";
		} else if (minutes === 1) {
			return "1 hour and 1 minute ago";
		} else {
			return `1 hour and ${minutes} minutes ago`;
		}
	} else {
		if (minutes === 0) {
			return `${hours} hours ago`;
		} else if (minutes === 1) {
			return `${hours} hours and 1 minute ago`;
		} else {
			return `${hours} hours and ${minutes} minutes ago`;
		}
	}
}
