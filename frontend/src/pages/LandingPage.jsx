import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, UserPlus, User, ChefHat, ChevronDown } from 'lucide-react';
import FoodCarousel from '../components/FoodCarousel';
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
    <div className="landing-wrapper">
      <header className="landing-header">
        <Link to="/" className="landing-logo">
          <img src="/foodreelz.png" alt="FoodReelz" className="landing-logo-img" />
        </Link>

        <nav className="landing-nav">
          <div className="dropdown" ref={loginRef}>
            <button className="header-btn header-btn--ghost" onClick={() => toggleDropdown('login')}>
              <LogIn size={16} />
              <span>Login</span>
              <ChevronDown size={14} className={`chevron-icon ${openDropdown === 'login' ? 'chevron-open' : ''}`} />
            </button>
            <div className={`landing-dropdown-content ${openDropdown === 'login' ? 'show' : ''}`}>
              <Link to="/user/login" className="dropdown-link" onClick={() => setOpenDropdown(null)}>
                <div className="dropdown-link-icon"><User size={18} /></div>
                <div className="dropdown-link-text">
                  <span className="dropdown-link-title">User Login</span>
                  <span className="dropdown-link-desc">Browse & discover food reels</span>
                </div>
              </Link>
              <Link to="/foodpartner/login" className="dropdown-link" onClick={() => setOpenDropdown(null)}>
                <div className="dropdown-link-icon dropdown-link-icon--partner"><ChefHat size={18} /></div>
                <div className="dropdown-link-text">
                  <span className="dropdown-link-title">Food Partner Login</span>
                  <span className="dropdown-link-desc">Manage your restaurant</span>
                </div>
              </Link>
            </div>
          </div>

          <div className="dropdown" ref={registerRef}>
            <button className="header-btn header-btn--accent" onClick={() => toggleDropdown('register')}>
              <UserPlus size={16} />
              <span>Register</span>
              <ChevronDown size={14} className={`chevron-icon ${openDropdown === 'register' ? 'chevron-open' : ''}`} />
            </button>
            <div className={`landing-dropdown-content ${openDropdown === 'register' ? 'show' : ''}`}>
              <Link to="/user/register" className="dropdown-link" onClick={() => setOpenDropdown(null)}>
                <div className="dropdown-link-icon"><User size={18} /></div>
                <div className="dropdown-link-text">
                  <span className="dropdown-link-title">User Register</span>
                  <span className="dropdown-link-desc">Create your food journey</span>
                </div>
              </Link>
              <Link to="/foodpartner/register" className="dropdown-link" onClick={() => setOpenDropdown(null)}>
                <div className="dropdown-link-icon dropdown-link-icon--partner"><ChefHat size={18} /></div>
                <div className="dropdown-link-text">
                  <span className="dropdown-link-title">Food Partner Register</span>
                  <span className="dropdown-link-desc">List your restaurant</span>
                </div>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <FoodCarousel />
    </div>
  );
};

export default LandingPage;