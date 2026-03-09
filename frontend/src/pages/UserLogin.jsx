import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';
import './AuthPages.css';

const UserLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const response = await api.post('/auth/login', 
        { email, password }
      );
      
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/home');
    } catch (err) {
      console.error('[UserLogin] Error:', err);
      // Map exact backend error to UI
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
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
        
        
        <h2 className="auth-title">Sign in to <img src="/text logo.png" alt="FoodReelz" className="inline-logo" /></h2>
        <p className="auth-subtitle">Enter your details below to access your account.</p>
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <form className="auth-form" onSubmit={handleLogin}>
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
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        <div className="auth-footer">
          New to <img src="/text logo.png" alt="FoodReelz" className="inline-logo" />? <Link to="/user/register" className="auth-link">Create an account</Link>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
