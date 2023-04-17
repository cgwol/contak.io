import Navbar from 'Components/navbar';
import { useId, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { userCookies } from 'react-cookie';


// Sample user database
const loginInfo = [
    {username: "musician", password: "1234"},
    {username: "artist", password: "1234"}
]

const hoursToSeconds = (hours) => hours * 3600;

export default function MemberLogin() {
    const usernameId = useId(), passwordId = useId();
    const username = useRef(), password = useRef();
    const navigate = useNavigate();


    // https://github.com/reactivestack/cookies/tree/master/packages/react-cookie/#getting-started
    const [cookies, setCookie] = useCookies(['user']); //username cookie, used for login

    const validateLogin = () => {
        const validUser = loginInfo.find(info => info.username === username.current.value && info.password === password.current.value);
        const isValidLogin = validUser != null;
        
        if (isValidLogin)
        {
            setCookie('user', username.current.value, {path: "/", maxAge: hoursToSeconds(1)});
        }

        return isValidLogin;
    }

    const onLogin = e => {
        if (validateLogin()) {
            alert(`valid login for '${username.current.value}'`);
            navigate("/");
        }
    }

    return (
        <>
            <Navbar />

            <form onSubmit={onLogin} className='absolute-fill isolate flex-center flex-column' style={{ gap: '3em' }}>
                <h2>Member Login</h2>
                <div>
                    <label htmlFor={usernameId}>Username:</label>
                    <input id={usernameId} ref={username}
                        type="text" placeholder="enter username or email..." required ></input>
                </div>
                <div>
                    <label htmlFor={passwordId}>Password:</label>
                    <input id={passwordId} ref={password}
                        type="password" placeholder="enter password..." required ></input>
                </div>
                <button type="submit">Login</button>
            </form>
        </>
    )
}