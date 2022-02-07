# AR Reshare

Project created for IBM as part of Durham University's Computer Science course.

This repository contains only the backend system. API documentation can be found in `docs/oas.yaml`

## Database

To set up the postgres database (on Linux):

Install postgres: `sudo apt install postgresql postgresql-contrib`

Start the postgres server: `sudo service postgresql start`

Setting up the database is automated with `npm run setup`, which also executes on `postinstall`. Note that the scripts only work on Linux thus far. Testing for Mac and Windows will follow.
