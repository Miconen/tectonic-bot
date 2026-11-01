// Package deps bundles the shared services command handlers need.
package deps

import (
	"github.com/Miconen/tectonic-bot/go/internal/catalog"
	"github.com/Miconen/tectonic-bot/go/internal/pointsrc"
	"github.com/Miconen/tectonic-bot/go/internal/ranks"
	"github.com/Miconen/tectonic-bot/go/internal/tectonic"
)

type Deps struct {
	API     *tectonic.Client
	Ranks   *ranks.Cache
	Sources *pointsrc.Cache
	Catalog *catalog.Catalog
}
