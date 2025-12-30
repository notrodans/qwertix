CREATE TABLE "presets" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"config" jsonb NOT NULL,
	"is_custom" boolean DEFAULT false NOT NULL,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "replays" (
	"id" serial PRIMARY KEY NOT NULL,
	"result_id" integer NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "results" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"preset_id" integer,
	"wpm" integer NOT NULL,
	"raw" integer NOT NULL,
	"accuracy" integer NOT NULL,
	"consistency" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "presets" ADD CONSTRAINT "presets_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "replays" ADD CONSTRAINT "replays_result_id_results_id_fk" FOREIGN KEY ("result_id") REFERENCES "public"."results"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "results" ADD CONSTRAINT "results_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "results" ADD CONSTRAINT "results_preset_id_presets_id_fk" FOREIGN KEY ("preset_id") REFERENCES "public"."presets"("id") ON DELETE no action ON UPDATE no action;