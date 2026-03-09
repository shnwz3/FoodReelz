import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios'; // Centralized axios instance
import { cachedGet, invalidateCache } from '../../api/apiCache';
import { ArrowLeft, Plus, LogOut, Loader2, UploadCloud, X } from 'lucide-react'; // Merged lucide-react imports

// Modular Components
import PartnerHeader from './components/PartnerHeader';
import VideoCard from './components/VideoCard';
import PartnerReelsOverlay from './components/PartnerReelsOverlay';
import ProfileSkeleton from './components/ProfileSkeleton';
import UploadReelModal from './components/UploadReelModal';

import UserMenu from '../../components/UserMenu';

import './PartnerProfile.css';
import '../../components/ReelVideo.css';

/**
 * Main PartnerProfile Component
 * Senior UI Refactor: Modular architecture for better maintainability
 */
const PartnerProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [state, setState] = useState({
        partner: null,
        videos: [],
        loading: true,
        error: null
    });

    // Ownership and UI State
    const [isOwner, setIsOwner] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedReelIndex, setSelectedReelIndex] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [videoFile, setVideoFile] = useState(null);

    const fetchData = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true }));
        try {
            const response = await cachedGet(`/auth/food-partner/${id}`);
            
            setState({
                partner: response.data.foodPartner,
                videos: response.data.videos || [],
                loading: false,
                error: null
            });

            // Ownership check (Only if logged in as a partner)
            const loggedInPartner = JSON.parse(localStorage.getItem('foodPartner'));
            if (loggedInPartner && loggedInPartner.foodPartnerId === id) {
                setIsOwner(true);
            }
        } catch (err) {
            console.error('[PartnerProfile] Fetch error:', err);
            setState(prev => ({ 
                ...prev, 
                loading: false, 
                error: 'Profile not available.' 
            }));
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleGoBack = () => navigate('/');

    const handlePartnerLogout = async () => {
        try {
            await api.get('/auth/food-partner/logout');
            localStorage.removeItem('foodPartner');
            navigate('/');
        } catch (err) {
            console.error('[PartnerProfile] Partner logout failed:', err);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setVideoFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        console.log('[PartnerProfile] Starting Upload...');
        setUploading(true);

        if (!videoFile) {
            alert('Please select a video file first.');
            setUploading(false);
            return;
        }

        const formData = new FormData();
        formData.append('name', e.target.name.value);
        formData.append('caption', e.target.caption.value);
        formData.append('video', videoFile);

        console.log('[PartnerProfile] FormData built (via State):', {
            name: e.target.name.value,
            caption: e.target.caption.value,
            file: videoFile.name
        });

        try {
            console.log('[PartnerProfile] Sending POST to /api/food...');
            const response = await api.post('/food', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            console.log('[PartnerProfile] Upload Success:', response.data);
            
            // Invalidate caches so fresh data is fetched
            invalidateCache(`/auth/food-partner/${id}`);
            invalidateCache('/food');
            
            setShowUploadModal(false);
            setPreviewUrl(null);
            setVideoFile(null);
            fetchData();
        } catch (err) {
            console.error('[PartnerProfile] Upload Error:', err);
            alert('Upload failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setUploading(false);
        }
    };

    if (state.loading && !state.partner) {
        return <ProfileSkeleton />;
    }

    if (state.error || !state.partner) {
        return (
            <div className="status-container">
                <p className="status-error">{state.error || 'Partner not found'}</p>
                <button className="retry-btn" onClick={handleGoBack}>Go Back</button>
            </div>
        );
    }

    return (
        <div className="profile-page-wrapper">
            <div className="profile-actions-top">
                <div className="profile-user-nav">
                    {localStorage.getItem('foodPartner') && (
                        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                            <img src="/foodreelz.png" alt="FoodReelz" className="logo-img" />
                        </div>
                    )}

                    {!isOwner && (
                        <button className="back-btn" onClick={handleGoBack}>
                            <ArrowLeft size={18} /> Back to Feed
                        </button>
                    )}
                    
                    <div className="nav-actions-right">
                        {localStorage.getItem('foodPartner') && (
                            <button className="logout-btn" onClick={handlePartnerLogout}>
                                <LogOut size={18} /> Logout
                            </button>
                        )}
                        {localStorage.getItem('user') && <UserMenu />}
                    </div>
                </div>
            </div>

            <div className="profile-container">
                <PartnerHeader partner={state.partner} />

                <main className="profile-main">
                    <div className="video-section-header">
                        <h2>Posted Reels</h2>
                        <span className="video-count-badge">{state.videos.length}</span>
                    </div>
                    
                    <div className="video-grid">
                        {/* Add Reel Card (Only for Owner) */}
                        {isOwner && (
                            <div className="video-card add-reel-card" onClick={() => setShowUploadModal(true)}>
                                <div className="add-reel-content">
                                    <div className="add-icon-wrapper">
                                        <Plus size={32} />
                                    </div>
                                    <p>Add New Reel</p>
                                </div>
                            </div>
                        )}

                        {state.videos.length > 0 ? (
                            state.videos.map((video, index) => (
                                <VideoCard 
                                    key={video._id} 
                                    video={video} 
                                    onClick={() => setSelectedReelIndex(index)}
                                />
                            ))
                        ) : !isOwner && (
                            <div className="empty-state">
                                <p>No videos posted yet.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Upload Modal - Modular Component */}
            {showUploadModal && (
                <UploadReelModal 
                    onClose={() => {
                        setShowUploadModal(false);
                        setPreviewUrl(null);
                        setVideoFile(null);
                    }}
                    handleUpload={handleUpload}
                    handleFileChange={handleFileChange}
                    previewUrl={previewUrl}
                    setPreviewUrl={setPreviewUrl}
                    setVideoFile={setVideoFile}
                    uploading={uploading}
                />
            )}

            {/* Full-screen Reels Feed Overlay */}
            {selectedReelIndex !== null && (
                <PartnerReelsOverlay 
                    videos={state.videos}
                    startIndex={selectedReelIndex}
                    onClose={() => setSelectedReelIndex(null)}
                    partnerName={state.partner.name}
                />
            )}
        </div>
    );
};

export default PartnerProfile;
