import "reflect-metadata"

import { dirname, importx } from "@discordx/importer"
import { Interaction, Message } from "discord.js"
import { IntentsBitField } from "discord.js"
import { Client } from "discordx"
import "dotenv/config"
import { RankService } from "./utils/rankUtils/RankService.js"
import { PointService } from "./utils/pointUtils/PointService.js"
import { UserService } from "./utils/userUtils/UserService.js"
import { Database } from "./database/Database.js"
import { container } from "tsyringe"


// TEMPORARY FIX TO THIS: https://github.com/oceanroleplay/discord.ts/issues/840
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;import events from "events"
(BigInt.prototype as any).toJSON = function () {
    return this.toString()
}

export const bot = new Client({
    // To only use global commands (use @Guild for specific guild command), comment this line
    botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],

    // Discord intents
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.GuildPresences, // ADD THIS
    ],

    // Debug logs are disabled in silent mode
    silent: false,

    // Configuration for @SimpleCommand
    simpleCommand: {
        prefix: "!",
    },
})

bot.once("ready", async () => {
    // Make sure all guilds are cached
    await bot.guilds.fetch()

    // Synchronize applications commands with Discord
    await bot.initApplicationCommands()


    // To clear all guild commands, uncomment this line,
    // This is useful when moving from guild commands to global commands
    // It must only be executed once

    // await bot.clearApplicationCommands(...bot.guilds.cache.map((g) => g.id));

    console.log("Bot started")
})

bot.on("interactionCreate", (interaction: Interaction) => {
    bot.executeInteraction(interaction)
})

bot.on("messageCreate", (message: Message) => {
    bot.executeCommand(message)
})


async function run() {
    container.registerSingleton("Database", Database)
    container.registerSingleton("RankService", RankService)
    container.registerSingleton("PointService", PointService)
    container.registerSingleton("UserService", UserService)

    // Import commands
    await importx(dirname(import.meta.url) + "/{events,commands}/**/**/*.{ts,js}")
    // Let's start the bot
    if (!process.env.BOT_TOKEN) {
        throw Error("Could not find BOT_TOKEN in your environment")
    }

    // Log in with your bot token
    await bot.login(process.env.BOT_TOKEN)
}

run()
