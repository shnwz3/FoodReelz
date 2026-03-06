import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus, X, Upload, Video, CloudUpload } from 'lucide-react';
import './PartnerProfile.css';

/**
 * Sub-component: Partner Header and Identity
 * Optimized for mobile hierarchy
 */
const PartnerHeader = ({ partner }) => {
    const handle = useMemo(() => 
        partner?.name?.toLowerCase().replace(/\s+/g, ''), 
    [partner?.name]);

    return (
        <header className="profile-header">
            <div className="profile-identity">
                <div className="partner-profile-badge">
                    {partner.name?.charAt(0).toUpperCase()}
                </div>
                <div className="partner-info">
                    <h1>{partner.name}</h1>
                    <p className="partner-handle">@{handle}</p>
                </div>
            </div>
            
            <div className="profile-meta-grid">
                <div className="meta-item">
                    <label>Email</label>
                    <p>{partner.email}</p>
                </div>
                <div className="meta-item">
                    <label>Phone</label>
                    <p>{partner.contactNumber || 'Not provided'}</p>
                </div>
                <div className="meta-item">
                    <label>Address</label>
                    <p>{partner.address || 'Not provided'}</p>
                </div>
            </div>
        </header>
    );
};

/**
 * Sub-component: Video Card for the Grid
 * Handles hover for desktop and tap/active for mobile
 */
const VideoCard = ({ video }) => {
    const handlePlay = (e) => e.target.play();
    const handlePause = (e) => e.target.pause();

    return (
        <div className="video-card">
            <video 
                src={video.video} 
                muted
                onMouseOver={handlePlay}
                onMouseOut={handlePause}
                // For mobile touches
                onTouchStart={handlePlay}
                onTouchEnd={handlePause}
                loop
                playsInline
            />
            <div className="video-card-overlay">
                <p className="video-card-title">{video.name}</p>
            </div>
        </div>
    );
};

/**
 * Main PartnerProfile Component
 * Senior Refactor: Mobile-First Mobile Priority
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

    // Check if the current viewer is the owner of this profile
    const [isOwner, setIsOwner] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    const fetchData = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true }));
        try {
            const response = await axios.get(`http://localhost:3000/api/auth/food-partner/${id}`);
            
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setUploading(true);
        const formData = new FormData();
        formData.append('name', e.target.name.value);
        formData.append('caption', e.target.caption.value);
        formData.append('video', e.target.video.files[0]);

        try {
            await axios.post('http://localhost:3000/api/food', formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setShowUploadModal(false);
            setPreviewUrl(null);
            
            // Re-fetch to show new video immediately
            fetchData();
        } catch (err) {
            alert('Upload failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setUploading(false);
        }
    };

    if (state.loading && !state.partner) {
        return (
            <div className="status-container">
                <div className="status-msg text-pulse">Loading profile...</div>
            </div>
        );
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
            <button className="back-btn" onClick={handleGoBack}>
                <ArrowLeft size={18} /> Back to Feed
            </button>

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
                            state.videos.map(video => (
                                <VideoCard key={video._id} video={video} />
                            ))
                        ) : !isOwner && (
                            <div className="empty-state">
                                <p>No videos posted yet.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Upload Modal - Refactored for Senior UI */}
            {showUploadModal && (
                <div className="upload-modal-overlay">
                    <div className="upload-modal-card">
                        <div className="modal-header">
                            <h3>Create New Reel</h3>
                            <button className="close-modal-x" onClick={() => {
                                setShowUploadModal(false);
                                setPreviewUrl(null);
                            }}>
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleUpload} className="upload-form">
                            <div className="upload-layout">
                                <div className="upload-media-section">
                                    {!previewUrl ? (
                                        <div className="file-drop-area">
                                            <input 
                                                type="file" 
                                                name="video" 
                                                accept="video/*" 
                                                required 
                                                onChange={handleFileChange}
                                                id="video-upload"
                                            />
                                            <label htmlFor="video-upload" className="drop-label">
                                                <div className="upload-icon-pulse">
                                                    <CloudUpload size={48} />
                                                </div>
                                                <p>Choose or Drop Video</p>
                                                <span className="file-tip">MP4, WebM (max 50MB)</span>
                                            </label>
                                        </div>
                                    ) : (
                                        <div className="video-preview-container">
                                            <video src={previewUrl} controls className="upload-preview" />
                                            <button 
                                                type="button" 
                                                className="change-video-btn"
                                                onClick={() => setPreviewUrl(null)}
                                            >
                                                Change Video
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="upload-info-section">
                                    <div className="input-group">
                                        <label>Food Name</label>
                                        <input 
                                            name="name" 
                                            placeholder="e.g. Signature Truffle Pasta" 
                                            required 
                                        />
                                    </div>
                                    
                                    <div className="input-group">
                                        <label>Description / Caption</label>
                                        <textarea 
                                            name="caption" 
                                            placeholder="Tell your customers what's special..." 
                                            required 
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setShowUploadModal(false);
                                        setPreviewUrl(null);
                                    }} 
                                    className="secondary-btn"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={uploading} 
                                    className={`primary-submit-btn ${uploading ? 'uploading' : ''}`}
                                >
                                    {uploading ? (
                                        <span className="btn-content">
                                            <span className="spinner"></span>
                                            Posting...
                                        </span>
                                    ) : 'Post Reel'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PartnerProfile;