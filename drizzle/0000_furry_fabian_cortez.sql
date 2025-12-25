CREATE TABLE `chapter` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`link` text NOT NULL,
	`site` text NOT NULL,
	`videos` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `donghua` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`link` text NOT NULL,
	`site` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
