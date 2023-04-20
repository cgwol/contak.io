import Navbar from 'Components/navbar';
import 'Routes/profilePage/musicCreator.scss';
import { useLoaderData } from 'react-router-dom';


/*
artist name 
how long have been a member 
their status/plan (subed)
email
change password
followers/following
edit profile
*/


export const loader = ({ params }) => ({
    username: 'musician',
    email: '',
    DateOfBirth: '',
    region: '',
    Plan: ''


});

function MusicCreator() {
    const params = useLoaderData();

    //const [cookies, setCookies] = useCookies(['username']); 

    return (
        <>
            <Navbar />
            <h1 className='font-family fs-xxl fw-800' style={{ maxWidth: 'min(100%, 900px)', textAlign: 'Left' }}>
                Profile Overview
            </h1>



            <div style={{ padding: '0 4em' }}>
                <div className='grid' style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', padding: '1.5em 2em', borderColor: 'var(--bg-neutral-300)', borderBottom: '2px solid' }}>
                    <p style={{ marginLeft: '3em' }}>Username</p>
                    <p className='bg-neutral-700'>{params.username}</p>
                </div>
                <div className='grid' style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', padding: '1.5em 2em', borderColor: 'var(--bg-neutral-300)', borderBottom: '2px solid' }}>
                    <p style={{ marginLeft: '3em' }}>Email</p>
                    <p className='bg-neutral-700'></p>
                </div>
                <div className='grid' style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', padding: '1.5em 2em', borderColor: 'var(--bg-neutral-300)', borderBottom: '2px solid' }}>
                    <p style={{ marginLeft: '3em' }}>Date of birth</p>
                    <p className='bg-neutral-700'></p>
                </div>
                <div className='grid' style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', padding: '1.5em 2em', borderColor: 'var(--bg-neutral-300)', borderBottom: '2px solid' }}>
                    <p style={{ marginLeft: '3em' }}>Country or region</p>
                    <p className='bg-neutral-700'></p>
                </div>
                <div className='grid' style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', padding: '1.5em 2em', borderColor: 'var(--bg-neutral-300)', borderBottom: '2px solid' }}>
                    <p style={{ marginLeft: '3em' }}>Your Plan</p>
                    <p className='bg-neutral-700'></p>
                </div>

            </div>

            {/* <h2 className='font-family fs-xxl fw-800' style={{ maxWidth: 'min(100%, 100px)', textAlign: 'center' }}>
                {params.followerCount}
            </h2> */}

            {/* <h2 className='font-family fs-xxl fw-800' style={{ maxWidth: 'min(100%, 100px)', textAlign: 'center' }}>
                Change password
            </h2> */}

            {/* <Link to={'/'} className='rounded-btn bg-green-100 bold'>Home</Link> */}
        </>
    )
}


export const Component = MusicCreator;