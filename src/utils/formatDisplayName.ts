import capitalizeFirstLetter from "./capitalizeFirstLetter.js";

function removeUnderscores(str: string): string {
  return str.replace(/_/g, " ");
}

export function formatDisplayName(str: string): string {
  return capitalizeFirstLetter(removeUnderscores(str));
}
