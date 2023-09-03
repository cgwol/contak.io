
DROP FUNCTION IF EXISTS contak.exec_using(text, record, record); --CASCADE;
CREATE OR REPLACE FUNCTION contak.exec_using(text, record, record DEFAULT NULL)
RETURNS SETOF RECORD
LANGUAGE 'plpgsql' 
AS $$
BEGIN 
    RETURN QUERY EXECUTE $1 USING $2, $3; 
END $$;
