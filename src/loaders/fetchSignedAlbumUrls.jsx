import { supabase } from "~/global";

const getSignedTrackUrls = async (album_tracks) => {
    const filtered = album_tracks.map(track => track.audio_files?.[0]).filter(file => file);
    if (!filtered.length) {
        return { signedUrls: [], type: 'tracks' };
    }
    const { data, error } = await supabase.storage.from('tracks')
        .createSignedUrls(filtered, 60 * 5);
    if (error) {
        throw error;
    }
    return {
        signedUrls: data,
        type: 'tracks'
    };
};

const getSignedAlbumCoverUrls = async (album) => {
    const { data, error } = await supabase.storage.from('album_covers').createSignedUrls(album.album_covers, 60 * 5);
    if (error) {
        throw error;
    }
    return {
        signedUrls: data,
        album_id: album.album_id
    };
}

export const fetchSignedAlbumUrls = async (albums) => {
    //TODO: Fetch all signed urls lazily (eg. only when image in view or audio is played)
    //Currently fetches all signed urls concurrently
    const promises = [];
    for (const album of albums) {
        promises.push(getSignedAlbumCoverUrls(album));
        if (Array.isArray(album.album_tracks) && album.album_tracks.length) {
            promises.push(getSignedTrackUrls(album.album_tracks));
        }
    }
    const settledPromises = await Promise.allSettled(promises);

    //Join out of order promises with original data 
    const albumCovers = new Map();
    const trackFiles = new Map();
    for (const promise of settledPromises) {
        if (promise.status !== 'fulfilled') {
            console.warn(`Error loading signed resource urls: ${promise.reason}`);
            continue;
        }
        if ('album_id' in promise.value) {
            const { album_id, signedUrls } = promise.value;
            const urls = albumCovers.get(album_id);
            if (Array.isArray(urls)) {
                for (const signedUrl of signedUrls) {
                    urls.push(signedUrl);
                }
            } else {
                albumCovers.set(album_id, signedUrls ?? []);
            }
        }
        else if (promise.value.type === 'tracks') {
            const signedUrls = promise.value.signedUrls;
            for (const url of signedUrls) {
                const search = '/object/sign/tracks/';
                const track_index = url.signedUrl.indexOf(search) + search.length;
                //Storage API does not return path property in localhost, use this hack to get track_id
                const track_id = +url.signedUrl.substring(track_index, url.signedUrl.indexOf('/', track_index));
                // const track_id = +url.path.substring(0, url.path.indexOf('/'));
                trackFiles.set(track_id, url.signedUrl);
            }
        }
        else {
            throw new Error(`Unknown resolved promise ${promise}`);
        }
    }
    return { albumCovers, trackFiles };
}
