const roleIds = new Map<string, string>();

roleIds.set("jade", "989916229588365384");
roleIds.set("red_topaz", "989916991164928031");
roleIds.set("sapphire", "989917487829229600");
roleIds.set("emerald", "989917954424578058");
roleIds.set("ruby", "989918030446346290");
roleIds.set("diamond", "989918133500403713");
roleIds.set("dragonstone", "989918207735377952");
roleIds.set("onyx", "989917139836235826");
roleIds.set("zenyte", "989917779928940585");

const roleValues = new Map<number, string>();

roleValues.set(0, "jade");
roleValues.set(50, "red_topaz");
roleValues.set(100, "sapphire");
roleValues.set(200, "emerald");
roleValues.set(400, "ruby");
roleValues.set(600, "diamond");
roleValues.set(800, "dragonstone");
roleValues.set(1000, "onyx");
roleValues.set(1250, "zenyte");

const roleValuesByName = new Map<string, number>();

roleValuesByName.set("jade", 0);
roleValuesByName.set("red_topaz", 50);
roleValuesByName.set("sapphire", 100);
roleValuesByName.set("emerald", 200);
roleValuesByName.set("ruby", 400);
roleValuesByName.set("diamond", 600);
roleValuesByName.set("dragonstone", 800);
roleValuesByName.set("onyx", 1000);
roleValuesByName.set("zenyte", 1250);

export { roleIds, roleValues, roleValuesByName };
