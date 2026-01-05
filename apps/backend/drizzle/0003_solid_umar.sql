-- Drop FK Constraints
ALTER TABLE "presets" DROP CONSTRAINT IF EXISTS "presets_created_by_users_id_fk";
ALTER TABLE "results" DROP CONSTRAINT IF EXISTS "results_user_id_users_id_fk";
ALTER TABLE "results" DROP CONSTRAINT IF EXISTS "results_preset_id_presets_id_fk";
ALTER TABLE "replays" DROP CONSTRAINT IF EXISTS "replays_result_id_results_id_fk";

-- Change PKs to UUID
ALTER TABLE "presets" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "presets" ALTER COLUMN "id" SET DATA TYPE uuid USING gen_random_uuid();
ALTER TABLE "presets" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

ALTER TABLE "replays" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "replays" ALTER COLUMN "id" SET DATA TYPE uuid USING gen_random_uuid();
ALTER TABLE "replays" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

ALTER TABLE "results" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "results" ALTER COLUMN "id" SET DATA TYPE uuid USING gen_random_uuid();
ALTER TABLE "results" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE uuid USING gen_random_uuid();
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- Change FKs to UUID
ALTER TABLE "presets" ALTER COLUMN "created_by" SET DATA TYPE uuid USING gen_random_uuid();
ALTER TABLE "results" ALTER COLUMN "user_id" SET DATA TYPE uuid USING gen_random_uuid();
ALTER TABLE "results" ALTER COLUMN "preset_id" SET DATA TYPE uuid USING gen_random_uuid();
ALTER TABLE "replays" ALTER COLUMN "result_id" SET DATA TYPE uuid USING gen_random_uuid();

-- Re-add FK Constraints
DO $$ BEGIN
 ALTER TABLE "presets" ADD CONSTRAINT "presets_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "results" ADD CONSTRAINT "results_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "results" ADD CONSTRAINT "results_preset_id_presets_id_fk" FOREIGN KEY ("preset_id") REFERENCES "public"."presets"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "replays" ADD CONSTRAINT "replays_result_id_results_id_fk" FOREIGN KEY ("result_id") REFERENCES "public"."results"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Add Unique Constraints on IDs
DO $$ BEGIN
 ALTER TABLE "presets" ADD CONSTRAINT "presets_id_unique" UNIQUE("id");
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "results" ADD CONSTRAINT "results_id_unique" UNIQUE("id");
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_id_unique" UNIQUE("id");
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;