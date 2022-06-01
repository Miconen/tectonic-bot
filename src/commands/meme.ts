import { Discord, Slash, SlashOption, SlashChoice } from "discordx";
import { TextChannel, VoiceChannel, CommandInteraction, GuildMember, Client, User, AutocompleteInteraction, Interaction } from "discord.js";

enum TextChoices {
    // WhatDiscordShows = value
    Hello = "Hello",
    "Good Bye" = "Good Bye",
  }
  
  @Discord()
  class Example {
    @Slash("hello")
    hello(
      @SlashChoice(
        {
          name: TextChoices[TextChoices.Hello],
          value: TextChoices.Hello,
        },
        {
          name: TextChoices[TextChoices["Good Bye"]],
          value: TextChoices["Good Bye"],
        }
      )
      @SlashChoice({ name: "How are you", value: "hay" })
      @SlashOption("text")
      text: string,
      interaction: CommandInteraction
    ) {
      interaction.reply(text);
    }
  }