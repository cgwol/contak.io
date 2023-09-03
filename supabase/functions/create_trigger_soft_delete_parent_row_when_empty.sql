DROP FUNCTION IF EXISTS contak.create_trigger_soft_delete_parent_row_when_empty_v2 (text, text, text, text);
CREATE OR REPLACE FUNCTION contak.create_trigger_soft_delete_parent_row_when_empty_v2 (i_schema_name text, i_table_name text, i_column_name text, deleted_at_name text DEFAULT 'deleted_at')
RETURNS void
LANGUAGE 'plpgsql'
--RETURNS NULL ON NULL INPUT 
AS $$ 
BEGIN
  -- EXECUTE FORMAT(
  --   'CREATE OR REPLACE TRIGGER %I BEFORE DELETE ON %I.%I '
  --   'FOR EACH ROW WHEN (coalesce(current_setting(''contak.hard_delete'', true), ''off'') != ''on'') '
  --   'EXECUTE FUNCTION contak.soft_delete_rows_trigger_v2()',
  --   i_table_name || '_soft_delete_rows_tr', i_schema_name, i_table_name);

  EXECUTE FORMAT('CREATE OR REPLACE RULE soft_delete_row AS ON DELETE TO %I.%I '
    'WHERE coalesce(current_setting(''contak.hard_deletion'', TRUE), ''off'') != ''on'' DO INSTEAD '
    'UPDATE %I.%I SET %I = NOW() WHERE %s AND %I > NOW()',
    i_schema_name, i_table_name, i_schema_name, i_table_name, deleted_at_name, (
      SELECT STRING_AGG(FORMAT('%I = OLD.%I', pks.column_name, pks.column_name), ' AND ') 
      FROM contak.primary_keys pks WHERE pks.schema_name = i_schema_name AND pks.table_name = i_table_name
    ), deleted_at_name);

  EXECUTE FORMAT('CREATE OR REPLACE TRIGGER %I AFTER UPDATE OF %I '
    'ON %I.%I FOR EACH ROW EXECUTE FUNCTION contak.soft_delete_parent_row_when_empty_trigger_v2(%L, %L)',
    i_column_name || '_soft_delete_parent_row_when_empty_tr', deleted_at_name, i_schema_name, i_table_name, i_column_name, deleted_at_name);
END $$;

DROP FUNCTION IF EXISTS contak.drop_trigger_soft_delete_parent_row_when_empty_v2 (text, text, column_name text);
CREATE OR REPLACE FUNCTION contak.drop_trigger_soft_delete_parent_row_when_empty_v2 (schema_name text, table_name text, column_name text)
RETURNS void
LANGUAGE 'plpgsql'
--RETURNS NULL ON NULL INPUT 
AS $$ 
BEGIN
  EXECUTE FORMAT('DROP TRIGGER IF EXISTS %I ON %I.%I',
    table_name || '_soft_delete_rows_tr', schema_name, table_name);

  EXECUTE FORMAT('DROP TRIGGER IF EXISTS %I ON %I.%I',
    column_name || '_soft_delete_parent_row_when_empty_tr', schema_name, table_name);
END $$;
