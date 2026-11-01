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
	GuildID      string  `json:"guild_id"`
	ModChannelID *string `json:"mod_channel_id"`
	LogChannelID *string `json:"log_channel_id"`
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

type GuildRecords struct {
	Records   []GuildRecord    `json:"records"`
	Teammates []RecordTeammate `json:"teammates"`
}
