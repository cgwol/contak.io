import React from 'react';
import { Outlet, Link } from "react-router-dom";
import './App.css';
import contakLogo from './images/Contak_logotype.png';
import backgroundImg from './images/cool_man.jpeg';
import flaskImg from './images/cool_flask.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHand, faArrowRight, faPaintBrush, faMoneyBill } from '@fortawesome/free-solid-svg-icons';

function App() {
  return (
    <div className="App">

      <div className="banner">
        <div className="banner-left">
          <img src={contakLogo} alt="Contak" style={{ height: '42px', maxHeight: '3rem' }} />
        </div>
        <div className="banner-right">
          <button className="basic-btn">View Plans</button>
          <div className="dropdown">
            <button className="basic-btn">Login</button>
            <div className="dropdown-content">
              <Link to={`memberLogin`}>Member</Link>
              <a href="#">Creator</a>
              <a href="#">Artist</a>
            </div>
          </div>
          <button className="basic-btn">Sign Up</button>
        </div>
      </div>


      <div className="App-body">
        <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.65)' }}>
          <img src={backgroundImg} alt="Man on bed" style={{ width: '100%', height: '100%', position: 'absolute', zIndex: -1, objectFit: 'cover', objectPosition: 'center' }} />
          <h1 className='font-family' style={{ maxWidth: 'min(100%, 900px)', fontSize: '80px', fontWeight: 800, textAlign: 'center' }}>
            royalty-free music reimagined
          </h1>
          <h2 className='font-family txt-gradient' style={{ maxWidth: 'min(100%, 1000px)', fontSize: '26px', fontWeight: 700, backgroundImage: 'linear-gradient(135deg, #CB5EEE 0%, #4BE1EC 100%)', textTransform: 'uppercase' }}>
            text-to-music ai royalty-free music
          </h2>
          <div style={{ height: '5em' }} />
          <Link to={'/'} className='rounded-btn bg-light-green bold'>sign up for waitlist</Link>
          <Link to={'/'} className='rounded-btn bg-light-purple bold'>submit a track</Link>
        </section>

        <section className='flex-center' style={{ padding: '20px 25px' }}>
          <div className='flex font-family' style={{ margin: '3em 5em', maxWidth: '900px' }}>
            <div>
              <h1 style={{ fontSize: '80px', fontWeight: 800, textAlign: 'left', letterSpacing: '-2.5px' }}>The Music Industry is Broken.</h1>
              <p className='txt-light bold' style={{ fontSize: '26px' }}>Here is how we are fixing it by putting <span className='txt-gradient' style={{ backgroundImage: 'linear-gradient(135deg, #FFCC33 0%, #E233FF 100%)' }}>artists first.</span></p>
            </div>
            <div style={{ display: 'flex' }}>
              <img src={flaskImg} alt='cool flask' style={{ width: 'min(100%, 700px)', objectFit: 'contain' }} />
            </div>
          </div>
        </section>

        <section className='font-family' style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', margin: '2em 3em', gap: '1.5em' }}>
          <div className='rounded-card'>
            <div className='blurry-pink' />
            <FontAwesomeIcon icon={faHand} className='circle-icon' />
            <h3>Collective Ownership + Project Funding</h3>
            <p>Contak is a <strong>community-owned record label</strong> where creators can take their projects to the next level and <strong>collectively decide to fund projects from the community.</strong></p>
            <Link to={'/'}>Learn more <FontAwesomeIcon icon={faArrowRight} /></Link>
          </div>
          <div className='rounded-card'>
            <div className='blurry-pink' />
            <FontAwesomeIcon icon={faPaintBrush} className='circle-icon' />
            <h3>Creative Partnerships</h3>
            <p>Join a <strong>collaborative creative network</strong> to connect with other artists and producers, receive feedback and criticism on developing projects, individual coaching sessions and support systems. </p>
            <Link to={'/'}>Learn more <FontAwesomeIcon icon={faArrowRight} /></Link>
          </div>
          <div className='rounded-card'>
            <div className='blurry-pink' />
            <FontAwesomeIcon icon={faMoneyBill} className='circle-icon' />
            <h3>Personalized Sync & Sponsorship Opportunities</h3>
            <p>Based on your profile, we deliver personalized sync and sponsorship opportunities directly to you.</p>
            <Link to={'/'}>Learn more <FontAwesomeIcon icon={faArrowRight} /></Link>
          </div>
        </section>

        <section>
          <h1>How it works</h1>
          <h3>Develop and launch your next project in confidence, receive valuable creative feedback on your ideas before you release, earn royalty payments and monetize your content.</h3>
          <Link to={'/'}>Learn more <FontAwesomeIcon icon={faArrowRight} /></Link>
        </section>


        <h2>Getting Started</h2>
        <div className="user-archetypes">
          <div className="user-archetype">
            <h3>Member</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod enim quis mauris varius volutpat. Nulla facilisi. Sed pellentesque, enim eu tristique fermentum, mi odio consequat velit, vitae malesuada sapien velit id diam.</p>
          </div>
          <div className="user-archetype">
            <h3>Creator</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod enim quis mauris varius volutpat. Nulla facilisi. Sed pellentesque, enim eu tristique fermentum, mi odio consequat velit, vitae malesuada sapien velit id diam.</p>
          </div>
          <div className="user-archetype">
            <h3>Artist</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod enim quis mauris varius volutpat. Nulla facilisi. Sed pellentesque, enim eu tristique fermentum, mi odio consequat velit, vitae malesuada sapien velit id diam.</p>
          </div>
        </div>
        <h2>Get Started Today</h2>
        <p>Placeholder Text</p>
        <button>Sign Up Now</button>
      </div>
      <footer className="App-footer">
        <p>&copy; 2023 Contak</p>
      </footer>
    </div>
  );
}

export default App;
