import { Discord, Guard, Slash, SlashOption } from "discordx"
import {
    ApplicationCommandOptionType,
    CommandInteraction,
    GuildMember,
    InteractionReplyOptions,
} from "discord.js"
import IsAdmin from "../guards/IsAdmin.js"

@Discord()
//@Guard(IsAdmin)
class Deactivate {
    @Slash({
        name: "deactivate",
        description:
            "Deactivate and remove all points/data entries associated with a user",
    })
    async Deactivate(
        @SlashOption({
            name: "username",
            description:
                "@User tag to deactivate, WARNING USERS POINTS WILL BE DELETED",
            required: true,
            type: ApplicationCommandOptionType.User,
        })
        user: GuildMember,
        interaction: CommandInteraction
    ) {
                
        const API = process.env.API
        var warning: InteractionReplyOptions = {
            content: "",
            ephemeral: true,
        }

        //verify guild is activated
        //TODO: make guard?
        if (!interaction.guild?.id){
            warning.content = "Failed to fetch guild id";
            interaction.reply(warning)
        }
        
        // Remove the user to the db
        var response = await fetch(`${API}/user`, {
            method: 'DELETE', 
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                    guild_id: interaction.guildId,
                    user_id: user.id,
                  }),
        });

        if (!response.ok) {

            // `❌ **${user.displayName}** is not activated.`
            // TODO: figure out what can cause this error on the api side and what to repply

            warning.content = `Status: ${response.status} ${response.statusText}`;
            interaction.reply(warning)
            console.error(`Error making DELETE request to ${API}/user. Status: ${response.status} ${response.statusText} Body: ${JSON.stringify({
                guild_id: interaction.guildId,
                user_id: user.id,
              })}`)
        }

        interaction.reply(`✔ **${user.displayName}** has been deactivated.`)
    }
}
