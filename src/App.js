import React from 'react';
import { Outlet, Link } from "react-router-dom";
import './App.css';

function App() {
  return (
    <div className="App">
      <div className="banner">
        <div className="banner-left">
          <h1>Contak</h1>
        </div>
        <div className="banner-right">
          <button className="view-plans">View Plans</button>
          <div className="dropdown">
            <button className="login">Login</button>
            <div className="dropdown-content">
              <Link to={`memberLogin`}>Member</Link>
              <a href="#">Creator</a>
              <a href="#">Artist</a>
            </div>
          </div>
          <button className="signup">Sign Up</button>
        </div>
      </div>
      <div className="App-body">
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
