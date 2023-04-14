import Navbar from 'Components/navbar';
import 'Routes/default.scss';

/*
artist name 
how long have been a member 
their status/plan (subed)
email
change password
followers/following
edit profile
*/

export default function MusicCreator() {
    //const params = useLoaderData();
    const params = {
        artistName: 'Kanye West',
        followerCount: 69
    };


    return (
        <>
            <Navbar />
            <h1 className='font-family fs-xxl fw-800' style={{ maxWidth: 'min(100%, 900px)', textAlign: 'center' }}>
                Account Overview
            </h1>
            <h1 className='font-family fs-xxl fw-800' style={{ maxWidth: 'min(100%, 600px)', textAlign: 'center' }}>
                Profile
            </h1>

            <h2 className='font-family fs-xxl fw-800' style={{ maxWidth: 'min(100%, 700px)', textAlign: 'center' }}>
                {params.artistName}
            </h2>

            <h2 className='font-family fs-xxl fw-800' style={{ maxWidth: 'min(100%, 100px)', textAlign: 'center' }}>
                {params.followerCount}
            </h2>
            <h2 className='font-family fs-xxl fw-800' style={{ maxWidth: 'min(100%, 100px)', textAlign: 'center' }}>
                Email
            </h2>
            <h2 className='font-family fs-xxl fw-800' style={{ maxWidth: 'min(100%, 100px)', textAlign: 'center' }}>
                Change password
            </h2>
        </>
    )
}