CREATE TABLE guilds (
 guild_id varchar(32) NOT NULL,
 multiplier int NOT NULL DEFAULT '1',
 PRIMARY KEY (guild_id)
);

CREATE TABLE users (
 user_id varchar(32) NOT NULL,
 guild_id varchar(32) NOT NULL,
 points int NOT NULL DEFAULT '0',
 PRIMARY KEY (user_id,guild_id)
,
 CONSTRAINT users_ibfk_1 FOREIGN KEY (guild_id) REFERENCES guilds (guild_id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE INDEX guild_id ON users (guild_id);

CREATE TABLE rsn (
 rsn varchar(32) NOT NULL,
 wom_id varchar(32) NOT NULL, 
 user_id varchar(32) NOT NULL,
 guild_id varchar(32) NOT NULL,
 PRIMARY KEY (wom_id,guild_id),
 CONSTRAINT rsn_ibfk_1 FOREIGN KEY (user_id , guild_id) REFERENCES users (user_id , guild_id) ON DELETE CASCADE ON UPDATE CASCADE
);
 
