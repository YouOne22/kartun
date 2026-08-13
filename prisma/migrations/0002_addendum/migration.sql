-- Addendum PRD: forum/chat and polling
CREATE TABLE "chat_messages" (
    "id" UUID NOT NULL,
    "event_id" UUID,
    "sender_id" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "attachment_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "pollings" (
    "id" UUID NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pollings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "polling_options" (
    "id" UUID NOT NULL,
    "polling_id" UUID NOT NULL,
    "option_text" VARCHAR(100) NOT NULL,
    CONSTRAINT "polling_options_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "polling_votes" (
    "id" UUID NOT NULL,
    "polling_id" UUID NOT NULL,
    "option_id" UUID NOT NULL,
    "voter_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "polling_votes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "chat_messages_event_id_created_at_idx" ON "chat_messages"("event_id", "created_at");
CREATE UNIQUE INDEX "polling_votes_polling_id_voter_id_key" ON "polling_votes"("polling_id", "voter_id");
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pollings" ADD CONSTRAINT "pollings_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "polling_options" ADD CONSTRAINT "polling_options_polling_id_fkey" FOREIGN KEY ("polling_id") REFERENCES "pollings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "polling_votes" ADD CONSTRAINT "polling_votes_polling_id_fkey" FOREIGN KEY ("polling_id") REFERENCES "pollings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "polling_votes" ADD CONSTRAINT "polling_votes_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "polling_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "polling_votes" ADD CONSTRAINT "polling_votes_voter_id_fkey" FOREIGN KEY ("voter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

