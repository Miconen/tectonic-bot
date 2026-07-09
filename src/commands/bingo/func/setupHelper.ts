import { Requests } from "@requests/main.js";
import { replyHandler } from "@utils/replyHandler.js";
import { getString } from "@utils/stringRepo.js";
import { getLogger } from "@logging/context.js";
import {
  ChannelType,
  OverwriteType,
  PermissionFlagsBits,
  type CommandInteraction,
  type Guild,
  type Role,
  type CategoryChannel,
} from "discord.js";

type TeamSetupResult = {
  teamName: string;
  role: Role;
  matched: string[];
  unmatched: string[];
};

function randomColor(): number {
  return Math.floor(Math.random() * 0xffffff);
}

export async function setupHelper(
  competitionId: number,
  textChannels: number,
  voiceChannels: number,
  interaction: CommandInteraction<"cached">
) {
  const logger = getLogger();
  const guild = interaction.guild;

  // 1. Fetch competition from WOM
  const compRes = await Requests.getCompetition(competitionId);
  if (compRes.error) {
    return await replyHandler(
      getString("errors", "competitionError"),
      interaction
    );
  }

  const competition = compRes.data;

  // 2. Group participants by team
  const teams = new Map<string, string[]>();
  for (const participation of competition.participations) {
    if (!participation.teamName) continue;
    const rsns = teams.get(participation.teamName) ?? [];
    rsns.push(participation.player.displayName);
    teams.set(participation.teamName, rsns);
  }

  if (teams.size === 0) {
    return await replyHandler(getString("bingo", "notTeamEvent"), interaction);
  }

  // 3. Create category
  const category = await guild.channels.create({
    name: competition.title,
    type: ChannelType.GuildCategory,
  });

  logger.info(
    { category: category.name, teams: teams.size },
    "Created bingo category"
  );

  // 4. Process each team
  const results: TeamSetupResult[] = [];

  for (const [teamName, rsns] of teams) {
    // Create role
    const role = await guild.roles.create({
      name: teamName,
      color: randomColor(),
      mentionable: true,
      reason: `Bingo setup: ${competition.title}`,
    });

    logger.info({ team: teamName, role: role.id }, "Created team role");

    // Match RSNs to Discord users and assign roles
    const matched: string[] = [];
    const unmatched: string[] = [];

    for (const rsn of rsns) {
      try {
        const userRes = await Requests.getUser(guild.id, {
          type: "rsn",
          rsn,
        });

        if (userRes.error || !userRes.data) {
          unmatched.push(rsn);
          continue;
        }

        const member = await guild.members
          .fetch(userRes.data.user_id)
          .catch(() => null);

        if (!member) {
          unmatched.push(rsn);
          continue;
        }

        await member.roles.add(role);
        matched.push(rsn);
        logger.debug(
          { rsn, userId: member.id, team: teamName },
          "Assigned team role"
        );
      } catch (err) {
        logger.warn({ err, rsn, team: teamName }, "Failed to match RSN");
        unmatched.push(rsn);
      }
    }

    // Create text channels
    for (let i = 0; i < textChannels; i++) {
      const channelName =
        textChannels === 1 ? teamName : `${teamName}-${i + 1}`;

      await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: category,
        permissionOverwrites: [
          {
            id: guild.id,
            type: OverwriteType.Role,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: role.id,
            type: OverwriteType.Role,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
            ],
          },
        ],
      });
    }

    // Create voice channels
    for (let i = 0; i < voiceChannels; i++) {
      const channelName =
        voiceChannels === 1 ? teamName : `${teamName} ${i + 1}`;

      await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildVoice,
        parent: category,
        permissionOverwrites: [
          {
            id: guild.id,
            type: OverwriteType.Role,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: role.id,
            type: OverwriteType.Role,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.Connect,
              PermissionFlagsBits.Speak,
            ],
          },
        ],
      });
    }

    results.push({ teamName, role, matched, unmatched });
  }

  // 5. Build response
  const response: string[] = [
    getString("bingo", "setupComplete", { name: competition.title }),
  ];

  for (const result of results) {
    const lines: string[] = [
      `\n**${result.teamName}** — <@&${result.role.id}>`,
    ];

    if (result.matched.length > 0) {
      lines.push(`✔ Matched: ${result.matched.join(", ")}`);
    }

    if (result.unmatched.length > 0) {
      lines.push(`❌ Unmatched: ${result.unmatched.join(", ")}`);
    }

    response.push(lines.join("\n"));
  }

  return await replyHandler(response.join("\n"), interaction);
}
