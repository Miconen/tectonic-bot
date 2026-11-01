// Package moderation ports /moderation: points, member status, RSNs,
// achievements, combat achievements, guild settings and rank tiers. Every
// subcommand requires moderator permissions.
package moderation

import (
	"github.com/disgoorg/disgo/discord"
	"github.com/disgoorg/disgo/handler"

	"github.com/Miconen/tectonic-bot/go/internal/commands/pb"
	"github.com/Miconen/tectonic-bot/go/internal/deps"
	"github.com/Miconen/tectonic-bot/go/internal/mw"
	. "github.com/Miconen/tectonic-bot/go/internal/opt"
	"github.com/Miconen/tectonic-bot/go/internal/str"
)

var Command = discord.SlashCommandCreate{
	Name:        "moderation",
	Description: "Moderation commands",
	Options: []discord.ApplicationCommandOption{
		Sub("start", "Setup command for the whole guild"),

		Group("points", "Manage user points",
			Sub("give", "Give points to a user",
				User("username", "@User tag to give points to"),
				Int("amount", "Amount of points to give (negative to take away)")),
			Sub("source", "Give points to a user by a point source",
				User("username", "@User tag to give points to"),
				Autocomplete("source", "Point source to give")),
			Sub("role", "Give everyone with a role points from a point source",
				Role("role", "Role for which to award points"),
				Autocomplete("source", "Point source to give")),
			Sub("rolebypoints", "Give everyone with a role an amount of points",
				Role("role", "Role for which to award points"),
				Int("amount", "Amount of points to give")),
		),

		Group("status", "Manage user status",
			Sub("activate", "Activate a member and give them access to rank points",
				User("username", "@User tag to activate"),
				String("rsn", "RSN to link")),
			Sub("deactivate", "Deactivate a member and delete all their points and data",
				User("username", "@User tag to deactivate, WARNING: their points will be deleted")),
		),

		Group("rsn", "Manage user RSNs",
			Sub("add", "Link an RSN to a member",
				User("username", "User to link an account to"),
				String("rsn", "RSN to add")),
			Sub("remove", "Unlink an RSN from a member",
				User("username", "User to unlink an account from"),
				Autocomplete("rsn", "RSN to remove")),
		),

		Group("achievements", "Manage user achievements",
			Sub("grant", "Grant an achievement",
				User("username", "@User tag to target"),
				Autocomplete("achievement", "Achievement to grant")),
			Sub("remove", "Remove an achievement from a user",
				User("username", "@User tag to target"),
				Autocomplete("achievement", "Achievement to remove")),
		),

		Group("ca", "Manage user combat achievements",
			Sub("grant", "Grant a combat achievement to a user",
				User("username", "@User tag to target"),
				Autocomplete("achievement", "Combat achievement to grant")),
			Sub("remove", "Remove a combat achievement from a user",
				User("username", "@User tag to target"),
				Autocomplete("achievement", "Combat achievement to remove")),
		),

		// #145: every guild setting lives here and replies From -> To.
		Group("settings", "Manage guild settings",
			Sub("modchannel", "Set the channel approval requests are sent to",
				TextChannel("channel", "Channel for approval requests")),
			Sub("logchannel", "Set the logging channel",
				TextChannel("channel", "Channel for logging")),
			Sub("multiplier", "Set the server wide point multiplier",
				IntRange("multiplier", "Number all points given are multiplied by (1-10)", 1, 10)),
			Sub("positioncount", "Set how many positions (1st, 2nd, 3rd...) are tracked per boss",
				IntRange("count", "Number of positions to track (1-10)", 1, 10)),
		),

		pb.TimesGroup,

		Group("ranks", "Manage guild rank tiers",
			Sub("list", "List all rank tiers for this guild"),
			Sub("create", "Create a new rank tier",
				StringMax("name", "Rank name (e.g. 'diamond')", 32),
				IntRange("min_points", "Minimum points threshold", 0, -1),
				IntRange("display_order", "Display order (lower = first)", 0, -1),
				Optional(String("icon", "Discord emoji for the rank")),
				Optional(Role("role", "Discord role to assign at this rank"))),
			Sub("update", "Update an existing rank tier",
				Autocomplete("name", "Rank to update"),
				Optional(IntRange("min_points", "New minimum points threshold", 0, -1)),
				Optional(IntRange("display_order", "New display order", 0, -1)),
				Optional(String("icon", "New Discord emoji")),
				Optional(Role("role", "New Discord role"))),
			Sub("delete", "Delete a rank tier",
				Autocomplete("name", "Rank to delete")),
		),
	},
}

// Register adds every /moderation route. The table reads like the command
// tree above.
func Register(r handler.Router, d deps.Deps) {
	m := &mod{d: d}
	r.Route("/moderation", func(r handler.Router) {
		r.Use(mw.RequireAdmin)

		r.SlashCommand("/start", m.start)

		r.Route("/points", func(r handler.Router) {
			r.SlashCommand("/give", m.pointsGive)
			r.SlashCommand("/source", m.pointsSource)
			r.SlashCommand("/role", m.pointsRole)
			r.SlashCommand("/rolebypoints", m.pointsRoleByPoints)
			r.Autocomplete("/source", m.sourceAutocomplete)
			r.Autocomplete("/role", m.sourceAutocomplete)
		})

		r.Route("/status", func(r handler.Router) {
			r.SlashCommand("/activate", m.activate)
			r.SlashCommand("/deactivate", m.deactivate)
		})

		r.Route("/rsn", func(r handler.Router) {
			r.SlashCommand("/add", m.rsnAdd)
			r.SlashCommand("/remove", m.rsnRemove)
			r.Autocomplete("/remove", m.rsnAutocomplete)
		})

		r.Route("/achievements", func(r handler.Router) {
			r.SlashCommand("/grant", m.runGrant(grantAction{m.giveAchievement, str.AchievementErrors, str.AchievementGranted}))
			r.SlashCommand("/remove", m.runGrant(grantAction{m.removeAchievement, str.AchievementErrors, str.AchievementRemoved}))
			r.Autocomplete("/grant", m.achievementAutocomplete(false))
			r.Autocomplete("/remove", m.achievementAutocomplete(true))
		})

		r.Route("/ca", func(r handler.Router) {
			r.SlashCommand("/grant", m.runGrant(grantAction{d.API.GiveUserCombatAchievement, caErrors, str.CAGranted}))
			r.SlashCommand("/remove", m.runGrant(grantAction{d.API.RemoveUserCombatAchievement, caErrors, str.CARemoved}))
			r.Autocomplete("/grant", m.caAutocomplete(false))
			r.Autocomplete("/remove", m.caAutocomplete(true))
		})

		r.Route("/settings", func(r handler.Router) {
			r.SlashCommand("/modchannel", m.setModChannel)
			r.SlashCommand("/logchannel", m.setLogChannel)
			r.SlashCommand("/multiplier", m.setMultiplier)
			r.SlashCommand("/positioncount", m.setPositionCount)
		})

		pb.RegisterTimes(r, d)

		r.Route("/ranks", func(r handler.Router) {
			r.SlashCommand("/list", m.ranksList)
			r.SlashCommand("/create", m.rankCreate)
			r.SlashCommand("/update", m.rankUpdate)
			r.SlashCommand("/delete", m.rankDelete)
			r.Autocomplete("/update", m.rankAutocomplete)
			r.Autocomplete("/delete", m.rankAutocomplete)
		})
	})
}

type mod struct{ d deps.Deps }

type (
	cmdData  = discord.SlashCommandInteractionData
	cmdEvent = handler.CommandEvent
)
