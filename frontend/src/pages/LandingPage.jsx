import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const loginRef = useRef(null);
  const registerRef = useRef(null);

  const toggleDropdown = (dropdown) => {
    if (openDropdown === dropdown) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(dropdown);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        loginRef.current && !loginRef.current.contains(event.target) &&
        registerRef.current && !registerRef.current.contains(event.target)
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="home-container">
      <header className="main-header">
        <Link to="/" className="logo">
          <img src="/foodreelz.png" alt="FoodReelz" className="logo-img" />
        </Link>
        
        <nav className="nav-links">
          <div className="dropdown" ref={loginRef}>
            <span className="nav-item" onClick={() => toggleDropdown('login')}>
              Login {openDropdown === 'login' ? '▴' : '▾'}
            </span>
            <div className={`dropdown-content ${openDropdown === 'login' ? 'show' : ''}`}>
              <Link to="/user/login" onClick={() => setOpenDropdown(null)}>User Login</Link>
              <Link to="/foodpartner/login" onClick={() => setOpenDropdown(null)}>Food Partner Login</Link>
            </div>
          </div>
          
          <div className="dropdown" ref={registerRef}>
            <span className="nav-item" onClick={() => toggleDropdown('register')}>
              Register {openDropdown === 'register' ? '▴' : '▾'}
            </span>
            <div className={`dropdown-content ${openDropdown === 'register' ? 'show' : ''}`}>
              <Link to="/user/register" onClick={() => setOpenDropdown(null)}>User Register</Link>
              <Link to="/foodpartner/register" onClick={() => setOpenDropdown(null)}>Food Partner Register</Link>
            </div>
          </div>
        </nav>
      </header>
      
      <main className="hero-section">
        <h1 className="hero-title">Find the best food, cafes, and crusines</h1>
        <p className="hero-subtitle">Explore top-rated restaurants around you</p>
      </main>
    </div>
  );
};

export default LandingPage;