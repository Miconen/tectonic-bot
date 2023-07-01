class TimeConverter {
    static timeToMilliseconds(time: string): number {
        const timeComponents = time.split(":")
        const numComponents = timeComponents.length

        let milliseconds = 0
        if (numComponents === 3) {
            const [hours, minutes, seconds] = timeComponents
            milliseconds =
                Number(hours) * 3600000 +
                Number(minutes) * 60000 +
                Number(seconds) * 1000
        } else if (numComponents === 2) {
            const [minutes, secondsAndMilliseconds] = timeComponents
            const [seconds, millisecondsStr] = secondsAndMilliseconds.split(".")
            const millisecondsPart = millisecondsStr
                ? Number(millisecondsStr)
                : 0
            milliseconds =
                Number(minutes) * 60000 +
                Number(seconds) * 1000 +
                millisecondsPart
        } else if (numComponents === 1) {
            const millisecondsStr = timeComponents[0]
            milliseconds = millisecondsStr ? Number(millisecondsStr) : 0
        }

        return milliseconds
    }

    static millisecondsToTime(milliseconds: number): string {
        const hours = Math.floor(milliseconds / 3600000)
        milliseconds %= 3600000
        const minutes = Math.floor(milliseconds / 60000)
        milliseconds %= 60000
        const seconds = Math.floor(milliseconds / 1000)
        milliseconds %= 1000
        const millisecondsStr = milliseconds.toString().padStart(2, "0")

        if (hours > 0) {
            return `${hours.toString().padStart(2, "0")}:${minutes
                .toString()
                .padStart(2, "0")}:${seconds
                .toString()
                .padStart(2, "0")}.${millisecondsStr}`
        } else if (minutes > 0) {
            return `${minutes.toString().padStart(2, "0")}:${seconds
                .toString()
                .padStart(2, "0")}.${millisecondsStr}`
        } else {
            return `${seconds.toString().padStart(2, "0")}.${millisecondsStr}`
        }
    }

    static timeToTicks(time: string): number {
        const totalMilliseconds = TimeConverter.timeToMilliseconds(time)
        const ticks = totalMilliseconds / 600
        return Math.floor(ticks)
    }

    static ticksToTime(ticks: number): string {
        const milliseconds = ticks * 600
        return TimeConverter.millisecondsToTime(milliseconds)
    }
}

function test(time: string) {
    const time2 = TimeConverter.timeToTicks(time)
    console.log(
        TimeConverter.timeToTicks(time),
        TimeConverter.ticksToTime(time2),
        time
    )
}

export default TimeConverter
