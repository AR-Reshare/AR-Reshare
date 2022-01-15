-- Execute from linux via the makefile with: sudo -u postgres make

CREATE USER devserver WITH ENCRYPTED PASSWORD 'SVh}Q,A>3.nL9vp~';
CREATE DATABASE devserver WITH OWNER devserver;
