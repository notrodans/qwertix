ALTER TABLE "presets" ALTER COLUMN "created_by" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "replays" ALTER COLUMN "result_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "results" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "results" ALTER COLUMN "preset_id" SET DATA TYPE uuid;