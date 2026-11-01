package commands

import (
	"regexp"
	"testing"

	"github.com/disgoorg/disgo/discord"

	"github.com/Miconen/tectonic-bot/internal/tectonic"
)

var validName = regexp.MustCompile(`^[a-z0-9_-]{1,32}$`)

// TestDefinitions checks every command against Discord's rules, so a bad
// definition fails here instead of at command sync on startup.
func TestDefinitions(t *testing.T) {
	bosses := []tectonic.Boss{{Name: "zulrah", DisplayName: "Zulrah", Category: "Miscellaneous"}}
	seen := map[string]bool{}
	for _, def := range Definitions(bosses) {
		cmd := def.(discord.SlashCommandCreate)
		if seen[cmd.Name] {
			t.Errorf("duplicate command /%s", cmd.Name)
		}
		seen[cmd.Name] = true
		checkNameDesc(t, "/"+cmd.Name, cmd.Name, cmd.Description)
		checkOptions(t, "/"+cmd.Name, cmd.Options)
	}
}

func checkNameDesc(t *testing.T, path, name, desc string) {
	t.Helper()
	if !validName.MatchString(name) {
		t.Errorf("%s: invalid name %q", path, name)
	}
	if n := len([]rune(desc)); n == 0 || n > 100 {
		t.Errorf("%s: description length %d", path, n)
	}
}

func checkOptions(t *testing.T, path string, opts []discord.ApplicationCommandOption) {
	t.Helper()
	if len(opts) > 25 {
		t.Errorf("%s: %d options (max 25)", path, len(opts))
	}
	names := map[string]bool{}
	seenOptional := false
	for _, o := range opts {
		p := path + " " + o.OptionName()
		if names[o.OptionName()] {
			t.Errorf("%s: duplicate option", p)
		}
		names[o.OptionName()] = true

		switch v := o.(type) {
		case discord.ApplicationCommandOptionSubCommand:
			checkNameDesc(t, p, v.Name, v.Description)
			checkOptions(t, p, v.Options)
			continue
		case discord.ApplicationCommandOptionSubCommandGroup:
			checkNameDesc(t, p, v.Name, v.Description)
			subs := make([]discord.ApplicationCommandOption, len(v.Options))
			for i, s := range v.Options {
				subs[i] = s
			}
			checkOptions(t, p, subs)
			continue
		case discord.ApplicationCommandOptionString:
			checkNameDesc(t, p, v.Name, v.Description)
			if len(v.Choices) > 25 {
				t.Errorf("%s: %d choices", p, len(v.Choices))
			}
			if v.Autocomplete && len(v.Choices) > 0 {
				t.Errorf("%s: autocomplete and choices can't be combined", p)
			}
		}

		req := required(o)
		if req && seenOptional {
			t.Errorf("%s: required option after an optional one", p)
		}
		if !req {
			seenOptional = true
		}
	}
}

func required(o discord.ApplicationCommandOption) bool {
	switch v := o.(type) {
	case discord.ApplicationCommandOptionString:
		return v.Required
	case discord.ApplicationCommandOptionInt:
		return v.Required
	case discord.ApplicationCommandOptionFloat:
		return v.Required
	case discord.ApplicationCommandOptionBool:
		return v.Required
	case discord.ApplicationCommandOptionUser:
		return v.Required
	case discord.ApplicationCommandOptionRole:
		return v.Required
	case discord.ApplicationCommandOptionChannel:
		return v.Required
	case discord.ApplicationCommandOptionAttachment:
		return v.Required
	case discord.ApplicationCommandOptionMentionable:
		return v.Required
	}
	return false
}
