import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';
import './AuthPages.css';

const FoodPartnerLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handlePartnerLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const response = await api.post('/auth/food-partner/login', {
        email,
        password
      });
      
      console.log('[FoodPartnerLogin] Success:', response.data);
      const partner = response.data.foodPartner;
      localStorage.setItem('foodPartner', JSON.stringify(partner));
      navigate(`/foodpartner/${partner.foodPartnerId}`);
    } catch (err) {
      console.error('[FoodPartnerLogin] Error:', err);
      setError(err.response?.data?.message || 'Partner login failed. Please check your credentials.');
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
        
        
        <h2 className="auth-title">Welcome back, Partner.</h2>
        <p className="auth-subtitle">Manage your business and connect with hungry customers.</p>
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <form className="auth-form" onSubmit={handlePartnerLogin}>
          <div className="form-group">
            <label htmlFor="email">Business Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              placeholder="business@example.com" 
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
          
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Authenticating...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        <div className="auth-footer">
          Not a partner yet? <Link to="/foodpartner/register" className="auth-link">Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default FoodPartnerLogin;
