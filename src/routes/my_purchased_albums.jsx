import { useRef, useState } from 'react';
import { useLoaderData, useRevalidator } from 'react-router-dom';
import { Album } from '~/components/album';
import Navbar from '~/components/navbar';
import { supabase } from '~/global';
import { fetchSignedAlbumUrls } from '~/loaders/fetchSignedAlbumUrls';
import { createAlbum } from '~/queries/albums';

export { default as ErrorBoundary } from 'Routes/error';

export const loader = async () => {
    const { data: my_profile, error: profileError } = await supabase.from('my_profile').select().maybeSingle();
    if (profileError) {
        throw profileError;
    }

    const { data: my_purchased_albums, error } = await supabase.from('my_purchased_albums').select().limit(30);
    if (error) {
        throw error;
    }

    const { albumCovers, trackFiles } = await fetchSignedAlbumUrls(my_purchased_albums);
    for (const album of my_purchased_albums) {
        album.signedUrls = albumCovers.get(album.album_id);
        if (Array.isArray(album.album_tracks)) {
            for (const track of album.album_tracks) {
                track.signedUrl = trackFiles.get(track.track_id);
            }
        }
    }
    return { my_purchased_albums, my_profile };
};

export const Component = function MyPurchasedAlbums() {
    const { my_purchased_albums, my_profile } = useLoaderData();

    // Step 1: Add state for search query
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <>
            <Navbar />
            <h1>My Purchased Albums</h1>

            {/* Step 2: Create an input element for search */}
            <input
                type="text"
                placeholder="Search albums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />

            {
                Array.isArray(my_purchased_albums) && my_purchased_albums.length > 0 ? (
                    <div>
                        {
                            // Step 3: Filter albums based on search query
                            my_purchased_albums
                                .filter((album) =>
                                    album.album_title.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                .map((album) => <Album album={album} key={album.album_id} />)
                        }
                    </div>
                ) : (
                    <div>Nothing!</div>
                )
            }
        </>
    );
};
