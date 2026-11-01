package str

import "fmt"

// errors.*
const (
	NoGuild       = "This command must be used in a server."
	APIHealth     = "Cannot reach the application server. Please try again in 30 seconds."
	InternalError = "An internal error occurred. Please try again."
	// UnexpectedAPIError replaces raw messages from network failures,
	// validation errors and unknown codes (#152).
	UnexpectedAPIError = "An unexpected API error occurred. Please try again later."
)

func CouldntGetUser(userID string) string {
	return fmt.Sprintf("Couldn't get user for ID: %s", userID)
}

func RSNNotBound(rsn string) string {
	return fmt.Sprintf("**%s** is not bound to a known member.", rsn)
}

// permissions.*
const AdminRequired = "You do not have the required permissions for this action. Administrator permissions required."

// validation.*
func ConflictingParams(param1, param2 string) string {
	return fmt.Sprintf("Cannot use both %s and %s at the same time.", param1, param2)
}

// accounts.*
const NoLinkedAccounts = "`Link your OSRS account to be eligible for event rank points`"

func NotActivated(username string) string {
	return fmt.Sprintf(Cross+" **%s** is not an activated user.", username)
}
