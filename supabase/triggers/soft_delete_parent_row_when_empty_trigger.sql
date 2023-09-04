--After Update
CREATE OR REPLACE FUNCTION contak.soft_delete_parent_row_when_empty_trigger_v2 ()
RETURNS TRIGGER
LANGUAGE 'plpgsql'
AS $$ 
-- Column name should point to a foreign key column on TG_TABLE_NAME (the table this trigger is running on)
DECLARE fk_column_name text = (CASE WHEN TG_NARGS < 1 OR contak.is_null_or_empty(TG_ARGV[0]) IS TRUE THEN 'id' ELSE TG_ARGV[0] END);
DECLARE deleted_at_column_name text = (CASE WHEN TG_NARGS < 2 OR contak.is_null_or_empty(TG_ARGV[1]) IS TRUE THEN 'deleted_at' ELSE TG_ARGV[1] END);
DECLARE is_found boolean = FALSE;
DECLARE fk record;
BEGIN
  EXECUTE FORMAT('SELECT TRUE FROM %I.%I WHERE %I > NOW() AND %I = $1.%I LIMIT 1',
    TG_TABLE_SCHEMA, TG_TABLE_NAME, deleted_at_column_name, fk_column_name, fk_column_name)
    USING OLD INTO is_found;
  IF is_found IS NOT TRUE THEN -- when no valid rows, delete parent row
    FOR fk IN SELECT * FROM contak.foreign_key_relations WHERE fk_schema = TG_TABLE_SCHEMA AND fk_table = TG_TABLE_NAME AND fk_column = fk_column_name
    LOOP
      -- IF TG_TABLE_NAME NOT IN ('users') THEN --debug block expect error here
      --   EXECUTE FORMAT('UPDATE contak.%I SET "DELETE PARENT OLD: %s Column: %s" = 1', TG_TABLE_NAME, OLD.deleted_at, fk_column_name);
      -- END IF;
      EXECUTE FORMAT(--'DELETE FROM %I.%I WHERE %I = $1.%I',
      'UPDATE %I.%I SET deleted_at = $2.%I WHERE %I = $1.%I AND deleted_at IS DISTINCT FROM $2.%I',
        fk.pk_schema, fk.pk_table, deleted_at_column_name, fk.pk_column, fk_column_name, deleted_at_column_name) USING OLD, NEW;
    END LOOP;
  END IF;
  RETURN OLD;
END; $$;