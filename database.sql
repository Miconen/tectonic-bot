DROP TABLE IF EXISTS "bosses";
CREATE TABLE "public"."bosses" (
    "name" character varying(32) NOT NULL,
    "display_name" character varying(32) NOT NULL,
    "category" character varying(64) NOT NULL,
    "solo" boolean NOT NULL,
    CONSTRAINT "boss_name" PRIMARY KEY ("name")
) WITH (oids = false);


DROP TABLE IF EXISTS "categories";
CREATE TABLE "public"."categories" (
    "thumbnail" character varying(256),
    "order" smallint DEFAULT '0' NOT NULL,
    "name" character varying(64) NOT NULL,
    CONSTRAINT "categories_name" PRIMARY KEY ("name")
) WITH (oids = false);


DROP TABLE IF EXISTS "guild_bosses";
CREATE TABLE "public"."guild_bosses" (
    "boss" character varying(32) NOT NULL,
    "guild_id" character varying(32) NOT NULL,
    "pb_id" integer,
    CONSTRAINT "guild_bosses_bosses_guild_id" PRIMARY KEY ("boss", "guild_id")
) WITH (oids = false);


DROP TABLE IF EXISTS "guild_categories";
CREATE TABLE "public"."guild_categories" (
    "guild_id" character varying(32) NOT NULL,
    "category" character varying(64) NOT NULL,
    "message_id" character varying(32) NOT NULL,
    CONSTRAINT "guild_categories_guild_id_category" PRIMARY KEY ("guild_id", "category")
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


ALTER TABLE ONLY "public"."bosses" ADD CONSTRAINT "boss_category_fkey" FOREIGN KEY (category) REFERENCES categories(name) ON UPDATE CASCADE ON DELETE SET NULL NOT DEFERRABLE;

ALTER TABLE ONLY "public"."guild_bosses" ADD CONSTRAINT "guild_bosses_bosses_fkey" FOREIGN KEY (boss) REFERENCES bosses(name) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."guild_bosses" ADD CONSTRAINT "guild_bosses_guild_id_fkey" FOREIGN KEY (guild_id) REFERENCES guilds(guild_id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."guild_bosses" ADD CONSTRAINT "guild_bosses_pb_id_fkey" FOREIGN KEY (pb_id) REFERENCES times(run_id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."guild_categories" ADD CONSTRAINT "guild_categories_category_fkey" FOREIGN KEY (category) REFERENCES categories(name) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."guild_categories" ADD CONSTRAINT "guild_categories_guild_id_fkey" FOREIGN KEY (guild_id) REFERENCES guilds(guild_id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."rsn" ADD CONSTRAINT "rsn_ibfk_1" FOREIGN KEY (user_id, guild_id) REFERENCES users(user_id, guild_id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."teams" ADD CONSTRAINT "teams_run_id_fkey" FOREIGN KEY (run_id) REFERENCES times(run_id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."teams" ADD CONSTRAINT "teams_user_id_guild_id_fkey" FOREIGN KEY (user_id, guild_id) REFERENCES users(user_id, guild_id) ON UPDATE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."times" ADD CONSTRAINT "times_bosses_name_fkey" FOREIGN KEY (boss_name) REFERENCES bosses(name) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

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

INSERT INTO bosses (name, display_name, category, solo)
VALUES
    -- CoX
    ('cox_1', 'Solo', 'Chambers of Xeric', true),
    ('cox_2', 'Duo', 'Chambers of Xeric', false),
    ('cox_3', 'Trio', 'Chambers of Xeric', false),
    ('cox_5', '5-man', 'Chambers of Xeric', false),
    ('cox_any', 'Any', 'Chambers of Xeric', false),
    -- Cox: CM
    ('cm_1', 'Solo', 'Chambers of Xeric: CM', true),
    ('cm_2', 'Duo', 'Chambers of Xeric: CM', false),
    ('cm_3', 'Trio', 'Chambers of Xeric: CM', false),
    ('cm_5', '5-man', 'Chambers of Xeric: CM', false),
    ('cm_any', 'Any', 'Chambers of Xeric: CM', false),
    -- ToB
    ('tob_1', 'Solo', 'Theatre of Blood', true),
    ('tob_2', 'Duo', 'Theatre of Blood', false),
    ('tob_3', 'Trio', 'Theatre of Blood', false),
    ('tob_4', '4-man', 'Theatre of Blood', false),
    ('tob_5', '5-man', 'Theatre of Blood', false),
    -- ToB: HM
    ('hmt_1', 'Solo', 'Theatre of Blood: HM', true),
    ('hmt_2', 'Duo', 'Theatre of Blood: HM', false),
    ('hmt_3', 'Trio', 'Theatre of Blood: HM', false),
    ('hmt_4', '4-man', 'Theatre of Blood: HM', false),
    ('hmt_5', '5-man', 'Theatre of Blood: HM', false),
    -- ToA
    ('toa_solo_150', 'Solo 150+', 'Tombs of Amascut', true),
    ('toa_solo_300', 'Solo 300+', 'Tombs of Amascut', true),
    ('toa_solo_400', 'Solo 400+', 'Tombs of Amascut', true),
    ('toa_solo_500', 'Solo 500+', 'Tombs of Amascut', true),
    ('toa_team_150', 'Team 150+', 'Tombs of Amascut', false),
    ('toa_team_300', 'Team 300+', 'Tombs of Amascut', false),
    ('toa_team_400', 'Team 400+', 'Tombs of Amascut', false),
    ('toa_team_500', 'Team 500+', 'Tombs of Amascut', false),
    -- Miscellanious
    ('vorkath', 'Vorkath', 'Miscellaneous', true),
    ('muspah', 'Phantom Muspah', 'Miscellaneous', true),
    ('mimic', 'Mimic', 'Miscellaneous', true),
    ('hespori', 'Hespori', 'Miscellaneous', true),
    ('zulrah', 'Zulrah', 'Miscellaneous', true),
    -- Slayer
    ('hydra', 'Alchemical Hydra', 'Slayer Boss', true),
    ('ggs', 'Grotesque Guardians', 'Slayer Boss', true),
    -- Nightmare
    ('nm_1', 'Solo', 'Nightmare', true),
    ('nm_5', '5-man', 'Nightmare', true),
    ('pnm', 'Phosani''s Nightmare', 'Nightmare', true),
    -- Sepulcher
    ('sep_5', 'Sepulchre Floor 5', 'Sepulchre', true),
    ('sep', 'Sepulchre Overall', 'Sepulchre', true);
