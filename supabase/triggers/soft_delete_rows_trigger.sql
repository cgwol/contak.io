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
