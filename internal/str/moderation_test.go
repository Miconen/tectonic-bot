package str

import "testing"

func TestUpdated(t *testing.T) {
	id := "9"
	got := Updated("Settings", Change{Field: "Mod channel", From: ChannelMention(nil), To: ChannelMention(&id)})
	want := Check + " Settings updated\n**Mod channel**: not set → <#9>"
	if got != want {
		t.Errorf("got %q want %q", got, want)
	}
}
