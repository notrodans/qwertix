ALTER TABLE "replays" DROP CONSTRAINT "replays_result_id_results_id_fk";
--> statement-breakpoint
ALTER TABLE "replays" ADD CONSTRAINT "replays_result_id_results_id_fk" FOREIGN KEY ("result_id") REFERENCES "public"."results"("id") ON DELETE cascade ON UPDATE no action;