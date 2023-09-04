

--Before INSERT, UPDATE, DELETE on storage.objects WHEN bucket_id = 'album_covers'
CREATE OR REPLACE FUNCTION contak.check_can_modify_album_cover() 
RETURNS TRIGGER LANGUAGE plpgsql AS $$ 
DECLARE modified record = (CASE TG_OP WHEN 'DELETE' THEN OLD ELSE NEW END);
DECLARE new_album_id bigint = SUBSTRING(modified.name, '([^/]+)/')::bigint;
BEGIN
	IF NOT EXISTS(SELECT 1 FROM dev.owned_albums WHERE owned_albums.album_id = new_album_id) THEN 
		RAISE EXCEPTION 'Only album owners can upload new album covers';
	END IF;
	RETURN modified;
END;
$$;


CREATE TRIGGER check_can_upsert_album_cover_tr BEFORE INSERT OR UPDATE ON storage.objects
FOR EACH ROW WHEN (NEW.bucket_id = 'album_covers') EXECUTE FUNCTION contak.check_can_modify_album_cover();

CREATE TRIGGER check_can_delete_album_cover_tr BEFORE DELETE ON storage.objects
FOR EACH ROW WHEN (OLD.bucket_id = 'album_covers') EXECUTE FUNCTION contak.check_can_modify_album_cover();
