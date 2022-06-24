CREATE TABLE `users`
(
 `id`       integer NOT NULL AUTO_INCREMENT,
 `guild_id` varchar(32) NOT NULL ,
 `user_id`  varchar(32) NOT NULL ,
 `points`   integer NOT NULL DEFAULT 0 ,

PRIMARY KEY (`id`)
);


CREATE TABLE `splits`
(
 `id`             integer NOT NULL AUTO_INCREMENT,
 `user`           integer NOT NULL ,
 `split_amount`   integer NOT NULL ,
 `split_item`     varchar(50) NOT NULL ,
 `points_awarded` integer NOT NULL ,

PRIMARY KEY (`id`),
KEY `FK_21` (`user`),
CONSTRAINT `FK_19` FOREIGN KEY `FK_21` (`user`) REFERENCES `users` (`id`)
);


CREATE TABLE `transactions`
(
 `id`             integer NOT NULL AUTO_INCREMENT,
 `user`           integer NOT NULL ,
 `points_awarded` integer NOT NULL ,
 `points_reason`  varchar(50) NOT NULL ,

PRIMARY KEY (`id`),
KEY `FK_28` (`user`),
CONSTRAINT `FK_26` FOREIGN KEY `FK_28` (`user`) REFERENCES `users` (`id`)
);

CREATE TABLE `rsn`
(
 `id`      integer NOT NULL AUTO_INCREMENT ,
 `user`    integer NOT NULL ,
 `rsn`     varchar(32) NOT NULL ,
 `type` varchar(8) NOT NULL ,

UNIQUE (rsn), 

PRIMARY KEY (`id`),
KEY `FK_29` (`user`),
CONSTRAINT `FK_27` FOREIGN KEY `FK_29` (`user`) REFERENCES `users` (`id`)
);

CREATE TABLE `guilds`
(
 `id`       integer NOT NULL AUTO_INCREMENT,
 `guild_id` varchar(32) NOT NULL ,
 `multiplier`   integer NOT NULL DEFAULT 1 ,

UNIQUE (guild_id),
PRIMARY KEY (`id`)
)