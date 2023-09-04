--After INSERT ON contak.tracks
CREATE OR REPLACE FUNCTION contak.try_insert_track_creator_trigger ()
RETURNS TRIGGER
LANGUAGE 'plpgsql'
--RETURNS NULL ON NULL INPUT 
AS $$ 
-- DECLARE error_message text = (CASE WHEN TG_NARGS <= 0 OR contak.is_null_or_empty(TG_ARGV[0]) IS TRUE THEN FORMAT('Only Creators can be %s''ed on %I.%I', LOWER(TG_OP), TG_TABLE_SCHEMA, TG_TABLE_NAME) ELSE TG_ARGV[0] END);
BEGIN
  INSERT INTO contak.track_creators (track_id, creator_id, is_owner) VALUES (NEW.track_id, auth.uid(), TRUE);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Only Creators can create new tracks';
END; $$;