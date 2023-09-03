DROP FUNCTION IF EXISTS contak.error(text, VARCHAR(5), text);
CREATE OR REPLACE FUNCTION contak.error(text, error_code VARCHAR(5) DEFAULT 'ERROR', text DEFAULT '')
RETURNS void
IMMUTABLE
LANGUAGE 'plpgsql' 
AS $$
BEGIN 
    RAISE EXCEPTION USING message = $1, errcode = error_code, hint = $3;
END $$;
