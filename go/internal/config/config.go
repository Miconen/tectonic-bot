// Package config reads the bot's settings from the environment, using the
// same variables as the TypeScript bot (see ../.env.example).
package config

import (
	"errors"
	"fmt"
	"os"

	"github.com/disgoorg/snowflake/v2"
)

type Config struct {
	Token   string
	AuthKey string
	// RootURL is the API host root, e.g. "http://localhost:8080/".
	// The health check hits RootURL + "openapi.json"; everything else lives
	// under RootURL + "api/v1/".
	RootURL string
	// TestGuildID, when set, limits command registration to that one guild.
	// Syncing replaces a guild's whole command list, so use this (and a test
	// bot token) while the TS bot still owns the real guilds.
	TestGuildID snowflake.ID
}

func Load() (Config, error) {
	c := Config{
		Token:   os.Getenv("BOT_TOKEN"),
		AuthKey: os.Getenv("AUTH_KEY"),
		RootURL: "http://localhost:8080/",
	}

	if host := os.Getenv("API_URL"); host != "" {
		proto := os.Getenv("API_PROTOCOL")
		if proto == "" {
			proto = "https"
		}
		c.RootURL = proto + "://" + host + "/"
	}

	if id := os.Getenv("TEST_GUILD_ID"); id != "" {
		parsed, err := snowflake.Parse(id)
		if err != nil {
			return c, fmt.Errorf("invalid TEST_GUILD_ID: %w", err)
		}
		c.TestGuildID = parsed
	}

	if c.Token == "" {
		return c, errors.New("could not find BOT_TOKEN in your environment")
	}
	if c.AuthKey == "" {
		return c, errors.New("no AUTH_KEY found")
	}
	return c, nil
}
