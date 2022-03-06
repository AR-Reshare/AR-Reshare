SET ROLE :account;
\c :account;

TRUNCATE Account CASCADE;

INSERT INTO Account (FullName, Email, PassHash, DoB) VALUES ('Testy McTestface', 'testy@testingtons.net', '$2a$12$MPsn85DE0KHUy2SGAXQtr.qdm9BxIyYXYY7aW/NUq8QHvMKFeHUsK', '1990-01-01');
INSERT INTO Account (FullName, Email, PassHash, DoB) VALUES ('Kevin McTestface', 'k.testface@gmail.com', '$2a$12$7kxl/K6Phzc3974bI1pR6.psHmGGtjlkvUTh7QSmNpT2gBC.X7NHy', '1986-03-12');
INSERT INTO Account (FullName, Email, PassHash, DoB) VALUES ('Ronnie Omelettes', 'ronnieo@yahoo.com', '$2a$12$DYJ0yc1OWkCVAT97hmq/nOr0v1NId/8pwyeXpK.QcLExIE8E1ouEu', '2001-01-01');
INSERT INTO Account (FullName, Email, PassHash, DoB, DeletionDate) VALUES ('Gary Cheeseman', 'gary.cheeseman@aol.com', '$2a$12$aUvSc3lJ7cAZzQJD6ZMwAuXaDiUG7qffXxshlVGf2Q460uP9jVBva', '2000-06-13', CURRENT_TIMESTAMP);

INSERT INTO Address (Country, Postcode, UserID) VALUES ('UK', 'AB1 2CD', 1);
INSERT INTO Address (Country, PostCode, UserID) VALUES ('US', 'asdfgh', 2);

INSERT INTO Category (CategoryName, Colour, Prompt) VALUES ('Misc', 'FFFFFFFF', 'Remember to do the things');

INSERT INTO Listing (ContributorID, Title, Description, Condition, AddressID, CategoryID, ClosedDate, ReceiverID) VALUES (1, 'Things', 'Some stuff', 'good', 1, 1, CURRENT_TIMESTAMP, 3);
INSERT INTO Listing (ContributorID, Title, Description, Condition, AddressID, CategoryID) VALUES (2, 'Stuff', 'Some things', 'poor', 2, 1);
INSERT INTO Listing (ContributorID, Title, Description, Condition, AddressID, CategoryID, ClosedDate, ReceiverID) VALUES (2, 'Egg box three hundred and sixty', 'For playing of the viddy games', 'like new', 2, 1, CURRENT_TIMESTAMP, 1);
INSERT INTO Listing (ContributorID, Title, Description, Condition, AddressID, CategoryID, ClosedDate, ReceiverID) VALUES (2, 'PS Five', 'Part of my collection of numbered postscripts', 'new', 2, 1, CURRENT_TIMESTAMP, 3);
