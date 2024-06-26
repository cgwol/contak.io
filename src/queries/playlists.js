import { supabase } from "~/global";
import { addTrack } from "~/queries/tracks";

export const createPlaylist = async (playlist_name) => {
    if (!playlist_name) {
        throw new Error('Album name cannot be empty')
    }
    const { data, error } = await supabase.from('owned_albums').insert({ album_name: playlist_name });
    if (error) {
        throw error;
    }
    return data;
}

export const upsertPlaylistCover = async (playlist_id, playlistCover) => {
    const { data, error } = await supabase.storage.from('album_covers')
        .upload(`${playlist_id}/${playlistCover.name}`, playlistCover, { upsert: true });
    if (error) {
        throw error;
    }
    return data;
}

export const deletePlaylistCover = async (playlistCoverPath) => {
    const { data, error } = await supabase.storage.from('album_covers')
        .remove([playlistCoverPath]);
    if (error) {
        throw error;
    }
    return data;
}

export const updatePlaylistName = async (playlist_id, playlist_name) => {
    const { data, error } = await supabase.from('owned_albums')
        .update({ playlist_name })
        .eq('album_id', playlist_id);
    if (error) {
        throw error;
    }
    return data;
}

export const deletePlaylist = async (playlist_id) => {
    const { data, error } = await supabase.from('owned_albums')
        .delete()
        .eq('album_id', playlist_id);
    if (error) {
        throw error;
    }
    return data;
}

export const restorePlaylist = async (playlist_id) => {
    const { data, error } = await supabase.from('owned_albums')
        .update({ deleted_at: 'infinity' })
        .eq('album_id', playlist_id);
    if (error) {
        throw error;
    }
    return data;
}

export const addPlaylistCreator = async (playlist_id, username, isOwner) => {
    const { data: user, error: userError } = await supabase.from('public_users')
        .select('user_type, user_id')
        .eq('username', username)
        .maybeSingle();
    if (userError) {
        throw userError;
    }
    if (!user) {
        throw new Error(`Cannot find user "${username}"`);
    }
    const { user_type, user_id } = user;
    if (user_type !== 'Creator') {
        throw new Error(`User ${username} is not a Creator`);
    }
    const { data, error } = await supabase.from('album_creators').upsert({
        album_id: playlist_id,
        creator_id: user_id,
        is_owner: isOwner,
        deleted_at: 'infinity',
    }, { onConflict: 'album_id,creator_id' });
    if (error) {
        throw error;
    }
    return data;
}

export const addPlaylistTrack = async (playlist_id, track_id) => {
    const { data, error } = await supabase.from('owned_album_tracks').upsert({
        album_id: playlist_id,
        track_id,
        deleted_at: 'infinity',
    }, { onConflict: 'album_id,track_id' });
    if (error) {
        throw error;
    }
    return data;
}

export const deletePlaylistTrack = async (playlist_id, track_id) => {
    const { data, error } = await supabase.from('owned_album_tracks').delete()
        .eq('track_id', track_id)
        .eq('album_id', playlist_id);
    if (error) {
        throw error;
    }
    return data;
}

export const addNewTrackToPlaylist = async (playlist_id, trackName, trackFile) => {
    const track = await addTrack(trackName, trackFile);
    if (track && track.track_id) {
        return await addPlaylistTrack(playlist_id, track.track_id);
    }
    throw new Error(`Could not add track "${trackName}" to playlist: ${track}`);
}

export const purchasePlaylist = async (playlist_id, user_id) => {
    const { data, error } = await supabase.from('purchased_albums').upsert({
        album_id: playlist_id,
        user_id: user_id
    }, { onConflict: 'album_id,user_id' });
    if (error) {
        throw error;
    }
    return data;
}

export const unPurchasePlaylist = async (playlist_id, user_id) => {
    const { data, error } = await supabase.from('purchased_albums')
        .delete()
        .eq('album_id', playlist_id)
        .eq('user_id', user_id);
    if (error) {
        throw error;
    }
    return data;
}