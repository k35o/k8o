DROP TABLE `ai_share_serves`;--> statement-breakpoint
ALTER TABLE `ai_projects` DROP COLUMN `public_snapshot`;--> statement-breakpoint
DELETE FROM ai_project_versions WHERE project_id IN (SELECT id FROM ai_projects WHERE app = 'ui-studio');--> statement-breakpoint
DELETE FROM ai_projects WHERE app = 'ui-studio';
