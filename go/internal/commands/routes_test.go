package commands

import (
	"testing"

	"github.com/disgoorg/disgo/discord"
	"github.com/disgoorg/disgo/handler"

	"github.com/Miconen/tectonic-bot/go/internal/deps"
	"github.com/Miconen/tectonic-bot/go/internal/tectonic"
)

// recorder is a handler.Router that only records which paths get a slash
// command or autocomplete handler. Methods it doesn't override panic.
type recorder struct {
	handler.Router
	prefix string
	seen   map[string]bool
}

func (r *recorder) Use(...handler.Middleware) {}
func (r *recorder) Route(p string, fn func(handler.Router)) handler.Router {
	sub := &recorder{prefix: r.prefix + p, seen: r.seen}
	fn(sub)
	return sub
}
func (r *recorder) SlashCommand(p string, _ handler.SlashCommandHandler) {
	r.seen["cmd "+r.prefix+p] = true
}
func (r *recorder) Autocomplete(p string, _ handler.AutocompleteHandler) {
	r.seen["auto "+r.prefix+p] = true
}
func (r *recorder) ButtonComponent(string, handler.ButtonComponentHandler) {}
func (r *recorder) Group(fn func(handler.Router))                          { fn(r) }

// TestEveryCommandIsRouted catches a subcommand or autocomplete option that
// was defined but never wired up (or wired to a typo'd path).
func TestEveryCommandIsRouted(t *testing.T) {
	bosses := []tectonic.Boss{{Name: "zulrah", DisplayName: "Zulrah", Category: "Miscellaneous"}}
	rec := &recorder{seen: map[string]bool{}}
	Register(rec, deps.Deps{}, bosses)

	want := map[string]bool{}
	for _, def := range Definitions(bosses) {
		cmd := def.(discord.SlashCommandCreate)
		collect(want, "/"+cmd.Name, cmd.Options)
	}

	for k := range want {
		if !rec.seen[k] {
			t.Errorf("no handler for %s", k)
		}
	}
	for k := range rec.seen {
		if !want[k] {
			t.Errorf("handler for %s, which isn't defined", k)
		}
	}
}

func collect(out map[string]bool, path string, opts []discord.ApplicationCommandOption) {
	leaf := true
	for _, o := range opts {
		switch v := o.(type) {
		case discord.ApplicationCommandOptionSubCommandGroup:
			leaf = false
			for _, s := range v.Options {
				collect(out, path+"/"+v.Name+"/"+s.Name, s.Options)
			}
		case discord.ApplicationCommandOptionSubCommand:
			leaf = false
			collect(out, path+"/"+v.Name, v.Options)
		case discord.ApplicationCommandOptionString:
			if v.Autocomplete {
				out["auto "+path] = true
			}
		}
	}
	if leaf {
		out["cmd "+path] = true
	}
}
