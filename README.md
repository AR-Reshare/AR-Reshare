# AR Reshare

Project created for IBM as part of Durham University's Computer Science course.

This repository contains only the backend system. API documentation can be found in `docs/oas.yaml`

## Database

To set up the postgres database (on Linux):

Install postgres: `sudo apt install postgresql postgresql-contrib`

Start the postgres server: `sudo service postgresql start`

Initialise the database: `sudo -u postgres npm run db-dev`

Remove the database (e.g. after a faulty install): `sudo -u postgres npm run db-clear-dev`

Replace `dev` with `test` in the above commands to install a test database instead. You can have both installed at once.

This is automated with `npm run setup`, which also executes on `postinstall`. The test database is created and dropped automatically when `npm test` is used. Note that the scripts only work on Linux thus far. Testing for Mac and Windows will follow.
