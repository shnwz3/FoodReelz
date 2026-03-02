import React from 'react';
import { Link } from 'react-router-dom';
import './AuthPages.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FoodPartnerRegister = () => {
  const navigate=useNavigate()
  const handlePartnerRegister=async(e)=>{
    e.preventDefault()
    const name=e.target.name.value
    const email=e.target.email.value
    const contactNumber=e.target.phone.value
    const password=e.target.password.value
    const address=e.target.address.value
    await axios.post('http://localhost:3000/api/auth/food-partner/register',{
      name,
      email,
      contactNumber,
      password,
      address
    },
    {withCredentials:true}
  )
    .then(response=>{
      console.log(response.data)
      navigate('/foodpartner/login')
    })
    .catch(error=>{
      console.log(error)
    })
    

  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <Link to="/" className="back-to-home">← Back to Home</Link>
        <div className="auth-logo">xoto <small style={{ fontSize: '14px', fontWeight: '400', verticalAlign: 'middle', opacity: '0.8' }}>for partners</small></div>
        <h2 className="auth-title">Partner with xoto</h2>
        <p className="auth-subtitle">Grow your business by reaching more customers.</p>
        
        <form className="auth-form" onSubmit={handlePartnerRegister}>
          <div className="form-group">
            <label htmlFor="name">Business Name</label>
            <input type="text" id="name" placeholder="Enter your business name" required />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Business Email</label>
            <input type="email" id="email" placeholder="Enter your business email" required />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input type="tel" id="phone" placeholder="Enter your phone number" required />
          </div>
        
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" placeholder="Create a password" required />
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input type="text" id="address" placeholder="Enter your address" required />
          </div>
          
          <button type="submit" className="auth-button">Register as Partner</button>
        </form>
        
        <div className="auth-footer">
          Already a partner? <Link to="/foodpartner/login" className="auth-link">Log in here</Link>
        </div>
      </div>
    </div>
  );
};

export default FoodPartnerRegister;