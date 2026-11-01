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
| `TimeConverter`, `IsValidTime` | `internal/timefmt` |
| All 15 `/pb` subcommands, `pbRequestHelper`, `updateEmbed`, `getBoss` | `internal/commands/pb` |
| `commands/requests` (buttons, `/accept`, `/deny`) | `internal/approval` (PB requests so far) |
| `IsActivated`, the `player2..N` options | `internal/team` |

Not ported yet: splits, CAs, achievements, events, bingo, the rest of moderation, help, roles, status rotation, and the rest of the string repo.

## Code quality goals

These apply to all porting work:

- **Less duplication.** When commands differ only in data, they become a table plus one handler. The 15 PB subcommands are a single `variants` table in `pb/variants.go`. Each was its own 50 to 115 line file in TS.
- **Less boilerplate, readable commands.** A handler reads top to bottom: validate locally, defer, call the API, reply. Guards, error replies and logging live in middleware and helpers, not in each command.
- **Fix bugs and UX while porting**, and list the fixes below so they can be checked against the TS behaviour.

## PB port: what changed compared to TS

About 660 lines of Go replace about 1,980 lines of TS (the pb commands, their helpers and the two guards they used).

- **Duplicate teammates are rejected.** Before, tagging the same player twice (or yourself) counted towards team size and filed the PB under the wrong scale, e.g. `cox_3` for a duo.
- **Time parsing actually validates.** `IsValidTime` only range-checked hours and fractions inside a branch that never ran.
- **Validation errors are private.** Bad times, unactivated players and "wouldn't make the board" replies are ephemeral. Before, they replaced the public "thinking..." message.
- **#155:** a failed point source lookup aborts the request instead of offering 0 points.
- **#157:** if the guild config can't be loaded, the request is not posted, so there's no fallback to public approval buttons.
- **#153 follow-up:** if the PB is saved but awarding points fails, the moderator gets a warning to give the points by hand. Previously the request stayed pending, and a retry would submit the record twice. The mod channel message is now only deleted once approval succeeds, so a failed approval can be retried with the button.
- **Two moderators can't approve the same request at once.** The second gets "already being handled".
- **`/accept` and `/deny` autocomplete only lists this server's requests**, and filters by what you type.
- **#165:** buttons use route-style IDs (`/request/accept/<id>`), and approval logs include the request kind and label.
- **Fewer API calls per submission.** One guild call gives the records, multiplier, mod channel and position count. Leaderboard embeds fetch only the members they show, over REST.
- **ToA raid level** is a whole number from 0 to 600, enforced by Discord.

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
