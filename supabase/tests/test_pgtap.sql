
CREATE OR REPLACE VIEW dev.public_tracks WITH (security_invoker = true) AS 
SELECT tracks.track_id, tracks.track_name, tracks.created_at, creators.track_creators
FROM contak.tracks
JOIN LATERAL (
	SELECT array_to_json(ARRAY_AGG(JSON_BUILD_OBJECT(
		'creator_id', track_creators.creator_id, 
		'username', public_users.username,
		'first_name', public_users.first_name,
		'last_name', public_users.last_name,
		'gender', public_users.gender
	--	'added_on', track_creators.created_at
	))) AS track_creators
	FROM contak.track_creators 
	LEFT JOIN dev.public_users ON track_creators.creator_id = public_users.user_id
	WHERE track_creators.track_id = tracks.track_id AND track_creators.deleted_at > NOW()
) AS creators(track_creators) ON true
WHERE tracks.deleted_at > NOW();
GRANT SELECT ON dev.public_tracks TO authenticated;


CREATE OR REPLACE VIEW dev.public_albums WITH (security_invoker = true) AS 
SELECT albums.album_id, albums.album_name, albums.created_at, creators.album_creators, tracks.album_tracks
FROM contak.albums
JOIN LATERAL (
	SELECT array_to_json(ARRAY_AGG(JSON_BUILD_OBJECT(
		'creator_id', album_creators.creator_id, 
		'username', public_users.username,
		'first_name', public_users.first_name,
		'last_name', public_users.last_name,
		'gender', public_users.gender
	--	'added_on', album_creators.created_at
	))) AS album_creators
	FROM contak.album_creators 
	LEFT JOIN dev.public_users ON album_creators.creator_id = public_users.user_id
	WHERE album_creators.album_id = albums.album_id AND album_creators.deleted_at > NOW()
) AS creators(album_creators) ON true
JOIN LATERAL (
	SELECT array_to_json(ARRAY_AGG(JSON_BUILD_OBJECT(
		'track_id', album_tracks.track_id,
		'track_name', tracks.track_name,
		'created_at', tracks.created_at,
		'track_creators', tracks.track_creators
	)))
	FROM contak.album_tracks
	LEFT JOIN dev.public_tracks AS tracks ON tracks.track_id = album_tracks.track_id
	WHERE album_tracks.album_id = albums.album_id AND album_tracks.deleted_at > NOW()
) AS tracks(album_tracks) ON true
WHERE albums.deleted_at > NOW();
GRANT SELECT ON dev.public_albums TO authenticated;

SELECT * FROM dev.public_albums

