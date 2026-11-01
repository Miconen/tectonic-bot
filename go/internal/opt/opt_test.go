package opt

import (
	"testing"

	"github.com/disgoorg/disgo/discord"
)

func TestOptional(t *testing.T) {
	for _, o := range []Option{User("a", "a"), Role("a", "a"), String("a", "a"), Int("a", "a"), TextChannel("a", "a"), Attachment("a", "a"), Bool("a", "a")} {
		if required(o) != true {
			t.Fatalf("%T should be required by default", o)
		}
		if required(Optional(o)) {
			t.Fatalf("Optional(%T) is still required", o)
		}
	}
}

func required(o Option) bool {
	switch v := o.(type) {
	case discord.ApplicationCommandOptionUser:
		return v.Required
	case discord.ApplicationCommandOptionRole:
		return v.Required
	case discord.ApplicationCommandOptionString:
		return v.Required
	case discord.ApplicationCommandOptionInt:
		return v.Required
	case discord.ApplicationCommandOptionChannel:
		return v.Required
	case discord.ApplicationCommandOptionAttachment:
		return v.Required
	case discord.ApplicationCommandOptionBool:
		return v.Required
	}
	panic("unhandled")
}
