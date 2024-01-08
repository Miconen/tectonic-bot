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
class Activate {
    @Slash({
        name: "activate",
        description:
            "Used for activating new guild members and giving access to rank points",
    })
    async Activate(
        @SlashOption({
            name: "username",
            description: "@User tag to activate",
            required: true,
            type: ApplicationCommandOptionType.User,
        })
        user: GuildMember,
        @SlashOption({
            name: "rsn",
            description: "RSN to add",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        rsn: string,
        interaction: CommandInteraction
    ) 
    {   
        
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
        
        // Add the user to the db
        var response:Response = new Response()
        try {
                    response = await fetch(`${API}/user`, {
                        method: 'POST', 
                        headers: {
                        'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                                guild_id: interaction.guildId,
                                user_id: user.id,
                            }),
                    });
        } catch (error) {
            console.error(error)
        }

        if (!response.ok) {

            // `❌ **${user.displayName}** is already activated`
            // TODO: figure out what can cause this error on the api side and what to repply

            warning.content = `Status: ${response.status} ${response.statusText}`;
            interaction.reply(warning)
            console.error(`Error making POST request to ${API}/user. Status: ${response.status} ${response.statusText} Body: ${JSON.stringify({
                guild_id: interaction.guildId,
                user_id: user.id,
              })}`)
        }

        // Add an rsn to the user
        response = await fetch(`${API}/rsn`, {
            method: 'POST', 
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                guild_id: interaction.guildId,
                user_id: user.id,
              }),
        });

        if (!response.ok) {
            warning.content = `Failed to add RSN (**${rsn}**) Status: ${response.status} ${response.statusText}`;
            interaction.reply(warning)
            console.error(`Error making POST request to ${API}/rsn. Status: ${response.status} ${response.statusText} Body: ${JSON.stringify({
                guild_id: interaction.guildId,
                user_id: user.id,
              })}`)
        }
        
        interaction.reply(`**${user.user}** has been activated and linked by **${interaction.member}**.`)
    }
}
