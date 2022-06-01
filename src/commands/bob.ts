import { Discord, Slash, SlashOption, SlashChoice } from "discordx";
import { TextChannel, VoiceChannel, CommandInteraction, GuildMember, Client, User } from "discord.js";

@Discord()
class Example {
    @Slash("split-bob")
    async split(
      @SlashChoice({ name: "2-100m",    value: 10 })
      @SlashChoice({ name: "100-500m",  value: 20 })
      @SlashChoice({ name: "500m+",     value: 30 })
      @SlashOption("value", { description: "Value of the split drop?" })
      value: number,
      interaction: CommandInteraction
    ) {
      //logic and stuff have fun implementing it
      

      //printing everything
      //console.log(interaction);

      /*
      //define the variables for database queries
      const user_id     = interaction.user.id;
      const guild_id    = interaction.guild?.id;
      var   prev_points;

      //Get query
      //replace star with point thing
      const GET_QUERY = 'SELECT * from "users" where user_id=$1 and guild_id=$2'

      //establish database conection
      //????????????????????????????
      const connection = await pool.connect();
      //joinked from here https://github.com/postgres-pool/postgres-pool
      try{
        await connection.query(GET_QUERY, [guild_id, user_id]).then((res) =>{
          //read the current points for the user from the db 
          prev_points = console.log(res.rows[0]);
        });
      } finally {
        // NOTE: You MUST call connection.release() to return the connection back to the pool
        await connection.release();
      }
      */




    
      // "interaction.user"       @mention somehow
      //  interaction.user.is     User ID
      //  interaction.guild?.id   Guild ID
      interaction.reply(
        `${interaction.user} has recived ${value} rank-points}`);
      
      
    }
  }