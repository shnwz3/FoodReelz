import React, { useEffect, useState, useRef } from 'react';
import ReelVideo from '../../components/ReelVideo';
import '../../components/ReelVideo.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const Home = () => {
    const [videos, setVideos] = useState([]);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const navigate = useNavigate();
    const profileRef = useRef(null);

    const loggedInUser = JSON.parse(localStorage.getItem('user')) || JSON.parse(localStorage.getItem('foodPartner'));

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };

        if (showProfileMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showProfileMenu]);

    useEffect(() => {
        axios.get('http://localhost:3000/api/food')
            .then(response => {
                setVideos(response.data.foodItems || []);
            })
            .catch(error => {
                console.error('Error fetching videos:', error);
            });
    }, []);

    const handleLogout = async () => {
        try {
            const isPartner = !!localStorage.getItem('foodPartner');
            const logoutUrl = isPartner
                ? 'http://localhost:3000/api/auth/food-partner/logout'
                : 'http://localhost:3000/api/auth/logout';
            
            await axios.get(logoutUrl, { withCredentials: true });
        } catch (error) {
            console.error('Logout API failed:', error);
        } finally {
            localStorage.removeItem('user');
            localStorage.removeItem('foodPartner');
            navigate('/');
        }
    };

    return (
        <div className="reels-wrapper">
            <header className="reels-header">
                <div className="logo">
                    <img src="" alt="" />
                </div>
                
                <div className="profile" ref={profileRef} onClick={() => setShowProfileMenu(!showProfileMenu)}>
                    <div className="header-profile-badge">
                        {loggedInUser?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    {showProfileMenu && (
                        <div className="profile-dropdown">
                            <div className="dropdown-info">
                                <p className="name">{loggedInUser?.name || 'Guest'}</p>
                                <p className="email">{loggedInUser?.email || ''}</p>
                            </div>
                            <div className="divider"></div>
                            <button className="logout-btn" onClick={handleLogout}>Logout</button>
                        </div>
                    )}
                </div>
                
            </header>
            <div className="reels-container">
                {videos && videos.length > 0 ? (
                    videos.map((fooditem, index) => (
                        <ReelVideo 
                            key={index} 
                            videoUrl={fooditem.video} 
                            title={fooditem.name} 
                            userName={fooditem.foodPartnerId?.name || "anonymous"}
                            partnerId={fooditem.foodPartnerId?._id}
                            caption={fooditem.caption}
                        />
                    ))
                ) : (
                    <div style={{ color: 'white', textAlign: 'center', paddingTop: '50px' }}>
                        Loading delicious content...
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;