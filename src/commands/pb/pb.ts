import { Discord, SlashGroup } from "discordx";

@Discord()
@SlashGroup({
  name: "pb",
  description: "Commands for handling and requesting boss times",
})
@SlashGroup("pb")
class pb {}
