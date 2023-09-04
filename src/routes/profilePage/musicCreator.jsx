import Navbar from 'Components/navbar';
import 'Routes/profilePage/musicCreator.scss';
import { useState } from 'react';
import { useLoaderData, useNavigate, useRevalidator } from 'react-router-dom';
import { supabase, toDBDate } from '~/global';


/*
artist name 
how long have been a member 
their status/plan (subed)
email
change password
followers/following
edit profile
*/

const EXPIRES_IN = 45;

export const loader = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
        throw userError;
    }

    const { data, error } = await supabase.from('my_profile').select().maybeSingle();
    if (error) {
        throw error;
    }
    if (!data) {
        return { my_profile: null, auth: user, profile_pictures: null };
    }

    let profile_pictures = '';
    if (data.profile_pictures && data.profile_pictures.length) {
        const { data: { signedUrl }, error: profilePictureError } = await
            supabase.storage.from('profile_pictures')
                .createSignedUrl(data.profile_pictures[0], EXPIRES_IN, { transform: { width: 600, height: 600 } });
        if (profilePictureError) {
            throw profilePictureError;
        }
        profile_pictures = signedUrl;
    }
    else {
        console.log(`No profile pictures for ${user.id}`);
    }

    return { my_profile: data, auth: user, profile_pictures };
}

const getNestedProp = (obj, path) => {
    const parts = path.split('.');
    const key = parts[parts.length - 1];
    if (obj) {
        const first = obj[parts[0]];
        return { key, value: first ? parts.slice(1).reduce((inner, part) => inner[part], first) : '' }
    }
    return {
        key,
        value: '',
    };
}

const setNestedProp = (obj, path, value) => {
    const parts = path.split('.');
    const key = parts[parts.length - 1];
    const parent = parts.slice(0, parts.length - 1).reduce((inner, part) =>
        inner ? inner[part] : inner[part] = {}, obj);
    parent[key] = value;
    return { key, parent, value, path };
}

const propertyOrder = [
    // { path: 'my_profile.user_id', type: 'text' },
    { path: 'my_profile.username', type: 'text' },
    { path: 'my_profile.first_name', type: 'text' },
    { path: 'my_profile.last_name', type: 'text' },
    { path: 'auth.email', type: 'email' },
    { path: 'my_profile.birthday', type: 'datetime-local' },
    { path: 'my_profile.gender', type: 'dropdown', dropdownValues: ['Female', 'Male', 'Non-Binary'] },
    { path: 'my_profile.user_type', type: 'dropdown', dropdownValues: ['User', 'Creator'] },
    // { path: 'my_profile.deleted_at', type: 'datetime-local' },
];

const updateMyProfile = async (profile) => {
    if (!profile) {
        return profile;
    }
    const { my_profile, auth } = profile;
    const readonly_columns = ['profile_pictures'];
    const db_profile = {
        ...my_profile,
        user_id: auth.id,
        birthday: my_profile.birthday ? toDBDate(my_profile.birthday) : null,
        deleted_at: my_profile.deleted_at ? toDBDate(my_profile.deleted_at) : 'infinity',
    };

    readonly_columns.forEach(col => delete db_profile[col]);
    if (!my_profile.user_id) {
        const { error, data } = await supabase.from('my_profile').insert(db_profile);
        if (error) {
            throw error;
        }
    } else {
        const { error, data } = await supabase.from('my_profile')
            .update(db_profile).eq('user_id', auth.id);
        if (error) {
            throw error;
        }
    }

    const { error: userError, data: d } = await supabase.auth.updateUser({ email: auth.email });
    if (userError) {
        throw userError;
    }

    // const virtualPath = my_profile.profile_pictures;
    // if (virtualPath) {
    //     const { error: profilePicError, data: profilePicData } = await supabase.storage
    //         .from('profile_pictures').upload(virtualPath, file, {
    //             // cacheControl: '3600',
    //             upsert: true
    //         })
    //     if (profilePicError) {
    //         throw profilePicError;
    //     }
    // }
}

const deleteMyProfile = async (user_id) => {
    const { error } = await supabase.from('my_profile').delete().eq('user_id', user_id);
    if (error) {
        throw error;
    }
}

const restoreMyProfile = async (user_id) => {
    const { error, data } = await supabase.from('my_profile').update({
        deleted_at: 'infinity',
    }).eq('user_id', user_id);
    if (error) {
        throw error;
    }
}

function MusicCreator() {
    const data = useLoaderData();
    const navigate = useNavigate();
    const revalidator = useRevalidator();
    const [updatedProfile, setUpdatedProfile] = useState(data);
    const onProfileFieldChange = (e) => {
        const [firstKey, secondKey] = e.target.name.split('.');
        updatedProfile[firstKey] ??= {};
        setNestedProp(updatedProfile, e.target.name, e.target.value);
        setUpdatedProfile({ ...updatedProfile });
    }
    const onDeleteClick = (e) => {
        updatedProfile.my_profile.deleted_at = new Date().toISOString();
        setUpdatedProfile({ ...updatedProfile });
        deleteMyProfile(updatedProfile.my_profile.user_id).then(() => {
            supabase.auth.signOut().then(() => navigate('/'));
        });
    }
    const onRestoreClick = (e) => {
        updatedProfile.my_profile.deleted_at = 'infinity';
        setUpdatedProfile({ ...updatedProfile });
        restoreMyProfile(updatedProfile.my_profile.user_id);
    }

    const userExists = updatedProfile != null && updatedProfile.my_profile != null;
    const isUserDeleted = !userExists || new Date(updatedProfile.my_profile.deleted_at) <= new Date();
    const hasProfilePics = updatedProfile.profile_pictures && updatedProfile.profile_pictures.length;
    const inputClass = "bg-neutral-700 txt-neutral-100 fs-s";
    return (
        <>
            <Navbar />
            <h1 className='font-family fs-xxl fw-800' style={{ maxWidth: 'min(100%, 900px)', textAlign: 'Left' }}>
                Profile Overview
            </h1>
            <div className='flex-column flex-center'>
                <div>

                    <button className='rounded-btn bg-neutral-100 txt-neutral-800' style={{ padding: '1em' }} onClick={e => updateMyProfile(updatedProfile).catch(error => console.log(error))}>Save</button>
                </div>

                <div >
                    {hasProfilePics ? (
                        <img src={updatedProfile.profile_pictures} alt="my profile picture" style={{ maxWidth: '600px', maxHeight: '600px' }} />) : (
                        <h4>Upload Profile Image</h4>)}
                    <br></br>
                    <input type="file" accept="image/*" onInput={(e) => {
                        console.log(e);
                        const file = e.target.files[0];
                        if (!file) {
                            return;
                        }
                        const virtualPath = `${updatedProfile.my_profile.user_id}/${file.name}`;
                        supabase.storage.from('profile_pictures')
                            .upload(virtualPath, file, {
                                // cacheControl: '3600',
                                upsert: true
                            })
                            .then(({ data, error }) => {
                                if (error) {
                                    throw error;
                                }
                                return supabase.storage.from('profile_pictures')
                                    .createSignedUrl(virtualPath, EXPIRES_IN, { transform: { width: 600, height: 600 } })
                                    .then(({ data, error }) => {
                                        if (error) {
                                            throw error;
                                        }
                                        updatedProfile.my_profile.profile_pictures = virtualPath
                                        setUpdatedProfile({ ...updatedProfile, profile_pictures: data.signedUrl })
                                    })
                            })
                            .catch(reason =>
                                console.error(reason));
                    }}></input>
                    {hasProfilePics && <button onClick={(e) => {
                        const virtualPaths = updatedProfile.my_profile.profile_pictures;
                        supabase.storage.from('profile_pictures')
                            .remove(Array.isArray(virtualPaths) ? virtualPaths : [virtualPaths])
                            .then(({ data, error }) => {
                                if (error) {
                                    throw error;
                                }
                                updatedProfile.my_profile.profile_pictures = '';
                                setUpdatedProfile({ ...updatedProfile, profile_pictures: '' })
                            }).catch(error => console.log(error));
                    }}>Delete Profile Picutre</button>}
                </div>
            </div>
            <div className='fs-s' style={{ padding: '0 4em' }}>
                {propertyOrder.map(prop => ({ ...prop, ...getNestedProp(updatedProfile, prop.path) })).map(({ key, value, path, type, dropdownValues }) => {
                    return <div key={key} className='grid' style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', padding: '1.5em 2em', borderColor: 'var(--bg-neutral-300)', borderBottom: '2px solid' }}>
                        <p style={{ marginLeft: '3em' }}>{key.split('_')
                            .map(word => word[0].toUpperCase() + word.substring(1)).join(' ')}</p>
                        {(() => {
                            switch (type) {
                                case 'dropdown':
                                    return (
                                        <select name={path} onChange={onProfileFieldChange} defaultValue={value ?? dropdownValues[0]}>
                                            {dropdownValues.map(v => <option key={v} value={v}>{v}</option>)}
                                        </select>
                                    )
                                default: {
                                    if (type.includes('date')) {
                                        const date = new Date(value);
                                        const isValidDate = !isNaN(date) && value;
                                        const formatted = isValidDate && date.toISOString();
                                        return <input className={inputClass} onChange={onProfileFieldChange} name={path} type={type} value={isValidDate ? formatted.substring(0, formatted.length - 1) : ''}></input>
                                    }
                                    return (
                                        <input className={inputClass} onChange={onProfileFieldChange} name={path} type={type} value={value ?? ''}></input>
                                    )
                                }
                            }
                        })()}
                    </div>
                })}
                {
                    userExists &&
                    <div className='flex-center flex-column'>
                        {isUserDeleted ? (<>
                            <button className='rounded-btn bg-green-100' onClick={onRestoreClick}
                                style={{ padding: '2em' }}>Restore Profile</button>
                            <p>Deleted at {new Date(updatedProfile.my_profile.deleted_at).toLocaleString()}</p>
                        </>
                        ) : (
                            <button className='rounded-btn bg-red-100' onClick={onDeleteClick}
                                style={{ padding: '2em' }}>Delete Profile</button>
                        )}
                    </div>
                }
            </div>
        </>
    )
}


export const Component = MusicCreator;