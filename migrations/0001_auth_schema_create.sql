CREATE TABLE "bauth_accounts" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bauth_sessions" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" uuid NOT NULL,
	CONSTRAINT "bauth_sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "bauth_users" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bauth_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "bauth_verification_tokens" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bauth_accounts" ADD CONSTRAINT "bauth_accounts_user_id_bauth_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."bauth_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bauth_sessions" ADD CONSTRAINT "bauth_sessions_user_id_bauth_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."bauth_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bauth_accounts_userId_idx" ON "bauth_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "bauth_accounts_providerId_idx" ON "bauth_accounts" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "bauth_sessions_userId_idx" ON "bauth_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "bauth_sessions_token_idx" ON "bauth_sessions" USING btree ("token");--> statement-breakpoint
CREATE INDEX "bauth_users_email_idx" ON "bauth_users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "bauth_verification_tokens_identifier_idx" ON "bauth_verification_tokens" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "bauth_verification_tokens_value_idx" ON "bauth_verification_tokens" USING btree ("value");