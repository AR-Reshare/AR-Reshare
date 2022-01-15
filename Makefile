all:
	psql -a -f db/database-init.pgsql

clean:
	psql -a -f db/database-clean.pgsql