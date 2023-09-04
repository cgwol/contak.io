CREATE OR REPLACE FUNCTION contak.get_create_rule_soft_delete_row_commands (i_schema_name text, i_table_name text, deleted_at_column_name text DEFAULT 'deleted_at')
RETURNS TABLE (command text)
LANGUAGE 'plpgsql'
--RETURNS NULL ON NULL INPUT 
AS $$ 
DECLARE full_table_name text = quote_ident(i_schema_name) || '.' || quote_ident(i_table_name);
BEGIN
  RETURN QUERY (SELECT results.command FROM (VALUES (FORMAT(
    'CREATE OR REPLACE RULE soft_delete_update_cascade AS ON UPDATE TO %s WHERE '
    '(OLD.%I != NEW.%I) DO ALSO (%s)',
      full_table_name, deleted_at_column_name, deleted_at_column_name, FORMAT($format$
        WITH ref AS (
          SELECT * FROM contak.foreign_key_relations WHERE pk_schema = %L AND pk_table = %L
        ), fks AS (
          SELECT DISTINCT ref.fk_schema, ref.fk_table FROM ref
        )
        SELECT contak.exec_using_void(
            FORMAT('UPDATE %%I.%%I SET %%I = $2.%I WHERE %%s AND %%I IS DISTINCT FROM $2.%I', 
            fks.fk_schema, fks.fk_table, fk_deleted_at.column_name, filter, fk_deleted_at.column_name)
          , OLD, NEW)
        FROM fks
          JOIN LATERAL (SELECT 
              STRING_AGG(FORMAT('%%I = $1.%%I', inner_ref.fk_column, inner_ref.pk_column), ' AND ') AS filter
            FROM ref AS inner_ref
            WHERE fks.fk_schema = inner_ref.fk_schema AND fks.fk_table = inner_ref.fk_table) AS filter ON true
          JOIN LATERAL (SELECT fk_deleted_at.column_name
            FROM contak.column_info AS fk_deleted_at
            WHERE fk_deleted_at.table_schema = fks.fk_schema AND fk_deleted_at.table_name = fks.fk_table 
              AND fk_deleted_at.data_type IN ('timestamp without time zone', 'timestamp with time zone',
                'time with time zone', 'time without time zone', 'date')
              AND (fk_deleted_at.column_name = %L OR fk_deleted_at.column_name LIKE '%%delete%%')
            ORDER BY CASE fk_deleted_at.column_name WHEN %L THEN '' ELSE fk_deleted_at.column_name END 
            ASC LIMIT 1) AS fk_deleted_at ON true
        $format$, i_schema_name, i_table_name, deleted_at_column_name, deleted_at_column_name, deleted_at_column_name, deleted_at_column_name
  ))), 
  (FORMAT('CREATE OR REPLACE RULE soft_delete_row AS ON DELETE TO %s '
    'WHERE coalesce(current_setting(''contak.hard_deletion'', TRUE), ''off'') != ''on'' DO INSTEAD '
    'UPDATE %s SET %I = NOW() WHERE %s AND %I > NOW()',
    full_table_name, full_table_name, deleted_at_column_name, (
      SELECT STRING_AGG(FORMAT('%I = OLD.%I', column_name, column_name), ' AND ') 
      FROM contak.primary_keys WHERE schema_name = i_schema_name AND table_name = i_table_name
    ), deleted_at_column_name))
  ) AS results(command));
END; $$;

-- SELECT * FROM contak.users
-- SELECT contak.login_as_user('kanyewest');
-- DELETE FROM contak.users WHERE username = 'kanyewest' RETURNING *;
