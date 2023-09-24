import { fileSizes, supabase, toFileSize } from "~/global";

export const upsertTrackFile = async (track_id, track_file) => {
    const { data: storage, error: storageError } = await supabase.storage.from('tracks')
        .upload(`${track_id}/${track_file.name}`, track_file, { upsert: true });
    if (storageError) {
        throw storageError;
    }
    return storage;
}


export const addTrack = async (track_name, track_file) => {
    const maxTrackSize = 5 * fileSizes.MB;
    if (track_file.size >= maxTrackSize) {
        throw new Error(`Audio files cannot be larger than 5 MB, file was ${toFileSize(track_file.size)}`);
    }
    const { data: track, error } = await supabase.from('owned_tracks').insert({
        track_name
    }).select().maybeSingle();
    if (error) {
        throw error;
    }
    await upsertTrackFile(track.track_id, track_file);
    return track;
}

export const addTrackCreator = async (track_id, username, is_owner) => {
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
    const { data, error } = await supabase.from('track_creators').upsert({
        track_id,
        creator_id: user_id,
        is_owner,
        deleted_at: 'infinity',
    }, { onConflict: 'track_id,creator_id' });
    if (error) {
        throw error;
    }
    return data;
}

export const updateTrackName = async (track_id, track_name) => {
    const { data, error } = await supabase.from('owned_tracks').update({
        track_name,
    }).eq('track_id', track_id);
    if (error) {
        throw error;
    }
    return data;
}

export const deleteTrackFile = async (trackPath) => {
    const { data, error } = await supabase.storage.from('tracks').remove([trackPath]);
    if (error) {
        throw error;
    }
    return data;
}

export const deleteTrack = async (track_id) => {
    const { data, error } = await supabase.from('owned_tracks').delete()
        .eq('track_id', track_id);
    if (error) {
        throw error;
    }
    return data;
}

export const restoreTrack = async (track_id) => {
    const { data, error } = await supabase.from('owned_tracks').update({
        deleted_at: 'infinity'
    }).eq('track_id', track_id);
    if (error) {
        throw error;
    }
    return data;
}