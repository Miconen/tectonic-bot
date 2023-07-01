const TICK_LENGHT = 600;

function timeToTicks(time: string) {
    return Date.parse(`1970-01-01T00:${time}Z`) / TICK_LENGHT;
}

export default timeToTicks;
