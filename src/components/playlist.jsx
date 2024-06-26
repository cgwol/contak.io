import { useEffect, useRef, useState } from "react";
import { useRevalidator } from "react-router-dom";
import { PlaylistTrack } from "~/components/playlistTrack";
import { supabase } from "~/global";
import { useSession } from "~/hooks/useSession";
import { addPlaylistCreator, addPlaylistTrack, addNewTrackToPlaylist, deletePlaylist, deletePlaylistCover, deletePlaylistTrack, restorePlaylist, updatePlaylistName, upsertPlaylistCover, purchasePlaylist, unPurchasePlaylist} from "~/queries/playlists";
import { addTrackCreator, deleteTrack, deleteTrackFile, restoreTrack, updateTrackName, upsertTrackFile } from "~/queries/tracks";


export function Playlist({ playlist }) {
    const playlistNameRef = useRef(null);
    const playlistCoverRef = useRef(null);
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
    const [session, loading] = useSession();

    useEffect(() => {
        const getData = async () => {
            const { data, error } = await supabase.from('my_tracks').select();
            if (error) {
                throw error;
            }
            setOwnedTracks(data);
        }
        setOwnedTracksLoading(true);
        getData().finally(() => setOwnedTracksLoading(false));
    }, [playlist])

    const revalidator = useRevalidator();
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const showPopup = () => setIsPopupVisible(true);
    const hidePopup = () => setIsPopupVisible(false);

    const onEditPlaylist = (e) => {
        e.preventDefault();
        const promises = [];
        const playlistName = playlistNameRef.current.value;
        if (playlistName !== playlist.album_name) {
            promises.push(updatePlaylistName(playlist.album_id, playlistName));
        }

        const playlistCover = playlistCoverRef.current.files[0];
        if (playlistCover) {
            promises.push(upsertPlaylistCover(playlist.album_id, playlistCover));
        }
        if (promises.length) {
            Promise.all(promises)
                .then(() => revalidator.revalidate())
                .finally(hidePopup)
        }
    }
    const onDeletePlaylistCover = () => {
        const playlistCover = playlistCoverRef.current.files[0];
        const playlistCoverPath = playlistCover && playlist.album_covers.find(cover => cover.endsWith('/' + playlistCover.name))
            || playlist.album_covers[0];
        if (!playlistCoverPath) {
            throw new Error(`Cannot delete '${playlistCover?.name}' because it does not exists`);
        }
        deletePlaylistCover(playlistCoverPath).then(() => {
            revalidator.revalidate();
        }).finally(hidePopup);
    }
    const onDeletePlaylist = () => {
        deletePlaylist(playlist.album_id).then(() => {
            revalidator.revalidate();
        }).finally(hidePopup);
    }
    const onRestorePlaylist = () => {
        restorePlaylist(playlist.album_id).then(() => {
            revalidator.revalidate();
        })
    }
    const onAddCreator = () => {
        const username = creatorUsernameRef.current.value;
        const isOwner = isOwnerRef.current.checked;
        if (!username) {
            return;
        }
        addPlaylistCreator(playlist.album_id, username, isOwner).then(() => {
            revalidator.revalidate();
        });
    }
    const onAddNewTrackToPlaylist = (e) => {
        e.preventDefault();
        const trackName = trackNameRef.current.value;
        const trackFile = trackFileRef.current.files[0];
        if (!trackName) {
            throw new Error('Track name is required!');
        }
        if (!trackFile) {
            throw new Error('Audio track is required for new tracks');
        }
        addNewTrackToPlaylist(playlist.album_id, trackName, trackFile).then(() => {
            revalidator.revalidate();
        });
    }
    const onAddPlaylistTrack = (e) => {
        const trackID = e.target.name;
        if (!trackID) {
            throw new Error(`Track ID is required for a track to be added to a playlist`);
        }
        addPlaylistTrack(playlist.album_id, trackID).then(() => {
            revalidator.revalidate();
        });
    }
    const onDeletePlaylistTrack = (e) => {
        const track_id = e.target.name;
        if (!track_id) {
            throw new Error(`Cannot delete playlist track without providing a track ID`);
        }
        deletePlaylistTrack(playlist.album_id, track_id).then(() => {
            revalidator.revalidate();
        });
    }
    const onDeleteTrack = (e) => {
        const track_id = e.target.name;
        if (!track_id) {
            throw new Error(`Cannot delete playlist track without providing a track ID`);
        }
        deleteTrack(track_id).then(() => {
            revalidator.revalidate();
        })
    }
    const onRestoreTrack = (e) => {
        const track_id = e.target.name;
        if (!track_id) {
            throw new Error(`Cannot delete playlist track without providing a track ID`);
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

    const onPurchasePlaylist = (e) => {
        e.preventDefault();
        purchasePlaylist(playlist.album_id, session.user.id).then(() => revalidator.revalidate()); //afasdasdadgesetghdrthxtghx FIX LATER
    }

    const onUnPurchasePlaylist = (e) => {
        e.preventDefault();
        unPurchasePlaylist(playlist.album_id, session.user.id).then(() => revalidator.revalidate()); //afasdasdadgesetghdrthxtghx FIX LATER
    }

    const { album_id, album_name, signedUrls, album_creators, album_tracks, deleted_at, is_purchased_by_user } = playlist;
    const hasPlaylistCover = signedUrls && signedUrls.length;
    // deleted_at can be set ahead a few seconds by database on delete. this accounts for that.
    const now = Date.now() + (2 * 1000);
    const isDeleted = new Date(deleted_at) <= now;
    const amICreator = (!loading) && session && album_creators.some(
        creator => creator.creator_id == session.user.id
    )
    
    return (<>
        <div className={`absolute-fill flex-center flex-column ${isPopupVisible ? '' : 'hidden'}`} style={{ zIndex: 999, backgroundColor: 'rgba(0,0,0,0.8)', rowGap: '1em', overflowY: 'scroll', }} onClick={hidePopup}>
            <form onSubmit={onEditPlaylist} onClick={(e) => { e.stopPropagation() }}
                className="bg-neutral-700 br-100" style={{ padding: '1.25em' }}>
                <button onClick={hidePopup} style={{ float: 'right' }} type='button'>Cancel</button>
                <h3>Edit Playlist</h3>
                <div className="flex-column gap-s" >
                    <div>
                        <h5>Playlist Name</h5>
                        <div>
                            <input type="text" placeholder='playlist name...' required
                                ref={playlistNameRef} defaultValue={album_name}></input>
                        </div>
                    </div>
                    <div>
                        <h5>Playlist Cover</h5>
                        <div>
                            <input type="file" accept="image/*" placeholder='Choose Image'
                                ref={playlistCoverRef} src={hasPlaylistCover && signedUrls[0].signedUrl}></input>
                            {hasPlaylistCover && <button onClick={onDeletePlaylistCover}>Delete Image</button>}
                        </div>
                    </div>
                    {Array.isArray(album_creators) && <div>
                        <h5>Playlist Creators</h5>
                        <div>
                            {album_creators.map(creator => {
                                const { creator_id, first_name, last_name, is_owner } = creator;
                                const onDeletePlaylistCreator = () => {
                                    supabase.from('album_creators').delete()
                                        .eq('album_id', playlist.album_id)
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
                                        <button disabled={is_owner} onClick={onDeletePlaylistCreator}>Remove</button>
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
                        <button type='submit'>Update Playlist</button>
                        <button type="button" onClick={onDeletePlaylist}>Delete Playlist</button>
                    </div>
                </div>
            </form>
            <form onSubmit={onAddNewTrackToPlaylist} onClick={(e) => { e.stopPropagation() }}
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
                        <button type="submit">Add Track to Playlist</button>
                    </div>
                </div>
            </form>
            <div onClick={(e) => { e.stopPropagation() }}
                className="bg-neutral-700 br-100" style={{ padding: '1.25em', margin: '0 1em', }}>
                <h5>Owned Tracks</h5>
                <div style={{ maxHeight: '300px', overflowY: 'scroll' }}>
                    {!ownedTracksLoading && ownedTracks && ownedTracks?.map((track, index) => {
                        const { track_id, track_name, track_creators, audio_files, deleted_at } = track;
                        const isOnPlaylist = album_tracks?.find(playlist_track =>
                            playlist_track.track_id === track_id) != null;
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
                                    {isOnPlaylist ? (
                                        <button type="button" onClick={onDeletePlaylistTrack}
                                            name={track_id}>Remove From Playlist</button>
                                    ) : (
                                        <button type="button" onClick={onAddPlaylistTrack}
                                            name={track_id}>Add to Playlist</button>
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
                <h4>Playlist Tracks</h4>
                <div style={{ maxHeight: '100px', overflowY: 'scroll' }}>
                    {Array.isArray(album_tracks) && album_tracks.length > 0 ? (<>
                        {album_tracks?.map(track => {
                            return <PlaylistTrack key={track.track_id} track={track} />
                        })}
                    </>)
                        : <p>None</p>}
                </div>
            </div>
        </div >
        <div className="flex bg-neutral-800" style={{ flexWrap: 'wrap' }}>
            <div className="bg-neutral-800" style={{ padding: '2em', flexBasis: '30%', cursor: 'pointer' }}
                onClick={amICreator ? (isDeleted ? onRestorePlaylist : showPopup) : undefined}> {/*TODO: replace "undefined" with an HD popup of playlist cover*/}
                <p>{isDeleted ? 'Deleted' : ''}</p>
                {hasPlaylistCover && <img src={signedUrls[0].signedUrl} alt={`playlist cover`}></img>}
                <p className="fs-s">{album_name}</p>
                <p className="fs-xs">{
                    album_creators?.map(creator => `${creator.first_name} ${creator.last_name}`).join(', ')
                }</p>
            </div>
            {Array.isArray(album_tracks) && (
                <div style={{ flexBasis: '70%', padding: '1em' }}>
                    {album_tracks.map(track =>
                        <PlaylistTrack key={track.track_id} track={track} />)}
                </div>
            )}
            {!amICreator && (
                !is_purchased_by_user ? (
                <button type="button" onClick={onPurchasePlaylist}>Purchase Playlist</button>
                ) : (
                <button type="button" onClick={onUnPurchasePlaylist}>Un-purchase Playlist</button>
                )
                )
            }
            
        </div>
    </>)
}