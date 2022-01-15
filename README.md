# AR Reshare

Project created for IBM as part of Durham University's Computer Science course.

This repository contains only the backend system. API documentation can be found in `docs/oas.yaml`

## Database

To set up the postgres database (on Linux):

`sudo apt install postgresql postgresql-contrib`

`sudo -u postgres make`

To remove the database (e.g. after a fault install):

`sudo -u postgres make clean`

WARNING: I don't know how to undo that so do NOT run it on the production server unless you are 100% sure about it.
