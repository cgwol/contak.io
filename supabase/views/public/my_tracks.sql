-- SELECT contak.login_as_user('kanyewest');
-- RESET role;
CREATE OR REPLACE VIEW public.my_tracks WITH (security_invoker = true) AS 
SELECT tracks.track_id, tracks.track_name, tracks.created_at, creators.track_creators, audio.audio_files, tracks.deleted_at
FROM contak.tracks
JOIN LATERAL (
	SELECT array_to_json(ARRAY_AGG(JSON_BUILD_OBJECT(
		'creator_id', track_creators.creator_id, 
		'username', public_users.username,
		'first_name', public_users.first_name,
		'last_name', public_users.last_name,
		'gender', public_users.gender,
		'is_owner', track_creators.is_owner
	--	'added_on', track_creators.created_at
	))) AS track_creators
	FROM contak.track_creators 
	LEFT JOIN public.public_users ON track_creators.creator_id = public_users.user_id
	WHERE track_creators.track_id = tracks.track_id AND track_creators.deleted_at > NOW()
) AS creators(track_creators) ON true
LEFT JOIN LATERAL (
	SELECT array_to_json(ARRAY_AGG(objects.name))
	FROM storage.objects 
	WHERE objects.bucket_id = 'tracks' AND objects.name LIKE tracks.track_id || '/%'
) AS audio(audio_files) ON true
WHERE auth.uid() IN (SELECT track_creators.creator_id FROM contak.track_creators WHERE track_creators.track_id = tracks.track_id);

GRANT SELECT ON public.my_tracks TO authenticated;

