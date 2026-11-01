# tectonic-bot (Go demo)

A demo port of the bot to Go with [disgo](https://github.com/disgoorg/disgo), to show what a rewrite would look like. It runs next to the TypeScript bot in this repo and doesn't replace it.

## What's ported

| TS | Go |
| --- | --- |
| `/profile` | `internal/commands/profile` |
| All of `/moderation`: points (including `wom`), status, rsn, achievements, ca, start, settings, ranks | `internal/commands/moderation` |
| `/event` (info, remove, settings, create team/individual/legacy) | `internal/commands/event` |
| WOM team lookup for autocomplete (`requests/wom.ts`) | `internal/wom` |
| `/moderation times` (remove, adduser, removeuser, initialize-pb-channel) | `internal/commands/pb/times.go` |
| `/split`, `/ca`, `/achievement` | `internal/commands/submissions` |
| `awardPoints`, `formatPointsAward`, rank role syncing | `award.Give`, `award.Format`, `internal/ranks` |
| `removeOnLeave` | `internal/events` |
| `dumpUserData` | `internal/userdump` |
| `LoggingGuard`, `IsHealthy`, `RequiresGuild`, `IsAdmin` | `internal/mw` |
| `replyHandler`, `replyApiError`, `errors/api/*` | `internal/reply` |
| `stringRepo` (only the strings above) | `internal/str` |
| `requests/*`, `typings/api/*` | `internal/tectonic` |
| `TimeConverter`, `IsValidTime` | `internal/timefmt` |
| All 15 `/pb` subcommands, `pbRequestHelper`, `updateEmbed`, `getBoss` | `internal/commands/pb` |
| `commands/requests` (buttons, `/accept`, `/deny`) | `internal/approval` |
| `IsActivated`, the `player2..N` options | `internal/team` |

Not ported yet: `/bingo`, `/help`, `/roles` and the status rotation.

Command definitions use the small helpers in `internal/opt` (`Sub`, `Group`, `User`, `Autocomplete`, `Optional`...), so a command's shape reads like its help text. `internal/commands/routes_test.go` fails if a defined subcommand or autocomplete option has no handler, or a handler has no definition.

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

## Moderation port: what changed compared to TS

- **#145: guild settings live under `/moderation settings`** (`modchannel`, `logchannel`, `multiplier`, `positioncount`), and every settings change replies with From → To using one shared helper (`str.Updated`). `/moderation ranks update` does the same for each field it changes. The old `/moderation modchannel`, `/moderation logchannel` and `/moderation points setmultiplier` are gone.
- **Multiplier is a whole number from 1 to 10**, enforced by Discord. The API only accepts that, but TS offered any decimal and then showed an API error.
- **Point amounts are whole numbers.** The API's custom points route takes an integer, so `1.5` used to fail with a confusing error.
- **Giving points to someone who isn't activated says so.** The API answers "point source not found" when no user was updated, which is what TS showed.
- **Role awards only send activated members**, in chunks of 50 so a large role doesn't overflow the URL. TS sent every member with the role, and the whole award failed if none were activated.
- **Commands on users who left the server** reply "not a member of this server" instead of failing later.
- **`/moderation rsn remove` autocompletes** the picked member's linked RSNs. `achievements` and `ca` grant and remove autocomplete only what the picked member doesn't have or does have.
- **Rank tiers:** names are limited to 32 characters and points and display order can't be negative, matching the API. Rank changes clear the rank cache, so new tiers apply right away instead of after 30 seconds. `update` with no options says there's nothing to update.
- **Activation and deactivation** keep going if rank roles can't be updated, and say so in the reply. Deactivating someone who isn't activated says that instead of an API error.
- **`/moderation times remove`** redraws the leaderboard when the removed record was #1. TS left the old record in the embed.
- **`initialize-pb-channel`** deletes old embeds one by one. TS used a bulk delete, which Discord refuses for messages older than two weeks, so old boards were left behind.
- **Achievement and CA grants clear the cached user**, so autocomplete reflects the change right away.

## Event port: what changed compared to TS

- **`/event remove` needs moderator permissions.** In TS anyone in the server could delete an event.
- **Event settings reply From → To with the real old value**, read before the update. TS read it from a cache, and setting solo to false never updated that cache.
- **`/event create` replies with the event's name** instead of "Success".
- **`/event create legacy` accepts @mentions** as well as IDs, separated by spaces or commas, and drops duplicates.
- **`/event info` lists winners who left the server** as mentions. TS skipped them.
- **Team autocomplete hides teams already picked** in the other team options, and WOM lookups are cached for 5 minutes instead of on every keystroke.
- **`/moderation points wom` options are wired by name.** In TS the two option decorators sat on the same parameter, so the competition ID and the cutoff could be read the wrong way round. A rank role failure for one player no longer stops the rest of the list.

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
