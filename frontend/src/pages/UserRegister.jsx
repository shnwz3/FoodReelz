import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';
import './AuthPages.css';

const UserRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const response = await api.post('/auth/register', 
        { name, email, password }
      );
      
      console.log('[UserRegister] Success:', response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      navigate('/user/login');
    } catch (err) {
      console.error('[UserRegister] Error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
        
        
        <h2 className="auth-title">Join <img src="/text logo.png" alt="FoodReelz" className="inline-logo" /> today.</h2>
        <p className="auth-subtitle">Discover the best food experiences through short-form reels.</p>
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              placeholder="John Doe" 
              required 
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              placeholder="name@example.com" 
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
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </button>
        </form>
        
        <div className="auth-footer">
          Already have an account? <Link to="/user/login" className="auth-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default UserRegister;
