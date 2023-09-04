DROP RULE IF EXISTS soft_delete_row ON contak.album_creators;
DROP RULE IF EXISTS prevent_owner_soft_deletion ON contak.album_creators;

CREATE OR REPLACE TRIGGER a_soft_delete_rows_tr BEFORE DELETE ON contak.album_creators 
FOR EACH ROW WHEN (coalesce(current_setting('contak.hard_delete', true), 'off') != 'on')
EXECUTE FUNCTION contak.soft_delete_rows_trigger_v2();

COMMENT ON TRIGGER a_soft_delete_rows_tr ON contak.album_creators IS 
'This trigger must occur before check_can_modify_album, hence the "a" prefiex. (Postgres executes triggers in alphabetical order if multiple match)';


DROP RULE IF EXISTS soft_delete_row ON contak.albums;
DROP RULE IF EXISTS soft_delete_update_cascade ON contak.albums;
-- SELECT contak.drop_trigger_soft_delete_referencing_rows_v2 ('contak', 'albums', 'album_id');
-- SELECT contak.create_trigger_soft_delete_referencing_rows_v2 ('contak', 'albums', 'album_id');
CREATE OR REPLACE TRIGGER a_soft_delete_rows_tr BEFORE DELETE ON contak.albums 
FOR EACH ROW WHEN (coalesce(current_setting('contak.hard_delete', true), 'off') != 'on')
EXECUTE FUNCTION contak.soft_delete_rows_trigger_v2();

COMMENT ON TRIGGER a_soft_delete_rows_tr ON contak.albums IS 
'This trigger must occur before check_can_modify_album, hence the "a" prefiex. (Postgres executes triggers in alphabetical order if multiple match)';


DROP RULE IF EXISTS soft_delete_row ON contak.album_tracks;
CREATE OR REPLACE TRIGGER a_soft_delete_rows_tr BEFORE DELETE ON contak.album_tracks 
FOR EACH ROW WHEN (coalesce(current_setting('contak.hard_delete', true), 'off') != 'on')
EXECUTE FUNCTION contak.soft_delete_rows_trigger_v2();

COMMENT ON TRIGGER a_soft_delete_rows_tr ON contak.album_tracks IS 
'This trigger must occur before check_can_modify_album, hence the "a" prefiex. (Postgres executes triggers in alphabetical order if multiple match)';

DROP TRIGGER IF EXISTS track_id_soft_delete_parent_row_when_empty_tr ON contak.album_tracks;


DROP RULE IF EXISTS soft_delete_row ON contak.tracks;
DROP RULE IF EXISTS soft_delete_update_cascade ON contak.tracks;
CREATE OR REPLACE TRIGGER a_soft_delete_rows_tr BEFORE DELETE ON contak.tracks 
FOR EACH ROW WHEN (coalesce(current_setting('contak.hard_delete', true), 'off') != 'on')
EXECUTE FUNCTION contak.soft_delete_rows_trigger_v2();

COMMENT ON TRIGGER a_soft_delete_rows_tr ON contak.tracks IS 
'This trigger must occur before check_can_modify_track, hence the "a" prefiex. (Postgres executes triggers in alphabetical order if multiple match)';


DROP RULE IF EXISTS soft_delete_row ON contak.track_creators;
DROP RULE IF EXISTS prevent_owner_soft_deletion ON contak.track_creators;
CREATE OR REPLACE TRIGGER a_soft_delete_rows_tr BEFORE DELETE ON contak.track_creators 
FOR EACH ROW WHEN (coalesce(current_setting('contak.hard_delete', true), 'off') != 'on')
EXECUTE FUNCTION contak.soft_delete_rows_trigger_v2();

COMMENT ON TRIGGER a_soft_delete_rows_tr ON contak.track_creators IS 
'This trigger must occur before check_can_modify_track, hence the "a" prefiex. (Postgres executes triggers in alphabetical order if multiple match)';



--Before Update
-- CREATE OR REPLACE FUNCTION contak.prevent_owner_soft_deletion_trigger ()
-- RETURNS TRIGGER
-- LANGUAGE 'plpgsql'
-- AS $$ 
-- BEGIN
--   IF old.is_owner AND (old.deleted_at IS DISTINCT FROM new.deleted_at) 
--   	AND (new.creator_id IS DISTINCT FROM auth.uid())
--   THEN 
-- 	  RETURN OLD; -- Prevents normal UPDATE behavior
--   END IF;
--   RETURN NEW;
-- END; $$;

-- CREATE OR REPLACE TRIGGER prevent_owner_soft_deletion_tr BEFORE UPDATE OF deleted_at ON contak.album_creators 
-- FOR EACH ROW WHEN (NOT contak.is_enabled('contak.delete_owner'::text) AND old.is_owner )
-- EXECUTE FUNCTION contak.soft_delete_rows_trigger_v2();