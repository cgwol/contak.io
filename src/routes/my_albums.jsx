import { useRef, useState } from 'react';
import { useLoaderData, useRevalidator } from 'react-router-dom';
import { Album } from '~/components/album';
import Navbar from '~/components/navbar';
import { supabase } from '~/global';
import { fetchSignedAlbumUrls } from '~/loaders/fetchSignedAlbumUrls';

export { default as ErrorBoundary } from 'Routes/error';

export const loader = async () => {
    const { data: my_profile, error: profileError } = await supabase.from('my_profile').select().maybeSingle();
    if (profileError) {
        throw profileError;
    }
    if (my_profile.user_type !== 'Creator') {
        throw new Error('Access Denied: Only Creators can access this page');
    }


    const { data: my_albums, error } = await supabase.from('my_albums').select().limit(30);
    if (error) {
        throw error;
    }

    const { albumCovers, trackFiles } = await fetchSignedAlbumUrls(my_albums);
    for (const album of my_albums) {
        album.signedUrls = albumCovers.get(album.album_id);
        if (Array.isArray(album.album_tracks)) {
            for (const track of album.album_tracks) {
                track.signedUrl = trackFiles.get(track.track_id);
            }
        }
    }
    return { my_albums, my_profile };
};

export const Component = function MyAlbums() {
    const { my_albums, my_profile } = useLoaderData();
    const revalidator = useRevalidator();
    const albumNameRef = useRef(null);
    const [isAddPopupVisible, setIsAddPopupVisible] = useState(false);
    const showPopup = () => setIsAddPopupVisible(true);
    const hidePopup = () => setIsAddPopupVisible(false);
    const createAlbum = async () => {
        const album_name = albumNameRef.current.value;
        if (!album_name) {
            throw new Error('Album name cannot be empty')
        }
        const { data, error } = await supabase.from('owned_albums').insert({ album_name });
        if (error) {
            throw error;
        }
        revalidator.revalidate();
        albumNameRef.current.value = '';
    }
    const onCreateAlbum = (e) => {
        e.preventDefault();
        createAlbum().then(hidePopup);
    }
    return (<>
        <Navbar />
        <div className={`absolute-fill flex-center bg-neutral-800 ${isAddPopupVisible ? '' : 'hidden'}`} style={{ zIndex: 999, opacity: .8 }}>
            <form onSubmit={onCreateAlbum}>
                <button onClick={hidePopup} style={{ float: 'right' }} type='button'>Cancel</button>
                <h4>New Album</h4>
                <div>
                    <input type="text" placeholder='album name...' ref={albumNameRef} required></input>
                </div>
                <button type='submit'>Create</button>
            </form>
        </div>
        <h1>My Albums</h1>
        <button onClick={showPopup}>Add Album</button>
        {
            Array.isArray(my_albums) &&
            <div>{
                my_albums.map(album => <Album album={album} key={album.album_id} />)
            }</div>
        }
    </>)
}
