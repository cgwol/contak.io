CREATE OR REPLACE VIEW public.my_purchased_albums WITH (security_invoker = true) AS 
SELECT albums.album_id, 
	albums.album_name, 
	albums.created_at, 
	creators.album_creators, 
	tracks.album_tracks, 
	covers.album_covers,
	albums.deleted_at,
	true AS is_purchased_by_user
FROM contak.albums
JOIN LATERAL (
	SELECT array_to_json(ARRAY_AGG(JSON_BUILD_OBJECT(
		'creator_id', album_creators.creator_id, 
		'username', users.username,
		'first_name', users.first_name,
		'last_name', users.last_name,
		'gender', users.gender,
		'is_owner', album_creators.is_owner
	--	'added_on', album_creators.created_at
	))) AS album_creators
	FROM contak.album_creators 
	LEFT JOIN contak.users ON album_creators.creator_id = users.user_id
	WHERE album_creators.album_id = albums.album_id AND album_creators.deleted_at > NOW() 
		AND (users.deleted_at > NOW() OR auth.uid() = users.user_id)
) AS creators(album_creators) ON true
JOIN LATERAL (
	SELECT array_to_json(ARRAY_AGG(JSON_BUILD_OBJECT(
		'track_id', album_tracks.track_id,
		'track_name', tracks.track_name,
		'created_at', tracks.created_at,
		'track_creators', tracks.track_creators,
		'audio_files', tracks.audio_files
	)))
	FROM contak.album_tracks
	INNER JOIN public.public_tracks AS tracks ON tracks.track_id = album_tracks.track_id
	WHERE album_tracks.album_id = albums.album_id AND album_tracks.deleted_at > NOW()
) AS tracks(album_tracks) ON true
LEFT JOIN LATERAL (
	SELECT array_to_json(ARRAY_AGG(objects.name))
	FROM storage.objects 
	WHERE objects.bucket_id = 'album_covers' AND objects.name LIKE albums.album_id || '/%'
) AS covers(album_covers) ON true
--Include deleted albums
WHERE auth.uid() IN (SELECT album_purchases.user_id FROM contak.album_purchases WHERE album_purchases.album_id = albums.album_id);
