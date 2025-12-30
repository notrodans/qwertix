ALTER TABLE "users"
    ALTER COLUMN "password_hash" SET NOT NULL;

--> statement-breakpoint
ALTER TABLE "users"
    ADD COLUMN "role" text DEFAULT 'user' NOT NULL;

--> statement-breakpoint

