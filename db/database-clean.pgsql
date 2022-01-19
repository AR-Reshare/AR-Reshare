-- Remove the existing database and user
DROP DATABASE IF EXISTS :database;
DROP OWNED BY :account CASCADE;
DROP USER IF EXISTS :account;
