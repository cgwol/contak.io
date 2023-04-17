import Navbar from 'Components/navbar';
import 'Routes/default.scss';
import { useCookies } from 'react-cookie';
import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";

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

    // https://github.com/reactivestack/cookies/tree/master/packages/react-cookie/#getting-started
    const [cookies] = useCookies(['username']); //username cookie, used for login
    const navigate = useNavigate();

    useEffect(() => { 
        if (cookies.username != "musician") //user is not a music creator
        {
            navigate("/");
        }
   },[cookies]); //execute when page loads or cookies changes

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