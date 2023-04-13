import { Link } from "react-router-dom";
import contakLogo from '../images/Contak_logotype.png';
import '../styles/components/navbar.scss';


export default function Navbar() {
    return (
        <div className="banner pos-rel">
            <div className="flex absolute-fill" style={{ zIndex: 999 }}>
                <div className="banner-left">
                    <img src={contakLogo} alt="Contak" style={{ height: '42px', maxHeight: '3rem' }} />
                </div>
                <div className="banner-right">
                    <button className="basic-btn">View Plans</button>
                    <div className="dropdown">
                        <button className="basic-btn">Login</button>
                        <div className="dropdown-content">
                            <Link to={`/memberLogin`}>Member</Link>
                            <Link to={`/musicCreator`}>Music Creator</Link>
                            <a href="#">Creator</a>
                            <a href="#">Artist</a>
                        </div>
                    </div>
                    <button className="basic-btn">Sign Up</button>
                </div>
            </div>
        </div>
    );
}