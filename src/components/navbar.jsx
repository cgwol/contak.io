import 'Components/navbar.scss';
import contakLogo from 'Images/Contak_logotype.png';
import { Link, useNavigate } from "react-router-dom";
import { useCookies } from 'react-cookie';

function NavOptions() {
    const navigate = useNavigate();
    const [cookies, removeCookie] = useCookies(['username']);

    function logOut() {
        removeCookie('username');
        navigate('/');
    }

    if (cookies.username == "musician") { return ( //musician toolbar
        <div className="banner-right">
            <button className="basic-btn">View Plans</button>
            <div className="dropdown">
                <button className="basic-btn">Dashboard</button>
                <div className="dropdown-content">
                    <Link to={`/musicCreator`}>Profile</Link>
                    <Link to={`/musicCreatorPurchases`}>Stats</Link>
                 </div>
            </div>
            <button className="basic-btn" onClick={logOut}>Log Out</button>
        </div>
    );}
    else { return ( //guest toolbar
        <div className="banner-right">
            <button className="basic-btn">View Plans</button>
            <Link to={`/memberLogin`}>Login</Link>
            <button className="basic-btn">Sign Up</button>
        </div>
    );}
}

export default function Navbar() {

    

    return (
        <div className="banner pos-rel">
            <div className="flex absolute-fill" style={{ zIndex: 999 }}>
                <div className="banner-left">
                    <a href="/"><img src={contakLogo} alt="Contak" style={{ height: '42px', maxHeight: '3rem' }} /></a>
                </div>
                <NavOptions/>
            </div>
        </div>
    );

}