const TICK_LENGHT = 600

function padTimeUnits(time: string): string {
  const units = time.split(":");
  
  // If hours are omitted, add them as 0
  if (units.length === 2) {
    units.unshift("0");
  }
  
  const paddedUnits = units.map(unit => unit.padStart(2, "0"));
  return paddedUnits.join(":");
}

function timeToTicks(time: string) {
    return Date.parse(`1970-01-01T${padTimeUnits(time)}Z`) / TICK_LENGHT
}

export default timeToTicks
