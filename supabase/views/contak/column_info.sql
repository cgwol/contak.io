CREATE OR REPLACE VIEW contak.column_info (table_schema, table_name, column_name, data_type, column_length)
AS SELECT pg_namespace.nspname AS table_schema, 
  pg_class.relname AS table_name, 
  pg_attribute.attname AS column_name, 
  format_type(pg_attribute.atttypid, pg_attribute.atttypmod) AS data_type,
  pg_attribute.attlen AS column_length
FROM pg_attribute
LEFT JOIN pg_class ON pg_attribute.attrelid = pg_class.oid
LEFT JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
WHERE pg_attribute.attnum >= 0;

GRANT SELECT ON contak.column_info TO authenticated;