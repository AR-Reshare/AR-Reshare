# AR Reshare

Project created for IBM as part of Durham University's Computer Science course.

This repository contains only the backend system. API documentation can be found in `docs/oas.yaml`

## Database

To set up the postgres database (on Linux):

Install postgres: `sudo apt install postgresql postgresql-contrib`

Start the postgres server: `sudo service postgresql start`

Initialise the database: `sudo -u postgres npm run db-init`

Remove the database (e.g. after a faulty install): `sudo -u postgres npm run db-clear`

WARNING: I don't know how to undo that so do NOT run it on the production server unless you are 100% sure about it.
