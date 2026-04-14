CREATE TABLE "bauth_accounts" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"account_id" varchar(255) NOT NULL,
	"provider_id" varchar(255) NOT NULL,
	"access_token" varchar(500),
	"refresh_token" varchar(500),
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bauth_sessions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"method" varchar(50),
	"ip_address" varchar(100),
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "bauth_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false,
	"name" varchar(255),
	"image" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bauth_verification_tokens" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "bauth_accounts_user_id_idx" ON "bauth_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "bauth_accounts_provider_id_idx" ON "bauth_accounts" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "bauth_sessions_user_id_idx" ON "bauth_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "bauth_sessions_expires_at_idx" ON "bauth_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "bauth_users_email_idx" ON "bauth_users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "bauth_users_email_unique_idx" ON "bauth_users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "bauth_verification_tokens_token_unique_idx" ON "bauth_verification_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "bauth_verification_tokens_identifier_idx" ON "bauth_verification_tokens" USING btree ("identifier");