CREATE USER :account WITH ENCRYPTED PASSWORD :password;
CREATE DATABASE :account WITH OWNER :account;

\c :account;

CREATE EXTENSION citext;

SET ROLE :account;

CREATE DOMAIN passtype AS VARCHAR
    CHECK ( value ~ '^\$2(a|b)\$\d+\$[A-Za-z0-9./$]{53}$' ); -- enforce bcrypt

CREATE DOMAIN mimetype AS citext
    CHECK ( value ~ '^[^/\s]+/[^/\s]+$' );

-- Enums should be listed here in the order they are used in the CREATE TABLEs
CREATE TYPE itemCondition AS ENUM ('poor', 'average', 'good', 'like new', 'new');

-- Table creations are in dependency order, since foreign keys must always reference existing tables
-- All text fields should be NOT NULL, since if NULL was allowed there would be two different values for nothing - NULL or an empty string
-- All primary keys (unless there is a pressing reason to do otherwise) should be serial4, since this does auto-incrementing
-- Any ON DELETE for a primary key pointing to a user (including indirectly) should have CASCADE behaviour, since fully deleting a user account should take all of that user's data with it
CREATE TABLE Account (
    UserID serial4 PRIMARY KEY,
    FullName varchar NOT NULL,
    Email varchar UNIQUE NOT NULL,
    PassHash passtype NOT NULL,
    DoB date NOT NULL,
    CreationDate timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    DeletionDate timestamp
);

CREATE TABLE Address (
    AddressID serial4 PRIMARY KEY,
    Country varchar NOT NULL,
    Region VARCHAR NOT NULL,
    PostCode varchar NOT NULL,
    UserID int4 NOT NULL REFERENCES Account ON DELETE CASCADE
);

CREATE TABLE Category (
    CategoryID serial4 PRIMARY KEY,
    CategoryName varchar NOT NULL,
    Icon bytea,
    Colour char(8) NOT NULL, -- HEX code RGBA
    Prompt varchar,
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
    ClosedDate timestamp,
    ReceiverID int4 REFERENCES Account ON DELETE SET NULL
);

CREATE TABLE SavedListing (
    UserID int4 NOT NULL REFERENCES Account ON DELETE CASCADE,
    ListingID int4 NOT NULL REFERENCES Account ON DELETE CASCADE,
    PRIMARY KEY(UserID, ListingID)
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

CREATE TABLE ConfirmActionToken (
    UserID int4 PRIMARY KEY REFERENCES Account ON DELETE CASCADE, -- Management of this table should only keep the latest non-expired token
    ResetTokenHash varchar NOT NULL,
    IssuedTimestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ExpirationTimestamp TIMESTAMP NOT NULL
    -- no need for validation timestamp, since we just remove used tokens from the DB
);

CREATE TABLE Media (
    MediaID serial4 PRIMARY KEY,
    MimeType mimetype NOT NULL,
    URL varchar NOT NULL,
    Index int2 NOT NULL DEFAULT 0,
    UserID int4 REFERENCES Account ON DELETE CASCADE,
    ListingID int4 REFERENCES Listing ON DELETE CASCADE,
    MessageID int4 REFERENCES Message ON DELETE CASCADE,
    UNIQUE (Index, UserID, ListingID, MessageID),
    CHECK ((UserID IS NOT NULL AND ListingID IS NULL AND MessageID IS NULL) OR
           (UserID IS NULL AND ListingID IS NOT NULL AND MessageID IS NULL) OR
           (UserID IS NULL AND ListingID IS NULL AND MessageID IS NOT NULL))
);

-- Some functions for more complex constraints
CREATE OR REPLACE FUNCTION is_address_owned_by (int4, int4) RETURNS boolean AS $$
    SELECT EXISTS (
        SELECT 1 FROM Address WHERE AddressID = $1 AND UserID = $2
    );
$$ LANGUAGE SQL;

ALTER TABLE Listing ADD CONSTRAINT addr_owner_agrees CHECK (is_address_owned_by(AddressID, ContributorID));
