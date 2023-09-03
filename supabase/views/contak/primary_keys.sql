CREATE OR REPLACE VIEW contak.primary_keys AS
SELECT
  pn.nspname AS schema_name,
  pt.relname AS table_name,
  pc.attname AS column_name,
  c.conname AS constraint_name
FROM pg_constraint c
 LEFT JOIN pg_namespace pn ON pn.oid = c.connamespace
 LEFT JOIN pg_class pt ON pt.oid = c.conrelid
 LEFT JOIN pg_attribute pc ON pc.attrelid = pt.oid AND pc.attnum = ANY(c.conkey)
WHERE c.contype = 'p'; -- Primary Key

GRANT SELECT ON contak.primary_keys TO authenticated;