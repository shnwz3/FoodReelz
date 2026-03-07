import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import './UserMenu.css';

/**
 * Reusable UserMenu Component (Senior Arch)
 * Handles profile preview and logout logic for both Users and Partners.
 */
const UserMenu = () => {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    // Determine logged in entity
    const user = JSON.parse(localStorage.getItem('user'));
    const partner = JSON.parse(localStorage.getItem('foodPartner'));
    const loggedInUser = user || partner;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    const handleLogout = async () => {
        try {
            const logoutUrl = partner
                ? '/auth/food-partner/logout'
                : '/auth/logout';
            
            await api.get(logoutUrl);
        } catch (error) {
            console.error('[UserMenu] Logout failed:', error);
        } finally {
            localStorage.removeItem('user');
            localStorage.removeItem('foodPartner');
            navigate('/');
        }
    };

    if (!loggedInUser) return null;

    return (
        <div className="user-menu-wrapper" ref={menuRef}>
            <button 
                className={`user-menu-trigger ${showMenu ? 'active' : ''}`}
                onClick={() => setShowMenu(!showMenu)}
                aria-label="User Menu"
            >
                <div className="avatar-circle">
                    {loggedInUser.name?.charAt(0).toUpperCase()}
                </div>
                <ChevronDown size={14} className={`chevron ${showMenu ? 'rotated' : ''}`} />
            </button>

            {showMenu && (
                <div className="user-menu-dropdown">
                    <div className="dropdown-user-info">
                        <div className="user-details">
                            <p className="user-name">{loggedInUser.name}</p>
                            <p className="user-email">{loggedInUser.email}</p>
                        </div>
                    </div>
                    
                    <div className="dropdown-divider"></div>
                    
                    <button className="user-menu-item logout" onClick={handleLogout}>
                        <div className="item-icon">
                            <LogOut size={16} />
                        </div>
                        <span>Log Out</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
