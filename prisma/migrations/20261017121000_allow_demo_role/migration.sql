-- DEMO: the read-only login shown on the demo's admin page.
ALTER TABLE "User" DROP CONSTRAINT "User_role_valid";
ALTER TABLE "User" ADD CONSTRAINT "User_role_valid" CHECK ("role" IN ('ADMIN', 'STAFF', 'DEMO'));
