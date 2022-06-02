CREATE TABLE "public"."users"
(
 "id"       integer NOT NULL GENERATED ALWAYS AS IDENTITY,
 "guild_id" varchar(32) NOT NULL,
 "user_id"  varchar(32) NOT NULL,
 "points"   integer NOT NULL DEFAULT 0,
 CONSTRAINT "PK_7" PRIMARY KEY ( "id" )
);


CREATE TABLE "public"."splits"
(
 "id"             integer NOT NULL GENERATED ALWAYS AS IDENTITY,
 "user"           integer NOT NULL,
 "split_amount"   integer NOT NULL,
 "split_item"     varchar(50) NOT NULL,
 "points_awarded" integer NOT NULL,
 CONSTRAINT "PK_13" PRIMARY KEY ( "id" ),
 CONSTRAINT "FK_19" FOREIGN KEY ( "user" ) REFERENCES "public"."users" ( "id" )
);

CREATE INDEX "FK_21" ON "splits"
(
 "user"
);

CREATE TABLE "public"."transactions"
(
 "id"             integer NOT NULL GENERATED ALWAYS AS IDENTITY,
 "user"           integer NOT NULL,
 "points_awarded" integer NOT NULL,
 "points_reason"  varchar(50) NOT NULL,
 CONSTRAINT "PK_24" PRIMARY KEY ( "id" ),
 CONSTRAINT "FK_26" FOREIGN KEY ( "user" ) REFERENCES "public"."users" ( "id" )
);

CREATE INDEX "FK_28" ON "transactions"
(
 "user"
);

