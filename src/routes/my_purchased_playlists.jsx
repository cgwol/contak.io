import { useRef, useState } from 'react';
import { useLoaderData, useRevalidator } from 'react-router-dom';
import { Playlist } from '~/components/playlist';
import Navbar from '~/components/navbar';
import { supabase } from '~/global';
import { fetchSignedPlaylistUrls } from '~/loaders/fetchSignedPlaylistUrls';

export { default as ErrorBoundary } from 'Routes/error';

export const loader = async () => {
    const { data: my_profile, error: profileError } = await supabase.from('my_profile').select().maybeSingle();
    if (profileError) {
        throw profileError;
    }

    const { data: my_purchased_playlists, error } = await supabase.from('my_purchased_albums').select().limit(30);
    if (error) {
        throw error;
    }

    const { playlistCovers, trackFiles } = await fetchSignedPlaylistUrls(my_purchased_playlists);
    for (const playlist of my_purchased_playlists) {
        playlist.signedUrls = playlistCovers.get(playlist.playlist_id);
        if (Array.isArray(playlist.album_tracks)) {
            for (const track of playlist.album_tracks) {
                track.signedUrl = trackFiles.get(track.track_id);
            }
        }
    }
    return { my_purchased_playlists, my_profile };
};

export const Component = function MyPurchasedPlaylists() {
    const { my_purchased_playlists, my_profile } = useLoaderData();
    return (<>
        <Navbar />
        <h1>My Purchased Playlists</h1>
        {
            Array.isArray(my_purchased_playlists) && my_purchased_playlists.length > 0 ? (
            <div>{
                my_purchased_playlists.map(playlist => <Playlist playlist={playlist} key={playlist.album_id} />)
            }</div>) : (
                <div>Nothing!</div>
            )
        }
    </>)
}
