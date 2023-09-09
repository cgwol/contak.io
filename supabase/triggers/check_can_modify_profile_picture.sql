--Before INSERT, UPDATE, DELETE on storage.objects WHEN bucket_id = 'album_covers'
CREATE OR REPLACE FUNCTION contak.check_can_modify_profile_picture() 
RETURNS TRIGGER LANGUAGE plpgsql AS $$ 
DECLARE modified record = (CASE TG_OP WHEN 'DELETE' THEN OLD ELSE NEW END);
DECLARE new_user_id uuid = SUBSTRING(modified.name, '([^/]+)/')::uuid;
BEGIN
	IF auth.uid() IS DISTINCT FROM new_user_id --OR NOT EXISTS (SELECT 1 FROM contak.users WHERE user_id = new_user_id AND deleted_at > NOW())
    THEN 
		RAISE EXCEPTION 'Access denied: Cannot modify another users profile picture. %s, auth.uid() = %s', new_user_id, auth.uid();
	END IF;
	RETURN modified;
END;
$$;

CREATE OR REPLACE TRIGGER check_can_upsert_profile_picture_tr BEFORE INSERT OR UPDATE ON storage.objects
FOR EACH ROW WHEN (NEW.bucket_id = 'profile_pictures') EXECUTE FUNCTION contak.check_can_modify_profile_picture();

CREATE OR REPLACE TRIGGER check_can_delete_profile_picture_tr BEFORE DELETE ON storage.objects
FOR EACH ROW WHEN (OLD.bucket_id = 'profile_pictures') EXECUTE FUNCTION contak.check_can_modify_profile_picture();

DROP TRIGGER check_can_upsert_profile_picture_tr ON storage.objects;
DROP TRIGGER check_can_delete_profile_picture_tr ON storage.objects;