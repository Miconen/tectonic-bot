import { Discord, Slash } from 'discordx';

@Discord()
class Example {
	@Slash('hello')
	private hello() {
		// ...
	}
}
