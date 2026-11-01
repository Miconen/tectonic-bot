package tectonic

// These mirror the JSON shapes the bot uses today (src/typings/api). Only the
// fields this demo needs are declared; encoding/json ignores the rest.

type RSN struct {
	RSN   string `json:"rsn"`
	WomID string `json:"wom_id"`
}

type UserEvent struct {
	Name           string `json:"name"`
	WomID          string `json:"wom_id"`
	Placement      int    `json:"placement"`
	PositionCutoff int    `json:"position_cutoff"`
	Solo           bool   `json:"solo"`
}

type Achievement struct {
	Name        string `json:"name"`
	Thumbnail   string `json:"thumbnail"`
	DiscordIcon string `json:"discord_icon"`
	Order       int    `json:"order"`
}

type UserRecord struct {
	Value       int    `json:"value"`
	BossName    string `json:"boss_name"`
	DisplayName string `json:"display_name"`
	Category    string `json:"category"`
	RecordID    int    `json:"record_id"`
	Date        string `json:"date"`
	Solo        bool   `json:"solo"`
	ValueType   string `json:"value_type"`
}

type DetailedUser struct {
	UserID       string        `json:"user_id"`
	GuildID      string        `json:"guild_id"`
	Points       int           `json:"points"`
	Rank         int           `json:"rank"`
	RSNs         []RSN         `json:"rsns"`
	Events       []UserEvent   `json:"events"`
	Achievements []Achievement `json:"achievements"`
	Records      []UserRecord  `json:"records"`

	CombatAchievements []NamedItem `json:"combat_achievements"`
	// Raw keeps the full payload so the leave handler can dump every field,
	// including ones this struct doesn't declare.
	Raw []byte `json:"-"`
}

type PointsResponse struct {
	UserID      string `json:"user_id"`
	GuildID     string `json:"guild_id"`
	Points      int    `json:"points"`
	GivenPoints int    `json:"given_points"`
}

type GuildRank struct {
	Name         string  `json:"name"`
	MinPoints    int     `json:"min_points"`
	Icon         *string `json:"icon"`
	RoleID       *string `json:"role_id"`
	DisplayOrder int     `json:"display_order"`
}

type Guild struct {
	GuildID       string  `json:"guild_id"`
	Multiplier    int     `json:"multiplier"`
	PBChannelID   *string `json:"pb_channel_id"`
	ModChannelID  *string `json:"mod_channel_id"`
	LogChannelID  *string `json:"log_channel_id"`
	PositionCount int     `json:"position_count"`
}

type Boss struct {
	Name        string `json:"name"`
	DisplayName string `json:"display_name"`
	Category    string `json:"category"`
	Solo        bool   `json:"solo"`
	ValueType   string `json:"value_type"`
}

// IsTime reports whether the boss records times (in ticks) rather than a
// count where higher is better (e.g. depth).
func (b Boss) IsTime() bool { return b.ValueType == "" || b.ValueType == "time" }

type Category struct {
	Name      string `json:"name"`
	Thumbnail string `json:"thumbnail"`
	Order     int    `json:"order"`
}

type GuildBoss struct {
	Boss     string `json:"boss"`
	Category string `json:"category"`
}

type GuildCategory struct {
	Category  string  `json:"category"`
	MessageID *string `json:"message_id"`
}

type SimpleUser struct {
	UserID  string `json:"user_id"`
	GuildID string `json:"guild_id"`
	Points  int    `json:"points"`
}

type NewRecord struct {
	UserIDs  []string `json:"user_ids"`
	Value    int      `json:"value"`
	BossName string   `json:"boss_name"`
}

type RecordResponse struct {
	BossName string `json:"boss_name"`
	Value    int    `json:"value"`
	OldValue int    `json:"value_old"`
	RecordID int    `json:"record_id"`
	Position *int   `json:"position"`
}

type GuildRecord struct {
	Value    int    `json:"value"`
	BossName string `json:"boss_name"`
	RecordID int    `json:"record_id"`
	Position int    `json:"position"`
}

type RecordTeammate struct {
	RecordID int    `json:"record_id"`
	UserID   string `json:"user_id"`
}

// DetailedGuild is the guild config plus all its records (GET .../records).
type DetailedGuild struct {
	Guild
	Bosses          []Boss           `json:"bosses"`
	Categories      []Category       `json:"categories"`
	GuildBosses     []GuildBoss      `json:"guild_bosses"`
	GuildCategories []GuildCategory  `json:"guild_categories"`
	Records         []GuildRecord    `json:"records"`
	Teammates       []RecordTeammate `json:"teammates"`
}

// NamedItem is a list entry where only the name matters to the bot.
type NamedItem struct {
	Name string `json:"name"`
}

type CombatAchievement struct {
	Name                   string `json:"name"`
	PointSource            string `json:"point_source"`
	Points                 int    `json:"points"`
	PointSourceDisplayName string `json:"point_source_display_name"`
}
