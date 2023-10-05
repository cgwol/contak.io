import { useRef, useState } from 'react';
import { useLoaderData, useRevalidator } from 'react-router-dom';
import { Playlist } from '~/components/playlist';
import Navbar from '~/components/navbar';
import { supabase } from '~/global';
import { fetchSignedPlaylistUrls } from '~/loaders/fetchSignedPlaylistUrls';
import { createPlaylist } from '~/queries/playlists';

export { default as ErrorBoundary } from 'Routes/error';

export const loader = async () => {
    const { data: my_profile, error: profileError } = await supabase.from('my_profile').select().maybeSingle();
    if (profileError) {
        throw profileError;
    }
    if (my_profile.user_type !== 'Creator') {
        throw new Error('Access Denied: Only Creators can access this page');
    }


    const { data: my_playlists, error } = await supabase.from('my_albums').select().limit(30);
    if (error) {
        throw error;
    }

    const { playlistCovers, trackFiles } = await fetchSignedPlaylistUrls(my_playlists);
    for (const playlist of my_playlists) {
        playlist.signedUrls = playlistCovers.get(playlist.playlist_id);
        if (Array.isArray(playlist.album_tracks)) {
            for (const track of playlist.album_tracks) {
                track.signedUrl = trackFiles.get(track.track_id);
            }
        }
    }
    return { my_playlists, my_profile };
};

export const Component = function MyPlaylists() {
    const { my_playlists, my_profile } = useLoaderData();
    const revalidator = useRevalidator();
    const playlistNameRef = useRef(null);
    const [isAddPopupVisible, setIsAddPopupVisible] = useState(false);
    const showPopup = () => setIsAddPopupVisible(true);
    const hidePopup = () => setIsAddPopupVisible(false);
    const onCreatePlaylist = (e) => {
        e.preventDefault();
        const playlist_name = playlistNameRef.current.value;
        createPlaylist(playlist_name).then(() => {
            hidePopup();
            revalidator.revalidate();
            playlistNameRef.current.value = '';
        });
    }
    return (<>
        <Navbar />
        <div className={`absolute-fill flex-center bg-neutral-800 ${isAddPopupVisible ? '' : 'hidden'}`} style={{ zIndex: 999, opacity: .8 }}>
            <form onSubmit={onCreatePlaylist}>
                <button onClick={hidePopup} style={{ float: 'right' }} type='button'>Cancel</button>
                <h4>New Playlist</h4>
                <div>
                    <input type="text" placeholder='playlist name...' ref={playlistNameRef} required></input>
                </div>
                <button type='submit'>Create</button>
            </form>
        </div>
        <h1>My Playlists</h1>
        <button onClick={showPopup}>Add Playlist</button>
        {
            Array.isArray(my_playlists) &&
            <div>{
                my_playlists.map(playlist => <Playlist playlist={playlist} key={playlist.album_id} />)
            }</div>
        }
    </>)
}
