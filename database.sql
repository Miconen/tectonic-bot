DROP TABLE IF EXISTS "boss";
CREATE TABLE "public"."boss" (
    "name" character varying(32) NOT NULL,
    "display_name" character varying(32) NOT NULL,
    "category" character varying(64) NOT NULL,
    CONSTRAINT "boss_name" PRIMARY KEY ("name")
) WITH (oids = false);


DROP TABLE IF EXISTS "categories";
CREATE TABLE "public"."categories" (
    "thumbnail" character varying(256),
    "order" smallint DEFAULT '0' NOT NULL,
    "name" character varying(64) NOT NULL,
    CONSTRAINT "categories_name" PRIMARY KEY ("name")
) WITH (oids = false);


DROP TABLE IF EXISTS "guild_boss";
CREATE TABLE "public"."guild_boss" (
    "boss" character varying(32) NOT NULL,
    "guild_id" character varying(32) NOT NULL,
    "solo" boolean NOT NULL,
    "pb_id" integer NOT NULL,
    CONSTRAINT "guild_boss_boss_guiild_id" PRIMARY KEY ("boss", "guild_id")
) WITH (oids = false);


DROP TABLE IF EXISTS "guild_category";
CREATE TABLE "public"."guild_category" (
    "guild_id" character varying(32) NOT NULL,
    "category" character varying(64) NOT NULL,
    "message_id" character varying(32) NOT NULL,
    CONSTRAINT "guild_category_guild_id_category" PRIMARY KEY ("guild_id", "category")
) WITH (oids = false);


DROP TABLE IF EXISTS "guilds";
CREATE TABLE "public"."guilds" (
    "guild_id" character varying(32) NOT NULL,
    "multiplier" integer DEFAULT '1' NOT NULL,
    CONSTRAINT "guilds_pkey" PRIMARY KEY ("guild_id")
) WITH (oids = false);


DROP TABLE IF EXISTS "rsn";
CREATE TABLE "public"."rsn" (
    "rsn" character varying(32) NOT NULL,
    "wom_id" character varying(32) NOT NULL,
    "user_id" character varying(32) NOT NULL,
    "guild_id" character varying(32) NOT NULL,
    CONSTRAINT "rsn_pkey" PRIMARY KEY ("wom_id", "guild_id")
) WITH (oids = false);


DROP TABLE IF EXISTS "teams";
CREATE TABLE "public"."teams" (
    "run_id" integer NOT NULL,
    "user_id" character varying(32) NOT NULL,
    "guild_id" character varying(32) NOT NULL,
    CONSTRAINT "teams_run_id_user_id_guild_id" PRIMARY KEY ("run_id", "user_id", "guild_id")
) WITH (oids = false);


DROP TABLE IF EXISTS "times";
DROP SEQUENCE IF EXISTS times_run_id_seq;
CREATE SEQUENCE times_run_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."times" (
    "time" integer NOT NULL,
    "boss_name" character varying(32) NOT NULL,
    "run_id" integer DEFAULT nextval('times_run_id_seq') NOT NULL,
    CONSTRAINT "times_pkey" PRIMARY KEY ("run_id")
) WITH (oids = false);


DROP TABLE IF EXISTS "users";
CREATE TABLE "public"."users" (
    "user_id" character varying(32) NOT NULL,
    "guild_id" character varying(32) NOT NULL,
    "points" integer DEFAULT '0' NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id", "guild_id")
) WITH (oids = false);

CREATE INDEX "guild_id" ON "public"."users" USING btree ("guild_id");


ALTER TABLE ONLY "public"."boss" ADD CONSTRAINT "boss_category_fkey" FOREIGN KEY (category) REFERENCES categories(name) ON UPDATE CASCADE ON DELETE SET NULL NOT DEFERRABLE;

ALTER TABLE ONLY "public"."guild_boss" ADD CONSTRAINT "guild_boss_boss_fkey" FOREIGN KEY (boss) REFERENCES boss(name) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."guild_boss" ADD CONSTRAINT "guild_boss_guild_id_fkey" FOREIGN KEY (guild_id) REFERENCES guilds(guild_id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."guild_boss" ADD CONSTRAINT "guild_boss_pb_id_fkey" FOREIGN KEY (pb_id) REFERENCES times(run_id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."guild_category" ADD CONSTRAINT "guild_category_category_fkey" FOREIGN KEY (category) REFERENCES categories(name) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."guild_category" ADD CONSTRAINT "guild_category_guild_id_fkey" FOREIGN KEY (guild_id) REFERENCES guilds(guild_id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."rsn" ADD CONSTRAINT "rsn_ibfk_1" FOREIGN KEY (user_id, guild_id) REFERENCES users(user_id, guild_id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."teams" ADD CONSTRAINT "teams_run_id_fkey" FOREIGN KEY (run_id) REFERENCES times(run_id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."teams" ADD CONSTRAINT "teams_user_id_guild_id_fkey" FOREIGN KEY (user_id, guild_id) REFERENCES users(user_id, guild_id) ON UPDATE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."times" ADD CONSTRAINT "times_boss_name_fkey" FOREIGN KEY (boss_name) REFERENCES boss(name) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."users" ADD CONSTRAINT "users_ibfk_1" FOREIGN KEY (guild_id) REFERENCES guilds(guild_id) ON UPDATE RESTRICT ON DELETE RESTRICT NOT DEFERRABLE;

INSERT INTO categories ("thumbnail", "order", "name")
VALUES
    ('nightmare_thumbnail_url', 1, 'Nightmare'),
    ('sepulcher_thumbnail_url', 2, 'Sepulchre'),
    ('cox_thumbnail_url', 3, 'Chambers of Xeric'),
    ('cox_thumbnail_url', 4, 'Chambers of Xeric: CM'),
    ('tob_thumbnail_url', 5, 'Theatre of Blood'),
    ('tob_thumbnail_url', 6, 'Theatre of Blood: HM'),
    ('toa_thumbnail_url', 7, 'Tombs of Amascut'),
    ('thumbnail_url', 8, 'Miscellaneous'),
    ('slayer_thumbnail_url', 9, 'Slayer Boss');

INSERT INTO boss (name, display_name, category)
VALUES
    -- CoX
    ('cox_1', 'Solo', 'Chambers of Xeric'),
    ('cox_2', 'Duo', 'Chambers of Xeric'),
    ('cox_3', 'Trio', 'Chambers of Xeric'),
    ('cox_5', '5-man', 'Chambers of Xeric'),
    ('cox_any', 'Any', 'Chambers of Xeric'),
    -- Cox: CM
    ('cm_1', 'Solo', 'Chambers of Xeric: CM'),
    ('cm_2', 'Duo', 'Chambers of Xeric: CM'),
    ('cm_3', 'Trio', 'Chambers of Xeric: CM'),
    ('cm_5', '5-man', 'Chambers of Xeric: CM'),
    ('cm_any', 'Any', 'Chambers of Xeric: CM'),
    -- ToB
    ('tob_1', 'Solo', 'Theatre of Blood'),
    ('tob_2', 'Duo', 'Theatre of Blood'),
    ('tob_3', 'Trio', 'Theatre of Blood'),
    ('tob_4', '4-man', 'Theatre of Blood'),
    ('tob_5', '5-man', 'Theatre of Blood'),
    -- ToB: HM
    ('hmt_1', 'Solo', 'Theatre of Blood: HM'),
    ('hmt_2', 'Duo', 'Theatre of Blood: HM'),
    ('hmt_3', 'Trio', 'Theatre of Blood: HM'),
    ('hmt_4', '4-man', 'Theatre of Blood: HM'),
    ('hmt_5', '5-man', 'Theatre of Blood: HM'),
    -- ToA
    ('toa_solo_150', 'Solo 150+', 'Tombs of Amascut'),
    ('toa_solo_300', 'Solo 300+', 'Tombs of Amascut'),
    ('toa_solo_400', 'Solo 400+', 'Tombs of Amascut'),
    ('toa_solo_500', 'Solo 500+', 'Tombs of Amascut'),
    ('toa_team_150', 'Team 150+', 'Tombs of Amascut'),
    ('toa_team_300', 'Team 300+', 'Tombs of Amascut'),
    ('toa_team_400', 'Team 400+', 'Tombs of Amascut'),
    ('toa_team_500', 'Team 500+', 'Tombs of Amascut'),
    -- Miscellanious
    ('vorkath', 'Vorkath', 'Miscellaneous'),
    ('muspah', 'Phantom Muspah', 'Miscellaneous'),
    ('mimic', 'Mimic', 'Miscellaneous'),
    ('hespori', 'Hespori', 'Miscellaneous'),
    ('zulrah', 'Zulrah', 'Miscellaneous'),
    -- Slayer
    ('hydra', 'Alchemical Hydra', 'Slayer Boss'),
    ('ggs', 'Grotesque Guardians', 'Slayer Boss'),
    -- Nightmare
    ('nm', 'Nightmare', 'Nightmare'),
    ('pnm', 'Phosani''s Nightmare', 'Nightmare'),
    -- Sepulcher
    ('sep_5', 'Sepulchre Floor 5', 'Sepulchre');
    ('sep', 'Sepulchre Overall', 'Sepulchre');
