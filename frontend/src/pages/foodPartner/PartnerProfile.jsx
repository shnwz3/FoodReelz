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
import ConfirmModal from '../../components/ConfirmModal';

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

    const [isOwner, setIsOwner] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedReelIndex, setSelectedReelIndex] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [videoFile, setVideoFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, videoId: null });

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


        try {
            const response = await api.post('/food', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(percentCompleted);
                    }
                }
            });
            
            // Invalidate caches so fresh data is fetched
            invalidateCache(`/auth/food-partner/${id}`);
            invalidateCache('/food');
            
            setShowUploadModal(false);
            setPreviewUrl(null);
            setVideoFile(null);
            setUploadProgress(0); // Reset progress
            fetchData();
        } catch (err) {
            console.error('[PartnerProfile] Upload Error:', err);
            alert('Upload failed: ' + (err.response?.data?.message || err.message));
            setUploadProgress(0); // Reset on error
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteVideo = (e, videoId) => {
        e.stopPropagation();
        setConfirmDelete({ isOpen: true, videoId });
    };

    const confirmDeleteVideo = async () => {
        const { videoId } = confirmDelete;
        try {
            await api.delete(`/food/${videoId}`);
            
            // Invalidate caches
            invalidateCache(`/auth/food-partner/${id}`);
            invalidateCache('/food');
            
            // Refresh data
            fetchData();
            setConfirmDelete({ isOpen: false, videoId: null });
        } catch (err) {
            console.error('[PartnerProfile] Delete Error:', err);
            alert('Delete failed: ' + (err.response?.data?.message || err.message));
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
                                    onDelete={isOwner ? (e) => handleDeleteVideo(e, video._id) : null}
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
                        if (uploading) return; // Prevent closing while uploading
                        setShowUploadModal(false);
                        setPreviewUrl(null);
                        setVideoFile(null);
                        setUploadProgress(0);
                    }}
                    handleUpload={handleUpload}
                    handleFileChange={handleFileChange}
                    previewUrl={previewUrl}
                    setPreviewUrl={setPreviewUrl}
                    setVideoFile={setVideoFile}
                    uploading={uploading}
                    uploadProgress={uploadProgress}
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

            {/* Custom Confirm Modal */}
            <ConfirmModal 
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, videoId: null })}
                onConfirm={confirmDeleteVideo}
                title="Delete Reel?"
                message="Are you sure you want to delete this reel? This action will permanently remove the video and all its engagement data."
                confirmText="Delete Video"
                type="danger"
            />
        </div>
    );
};

export default PartnerProfile;
