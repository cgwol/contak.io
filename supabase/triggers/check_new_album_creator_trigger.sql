--Before INSERT on contak.album_creators
CREATE OR REPLACE FUNCTION contak.check_new_album_creator_trigger ()
RETURNS TRIGGER
LANGUAGE 'plpgsql'
--RETURNS NULL ON NULL INPUT 
AS $$ 
-- DECLARE error_message text = (CASE WHEN TG_NARGS <= 0 OR contak.is_null_or_empty(TG_ARGV[0]) IS TRUE THEN FORMAT('Only Creators can be %s''ed on %I.%I', LOWER(TG_OP), TG_TABLE_SCHEMA, TG_TABLE_NAME) ELSE TG_ARGV[0] END);
BEGIN
  IF NOT EXISTS(SELECT TRUE FROM contak.creators WHERE user_id = NEW.creator_id AND deleted_at > NOW())
  THEN 
    RAISE EXCEPTION 'Only Creators can be added to albums';
  END IF;
  IF EXISTS(SELECT creator_id FROM contak.album_creators WHERE is_owner AND album_id = NEW.album_id AND deleted_at > NOW()) --Trigger 'try_insert_album_creator_trigger' makes this secure
    AND (auth.uid() IS NULL OR auth.uid() NOT IN (SELECT creator_id FROM contak.album_creators WHERE is_owner AND album_id = NEW.album_id AND deleted_at > NOW()))
  THEN 
    RAISE EXCEPTION 'Only current album owners can add new album creators';
  END IF;
  RETURN NEW;
END; $$;