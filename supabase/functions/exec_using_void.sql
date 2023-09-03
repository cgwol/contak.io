
DROP FUNCTION IF EXISTS contak.exec_using_void(text, record, record);
CREATE OR REPLACE FUNCTION contak.exec_using_void(text, record, record DEFAULT NULL)
RETURNS void
LANGUAGE 'plpgsql' 
AS $$
BEGIN 
    EXECUTE $1 USING $2, $3; 
END $$;

