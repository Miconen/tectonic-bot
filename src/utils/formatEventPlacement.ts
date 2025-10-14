import { getString } from "./stringRepo"

const placements = new Map([
	[1, "st"],
	[2, "nd"],
	[3, "rd"],
])

const emojis = new Map([
	[1, "🥇"],
	[2, "🥈"],
	[3, "🥉"],
])

function getPlacementString(place: number) {
	if (!placements.has(place)) return 'th'
	return placements.get(place)
}

function getPlacementEmoji(place: number) {
	if (!emojis.has(place)) return ''
	return emojis.get(place)
}

export function formatPlacement(place: number, winner: boolean) {
	if (winner) {
		return getString("profile", "eventWinnerChunk")
	}

	const suffix = getPlacementString(place)
	const emoji = getPlacementEmoji(place)
	return getString("profile", "eventPlacementChunk", {
		emoji,
		placement: place,
		suffix
	})
}
