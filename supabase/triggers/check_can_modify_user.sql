
--Before INSERT, UPDATE, DELETE on contak.users
CREATE OR REPLACE FUNCTION contak.check_can_modify_user() 
RETURNS TRIGGER LANGUAGE plpgsql AS $$ 
DECLARE modified record = (CASE TG_OP WHEN 'DELETE' THEN OLD ELSE NEW END);
BEGIN
	IF modified.user_id IS DISTINCT FROM auth.uid() THEN 
		RAISE EXCEPTION 'Permission denied: You can only modify your own profile';
	END IF;
	RETURN modified;
END;
$$;

DROP TRIGGER IF EXISTS check_can_modify_user ON contak.users;
CREATE OR REPLACE TRIGGER check_can_modify_user BEFORE INSERT OR UPDATE OR DELETE ON contak.users
FOR EACH ROW EXECUTE FUNCTION contak.check_can_modify_user();
