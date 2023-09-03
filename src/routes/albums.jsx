import Navbar from "Components/navbar";
import { useLoaderData } from "react-router-dom";
import { AlbumTrack } from "~/components/albumTrack";
import { supabase } from "~/global";
import { fetchSignedAlbumUrls } from "~/loaders/fetchSignedAlbumUrls";

export const loader = async () => {
    const { data, error } = await supabase.from('public_albums').select().limit(30);
    if (error) {
        throw error;
    }

    const { albumCovers, trackFiles } = await fetchSignedAlbumUrls(data);
    for (const album of data) {
        album.signedUrls = albumCovers.get(album.album_id);
        if (Array.isArray(album.album_tracks)) {
            for (const track of album.album_tracks) {
                track.signedUrl = trackFiles.get(track.track_id);
            }
        }
    }
    return data;
}

//TODO: Make prettier
export const Component = function Albums() {
    const albums = useLoaderData();
    console.log(albums);
    return (
        <>
            <Navbar />
            <h1>Albums</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', margin: '2em 3em', gap: '1.5em' }}>
                {albums.map(album => {
                    const { album_id, album_name, album_creators, album_tracks, signedUrls } = album;
                    const album_creator_names = album_creators.map(creator =>
                        `${creator.first_name} ${creator.last_name}`).join(', ');
                    const tracks = album_tracks?.map(track =>
                        <AlbumTrack key={track.track_id} track={track} />);
                    return (
                        <div className="flex-center" key={album_id}>
                            {(signedUrls && signedUrls.length) && (
                                <img src={signedUrls[0].signedUrl} alt={`album cover for ${album_name}`}></img>
                                //TODO: show edit button for owned albums on hover
                            )}
                            <h2 key={album_id} className="fs-m">{album_name} By {album_creator_names}
                                <ol className="fs-s ta-center" style={{ margin: '0 auto', width: 'fit-content' }}>
                                    {album_tracks && tracks}
                                </ol>
                            </h2>
                        </div>
                    );
                })}
            </div>
        </>
    );
}

export { default as ErrorBoundary } from 'Routes/error';
