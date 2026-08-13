-- NIK is intentionally not stored because it is highly private personal data.
DROP INDEX IF EXISTS "users_nik_key";
ALTER TABLE "users" DROP COLUMN IF EXISTS "nik";
