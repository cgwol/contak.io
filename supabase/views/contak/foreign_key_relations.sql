CREATE OR REPLACE VIEW contak.foreign_key_relations (fk_schema, fk_table, fk_column, pk_schema, pk_table, pk_column, constraint_name)
AS SELECT
  n.nspname AS fk_schema,
  ft.relname AS fk_table,
  fc.attname AS fk_column,
  pn.nspname AS pk_schema,
  pt.relname AS pk_table,
  pc.attname AS pk_column,
  c.conname AS constraint_name
FROM pg_constraint c
 LEFT JOIN pg_namespace n ON n.oid = c.connamespace
 LEFT JOIN pg_class ft ON ft.oid = c.conrelid
 LEFT JOIN pg_attribute fc ON fc.attrelid = ft.oid AND fc.attnum = ANY(c.conkey)
 LEFT JOIN pg_class pt ON pt.oid = c.confrelid
 LEFT JOIN pg_namespace pn ON pn.oid = pt.relnamespace
 LEFT JOIN pg_attribute pc ON pc.attrelid = pt.oid AND pc.attnum = ANY(c.confkey)
WHERE c.contype = 'f'; -- Foreign Key

COMMENT ON VIEW contak.foreign_key_relations IS 'Gets all tables with FOREIGN KEY constraints along with the column it points to';
COMMENT ON COLUMN contak.foreign_key_relations.fk_column IS 'The column name with the FOREIGN KEY constraint in its definition';
COMMENT ON COLUMN contak.foreign_key_relations.pk_column IS 'The column name that `fk_column` references';