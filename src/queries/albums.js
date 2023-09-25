import { supabase } from "~/global";
import { addTrack } from "~/queries/tracks";

export const createAlbum = async (album_name) => {
    if (!album_name) {
        throw new Error('Album name cannot be empty')
    }
    const { data, error } = await supabase.from('owned_albums').insert({ album_name });
    if (error) {
        throw error;
    }
    return data;
}

export const upsertAlbumCover = async (album_id, albumCover) => {
    const { data, error } = await supabase.storage.from('album_covers')
        .upload(`${album_id}/${albumCover.name}`, albumCover, { upsert: true });
    if (error) {
        throw error;
    }
    return data;
}

export const deleteAlbumCover = async (albumCoverPath) => {
    const { data, error } = await supabase.storage.from('album_covers')
        .remove([albumCoverPath]);
    if (error) {
        throw error;
    }
    return data;
}

export const updateAlbumName = async (album_id, album_name) => {
    const { data, error } = await supabase.from('owned_albums')
        .update({ album_name })
        .eq('album_id', album_id);
    if (error) {
        throw error;
    }
    return data;
}

export const deleteAlbum = async (album_id) => {
    const { data, error } = await supabase.from('owned_albums')
        .delete()
        .eq('album_id', album_id);
    if (error) {
        throw error;
    }
    return data;
}

export const restoreAlbum = async (album_id) => {
    const { data, error } = await supabase.from('owned_albums')
        .update({ deleted_at: 'infinity' })
        .eq('album_id', album_id);
    if (error) {
        throw error;
    }
    return data;
}

export const addAlbumCreator = async (album_id, username, isOwner) => {
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
        album_id,
        creator_id: user_id,
        is_owner: isOwner,
        deleted_at: 'infinity',
    }, { onConflict: 'album_id,creator_id' });
    if (error) {
        throw error;
    }
    return data;
}

export const addAlbumTrack = async (album_id, track_id) => {
    const { data, error } = await supabase.from('owned_album_tracks').upsert({
        album_id: album_id,
        track_id,
        deleted_at: 'infinity',
    }, { onConflict: 'album_id,track_id' });
    if (error) {
        throw error;
    }
    return data;
}

export const deleteAlbumTrack = async (album_id, track_id) => {
    const { data, error } = await supabase.from('owned_album_tracks').delete()
        .eq('track_id', track_id)
        .eq('album_id', album_id);
    if (error) {
        throw error;
    }
    return data;
}

export const addNewTrackToAlbum = async (album_id, trackName, trackFile) => {
    const track = await addTrack(trackName, trackFile);
    if (track && track.track_id) {
        return await addAlbumTrack(album_id, track.track_id);
    }
    throw new Error(`Could not add track "${trackName}" to album: ${track}`);
}

export const purchaseAlbum = async (album_id, user_id) => {
    const { data, error } = await supabase.from('purchased_albums').upsert({
        album_id: album_id,
        user_id: user_id
    }, { onConflict: 'album_id,user_id' });
    if (error) {
        throw error;
    }
    return data;
}

export const unPurchaseAlbum = async (album_id, user_id) => {
    const { data, error } = await supabase.from('purchased_albums')
        .delete()
        .eq('album_id', album_id)
        .eq('user_id', user_id);
    if (error) {
        throw error;
    }
    return data;
}