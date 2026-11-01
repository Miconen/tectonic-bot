# tectonic-bot (Go demo)

A demo port of the bot to Go with [disgo](https://github.com/disgoorg/disgo), to show what a rewrite would look like. It runs next to the TypeScript bot in this repo and doesn't replace it.

## What's ported

| TS | Go |
| --- | --- |
| `/profile` | `internal/commands/profile` |
| `/moderation points give` and `source` (with autocomplete) | `internal/commands/points` |
| `awardPoints`, `formatPointsAward`, rank role syncing | `points.Award`, `points.FormatAward`, `internal/ranks` |
| `removeOnLeave` + `dumpUserData` | `internal/events` |
| `LoggingGuard`, `IsHealthy`, `RequiresGuild`, `IsAdmin` | `internal/mw` |
| `replyHandler`, `replyApiError`, `errors/api/*` | `internal/reply` |
| `stringRepo` (only the strings above) | `internal/str` |
| `requests/*`, `typings/api/*` | `internal/tectonic` |
| `TimeConverter.ticksToTime` | `internal/timefmt` |

Not ported yet: every other command, status rotation, the request approval flow and the rest of the string repo.

## How it differs from the TS bot

- **No decorators.** A command is a `discord.SlashCommandCreate` value plus handler functions registered on a router (`commands.go`). Guards are middleware on routes.
- **Errors are values.** API calls return `error`. Handlers `return err`, optionally wrapped with `reply.WithOverrides(err, str.AccountErrors(...))`. One middleware (`mw.ReplyErrors`) turns any error into the ephemeral reply with the correlation ID. The message lookup order is the same as `getApiErrorMessage`.
- **Strings are typed.** Templates are functions like `str.RankUp(icon, name)`, so a missing argument fails to compile.
- **Memory.** It uses only the `Guilds` and `GuildMembers` intents and caches only guilds. Interactions already carry the member and their permissions.
- **Open issues already handled here:**
  - #152: network failures, validation errors and unknown error codes show a generic message. The raw text only goes to the logs.
  - #158: every system failure reply (API down, unexpected errors) ends with the Error ID. Only messages about the user's own input or permissions (`reply.UserError`) leave it out.
  - #171 (partly): API calls send `X-Request-ID` with the correlation ID, which is the interaction ID like in the TS bot, and "Command started" logs the option values. Users and roles are logged as `id (name)`. Autocomplete input is logged at debug only, since its privacy and volume are still an open question in the issue. The API side (tectonic-api#99) still has to read the header.
  - #151: symbols such as ✔ and ❌ are written as `\u` escapes in `internal/str`, so an editor can't re-encode them.
- **CI:** `.github/workflows/go.yml` runs gofmt, vet, tests (with `-race`) and a build on changes under `go/`.
- **Small improvement:** the point source autocomplete filters by what you type, so sources past the first 25 are reachable.

## Running it

Same environment variables as the TS bot (`BOT_TOKEN`, `AUTH_KEY`, `API_URL`, `API_PROTOCOL`), plus:

- `TEST_GUILD_ID` (optional): only register commands in this guild.

> **Use a separate test bot token.** Command sync replaces a guild's whole command list. If you point this at the production bot, the TS bot's other commands disappear in those guilds until the TS bot restarts and re-registers them.

```sh
cd go
go test ./...
BOT_TOKEN=... AUTH_KEY=... API_URL=localhost:8080 API_PROTOCOL=http TEST_GUILD_ID=... go run ./cmd/bot
```

Docker: `docker build -t tectonic-bot-go ./go`. It builds a static binary in a `scratch` image (the binary is about 9 MB).
