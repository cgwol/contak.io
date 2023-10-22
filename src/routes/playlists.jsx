import { useRef, useState } from 'react';
import Navbar from "Components/navbar";
import { useLoaderData, useRevalidator } from 'react-router-dom';
import { Playlist } from '~/components/playlist';
import { supabase } from "~/global";
import { fetchSignedPlaylistUrls } from "~/loaders/fetchSignedPlaylistUrls";

export const loader = async () => {
    const { data: public_playlists, error } = await supabase.from('public_albums').select().limit(30);
    if (error) {
        throw error;
    }

    const { playlistCovers, trackFiles } = await fetchSignedPlaylistUrls(public_playlists);
    for (const playlist of public_playlists) {
        playlist.signedUrls = playlistCovers.get(playlist.playlist_id);
        if (Array.isArray(playlist.album_tracks)) {
            for (const track of playlist.album_tracks) {
                track.signedUrl = trackFiles.get(track.track_id);
            }
        }
    }
    return { public_playlists };
}

export const Component = function Playlists() {
    const { public_playlists } = useLoaderData();
    return (
        <>
            <Navbar />
            <h1>Playlists</h1>
            {
                Array.isArray(public_playlists) &&
                <div>{
                    public_playlists.map(playlist => <Playlist playlist={playlist} key={playlist.album_id} />)
                }</div>
            }
        </>
    );
}

export { default as ErrorBoundary } from 'Routes/error';