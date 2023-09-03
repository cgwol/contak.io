--BEFORE UPDATE OR DELETE ON contak.albums, contak.album_creators
--BEFORE INSERT OR UPDATE OR DELETE ON contak.album_tracks
CREATE OR REPLACE FUNCTION contak.check_can_modify_album_trigger ()
RETURNS TRIGGER
LANGUAGE 'plpgsql'
AS $$ 
-- DECLARE error_message text = (CASE WHEN TG_NARGS <= 0 OR contak.is_null_or_empty(TG_ARGV[0]) IS TRUE THEN FORMAT('Only Creators can be %s''ed on %I.%I', LOWER(TG_OP), TG_TABLE_SCHEMA, TG_TABLE_NAME) ELSE TG_ARGV[0] END);
DECLARE modified record = (CASE TG_OP WHEN 'DELETE' THEN OLD ELSE NEW END);
BEGIN
  IF TG_OP = 'DELETE' AND current_user = 'authenticated' THEN 
    RAISE EXCEPTION 'Cannot permanently delete % as an authenticated user', REPLACE(TG_TABLE_NAME, '_', ' ');
  END IF;
  --check deleted at greater than OR EQUAL to NOW() so that album_creators can be deleted BEFORE deleting the album
  -- IF NOT EXISTS(SELECT * FROM contak.album_creators WHERE is_owner AND album_id = modified.album_id AND creator_id = auth.uid() AND deleted_at >= NOW()) OR (TG_OP = 'DELETE' AND current_user != 'postgres')
  IF EXISTS(SELECT creator_id FROM contak.album_creators WHERE is_owner AND album_id = NEW.album_id AND deleted_at >= NOW()) --Trigger 'try_insert_album_creator_trigger' makes this secure
    AND auth.uid() NOT IN (SELECT creator_id FROM contak.album_creators WHERE is_owner AND album_id = NEW.album_id AND deleted_at >= NOW())
  THEN 
    RAISE EXCEPTION 'Only album owners can % %', LOWER(TG_OP), REPLACE(TG_TABLE_NAME, '_', ' ');
  END IF;
  RETURN modified;
END; $$;