CREATE TABLE "bauth_accounts" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"expires_at" timestamp,
	"scope" text,
	"password" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bauth_sessions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" varchar(255) NOT NULL,
	"ip_address" varchar(255),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bauth_sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "bauth_users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false,
	"image" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bauth_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "bauth_verification_tokens" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bauth_verification_tokens_pk" PRIMARY KEY("identifier", "token")
);
--> statement-breakpoint
ALTER TABLE "bauth_accounts" ADD CONSTRAINT "bauth_accounts_user_id_bauth_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."bauth_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bauth_sessions" ADD CONSTRAINT "bauth_sessions_user_id_bauth_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."bauth_users"("id") ON DELETE cascade ON UPDATE no action;
