SET ROLE :account;
\c :account;

TRUNCATE Account, StdUser, Administrator CASCADE;

INSERT INTO Account (UserName, UserEmail, PassHash) VALUES ('Testy McTestface', 'testy@testingtons.net', '$2a$12$MPsn85DE0KHUy2SGAXQtr.qdm9BxIyYXYY7aW/NUq8QHvMKFeHUsK');
INSERT INTO Account (UserName, UserEmail, PassHash) VALUES ('Kevin McTestface', 'k.testface@gmail.com', '$2a$12$7kxl/K6Phzc3974bI1pR6.psHmGGtjlkvUTh7QSmNpT2gBC.X7NHy');
INSERT INTO Account (UserName, UserEmail, PassHash) VALUES ('Ronnie Omelettes', 'ronnieo@yahoo.com', '$2a$12$DYJ0yc1OWkCVAT97hmq/nOr0v1NId/8pwyeXpK.QcLExIE8E1ouEu');
INSERT INTO Account (UserName, UserEmail, PassHash) VALUES ('Gary Cheeseman', 'gary.cheeseman@aol.com', '$2a$12$DseGQXw6F9IBzcKJeZp7/uhZdBdTg1zDc4/BL1K8Ib8f/ydkJz/YW');

INSERT INTO StdUser (UserID, DoB) VALUES (1, '1990-01-01');
INSERT INTO StdUser (UserID, DoB) VALUES (2, '1993-05-17');
INSERT INTO Administrator (UserID) VALUES (3);
INSERT INTO StdUser (UserID, DoB) VALUES (4, '2000-02-29');
