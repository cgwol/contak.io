DROP FUNCTION IF EXISTS contak.create_rule_soft_delete_row (text, text, text);
CREATE OR REPLACE FUNCTION contak.create_rule_soft_delete_row (i_schema_name text, i_table_name text, deleted_at_column_name text DEFAULT 'deleted_at')
RETURNS void
LANGUAGE 'plpgsql'
--RETURNS NULL ON NULL INPUT 
AS $$
DECLARE c text;
BEGIN
  FOR c IN SELECT command FROM contak.get_create_rule_soft_delete_row_commands (i_schema_name, i_table_name, deleted_at_column_name) AS results(command)
  LOOP
    EXECUTE c;
  END LOOP;
END; $$;

DROP FUNCTION IF EXISTS contak.drop_rule_soft_delete_row (text, text);
CREATE OR REPLACE FUNCTION contak.drop_rule_soft_delete_row (i_schema_name text, i_table_name text)
RETURNS void
LANGUAGE 'plpgsql'
--RETURNS NULL ON NULL INPUT 
AS $$ 
DECLARE rule_name text;
BEGIN 
  FOR rule_name IN VALUES ('soft_delete_row'), ('soft_delete_update_cascade') LOOP
    EXECUTE FORMAT('DROP RULE IF EXISTS %I ON %I.%I', rule_name, i_schema_name, i_table_name);
  END LOOP;
END; $$;