// Package opt shortens slash command definitions. disgo's option structs are
// verbose; these helpers keep a command's shape readable at a glance:
//
//	opt.Sub("give", "Give points to a user",
//		opt.User("username", "@User tag to give points to"),
//		opt.Int("amount", "Amount of points to give"),
//	)
//
// Options are required unless wrapped in Optional.
package opt

import "github.com/disgoorg/disgo/discord"

type Option = discord.ApplicationCommandOption

func Group(name, desc string, subs ...discord.ApplicationCommandOptionSubCommand) discord.ApplicationCommandOptionSubCommandGroup {
	return discord.ApplicationCommandOptionSubCommandGroup{Name: name, Description: desc, Options: subs}
}

func Sub(name, desc string, opts ...Option) discord.ApplicationCommandOptionSubCommand {
	return discord.ApplicationCommandOptionSubCommand{Name: name, Description: desc, Options: opts}
}

func User(name, desc string) Option {
	return discord.ApplicationCommandOptionUser{Name: name, Description: desc, Required: true}
}

func Role(name, desc string) Option {
	return discord.ApplicationCommandOptionRole{Name: name, Description: desc, Required: true}
}

func String(name, desc string) Option {
	return discord.ApplicationCommandOptionString{Name: name, Description: desc, Required: true}
}

// StringMax is a string option with a length limit.
func StringMax(name, desc string, max int) Option {
	return discord.ApplicationCommandOptionString{Name: name, Description: desc, Required: true, MaxLength: &max}
}

// Autocomplete is a string option filled by an autocomplete handler.
func Autocomplete(name, desc string) Option {
	return discord.ApplicationCommandOptionString{Name: name, Description: desc, Required: true, Autocomplete: true}
}

func Int(name, desc string) Option {
	return discord.ApplicationCommandOptionInt{Name: name, Description: desc, Required: true}
}

// IntRange is an integer option limited to [min, max]. Pass max < min for no
// upper limit.
func IntRange(name, desc string, min, max int) Option {
	o := discord.ApplicationCommandOptionInt{Name: name, Description: desc, Required: true, MinValue: &min}
	if max >= min {
		o.MaxValue = &max
	}
	return o
}

// TextChannel is a channel option limited to text channels.
func TextChannel(name, desc string) Option {
	return discord.ApplicationCommandOptionChannel{Name: name, Description: desc, Required: true, ChannelTypes: []discord.ChannelType{discord.ChannelTypeGuildText}}
}

func Attachment(name, desc string) Option {
	return discord.ApplicationCommandOptionAttachment{Name: name, Description: desc, Required: true}
}

// Optional marks an option as not required.
func Optional(o Option) Option {
	switch v := o.(type) {
	case discord.ApplicationCommandOptionUser:
		v.Required = false
		return v
	case discord.ApplicationCommandOptionRole:
		v.Required = false
		return v
	case discord.ApplicationCommandOptionString:
		v.Required = false
		return v
	case discord.ApplicationCommandOptionInt:
		v.Required = false
		return v
	case discord.ApplicationCommandOptionChannel:
		v.Required = false
		return v
	case discord.ApplicationCommandOptionAttachment:
		v.Required = false
		return v
	case discord.ApplicationCommandOptionBool:
		v.Required = false
		return v
	}
	return o
}

func Bool(name, desc string) Option {
	return discord.ApplicationCommandOptionBool{Name: name, Description: desc, Required: true}
}
