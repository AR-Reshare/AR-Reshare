SET ROLE :account;
\c :account;

TRUNCATE Account CASCADE;

INSERT INTO Account (FullName, Email, PassHash, DoB) VALUES ('Testy McTestface', 'testy@testingtons.net', '$2a$12$MPsn85DE0KHUy2SGAXQtr.qdm9BxIyYXYY7aW/NUq8QHvMKFeHUsK', '1990-01-01');
INSERT INTO Account (FullName, Email, PassHash, DoB) VALUES ('Kevin McTestface', 'k.testface@gmail.com', '$2a$12$7kxl/K6Phzc3974bI1pR6.psHmGGtjlkvUTh7QSmNpT2gBC.X7NHy', '1986-03-12');
INSERT INTO Account (FullName, Email, PassHash, DoB) VALUES ('Ronnie Omelettes', 'ronnieo@yahoo.com', '$2a$12$DYJ0yc1OWkCVAT97hmq/nOr0v1NId/8pwyeXpK.QcLExIE8E1ouEu', '2001-01-01');
INSERT INTO Account (FullName, Email, PassHash, DoB, DeletionDate) VALUES ('Gary Cheeseman', 'gary.cheeseman@aol.com', '$2a$12$aUvSc3lJ7cAZzQJD6ZMwAuXaDiUG7qffXxshlVGf2Q460uP9jVBva', '2000-06-13', CURRENT_TIMESTAMP);
INSERT INTO Account (FullName, Email, PassHash, DoB) VALUES ('Delete Me', 'killme@gmail.com', '$2a$12$5avLoaWvXbRk5k1/yK8kheCMEj9XAwGaiTZAR5r0/gDwd5FnWCVFa', '1990-03-03');
INSERT INTO Account (FullName, Email, PassHash, DoB) VALUES ('Delete Me', 'killme2@gmail.com', '$2a$12$5avLoaWvXbRk5k1/yK8kheCMEj9XAwGaiTZAR5r0/gDwd5FnWCVFa', '1990-03-03');
INSERT INTO Account (FullName, Email, PassHash, DoB) VALUES ('Delete Me', 'killme3@gmail.com', '$2a$12$5avLoaWvXbRk5k1/yK8kheCMEj9XAwGaiTZAR5r0/gDwd5FnWCVFa', '1990-03-03');
INSERT INTO Account (FullName, Email, PassHash, DoB) VALUES ('Delete Me', 'killme4@gmail.com', '$2a$12$5avLoaWvXbRk5k1/yK8kheCMEj9XAwGaiTZAR5r0/gDwd5FnWCVFa', '1990-03-03');
INSERT INTO Account (FullName, Email, PassHash, DoB) VALUES ('Delete Me', 'killme5@gmail.com', '$2a$12$5avLoaWvXbRk5k1/yK8kheCMEj9XAwGaiTZAR5r0/gDwd5FnWCVFa', '1990-03-03');

INSERT INTO Address (Country, Region, Postcode, UserID) VALUES ('UK', 'Durham', 'AB1 2CD', 1);
INSERT INTO Address (Country, Region, PostCode, UserID) VALUES ('US', 'Abcdef, GH', 'asdfgh', 2);
INSERT INTO Address (Country, Region, PostCode, UserID) VALUES ('UK', 'Bristol', 'BR15 7OL', 1);

INSERT INTO Category (CategoryName, Colour, Prompt) VALUES ('Misc', 'FFFFFFFF', 'Remember to do the things');
INSERT INTO Category (CategoryName, Colour, Prompt) VALUES ('Searchtest', 'AAAAAAAA', 'This category is just for testing the category filter on /listings/search');

INSERT INTO Listing (ContributorID, Title, Description, Condition, AddressID, CategoryID, ClosedDate, ReceiverID) VALUES (1, 'Things', 'Some stuff', 'good', 1, 1, CURRENT_TIMESTAMP, 3);
INSERT INTO Listing (ContributorID, Title, Description, Condition, AddressID, CategoryID) VALUES (2, 'Stuff', 'Some things', 'poor', 2, 1);
INSERT INTO Listing (ContributorID, Title, Description, Condition, AddressID, CategoryID, ClosedDate, ReceiverID) VALUES (2, 'Egg box three hundred and sixty', 'For playing of the viddy games', 'like new', 2, 1, CURRENT_TIMESTAMP, 1);
INSERT INTO Listing (ContributorID, Title, Description, Condition, AddressID, CategoryID, ClosedDate, ReceiverID) VALUES (2, 'PS Five', 'Part of my collection of numbered postscripts', 'new', 2, 1, CURRENT_TIMESTAMP, 3);
INSERT INTO Listing (ContributorID, Title, Description, Condition, AddressID, CategoryID) VALUES (1, 'Potion of Healing', 'Restores 2d4+2 hit points', 'good', 1, 1);
INSERT INTO Listing (ContributorID, Title, Description, Condition, AddressID, CategoryID) VALUES (1, 'Cup', 'For drinking', 'poor', 1, 2);
INSERT INTO Listing (ContributorID, Title, Description, Condition, AddressID, CategoryID) VALUES (1, 'Mug', 'For drinking', 'poor', 3, 2);
INSERT INTO Listing (ContributorID, Title, Description, Condition, AddressID, CategoryID) VALUES (1, 'Glass', 'For drinking', 'poor', 3, 2);
INSERT INTO Listing (ContributorID, Title, Description, Condition, AddressID, CategoryID) VALUES (1, 'Potion of Asbestos', 'Restores 2d4+2 mesothelioma', 'poor', 3, 1);
INSERT INTO Listing (ContributorID, Title, Description, Condition, AddressID, CategoryID) VALUES (1, '4-sided die', 'Black and red swirly pattern', 'like new', 1, 1);
INSERT INTO Listing (ContributorID, Title, Description, Condition, AddressID, CategoryID) VALUES (1, '6-sided die', 'Black and red swirly pattern', 'like new', 1, 1);
INSERT INTO Listing (ContributorID, Title, Description, Condition, AddressID, CategoryID) VALUES (2, '8-sided die', 'Black and red swirly pattern', 'like new', 2, 1);
INSERT INTO Listing (ContributorID, Title, Description, Condition, AddressID, CategoryID, ClosedDate) VALUES (1, '10-sided die', 'Black and red swirly pattern', 'like new', 1, 1, CURRENT_TIMESTAMP);
INSERT INTO Listing (ContributorID, Title, Description, Condition, AddressID, CategoryID) VALUES (1, '12-sided die', 'Black and red swirly pattern', 'like new', 1, 1);
INSERT INTO Listing (ContributorID, Title, Description, Condition, AddressID, CategoryID) VALUES (1, '20-sided die', 'Black and red swirly pattern', 'like new', 1, 1);
INSERT INTO Listing (ContributorID, Title, Description, Condition, AddressID, CategoryID) VALUES (1, '60-sided die', 'Black and red swirly pattern', 'like new', 1, 1);
INSERT INTO Listing (ContributorID, Title, Description, Condition, AddressID, CategoryID) VALUES (1, '100-sided die', 'Black and red swirly pattern', 'like new', 1, 1);
INSERT INTO Listing (ContributorID, Title, Description, Condition, AddressID, CategoryID) VALUES (2, 'Thing 1', 'From cat in the hat', 'like new', 2, 1);
INSERT INTO Listing (ContributorID, Title, Description, Condition, AddressID, CategoryID) VALUES (2, 'Thing 2', 'From cat in the hat', 'like new', 2, 1);
INSERT INTO Listing (ContributorID, Title, Description, Condition, AddressID, CategoryID) VALUES (2, 'Thing 1', 'From cat in the hat', 'like new', 2, 1);
INSERT INTO Listing (ContributorID, Title, Description, Condition, AddressID, CategoryID) VALUES (2, 'Thing 1', 'From cat in the hat', 'like new', 2, 1);
INSERT INTO Listing (ContributorID, Title, Description, Condition, AddressID, CategoryID) VALUES (2, 'Thing 1', 'From cat in the hat', 'like new', 2, 1);
INSERT INTO Listing (ContributorID, Title, Description, Condition, AddressID, CategoryID) VALUES (1, 'Thing 1', 'From cat in the hat', 'like new', 1, 1);
INSERT INTO Listing (ContributorID, Title, Description, Condition, AddressID, CategoryID) VALUES (2, 'Stuff', 'For testing the conversations', 'good', 2, 1);
INSERT INTO Listing (ContributorID, Title, Description, Condition, AddressID, CategoryID) VALUES (2, 'Widgets', 'For testing the conversations', 'good', 2, 1);
INSERT INTO Listing (ContributorID, Title, Description, Condition, AddressID, CategoryID) VALUES (1, 'Things', 'For testing the conversations', 'good', 1, 1);

INSERT INTO Conversation (ReceiverID, ListingID) VALUES (1, 12);
INSERT INTO Conversation (ReceiverID, ListingID, ClosedDate) VALUES (1, 24, CURRENT_TIMESTAMP);
INSERT INTO Conversation (ReceiverID, ListingID) VALUES (3, 2);
INSERT INTO Conversation (ReceiverID, ListingID) VALUES (2, 5);
INSERT INTO Conversation (ReceiverID, ListingID) VALUES (1, 18);
INSERT INTO Conversation (ReceiverID, ListingID) VALUES (1, 19);
INSERT INTO Conversation (ReceiverID, ListingID, ClosedDate) VALUES (1, 20, CURRENT_TIMESTAMP);
INSERT INTO Conversation (ReceiverID, ListingID) VALUES (3, 21);
INSERT INTO Conversation (ReceiverID, ListingID) VALUES (1, 22);
INSERT INTO Conversation (ReceiverID, ListingID) VALUES (2, 23);
INSERT INTO Conversation (ReceiverID, ListingID) VALUES (1, 25);
INSERT INTO Conversation (ReceiverID, ListingID) VALUES (2, 26);

INSERT INTO Message (SenderID, ConversationID, ContentText) VALUES (1, 2, 'Hello');
INSERT INTO Message (SenderID, ConversationID, ContentText) VALUES (2, 2, 'Hi');
INSERT INTO Message (SenderID, ConversationID, ContentText) VALUES (1, 2, 'How are you doing');

INSERT INTO Message (SenderID, ConversationID, ContentText) VALUES (1, 11, 'Give me your stuff');
INSERT INTO Message (SenderID, ConversationID, ContentText) VALUES (2, 11, 'Get out of my house');
INSERT INTO Message (SenderID, ConversationID, ContentText) VALUES (1, 11, 'No');

INSERT INTO Message (SenderID, ConversationID, ContentText) VALUES (1, 12, 'Greetings earthling');
INSERT INTO Message (SenderID, ConversationID, ContentText) VALUES (2, 12, 'No thank you');
INSERT INTO Message (SenderID, ConversationID, ContentText) VALUES (1, 12, 'Understandable, have a nice day');
