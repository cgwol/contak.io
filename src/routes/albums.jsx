import { useRef, useState } from 'react';
import Navbar from "Components/navbar";
import { useLoaderData, useRevalidator } from 'react-router-dom';
import { Album } from '~/components/album';
import { supabase } from "~/global";
import { fetchSignedAlbumUrls } from "~/loaders/fetchSignedAlbumUrls";

export const loader = async () => {
    const { data: public_albums, error } = await supabase.from('public_albums').select().limit(30);
    if (error) {
        throw error;
    }

    const { albumCovers, trackFiles } = await fetchSignedAlbumUrls(public_albums);
    for (const album of public_albums) {
        album.signedUrls = albumCovers.get(album.album_id);
        if (Array.isArray(album.album_tracks)) {
            for (const track of album.album_tracks) {
                track.signedUrl = trackFiles.get(track.track_id);
            }
        }
    }
    return { public_albums };
}

export const Component = function Albums() {
    const { public_albums } = useLoaderData();
    return (
        <>
            <Navbar />
            <h1>Albums</h1>
            {
                Array.isArray(public_albums) &&
                <div>{
                    public_albums.map(album => <Album album={album} key={album.album_id} />)
                }</div>
            }
        </>
    );
}

export { default as ErrorBoundary } from 'Routes/error';
