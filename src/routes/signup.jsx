import Navbar from 'Components/navbar';
import { useId, useRef, useState } from 'react';
import { useNavigate } from "react-router-dom";

export default function Signup() {

    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [artistName, setArtistName] = useState('');
    const [creatorName, setCreatorName] = useState('');

    const [accountType, setAccountType] = useState('member')

    //handling email and password fields
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordMatch, setPasswordMatch] = useState(true);
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate('/');
    };

    const handleShowPassword = () => {
        setShowPassword(!showPassword)
    };

    const handleAccountTypeChange = (e) => {
        setAccountType(e.target.value);
    };

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleEmailBlur = (e) => {
        if (!validateEmail(e.target.value)) {
            setEmailError('Please enter a valid email address');
        } else {
            setEmailError('');
        }
    };

    const handlePassword = (e) => {
        setPassword(e.target.value);
        setPasswordMatch(e.target.value === confirmPassword);
    };

    const handleConfirmPassword = (e) => {
        setConfirmPassword(e.target.value);
        setPasswordMatch(e.target.value === password);
        setConfirmPasswordTouched(true);
    };

    const handlePasswordBlur = () =>{
        if(confirmPasswordTouched && !passwordMatch){
            setPasswordError('Passwords do not match')
        }
        else{
            setPasswordError('')
        }
    };

    return (
        <>
            <Navbar />
            <form onSubmit={handleSubmit} className='absolute-fill isolate flex-center flex-column' style={{ gap: '3em' }}>
                <h2>Create Account</h2>
                {/*dropdown for the account type being created */}
                <div> 
                    <label htmlFor="accountType">Account Type:
                        <select value={accountType} onChange={handleAccountTypeChange}>
                            <option value="member">Member</option>
                            <option value="creator">Creator</option>
                            <option value="artist">Artist</option>
                        </select>
                    </label>
                </div>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={handleEmailBlur} required />
                    {emailError && <p>{emailError}</p>}
                </div>

                <div>
                    <label htmlFor="username">Username:</label>
                    <input type="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>


                {accountType === 'creator' && (
                    <div>
                        <label htmlFor="creatorName">Creator Name:</label>
                        <input type="text" value={creatorName} onChange={(e) => setCreatorName(e.target.value)} required />
                    </div>

                )
                }

                {accountType === 'artist' && (
                    <div>
                        <label htmlFor="artistName">Artist Name:</label>
                        <input type="text" value={artistName} onChange={(e) => setArtistName(e.target.value)} required />
                    </div>

                )
                }

                <div>
                    <label htmlFor="password">Password:</label>
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={handlePassword} onBlur={handlePasswordBlur} required />

                </div>
                <div>
                    <label htmlFor="password"> Confirm Password:</label>
                    <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={handleConfirmPassword} onBlur={handlePasswordBlur} required />
                    {passwordError && <p>{passwordError}</p>}

                </div>
                <div>
                    <label>
                        <input type="checkbox" checked={showPassword} onChange={handleShowPassword} />
                        Show Password
                    </label>
                </div>

                <button type="submit" disabled={!passwordMatch}>Create Account</button>

            </form>

        </>
    )


}