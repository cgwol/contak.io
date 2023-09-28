
--Before INSERT, UPDATE, DELETE on contak.album_purchases
CREATE OR REPLACE FUNCTION contak.check_can_modify_album_purchases() 
RETURNS TRIGGER LANGUAGE plpgsql AS $$ 
DECLARE modified record = (CASE TG_OP WHEN 'DELETE' THEN OLD ELSE NEW END);
BEGIN
	IF modified.user_id IS DISTINCT FROM auth.uid() THEN 
		RAISE EXCEPTION 'Permission denied: You can only purchase albums for yourself';
	END IF;
	RETURN modified;
END;
$$;

DROP TRIGGER IF EXISTS check_can_modify_album_purchases ON contak.album_purchases;
CREATE OR REPLACE TRIGGER check_can_modify_album_purchases BEFORE INSERT OR UPDATE OR DELETE ON contak.album_purchases
FOR EACH ROW EXECUTE FUNCTION contak.check_can_modify_album_purchases();
