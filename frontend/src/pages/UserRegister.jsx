import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AuthPages.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserRegister = () => {
  const navigate = useNavigate();
  const handleSubmit = async(e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    await axios.post('http://localhost:3000/api/auth/register', 
    { name, email, password }, // data to send
    { withCredentials: true }, // to send cookies
    )
      .then((response) => {
        console.log(response.data);
        navigate('/user/login');
        localStorage.setItem('user', JSON.stringify(response.data));
        
      })
      .catch((error) => {
        console.log(error);
      });
  } 
   
  return (
    <div className="auth-container">
      <div className="auth-card">
        <Link to="/" className="back-to-home">← Back to Home</Link>
        <div className="auth-logo">xoto</div>
        <h2 className="auth-title">Create an account</h2>
        <p className="auth-subtitle">Join us to discover the best food around you.</p>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input type="text" id="name" placeholder="Enter your full name" required />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" placeholder="Enter your email" required />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" placeholder="Create a password" required />
          </div>
          
          <button type="submit" className="auth-button">Create account</button>
        </form>
        
        <div className="auth-footer">
          Already have an account? <Link to="/user/login" className="auth-link">Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default UserRegister;