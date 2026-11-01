// Package status rotates the bot's activity every 30 minutes
// (utils/status.ts).
package status

import (
	"context"
	"log/slog"
	"math/rand/v2"
	"sync"
	"time"

	"github.com/disgoorg/disgo/bot"
	"github.com/disgoorg/disgo/gateway"
)

type kind int

const (
	playing kind = iota
	competing
	watching
	listening
)

type activity struct {
	name string
	kind kind
}

func (a activity) presence() gateway.PresenceOpt {
	switch a.kind {
	case competing:
		return gateway.WithCompetingActivity(a.name)
	case watching:
		return gateway.WithWatchingActivity(a.name)
	case listening:
		return gateway.WithListeningActivity(a.name)
	}
	return gateway.WithPlayingActivity(a.name)
}

var activities = []activity{
	{"OSRS", playing},
	{"99s", competing},
	{"RuneScape streams", watching},
	{"Sea Shanty 2", listening},
	{"in Gielinor", playing},
	{"the GE prices", watching},
	{"raids", competing},
	{"Old School RuneScape", playing},
	{"Zulrah guides", watching},
	{"medieval music", listening},
	{"in the Wilderness", playing},
	{"pets", competing},
	{"PKers rage quit", watching},
	{"Flute Salad", listening},
	{"at Barrows", playing},
	{"fight caves", competing},
	{"noobs die to cows", watching},
	{"Harmony", listening},
	{"Chambers of Xeric", playing},
	{"maxing", competing},
	{"GIM series", watching},
	{"Newbie Melody", listening},
	{"at Wintertodt", playing},
	{"in DMM", competing},
	{"B0aty highlights", watching},
	{"Autumn Voyage", listening},
	{"Theatre of Blood", playing},
	{"the Inferno", competing},
	{"RNG compilation", watching},
	{"Book of Spells", listening},
	{"Tempoross", playing},
	{"in LMS", competing},
	{"quest guides", watching},
	{"Scape Main", listening},
	{"at the Duel Arena", playing},
	{"PvP montages", watching},
	{"Background", listening},
	{"Nightmare", competing},
	{"for Twisted Bow", watching},
	{"Blast Furnace", playing},
	{"for skilling pets", watching},
	{"skill progress videos", watching},
	{"Morytania music", listening},
	{"at Pest Control", playing},
	{"clue scrolls", competing},
	{"HCIM deaths", watching},
	{"Forever", listening},
	{"for a sigil drop", playing},
	{"quest speedruns", watching},
	{"Al Kharid theme", listening},
	{"at Guardians of the Rift", playing},
	{"for rune pouches", playing},
	{"OSRS memes", watching},
	{"Darkmeyer music", listening},
	{"Castle Wars", playing},
	{"for dragon claws", playing},
	{"PvM guides", watching},
	{"Yanille theme", listening},
	{"at Soul Wars", playing},
	{"elite clues", competing},
	{"RuneScape podcasts", watching},
	{"Edgeville theme", listening},
	{"Fight Caves", playing},
	{"champion scrolls", competing},
	{"drop logs", watching},
	{"Legends\u2019 Guild music", listening},
	{"at Fishing Trawler", playing},
	{"XP waste", competing},
	{"PK tournament streams", watching},
	{"Fanfare 3", listening},
	{"Tombs of Amascut", playing},
	{"for purple chest", playing},
	{"Desert treasure music", listening},
	{"at Nex", playing},
	{"for Torva", playing},
	{"max efficiency guides", watching},
	{"Camelot theme", listening},
	{"Phosani's Nightmare", playing},
	{"for Harmonised orb", playing},
	{"ironman progression", watching},
	{"Lullaby", listening},
	{"Gauntlet", playing},
	{"speedrun records", watching},
	{"Prifddinas music", listening},
	{"Corrupted Gauntlet", playing},
	{"for enhanced seed", playing},
	{"GIM endgame series", watching},
	{"Elven Seed", listening},
	{"Chambers CM", playing},
	{"for pet Olmlet", playing},
	{"raid splitting guides", watching},
	{"The Depths", listening},
	{"Theatre HM", playing},
	{"for scythe", playing},
	{"ToB wipe compilations", watching},
	{"Medieval", listening},
	{"Colosseum", playing},
	{"for echo crystals", playing},
	{"PvM clan events", watching},
	{"Forthos Dungeon", listening},
	{"at Vardorvis", playing},
	{"for Virtus pieces", playing},
	{"DT2 boss guides", watching},
	{"Ancient theme", listening},
	{"at The Leviathan", playing},
	{"for ring pieces", playing},
	{"dry streak reactions", watching},
	{"Underwater", listening},
	{"at The Whisperer", playing},
	{"theory crafting videos", watching},
	{"Whispers", listening},
	{"at Duke Sucellus", playing},
	{"for magus vestige", playing},
	{"collection log videos", watching},
	{"Sucellus theme", listening},
	{"Phantom Muspah", playing},
	{"for ancient staff", playing},
	{"boss tier lists", watching},
	{"Muspah Tomb", listening},
	{"Awakened bosses", playing},
	{"for awakened orbs", playing},
	{"world record attempts", watching},
	{"Awakened theme", listening},
	{"at Vorkath", playing},
	{"for Vorki pet", playing},
	{"money making guides", watching},
	{"Fremennik Longhall", listening},
	{"Zalcano", playing},
	{"for tool seed", playing},
	{"skilling boss guides", watching},
	{"Crystal Cave", listening},
	{"Corp Beast", playing},
	{"for Ely sigil", playing},
	{"mass event highlights", watching},
	{"Spirit", listening},
	{"Cerberus", playing},
	{"for pegasian crystals", playing},
	{"pet hunting series", watching},
	{"The Slayer", listening},
	{"Hydra", playing},
	{"RNG reaction videos", watching},
	{"Karuulm Slayer", listening},
	{"at Zulrah", playing},
	{"for mutagens", playing},
	{"rotation guides", watching},
	{"Coil", listening},
	{"Scorpia", playing},
	{"Wilderness pets", competing},
	{"PvP world highlights", watching},
	{"Wilderness", listening},
	{"Maxnefien plank", watching},
	{"with Jedi", competing},
	{"to Eric yap", listening},
	{"F1...", watching},
	{"QPOH steal purples", watching},
	{"Visqo click", watching},
	{"Settled", watching},
}

const interval = 30 * time.Minute

var once sync.Once

// Start begins the rotation. Ready fires again after reconnects, so only the
// first call starts it.
func Start(client *bot.Client) {
	once.Do(func() {
		go func() {
			for {
				a := activities[rand.IntN(len(activities))]
				ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
				if err := client.SetPresence(ctx, a.presence()); err != nil {
					slog.Warn("Failed to set status", "err", err)
				}
				cancel()
				time.Sleep(interval)
			}
		}()
	})
}
