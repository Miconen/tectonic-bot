CREATE TABLE `guilds` (
 `id` int NOT NULL AUTO_INCREMENT,
 `guild_id` varchar(32) NOT NULL,
 `multiplier` int NOT NULL DEFAULT '1',
 PRIMARY KEY (`id`),
 UNIQUE KEY `guild_id` (`guild_id`)
)

CREATE TABLE `users` (
 `user_id` varchar(32) NOT NULL,
 `guild_id` varchar(32) NOT NULL,
 `points` int NOT NULL DEFAULT '0',
 PRIMARY KEY (`user_id`,`guild_id`),
 KEY `guild_id` (`guild_id`),
 CONSTRAINT `users_ibfk_1` FOREIGN KEY (`guild_id`) REFERENCES `guilds` (`guild_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
)

CREATE TABLE `rsn` (
 `discord_id` varchar(32) NOT NULL,
 `wom_id` varchar(32) NOT NULL,
 `rsn` varchar(32) NOT NULL,
 PRIMARY KEY (`discord_id`,`wom_id`),
 UNIQUE KEY `rsn` (`rsn`),
 CONSTRAINT `rsn_ibfk_1` FOREIGN KEY (`discord_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
)