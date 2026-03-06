
import { Link } from 'react-router-dom';
import './AuthPages.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FoodPartnerLogin = () => {
  const navigate=useNavigate()
  const HandlePartnerLogin=async(e)=>{
    e.preventDefault()
    const email=e.target.email.value
    const password=e.target.password.value
    await axios.post('http://localhost:3000/api/auth/food-partner/login',{
      email,
      password
    },
    {withCredentials:true}
  )
    .then(response=>{
      console.log(response.data)
      const partner = response.data.foodPartner;
      localStorage.setItem('foodPartner', JSON.stringify(partner))
      navigate(`/foodpartner/${partner.foodPartnerId}`)
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
        <h2 className="auth-title">Partner Login</h2>
        <p className="auth-subtitle">Access your dashboard and manage orders.</p>
        
        <form className="auth-form" onSubmit={HandlePartnerLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" placeholder="Enter your business email" required />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" placeholder="Enter your password" required />
          </div>
          
          <button type="submit" className="auth-button">Partner Login</button>
        </form>
        
        <div className="auth-footer">
          Not a partner yet? <Link to="/foodpartner/register" className="auth-link">Register your restaurant</Link>
        </div>
      </div>
    </div>
  );
};

export default FoodPartnerLogin;