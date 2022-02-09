-- Execute from linux via the makefile with: sudo -u postgres npm run db-init

CREATE USER :account WITH ENCRYPTED PASSWORD :password;
CREATE DATABASE :account WITH OWNER :account;

\c :account;

-- GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE ON ALL TABLES IN SCHEMA public TO :account;

CREATE EXTENSION citext;

SET ROLE :account;
-- Define an email type
CREATE DOMAIN email AS citext
    CHECK ( value ~ '^[a-zA-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$' );

CREATE DOMAIN mimetype AS citext
    CHECK ( value ~ '^[^/\s]+/[^/\s]+$' );

-- Enums should be listed here in the order they are used in the CREATE TABLEs
CREATE TYPE itemCondition AS ENUM ('poor', 'average', 'good', 'like new', 'new');
CREATE TYPE reportReason AS ENUM ('request', 'scam', 'illegal content', 'malicious language', 'other');
CREATE TYPE reportStatus AS ENUM ('reported', 'investigating', 'closed');

-- Table creations are in dependency order, since foreign keys must always reference existing tables
-- All text fields should be NOT NULL, since if NULL was allowed there would be two different values for nothing - NULL or an empty string
-- All primary keys (unless there is a pressing reason to do otherwise) should be serial4, since this does auto-incrementing
-- Any ON DELETE for a primary key pointing to a user (including indirectly) should have CASCADE behaviour, since fully deleting a user account should take all of that user's data with it
CREATE TABLE Account (
    UserID serial4 PRIMARY KEY,
    FullName varchar NOT NULL,
    Email email UNIQUE NOT NULL,
    PassHash varchar NOT NULL,
    DoB date NOT NULL,
    CreationDate timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    DeletionDate timestamp
);

CREATE TABLE Address (
    AddressID serial4 PRIMARY KEY,
    Country varchar NOT NULL,
    PostCode varchar NOT NULL,
    UserID int4 NOT NULL REFERENCES Account ON DELETE CASCADE
);

CREATE TABLE Category (
    CategoryID serial4 PRIMARY KEY,
    CategoryName varchar NOT NULL,
    Icon bytea NOT NULL,
    Colour char(8) NOT NULL, -- HEX code RGBA
    Prompt varchar NOT NULL,
    ParentCategory int4 REFERENCES Category ON DELETE SET NULL
);

CREATE TABLE Listing (
    ListingID serial4 PRIMARY KEY,
    ContributorID int4 NOT NULL REFERENCES Account ON DELETE CASCADE,
    Title varchar NOT NULL,
    Description varchar NOT NULL,
    Condition itemCondition NOT NULL,
    AddressID int4 NOT NULL REFERENCES Address ON DELETE CASCADE,
    CategoryID int4 REFERENCES Category ON DELETE SET NULL,
    CreationDate timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ModificationDate timestamp,
    ClosedDate timestamp
);

CREATE TABLE Conversation (
    ConversationID serial4 PRIMARY KEY,
    ReceiverID int4 NOT NULL REFERENCES Account ON DELETE CASCADE,
    ListingID int4 NOT NULL REFERENCES Listing ON DELETE CASCADE,
    CreationDate timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ClosedDate timestamp
);

CREATE TABLE Message (
    MessageID serial4 PRIMARY KEY,
    SenderID int4 NOT NULL REFERENCES Account ON DELETE CASCADE,
    ConversationID int4 NOT NULL REFERENCES Conversation ON DELETE CASCADE,
    SentTime timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ReadTime timestamp,
    ContentText varchar NOT NULL
);

CREATE TABLE PushToken (
    DeviceToken varchar PRIMARY KEY, -- Nobody can agree on what an FCM token actually looks like. Reported lengths have ranged from 119 chars to 326 chars.
    Time timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UserID int4 NOT NULL REFERENCES Account ON DELETE CASCADE
);

CREATE TABLE Media (
    MediaID serial4 PRIMARY KEY,
    MimeType mimetype NOT NULL,
    URL varchar NOT NULL,
    Index int2 NOT NULL DEFAULT 0
);

CREATE TABLE ProfilePicture (
    MediaID int4 PRIMARY KEY REFERENCES Media ON DELETE CASCADE,
    UserID int4 NOT NULL REFERENCES Account ON DELETE CASCADE
);

CREATE TABLE ListingMedia (
    MediaID int4 PRIMARY KEY REFERENCES Media ON DELETE CASCADE,
    ListingID int4 NOT NULL REFERENCES Listing ON DELETE CASCADE
);

CREATE TABLE MessageMedia (
    MediaID int4 PRIMARY KEY REFERENCES Media ON DELETE CASCADE,
    MessageID int4 NOT NULL REFERENCES Message ON DELETE CASCADE
);

CREATE TABLE Administrator (
    UserID int4 PRIMARY KEY REFERENCES Account ON DELETE CASCADE
);

CREATE TABLE Report (
    ReportID serial4 PRIMARY KEY,
    ReporterID int4 NOT NULL REFERENCES Account ON DELETE CASCADE,
    Reason reportReason NOT NULL,
    Description varchar NOT NULL,
    Outcome varchar NOT NULL,
    Status reportStatus NOT NULL,
    CreationDate timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    AdminID int4 REFERENCES Administrator ON DELETE SET NULL
);

CREATE TABLE ProfileReport (
    ReportID int4 PRIMARY KEY REFERENCES Report ON DELETE CASCADE,
    UserID int4 NOT NULL REFERENCES Account ON DELETE CASCADE
);

CREATE TABLE ListingReport (
    ReportID int4 PRIMARY KEY REFERENCES Report ON DELETE CASCADE,
    ListingID int4 NOT NULL REFERENCES Listing ON DELETE CASCADE
);

CREATE TABLE MessageReport (
    ReportID int4 PRIMARY KEY REFERENCES Report ON DELETE CASCADE,
    MessageID int4 NOT NULL REFERENCES Message ON DELETE CASCADE 
);

CREATE TABLE Request (
    ReportID int4 PRIMARY KEY REFERENCES Report ON DELETE CASCADE
);

CREATE TABLE Sanction (
    SanctionID serial4 PRIMARY KEY,
    UserID int4 NOT NULL REFERENCES Account ON DELETE CASCADE,
    Type varchar NOT NULL,
    StartDate timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    EndDate timestamp,
    Reason varchar NOT NULL,
    ReportID int4 REFERENCES Report ON DELETE SET NULL, -- An exception to the usual ON DELETE CASCADE, since if a user is deleted and their report led to a sanction of another user, that user should still be under the sanction
    AdminID int4 REFERENCES Administrator ON DELETE SET NULL
);

CREATE TABLE AdminChange (
    ChangeID serial4 PRIMARY KEY,
    Reason varchar NOT NULL,
    Date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    AdminID int4 REFERENCES Administrator ON DELETE SET NULL
);

CREATE TABLE ProfileChange (
    ChangeID int4 PRIMARY KEY REFERENCES AdminChange ON DELETE CASCADE,
    UserID int4 NOT NULL REFERENCES Account ON DELETE CASCADE
);

CREATE TABLE ListingChange (
    ChangeID int4 PRIMARY KEY REFERENCES AdminChange ON DELETE CASCADE,
    ListingID int4 NOT NULL REFERENCES Listing ON DELETE CASCADE
);
