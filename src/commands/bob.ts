import { Discord, Slash, SlashOption, SlashChoice } from "discordx";
import { TextChannel, VoiceChannel, CommandInteraction, GuildMember, User } from "discord.js";

@Discord()
class Example {
    @Slash("split")
    split(
      @SlashChoice({ name: "2-100m",    value: 10 })
      @SlashChoice({ name: "100-500m",  value: 20 })
      @SlashChoice({ name: "500m+",     value: 30 })
      @SlashOption("value", { description: "Value of the split drop?" })
      value: number,
      interaction: CommandInteraction
    ) {
      //logic and stuff have fun implementing it


      //db stuff have fun



      interaction.reply(`User has recived ${value} rank-points`);
      
    }
  }