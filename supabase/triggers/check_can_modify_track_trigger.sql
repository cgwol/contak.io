--BEFORE UPDATE OR DELETE ON contak.tracks, contak.track_creators
CREATE OR REPLACE FUNCTION contak.check_can_modify_track_trigger ()
RETURNS TRIGGER
LANGUAGE 'plpgsql'
AS $$ 
-- DECLARE error_message text = (CASE WHEN TG_NARGS <= 0 OR contak.is_null_or_empty(TG_ARGV[0]) IS TRUE THEN FORMAT('Only Creators can be %s''ed on %I.%I', LOWER(TG_OP), TG_TABLE_SCHEMA, TG_TABLE_NAME) ELSE TG_ARGV[0] END);
DECLARE modified record = (CASE TG_OP WHEN 'DELETE' THEN OLD ELSE NEW END);
BEGIN
  -- IF NOT EXISTS(SELECT * FROM contak.track_creators WHERE is_owner AND track_id = modified.track_id AND creator_id = auth.uid() AND deleted_at >= NOW())
  IF EXISTS(SELECT creator_id FROM contak.track_creators WHERE is_owner AND track_id = NEW.track_id AND deleted_at > NOW()) --Trigger 'try_insert_track_creator_trigger' makes this secure
    AND auth.uid() NOT IN (SELECT creator_id FROM contak.track_creators WHERE is_owner AND track_id = NEW.track_id AND deleted_at > NOW())
  THEN 
    RAISE EXCEPTION 'Only track owners can % a track', LOWER(TG_OP);
  END IF;
  RETURN modified;
END; $$;