import { Discord, On, ArgsOf } from "discordx"

@Discord()
class guildMemberRemove {
    @On({ event: "guildMemberRemove" })
    onGuildMemberRemove([message]: ArgsOf<"guildMemberRemove">) {
        const API = process.env.API
        let request_url = `${API}/user?guild_id=${message.guild.id}&user_id=${message.user.id}`

        // Removes the user to the db
        fetch(request_url, { method: "DELETE" })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Bad response")
                }
            })
            .catch((error) => {
                console.error(error)
                console.error(`Request failed\nRequest_url:\n`, request_url)
                return
            })
    }
}
