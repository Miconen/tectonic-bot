import { ButtonInteraction, CommandInteraction, MessageActionRow, MessageButton} from "discord.js";
import { Discord, Slash, ButtonComponent, SlashChoice, SlashOption } from "discordx";

/*
TODO
Implement bob
do database stuff
make it into a slash choice thingy
*/

@Discord()
class split {
  @Slash("split")
  async split(
    @SlashChoice({ name: "2-100m",    value: 10 })
    @SlashChoice({ name: "100-500m",  value: 20 })
    @SlashChoice({ name: "500m+",     value: 30 })
    @SlashOption("value", { description: "Value of the split drop?" })
    value: number,
    interaction: CommandInteraction
  ) {
    
    await interaction.deferReply();

    // Create the button, giving it the id: "yep-btn"
    const helloBtn = new MessageButton()
      .setLabel("")
      .setEmoji("✅")
      .setStyle("SUCCESS")
      .setCustomId("yep-btn");

    // Create a button, giving it the id: "deny-btn"
    const YellowBtn = new MessageButton()
    .setLabel("")
    .setEmoji("🈲")
    .setStyle("DANGER")
    .setCustomId("deny-btn");

    // Create a MessageActionRow and add the button to that row.
    const row = new MessageActionRow().addComponents(helloBtn, YellowBtn)
    const msg = `You have submitend for ${value} point please wait for admin aproval, and make sure you have posted the apropriate screenshots` 
    interaction.editReply({
      content: msg,
      components: [row],
    });
  }

  // register a handler for the button with id: "yep-btn"
  @ButtonComponent("yep-btn")
  myBtn(interaction: ButtonInteraction) {
    //if admin do x else do y       I kno verry nessessery comment
    if (IsAdmin(interaction)){
        interaction.reply(`✅ ${interaction.member} how do you do big boi`);
    }else{
        interaction.reply(`✅ ${interaction.member} dont press that button u shitter`);
    }
  }
  
  // register a handler for the button with id: "deny-btn"
  @ButtonComponent("deny-btn")
  aBtn(interaction: ButtonInteraction) {

    //if admin do x else do y       I kno verry nessessery comment
    if (IsAdmin(interaction)){
        interaction.reply(`🈲 ${interaction.member} how do you do big boi`);
    }else{
        interaction.reply(`🈲 ${interaction.member} dont press that button u shitter`);
    }
  }
}





























function IsAdmin(a: ButtonInteraction){
    /*
    *   Would not recomend trying to understand this
    */

    //gets the users premmision bitfield/bigint thingy
    const Bit_field = a.member?.permissions
    
    //binary operations spaggeti, admin flag is bit 40....
    const admin_flag = (BigInt(Number(Bit_field?.valueOf())) & (1n << 40n)) >> 40n

    return admin_flag
        //console.log(typeof(Bit_field?.valueOf()));
    //console.log((BigInt(Number(Bit_field?.valueOf())) & (1n << 40n)) >> 40n);
    //console.log(interaction.member?.roles);
    //console.log("----------------------------------");
    //console.log(interaction.member?.permissions);
}
