DROP FUNCTION IF EXISTS contak.soft_delete_rows_trigger_v2 ();

--Before Delete
CREATE OR REPLACE FUNCTION contak.soft_delete_rows_trigger_v2 ()
RETURNS TRIGGER
LANGUAGE 'plpgsql'
AS $$ 
BEGIN
  -- IF TG_TABLE_NAME NOT IN ('users') THEN --debug block expect error here
  --   EXECUTE FORMAT('UPDATE contak.%I SET "DELETE OLD: %s NEW: %s" = 1', TG_TABLE_NAME, OLD.deleted_at, NEW.deleted_at);
  -- END IF;
  EXECUTE FORMAT('UPDATE %I.%I SET deleted_at = NOW() WHERE deleted_at > NOW() AND %s', 
      TG_TABLE_SCHEMA, TG_TABLE_NAME,
      (SELECT STRING_AGG(FORMAT('%I = $1.%I', column_name, column_name), ' AND ') 
      FROM contak.primary_keys WHERE schema_name = TG_TABLE_SCHEMA AND table_name = TG_TABLE_NAME))
    USING OLD;
  RETURN NULL; -- Prevents normal DELETE behavior
END; $$;

-- After Update
DROP FUNCTION IF EXISTS contak.get_soft_delete_referencing_rows_commands_v2(text,text,text,text);
CREATE OR REPLACE FUNCTION contak.get_soft_delete_referencing_rows_commands_v2 (i_table_schema text, i_table_name text, i_column_name text, i_deleted_at_name text)
RETURNS TABLE (command text)
LANGUAGE SQL
AS $$ 
    SELECT FORMAT(
      'UPDATE %I.%I SET deleted_at = $2.%I WHERE %I = $1.%I AND deleted_at IS DISTINCT FROM $2.%I', 
      --'DELETE FROM %I.%I WHERE %I = %L',
      fk_schema, fk_table, i_deleted_at_name, fk_column, i_column_name, i_deleted_at_name) AS command
    FROM contak.foreign_key_relations --get_referencing_rows(i_table_schema, i_table_name, i_column_name) AS referencing(fk_schema, fk_table, fk_column, pk_schema, pk_table, pk_column, constraint_name)
	WHERE pk_schema = i_table_schema AND pk_table = i_table_name AND pk_column = i_column_name
	
$$;

-- After Update
CREATE OR REPLACE FUNCTION contak.soft_delete_referencing_rows_trigger_v2 ()
RETURNS TRIGGER
LANGUAGE 'plpgsql'
AS $$ 
DECLARE i_column_name text = (CASE WHEN TG_NARGS < 1 OR contak.is_null_or_empty(TG_ARGV[0]) IS TRUE THEN 'id' ELSE TG_ARGV[0] END);
DECLARE i_deleted_at_name text = (CASE WHEN TG_NARGS < 2 OR contak.is_null_or_empty(TG_ARGV[1]) IS TRUE THEN 'deleted_at' ELSE TG_ARGV[1] END);
DECLARE c text;
-- DECLARE row_id text;
BEGIN
  -- EXECUTE 'SELECT $1.'||quote_ident(i_column_name)||'::text' USING OLD INTO row_id;
  -- EXECUTE FORMAT('UPDATE contak.users SET %I = 1', deleted_at_date);
  -- IF TG_TABLE_NAME NOT IN ('users') THEN --debug block expect error here
  --   EXECUTE FORMAT('UPDATE contak.%I SET "%s, %s OLD: %s NEW: %s" = 1', TG_TABLE_NAME, i_column_name, i_deleted_at_name, OLD.deleted_at, NEW.deleted_at);
  -- END IF;
  FOR c IN SELECT command FROM contak.get_soft_delete_referencing_rows_commands_v2(TG_TABLE_SCHEMA, TG_TABLE_NAME, i_column_name, i_deleted_at_name) 
  LOOP
    EXECUTE c USING OLD, NEW;
  END LOOP;
  RETURN OLD; --By convention, return OLD from AFTER triggers
END; $$;

-- SELECT contak.get_soft_delete_referencing_rows_commands_v2('contak', 'tracks', 'track_id', 'deleted_at')

DROP FUNCTION IF EXISTS contak.create_trigger_soft_delete_referencing_rows_v2 (text, text, text, text);
CREATE OR REPLACE FUNCTION contak.create_trigger_soft_delete_referencing_rows_v2 (schema_name text, table_name text, column_name text, deleted_at_name text DEFAULT 'deleted_at')
RETURNS void
LANGUAGE 'plpgsql'
AS $$ 
BEGIN
  EXECUTE FORMAT(
    'CREATE OR REPLACE TRIGGER %I BEFORE DELETE ON %I.%I '
    'FOR EACH ROW WHEN (coalesce(current_setting(''contak.hard_delete'', true), ''off'') != ''on'') '
    'EXECUTE FUNCTION contak.soft_delete_rows_trigger_v2()',
    table_name || '_soft_delete_rows_tr', schema_name, table_name);

  EXECUTE FORMAT(
    'CREATE OR REPLACE TRIGGER %I AFTER UPDATE OF %I '
    'ON %I.%I FOR EACH ROW EXECUTE FUNCTION contak.soft_delete_referencing_rows_trigger_v2(%L, %L)',
    table_name || '_soft_delete_referencing_rows_tr', deleted_at_name, 
    schema_name, table_name, column_name, deleted_at_name);
END $$;

DROP FUNCTION IF EXISTS contak.drop_trigger_soft_delete_referencing_rows_v2 (text, text, text);
CREATE OR REPLACE FUNCTION contak.drop_trigger_soft_delete_referencing_rows_v2 (schema_name text, table_name text, column_name text)
RETURNS void
LANGUAGE 'plpgsql'
AS $$ 
BEGIN
  EXECUTE FORMAT('DROP TRIGGER IF EXISTS %I ON %I.%I',
    table_name || '_soft_delete_rows_tr', schema_name, table_name);

  EXECUTE FORMAT('DROP TRIGGER IF EXISTS %I ON %I.%I',
    table_name || '_soft_delete_referencing_rows_tr', schema_name, table_name);
END $$;


-- SELECT command FROM contak.get_soft_delete_referencing_rows_commands('contak', 'albums', 'album_id', '''someone''s text''')
-- SELECT command FROM contak.get_soft_delete_referencing_rows_commands('contak', 'users', 'user_id', '''someone''s text''')