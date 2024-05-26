--dropping views that depend on tables that need to be changed
--
--

--1st slate
DROP VIEW IF EXISTS public.public_albums;
DROP VIEW IF EXISTS public.owned_album_tracks;
DROP VIEW IF EXISTS public.my_purchased_albums;
DROP VIEW IF EXISTS public.my_albums;
DROP VIEW IF EXISTS public.album_tracks;
--2nd slate
DROP VIEW IF EXISTS public.owned_albums;
DROP VIEW IF EXISTS public.purchased_albums;
--3rd slate
DROP VIEW IF EXISTS public.album_creators;
DROP VIEW IF EXISTS public.album_purchases;

--renaming tables and columns
--
--

--re-creating previously dropped views to satisfy new naming conventions
--SHOULD BE IN REVERSE ORDER OF PREVIOUS DROPS
--

-- View: public.album_purchases

CREATE OR REPLACE VIEW public.album_purchases
WITH (
  security_invoker=true
) AS
 SELECT album_purchases.user_id,
    album_purchases.album_id,
    album_purchases.created_at,
    album_purchases.deleted_at
   FROM contak.album_purchases
  WHERE album_purchases.deleted_at > now();

ALTER TABLE public.album_purchases
    OWNER TO postgres;
COMMENT ON VIEW public.album_purchases
    IS 'Modifible view on contak.album_purchases. Returns only NON-deleted album purchases';

GRANT ALL ON TABLE public.album_purchases TO anon;
GRANT ALL ON TABLE public.album_purchases TO authenticated;
GRANT ALL ON TABLE public.album_purchases TO postgres;
GRANT ALL ON TABLE public.album_purchases TO service_role;


-- View: public.album_creators

CREATE OR REPLACE VIEW public.album_creators
WITH (
  security_invoker=true
) AS
 SELECT album_creators.album_id,
    album_creators.creator_id,
    album_creators.is_owner,
    album_creators.deleted_at
   FROM contak.album_creators
  WHERE album_creators.deleted_at > now();

ALTER TABLE public.album_creators
    OWNER TO postgres;
COMMENT ON VIEW public.album_creators
    IS 'Modifible view on contak.album_creators. Returns only NON-deleted album creators';

GRANT ALL ON TABLE public.album_creators TO anon;
GRANT ALL ON TABLE public.album_creators TO authenticated;
GRANT ALL ON TABLE public.album_creators TO postgres;
GRANT ALL ON TABLE public.album_creators TO service_role;

-- View: public.purchased_albums

CREATE OR REPLACE VIEW public.purchased_albums
WITH (
  security_barrier=true,
  security_invoker=true
) AS
 SELECT album_purchases.user_id,
    album_purchases.album_id,
    album_purchases.created_at,
    album_purchases.deleted_at
   FROM contak.album_purchases
  WHERE (auth.uid() IN ( SELECT album_purchases_1.user_id
           FROM album_purchases album_purchases_1));

ALTER TABLE public.purchased_albums
    OWNER TO postgres;

GRANT ALL ON TABLE public.purchased_albums TO anon;
GRANT ALL ON TABLE public.purchased_albums TO authenticated;
GRANT ALL ON TABLE public.purchased_albums TO postgres;
GRANT ALL ON TABLE public.purchased_albums TO service_role;

-- View: public.owned_albums

CREATE OR REPLACE VIEW public.owned_albums
WITH (
  security_barrier=true,
  security_invoker=true
) AS
 SELECT albums.album_id,
    albums.album_name,
    albums.created_at,
    albums.deleted_at
   FROM contak.albums
  WHERE (auth.uid() IN ( SELECT album_creators.creator_id
           FROM album_creators
          WHERE album_creators.is_owner AND album_creators.album_id = albums.album_id));

ALTER TABLE public.owned_albums
    OWNER TO postgres;

GRANT ALL ON TABLE public.owned_albums TO anon;
GRANT ALL ON TABLE public.owned_albums TO authenticated;
GRANT ALL ON TABLE public.owned_albums TO postgres;
GRANT ALL ON TABLE public.owned_albums TO service_role;

-- View: public.album_tracks

CREATE OR REPLACE VIEW public.album_tracks
WITH (
  security_invoker=true
) AS
 SELECT album_tracks.album_id,
    album_tracks.track_id,
    album_tracks.deleted_at
   FROM contak.album_tracks
  WHERE album_tracks.deleted_at > now();

ALTER TABLE public.album_tracks
    OWNER TO postgres;

GRANT ALL ON TABLE public.album_tracks TO anon;
GRANT SELECT ON TABLE public.album_tracks TO authenticated;
GRANT ALL ON TABLE public.album_tracks TO postgres;
GRANT ALL ON TABLE public.album_tracks TO service_role;

-- View: public.my_albums

CREATE OR REPLACE VIEW public.my_albums
WITH (
  security_invoker=true
) AS
 SELECT albums.album_id,
    albums.album_name,
    albums.created_at,
    creators.album_creators,
    tracks.album_tracks,
    covers.album_covers,
    albums.deleted_at
   FROM contak.albums
     JOIN LATERAL ( SELECT array_to_json(array_agg(json_build_object('creator_id', album_creators.creator_id, 'username', users.username, 'first_name', users.first_name, 'last_name', users.last_name, 'gender', users.gender, 'is_owner', album_creators.is_owner))) AS album_creators
           FROM contak.album_creators
             LEFT JOIN contak.users ON album_creators.creator_id = users.user_id
          WHERE album_creators.album_id = albums.album_id AND album_creators.deleted_at > now() AND (users.deleted_at > now() OR auth.uid() = users.user_id)) creators(album_creators) ON true
     JOIN LATERAL ( SELECT array_to_json(array_agg(json_build_object('track_id', album_tracks.track_id, 'track_name', tracks_1.track_name, 'created_at', tracks_1.created_at, 'track_creators', tracks_1.track_creators, 'audio_files', tracks_1.audio_files))) AS array_to_json
           FROM contak.album_tracks
             JOIN public_tracks tracks_1 ON tracks_1.track_id = album_tracks.track_id
          WHERE album_tracks.album_id = albums.album_id AND album_tracks.deleted_at > now()) tracks(album_tracks) ON true
     LEFT JOIN LATERAL ( SELECT array_to_json(array_agg(objects.name)) AS array_to_json
           FROM storage.objects
          WHERE objects.bucket_id = 'album_covers'::text AND objects.name ~~ (albums.album_id || '/%'::text)) covers(album_covers) ON true
  WHERE (auth.uid() IN ( SELECT album_creators.creator_id
           FROM contak.album_creators
          WHERE album_creators.album_id = albums.album_id));

ALTER TABLE public.my_albums
    OWNER TO postgres;

GRANT ALL ON TABLE public.my_albums TO anon;
GRANT ALL ON TABLE public.my_albums TO authenticated;
GRANT ALL ON TABLE public.my_albums TO postgres;
GRANT ALL ON TABLE public.my_albums TO service_role;

-- View: public.my_purchased_albums

CREATE OR REPLACE VIEW public.my_purchased_albums
WITH (
  security_invoker=true
) AS
 SELECT albums.album_id,
    albums.album_name,
    albums.created_at,
    creators.album_creators,
    tracks.album_tracks,
    covers.album_covers,
    albums.deleted_at,
    true AS is_purchased_by_user
   FROM contak.albums
     JOIN LATERAL ( SELECT array_to_json(array_agg(json_build_object('creator_id', album_creators.creator_id, 'username', users.username, 'first_name', users.first_name, 'last_name', users.last_name, 'gender', users.gender, 'is_owner', album_creators.is_owner))) AS album_creators
           FROM contak.album_creators
             LEFT JOIN contak.users ON album_creators.creator_id = users.user_id
          WHERE album_creators.album_id = albums.album_id AND album_creators.deleted_at > now() AND (users.deleted_at > now() OR auth.uid() = users.user_id)) creators(album_creators) ON true
     JOIN LATERAL ( SELECT array_to_json(array_agg(json_build_object('track_id', album_tracks.track_id, 'track_name', tracks_1.track_name, 'created_at', tracks_1.created_at, 'track_creators', tracks_1.track_creators, 'audio_files', tracks_1.audio_files))) AS array_to_json
           FROM contak.album_tracks
             JOIN public_tracks tracks_1 ON tracks_1.track_id = album_tracks.track_id
          WHERE album_tracks.album_id = albums.album_id AND album_tracks.deleted_at > now()) tracks(album_tracks) ON true
     LEFT JOIN LATERAL ( SELECT array_to_json(array_agg(objects.name)) AS array_to_json
           FROM storage.objects
          WHERE objects.bucket_id = 'album_covers'::text AND objects.name ~~ (albums.album_id || '/%'::text)) covers(album_covers) ON true
  WHERE (auth.uid() IN ( SELECT album_purchases.user_id
           FROM contak.album_purchases
          WHERE album_purchases.album_id = albums.album_id));

ALTER TABLE public.my_purchased_albums
    OWNER TO postgres;

GRANT ALL ON TABLE public.my_purchased_albums TO anon;
GRANT ALL ON TABLE public.my_purchased_albums TO authenticated;
GRANT ALL ON TABLE public.my_purchased_albums TO postgres;
GRANT ALL ON TABLE public.my_purchased_albums TO service_role;

-- View: public.owned_album_tracks

CREATE OR REPLACE VIEW public.owned_album_tracks
WITH (
  security_invoker=true
) AS
 SELECT albums.album_id,
    albums.album_name,
    albums.created_at,
    albums.deleted_at
   FROM contak.albums
  WHERE (auth.uid() IN ( SELECT album_creators.creator_id
           FROM album_creators
          WHERE album_creators.is_owner AND album_creators.album_id = albums.album_id));

ALTER TABLE public.owned_album_tracks
    OWNER TO postgres;

GRANT ALL ON TABLE public.owned_album_tracks TO anon;
GRANT ALL ON TABLE public.owned_album_tracks TO authenticated;
GRANT ALL ON TABLE public.owned_album_tracks TO postgres;
GRANT ALL ON TABLE public.owned_album_tracks TO service_role;

-- View: public.public_albums

CREATE OR REPLACE VIEW public.public_albums
WITH (
  security_invoker=true
) AS
 SELECT albums.album_id,
    albums.album_name,
    albums.created_at,
    creators.album_creators,
    tracks.album_tracks,
    covers.album_covers,
    (EXISTS ( SELECT purchased_albums.user_id,
            purchased_albums.album_id,
            purchased_albums.created_at,
            purchased_albums.deleted_at
           FROM purchased_albums
          WHERE purchased_albums.album_id = albums.album_id)) AS is_purchased_by_user
   FROM contak.albums
     JOIN LATERAL ( SELECT array_to_json(array_agg(json_build_object('creator_id', album_creators.creator_id, 'username', public_users.username, 'first_name', public_users.first_name, 'last_name', public_users.last_name, 'gender', public_users.gender))) AS album_creators
           FROM contak.album_creators
             LEFT JOIN public_users ON album_creators.creator_id = public_users.user_id
          WHERE album_creators.album_id = albums.album_id AND album_creators.deleted_at > now()) creators(album_creators) ON true
     JOIN LATERAL ( SELECT array_to_json(array_agg(json_build_object('track_id', album_tracks.track_id, 'track_name', tracks_1.track_name, 'created_at', tracks_1.created_at, 'track_creators', tracks_1.track_creators, 'audio_files', tracks_1.audio_files))) AS array_to_json
           FROM contak.album_tracks
             LEFT JOIN public_tracks tracks_1 ON tracks_1.track_id = album_tracks.track_id
          WHERE album_tracks.album_id = albums.album_id AND album_tracks.deleted_at > now()) tracks(album_tracks) ON true
     LEFT JOIN LATERAL ( SELECT array_to_json(array_agg(objects.name)) AS array_to_json
           FROM storage.objects
          WHERE objects.bucket_id = 'album_covers'::text AND objects.name ~~ (albums.album_id || '/%'::text)) covers(album_covers) ON true
  WHERE albums.deleted_at > now();

ALTER TABLE public.public_albums
    OWNER TO postgres;

GRANT ALL ON TABLE public.public_albums TO anon;
GRANT ALL ON TABLE public.public_albums TO authenticated;
GRANT ALL ON TABLE public.public_albums TO postgres;
GRANT ALL ON TABLE public.public_albums TO service_role;

