import { useId, useState, useRef } from 'react';
import { useNavigate } from "react-router-dom";


export default function MemberLogin() {
    const usernameId = useId(), passwordId = useId();
    const username = useRef(), password = useRef();
    const navigate = useNavigate();

    const onLogin = e => {
        alert(`valid login for '${username.current.value}'`);
        navigate("/");
    }

    return (
        <form onSubmit={onLogin} style={{ width: '100vw', height: '100vh', display: 'flex', gap: '3em', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
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
    )
}