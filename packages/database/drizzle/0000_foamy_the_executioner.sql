CREATE TABLE IF NOT EXISTS "locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"building" varchar NOT NULL,
	"number" varchar NOT NULL,
	"area" numeric,
	"level" integer NOT NULL,
	"parentId" integer,
	CONSTRAINT "locations_number_unique" UNIQUE("number")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "locations" ADD CONSTRAINT "locations_parentId_locations_id_fk" FOREIGN KEY ("parentId") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
