// Package deps bundles the shared services command handlers need.
package deps

import (
	"github.com/Miconen/tectonic-bot/go/internal/ranks"
	"github.com/Miconen/tectonic-bot/go/internal/tectonic"
)

type Deps struct {
	API   *tectonic.Client
	Ranks *ranks.Cache
}
