// Command bot runs the Tectonic Discord bot.
package main

import (
	"context"
	"log/slog"
	"os"
	"os/signal"
	"syscall"

	"github.com/disgoorg/disgo"
	"github.com/disgoorg/disgo/bot"
	"github.com/disgoorg/disgo/cache"
	"github.com/disgoorg/disgo/events"
	"github.com/disgoorg/disgo/gateway"
	"github.com/disgoorg/disgo/handler"
	"github.com/disgoorg/snowflake/v2"

	"github.com/Miconen/tectonic-bot/internal/catalog"
	"github.com/Miconen/tectonic-bot/internal/commands"
	"github.com/Miconen/tectonic-bot/internal/config"
	"github.com/Miconen/tectonic-bot/internal/deps"
	botevents "github.com/Miconen/tectonic-bot/internal/events"
	"github.com/Miconen/tectonic-bot/internal/mw"
	"github.com/Miconen/tectonic-bot/internal/pointsrc"
	"github.com/Miconen/tectonic-bot/internal/ranks"
	"github.com/Miconen/tectonic-bot/internal/status"
	"github.com/Miconen/tectonic-bot/internal/tectonic"
	"github.com/Miconen/tectonic-bot/internal/wom"
)

func main() {
	// JSON so Railway can filter by request_id, user_id, guild_id or command.
	// LOG_LEVEL=debug adds autocomplete input and every API request.
	level := slog.LevelInfo
	_ = level.UnmarshalText([]byte(os.Getenv("LOG_LEVEL")))
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: level})))

	cfg, err := config.Load()
	if err != nil {
		slog.Error("invalid config", "err", err)
		os.Exit(1)
	}

	api := tectonic.New(cfg.RootURL, cfg.AuthKey)

	// Boss choices are baked into /pb, so the API must be up at startup (the
	// TS bot also refuses to start without them).
	bosses, err := api.GetBosses(context.Background())
	if err != nil {
		slog.Error("fetching bosses", "err", err)
		os.Exit(1)
	}

	cat, err := catalog.New(context.Background(), api)
	if err != nil {
		slog.Error("fetching achievements", "err", err)
		os.Exit(1)
	}
	d := deps.Deps{API: api, Ranks: ranks.NewCache(api), Sources: pointsrc.New(api), Catalog: cat, Wom: wom.New()}

	r := handler.New()
	r.Use(mw.Context, mw.ReplyErrors, mw.RequireGuild, mw.APIHealthy(api))
	commands.Register(r, d, bosses)

	client, err := disgo.New(cfg.Token,
		// Only what the bot uses: guild info, and member leave events.
		bot.WithGatewayConfigOpts(gateway.WithIntents(gateway.IntentGuilds, gateway.IntentGuildMembers)),
		// Interactions carry the member and their permissions, so nothing else
		// needs caching.
		bot.WithCacheConfigOpts(cache.WithCaches(cache.FlagGuilds)),
		bot.WithEventListeners(r),
		bot.WithEventListenerFunc(botevents.OnMemberLeave(api)),
		bot.WithEventListenerFunc(func(e *events.Ready) {
			status.Start(e.Client())

			// Register commands per guild, like botGuilds in the TS bot.
			ids := make([]snowflake.ID, len(e.Guilds))
			for i, g := range e.Guilds {
				ids[i] = g.ID
			}
			if cfg.TestGuildID != 0 {
				ids = []snowflake.ID{cfg.TestGuildID}
			}
			if err := handler.SyncCommands(e.Client(), commands.Definitions(bosses), ids); err != nil {
				slog.Error("syncing commands", "err", err)
				return
			}
			slog.Info("Bot started", "guilds", len(ids))
		}),
	)
	if err != nil {
		slog.Error("building client", "err", err)
		os.Exit(1)
	}
	defer client.Close(context.Background())

	if err := client.OpenGateway(context.Background()); err != nil {
		slog.Error("connecting to gateway", "err", err)
		os.Exit(1)
	}

	s := make(chan os.Signal, 1)
	signal.Notify(s, syscall.SIGINT, syscall.SIGTERM)
	<-s
}
