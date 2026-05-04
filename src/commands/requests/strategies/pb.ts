import submitHandler from "@commands/pb/func/submitHandler";
import type { PbRequest } from "@typings/requestTypes";
import { getString } from "@utils/stringRepo";
import type { RequestStrategy } from "./strategies";

export const pbStrategy: RequestStrategy<PbRequest> = {
  async accept(interaction, data) {
    return submitHandler(data.boss, data.time, data.team, interaction);
  },
  denyMessage(data) {
    return getString("pb", "denied", {
      bossTitle: data.bossTitle,
      sourceName: data.sourceName,
      points: data.points,
    });
  },
  label(data) {
    return `PB: ${data.boss} ${data.time} — ${data.team.length} players`;
  },
};
