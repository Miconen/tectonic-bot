import { formatDisplayName } from "@utils/formatDisplayName.js";

/**
 * Returns a human-readable label for a value type.
 * e.g. "time" -> "Time", "depth" -> "Depth"
 */
export function formatValueLabel(valueType: string): string {
  return formatDisplayName(valueType);
}
