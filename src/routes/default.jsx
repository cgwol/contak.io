import { faArrowRight, faHand, faMoneyBill, faPaintBrush, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Navbar from 'Components/navbar';
import flaskImg from 'Images/cool_flask.png';
import backgroundImg from 'Images/cool_man.jpeg';
import diamondImg from 'Images/diamond.png';
import 'Routes/default.scss';
import { Link } from "react-router-dom";


function Default() {
  return (
    <div className="App">
      <Navbar />
      <div className="App-body">
        <section className='flex-center flex-column' style={{ minHeight: '100vh', backgroundColor: 'rgba(0,0,0,0.65)' }}>
          <img src={backgroundImg} alt="Man on bed" style={{ width: '100%', height: '100%', position: 'absolute', zIndex: -1, objectFit: 'cover', objectPosition: 'center' }} />
          <h1 className='font-family fs-xxl fw-800' style={{ maxWidth: 'min(100%, 900px)', textAlign: 'center' }}>
            royalty-free music reimagined
          </h1>
          <h2 className='font-family fs-m fw-700 ta-center txt-gradient bg-linear-gradient-purple-to-blue' style={{ maxWidth: 'min(100%, 1000px)', textTransform: 'uppercase' }}>
            text-to-music ai royalty-free music
          </h2>
          <div style={{ height: '5em' }} />
          <Link to={'/'} className='rounded-btn bg-green-100 bold'>sign up for waitlist</Link>
          <Link to={'/'} className='rounded-btn bg-purple-100 bold'>submit a track</Link>
        </section>

        <section className='flex-center' style={{ padding: '20px 25px' }}>
          <div className='flex font-family' style={{ margin: '3em 5em', maxWidth: '900px' }}>
            <div>
              <h1 className='fs-xxl fw-800' style={{ textAlign: 'left', letterSpacing: '-2.5px' }}>The Music Industry is Broken.</h1>
              <p className='txt-neutral-300 bold fs-m'>Here is how we are fixing it by putting <span className='txt-gradient bg-linear-gradient-orange-to-purple'>artists first.</span></p>
            </div>
            <div className='flex'>
              <img src={flaskImg} alt='cool flask' style={{ width: 'min(100%, 700px)', objectFit: 'contain' }} />
            </div>
          </div>
        </section>

        <section className='font-family' style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', margin: '2em 3em', gap: '1.5em' }}>
          <div className='rounded-card'>
            <div className='blurry-pink' />
            <Icon icon={faHand} className='circle-icon' />
            <h3>Collective Ownership + Project Funding</h3>
            <p>Contak is a <strong>community-owned record label</strong> where creators can take their projects to the next level and <strong>collectively decide to fund projects from the community.</strong></p>
            <Link to={'/'}>Learn more <Icon icon={faArrowRight} /></Link>
          </div>
          <div className='rounded-card'>
            <div className='blurry-pink' />
            <Icon icon={faPaintBrush} className='circle-icon' />
            <h3>Creative Partnerships</h3>
            <p>Join a <strong>collaborative creative network</strong> to connect with other artists and producers, receive feedback and criticism on developing projects, individual coaching sessions and support systems. </p>
            <Link to={'/'}>Learn more <Icon icon={faArrowRight} /></Link>
          </div>
          <div className='rounded-card'>
            <div className='blurry-pink' />
            <Icon icon={faMoneyBill} className='circle-icon' />
            <h3>Personalized Sync & Sponsorship Opportunities</h3>
            <p>Based on your profile, we deliver personalized sync and sponsorship opportunities directly to you.</p>
            <Link to={'/'}>Learn more <Icon icon={faArrowRight} /></Link>
          </div>
        </section>

        <section className='flex-center font-family' style={{ padding: '20px 25px' }}>
          <div className='flex font-family' style={{ margin: '3em 5em', maxWidth: '900px', gap: '3em' }}>
            <div>
              <h1 className='txt-gradient bg-linear-gradient-orange-to-purple fs-xxl fw-800'>How it works</h1>
              <h3 className='txt-neutral-300 fs-s'><span className='txt-neutral-100'>Develop and launch your next project in confidence</span>, receive valuable creative feedback on your ideas before you release, earn royalty payments and monetize your content.</h3>
              <Link to={'/'} className='txt-purple-100 fs-xs'>Learn more <Icon icon={faArrowRight} /></Link>
            </div>
            <div>
              <img src={diamondImg} style={{ width: 'min(100%, 700px)', objectFit: 'contain' }} />
            </div>
          </div>
        </section>

        <section className='font-family' style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', margin: '2em 3em', gap: '1.5em' }}>
          <div className='rounded-card bg-purple-100 txt-neutral-100'>
            <Icon icon={faUser} className='circle-icon' />
            <h3 className='fs-m'>Apply to Join</h3>
            <p className='fs-xs'>Submit your profile to get matched with a small team of likeminded creators and collaborate with and gain access to exclusive community events and resources.</p>
          </div>
          <div className='rounded-card bg-purple-100 txt-neutral-100'>
            <Icon icon={faUser} className='circle-icon' />
            <h3 className='fs-m'>Vote + Engage</h3>
            <p className='fs-xs'>Submit your own projects for funding and participate in the community by voting to support your favorite projects.</p>
          </div>
          <div className='rounded-card bg-purple-100 txt-neutral-100'>
            <Icon icon={faUser} className='circle-icon' />
            <h3 className='fs-m'>Create + develop</h3>
            <p className='fs-xs'>Learn new skills and grow as a creator with creative workshops to spawn your next big idea. Incubate your next project with a supportive team and receive valuable creative feedback.</p>
          </div>
          <div className='rounded-card bg-purple-100 txt-neutral-100'>
            <Icon icon={faUser} className='circle-icon' />
            <h3 className='fs-m'>Monetize + Earn Rewards</h3>
            <p className='fs-xs'>Submit your own projects for funding and participate in the community by voting to support your favorite projects.</p>
          </div>
        </section>

        <section className='flex-center' style={{ padding: '20px 25px' }}>
          <div className='flex-center flex-column font-family bg-linear-gradient-orange-to-purple br-200' style={{ margin: '3em 5em', maxWidth: '900px', width: '100%', paddingTop: '2em' }}>
            <h1 className='fs-xl txt-neutral-800'>Stay in the conversation</h1>
            <p className='fs-s'>Join the waitlist and we'll connect you for access.</p>
            <div className='bg-neutral-700 br-200 fs-xs txt-neutral-200' style={{ padding: '2em 3em 6em 3em', margin: '1em 0' }}>
              <h3 className='fw-500' style={{ marginBottom: '1em' }}>First Off, What's Your Artist Name?</h3>
              <p>And what's the best email address for us to get in contact with you?</p>
              <form style={{ margin: '3em 0' }}>
                <div className='flex-column' style={{ gap: '.75em', margin: '1em 0' }}>
                  <label>Artist Name</label>
                  <input type='text' placeholder='enter artist name...' required></input>
                </div>
                <div className='flex-column' style={{ gap: '.75em', margin: '1em 0' }}>
                  <label>Email Address</label>
                  <input type='email' placeholder='enter email address...' required></input>
                </div>
                <button type='submit' className='rounded-btn bg-purple-100 br-100'>Next <Icon icon={faArrowRight} style={{ marginLeft: '0.5em' }} /></button>
              </form>
            </div>
          </div>
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

export default Default;
