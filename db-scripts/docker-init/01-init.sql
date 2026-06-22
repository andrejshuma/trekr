-- Combined init: schema (DDL) then seed data (DML)
-- Postgres runs all *.sql files in /docker-entrypoint-initdb.d on first start.

\i /docker-entrypoint-initdb.d/ddl.sql
\i /docker-entrypoint-initdb.d/dml.sql
