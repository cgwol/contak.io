import { useEffect, useRef, useState } from "react";
import { useRevalidator } from "react-router-dom";
import { AlbumTrack } from "~/components/albumTrack";
import { supabase } from "~/global";


export function Album({ album }) {
    const albumNameRef = useRef(null);
    const albumCoverRef = useRef(null);
    const creatorUsernameRef = useRef(null);
    const isOwnerRef = useRef(null);
    const trackNameRef = useRef(null);
    const trackFileRef = useRef(null);
    const editTrackNameRef = useRef(null);
    const trackCreatorUsernameRef = useRef(null);
    const editTrackFileRef = useRef(null);
    const isTrackOwnerRef = useRef(null);
    const [ownedTracks, setOwnedTracks] = useState(null);
    const [ownedTracksLoading, setOwnedTracksLoading] = useState(true);
    const [selectedTrackIndex, setSelectedTrackIndex] = useState(null);

    useEffect(() => {
        const getData = async () => {
            const { data, error } = await supabase.from('my_tracks').select();
            if (error) {
                throw error;
            }
            setOwnedTracks(data);
        }

        getData().finally(() => setOwnedTracksLoading(false));
    }, [album])

    const revalidator = useRevalidator();
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const showPopup = () => setIsPopupVisible(true);
    const hidePopup = () => setIsPopupVisible(false);
    const upsertAlbumCover = async (albumCover) => {
        const { data, error } = await supabase.storage.from('album_covers')
            .upload(`${album.album_id}/${albumCover.name}`, albumCover, { upsert: true });
        if (error) {
            throw error;
        }
        return data;
    }
    const deleteAlbumCover = async (albumCover) => {
        const path = albumCover && album.album_covers.find(cover => cover.endsWith('/' + albumCover.name))
            || album.album_covers[0];
        if (!path) {
            throw new Error(`Cannot delete '${albumCover.name}' because it does not exists`);
        }
        const { data, error } = await supabase.storage.from('album_covers')
            .remove([path]);
        if (error) {
            throw error;
        }
        return data;
    }
    const updateAlbumName = async (album_name) => {
        const { data, error } = await supabase.from('owned_albums').update({ album_name }).eq('album_id', album.album_id);
        if (error) {
            throw error;
        }
        return data;
    }
    const deleteAlbum = async () => {
        const { data, error } = await supabase.from('owned_albums').delete()
            .eq('album_id', album.album_id);
        if (error) {
            throw error;
        }
        return data;
    }
    const restoreAlbum = async () => {
        const { data, error } = await supabase.from('owned_albums').update({ deleted_at: 'infinity' })
            .eq('album_id', album.album_id);
        if (error) {
            throw error;
        }
        return data;
    }
    const addAlbumCreator = async (username, isOwner) => {
        const { data: user, error: userError } = await supabase.from('public_users')
            .select('user_type, user_id').eq('username', username).maybeSingle();
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
            album_id: album.album_id,
            creator_id: user_id,
            is_owner: isOwner,
            deleted_at: 'infinity',
        }, { onConflict: 'album_id,creator_id' });
        if (error) {
            throw error;
        }
        return data;
    }
    const addAlbumTrack = async (track_id) => {
        const { data, error } = await supabase.from('owned_album_tracks').upsert({
            album_id: album.album_id,
            track_id,
            deleted_at: 'infinity',
        }, { onConflict: 'album_id,track_id' });
        if (error) {
            throw error;
        }
        return data;
    }
    const deleteAlbumTrack = async (track_id) => {
        const { data, error } = await supabase.from('owned_album_tracks').delete()
            .eq('track_id', track_id)
            .eq('album_id', album.album_id);
        if (error) {
            throw error;
        }
        return data;
    }
    const upsertTrackFile = async (track_id, track_file) => {
        const { data: storage, error: storageError } = await supabase.storage.from('tracks')
            .upload(`${track_id}/${track_file.name}`, track_file, { upsert: true });
        if (storageError) {
            throw storageError;
        }
        return storage;
    }
    const deleteTrackFile = async (trackPath) => {
        const { data, error } = await supabase.storage.from('tracks').remove([trackPath]);
        if (error) {
            throw error;
        }
        return data;
    }
    const addTrack = async (track_name, track_file) => {
        const { data: track, error } = await supabase.from('owned_tracks').insert({
            track_name
        }).select().maybeSingle();
        if (error) {
            throw error;
        }
        await upsertTrackFile(track.track_id, track_file);
        return track;
    }
    const deleteTrack = async (track_id) => {
        const { data, error } = await supabase.from('owned_tracks').delete()
            .eq('track_id', track_id);
        if (error) {
            throw error;
        }
        return data;
    }
    const restoreTrack = async (track_id) => {
        const { data, error } = await supabase.from('owned_tracks').update({
            deleted_at: 'infinity'
        }).eq('track_id', track_id);
        if (error) {
            throw error;
        }
        return data;
    }
    const addNewTrackToAlbum = async (trackName, trackFile) => {
        const track = await addTrack(trackName, trackFile);
        if (track && track.track_id) {
            return await addAlbumTrack(track.track_id);
        }
        throw new Error(`Could not add track "${trackName}" to album: ${track}`);
    }
    const addTrackCreator = async (track_id, username, is_owner) => {
        const { data: user, error: userError } = await supabase.from('public_users')
            .select('user_type, user_id').eq('username', username).maybeSingle();
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
    const updateTrackName = async (track_id, track_name) => {
        const { data, error } = await supabase.from('owned_tracks').update({
            track_name,
        }).eq('track_id', track_id);
        if (error) {
            throw error;
        }
        return data;
    }


    const onEditAlbum = (e) => {
        e.preventDefault();
        const promises = [];
        const albumName = albumNameRef.current.value;
        if (albumName !== album.album_name) {
            promises.push(updateAlbumName(albumName));
        }

        const albumCover = albumCoverRef.current.files[0];
        if (albumCover) {
            promises.push(upsertAlbumCover(albumCover));
        }
        if (promises.length) {
            Promise.all(promises)
                .then(() => revalidator.revalidate())
                .finally(hidePopup)
        }
    }
    const onDeleteAlbumCover = () => {
        const albumCover = albumCoverRef.current.files[0];
        deleteAlbumCover(albumCover).then(() => {
            revalidator.revalidate();
        }).finally(hidePopup);
    }
    const onDeleteAlbum = () => {
        deleteAlbum().then(() => {
            revalidator.revalidate();
        }).finally(hidePopup);
    }
    const onRestoreAlbum = () => {
        restoreAlbum().then(() => {
            revalidator.revalidate();
        })
    }
    const onAddCreator = () => {
        const username = creatorUsernameRef.current.value;
        const isOwner = isOwnerRef.current.checked;
        if (!username) {
            return;
        }
        addAlbumCreator(username, isOwner).then(() => {
            revalidator.revalidate();
        });
    }
    const onAddNewTrackToAlbum = (e) => {
        e.preventDefault();
        const trackName = trackNameRef.current.value;
        const trackFile = trackFileRef.current.files[0];
        if (!trackName) {
            throw new Error('Track name is required!');
        }
        if (!trackFile) {
            throw new Error('Audio track is required for new tracks');
        }
        addNewTrackToAlbum(trackName, trackFile).then(() => {
            revalidator.revalidate();
        });
    }
    const onAddAlbumTrack = (e) => {
        const trackID = e.target.name;
        if (!trackID) {
            throw new Error(`Track ID is required for a track to be added to an album`);
        }
        addAlbumTrack(trackID).then(() => {
            revalidator.revalidate();
        });
    }
    const onDeleteAlbumTrack = (e) => {
        const track_id = e.target.name;
        if (!track_id) {
            throw new Error(`Cannot delete album track without providing a track ID`);
        }
        deleteAlbumTrack(track_id).then(() => {
            revalidator.revalidate();
        });
    }
    const onDeleteTrack = (e) => {
        const track_id = e.target.name;
        if (!track_id) {
            throw new Error(`Cannot delete album track without providing a track ID`);
        }
        deleteTrack(track_id).then(() => {
            revalidator.revalidate();
        })
    }
    const onRestoreTrack = (e) => {
        const track_id = e.target.name;
        if (!track_id) {
            throw new Error(`Cannot delete album track without providing a track ID`);
        }
        restoreTrack(track_id).then(() => {
            revalidator.revalidate();
        })
    }
    const onAddTrackCreator = (e) => {
        const track_id = e.target.name;
        const username = trackCreatorUsernameRef.current.value;
        const isOwner = isTrackOwnerRef.current.checked;
        if (!track_id || !username) {
            return;
        }
        addTrackCreator(track_id, username, isOwner).then(() => {
            revalidator.revalidate();
        })
    }
    const onEditTrack = (e) => {
        e.preventDefault();
        const track_id = e.target.name;
        const track_name = editTrackNameRef.current.value;
        const trackFile = editTrackFileRef.current.files[0];
        if (!track_id) {
            throw new Error(`Track ID is required to update track "${track_id}"`);
        }
        const promises = [];
        if (track_name) {
            promises.push(updateTrackName(track_id, track_name));
        }
        if (trackFile) {
            promises.push(upsertTrackFile(track_id, trackFile));
        }
        if (promises.length) {
            Promise.all(promises).then(() => {
                revalidator.revalidate();
            });
        }
    }
    const onDeleteTrackFile = (e) => {
        const trackPath = e.target.name;
        if (!trackPath) {
            throw new Error(`Path to track is required to delete file: ${trackPath}`);
        }
        const [track_id, file_name] = trackPath.split('/');
        if (isNaN(+track_id) || !file_name) {
            throw new Error(`Invalid virtual track path "${trackPath}"`);
        }
        deleteTrackFile(trackPath).then(() => {
            revalidator.revalidate();
        })
    }

    const { album_id, album_name, signedUrls, album_creators, album_tracks, deleted_at } = album;
    const hasAlbumCover = signedUrls && signedUrls.length;
    // deleted_at can be set ahead a few seconds by database on delete. this accounts for that.
    const now = Date.now() + (2 * 1000);
    const isDeleted = new Date(deleted_at) <= now;
    return (<>
        <div className={`absolute-fill flex-center flex-column ${isPopupVisible ? '' : 'hidden'}`} style={{ zIndex: 999, backgroundColor: 'rgba(0,0,0,0.8)', rowGap: '1em', overflowY: 'scroll', }} onClick={hidePopup}>
            <form onSubmit={onEditAlbum} onClick={(e) => { e.stopPropagation() }}
                className="bg-neutral-700 br-100" style={{ padding: '1.25em' }}>
                <button onClick={hidePopup} style={{ float: 'right' }} type='button'>Cancel</button>
                <h3>Edit Album</h3>
                <div className="flex-column gap-s" >
                    <div>
                        <h5>Album Name</h5>
                        <div>
                            <input type="text" placeholder='album name...' required
                                ref={albumNameRef} defaultValue={album_name}></input>
                        </div>
                    </div>
                    <div>
                        <h5>Album Cover</h5>
                        <div>
                            <input type="file" accept="image/*" placeholder='Choose Image'
                                ref={albumCoverRef} src={hasAlbumCover && signedUrls[0].signedUrl}></input>
                            {hasAlbumCover && <button onClick={onDeleteAlbumCover}>Delete Image</button>}
                        </div>
                    </div>
                    {Array.isArray(album_creators) && <div>
                        <h5>Album Creators</h5>
                        <div>
                            {album_creators.map(creator => {
                                const { creator_id, first_name, last_name, is_owner } = creator;
                                const onDeleteAlbumCreator = () => {
                                    supabase.from('album_creators').delete()
                                        .eq('album_id', album.album_id)
                                        .eq('creator_id', creator_id).then(({ data, error }) => {
                                            if (error) {
                                                throw error;
                                            }
                                            revalidator.revalidate();
                                        });
                                }
                                return (
                                    <div key={creator_id} className="fs-xxs grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                                        <p>{`${first_name} ${last_name}`}</p>
                                        <p className="fs-xxs">{is_owner ? 'Owner' : 'Creator'}</p>
                                        <button disabled={is_owner} onClick={onDeleteAlbumCreator}>Remove</button>
                                    </div>
                                )
                            })}
                            <div className="fs-xxs grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                                <input contentEditable ref={creatorUsernameRef} placeholder="username..."
                                    style={{ marginRight: '1em' }}></input>
                                <div>
                                    <p style={{ display: 'inline', marginRight: '.5em' }}>Is Owner</p>
                                    <input type="checkbox" ref={isOwnerRef}></input>
                                </div>
                                <button onClick={onAddCreator}>Add Creator</button>
                            </div>
                        </div>
                    </div>}
                    <div className="flex-center gap-xl" style={{ marginTop: '1em' }}>
                        <button type='submit'>Update Album</button>
                        <button type="button" onClick={onDeleteAlbum}>Delete Album</button>
                    </div>
                </div>
            </form>
            <form onSubmit={onAddNewTrackToAlbum} onClick={(e) => { e.stopPropagation() }}
                className="bg-neutral-700 br-100" style={{ padding: '1.25em' }}>
                <h3>Add New Track</h3>
                <div className="flex-column gap-s" >
                    <div>
                        <h5>Track Name</h5>
                        <div>
                            <input type="text" placeholder='track name...' required
                                ref={trackNameRef} defaultValue={''}></input>
                        </div>
                    </div>
                    <div>
                        <h5>Audio File</h5>
                        <div>
                            <input type="file" accept="audio/*" ref={trackFileRef}></input>
                        </div>
                    </div>
                    <div>
                        <button type="submit">Add Track to Album</button>
                    </div>
                </div>
            </form>
            <div onClick={(e) => { e.stopPropagation() }}
                className="bg-neutral-700 br-100" style={{ padding: '1.25em', margin: '0 1em', }}>
                <h5>Owned Tracks</h5>
                <div style={{ maxHeight: '300px', overflowY: 'scroll' }}>
                    {!ownedTracksLoading && ownedTracks && ownedTracks?.map((track, index) => {
                        const { track_id, track_name, track_creators, audio_files, deleted_at } = track;
                        const isOnAlbum = album_tracks?.find(album_track =>
                            album_track.track_id === track_id) != null;
                        const isTrackDeleted = new Date(deleted_at) <= (Date.now() + (2 * 1000));
                        return (
                            <div key={track_id} className="grid"
                                onClick={(e) => setSelectedTrackIndex(index)}
                                style={{ gridTemplateColumns: `1fr 1fr 1fr ${isTrackDeleted ? '2fr' : '1fr 1fr'}`, cursor: 'pointer', columnGap: '1em' }} >
                                <p>{track_name}</p>
                                <p>{track_creators.map(creator =>
                                    `${creator.first_name} ${creator.last_name}`).join(', ')}</p>
                                <p>{audio_files?.[0]}</p>
                                {isTrackDeleted ? (
                                    <button type="button" onClick={onRestoreTrack}
                                        name={track_id}>Restore Track</button>
                                ) : (<>
                                    {isOnAlbum ? (
                                        <button type="button" onClick={onDeleteAlbumTrack}
                                            name={track_id}>Remove From Album</button>
                                    ) : (
                                        <button type="button" onClick={onAddAlbumTrack}
                                            name={track_id}>Add to Album</button>
                                    )}
                                    <button type="button" onClick={onDeleteTrack}
                                        name={track_id}>Delete Track</button>
                                </>)}
                            </div>
                        )
                    })}
                </div>
            </div>
            {selectedTrackIndex >= 0 && selectedTrackIndex != null && ownedTracks && (() => {
                const { track_id, track_name, track_creators, deleted_at, audio_files } = ownedTracks[selectedTrackIndex];
                const isTrackDeleted = new Date(deleted_at) <= (Date.now() + (2 * 1000));
                const hasAudioFiles = Array.isArray(audio_files) && audio_files.length > 0;
                return (<>
                    <form name={track_id} onSubmit={onEditTrack} onClick={(e) => { e.stopPropagation() }}
                        style={{ margin: '2em 0' }}>
                        <button onClick={() => setSelectedTrackIndex(null)} style={{ float: 'right' }} type='button'>Cancel</button>
                        <h3>Edit Track</h3>
                        <div className="flex-column gap-s">
                            <div>
                                <h5>Track Name</h5>
                                <div>
                                    <input type="text" placeholder='track name...'
                                        ref={editTrackNameRef} defaultValue={track_name}></input>
                                </div>
                            </div>
                            <div>
                                <h5>Audio File</h5>
                                <div>
                                    <input type="file" accept="audio/*"
                                        ref={editTrackFileRef}></input>
                                    {hasAudioFiles &&
                                        <button type="button" onClick={onDeleteTrackFile} name={audio_files[0]}>Delete File</button>}
                                </div>
                            </div>
                            {Array.isArray(track_creators) && <div>
                                <h5>Track Creators</h5>
                                <div>
                                    {track_creators.map(creator => {
                                        const { creator_id, first_name, last_name, is_owner } = creator;
                                        const onDeleteTrackCreator = () => {
                                            supabase.from('track_creators').delete()
                                                .eq('track_id', track_id)
                                                .eq('creator_id', creator_id).then(({ data, error }) => {
                                                    if (error) {
                                                        throw error;
                                                    }
                                                    revalidator.revalidate();
                                                });
                                        }
                                        return <div key={creator_id} className="fs-xxs grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                                            <p>{`${first_name} ${last_name}`}</p>
                                            <p className="fs-xxs">{is_owner ? 'Owner' : 'Creator'}</p>
                                            <button type="button" disabled={is_owner} onClick={onDeleteTrackCreator}>Remove Track Creator</button>
                                        </div>
                                    })}
                                    <div className="fs-xxs grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                                        <input contentEditable ref={trackCreatorUsernameRef} placeholder="username..."
                                            style={{ marginRight: '1em' }}></input>
                                        <div>
                                            <p style={{ display: 'inline', marginRight: '.5em' }}>Is Owner</p>
                                            <input type="checkbox" ref={isTrackOwnerRef}></input>
                                        </div>
                                        <button type="button" onClick={onAddTrackCreator} name={track_id}>Add Track Creator</button>
                                    </div>
                                </div>
                            </div>}
                            {isTrackDeleted ? (
                                <button type="button" onClick={onRestoreTrack}
                                    name={track_id}>Restore Track</button>
                            ) : (
                                <div className="flex-center gap-xl" style={{ marginTop: '1em' }}>
                                    <button type='submit'>Update Track</button>
                                    <button type="button" onClick={onDeleteTrack}
                                        name={track_id}>Delete Track</button>
                                </div>
                            )}
                        </div>
                    </form >
                </>)
            })()}
            <div onClick={(e) => { e.stopPropagation() }}
                className="bg-neutral-700 br-100" style={{ padding: '1.25em' }}>
                <h4>Album Tracks</h4>
                <div style={{ maxHeight: '100px', overflowY: 'scroll' }}>
                    {Array.isArray(album_tracks) && album_tracks.length > 0 ? (<>
                        {album_tracks?.map(track => {
                            return <AlbumTrack key={track.track_id} track={track} />
                        })}
                    </>)
                        : <p>None</p>}
                </div>
            </div>
        </div >
        <div className="flex bg-neutral-800" style={{ flexWrap: 'wrap' }}>
            <div className="bg-neutral-800" style={{ padding: '2em', flexBasis: '30%', cursor: 'pointer' }}
                onClick={isDeleted ? onRestoreAlbum : showPopup}>
                <p>{isDeleted ? 'Deleted' : ''}</p>
                {hasAlbumCover && <img src={signedUrls[0].signedUrl} alt={`album cover`}></img>}
                <p className="fs-s">{album_name}</p>
                <p className="fs-xs">{
                    album_creators?.map(creator => `${creator.first_name} ${creator.last_name}`).join(', ')
                }</p>
            </div>
            {Array.isArray(album_tracks) && (
                <div style={{ flexBasis: '70%', padding: '1em' }}>
                    {album_tracks.map(track =>
                        <AlbumTrack key={track.track_id} track={track} />)}
                </div>
            )}
        </div>
    </>)
}