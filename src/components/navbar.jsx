import 'Components/navbar.scss';
import contakLogo from 'Images/Contak_logotype.png';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { supabase } from '~/global';

function NavOptions() {
    const navigate = useNavigate();
    const [session, setSession] = useState();

    async function logOut() {
        await supabase.auth.signOut();
        navigate('/');
    }

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setSession(session);
            }
        })

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        })

        return () => subscription.unsubscribe()
    }, []);

    if (session)
        return ( //musician toolbar
            <div className="banner-right">
                <Link to={`/musicGenerator`} style={{ marginRight: '1em' }}>Music Generator</Link>
                <div className="dropdown">
                    <button className="basic-btn">Explore</button>
                    <div className="dropdown-content">
                        <Link to={`/albums`}>Public Albums</Link>
                    </div>
                </div>
                <div className="dropdown">
                    <button className="basic-btn">Dashboard</button>
                    <div className="dropdown-content">
                        <Link to={`/musicCreator`}>Profile</Link>
                        <Link to={`/my_albums`}>My Albums</Link>
                        <Link to={`/my_purchased_albums`}>Purchased Albums</Link>
                        <Link to={`/musicCreatorPurchases`}>Stats</Link>
                    </div>
                </div>
            </div>
        );
    return ( //guest toolbar
        <div className="banner-right">
            <Link to={`/musicGenerator`} style={{ marginRight: '1em' }}>Music Generator</Link>
        </div>
    );
}

export default function Navbar() {


    return (
        <div className="banner pos-rel">
            <div className="flex absolute-fill" style={{ zIndex: 999 }}>
                <div className="banner-left">
                    <Link to={'/'}><img src={contakLogo} alt="Contak" style={{ height: '42px', maxHeight: '3rem' }} /></Link>
                    <Link to={'/authenticate'}>Authenticate</Link>
                </div>
                <NavOptions />
            </div>
        </div>
    );

}