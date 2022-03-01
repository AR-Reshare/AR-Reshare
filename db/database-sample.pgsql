SET ROLE :account;
\c :account;

TRUNCATE Account CASCADE;

INSERT INTO Account (FullName, Email, PassHash, DoB) VALUES ('Testy McTestface', 'testy@testingtons.net', '$2a$12$MPsn85DE0KHUy2SGAXQtr.qdm9BxIyYXYY7aW/NUq8QHvMKFeHUsK', '1990-01-01');
INSERT INTO Account (FullName, Email, PassHash, DoB) VALUES ('Kevin McTestface', 'k.testface@gmail.com', '$2a$12$7kxl/K6Phzc3974bI1pR6.psHmGGtjlkvUTh7QSmNpT2gBC.X7NHy', '1986-03-12');
INSERT INTO Account (FullName, Email, PassHash, DoB) VALUES ('Ronnie Omelettes', 'ronnieo@yahoo.com', '$2a$12$DYJ0yc1OWkCVAT97hmq/nOr0v1NId/8pwyeXpK.QcLExIE8E1ouEu', '2001-01-01');
INSERT INTO Account (FullName, Email, PassHash, DoB) VALUES ('Gary Cheeseman', 'gary.cheeseman@aol.com', '$2a$12$DseGQXw6F9IBzcKJeZp7/uhZdBdTg1zDc4/BL1K8Ib8f/ydkJz/YW', '2000-06-13');
