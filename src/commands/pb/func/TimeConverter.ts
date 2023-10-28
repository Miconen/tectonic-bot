class TimeConverter {
    static readonly HOUR: number = 3600000
    static readonly MINUTE: number = 60000
    static readonly SECOND: number = 1000
    /** A singular game tick, one 100th of a minute. */
    static readonly TICK: number = 600

    static timeToMilliseconds(time: string): number {
        const timeComponents = time.split(":")
        const numComponents = timeComponents.length

        let milliseconds = 0
        if (numComponents === 3) {
            const [hours, minutes, seconds] = timeComponents
            milliseconds =
                Number(hours) * TimeConverter.HOUR +
                Number(minutes) * TimeConverter.MINUTE +
                Number(seconds) * TimeConverter.SECOND
        } else if (numComponents === 2) {
            const [minutes, secondsAndMilliseconds] = timeComponents
            const [seconds, millisecondsStr] = secondsAndMilliseconds.split(".")
            const millisecondsPart = millisecondsStr
                ? Number(millisecondsStr.padEnd(3, "0"))
                : 0
            milliseconds =
                Number(minutes) * TimeConverter.MINUTE +
                Number(seconds) * TimeConverter.SECOND +
                millisecondsPart
        } else if (numComponents === 1) {
            const millisecondsStr = timeComponents[0]
            milliseconds = millisecondsStr ? Number(millisecondsStr) : 0
        }

        return milliseconds
    }

    static millisecondsToTime(milliseconds: number): string {
        const hours = Math.floor(milliseconds / TimeConverter.HOUR)
        milliseconds %= TimeConverter.HOUR
        const minutes = Math.floor(milliseconds / TimeConverter.MINUTE)
        milliseconds %= TimeConverter.MINUTE
        const seconds = Math.floor(milliseconds / TimeConverter.SECOND)
        milliseconds %= TimeConverter.SECOND
        const millisecondsStr = milliseconds.toString().padStart(2, "0").slice(0, 2);

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
        const ticks = totalMilliseconds / TimeConverter.TICK
        return Math.ceil(ticks)
    }

    static ticksToTime(ticks: number): string {
        const milliseconds = ticks * TimeConverter.TICK
        return TimeConverter.millisecondsToTime(milliseconds)
    }
}

export default TimeConverter
