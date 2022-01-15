all:
	psql -f db/database-init.pgsql

clean:
	psql -f db/database-clean.pgsql