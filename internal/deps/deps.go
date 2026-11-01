// Package deps bundles the shared services command handlers need.
package deps

import (
	"github.com/Miconen/tectonic-bot/internal/catalog"
	"github.com/Miconen/tectonic-bot/internal/pointsrc"
	"github.com/Miconen/tectonic-bot/internal/ranks"
	"github.com/Miconen/tectonic-bot/internal/tectonic"
	"github.com/Miconen/tectonic-bot/internal/wom"
)

type Deps struct {
	API     *tectonic.Client
	Ranks   *ranks.Cache
	Sources *pointsrc.Cache
	Catalog *catalog.Catalog
	Wom     *wom.Client
}
