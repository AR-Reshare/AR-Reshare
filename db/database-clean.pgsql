-- Remove the existing database and user
-- DROP DATABASE IF EXISTS :account;
-- DROP OWNED BY :account CASCADE;
-- DROP USER IF EXISTS :account;

DROP TABLE IF EXISTS Media, ConfirmActionToken, PushToken, Message, Conversation, SavedListing, Listing, Category, Address, Account CASCADE;
