const TICK_LENGHT = 600

function ticksToTime(ticks: number | undefined) {
    if (!ticks) return
    const unixTimestamp = ticks * TICK_LENGHT
    const date = new Date(unixTimestamp)

    if (isNaN(date.getTime())) return

    let formattedString = ""
    const hours = date.getUTCHours()
    const minutes = date.getUTCMinutes()
    const seconds = date.getUTCSeconds()

    if (hours || minutes || seconds) {
        // Format hours
        if (hours != 0) {
            formattedString += hours + ":"
        }

        // Format minutes
        formattedString += (minutes < 10 ? "0" : "") + minutes + ":"

        // Format seconds
        formattedString += (seconds < 10 ? "0" : "") + seconds
    }

    // Format milliseconds
    formattedString += "." + ("00" + date.getMilliseconds()).slice(-3, -1)
    return formattedString
}

export default ticksToTime
