/*
  This migration file was created using `npx supabase db diff --schema public,contak,storage,auth | npx supabase migration new`
  NOTE: db diff does not capture WITH statements in VIEW's or COMMENT's 
  It also excludes auth, storage, and schemas created by extensions without explicit --schema
  CREATE statements are do not include 'if not exists' by default 
  CREATE TRIGGER statements do not include OR REPLACE by default

  Contents were changed manually to support the features above

  Before applying migration changes to you local database but after saving migration file, 
  execute `npx supabase db diff`
  this will produce a migration file that negates your new migration file
  this negated file could be used to backout your changes should something go wrong with your new migration

  The negated file should not uploaded to github but you should keep it on hand during development
*/
SET role to postgres;

create schema if not exists "contak";

DO $$ BEGIN
  create type "contak"."gender" as enum ('Male', 'Female', 'Non-Binary');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  create type "contak"."user_type" as enum ('User', 'Creator');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS contak.users 
( 
   user_id uuid REFERENCES auth.users (id) ON DELETE CASCADE,
   username text NOT NULL UNIQUE,
   first_name text NULL,
   last_name text NULL,
   birthday timestamp NULL,
   gender contak.gender NULL,
   user_type contak.user_type NOT NULL DEFAULT 'User',
   deleted_at timestamp with time zone NOT NULL DEFAULT 'infinity',
   PRIMARY KEY (user_id)
);

CREATE TABLE IF NOT EXISTS contak.albums
(
   album_id BIGSERIAL NOT NULL PRIMARY KEY,
   album_name text NOT NULL,
   created_at timestamp with time zone NOT NULL DEFAULT NOW(),
   deleted_at timestamp with time zone NOT NULL DEFAULT 'infinity'
   --PRIMARY KEY (album_id, deleted_at)
);

CREATE TABLE IF NOT EXISTS contak.album_creators
(
  album_id bigint NOT NULL REFERENCES contak.albums (album_id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES contak.users (user_id) ON DELETE CASCADE,
  is_owner boolean NOT NULL  DEFAULT FALSE,
  deleted_at timestamp with time zone NOT NULL DEFAULT 'infinity',
  PRIMARY KEY (album_id, creator_id)
);

CREATE TABLE IF NOT EXISTS contak.tracks
(
   track_id BIGSERIAL PRIMARY KEY,
   track_name text NOT NULL,
   created_at timestamp with time zone NOT NULL DEFAULT NOW(),
   deleted_at timestamp with time zone NOT NULL DEFAULT 'infinity'
);

CREATE TABLE IF NOT EXISTS contak.track_creators
(
  track_id bigint NOT NULL REFERENCES contak.tracks (track_id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES contak.users (user_id) ON DELETE CASCADE,
  is_owner boolean NOT NULL DEFAULT FALSE,
  deleted_at timestamp with time zone NOT NULL DEFAULT 'infinity',
  PRIMARY KEY (track_id, creator_id)
);

CREATE TABLE IF NOT EXISTS contak.album_tracks
(
  album_id bigint NOT NULL REFERENCES contak.albums (album_id) ON DELETE CASCADE,
  track_id bigint NOT NULL REFERENCES contak.tracks (track_id) ON DELETE CASCADE,
  deleted_at timestamp with time zone NOT NULL DEFAULT 'infinity',
  PRIMARY KEY (album_id, track_id)
);

set check_function_bodies = off;

DROP FUNCTION IF EXISTS contak.check_can_modify_album_cover();
-- This does not work because storage schema does not expose auth.uid() during trigger execution
-- CREATE OR REPLACE FUNCTION contak.check_can_modify_album_cover()
--  RETURNS trigger
--  LANGUAGE plpgsql
-- AS $function$
-- DECLARE modified record = (CASE TG_OP WHEN 'DELETE' THEN OLD ELSE NEW END);
-- DECLARE new_album_id bigint = SUBSTRING(modified.name, '([^/]+)/')::bigint;
-- BEGIN
-- IF NOT EXISTS(SELECT 1 FROM dev.owned_albums WHERE owned_albums.album_id = new_album_id) THEN
-- RAISE EXCEPTION 'Only album owners can upload new album covers';
-- END IF;
-- RETURN modified;
-- END;
-- $function$
-- ;

CREATE OR REPLACE FUNCTION contak.check_can_modify_album_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE modified record = (CASE TG_OP WHEN 'DELETE' THEN OLD ELSE NEW END);
BEGIN
IF TG_OP = 'DELETE' AND current_user = 'authenticated' THEN
RAISE EXCEPTION 'Cannot permanently delete % as an authenticated user', REPLACE(TG_TABLE_NAME, '_', ' ');
END IF;
IF EXISTS(SELECT creator_id FROM contak.album_creators WHERE is_owner AND album_id = NEW.album_id AND deleted_at >= NOW()) --Trigger 'try_insert_album_creator_trigger' makes this secure
AND auth.uid() NOT IN (SELECT creator_id FROM contak.album_creators WHERE is_owner AND album_id = NEW.album_id AND deleted_at >= NOW())
THEN
RAISE EXCEPTION 'Only album owners can % %', LOWER(TG_OP), REPLACE(TG_TABLE_NAME, '_', ' ');
END IF;
RETURN modified;
END; $function$
;

CREATE OR REPLACE FUNCTION contak.check_can_modify_track_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE modified record = (CASE TG_OP WHEN 'DELETE' THEN OLD ELSE NEW END);
BEGIN
IF EXISTS(SELECT creator_id FROM contak.track_creators WHERE is_owner AND track_id = NEW.track_id AND deleted_at > NOW()) --Trigger 'try_insert_track_creator_trigger' makes this secure
AND auth.uid() NOT IN (SELECT creator_id FROM contak.track_creators WHERE is_owner AND track_id = NEW.track_id AND deleted_at > NOW())
THEN
RAISE EXCEPTION 'Only track owners can % a track', LOWER(TG_OP);
END IF;
RETURN modified;
END; $function$
;

CREATE OR REPLACE FUNCTION contak.check_can_modify_user()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE modified record = (CASE TG_OP WHEN 'DELETE' THEN OLD ELSE NEW END);
BEGIN
IF modified.user_id IS DISTINCT FROM auth.uid() THEN
RAISE EXCEPTION 'Permission denied: You can only modify your own profile';
END IF;
RETURN modified;
END;
$function$
;

CREATE OR REPLACE FUNCTION contak.check_new_album_creator_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
END; $function$
;

CREATE OR REPLACE FUNCTION contak.check_new_track_creator_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
IF NOT EXISTS(SELECT TRUE FROM contak.creators WHERE user_id = NEW.creator_id AND deleted_at > NOW())
THEN
RAISE EXCEPTION 'Only Creators can be added to tracks';
END IF;
IF EXISTS(SELECT creator_id FROM contak.track_creators WHERE is_owner AND track_id = NEW.track_id AND deleted_at > NOW()) --Trigger 'try_insert_track_creator_trigger' makes this secure
AND auth.uid() NOT IN (SELECT creator_id FROM contak.track_creators WHERE is_owner AND track_id = NEW.track_id AND deleted_at > NOW())
THEN
RAISE EXCEPTION 'Only current track owners can add new track creators';
END IF;
RETURN NEW;
END; $function$
;

create or replace view "contak"."column_info" as  SELECT pg_namespace.nspname AS table_schema,
    pg_class.relname AS table_name,
    pg_attribute.attname AS column_name,
    format_type(pg_attribute.atttypid, pg_attribute.atttypmod) AS data_type,
    pg_attribute.attlen AS column_length
   FROM ((pg_attribute
     LEFT JOIN pg_class ON ((pg_attribute.attrelid = pg_class.oid)))
     LEFT JOIN pg_namespace ON ((pg_class.relnamespace = pg_namespace.oid)))
  WHERE (pg_attribute.attnum >= 0);

DROP FUNCTION IF EXISTS contak.create_rule_soft_delete_row(i_schema_name text, i_table_name text, deleted_at_column_name text);

DROP FUNCTION IF EXISTS contak.create_trigger_soft_delete_parent_row_when_empty_v2(i_schema_name text, i_table_name text, i_column_name text, deleted_at_name text);

DROP FUNCTION IF EXISTS contak.create_trigger_soft_delete_referencing_rows_v2(schema_name text, table_name text, column_name text, deleted_at_name text);

create or replace view "contak"."creators" as  SELECT users.user_id,
    users.username,
    users.first_name,
    users.last_name,
    users.birthday,
    users.gender,
    users.user_type,
    users.deleted_at
   FROM contak.users
  WHERE (users.user_type = 'Creator'::contak.user_type);


DROP FUNCTION IF EXISTS contak.drop_rule_soft_delete_row(text, text);

DROP FUNCTION IF EXISTS contak.drop_trigger_soft_delete_parent_row_when_empty_v2(schema_name text, table_name text, column_name text);

DROP FUNCTION IF EXISTS contak.drop_trigger_soft_delete_referencing_rows_v2(schema_name text, table_name text, column_name text);

CREATE OR REPLACE FUNCTION contak.environment()
 RETURNS TABLE(name text, supabase_project_ref character varying, public_supabase_url text, public_supabase_rest_url text, public_supabase_api_key text)
 LANGUAGE plpgsql
 IMMUTABLE PARALLEL SAFE
AS $function$
DECLARE supabase_project_ref VARCHAR(32) = 'ontjcsevddaxmnnzjfqb';
BEGIN
RETURN QUERY SELECT
'production' AS name,
supabase_project_ref,
'https://' || supabase_project_ref || '.supabase.co' AS public_supabase_url,
'https://' || supabase_project_ref || '.supabase.co/rest/v1' AS public_supabase_rest_url,
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9udGpjc2V2ZGRheG1ubnpqZnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODI0NTg1NTYsImV4cCI6MTk5ODAzNDU1Nn0.Ht278TSBKvkYNs9v50VM2Ub_Ez8Paq34hEM96mA4Rks' AS public_supabase_api_key
FROM (VALUES ('')) AS _;
END;
$function$
;

CREATE OR REPLACE FUNCTION contak.error(text, text DEFAULT 'ERROR'::text, text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
BEGIN
RAISE EXCEPTION USING message = $1, errcode = $2, hint = $3;
END $function$
;

CREATE OR REPLACE FUNCTION contak.exec(text)
 RETURNS SETOF record
 LANGUAGE plpgsql
AS $function$
BEGIN
RETURN QUERY EXECUTE $1;
END $function$
;

CREATE OR REPLACE FUNCTION contak.exec_using(text, record, record DEFAULT NULL::record)
 RETURNS SETOF record
 LANGUAGE plpgsql
AS $function$
BEGIN
RETURN QUERY EXECUTE $1 USING $2, $3;
END $function$
;

CREATE OR REPLACE FUNCTION contak.exec_using_void(text, record, record DEFAULT NULL::record)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
EXECUTE $1 USING $2, $3;
END $function$
;

create or replace view "contak"."foreign_key_relations" as  SELECT n.nspname AS fk_schema,
    ft.relname AS fk_table,
    fc.attname AS fk_column,
    pn.nspname AS pk_schema,
    pt.relname AS pk_table,
    pc.attname AS pk_column,
    c.conname AS constraint_name
   FROM ((((((pg_constraint c
     LEFT JOIN pg_namespace n ON ((n.oid = c.connamespace)))
     LEFT JOIN pg_class ft ON ((ft.oid = c.conrelid)))
     LEFT JOIN pg_attribute fc ON (((fc.attrelid = ft.oid) AND (fc.attnum = ANY (c.conkey)))))
     LEFT JOIN pg_class pt ON ((pt.oid = c.confrelid)))
     LEFT JOIN pg_namespace pn ON ((pn.oid = pt.relnamespace)))
     LEFT JOIN pg_attribute pc ON (((pc.attrelid = pt.oid) AND (pc.attnum = ANY (c.confkey)))))
  WHERE (c.contype = 'f'::"char");


DROP FUNCTION IF EXISTS contak.get_create_rule_soft_delete_row_commands(i_schema_name text, i_table_name text, deleted_at_column_name text);

CREATE OR REPLACE FUNCTION contak.get_soft_delete_referencing_rows_commands_v2(i_table_schema text, i_table_name text, i_column_name text, i_deleted_at_name text)
 RETURNS TABLE(command text)
 LANGUAGE sql
AS $function$
SELECT FORMAT(
'UPDATE %I.%I SET deleted_at = $2.%I WHERE %I = $1.%I AND deleted_at IS DISTINCT FROM $2.%I',
fk_schema, fk_table, i_deleted_at_name, fk_column, i_column_name, i_deleted_at_name) AS command
FROM contak.foreign_key_relations --get_referencing_rows(i_table_schema, i_table_name, i_column_name) AS referencing(fk_schema, fk_table, fk_column, pk_schema, pk_table, pk_column, constraint_name)
WHERE pk_schema = i_table_schema AND pk_table = i_table_name AND pk_column = i_column_name
$function$
;

CREATE OR REPLACE FUNCTION contak.is_enabled(i_config_parameter text)
 RETURNS boolean
 LANGUAGE sql
AS $function$
SELECT coalesce(current_setting(i_config_parameter, true), 'off') = 'on';
$function$
;

CREATE OR REPLACE FUNCTION contak.is_null_or_empty(string text)
 RETURNS boolean
 LANGUAGE sql
AS $function$
SELECT (string = '') IS NOT FALSE;
$function$
;

CREATE OR REPLACE FUNCTION contak.is_numeric(text)
 RETURNS boolean
 LANGUAGE plpgsql
 IMMUTABLE STRICT
AS $function$
DECLARE x NUMERIC;
BEGIN
x = $1::NUMERIC;
RETURN TRUE;
EXCEPTION WHEN others THEN
RETURN FALSE;
END;
$function$
;

CREATE OR REPLACE FUNCTION contak.login_as_user(i_username text)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE user_id uuid = (SELECT user_id FROM contak.users WHERE username = i_username);
BEGIN
IF user_id IS NULL THEN
RAISE EXCEPTION 'Cannot login as user "%" because they do not exists', i_username;
END IF;
EXECUTE 'SET request.jwt.claim.sub TO ' || quote_literal(user_id);
SET role TO authenticated;
RETURN user_id;
END;$function$
;

create or replace view "contak"."primary_keys" as  SELECT pn.nspname AS schema_name,
    pt.relname AS table_name,
    pc.attname AS column_name,
    c.conname AS constraint_name
   FROM (((pg_constraint c
     LEFT JOIN pg_namespace pn ON ((pn.oid = c.connamespace)))
     LEFT JOIN pg_class pt ON ((pt.oid = c.conrelid)))
     LEFT JOIN pg_attribute pc ON (((pc.attrelid = pt.oid) AND (pc.attnum = ANY (c.conkey)))))
  WHERE (c.contype = 'p'::"char");


CREATE OR REPLACE FUNCTION contak.soft_delete_parent_row_when_empty_trigger_v2()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE fk_column_name text = (CASE WHEN TG_NARGS < 1 OR contak.is_null_or_empty(TG_ARGV[0]) IS TRUE THEN 'id' ELSE TG_ARGV[0] END);
DECLARE deleted_at_column_name text = (CASE WHEN TG_NARGS < 2 OR contak.is_null_or_empty(TG_ARGV[1]) IS TRUE THEN 'deleted_at' ELSE TG_ARGV[1] END);
DECLARE is_found boolean = FALSE;
DECLARE fk record;
BEGIN
EXECUTE FORMAT('SELECT TRUE FROM %I.%I WHERE %I > NOW() AND %I = $1.%I LIMIT 1',
TG_TABLE_SCHEMA, TG_TABLE_NAME, deleted_at_column_name, fk_column_name, fk_column_name)
USING OLD INTO is_found;
IF is_found IS NOT TRUE THEN -- when no valid rows, delete parent row
FOR fk IN SELECT * FROM contak.foreign_key_relations WHERE fk_schema = TG_TABLE_SCHEMA AND fk_table = TG_TABLE_NAME AND fk_column = fk_column_name
LOOP
EXECUTE FORMAT(--'DELETE FROM %I.%I WHERE %I = $1.%I',
'UPDATE %I.%I SET deleted_at = $2.%I WHERE %I = $1.%I AND deleted_at IS DISTINCT FROM $2.%I',
fk.pk_schema, fk.pk_table, deleted_at_column_name, fk.pk_column, fk_column_name, deleted_at_column_name) USING OLD, NEW;
END LOOP;
END IF;
RETURN OLD;
END; $function$
;

CREATE OR REPLACE FUNCTION contak.soft_delete_referencing_rows_trigger_v2()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE i_column_name text = (CASE WHEN TG_NARGS < 1 OR contak.is_null_or_empty(TG_ARGV[0]) IS TRUE THEN 'id' ELSE TG_ARGV[0] END);
DECLARE i_deleted_at_name text = (CASE WHEN TG_NARGS < 2 OR contak.is_null_or_empty(TG_ARGV[1]) IS TRUE THEN 'deleted_at' ELSE TG_ARGV[1] END);
DECLARE c text;
BEGIN
FOR c IN SELECT command FROM contak.get_soft_delete_referencing_rows_commands_v2(TG_TABLE_SCHEMA, TG_TABLE_NAME, i_column_name, i_deleted_at_name)
LOOP
EXECUTE c USING OLD, NEW;
END LOOP;
RETURN OLD; --By convention, return OLD from AFTER triggers
END; $function$
;

CREATE OR REPLACE FUNCTION contak.soft_delete_rows_trigger_v2()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
EXECUTE FORMAT('UPDATE %I.%I SET deleted_at = NOW() WHERE deleted_at > NOW() AND %s',
TG_TABLE_SCHEMA, TG_TABLE_NAME,
(SELECT STRING_AGG(FORMAT('%I = $1.%I', column_name, column_name), ' AND ')
FROM contak.primary_keys WHERE schema_name = TG_TABLE_SCHEMA AND table_name = TG_TABLE_NAME))
USING OLD;
RETURN NULL; -- Prevents normal DELETE behavior
END; $function$
;

DROP VIEW IF EXISTS contak.track_owners;
-- Not used anywhere
-- create or replace view "contak"."track_owners" as  SELECT track_creators.track_id,
--     track_creators.creator_id,
--     track_creators.deleted_at
--    FROM contak.track_creators
--   WHERE track_creators.is_owner;


CREATE OR REPLACE FUNCTION contak.try_insert_album_creator_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
INSERT INTO contak.album_creators (album_id, creator_id, is_owner) VALUES (NEW.album_id, auth.uid(), TRUE);
RETURN NEW;
EXCEPTION WHEN OTHERS THEN
RAISE EXCEPTION 'Only Creators can create new albums';
END; $function$
;

CREATE OR REPLACE FUNCTION contak.try_insert_track_creator_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
INSERT INTO contak.track_creators (track_id, creator_id, is_owner) VALUES (NEW.track_id, auth.uid(), TRUE);
RETURN NEW;
EXCEPTION WHEN OTHERS THEN
RAISE EXCEPTION 'Only Creators can create new tracks';
END; $function$
;

CREATE OR REPLACE TRIGGER a_soft_delete_rows_tr BEFORE DELETE ON contak.album_creators FOR EACH ROW WHEN ((COALESCE(current_setting('contak.hard_delete'::text, true), 'off'::text) <> 'on'::text)) EXECUTE FUNCTION contak.soft_delete_rows_trigger_v2();

CREATE OR REPLACE TRIGGER album_id_soft_delete_parent_row_when_empty_tr AFTER UPDATE OF deleted_at ON contak.album_creators FOR EACH ROW EXECUTE FUNCTION contak.soft_delete_parent_row_when_empty_trigger_v2('album_id', 'deleted_at');

CREATE OR REPLACE TRIGGER check_can_modify_album_tr BEFORE DELETE OR UPDATE ON contak.album_creators FOR EACH ROW EXECUTE FUNCTION contak.check_can_modify_album_trigger();

CREATE OR REPLACE TRIGGER check_user_is_creator_tr BEFORE INSERT ON contak.album_creators FOR EACH ROW EXECUTE FUNCTION contak.check_new_album_creator_trigger();

CREATE OR REPLACE TRIGGER a_soft_delete_rows_tr BEFORE DELETE ON contak.album_tracks FOR EACH ROW WHEN ((COALESCE(current_setting('contak.hard_delete'::text, true), 'off'::text) <> 'on'::text)) EXECUTE FUNCTION contak.soft_delete_rows_trigger_v2();

CREATE OR REPLACE TRIGGER album_id_soft_delete_parent_row_when_empty_tr AFTER UPDATE OF deleted_at ON contak.album_tracks FOR EACH ROW EXECUTE FUNCTION contak.soft_delete_parent_row_when_empty_trigger_v2('album_id', 'deleted_at');

CREATE OR REPLACE TRIGGER check_can_modify_album BEFORE INSERT OR DELETE OR UPDATE ON contak.album_tracks FOR EACH ROW EXECUTE FUNCTION contak.check_can_modify_album_trigger();

CREATE OR REPLACE TRIGGER a_soft_delete_rows_tr BEFORE DELETE ON contak.albums FOR EACH ROW WHEN ((COALESCE(current_setting('contak.hard_delete'::text, true), 'off'::text) <> 'on'::text)) EXECUTE FUNCTION contak.soft_delete_rows_trigger_v2();

CREATE OR REPLACE TRIGGER check_can_modify_album_tr BEFORE DELETE OR UPDATE ON contak.albums FOR EACH ROW EXECUTE FUNCTION contak.check_can_modify_album_trigger();

CREATE OR REPLACE TRIGGER try_insert_album_creator_tr AFTER INSERT ON contak.albums FOR EACH ROW EXECUTE FUNCTION contak.try_insert_album_creator_trigger();

CREATE OR REPLACE TRIGGER a_soft_delete_rows_tr BEFORE DELETE ON contak.track_creators FOR EACH ROW WHEN ((COALESCE(current_setting('contak.hard_delete'::text, true), 'off'::text) <> 'on'::text)) EXECUTE FUNCTION contak.soft_delete_rows_trigger_v2();

CREATE OR REPLACE TRIGGER check_can_modify_track_tr BEFORE DELETE OR UPDATE ON contak.track_creators FOR EACH ROW EXECUTE FUNCTION contak.check_can_modify_track_trigger();

CREATE OR REPLACE TRIGGER check_user_is_creator_tr BEFORE INSERT ON contak.track_creators FOR EACH ROW EXECUTE FUNCTION contak.check_new_track_creator_trigger();

CREATE OR REPLACE TRIGGER track_id_soft_delete_parent_row_when_empty_tr AFTER UPDATE OF deleted_at ON contak.track_creators FOR EACH ROW EXECUTE FUNCTION contak.soft_delete_parent_row_when_empty_trigger_v2('track_id', 'deleted_at');

CREATE OR REPLACE TRIGGER a_soft_delete_rows_tr BEFORE DELETE ON contak.tracks FOR EACH ROW WHEN ((COALESCE(current_setting('contak.hard_delete'::text, true), 'off'::text) <> 'on'::text)) EXECUTE FUNCTION contak.soft_delete_rows_trigger_v2();

CREATE OR REPLACE TRIGGER check_can_modify_track_tr BEFORE DELETE OR UPDATE ON contak.tracks FOR EACH ROW EXECUTE FUNCTION contak.check_can_modify_track_trigger();

CREATE OR REPLACE TRIGGER try_insert_track_creator_tr AFTER INSERT ON contak.tracks FOR EACH ROW EXECUTE FUNCTION contak.try_insert_track_creator_trigger();

CREATE OR REPLACE TRIGGER check_can_modify_user BEFORE INSERT OR DELETE OR UPDATE ON contak.users FOR EACH ROW EXECUTE FUNCTION contak.check_can_modify_user();

CREATE OR REPLACE TRIGGER users_soft_delete_referencing_rows_tr AFTER UPDATE OF deleted_at ON contak.users FOR EACH ROW EXECUTE FUNCTION contak.soft_delete_referencing_rows_trigger_v2('user_id', 'deleted_at');

CREATE OR REPLACE TRIGGER users_soft_delete_rows_tr BEFORE DELETE ON contak.users FOR EACH ROW WHEN ((COALESCE(current_setting('contak.hard_delete'::text, true), 'off'::text) <> 'on'::text)) EXECUTE FUNCTION contak.soft_delete_rows_trigger_v2();


create schema if not exists "dev";


create extension if not exists "pgtap" with schema "extensions";


-- Schema: public


create or replace view "public"."album_creators" WITH (security_invoker = true, security_barrier = false) as
SELECT album_creators.album_id,
    album_creators.creator_id,
    album_creators.is_owner,
    album_creators.deleted_at
   FROM contak.album_creators
  WHERE (album_creators.deleted_at > now());


create or replace view "public"."album_tracks" WITH (security_invoker = true, security_barrier = false) as
SELECT album_tracks.album_id,
    album_tracks.track_id,
    album_tracks.deleted_at
   FROM contak.album_tracks
  WHERE (album_tracks.deleted_at > now());


create or replace view "public"."my_profile" WITH (security_invoker = true, security_barrier = true, check_option = 'local') as
SELECT users.user_id,
    users.username,
    users.first_name,
    users.last_name,
    users.birthday,
    users.gender,
    users.user_type,
    users.deleted_at,
    ( SELECT array_agg(objects.name) AS array_agg
           FROM storage.objects
          WHERE ((objects.bucket_id = 'profile_pictures'::text) AND (objects.name ~~ (users.user_id || '/%'::text)))) AS profile_pictures
   FROM contak.users
  WHERE (users.user_id = auth.uid());


create or replace view "public"."owned_albums" WITH (security_invoker = true, security_barrier = true) as
SELECT albums.album_id,
    albums.album_name,
    albums.created_at,
    albums.deleted_at
   FROM contak.albums
  WHERE (auth.uid() IN ( SELECT album_creators.creator_id
           FROM album_creators
          WHERE (album_creators.is_owner AND (album_creators.album_id = albums.album_id))));


create or replace view "public"."public_users" WITH (security_invoker = true, security_barrier = false) as
SELECT users.user_id,
    users.username,
    users.first_name,
    users.last_name,
    users.gender,
    users.user_type
   FROM contak.users
  WHERE (users.deleted_at > now());


create or replace view "public"."track_creators" WITH (security_invoker = true, security_barrier = false) as
SELECT track_creators.track_id,
    track_creators.creator_id,
    track_creators.is_owner,
    track_creators.deleted_at
   FROM contak.track_creators
  WHERE (track_creators.deleted_at > now());


create or replace view "public"."my_tracks" WITH (security_invoker = true, security_barrier = false) as
SELECT tracks.track_id,
    tracks.track_name,
    tracks.created_at,
    creators.track_creators,
    audio.audio_files,
    tracks.deleted_at
   FROM ((contak.tracks
     JOIN LATERAL ( SELECT array_to_json(array_agg(json_build_object('creator_id', track_creators.creator_id, 'username', public_users.username, 'first_name', public_users.first_name, 'last_name', public_users.last_name, 'gender', public_users.gender, 'is_owner', track_creators.is_owner))) AS track_creators
           FROM (contak.track_creators
             LEFT JOIN public_users ON ((track_creators.creator_id = public_users.user_id)))
          WHERE ((track_creators.track_id = tracks.track_id) AND (track_creators.deleted_at > now()))) creators(track_creators) ON (true))
     LEFT JOIN LATERAL ( SELECT array_to_json(array_agg(objects.name)) AS array_to_json
           FROM storage.objects
          WHERE ((objects.bucket_id = 'tracks'::text) AND (objects.name ~~ (tracks.track_id || '/%'::text)))) audio(audio_files) ON (true))
  WHERE (auth.uid() IN ( SELECT track_creators.creator_id
           FROM contak.track_creators
          WHERE (track_creators.track_id = tracks.track_id)));


create or replace view "public"."owned_album_tracks" WITH (security_invoker = true, security_barrier = true) as
SELECT album_tracks.album_id,
    album_tracks.track_id,
    album_tracks.deleted_at
   FROM contak.album_tracks
  WHERE (EXISTS ( SELECT 1
           FROM owned_albums
          WHERE (owned_albums.album_id = album_tracks.album_id)));


create or replace view "public"."owned_tracks" WITH (security_invoker = true, security_barrier = true) as
SELECT tracks.track_id,
    tracks.track_name,
    tracks.created_at,
    tracks.deleted_at
   FROM contak.tracks
  WHERE (auth.uid() IN ( SELECT track_creators.creator_id
           FROM track_creators
          WHERE (track_creators.is_owner AND (track_creators.track_id = tracks.track_id))));


create or replace view "public"."public_tracks" WITH (security_invoker = true, security_barrier = false) as
SELECT tracks.track_id,
    tracks.track_name,
    tracks.created_at,
    creators.track_creators,
    audio.audio_files
   FROM ((contak.tracks
     JOIN LATERAL ( SELECT array_to_json(array_agg(json_build_object('creator_id', track_creators.creator_id, 'username', public_users.username, 'first_name', public_users.first_name, 'last_name', public_users.last_name, 'gender', public_users.gender))) AS track_creators
           FROM (contak.track_creators
             LEFT JOIN public_users ON ((track_creators.creator_id = public_users.user_id)))
          WHERE ((track_creators.track_id = tracks.track_id) AND (track_creators.deleted_at > now()))) creators(track_creators) ON (true))
     LEFT JOIN LATERAL ( SELECT array_to_json(array_agg(objects.name)) AS array_to_json
           FROM storage.objects
          WHERE ((objects.bucket_id = 'tracks'::text) AND (objects.name ~~ (tracks.track_id || '/%'::text)))) audio(audio_files) ON (true))
  WHERE (tracks.deleted_at > now());


create or replace view "public"."my_albums" WITH (security_invoker = true, security_barrier = false) as
SELECT albums.album_id,
    albums.album_name,
    albums.created_at,
    creators.album_creators,
    tracks.album_tracks,
    covers.album_covers,
    albums.deleted_at
   FROM (((contak.albums
     JOIN LATERAL ( SELECT array_to_json(array_agg(json_build_object('creator_id', album_creators.creator_id, 'username', users.username, 'first_name', users.first_name, 'last_name', users.last_name, 'gender', users.gender, 'is_owner', album_creators.is_owner))) AS album_creators
           FROM (contak.album_creators
             LEFT JOIN contak.users ON ((album_creators.creator_id = users.user_id)))
          WHERE ((album_creators.album_id = albums.album_id) AND (album_creators.deleted_at > now()) AND ((users.deleted_at > now()) OR (auth.uid() = users.user_id)))) creators(album_creators) ON (true))
     JOIN LATERAL ( SELECT array_to_json(array_agg(json_build_object('track_id', album_tracks.track_id, 'track_name', tracks_1.track_name, 'created_at', tracks_1.created_at, 'track_creators', tracks_1.track_creators, 'audio_files', tracks_1.audio_files))) AS array_to_json
           FROM (contak.album_tracks
             JOIN public_tracks tracks_1 ON ((tracks_1.track_id = album_tracks.track_id)))
          WHERE ((album_tracks.album_id = albums.album_id) AND (album_tracks.deleted_at > now()))) tracks(album_tracks) ON (true))
     LEFT JOIN LATERAL ( SELECT array_to_json(array_agg(objects.name)) AS array_to_json
           FROM storage.objects
          WHERE ((objects.bucket_id = 'album_covers'::text) AND (objects.name ~~ (albums.album_id || '/%'::text)))) covers(album_covers) ON (true))
  WHERE (auth.uid() IN ( SELECT album_creators.creator_id
           FROM contak.album_creators
          WHERE (album_creators.album_id = albums.album_id)));


create or replace view "public"."public_albums" WITH (security_invoker = true, security_barrier = false) as
SELECT albums.album_id,
    albums.album_name,
    albums.created_at,
    creators.album_creators,
    tracks.album_tracks,
    covers.album_covers
   FROM (((contak.albums
     JOIN LATERAL ( SELECT array_to_json(array_agg(json_build_object('creator_id', album_creators.creator_id, 'username', public_users.username, 'first_name', public_users.first_name, 'last_name', public_users.last_name, 'gender', public_users.gender))) AS album_creators
           FROM (contak.album_creators
             LEFT JOIN public_users ON ((album_creators.creator_id = public_users.user_id)))
          WHERE ((album_creators.album_id = albums.album_id) AND (album_creators.deleted_at > now()))) creators(album_creators) ON (true))
     JOIN LATERAL ( SELECT array_to_json(array_agg(json_build_object('track_id', album_tracks.track_id, 'track_name', tracks_1.track_name, 'created_at', tracks_1.created_at, 'track_creators', tracks_1.track_creators, 'audio_files', tracks_1.audio_files))) AS array_to_json
           FROM (contak.album_tracks
             LEFT JOIN public_tracks tracks_1 ON ((tracks_1.track_id = album_tracks.track_id)))
          WHERE ((album_tracks.album_id = albums.album_id) AND (album_tracks.deleted_at > now()))) tracks(album_tracks) ON (true))
     LEFT JOIN LATERAL ( SELECT array_to_json(array_agg(objects.name)) AS array_to_json
           FROM storage.objects
          WHERE ((objects.bucket_id = 'album_covers'::text) AND (objects.name ~~ (albums.album_id || '/%'::text)))) covers(album_covers) ON (true))
  WHERE (albums.deleted_at > now());




-- Schema: storage

DO $$ BEGIN
  alter table "storage"."objects" add constraint "objects_owner_fkey" FOREIGN KEY (owner) REFERENCES auth.users(id) not valid;
EXCEPTION WHEN duplicate_object THEN null;
END;$$;

alter table "storage"."objects" validate constraint "objects_owner_fkey";


DO $$ BEGIN
  create policy "Enable select for authenticated users only"
  on "storage"."buckets"
  as permissive
  for select
  to authenticated
  using (true);
EXCEPTION WHEN duplicate_object THEN null;
END;$$;

DO $$ BEGIN
  create policy "Enable all access for authenticated users"
  on "storage"."objects"
  as permissive
  for all
  to authenticated
  using (true)
  with check (true);
EXCEPTION WHEN duplicate_object THEN null;
END;$$;

DO $$ BEGIN
  create policy "Give owners access to own tracks 1kpor60_0"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
  using (((bucket_id = 'tracks'::text) AND (((storage.foldername(name))[1])::bigint IN ( SELECT track_creators.track_id
    FROM contak.track_creators
    WHERE (track_creators.is_owner AND (track_creators.creator_id = auth.uid()))))));
EXCEPTION WHEN duplicate_object THEN null;
END;$$;

DO $$ BEGIN
  create policy "Give owners access to own tracks 1kpor60_1"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
  with check (((bucket_id = 'tracks'::text) AND (((storage.foldername(name))[1])::bigint IN ( SELECT track_creators.track_id
    FROM contak.track_creators
    WHERE (track_creators.is_owner AND (track_creators.creator_id = auth.uid()))))));
EXCEPTION WHEN duplicate_object THEN null;
END;$$;


DO $$ BEGIN
  create policy "Give owners access to own tracks 1kpor60_2"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
  using (((bucket_id = 'tracks'::text) AND (((storage.foldername(name))[1])::bigint IN ( SELECT track_creators.track_id
    FROM contak.track_creators
    WHERE (track_creators.is_owner AND (track_creators.creator_id = auth.uid()))))));
EXCEPTION WHEN duplicate_object THEN null;
END;$$;

DO $$ BEGIN
  create policy "Give owners access to own tracks 1kpor60_3"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
  using (((bucket_id = 'tracks'::text) AND (((storage.foldername(name))[1])::bigint IN ( SELECT track_creators.track_id
    FROM contak.track_creators
    WHERE (track_creators.is_owner AND (track_creators.creator_id = auth.uid()))))));
EXCEPTION WHEN duplicate_object THEN null;
END;$$;


--rename these policies and create if not exists
DROP POLICY IF EXISTS "Give users access to own folder 13bzqek_0" ON storage.objects;
DO $$ BEGIN
  create policy "Give users access to own album_covers 13bzqek_0"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
  using (((bucket_id = 'album_covers'::text) AND (EXISTS ( SELECT 1
    FROM contak.album_creators
    WHERE ((album_creators.creator_id = auth.uid()) AND album_creators.is_owner AND (album_creators.album_id = ((storage.foldername(objects.name))[1])::bigint) AND (album_creators.deleted_at > now()))))));     
EXCEPTION WHEN duplicate_object THEN null;
END;$$;

DROP POLICY IF EXISTS "Give users access to own folder 13bzqek_1" ON storage.objects;
DO $$ BEGIN
  create policy "Give users access to own album_covers 13bzqek_1"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
  with check (((bucket_id = 'album_covers'::text) AND (EXISTS ( SELECT 1
    FROM contak.album_creators
    WHERE ((album_creators.creator_id = auth.uid()) AND album_creators.is_owner AND (album_creators.album_id = ((storage.foldername(objects.name))[1])::bigint) AND (album_creators.deleted_at > now()))))));     
EXCEPTION WHEN duplicate_object THEN null;
END;$$;

DROP POLICY IF EXISTS "Give users access to own folder 13bzqek_2" ON storage.objects;
DO $$ BEGIN
  create policy "Give users access to own album_covers 13bzqek_2"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
  using (((bucket_id = 'album_covers'::text) AND (EXISTS ( SELECT 1
    FROM contak.album_creators
    WHERE ((album_creators.creator_id = auth.uid()) AND album_creators.is_owner AND (album_creators.album_id = ((storage.foldername(objects.name))[1])::bigint) AND (album_creators.deleted_at > now()))))));     
EXCEPTION WHEN duplicate_object THEN null;
END;$$;

DROP POLICY IF EXISTS "Give users access to own folder 13bzqek_3" ON storage.objects;
DO $$ BEGIN
  create policy "Give users access to own album_covers 13bzqek_3"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
  using (((bucket_id = 'album_covers'::text) AND (EXISTS ( SELECT 1
    FROM contak.album_creators
    WHERE ((album_creators.creator_id = auth.uid()) AND album_creators.is_owner AND (album_creators.album_id = ((storage.foldername(objects.name))[1])::bigint) AND (album_creators.deleted_at > now()))))));     
EXCEPTION WHEN duplicate_object THEN null;
END;$$;

DROP POLICY IF EXISTS "Give users access to own folder 1pmf6kr_0" ON storage.objects;
DO $$ BEGIN
  create policy "Give users access to own profile_pictures 1pmf6kr_0"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
  using (((bucket_id = 'profile_pictures'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));
EXCEPTION WHEN duplicate_object THEN null;
END;$$;

DROP POLICY IF EXISTS "Give users access to own folder 1pmf6kr_1" ON storage.objects;
DO $$ BEGIN
  create policy "Give users access to own profile_pictures 1pmf6kr_1"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
  with check (((bucket_id = 'profile_pictures'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));
EXCEPTION WHEN duplicate_object THEN null;
END;$$;

DROP POLICY IF EXISTS "Give users access to own folder 1pmf6kr_2" ON storage.objects;
DO $$ BEGIN
  create policy "Give users access to own profile_pictures 1pmf6kr_2"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
  using (((bucket_id = 'profile_pictures'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));
EXCEPTION WHEN duplicate_object THEN null;
END;$$;

DROP POLICY IF EXISTS "Give users access to own folder 1pmf6kr_3" ON storage.objects;
DO $$ BEGIN
  create policy "Give users access to own profile_pictures 1pmf6kr_3"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
  using (((bucket_id = 'profile_pictures'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));
EXCEPTION WHEN duplicate_object THEN null;
END;$$;
