-- Execute from linux via the makefile with: sudo -u postgres make

CREATE USER arresharedev WITH ENCRYPTED PASSWORD 'SVh}Q,A>3.nL9vp~';
CREATE DATABASE arresharedev WITH OWNER arresharedev;
\c arresharedev

CREATE EXTENSION citext;

SET ROLE arresharedev; -- So any created tables will be owned by arresharedev, not superuser

-- Define an email type
CREATE DOMAIN email AS citext
    CHECK ( value ~ '^[a-zA-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$' );

CREATE DOMAIN mimetype AS citext
    CHECK ( value ~ '^[^/\s]+/[^/\s]+$' );

CREATE TYPE itemCondition AS ENUM ('poor', 'average', 'good', 'like new', 'new');
CREATE TYPE reportReason AS ENUM ('request', 'scam', 'illegal content', 'malicious language', 'other');
CREATE TYPE reportStatus AS ENUM ('reported', 'investigating', 'closed');

-- Table creations are in dependency order, since foreign keys must always reference existing tables
CREATE TABLE Account (
    UserID serial8 PRIMARY KEY,
    UserName varchar NOT NULL,
    UserEmail email NOT NULL,
    PassHash varchar NOT NULL
);

CREATE TABLE StdUser (
    UserID int8 PRIMARY KEY REFERENCES Account ON DELETE CASCADE,
    DoB date NOT NULL,
    CreationDate timestamp DEFAULT CURRENT_TIMESTAMP,
    DeletionDate timestamp
);

CREATE TABLE Address (
    AddressID serial8 PRIMARY KEY,
    Country varchar NOT NULL,
    PostCode varchar NOT NULL,
    UserID int8 NOT NULL REFERENCES StdUser ON DELETE CASCADE
);

CREATE TABLE Category (
    CategoryID serial8 PRIMARY KEY,
    CategoryName varchar NOT NULL,
    Icon bytea NOT NULL,
    Colour char(8) NOT NULL, -- HEX code RGBA
    Prompt varchar NOT NULL,
    ParentCategory int8 REFERENCES Category ON DELETE SET NULL
);

CREATE TABLE Listing (
    ListingID serial8 PRIMARY KEY,
    ContributorID int8 NOT NULL REFERENCES StdUser ON DELETE CASCADE,
    Title varchar NOT NULL,
    Description varchar NOT NULL,
    Condition itemCondition NOT NULL,
    AddressID int8 REFERENCES Address ON DELETE SET NULL,
    CategoryID int8 REFERENCES Category ON DELETE SET NULL,
    CreationDate timestamp DEFAULT CURRENT_TIMESTAMP,
    ModificationDate timestamp DEFAULT CURRENT_TIMESTAMP,
    ClosedDate timestamp
);

CREATE TABLE Conversation (
    ConversationID serial8 PRIMARY KEY,
    ReceiverID int8 NOT NULL REFERENCES StdUser ON DELETE CASCADE,
    ListingID int8 NOT NULL REFERENCES Listing ON DELETE CASCADE,
    CreationDate timestamp DEFAULT CURRENT_TIMESTAMP,
    ClosedDate timestamp
);

CREATE TABLE Message (
    MessageID serial8 PRIMARY KEY,
    SenderID int8 NOT NULL REFERENCES StdUser ON DELETE CASCADE,
    ConversationID int8 NOT NULL REFERENCES Conversation ON DELETE CASCADE,
    SentTime timestamp DEFAULT CURRENT_TIMESTAMP,
    ReadTime timestamp,
    ContentText varchar
);

CREATE TABLE PushToken (
    DeviceToken varchar PRIMARY KEY, -- Nobody can agree on what an FCM token actually looks like. Reported lengths have ranged from 119 chars to 326 chars.
    Time timestamp DEFAULT CURRENT_TIMESTAMP,
    UserID int8 NOT NULL REFERENCES StdUser ON DELETE CASCADE
);

CREATE TABLE Media (
    MediaID serial8 PRIMARY KEY,
    MimeType mimetype NOT NULL,
    URL varchar NOT NULL,
    Index int2 NOT NULL DEFAULT 0
);

CREATE TABLE ProfilePicture (
    MediaID int8 PRIMARY KEY REFERENCES Media ON DELETE CASCADE,
    UserID int8 NOT NULL REFERENCES StdUser ON DELETE CASCADE
);

CREATE TABLE ListingMedia (
    MediaID int8 PRIMARY KEY REFERENCES Media ON DELETE CASCADE,
    ListingID int8 NOT NULL REFERENCES Listing ON DELETE CASCADE
);

CREATE TABLE MessageMedia (
    MediaID int8 PRIMARY KEY REFERENCES Media ON DELETE CASCADE,
    MessageID int8 NOT NULL REFERENCES Message ON DELETE CASCADE
);

CREATE TABLE Administrator (
    UserID int8 PRIMARY KEY REFERENCES Account ON DELETE CASCADE
);

CREATE TABLE Report (
    ReportID serial8 PRIMARY KEY,
    ReporterID int8 NOT NULL REFERENCES StdUser ON DELETE CASCADE,
    Reason reportReason NOT NULL,
    Description varchar,
    Outcome varchar NOT NULL,
    Status reportStatus NOT NULL,
    CreationDate timestamp DEFAULT CURRENT_TIMESTAMP,
    AdminID int8 REFERENCES Administrator ON DELETE SET NULL
);

CREATE TABLE ProfileReport (
    ReportID int8 PRIMARY KEY REFERENCES Report ON DELETE CASCADE,
    UserID int8 REFERENCES StdUser ON DELETE SET NULL
);

CREATE TABLE ListingReport (
    ReportID int8 PRIMARY KEY REFERENCES Report ON DELETE CASCADE,
    ListingID int8 REFERENCES Listing ON DELETE SET NULL
);

CREATE TABLE MessageReport (
    ReportID int8 PRIMARY KEY REFERENCES Report ON DELETE CASCADE,
    MessageID int8 REFERENCES Message ON DELETE SET NULL 
);

CREATE TABLE Request (
    ReportID int8 PRIMARY KEY REFERENCES Report ON DELETE CASCADE
);

CREATE TABLE Sanction (
    SanctionID serial8 PRIMARY KEY,
    UserID int8 NOT NULL REFERENCES StdUser ON DELETE CASCADE,
    Type varchar NOT NULL,
    StartDate timestamp DEFAULT CURRENT_TIMESTAMP,
    EndDate timestamp,
    Reason varchar,
    ReportID int8 REFERENCES Report ON DELETE SET NULL,
    AdminID int8 REFERENCES Administrator ON DELETE SET NULL
);

CREATE TABLE AdminChange (
    ChangeID serial8 PRIMARY KEY,
    Reason varchar NOT NULL,
    Date timestamp DEFAULT CURRENT_TIMESTAMP,
    AdminID int8 REFERENCES Administrator ON DELETE SET NULL
);

CREATE TABLE ProfileChange (
    ChangeID int8 PRIMARY KEY REFERENCES AdminChange ON DELETE CASCADE,
    UserID int8 NOT NULL REFERENCES StdUser ON DELETE CASCADE
);

CREATE TABLE ListingChange (
    ChangeID int8 PRIMARY KEY REFERENCES AdminChange ON DELETE CASCADE,
    ListingID int8 NOT NULL REFERENCES Listing ON DELETE CASCADE
);
