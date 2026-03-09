import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';
import './AuthPages.css';

const FoodPartnerRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handlePartnerRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const name = e.target.name.value;
    const email = e.target.email.value;
    const contactNumber = e.target.phone.value;
    const password = e.target.password.value;
    const address = e.target.address.value;

    try {
      const response = await api.post('/auth/food-partner/register', {
        name,
        email,
        contactNumber,
        password,
        address
      });
      
      console.log('[FoodPartnerRegister] Success:', response.data);
      const partner = response.data.foodPartner;
      localStorage.setItem('foodPartner', JSON.stringify(partner));
      navigate(`/foodpartner/${partner.foodPartnerId}`);
    } catch (err) {
      console.error('[FoodPartnerRegister] Error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please check your business details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <Link to="/" className="back-to-home">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        
        
        <h2 className="auth-title">Grow with <img src="/text logo.png" alt="FoodReelz" className="inline-logo" /></h2>
        <p className="auth-subtitle">Reach thousands of local food lovers by showcasing your best dishes.</p>
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <form className="auth-form" onSubmit={handlePartnerRegister}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Business Name</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                placeholder="Restaurant or Cafe Name" 
                required 
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Business Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                placeholder="contact@business.com" 
                required 
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input 
                type="tel" 
                id="phone" 
                name="phone" 
                placeholder="+91 98765 43210" 
                required 
                disabled={loading}
              />
            </div>
          
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-wrapper">
                <input 
                  type={showPassword ? "text" : "password"}
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  required 
                  disabled={loading}
                />
                <button 
                  type="button" 
                  className="password-toggle" 
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">Business Address</label>
            <input 
              type="text" 
              id="address" 
              name="address" 
              placeholder="Street, City, Zip Code" 
              required 
              disabled={loading}
            />
          </div>
          
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Building your profile...
              </>
            ) : (
              'Join as Partner'
            )}
          </button>
        </form>
        
        <div className="auth-footer">
          Already a partner? <Link to="/foodpartner/login" className="auth-link">Log in here</Link>
        </div>
      </div>
    </div>
  );
};

export default FoodPartnerRegister;
